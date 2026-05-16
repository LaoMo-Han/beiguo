import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allModuleDetails, getModule, getModuleDetail } from "@/lib/content";

type ModulePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allModuleDetails.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = getModule(slug);
  const detail = getModuleDetail(slug);

  if (!module || !detail) {
    return {};
  }

  return {
    title: `${module.name} - ${module.subtitle}`,
    description: detail.summary,
    alternates: {
      canonical: `/modules/${slug}`
    }
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const module = getModule(slug);
  const detail = getModuleDetail(slug);

  if (!module || !detail) {
    notFound();
  }

  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug={slug} />

        <article className="module-detail-main">
          {detail.sections.map((section) => (
            <section className="detail-section" id={section.slug} key={section.title}>
              <h2>{section.title}</h2>
              {section.kind === "table" && section.columns && section.rows ? (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {section.columns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, index) => (
                        <tr key={`${section.title}-${index}`}>
                          {section.columns?.map((column) => (
                            <td key={column}>{row[column]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section.kind === "checklist" && section.items ? (
                <ul className="check-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {section.kind === "cards" && section.items ? (
                <div className="info-card-grid">
                  {section.items.map((item) => (
                    <div className="info-card" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </article>
      </section>
    </BrowserShell>
  );
}
