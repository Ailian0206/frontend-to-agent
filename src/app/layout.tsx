import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteRoot } from "@/content/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteRoot),
  title: "Frontend to Agent | 资深前端 AI Agent 转型教程",
  description: "面向前端工程师的 Node.js、TypeScript、LangChain.js 与 LangGraph.js 系统教程，含 MCP、HITL、评估与公开资源库。",
  openGraph: {
    type: "website",
    siteName: "Frontend to Agent",
    url: "/frontend-to-agent/",
    title: "Frontend to Agent | 资深前端 AI Agent 转型教程",
    description: "16 章轨道化教程：Prompt、Tool、流式 UI、RAG、HITL、MCP、评估到可部署项目。",
  },
  twitter: {
    card: "summary",
    title: "Frontend to Agent",
    description: "面向前端工程师的 AI Agent 系统教程与公开资源库。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${geist.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
