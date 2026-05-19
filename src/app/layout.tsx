import type { Metadata } from "next";
import { defaultDescription, defaultOgImage, defaultTitle, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  keywords: ["异环", "异环攻略", "异环角色", "异环强度榜", "弧盘", "卡带", "呗果"],
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/assets/beiguo-icon.svg"
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    images: [{ url: defaultOgImage }],
    locale: "zh_CN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
