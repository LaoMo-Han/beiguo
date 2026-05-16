import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allEvents, allModules } from "@/lib/content";

export default function Home() {
  const leadModule = allModules[0];

  return (
    <BrowserShell>
      <section className="home-grid">
        <ModuleSidebar activeSlug="discover" />

        <section className="feed-zone">
          <div className="hero-strip">
            <div>
              <p className="eyebrow">BEIGUO CHANNEL</p>
              <h1>呗果异环站</h1>
              <p>
                不接数据库的轻量资料库，把强度榜、角色、装备、兑换码和生活系统做成一张好逛的游戏内网页。
              </p>
            </div>
            <a href={`/modules/${leadModule.slug}`} className="hero-cta">
              <span>{leadModule.status}</span>
              <strong>{leadModule.description}</strong>
            </a>
          </div>

          <div className="module-feed">
            {allModules.map((module) => (
              <LinkCard module={module} key={module.slug} />
            ))}
          </div>
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

function LinkCard({
  module
}: {
  module: (typeof allModules)[number];
}) {
  return (
    <a className={`module-card tone-${module.tone}`} id={module.slug} href={`/modules/${module.slug}`}>
                <div className="module-card-head">
                  <span>{module.status}</span>
                  <strong>{module.count}</strong>
                </div>
                <h2>{module.name}</h2>
                <p className="module-subtitle">{module.subtitle}</p>
                <p>{module.description}</p>
                <div className="module-highlights">
                  {module.highlights.map((highlight) => (
                    <small key={highlight}>{highlight}</small>
                  ))}
                </div>
    </a>
  );
}
