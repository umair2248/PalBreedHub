@AGENTS.md

# PalBreedHub

Palworld 1.0 breeding calculator at https://palbreedhub.com. Next.js App Router with static export (`output: "export"`), TypeScript, Tailwind. Hosted on Hostinger shared hosting as plain HTML.

## Commands

- `npm run dev` – local dev server
- `npm test` – Vitest unit tests (run before every commit)
- `npm run build` – static export into `out/` (~3,300 pages, ~5 min)
- `npm run deploy` – build + upload to Hostinger over SSH (`scripts/deploy.mjs`); `npm run deploy:only` uploads the existing `out/`
- `npm run validate:data` – checks `data/pals.json`

## Layout

- `app/(en)/` – English routes at the site root; `app/[locale]/` – the same routes for the other 10 languages
- `views/` – page bodies shared by both route trees (`HomeView`, `PalView`, `GuideView`, `InfoView`, ...)
- `components/` – UI; `components/site-links.ts` holds the site URL, nav/footer links and the GA4 ID
- `lib/breeding.ts` – breeding logic (formula, unique combos, parent index); `lib/i18n/dictionaries/*.ts` – UI strings for all 11 languages (add every new key to all of them)
- `content/*.md` – page text; `## Heading` sections, `## FAQ` with `### Question` items (rendered with FAQPage schema). `content/{name}.{locale}.md` overrides a language.
- `data/pals.json`, `data/unique-combos.json` – game data from MIT-licensed community datasets (sources on the About page)

## Notes

- Never compute `getParents()` in client components: the first call builds a ~41K-pair index and blocks phones for seconds. Compute on the server and pass small props (see `ParentPairs`).
- Anything that must survive a deploy on the server (Google/Bing verification files) goes in `public/`; the deploy replaces `public_html` completely.
- After every deploy, purge the Hostinger CDN (hPanel → Websites → palbreedhub.com → Performance → CDN → Purge all). Otherwise it keeps serving the old brotli-compressed pages to Chrome. Check with `curl -sI -H "Accept-Encoding: br" https://palbreedhub.com/` (look at `last-modified`).
- Deploys are slow mainly because Windows Defender scans every freshly built file in `out/`; excluding `out` and `.next` from Defender fixes it.
- `experimental.inlineCss` was tried and made pages slower (CSS was duplicated in the RSC payload); don't re-enable it.

## Progress

The owner follows a 60-day daily plan. Days 1–19 are done (setup, data, calculators, Pal pages, layout, i18n, legal pages incl. Terms, technical SEO, GA4, speed fixes, Breeding Guide). Next: Day 20, `/breeding-combos/` page; then link it from the Breeding Guide.
