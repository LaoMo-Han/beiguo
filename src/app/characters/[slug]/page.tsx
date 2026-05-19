import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allCharacterProfiles, getCharacterProfileByName, getCharacterProfileBySlug } from "@/lib/content";
import { getCharacterMedia } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

type CharacterPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allCharacterProfiles.map((character) => ({ slug: character.slug }));
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const character = getCharacterProfileBySlug(slug);

  if (!character) {
    return {};
  }

  const media = getCharacterMedia(character.name);

  return pageMetadata({
    title: `${character.name} - 角色详情`,
    description: character.summary,
    path: `/characters/${slug}`,
    image: media?.image
  });
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  const character = getCharacterProfileBySlug(slug);

  if (!character) {
    notFound();
  }

  const media = getCharacterMedia(character.name);

  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug="characters" />

        <article className="module-detail-main">
          <section className="character-detail-hero detail-section">
            <div className="character-portrait">
              {media ? <img alt={character.name} src={media.image} /> : <span>{character.name}</span>}
            </div>

            <div className="character-detail-copy">
              <Link className="back-link" href="/modules/characters">
                ← 返回角色速查
              </Link>
              <p className="eyebrow">BEIGUO CHARACTER</p>
              <h1>{character.name}</h1>
              <p className="character-english">{character.english}</p>
              <p>{character.summary}</p>
              <div className="detail-meta">
                <span>{character.rarity}</span>
                <span>{character.element}</span>
                <span>{character.weaponType}</span>
                <span>{character.role}</span>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h2>角色概览</h2>
            <div className="profile-stat-grid">
              <ProfileStat label="战斗评级" value={character.combatTier} />
              <ProfileStat label="都市评级" value={character.cityTier} />
              <ProfileStat label="阵营" value={character.faction} />
              <ProfileStat label="推荐弧盘" value={character.recommendedWeapon} />
              <ProfileStat label="推荐卡带" value={character.diskSet} />
              <ProfileStat label="主词条" value={character.mainStats} />
              <ProfileStat label="副词条" value={character.subStats} wide />
            </div>
          </section>

          <section className="detail-section">
            <h2>推荐配队</h2>
            <div className="team-card-grid">
              {character.teams.map((team) => (
                <article className="team-card" key={team.name}>
                  <h3>{team.name}</h3>
                  <div className="character-inline-list">
                    {team.members.map((member) => {
                      const memberProfile = getCharacterProfileByName(member);
                      const memberMedia = getCharacterMedia(member);
                      const chip = (
                        <>
                          {memberMedia ? <img alt="" loading="lazy" src={memberMedia.image} /> : null}
                          <span>{member}</span>
                        </>
                      );

                      return memberProfile ? (
                        <Link className="character-inline has-image" href={`/characters/${memberProfile.slug}`} key={member}>
                          {chip}
                        </Link>
                      ) : (
                        <span className="character-inline" key={member}>
                          {chip}
                        </span>
                      );
                    })}
                  </div>
                  <p>{team.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-section source-section">
            <h2>资料来源</h2>
            <div className="source-links">
              <a href={character.source} rel="noreferrer" target="_blank">
                参考资料
              </a>
              {media ? (
                <a href={media.sourceUrl} rel="noreferrer" target="_blank">
                  图片来源
                </a>
              ) : null}
            </div>
          </section>
        </article>
      </section>
    </BrowserShell>
  );
}

function ProfileStat({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "profile-stat is-wide" : "profile-stat"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
