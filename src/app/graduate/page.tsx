import type { Metadata } from "next";
import { GraduatePage } from "@/components/GraduatePage";

export const metadata: Metadata = {
  title: "毕业验收 | Frontend to Agent",
  description: "S1–S11 主线能力毕业自检清单，关联课程与 Lab，并指向 Capstone 与 knowledge-agent 作品集。",
  alternates: { canonical: "/frontend-to-agent/graduate/" },
  openGraph: {
    type: "website",
    url: "/frontend-to-agent/graduate/",
    title: "毕业验收 | Frontend to Agent",
    description: "勾选式毕业验收：proof、关联章节与 examples/knowledge-agent 作品集。",
  },
};

export default function GraduateRoute() {
  return <GraduatePage />;
}
