import InfoView, { infoMetadata } from "@/views/InfoView";

export const metadata = infoMetadata("passives", "en");

export default function Page() {
  return <InfoView page="passives" locale="en" />;
}
