import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("disclaimer", "en");

export default function Page() {
  return <InfoView page="disclaimer" locale="en" />;
}
