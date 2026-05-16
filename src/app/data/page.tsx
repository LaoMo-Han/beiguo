import Link from "next/link";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allCharacters, allEvents, allModules } from "@/lib/content";

export const metadata = {
  title: "异环数据速查",
  description: "呗果异环角色资料、活动节点和轻量静态数据速查。"
};

export default function DataPage() {
  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar />
        <section className="data-page">
          <Link href="/" className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            ← 返回发现
          </Link>

          <section className="data-panel module-overview">
            <h2>模块总览</h2>
            <div className="module-mini-grid">
              {allModules.map((module) => (
                <Link href={`/modules/${module.slug}`} className="module-mini" key={module.slug}>
                  <span>{module.name}</span>
                  <strong>{module.count}</strong>
                </Link>
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
      </section>
    </BrowserShell>
  );
}
