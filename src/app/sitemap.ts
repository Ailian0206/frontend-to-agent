import type { MetadataRoute } from "next";
import { chapters } from "@/content/chapters";
import { siteOrigin } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteOrigin}/`,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${siteOrigin}/resources/`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteOrigin}/skills/`,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    },
    {
      url: `${siteOrigin}/graduate/`,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    },
    ...chapters.map((chapter) => ({
      url: `${siteOrigin}/chapter/${chapter.slug}/`,
      changeFrequency: "monthly" as const,
      priority: chapter.number === 1 ? 1 : 0.8,
    })),
  ];
}
