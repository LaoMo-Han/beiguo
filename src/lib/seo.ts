import type { Metadata } from "next";

export const siteUrl = "https://exoring.fun";
export const siteName = "呗果";
export const defaultTitle = "呗果 - 异环游戏数据与资讯";
export const defaultDescription = "呗果是一个轻量化异环游戏数据与资讯站，收录异环角色、强度榜、装备、攻略、活动资料与社区精选。";
export const defaultOgImage = "/assets/community-fallbacks/day179.webp";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const image = input.image || defaultOgImage;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path
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
      title: `${input.title} | ${siteName}`,
      description: input.description,
      url: absoluteUrl(input.path),
      siteName,
      images: [{ url: image }],
      locale: "zh_CN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} | ${siteName}`,
      description: input.description,
      images: [image]
    }
  };
}
