import { createHash } from "node:crypto";
import characters from "../../data/characters.json";
import type { Character } from "@/lib/content";
import type { CommunityComment, CommunityPost } from "@/lib/community-types";
import { getCharacterMedia } from "@/lib/media";

export type WorldAuthorKind = NonNullable<CommunityPost["authorKind"]>;

type WorldAccount = {
  name: string;
  kind: WorldAuthorKind;
  bio: string;
  tone: CommunityPost["tone"];
  image: string;
  role?: string;
  element?: string;
  rarity?: string;
};

type WorldPostTemplate = {
  slotHour: number;
  slotMinute?: number;
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

const CHARACTER_TONES: CommunityPost["tone"][] = ["blue", "pink", "navy", "cream", "cyan", "orange"];
const CHARACTER_SIZES: CommunityPost["size"][] = ["short", "medium", "large", "medium"];
const CHARACTER_POST_COPY: Record<string, string[]> = {
  "海月": [
    "今天把港口边的潮声录了一小段，回放时听见了很轻的电流声。",
    "如果下午有人去那边巡逻，记得避开第三盏路灯下面的积水。"
  ],
  "浔": [
    "训练场的光线刚好，适合把连段拆开慢慢试一遍。",
    "别只盯着伤害数字，动作接得顺不顺也很重要。"
  ],
  "安魂曲": [
    "刚从旧街区回来，墙面上的回声比昨天更清楚。",
    "我把异常回响的位置记下来了，晚点交给管理局复核。"
  ],
  "娜娜莉": [
    "午休前路过一咖舍，店里今天的甜味有点过分明显。",
    "我先把观察记录写完，再认真考虑第二份甜点是不是必要。"
  ],
  "小吱": [
    "今天的屋顶路线很顺，风从广告牌缝隙里穿过去的时候会变调。",
    "下次谁要走捷径，可以先看我标的那条线。"
  ],
  "哈尼娅": [
    "把昨天的支援记录整理了一遍，发现很多问题其实出在进场前。",
    "先确认状态，再谈爆发，会省掉不少临场补救。"
  ],
  "埃德嘉": [
    "诊疗包补齐了，备用贴片也放在右侧口袋。",
    "今天不建议硬扛，能绕开的异常就不要拿身体试。"
  ],
  "阿德勒": [
    "早班巡查结束，临时避难点的指示牌已经重新固定。",
    "如果看见歪掉的蓝色标识，拍照发给公告板就行。"
  ],
  "翳": [
    "巷口那段影子今天移动得很慢，像是在等人先开口。",
    "我没有靠太近，只留下了坐标和时间。"
  ],
  "九原": [
    "把训练场的聚点重新画了一版，旧图里有两个角度不太准。",
    "需要的人可以晚点看我贴在频道里的简图。"
  ],
  "达芙蒂尔": [
    "夜色还没完全落下，玻璃幕墙已经开始反射另一条街。",
    "我会盯着那边，别让无关人员靠近。"
  ],
  "法蒂娅": [
    "今天先检查了通讯频道，延迟比昨天低一点。",
    "需要支援时直接报街区编号，不要在频道里绕圈子。"
  ],
  "哈索尔": [
    "下午的风很适合测试远距标记，命中反馈比预期干净。",
    "我把几个偏差点记下来了，晚点再校准。"
  ],
  "早雾": [
    "路线图更新完了，避开人流以后能少走两段回头路。",
    "别临时改集合点，临时两个字通常最费时间。"
  ],
  "白藏": [
    "旧仓库门口的封条还在，但里面的声音换了方向。",
    "我先不拆封，等管理局的人到场再一起确认。"
  ],
  "异能者(男)": [
    "今天的巡逻从东侧开始，先把低风险点位扫一遍。",
    "遇到临时事件别单独处理，频道里喊一声会快很多。"
  ],
  "异能者(女)": [
    "把装备清单重排了一下，常用物放在最容易拿的位置。",
    "出门前多花一分钟检查，回来时会少很多麻烦。"
  ],
  "薄荷": [
    "广播站旁边那条小路今天很安静，安静得有点像在屏息。",
    "我放了一个临时标记，路过的人别踩掉。"
  ]
};
const CHARACTER_POST_TIMES = [
  [9, 10],
  [9, 50],
  [10, 30],
  [11, 10],
  [11, 50],
  [12, 30],
  [13, 10],
  [13, 50],
  [14, 30],
  [15, 10],
  [15, 50],
  [16, 30],
  [17, 10],
  [17, 50],
  [18, 30],
  [19, 10],
  [19, 50],
  [20, 30],
  [21, 10],
  [21, 50],
  [22, 30],
  [23, 10]
] as const;

const characterAccounts = (characters as Character[]).map<WorldAccount>((character, index) => ({
  name: character.name,
  kind: "character",
  bio: `${character.element}${character.role}，来自角色图鉴的官方预设账号。`,
  tone: CHARACTER_TONES[index % CHARACTER_TONES.length],
  image: getCharacterMedia(character.name)?.image || "/assets/puka-card.svg",
  role: character.role,
  element: character.element,
  rarity: character.rarity
}));

const officialAccounts: WorldAccount[] = [
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
    name: "异象管理局",
    kind: "system",
    bio: "发布异象预警、巡逻守则与街区安全提示。",
    tone: "navy",
    image: "/assets/signal-board.svg"
  },
  {
    name: "城市广播站",
    kind: "news",
    bio: "同步城市交通、天气与公共频道信息。",
    tone: "cyan",
    image: "/assets/signal-board.svg"
  },
  {
    name: "兰德瑞克香氛",
    kind: "ad",
    bio: "城市赞助广告账号。",
    tone: "cream",
    image: "/assets/community-fallbacks/perfume-card.webp"
  }
];

