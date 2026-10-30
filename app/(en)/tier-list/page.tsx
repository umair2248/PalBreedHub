import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("tierList", "en");

export default function Page() {
  return <InfoView page="tierList" locale="en" />;
}
