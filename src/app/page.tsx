import { redirect } from "next/navigation";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts } from "@/lib/content";

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
          <CommunityFeed staticPosts={allPosts} />
        </section>
      </section>
    </BrowserShell>
  );
}
