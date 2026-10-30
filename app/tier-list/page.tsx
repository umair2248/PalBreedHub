import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Tier List",
  description: "The best Pals in Palworld 1.0 for combat, base work and mounts.",
};

export default function Page() {
  return <ComingSoon title="Tier List" description="The best Pals in Palworld 1.0 for combat, base work and mounts." />;
}
