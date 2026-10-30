import type { Locale } from "../lib/i18n/config";

// Simplified 30x20 flags, drawn inline because flag emoji don't render on Windows
const FLAGS: Record<Locale, React.ReactNode> = {
  en: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="13" height="10.8" fill="#3c3b6e" />
    </>
  ),
  de: (
    <>
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
  es: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </>
  ),
  fr: (
    <>
      <rect width="10" height="20" fill="#002395" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ed2939" />
    </>
  ),
  it: (
    <>
      <rect width="10" height="20" fill="#009246" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ce2b37" />
    </>
  ),
  ru: (
    <>
      <rect width="30" height="6.67" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
      <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
    </>
  ),
  ja: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="6" fill="#bc002d" />
    </>
  ),
  ko: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <path d="M10 10a5 5 0 0 1 10 0z" fill="#cd2e3a" />
      <path d="M10 10a5 5 0 0 0 10 0z" fill="#0047a0" />
      <g stroke="#000" strokeWidth="1.2">
        <path d="M3.5 4.5l3-2M4.5 6l3-2M22.5 14l3 2M23.5 15.5l3 2M3.5 15.5l3 2M22.5 6l3-2" />
      </g>
    </>
  ),
  pt: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.5 27 10 15 17.5 3 10z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.2" fill="#002776" />
    </>
  ),
  "zh-tw": (
    <>
      <rect width="30" height="20" fill="#fe0000" />
      <rect width="15" height="10" fill="#000095" />
      <circle cx="7.5" cy="5" r="2.6" fill="#fff" />
    </>
  ),
  "zh-cn": (
    <>
      <rect width="30" height="20" fill="#de2910" />
      <path d="M5 2.2l.9 2.7h2.8l-2.3 1.7.9 2.7L5 7.6 2.7 9.3l.9-2.7-2.3-1.7h2.8z" fill="#ffde00" />
      {[
        [10, 2],
        [12, 4.2],
        [12, 7],
        [10, 9],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="#ffde00" />
      ))}
    </>
  ),
};

export default function Flag({ locale, className = "h-4 w-6" }: { locale: Locale; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={`shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10 ${className}`} aria-hidden="true">
      {FLAGS[locale]}
    </svg>
  );
}
