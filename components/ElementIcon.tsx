// 24x24 glyphs, filled with currentColor
const ELEMENT_PATHS: Record<string, string> = {
  neutral: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10z",
  fire: "M12.5 2c.8 3.6 5.5 6.1 5.5 11.3A6 6 0 0 1 6 13.6c0-2.6 1.4-4.4 2.7-5.4.2 1.7.9 2.9 2.1 3.5-.3-3.4.4-6.6 1.7-9.7z",
  water: "M12 2.5S5.5 9.8 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 9.8 12 2.5 12 2.5z",
  grass: "M20.5 3.5C10.8 3.4 4 8.4 4 15.6c0 1.5.3 2.8.8 3.8 1.6-4.9 5.2-8.3 10-9.9-3.9 2.6-6.6 6-7.8 10.6 1.2.6 2.6.9 4 .9 6.3 0 9.7-6.1 9.5-17.5z",
  electric: "M13.5 2 4.5 13.5h6.2L9.5 22l9-11.5h-6.2L13.5 2z",
  ice: "M11 2h2v4.2l2.6-2.6 1.4 1.4-4 4V11h2l4-4 1.4 1.4-2.6 2.6H22v2h-4.2l2.6 2.6-1.4 1.4-4-4H13v2l4 4-1.4 1.4-2.6-2.6V22h-2v-4.2l-2.6 2.6L7 19l4-4v-2H9l-4 4-1.4-1.4L6.2 13H2v-2h4.2L3.6 8.4 5 7l4 4h2V9L7 5l1.4-1.4L11 6.2V2z",
  ground: "M2.5 20 9.5 6.5l4.2 7.2 2.3-3.4L21.5 20h-19z",
  dark: "M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7.1 7.1 0 0 0 11.1 11.1z",
  dragon: "M12 2.2 14.6 8l6.3.6-4.8 4.2 1.4 6.2L12 15.8 6.5 19l1.4-6.2-4.8-4.2L9.4 8 12 2.2z",
};

export function elementColor(element: string): string {
  return `var(--el-${element}, var(--muted))`;
}

export function ElementIcon({ element, className = "h-3.5 w-3.5" }: { element: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={ELEMENT_PATHS[element] ?? ELEMENT_PATHS.neutral} />
    </svg>
  );
}
