import { redirect } from "next/navigation";

/** Legacy path; AI Insights hub was removed. */
export default function AiInsightsPage() {
  redirect("/");
}
