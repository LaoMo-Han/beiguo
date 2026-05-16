import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import {
  allCharacterProfiles,
  allModuleDetails,
  equipmentCatalog,
  getCharacterProfileByName,
  getModule,
  getModuleDetail,
  type ModuleSection
} from "@/lib/content";
import { getCharacterMedia, getModuleMedia } from "@/lib/media";

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
  const mediaItems = slug === "characters" || slug === "equipment" ? [] : getModuleMedia(slug);

  if (!module || !detail) {
    notFound();
  }

  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug={slug} />

        <article className="module-detail-main">
          {mediaItems.length > 0 ? (
            <section className="detail-section media-section">
              <h2>{module.name}图片资源</h2>
              <div className="media-gallery">
                {mediaItems.map((item) => (
                  <a className="media-tile" href={item.sourceUrl} key={item.title} rel="noreferrer" target="_blank">
                    <span className="media-frame">
                      <img alt={item.title} loading="lazy" src={item.image} />
                    </span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {slug === "equipment" ? <EquipmentCatalogSections /> : null}

          {detail.sections.map((section) => (
            <section className="detail-section" id={section.slug} key={section.title}>
              <h2>{section.title}</h2>
              {section.kind === "table" ? renderTableSection(slug, section) : null}

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

function renderTableSection(moduleSlug: string, section: ModuleSection) {
  const columns = getTableColumns(moduleSlug, section);
  const rows = getTableRows(moduleSlug, section);

  if (!columns.length || !rows.length) {
    return null;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${section.title}-${index}`}>
              {columns.map((column) => (
                <td key={column}>{renderTableCell(moduleSlug, column, row[column] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getTableColumns(moduleSlug: string, section: ModuleSection) {
  if (moduleSlug === "characters" && section.title === "角色速查") {
    return ["角色", "英文名", "稀有度", "属性", "弧盘", "定位", "战斗", "都市", "推荐配装"];
  }

  return section.columns ?? [];
}

function getTableRows(moduleSlug: string, section: ModuleSection) {
  if (moduleSlug === "characters" && section.title === "角色速查") {
    return allCharacterProfiles.map<Record<string, string>>((character) => ({
      "角色": character.name,
      "英文名": character.english,
      "稀有度": character.rarity,
      "属性": character.element,
      "弧盘": character.weaponType,
      "定位": character.role,
      "战斗": character.combatTier,
      "都市": character.cityTier,
      "推荐配装": `${character.recommendedWeapon} / ${character.diskSet}`
    }));
  }

  return section.rows ?? [];
}

function EquipmentCatalogSections() {
  return (
    <>
      <section className="detail-section" id="arc-disc-catalog">
        <div className="section-title-row">
          <h2>弧盘全图鉴</h2>
          <span>{equipmentCatalog.arcDiscs.length} 件</span>
        </div>
        <div className="equipment-grid">
          {equipmentCatalog.arcDiscs.map((item) => (
            <a className="equipment-card" href={item.source} key={item.name} rel="noreferrer" target="_blank">
              <span className="equipment-image">
                <img alt={item.name} loading="lazy" src={item.image} />
              </span>
              <span className="equipment-meta">
                <strong>{item.name}</strong>
                <small>
                  {item.rarity} / {item.category} / {item.effect}
                </small>
              </span>
              <p>{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="detail-section" id="cassette-catalog">
        <div className="section-title-row">
          <h2>卡带套装全图鉴</h2>
          <span>{equipmentCatalog.cassettes.length} 套</span>
        </div>
        <div className="equipment-grid cassette-grid">
          {equipmentCatalog.cassettes.map((item) => (
            <a className="equipment-card" href={item.source} key={item.name} rel="noreferrer" target="_blank">
              <span className="equipment-image">
                <img alt={item.name} loading="lazy" src={item.image} />
              </span>
              <span className="equipment-meta">
                <strong>{item.name}</strong>
                <small>
                  {item.english} / {item.element} / {item.pieces}
                </small>
              </span>
              <p>
                <b>2件套：</b>
                {item.set2}
              </p>
              <p>
                <b>4件套：</b>
                {item.set4}
              </p>
              {item.recommended.length > 0 ? (
                <span className="equipment-tags">
                  {item.recommended.map((name) => (
                    <em key={name}>{name}</em>
                  ))}
                </span>
              ) : null}
            </a>
          ))}
        </div>
      </section>

      <section className="detail-section" id="drive-block-catalog">
        <div className="section-title-row">
          <h2>驱动块规则</h2>
          <span>{equipmentCatalog.driveBlocks.length} 类</span>
        </div>
        <div className="equipment-grid drive-grid">
          {equipmentCatalog.driveBlocks.map((item) => (
            <a className="equipment-card" href={item.source} key={item.name} rel="noreferrer" target="_blank">
              <span className="equipment-image">
                <img alt={item.name} loading="lazy" src={item.image} />
              </span>
              <span className="equipment-meta">
                <strong>{item.name}</strong>
                <small>{item.category}</small>
              </span>
              <p>{item.description}</p>
              <span className="equipment-tags">
                {item.rules.map((rule) => (
                  <em key={rule}>{rule}</em>
                ))}
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function renderTableCell(moduleSlug: string, column: string, value: string) {
  if ((column !== "角色" && column !== "成员") || (moduleSlug !== "characters" && moduleSlug !== "tier")) {
    return value;
  }

  return (
    <div className="character-inline-list">
      {value.split(" / ").map((name) => {
        const media = getCharacterMedia(name);
        const character = getCharacterProfileByName(name);
        const content = (
          <>
            {media ? <img alt="" loading="lazy" src={media.image} /> : null}
            <span>{name}</span>
          </>
        );

        return character ? (
          <Link className={media ? "character-inline has-image" : "character-inline"} href={`/characters/${character.slug}`} key={name}>
            {content}
          </Link>
        ) : (
          <span className={media ? "character-inline has-image" : "character-inline"} key={name}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
