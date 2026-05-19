import characters from "../../data/characters.json";
import characterProfiles from "../../data/character-profiles.json";
import equipment from "../../data/equipment.json";
import events from "../../data/events.json";
import moduleDetails from "../../data/module-details.json";
import modules from "../../data/modules.json";
import posts from "../../data/posts.json";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "公告" | "攻略" | "社区" | "数据" | "活动" | "资讯" | "分享";
  author: string;
  likes: string;
  date: string;
  image: string;
  tone: "cyan" | "blue" | "pink" | "navy" | "cream" | "orange";
  size: "short" | "medium" | "large" | "tall";
  href?: string;
  body: string[];
};

export type ModuleEntry = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  status: string;
  count: string;
  tone: "cyan" | "blue" | "pink" | "navy" | "cream" | "orange";
  highlights: string[];
  children?: {
    slug: string;
    name: string;
    count: string;
  }[];
};

export type ModuleSection = {
  slug?: string;
  title: string;
  kind: "table" | "cards" | "checklist";
  columns?: string[];
  rows?: Record<string, string>[];
  items?: string[];
};

export type ModuleDetail = {
  slug: string;
  updated: string;
  summary: string;
  sections: ModuleSection[];
};

export type Character = {
  name: string;
  role: string;
  element: string;
  rarity: string;
  summary: string;
};

export type CharacterTeam = {
  name: string;
  members: string[];
  description: string;
};

export type CharacterProfile = {
  slug: string;
  name: string;
  english: string;
  rarity: string;
  combatTier: string;
  cityTier: string;
  element: string;
  weaponType: string;
  role: string;
  faction: string;
  summary: string;
  recommendedWeapon: string;
  diskSet: string;
  mainStats: string;
  subStats: string;
  teams: CharacterTeam[];
  source: string;
};

export type Event = {
  title: string;
  status: string;
  date: string;
  reward: string;
};

export type ArcDisc = {
  name: string;
  rarity: string;
  category: string;
  effect: string;
  description: string;
  image: string;
  source: string;
};

export type Cassette = {
  name: string;
  english: string;
  element: string;
  pieces: string;
  set2: string;
  set4: string;
  recommended: string[];
  image: string;
  source: string;
};

export type DriveBlockInfo = {
  name: string;
  category: string;
  description: string;
  rules: string[];
  image: string;
  source: string;
};

export type EquipmentCatalog = {
  updated: string;
  sources: {
    name: string;
    url: string;
  }[];
  arcDiscs: ArcDisc[];
  cassettes: Cassette[];
  driveBlocks: DriveBlockInfo[];
};

export const allPosts = posts as Post[];
export const allCharacters = characters as Character[];
export const allCharacterProfiles = characterProfiles as CharacterProfile[];
export const allEvents = [...(events as Event[])].sort(compareEventsByDate);
export const allModules = modules as ModuleEntry[];
export const allModuleDetails = moduleDetails as ModuleDetail[];
export const equipmentCatalog = equipment as EquipmentCatalog;
export const moduleEntryPosts = allModules.filter((module) => module.slug !== "discover").map(moduleToPost);

export function getPost(slug: string) {
  return allPosts.find((post) => post.slug === slug);
}

export function getModule(slug: string) {
  return allModules.find((module) => module.slug === slug);
}

export function getModuleDetail(slug: string) {
  return allModuleDetails.find((module) => module.slug === slug);
}

export function getCharacterProfileByName(name: string) {
  return allCharacterProfiles.find((character) => character.name === name);
}

export function getCharacterProfileBySlug(slug: string) {
  return allCharacterProfiles.find((character) => character.slug === slug);
}

function compareEventsByDate(a: Event, b: Event) {
  return getEventDateValue(a.date, 0) - getEventDateValue(b.date, 0) || getEventDateValue(a.date, 1) - getEventDateValue(b.date, 1);
}

function getEventDateValue(date: string, index: number) {
  const parts = date.split("-").map((part) => part.trim());
  const value = parts[index] ?? parts[0] ?? "";
  const [month, day] = value.split(".").map(Number);

  if (!Number.isFinite(month) || !Number.isFinite(day)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Date.UTC(2026, month - 1, day);
}

function moduleToPost(module: ModuleEntry): Post {
  return {
    slug: `module-${module.slug}`,
    title: module.name,
    excerpt: module.description,
    category: getModulePostCategory(module.slug),
    author: "呗果资料组",
    likes: module.count,
    date: "2026-05-19",
    image: getModulePostImage(module.slug),
    tone: module.tone,
    size: getModulePostSize(module.slug),
    href: `/modules/${module.slug}`,
    body: [
      module.description,
      module.highlights.join(" / ")
    ]
  };
}

function getModulePostCategory(slug: string): Post["category"] {
  if (slug === "pink-paws" || slug === "daily-weekly") {
    return "活动";
  }

  if (slug === "tier" || slug === "equipment" || slug === "characters") {
    return "数据";
  }

  return "攻略";
}

function getModulePostImage(slug: string) {
  if (slug === "characters" || slug === "affection") {
    return "/assets/puka-card.svg";
  }

  if (slug === "city-life" || slug === "daily-weekly") {
    return "/assets/neon-city.svg";
  }

  if (slug === "tier") {
    return "/assets/team-stickers.svg";
  }

  if (slug === "pink-paws") {
    return "/assets/event-stamps.svg";
  }

  return "/assets/signal-board.svg";
}

function getModulePostSize(slug: string): Post["size"] {
  if (slug === "characters" || slug === "city-life") {
    return "large";
  }

  if (slug === "equipment" || slug === "pink-paws") {
    return "medium";
  }

  return "short";
}
