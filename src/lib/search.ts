import {
  allCharacterProfiles,
  allCharacters,
  allModuleDetails,
  allModules,
  allPosts,
  equipmentCatalog,
  type Post
} from "@/lib/content";
import type { CommunityPost } from "@/lib/community-types";

export type SearchResultType = "帖子" | "角色" | "装备" | "模块";

export type SearchResult = {
  title: string;
  excerpt: string;
  href: string;
  type: SearchResultType;
  source: string;
  score: number;
};

type SearchItem = Omit<SearchResult, "score"> & {
  titleText: string;
  bodyText: string;
};

const MAX_RESULTS_PER_GROUP = 40;

export function searchAllContent(query: string, communityPosts: CommunityPost[] = []) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return {
      query,
      grouped: emptyGroups(),
      total: 0
    };
  }

  const results = buildSearchItems(communityPosts)
    .map((item) => matchSearchItem(item, normalizedQuery))
    .filter((item): item is SearchResult => Boolean(item))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"));

  const grouped = emptyGroups();

  for (const result of results) {
    if (grouped[result.type].length < MAX_RESULTS_PER_GROUP) {
      grouped[result.type].push(result);
    }
  }

  return {
    query,
    grouped,
    total: results.length
  };
}

function buildSearchItems(communityPosts: CommunityPost[]) {
  const items: SearchItem[] = [];

  for (const post of communityPosts) {
    items.push(postItem({
      title: post.title,
      excerpt: post.excerpt,
      href: `/posts/community-${post.id}`,
      source: `${post.category} / ${post.author}`,
      body: post.body.join(" ")
    }));
  }

  for (const post of allPosts) {
    items.push(postItem({
      title: post.title,
      excerpt: post.excerpt,
      href: `/posts/${post.slug}`,
      source: `${post.category} / ${post.author}`,
      body: post.body.join(" ")
    }));
  }

  for (const profile of allCharacterProfiles) {
    items.push({
      type: "角色",
      title: profile.name,
      excerpt: `${profile.rarity} / ${profile.element} / ${profile.role} / ${profile.summary}`,
      href: `/characters/${profile.slug}`,
      source: "角色详情",
      titleText: `${profile.name} ${profile.english}`,
      bodyText: [
        profile.summary,
        profile.element,
        profile.role,
        profile.weaponType,
        profile.faction,
        profile.recommendedWeapon,
        profile.diskSet,
        profile.mainStats,
        profile.subStats,
        ...profile.teams.flatMap((team) => [team.name, team.description, ...team.members])
      ].join(" ")
    });
  }

  for (const character of allCharacters) {
    items.push({
      type: "角色",
      title: character.name,
      excerpt: `${character.element} / ${character.role} / ${character.summary}`,
      href: `/modules/characters`,
      source: "角色速查",
      titleText: character.name,
      bodyText: `${character.element} ${character.role} ${character.rarity} ${character.summary}`
    });
  }

  for (const module of allModules) {
    items.push({
      type: "模块",
      title: module.name,
      excerpt: module.description,
      href: `/modules/${module.slug}`,
      source: module.subtitle,
      titleText: `${module.name} ${module.subtitle}`,
      bodyText: `${module.description} ${module.status} ${module.count} ${module.highlights.join(" ")} ${module.children?.map((child) => `${child.name} ${child.count}`).join(" ") || ""}`
    });
  }

  for (const detail of allModuleDetails) {
    for (const section of detail.sections) {
      const module = allModules.find((item) => item.slug === detail.slug);
      items.push({
        type: "模块",
        title: `${module?.name || detail.slug} · ${section.title}`,
        excerpt: section.items?.join(" / ") || section.rows?.slice(0, 2).map((row) => Object.values(row).join(" / ")).join("；") || detail.summary,
        href: `/modules/${detail.slug}${section.slug ? `#${section.slug}` : ""}`,
        source: "模块资料",
        titleText: `${module?.name || ""} ${section.title}`,
        bodyText: `${detail.summary} ${section.items?.join(" ") || ""} ${section.rows?.map((row) => Object.values(row).join(" ")).join(" ") || ""}`
      });
    }
  }

  for (const item of equipmentCatalog.arcDiscs) {
    items.push(equipmentItem(item.name, `${item.rarity} / ${item.category} / ${item.effect}`, item.description, "/modules/equipment#arc-disc-catalog", "弧盘"));
  }

  for (const item of equipmentCatalog.cassettes) {
    items.push(equipmentItem(item.name, `${item.element} / ${item.pieces}`, `${item.set2} ${item.set4} ${item.recommended.join(" ")}`, "/modules/equipment#cassette-catalog", "卡带"));
  }

  for (const item of equipmentCatalog.driveBlocks) {
    items.push(equipmentItem(item.name, item.category, `${item.description} ${item.rules.join(" ")}`, "/modules/equipment#drive-block-catalog", "驱动块"));
  }

  return dedupeItems(items);
}

function postItem(input: { title: string; excerpt: string; href: string; source: string; body: string }): SearchItem {
  return {
    type: "帖子",
    title: input.title,
    excerpt: input.excerpt,
    href: input.href,
    source: input.source,
    titleText: input.title,
    bodyText: `${input.excerpt} ${input.body}`
  };
}

function equipmentItem(title: string, source: string, body: string, href: string, kind: string): SearchItem {
  return {
    type: "装备",
    title,
    excerpt: body.slice(0, 110),
    href,
    source: `${kind} / ${source}`,
    titleText: `${title} ${kind} ${source}`,
    bodyText: body
  };
}

function matchSearchItem(item: SearchItem, query: string) {
  const title = normalizeSearchText(item.titleText);
  const body = normalizeSearchText(`${item.excerpt} ${item.bodyText} ${item.source}`);
  let score = 0;

  if (title === query) {
    score += 120;
  } else if (title.includes(query)) {
    score += 80;
  }

  if (body.includes(query)) {
    score += 30;
  }

  if (score === 0) {
    return null;
  }

  return {
    title: item.title,
    excerpt: item.excerpt,
    href: item.href,
    type: item.type,
    source: item.source,
    score
  };
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function emptyGroups() {
  return {
    帖子: [] as SearchResult[],
    角色: [] as SearchResult[],
    装备: [] as SearchResult[],
    模块: [] as SearchResult[]
  };
}

function dedupeItems(items: SearchItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.type}:${item.href}:${item.title}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
