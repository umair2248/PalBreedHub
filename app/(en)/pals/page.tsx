import PalsView, { palsMetadata } from "@/views/PalsView";

export const metadata = palsMetadata("en");

export default function Page() {
  return <PalsView locale="en" />;
}
