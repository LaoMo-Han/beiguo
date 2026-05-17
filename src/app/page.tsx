import { BrowserShell } from "@/components/BrowserShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts } from "@/lib/content";

export default function Home() {
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
