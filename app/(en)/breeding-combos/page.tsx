import CombosView, { combosMetadata } from "@/views/CombosView";

export const metadata = combosMetadata("en");

export default function Page() {
  return <CombosView locale="en" />;
}
