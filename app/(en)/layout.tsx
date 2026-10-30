import SiteShell from "@/views/SiteShell";

export default function EnglishLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
