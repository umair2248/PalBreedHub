import type { PageContent as Content } from "../lib/content";

export default function PageContent({ content, faqTitle }: { content: Content; faqTitle: [string, string] }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
      {content.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20">
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-black tracking-tight">
            <span className="btn-primary h-6 w-1.5 rounded-full" aria-hidden="true" />
            {section.heading}
          </h2>
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}

      {content.faq.length > 0 && (
        <section id="faq" className="scroll-mt-20">
          <h2 className="mb-4 text-center text-3xl font-black tracking-tight">
            {faqTitle[0]} <span className="text-gradient">{faqTitle[1]}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {content.faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-line bg-surface transition open:border-accent/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold">
                  <h3>{item.question}</h3>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg text-accent transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="rich-text px-4 pb-4" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
