import Link from "next/link";
import { SITE_NAME, footerLinks } from "./site-links";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-1 md:text-right">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Not affiliated with Pocketpair.
          </p>
          <p className="text-xs">Palworld and all Pal names are trademarks of Pocketpair, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
