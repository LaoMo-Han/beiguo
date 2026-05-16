import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://exoring.fun"),
  title: {
    default: "呗果 - 异环游戏数据与资讯",
    template: "%s | 呗果"
  },
  description: "呗果是一个轻量化异环游戏数据与资讯站，收录公告、攻略、活动、角色资料与社区精选。",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/assets/beiguo-icon.svg"
  },
  openGraph: {
    title: "呗果 - 异环游戏数据与资讯",
    description: "轻量化异环游戏数据、攻略、资讯与活动情报站。",
    url: "https://exoring.fun/",
    siteName: "呗果",
    locale: "zh_CN",
    type: "website"
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
