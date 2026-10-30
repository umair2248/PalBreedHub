import type { Pal } from "../lib/breeding";
import { ElementIcon, elementColor } from "./ElementIcon";

const SIZES = {
  sm: { box: "h-8 w-8 text-[11px]", chip: "h-3.5 w-3.5 -right-0.5 -bottom-0.5", icon: "h-2 w-2" },
  md: { box: "h-11 w-11 text-sm", chip: "h-5 w-5 -right-1 -bottom-1", icon: "h-3 w-3" },
  lg: { box: "h-16 w-16 text-lg", chip: "h-6 w-6 -right-1 -bottom-1", icon: "h-3.5 w-3.5" },
  xl: { box: "h-24 w-24 text-3xl", chip: "h-8 w-8 -right-1 -bottom-1", icon: "h-4.5 w-4.5" },
};

function initials(name: string): string {
  const words = name.split(/\s+/);
  return words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2);
}

/**
 * Round Pal token: element-coloured gradient with the Pal's initials and its main element.
 * This is the single place to swap in real Pal artwork later.
 */
export default function PalAvatar({ pal, size = "md" }: { pal: Pal; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  const main = pal.elements[0] ?? "neutral";
  const c1 = elementColor(main);
  const c2 = elementColor(pal.elements[1] ?? main);

  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 ${s.box}`}>
      <span
        data-initials={initials(pal.name)}
        className="avatar-initials flex h-full w-full items-center justify-center rounded-full font-black uppercase tracking-tight text-white shadow-sm ring-1 ring-white/10"
        style={{
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${c1} 70%, white), ${c1} 55%, color-mix(in srgb, ${c2} 80%, black))`,
          textShadow: "0 1px 2px rgb(0 0 0 / 0.35)",
        }}
      />
      <span
        className={`absolute flex items-center justify-center rounded-full border-2 border-surface bg-surface ${s.chip}`}
        style={{ color: c1 }}
      >
        <ElementIcon element={main} className={s.icon} />
      </span>
    </span>
  );
}
