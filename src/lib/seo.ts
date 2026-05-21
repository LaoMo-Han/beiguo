import type { Metadata } from "next";

export const siteUrl = "https://exoring.fun";
export const siteName = "呗果";
export const englishSiteName = "Beiguo";
export const defaultTitle = "呗果 - 异环游戏数据与资讯";
export const defaultDescription =
  "呗果是一个轻量化异环游戏数据与资讯站，持续收录异环角色图鉴、强度榜、装备图鉴、弧盘、卡带、驱动块、活动资料、攻略笔记与社区精选。";
export const englishTitle = "Neverness to Everness Guides, Characters, Gear and Community Notes";
export const englishDescription =
  "Beiguo is an English entry point for Neverness to Everness players, with curated navigation for characters, tier references, gear systems, Arc Discs, cassette sets, drive blocks, events, Chinese guide posts and community notes.";
export const defaultOgImage = "/assets/community-fallbacks/day179.webp";
export const defaultKeywords = [
  "异环",
  "异环攻略",
  "异环角色",
  "异环强度榜",
  "异环装备",
  "弧盘",
  "卡带",
  "驱动块",
  "异环活动",
  "呗果",
  "Neverness to Everness",
  "NTE guide",
  "Exoring"
];

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  locale?: "zh_CN" | "en_US";
  siteName?: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const image = input.image || defaultOgImage;
  const name = input.siteName || siteName;
  const languages =
    input.path === "/en"
      ? {
          "en-US": "/en",
          "zh-CN": "/",
          "x-default": "/en"
        }
      : input.path === "/"
        ? {
            "zh-CN": "/",
            "en-US": "/en",
            "x-default": "/"
          }
        : undefined;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords ?? defaultKeywords,
    alternates: {
      canonical: input.path,
      languages
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : undefined,
    openGraph: {
      title: `${input.title} | ${name}`,
      description: input.description,
      url: absoluteUrl(input.path),
      siteName: name,
      images: [{ url: image }],
      locale: input.locale || "zh_CN",
      type: input.type || "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} | ${name}`,
      description: input.description,
      images: [image]
    }
  };
}
