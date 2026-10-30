import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PalBreedHub handles your data.",
};

export default function Page() {
  return <ComingSoon title="Privacy Policy" description="How PalBreedHub handles your data." />;
}
