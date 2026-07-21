import type { Metadata } from "next";
import { CoursePage } from "@/components/CoursePage";
import { chapters } from "@/content/chapters";

export const metadata: Metadata = {
  alternates: { canonical: "/frontend-to-agent/chapter/why-agent/" },
};

export default function Page() {
  return <CoursePage chapter={chapters[0]} />;
}
