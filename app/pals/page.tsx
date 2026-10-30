import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "All Pals",
  description: "Browse every Pal in Palworld 1.0 with elements, work suitability and breeding info.",
};

export default function Page() {
  return <ComingSoon title="All Pals" description="Browse every Pal in Palworld 1.0 with elements, work suitability and breeding info." />;
}
