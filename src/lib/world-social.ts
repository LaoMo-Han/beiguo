import { createHash } from "node:crypto";
import type { CommunityComment, CommunityPost } from "@/lib/community-types";

export type WorldAuthorKind = NonNullable<CommunityPost["authorKind"]>;

type WorldAccount = {
  name: string;
  kind: WorldAuthorKind;
  bio: string;
  tone: CommunityPost["tone"];
  image: string;
};

type WorldPostTemplate = {
  slotHour: number;
  category: string;
  title: string;
  body: string[];
  size: CommunityPost["size"];
  account: WorldAccount;
  comment?: {
    author: WorldAccount;
    body: string;
  };
};

export const WORLD_ACCOUNTS: WorldAccount[] = [
  {
    name: "浔",
    kind: "character",
    bio: "光系异能者，喜欢把轻描淡写的话说得像刚好路过。",
    tone: "blue",
    image: "/assets/puka-card.svg"
  },
  {
    name: "娜娜莉",
    kind: "character",
    bio: "灵系输出，认真记录每一次城市频道里的小变化。",
    tone: "pink",
    image: "/assets/team-stickers.svg"
  },
  {
    name: "九原",
    kind: "character",
    bio: "灵系聚怪和后台补强位，发帖像写任务便签。",
    tone: "navy",
    image: "/assets/team-stickers.svg"
  },
  {
    name: "早雾",
    kind: "character",
    bio: "咒系增益和聚怪辅助，总能把路线讲得很清楚。",
    tone: "cream",
    image: "/assets/puka-card.svg"
  },
  {
    name: "异环都市新闻",
    kind: "news",
    bio: "城市频道自动播报。",
    tone: "cyan",
    image: "/assets/signal-board.svg"
  },
  {
    name: "一咖舍公告板",
    kind: "npc",
    bio: "每日把店内留言和附近传闻贴到墙上。",
    tone: "orange",
    image: "/assets/rumor-note.svg"
  },
  {
    name: "兰德瑞克香氛",
    kind: "ad",
    bio: "城市赞助广告账号。",
    tone: "cream",
    image: "/assets/community-fallbacks/perfume-card.webp"
  }
];

const WORLD_SCHEDULE: WorldPostTemplate[] = [
  {
    slotHour: 8,
    category: "新闻",
    title: "早间城市频道：今日街区信号恢复正常",
    body: [
      "主城区交通信号已在 08:00 前完成同步，部分街角显示屏仍可能出现短暂闪烁。",
      "异象管理局提醒：看到粉色爪印标记时，请不要把它当作普通涂鸦。"
    ],
    size: "medium",
    account: WORLD_ACCOUNTS[4],
    comment: {
      author: WORLD_ACCOUNTS[5],
      body: "公告板这边也贴上了，早班客人已经开始讨论粉爪路线了。"
    }
  },
  {
    slotHour: 10,
    category: "动态",
    title: "路过训练场，今天的光有点适合热身",
    body: [
      "如果有人在训练场看到残影，别紧张，只是我比预约时间早到了一点。",
      "顺便提醒：弧盘不要只看名字，先看自己队伍缺什么。"
    ],
    size: "short",
    account: WORLD_ACCOUNTS[0],
    comment: {
      author: WORLD_ACCOUNTS[3],
      body: "早到十五分钟不叫一点。"
    }
  },
  {
    slotHour: 12,
    category: "分享",
    title: "午休记录：一咖舍今天的甜点很危险",
    body: [
      "危险的意思是，很容易点第二份。",
      "我把今日推荐贴在门口了，路过的人可以先看再排队。"
    ],
    size: "large",
    account: WORLD_ACCOUNTS[5],
    comment: {
      author: WORLD_ACCOUNTS[1],
      body: "第二份已经被我证明是合理选择。"
    }
  },
  {
    slotHour: 15,
    category: "角色",
    title: "下午的队伍练习，先确认站位再谈输出",
    body: [
      "今天的记录：先把队友的位置拉开，反应窗口会比想象中更稳定。",
      "如果只盯着伤害数字，很容易忽略真正让循环顺起来的那一步。"
    ],
    size: "medium",
    account: WORLD_ACCOUNTS[1],
    comment: {
      author: WORLD_ACCOUNTS[2],
      body: "记录收到。下次我把聚怪点位提前标出来。"
    }
  },
  {
    slotHour: 18,
    category: "广告",
    title: "兰德瑞克香氛：把夜巡前的紧张留在门外",
    body: [
      "今日赞助位：GRACE 系列试香开放到 21:00。",
      "免责声明：不能降低异象概率，但能让你闻起来像已经准备好了。"
    ],
    size: "medium",
    account: WORLD_ACCOUNTS[6],
    comment: {
      author: WORLD_ACCOUNTS[0],
      body: "免责声明写得很诚实。"
    }
  },
  {
    slotHour: 21,
    category: "夜聊",
    title: "夜间巡逻便签：别把安静当成没事",
    body: [
      "街区变安静的时候，先检查撤离路线，再检查背包。",
      "今天适合复盘，不适合逞强。"
    ],
    size: "short",
    account: WORLD_ACCOUNTS[3],
    comment: {
      author: WORLD_ACCOUNTS[4],
      body: "城市频道已同步夜巡提示。"
    }
  }
];

