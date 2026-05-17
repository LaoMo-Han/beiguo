import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { PostCard } from "@/components/PostCard";
import { allPosts } from "@/lib/content";

export default function Home() {
  return (
    <BrowserShell>
      <section className="home-grid">
        <ModuleSidebar activeSlug="discover" />

        <section className="feed-zone">
          <section className="discover-posts is-primary" aria-label="发现文章">
            <div className="section-title-row">
              <h2 className="visually-hidden">发现文章</h2>
              <span>{allPosts.length} 篇</span>
            </div>
            <div className="masonry-feed">
              {allPosts.map((post) => (
                <PostCard post={post} key={post.slug} />
              ))}
            </div>
          </section>
        </section>
      </section>
    </BrowserShell>
  );
}
