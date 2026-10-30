import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("contact", "en");

export default function Page() {
  return <InfoView page="contact" locale="en" />;
}
