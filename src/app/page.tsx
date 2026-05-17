import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { PostCard } from "@/components/PostCard";
import { allEvents, allPosts } from "@/lib/content";

export default function Home() {
  const leadPost = allPosts[0];

  return (
    <BrowserShell>
      <section className="home-grid">
        <ModuleSidebar activeSlug="discover" />

        <section className="feed-zone">
          <div className="hero-strip">
            <div>
              <p className="eyebrow">BEIGUO CHANNEL</p>
              <h1>发现</h1>
              <p>
                最新整理的异环资料、攻略笔记和玩法说明会先放在这里，再把稳定数据沉到对应模块里。
              </p>
            </div>
            <a href={`/posts/${leadPost.slug}`} className="hero-cta">
              <span>今日更新</span>
              <strong>{leadPost.title}</strong>
            </a>
          </div>

          <section className="discover-posts is-primary" aria-label="发现文章">
            <div className="section-title-row">
              <h2>发现文章</h2>
              <span>{allPosts.length} 篇</span>
            </div>
            <div className="masonry-feed">
              {allPosts.map((post) => (
                <PostCard post={post} key={post.slug} />
              ))}
            </div>
          </section>
        </section>

        <aside className="signal-board" aria-label="资料状态">
          <div className="board-card">
            <p className="eyebrow">DATA RADAR</p>
            <h2>资料状态</h2>
            <div className="event-list">
              {allEvents.map((event) => (
                <div className="event-item" key={event.title}>
                  <span>{event.status}</span>
                  <strong>{event.title}</strong>
                  <small>{event.date}</small>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </BrowserShell>
  );
}
