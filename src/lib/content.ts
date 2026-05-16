import characters from "../../data/characters.json";
import events from "../../data/events.json";
import moduleDetails from "../../data/module-details.json";
import modules from "../../data/modules.json";
import posts from "../../data/posts.json";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "公告" | "攻略" | "社区" | "数据" | "活动" | "资讯";
  author: string;
  likes: string;
  date: string;
  image: string;
  tone: "cyan" | "blue" | "pink" | "navy" | "cream" | "orange";
  size: "short" | "medium" | "large" | "tall";
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
};

export type ModuleSection = {
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

export type Event = {
  title: string;
  status: string;
  date: string;
  reward: string;
};

export const allPosts = posts as Post[];
export const allCharacters = characters as Character[];
export const allEvents = events as Event[];
export const allModules = modules as ModuleEntry[];
export const allModuleDetails = moduleDetails as ModuleDetail[];

export function getPost(slug: string) {
  return allPosts.find((post) => post.slug === slug);
}

export function getModule(slug: string) {
  return allModules.find((module) => module.slug === slug);
}

export function getModuleDetail(slug: string) {
  return allModuleDetails.find((module) => module.slug === slug);
}
