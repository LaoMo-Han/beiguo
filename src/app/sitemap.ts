import type { MetadataRoute } from "next";
import { allCharacterProfiles, allModuleDetails, allPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/en"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: absoluteUrl("/data"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    ...allModuleDetails.map((module) => ({
      url: absoluteUrl(`/modules/${module.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: module.slug === "discover" ? 0.8 : 0.75
    })),
    ...allCharacterProfiles.map((character) => ({
      url: absoluteUrl(`/characters/${character.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...allPosts.map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65
    })),
    ...allPosts.map((post) => ({
      url: absoluteUrl(`/en/posts/${post.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55
    }))
  ];
}
