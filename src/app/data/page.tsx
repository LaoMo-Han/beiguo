import Link from "next/link";
import { BrowserShell } from "@/components/BrowserShell";
import { allCharacters, allEvents, allModules } from "@/lib/content";

export const metadata = {
  title: "异环数据速查",
  description: "呗果异环角色资料、活动节点和轻量静态数据速查。"
};

export default function DataPage() {
  return (
    <BrowserShell>
      <section className="data-page">
        <div className="data-heading">
          <Link href="/" className="back-link">
            ← 返回发现
          </Link>
          <p className="eyebrow">STATIC DATABASE</p>
          <h1>异环数据速查</h1>
          <p>这里的数据全部来自仓库内 JSON 文件，模块覆盖强度榜、角色、弧盘、卡带、驱动块、兑换码、bug 和生活系统。</p>
        </div>

        <section className="data-panel module-overview">
          <h2>模块总览</h2>
          <div className="module-mini-grid">
            {allModules.map((module) => (
              <a href={`/#${module.slug}`} className="module-mini" key={module.slug}>
                <span>{module.name}</span>
                <strong>{module.count}</strong>
              </a>
            ))}
          </div>
        </section>

        <div className="data-layout">
          <section className="data-panel">
            <h2>角色档案</h2>
            <div className="character-grid">
              {allCharacters.map((character) => (
                <article className="character-card" key={character.name}>
                  <span>{character.rarity}</span>
                  <h3>{character.name}</h3>
                  <p>{character.summary}</p>
                  <footer>
                    <strong>{character.role}</strong>
                    <small>{character.element}</small>
                  </footer>
                </article>
              ))}
            </div>
          </section>

          <section className="data-panel">
            <h2>活动节点</h2>
            <div className="timeline">
              {allEvents.map((event) => (
                <article className="timeline-item" key={event.title}>
                  <span>{event.status}</span>
                  <h3>{event.title}</h3>
                  <p>{event.reward}</p>
                  <small>{event.date}</small>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </BrowserShell>
  );
}
