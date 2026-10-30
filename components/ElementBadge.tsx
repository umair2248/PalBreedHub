"use client";

import { ElementIcon, elementColor } from "./ElementIcon";
import { useI18n } from "./I18nProvider";

export default function ElementBadge({ element }: { element: string }) {
  const { t } = useI18n();
  const color = elementColor(element);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <ElementIcon element={element} className="h-3 w-3" />
      {t.elements[element as keyof typeof t.elements] ?? element}
    </span>
  );
}

export function ElementBadges({ elements }: { elements: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {elements.map((el) => (
        <ElementBadge key={el} element={el} />
      ))}
    </span>
  );
}
