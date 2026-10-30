import { describe, expect, it } from "vitest";
import { faqJsonLd, loadPageContent, parsePageContent } from "./content";
import { PREFIXED_LOCALES } from "./i18n/config";

describe("parsePageContent", () => {
  it("splits sections and FAQ questions", () => {
    const content = parsePageContent(
      [
        "<!-- note -->",
        "## First section",
        "Some **bold** text.",
        "## FAQ",
        "### Question one?",
        "Answer *one*.",
        "### Question two?",
        "Answer two.",
      ].join("\n"),
    );
    expect(content.sections).toEqual([
      { heading: "First section", id: "first-section", html: "<p>Some <strong>bold</strong> text.</p>\n" },
    ]);
    expect(content.faq.map((f) => [f.question, f.answerText])).toEqual([
      ["Question one?", "Answer one."],
      ["Question two?", "Answer two."],
    ]);
  });

  it("escapes < in the JSON-LD so it can't break out of the script tag", () => {
    const json = faqJsonLd([{ question: "Q</script>", answerHtml: "", answerText: "A" }]);
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).mainEntity[0].name).toBe("Q</script>");
  });
});

describe("content/home.md", () => {
  const content = loadPageContent("home");

  it("has the required sections", () => {
    expect(content.sections.map((s) => s.heading)).toEqual([
      "How to use the Palworld breeding calculator",
      "Breeding power explained",
      "Unique combos and elemental variants",
      "Tips for faster breeding",
    ]);
  });

  it("has 7 FAQ questions with answers", () => {
    expect(content.faq).toHaveLength(7);
    for (const item of content.faq) {
      expect(item.question.endsWith("?")).toBe(true);
      expect(item.answerText.length).toBeGreaterThan(0);
    }
  });
});

describe("translated home content", () => {
  const english = loadPageContent("home");

  it.each(PREFIXED_LOCALES)("content/home.%s.md has the same structure as the English page", (locale) => {
    const translated = loadPageContent("home", locale);
    expect(translated.sections.map((s) => s.id)).not.toEqual(english.sections.map((s) => s.id));
    expect(translated.sections).toHaveLength(english.sections.length);
    expect(translated.faq).toHaveLength(english.faq.length);
    expect(translated.faq.every((item) => item.answerText.length > 0)).toBe(true);
  });
});
