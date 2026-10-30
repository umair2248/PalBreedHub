import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the PalBreedHub team.",
};

export default function Page() {
  return <ComingSoon title="Contact" description="Get in touch with the PalBreedHub team." />;
}
