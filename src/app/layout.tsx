import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://ailian0206.github.io"),
  title: "Frontend to Agent | 资深前端 AI Agent 转型教程",
  description: "面向 10 年以上前端工程师的 Node.js、TypeScript、LangChain.js 与 LangGraph.js 系统教程。",
  openGraph: {
    type: "website",
    siteName: "Frontend to Agent",
    url: "/frontend-to-agent/",
    title: "Frontend to Agent | 资深前端 AI Agent 转型教程",
    description: "从 Tool Calling、RAG、记忆与工作流到可部署 Agent 项目。",
  },
  twitter: {
    card: "summary",
    title: "Frontend to Agent",
    description: "面向资深前端工程师的 AI Agent 系统教程。",
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
