import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePage } from "@/components/CoursePage";
import { chapters } from "@/content/chapters";

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);
  if (!chapter) return {};
  const url = `/frontend-to-agent/chapter/${chapter.slug}/`;

  return {
    title: `${chapter.shortTitle} | Frontend to Agent`,
    description: chapter.goal,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: chapter.title,
      description: chapter.goal,
    },
    twitter: {
      card: "summary",
      title: chapter.title,
      description: chapter.goal,
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);
  if (!chapter) notFound();
  return <CoursePage chapter={chapter} />;
}
