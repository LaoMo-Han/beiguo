import { BrowserShell } from "@/components/BrowserShell";
import { PostCard } from "@/components/PostCard";
import { allEvents, allPosts, categories, getCategoryCount } from "@/lib/content";

export default function Home() {
  const leadPost = allPosts[0];

  return (
    <BrowserShell>
      <section className="home-grid">
        <aside className="discover-rail" aria-label="内容分类">
          <div className="active-pill">
            <span />
            发现
          </div>
          {categories.slice(1).map((category) => (
            <a href={`#${category}`} key={category}>
              <span>{category}</span>
              <strong>{getCategoryCount(category)}</strong>
            </a>
          ))}
        </aside>

        <section className="feed-zone">
          <div className="hero-strip">
            <div>
              <p className="eyebrow">BEIGUO CHANNEL</p>
              <h1>呗果异环站</h1>
              <p>
                不接数据库的轻量资料库，把异环公告、攻略、活动和角色数据做成一张好逛的游戏内网页。
              </p>
            </div>
            <a href={`/posts/${leadPost.slug}`} className="hero-cta">
              <span>今日置顶</span>
              <strong>{leadPost.title}</strong>
            </a>
          </div>

          <div className="masonry-feed">
            {allPosts.map((post) => (
              <PostCard post={post} key={post.slug} />
            ))}
          </div>
        </section>

        <aside className="signal-board" aria-label="活动节点">
          <div className="board-card">
            <p className="eyebrow">EVENT RADAR</p>
            <h2>活动雷达</h2>
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
