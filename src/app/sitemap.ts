import type { MetadataRoute } from "next";
import { chapters } from "@/content/chapters";

const origin = "https://ailian0206.github.io/frontend-to-agent";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...chapters.map((chapter) => ({
      url: `${origin}/chapter/${chapter.slug}/`,
      changeFrequency: "monthly" as const,
      priority: chapter.number === 1 ? 1 : 0.8,
    })),
  ];
}
