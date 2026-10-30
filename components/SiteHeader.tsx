import Link from "next/link";
import SiteNav from "./SiteNav";
import { SITE_NAME } from "./site-links";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-black text-accent-contrast"
          >
            PB
          </span>
          <span>
            Pal<span className="text-accent">Breed</span>Hub
          </span>
          <span className="sr-only">{SITE_NAME} home</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
