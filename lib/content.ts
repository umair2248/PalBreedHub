// Reads Markdown page content from content/*.md at build time.
//
// File format: sections start with "## Heading". A section named "FAQ" holds
// questions as "### Question" followed by the answer.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

export interface ContentSection {
  heading: string;
  id: string;
  html: string;
}

export interface FaqItem {
  question: string;
  answerHtml: string;
  answerText: string;
}

export interface PageContent {
  sections: ContentSection[];
  faq: FaqItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPlainText(html: string): string {
  return html
    // marked puts a newline between block elements, so tags can be dropped without merging words
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Splits Markdown into [heading, body] chunks at lines starting with the given marker ("## " or "### "). */
function splitByHeading(markdown: string, marker: string): [string, string][] {
  const chunks: [string, string][] = [];
  for (const part of markdown.split(new RegExp(`^${marker}`, "m")).slice(1)) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    chunks.push([heading, body]);
  }
  return chunks;
}

export function parsePageContent(markdown: string): PageContent {
  const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const sections: ContentSection[] = [];
  const faq: FaqItem[] = [];

  for (const [heading, body] of splitByHeading(withoutComments, "## ")) {
    if (heading.toLowerCase() === "faq") {
      for (const [question, answer] of splitByHeading(body, "### ")) {
        const answerHtml = marked.parse(answer, { async: false });
        faq.push({ question, answerHtml, answerText: toPlainText(answerHtml) });
      }
      continue;
    }
    sections.push({ heading, id: slugify(heading), html: marked.parse(body, { async: false }) });
  }

  return { sections, faq };
}

/** True when content/{name}.md exists (localized files fall back to it). */
export function hasPageContent(name: string): boolean {
  return existsSync(path.join(process.cwd(), "content", `${name}.md`));
}

/** Loads content/{name}.{locale}.md, falling back to the English content/{name}.md. */
export function loadPageContent(name: string, locale = "en"): PageContent {
  const dir = path.join(process.cwd(), "content");
  const localized = path.join(dir, `${name}.${locale}.md`);
  const file = locale !== "en" && existsSync(localized) ? localized : path.join(dir, `${name}.md`);
  return parsePageContent(readFileSync(file, "utf8"));
}

/** FAQPage structured data for Google rich results. */
export function faqJsonLd(faq: FaqItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answerText },
    })),
  };
  // Escape "<" so answer text can never close the <script> tag
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