export const WORLD_ACCOUNTS: WorldAccount[] = [...characterAccounts, ...officialAccounts];

const NEWS_ACCOUNT = getRequiredWorldAccount("异环都市新闻");
const CAFE_ACCOUNT = getRequiredWorldAccount("一咖舍公告板");
const BUREAU_ACCOUNT = getRequiredWorldAccount("异象管理局");
const RADIO_ACCOUNT = getRequiredWorldAccount("城市广播站");
const AD_ACCOUNT = getRequiredWorldAccount("兰德瑞克香氛");

const fixedWorldSchedule: WorldPostTemplate[] = [
  {
    slotHour: 8,
    slotMinute: 0,
    category: "新闻",
    title: "早间城市频道：今日街区信号恢复正常",
    body: [
      "主城区交通信号已在 08:00 前完成同步，部分街角显示屏仍可能出现短暂闪烁。",
      "异象管理局提醒：看到粉色爪印标记时，请不要把它当作普通涂鸦。"
    ],
    size: "medium",
    account: NEWS_ACCOUNT,
    comment: {
      author: CAFE_ACCOUNT,
      body: "公告板这边也贴上了，早班客人已经开始讨论粉爪路线了。"
    }
  },
  {
    slotHour: 8,
    slotMinute: 35,
    category: "公告",
    title: "异象管理局：今日巡逻路线已更新",
    body: [
      "北侧环线新增两处临时观测点，经过时请留意路口的蓝色指示灯。",
      "今日系统贴会按时段放出角色动态，便于大家跟进城市频道里的新线索。"
    ],
    size: "medium",
    account: BUREAU_ACCOUNT,
    comment: {
      author: RADIO_ACCOUNT,
      body: "广播站已同步到午间频道，路口提示音会在 09:00 后刷新。"
    }
  },
  {
    slotHour: 12,
    slotMinute: 5,
    category: "分享",
    title: "午休记录：一咖舍今天的甜点很危险",
    body: [
      "危险的意思是，很容易点第二份。",
      "我把今日推荐贴在门口了，路过的人可以先看再排队。"
    ],
    size: "large",
    account: CAFE_ACCOUNT,
    comment: {
      author: getRequiredWorldAccount("娜娜莉"),
      body: "第二份已经被我证明是合理选择。"
    }
  },
  {
    slotHour: 14,
    slotMinute: 5,
    category: "广播",
    title: "城市广播站：午后频道切换到轻巡模式",
    body: [
      "14:00 后主城区人流回落，适合补角色资料、整理装备清单和查看晚间活动。",
      "广播站会继续转发管理局提示，异常波段出现时请先看置顶频道。"
    ],
    size: "short",
    account: RADIO_ACCOUNT,
    comment: {
      author: BUREAU_ACCOUNT,
      body: "收到。异常波段超过阈值时会追加红色提示。"
    }
  },
  {
    slotHour: 18,
    slotMinute: 0,
    category: "广告",
    title: "兰德瑞克香氛：把夜巡前的紧张留在门外",
    body: [
      "今日赞助位：GRACE 系列试香开放到 21:00。",
      "免责声明：不能降低异象概率，但能让你闻起来像已经准备好了。"
    ],
    size: "medium",
    account: AD_ACCOUNT,
    comment: {
      author: getRequiredWorldAccount("浔"),
      body: "免责声明写得很诚实。"
    }
  },
  {
    slotHour: 21,
    slotMinute: 35,
    category: "公告",
    title: "异象管理局：夜巡前请复核撤离路线",
    body: [
      "街区变安静的时候，先检查撤离路线，再检查背包。",
      "今天适合复盘，不适合逞强。"
    ],
    size: "short",
    account: BUREAU_ACCOUNT,
    comment: {
      author: NEWS_ACCOUNT,
      body: "城市频道已同步夜巡提示。"
    }
  }
];

const WORLD_SCHEDULE: WorldPostTemplate[] = [...fixedWorldSchedule, ...makeCharacterSchedule()].sort(compareWorldTemplates);

export function getReservedWorldAuthorNames() {
  return new Set(WORLD_ACCOUNTS.map((account) => account.name));
}

export function getWorldAccountByName(name: string) {
  return WORLD_ACCOUNTS.find((account) => account.name === name) || null;
}

