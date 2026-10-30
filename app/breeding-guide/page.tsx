import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Breeding Guide",
  description: "Learn how Palworld breeding works: breeding power, unique combos and tips.",
};

export default function Page() {
  return <ComingSoon title="Breeding Guide" description="Learn how Palworld breeding works: breeding power, unique combos and tips." />;
}
