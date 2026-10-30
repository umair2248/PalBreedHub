import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("privacy", "en");

export default function Page() {
  return <InfoView page="privacy" locale="en" />;
}
