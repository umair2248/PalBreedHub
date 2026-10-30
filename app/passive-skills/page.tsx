import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Passive Skills",
  description: "Every Palworld passive skill and how to pass the best ones down through breeding.",
};

export default function Page() {
  return <ComingSoon title="Passive Skills" description="Every Palworld passive skill and how to pass the best ones down through breeding." />;
}
