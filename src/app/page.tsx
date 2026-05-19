import { redirect } from "next/navigation";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, moduleEntryPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "发现",
  description: "呗果发现页汇总异环攻略笔记、角色资料、装备说明、活动情报与社区精选内容。",
  path: "/"
});

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
