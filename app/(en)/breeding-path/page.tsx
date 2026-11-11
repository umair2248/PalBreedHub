import ToolView, { toolMetadata } from "@/views/ToolView";

export const metadata = toolMetadata("path", "en");

export default function Page() {
  return <ToolView page="path" locale="en" />;
}
