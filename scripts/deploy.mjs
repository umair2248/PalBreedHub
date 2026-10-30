// Uploads out/ to Hostinger over SSH and swaps it in as public_html.
//
// Needs the "palbreedhub" host in ~/.ssh/config (IP, port 65002, user, key).
// Hostinger drops long SSH connections, so the site is packed into one .tar.gz,
// split into small chunks and each chunk is uploaded with retries. The server
// then unpacks it next to the live site and swaps it in with two renames, so
// visitors never see a half-uploaded site.
//
// Usage: npm run deploy        (build + upload)
//        npm run deploy:only   (upload the existing out/)

import { spawnSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const HOST = "palbreedhub";
const SITE_DIR = "domains/palbreedhub.com";
const UPLOAD_DIR = `${SITE_DIR}/deploy_upload`;
const CHUNK_BYTES = 20 * 1024 * 1024;
const RETRIES = 5;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  return result.status === 0;
}

function ssh(script) {
  return run("ssh", ["-o", "BatchMode=yes", "-o", "ServerAliveInterval=15", HOST, script]);
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

if (!existsSync("out/index.html")) fail("out/index.html not found. Run `npm run build` first.");

// 1. Pack out/ into one archive outside OneDrive
const work = path.join(tmpdir(), "palbreedhub-deploy");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const archive = path.join(work, "site.tar.gz");

console.log("Packing out/ ...");
// Relative archive name: GNU tar would read "C:\..." as a remote host
if (!run("tar", ["-czf", "site.tar.gz", "-C", path.resolve("out"), "."], { cwd: work })) fail("Packing failed.");
const size = statSync(archive).size;
console.log(`Archive: ${(size / 1024 / 1024).toFixed(1)} MB`);

// 2. Split into chunks
const chunks = [];
const buffer = Buffer.alloc(CHUNK_BYTES);
const fd = openSync(archive, "r");
for (let i = 0; ; i++) {
  const bytes = readSync(fd, buffer, 0, CHUNK_BYTES, null);
  if (bytes === 0) break;
  const name = `part${String(i).padStart(4, "0")}`;
  writeFileSync(path.join(work, name), buffer.subarray(0, bytes));
  chunks.push(name);
}
closeSync(fd);
rmSync(archive);

// 3. Upload each chunk, retrying dropped connections
if (!ssh(`rm -rf ${UPLOAD_DIR} && mkdir -p ${UPLOAD_DIR}`)) fail("Could not prepare the upload folder.");

for (const [i, name] of chunks.entries()) {
  let ok = false;
  for (let attempt = 1; attempt <= RETRIES && !ok; attempt++) {
    console.log(`Uploading chunk ${i + 1}/${chunks.length}${attempt > 1 ? ` (retry ${attempt - 1})` : ""}`);
    ok = run("scp", ["-q", "-o", "BatchMode=yes", name, `${HOST}:${UPLOAD_DIR}/${name}`], { cwd: work });
  }
  if (!ok) fail(`Chunk ${name} failed after ${RETRIES} attempts. Run \`npm run deploy:only\` again.`);
}

// 4. Unpack on the server and swap it in
console.log("Unpacking on the server ...");
const swapped = ssh(
  [
    "set -e",
    `cd ${SITE_DIR}`,
    "rm -rf public_html_new public_html_old",
    "mkdir public_html_new",
    `test $(cat deploy_upload/part* | wc -c) -eq ${size}`,
    "cat deploy_upload/part* | tar -xzf - -C public_html_new",
    "test -f public_html_new/index.html",
    "mv public_html public_html_old",
    "mv public_html_new public_html",
    "rm -rf public_html_old deploy_upload",
    "echo Deployed $(find public_html -type f | wc -l) files",
  ].join(" && "),
);
rmSync(work, { recursive: true, force: true });
if (!swapped) fail("Unpacking on the server failed; the live site was left unchanged.");
console.log("\n✓ Live at https://palbreedhub.com");
