export const COMMUNITY_DEFAULT_CATEGORY = "分享";

export const COMMUNITY_FALLBACK_IMAGES = [
  "/assets/team-stickers.svg",
  "/assets/puka-card.svg",
  "/assets/neon-city.svg",
  "/assets/signal-board.svg"
] as const;

export const COMMUNITY_CUTE_NAMES = [
  "粉爪观察员",
  "奶油小呗",
  "环城小甜心",
  "咕噜情报员",
  "星糖路人",
  "桃气导航员",
  "软糖旅客",
  "月光贴贴"
] as const;

export const COMMUNITY_IMAGE_MAX_BYTES = 1024 * 1024;
export const COMMUNITY_HOME_LIMIT = 20;

export type CommunityPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  image: string;
  imagePath?: string;
  body: string[];
  createdAt: string;
  likes: number;
  tone: "cyan" | "blue" | "pink" | "navy" | "cream" | "orange";
  size: "short" | "medium" | "large" | "tall";
};

export type CommunityComment = {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type CommunityPostInput = {
  title: string;
  body: string;
  author?: string;
  category?: string;
  image?: {
    dataUrl: string;
    type: string;
    name: string;
  };
};

export type CommunityCommentInput = {
  author?: string;
  body: string;
};