export function getWorldAccountImage(account: WorldAccount) {
  return account.kind === "character" ? getCharacterMedia(account.name)?.image || account.image : account.image;
}

export function getVisibleWorldPosts(now = new Date()): CommunityPost[] {
  const currentMinute = getChinaTimeOfDayMinute(now);

  return WORLD_SCHEDULE.filter((template) => getTemplateTimeOfDayMinute(template) <= currentMinute).map((template) => templateToPost(template, now));
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
      authorAvatar: getWorldAccountImage(template.comment.author),
      verified: true,
      body: template.comment.body,
      createdAt: getSlotDate(now, template.slotHour, getCommentMinute(template)).toISOString()
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
  const createdAt = getSlotDate(now, template.slotHour, template.slotMinute || 0).toISOString();

  return {
    id: getWorldPostId(template, now),
    title: template.title,
    excerpt: template.body[0],
    category: template.category,
    author: template.account.name,
    authorKind: template.account.kind,
    authorAvatar: getWorldAccountImage(template.account),
    verified: true,
    image: getWorldAccountImage(template.account),
    body: template.body,
    createdAt,
    likes: getSeededLikeCount(`${getChinaDateKey(now)}:${template.account.name}:${template.title}`),
    tone: template.account.tone,
    size: template.size
  };
}

function getWorldPostId(template: WorldPostTemplate, now = new Date()) {
  return makeDeterministicUuid(`world-post:${getChinaDateKey(now)}:${template.slotHour}:${template.slotMinute || 0}:${template.account.name}`);
}

function getWorldCommentId(template: WorldPostTemplate, now = new Date()) {
  return makeDeterministicUuid(`world-comment:${getChinaDateKey(now)}:${template.slotHour}:${template.slotMinute || 0}:${template.account.name}`);
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

function makeCharacterSchedule(): WorldPostTemplate[] {
  return characterAccounts.map((account, index) => {
    const [slotHour, slotMinute] = CHARACTER_POST_TIMES[index % CHARACTER_POST_TIMES.length];
    const nextAccount = characterAccounts[(index + 3) % characterAccounts.length];

    return {
      slotHour,
      slotMinute,
      category: "角色",
      title: makeCharacterPostTitle(account, index),
      body: makeCharacterPostBody(account, index),
      size: CHARACTER_SIZES[index % CHARACTER_SIZES.length],
      account,
      comment: {
        author: nextAccount,
        body: makeCharacterComment(account, nextAccount)
      }
    };
  });
}

function makeCharacterPostTitle(account: WorldAccount, index: number) {
  const titleTemplates = [
    `${account.name}的今日行动便签`,
    `${account.name}：路过训练场时记一笔`,
    `${account.name}的街区观察记录`,
    `${account.name}：今天先把节奏稳住`
  ];

  return titleTemplates[index % titleTemplates.length];
}

function makeCharacterPostBody(account: WorldAccount, index: number) {
  const copy = CHARACTER_POST_COPY[account.name];

  if (copy) {
    return copy;
  }

  const secondLines = [
    "如果今天要补资料，可以先看角色页，再回到发现流对照队伍需求。",
    "城市频道的节奏有点快，先把路线和站位确认好会轻松很多。",
    "遇到不确定的配队时，先看自己缺输出、生存还是增益，再决定要不要调整。",
    "晚些时候还有新的频道提醒，先把手头的日常清掉比较稳。"
  ];

  return [
    `${account.name}今天把行动记录留在频道里，方便晚些时候回看。`,
    secondLines[index % secondLines.length]
  ];
}

function makeCharacterComment(account: WorldAccount, commenter: WorldAccount) {
  const role = account.role || "行动";
  const commentTemplates = [
    `收到，${role}相关的记录我晚点也补一条。`,
    "这条先收藏，等巡逻结束回来对照一下。",
    "站位这部分很有用，我去把路线图也更新一下。",
    "频道里已经有人问到了，正好可以转过去。"
  ];

  return commentTemplates[(account.name.length + commenter.name.length) % commentTemplates.length];
}

function getRequiredWorldAccount(name: string) {
  const account = WORLD_ACCOUNTS.find((item) => item.name === name);

  if (!account) {
    throw new Error(`Missing world account: ${name}`);
  }

  return account;
}

function compareWorldTemplates(a: WorldPostTemplate, b: WorldPostTemplate) {
  return getTemplateTimeOfDayMinute(a) - getTemplateTimeOfDayMinute(b) || a.account.name.localeCompare(b.account.name, "zh-CN");
}

function getTemplateTimeOfDayMinute(template: WorldPostTemplate) {
  return template.slotHour * 60 + (template.slotMinute || 0);
}

function getCommentMinute(template: WorldPostTemplate) {
  return Math.min((template.slotMinute || 0) + 8, 59);
}

function getChinaTimeOfDayMinute(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value || "0");

  return hour * 60 + minute;
}

function getSlotDate(now: Date, hour: number, minute = 0) {
  const [year, month, day] = getChinaDateKey(now).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}
