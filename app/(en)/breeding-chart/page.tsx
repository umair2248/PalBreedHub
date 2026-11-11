import ToolView, { toolMetadata } from "@/views/ToolView";

export const metadata = toolMetadata("chart", "en");

export default function Page() {
  return <ToolView page="chart" locale="en" />;
}
