import characters from "../../data/characters.json";
import events from "../../data/events.json";
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

export const categories = ["发现", "资讯", "数据", "攻略", "活动", "社区"] as const;

export function getPost(slug: string) {
  return allPosts.find((post) => post.slug === slug);
}

export function getCategoryCount(category: string) {
  if (category === "发现") {
    return allPosts.length;
  }

  return allPosts.filter((post) => post.category === category).length;
}
