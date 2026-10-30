import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("about", "en");

export default function Page() {
  return <InfoView page="about" locale="en" />;
}
