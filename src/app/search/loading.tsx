import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";

export default function SearchLoading() {
  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug="discover" />

        <article className="module-detail-main">
          <section className="module-detail-hero search-hero">
            <p className="eyebrow">SITE SEARCH</p>
            <h1>站内搜索</h1>
            <p>正在刷新社区帖子索引。</p>
          </section>

          <section className="detail-section search-loading-section">
            <div className="feed-refresh-ui search-refresh-ui" role="status" aria-live="polite">
              <span className="refresh-spinner" aria-hidden="true" />
              <span>正在获取帖子和站内内容</span>
              <div className="feed-skeleton-grid search-skeleton-grid" aria-hidden="true">
                <span className="feed-skeleton-card" />
                <span className="feed-skeleton-card" />
                <span className="feed-skeleton-card" />
              </div>
            </div>
          </section>
        </article>
      </section>
    </BrowserShell>
  );
}
