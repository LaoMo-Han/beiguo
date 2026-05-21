import { redirect } from "next/navigation";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, moduleEntryPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const homeMetadata = pageMetadata({
  title: "呗果 - 异环攻略、角色强度榜与装备资料库",
  description:
    "呗果发现页汇总异环攻略笔记、角色资料、强度榜、弧盘与卡带装备说明、驱动块规则、活动情报和社区精选内容，适合快速追踪异环资料更新。",
  path: "/",
  keywords: [
    "呗果",
    "异环",
    "异环发现页",
    "异环攻略",
    "异环角色资料",
    "异环强度榜",
    "异环装备",
    "异环社区",
    "Neverness to Everness"
  ]
});

export const metadata = {
  ...homeMetadata,
  title: {
    absolute: "呗果 - 异环攻略、角色强度榜与装备资料库"
  },
  openGraph: {
    ...homeMetadata.openGraph,
    title: "呗果 - 异环攻略、角色强度榜与装备资料库"
  },
  twitter: {
    ...homeMetadata.twitter,
    title: "呗果 - 异环攻略、角色强度榜与装备资料库"
  }
};

type HomeProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (query) {
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <BrowserShell>
      <section className="home-grid">
        <ModuleSidebar activeSlug="discover" />

        <section className="feed-zone">
          <CommunityFeed staticPosts={[...moduleEntryPosts, ...allPosts]} />
        </section>
      </section>
    </BrowserShell>
  );
}
