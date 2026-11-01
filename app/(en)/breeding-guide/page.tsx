import GuideView, { guideMetadata } from "@/views/GuideView";

export const metadata = guideMetadata("en");

export default function Page() {
  return <GuideView locale="en" />;
}
