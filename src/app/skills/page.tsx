import type { Metadata } from "next";
import { SkillsPage } from "@/components/SkillsPage";

export const metadata: Metadata = {
  title: "能力地图 | Frontend to Agent",
  description: "岗位级 Agent 能力清单 S1–S11 / E1–E5，以及与课程、Lab 的对应关系。",
  alternates: { canonical: "/frontend-to-agent/skills/" },
  openGraph: {
    type: "website",
    url: "/frontend-to-agent/skills/",
    title: "能力地图 | Frontend to Agent",
    description: "对照 JD：主线能力与选修加分项，并跳转到关联课程。",
  },
};

export default function SkillsRoute() {
  return <SkillsPage />;
}
