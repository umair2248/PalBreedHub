import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("guide", "en");

export default function Page() {
  return <InfoView page="guide" locale="en" />;
}
