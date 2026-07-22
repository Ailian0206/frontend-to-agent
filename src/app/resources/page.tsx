import type { Metadata } from "next";
import { ResourcesPage } from "@/components/ResourcesPage";

export const metadata: Metadata = {
  title: "公开资源库 | Frontend to Agent",
  description: "按轨道整理的公开 Agent 教程、GitHub 仓库、官方文档与中文文章。",
  alternates: { canonical: "/frontend-to-agent/resources/" },
  openGraph: {
    type: "website",
    url: "/frontend-to-agent/resources/",
    title: "公开资源库 | Frontend to Agent",
    description: "GitHub / Docs / 公开文章，按七大学习轨道筛选。",
  },
};

export default function ResourcesRoute() {
  return <ResourcesPage />;
}
