import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "About",
  description: "What PalBreedHub is and where our Palworld data comes from.",
};

export default function Page() {
  return <ComingSoon title="About" description="What PalBreedHub is and where our Palworld data comes from." />;
}
