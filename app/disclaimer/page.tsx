import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "PalBreedHub is a fan site and is not affiliated with Pocketpair.",
};

export default function Page() {
  return <ComingSoon title="Disclaimer" description="PalBreedHub is a fan site and is not affiliated with Pocketpair." />;
}