export function getReservedWorldAuthorNames() {
  return new Set(WORLD_ACCOUNTS.map((account) => account.name));
}

export function getWorldAccountByName(name: string) {
  return WORLD_ACCOUNTS.find((account) => account.name === name) || null;
}

export function getVisibleWorldPosts(now = new Date()): CommunityPost[] {
  const currentHour = getChinaHour(now);

  return WORLD_SCHEDULE.filter((template) => template.slotHour <= currentHour).map((template) => templateToPost(template, now));
}

export function getWorldPostComments(postId: string, now = new Date()): CommunityComment[] {
  const template = WORLD_SCHEDULE.find((item) => getWorldPostId(item, now) === postId);

  if (!template?.comment) {
    return [];
  }

  return [
    {
      id: getWorldCommentId(template, now),
      postId,
      author: template.comment.author.name,
      authorKind: template.comment.author.kind,
      authorAvatar: template.comment.author.image,
      verified: true,
      body: template.comment.body,
      createdAt: getSlotDate(now, template.slotHour, 18).toISOString()
    }
  ];
}

export function isWorldPostId(id: string) {
  return WORLD_SCHEDULE.some((template) => getWorldPostId(template) === id);
}

export function getWorldPostById(id: string) {
  return getVisibleWorldPosts().find((post) => post.id === id) || null;
}

export function makeDeterministicUuid(seed: string) {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80)
    .toString(16)
    .padStart(2, "0")}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function templateToPost(template: WorldPostTemplate, now: Date): CommunityPost {
  const createdAt = getSlotDate(now, template.slotHour).toISOString();

  return {
    id: getWorldPostId(template, now),
    title: template.title,
    excerpt: template.body[0],
    category: template.category,
    author: template.account.name,
    authorKind: template.account.kind,
    authorAvatar: template.account.image,
    verified: true,
    image: template.account.image,
    body: template.body,
    createdAt,
    likes: getSeededLikeCount(`${getChinaDateKey(now)}:${template.account.name}:${template.title}`),
    tone: template.account.tone,
    size: template.size
  };
}

function getWorldPostId(template: WorldPostTemplate, now = new Date()) {
  return makeDeterministicUuid(`world-post:${getChinaDateKey(now)}:${template.slotHour}:${template.account.name}`);
}

function getWorldCommentId(template: WorldPostTemplate, now = new Date()) {
  return makeDeterministicUuid(`world-comment:${getChinaDateKey(now)}:${template.slotHour}:${template.account.name}`);
}

function getSeededLikeCount(seed: string) {
  const value = parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 6), 16);
  return 120 + (value % 980);
}

function getChinaDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getChinaHour(date: Date) {
  return Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    hour12: false
  }).format(date));
}

function getSlotDate(now: Date, hour: number, minute = 0) {
  const [year, month, day] = getChinaDateKey(now).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}
