import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("terms", "en");

export default function Page() {
  return <InfoView page="terms" locale="en" />;
}
