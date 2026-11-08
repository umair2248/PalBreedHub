// Reads Markdown page content from content/*.md at build time.
//
// File format: sections start with "## Heading". A section named "FAQ" holds
// questions as "### Question" followed by the answer.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "./i18n/config";

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
  if (locale !== "en" && existsSync(localized)) return parsePageContent(readFileSync(localized, "utf8"));
  const content = parsePageContent(readFileSync(path.join(dir, `${name}.md`), "utf8"));
  return isLocale(locale) ? localizeLinks(content, locale) : content;
}

/** Points the site links in English fallback content ("/pals/") at the given language ("/de/pals/"). */
function localizeLinks(content: PageContent, locale: Locale): PageContent {
  if (locale === DEFAULT_LOCALE) return content;
  const fix = (html: string) => html.replace(/href="(\/(?!\/)[^"]*)"/g, (_, href: string) => `href="${localePath(locale, href)}"`);
  return {
    sections: content.sections.map((s) => ({ ...s, html: fix(s.html) })),
    faq: content.faq.map((f) => ({ ...f, answerHtml: fix(f.answerHtml) })),
  };
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

export interface PalContent extends PageContent {
  /** Text before the first "## " heading; replaces the generated intro when present */
  introHtml: string | null;
}

/**
 * Hand-written text for one Pal: content/pals/{slug}.md for English, content/pals/{slug}.{locale}.md for
 * other languages. There is no English fallback, because the generated text around it is translated.
 */
export function loadPalContent(slug: string, locale = "en"): PalContent | null {
  const file = path.join(process.cwd(), "content", "pals", locale === "en" ? `${slug}.md` : `${slug}.${locale}.md`);
  if (!existsSync(file)) return null;
  return parsePalContent(readFileSync(file, "utf8"));
}

export function parsePalContent(markdown: string): PalContent {
  const lead = markdown.replace(/<!--[\s\S]*?-->/g, "").split(/^## /m)[0].trim();
  return { ...parsePageContent(markdown), introHtml: lead ? marked.parse(lead, { async: false }) : null };
}
