import { del, list, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import {
  COMMUNITY_CUTE_NAMES,
  COMMUNITY_DEFAULT_CATEGORY,
  COMMUNITY_FALLBACK_IMAGES,
  COMMUNITY_HOME_LIMIT,
  COMMUNITY_IMAGE_MAX_BYTES,
  type CommunityComment,
  type CommunityCommentInput,
  type CommunityPost,
  type CommunityPostInput
} from "@/lib/community-types";

const POST_PREFIX = "community/posts/";
const COMMENT_PREFIX = "community/comments/";
const LIKE_PREFIX = "community/likes/";
const IMAGE_PREFIX = "community/images/";
const RATE_PREFIX = "community/rate/";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type BlobListItem = {
  pathname: string;
  url: string;
  uploadedAt?: Date | string;
};

export class CommunityError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function isCommunityEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function listCommunityPosts(limit = COMMUNITY_HOME_LIMIT) {
  if (!isCommunityEnabled()) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, COMMUNITY_HOME_LIMIT));
  const blobs = await listAll(POST_PREFIX);
  const posts = await Promise.all(blobs.map((blob) => readJsonBlob<CommunityPost>(blob.url)));
  const visiblePosts = posts
    .filter((post): post is CommunityPost => Boolean(post))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, safeLimit);

  return Promise.all(
    visiblePosts.map(async (post) => ({
      ...post,
      likes: await countPrefix(`${LIKE_PREFIX}${post.id}/`)
    }))
  );
}

export async function getCommunityPost(id: string) {
  if (!isCommunityEnabled() || !isSafeId(id)) {
    return null;
  }

  const blobs = await listAll(`${POST_PREFIX}${id}.json`);
  const blob = blobs.find((item) => item.pathname === `${POST_PREFIX}${id}.json`);

  if (!blob) {
    return null;
  }

  const post = await readJsonBlob<CommunityPost>(blob.url);

  if (!post) {
    return null;
  }

  return {
    ...post,
    likes: await countPrefix(`${LIKE_PREFIX}${post.id}/`)
  };
}

export async function createCommunityPost(input: CommunityPostInput, request: Request) {
  ensureBlobEnabled();
  await assertRateLimit(request, "post", 60 * 60 * 1000);

  const title = cleanText(input.title, 80);
  const body = cleanText(input.body, 4000);
  const author = cleanText(input.author || randomCuteName(), 24);
  const category = cleanText(input.category || COMMUNITY_DEFAULT_CATEGORY, 12) || COMMUNITY_DEFAULT_CATEGORY;

  if (!title) {
    throw new CommunityError("请填写标题");
  }

  if (!body) {
    throw new CommunityError("请填写内容");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const imageResult = input.image ? await uploadCommunityImage(id, input.image) : null;
  const post: CommunityPost = {
    id,
    title,
    excerpt: makeExcerpt(body),
    category,
    author,
    image: imageResult?.url || randomFallbackImage(id),
    imagePath: imageResult?.pathname,
    body: body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    createdAt,
    likes: 0,
    tone: pickTone(id),
    size: "medium"
  };

  await putJson(`${POST_PREFIX}${id}.json`, post);
  await recordRateLimit(request, "post", 60 * 60 * 1000);

  return post;
}

export async function likeCommunityPost(id: string) {
  ensureBlobEnabled();

  const post = await getCommunityPost(id);

  if (!post) {
    throw new CommunityError("帖子不存在", 404);
  }

  await putJson(`${LIKE_PREFIX}${id}/${crypto.randomUUID()}.json`, {
    id: crypto.randomUUID(),
    postId: id,
    createdAt: new Date().toISOString()
  });

  return { likes: await countPrefix(`${LIKE_PREFIX}${id}/`) };
}

export async function listCommunityComments(postId: string) {
  if (!isCommunityEnabled() || !isSafeId(postId)) {
    return [];
  }

  const blobs = await listAll(`${COMMENT_PREFIX}${postId}/`);
  const comments = await Promise.all(blobs.map((blob) => readJsonBlob<CommunityComment>(blob.url)));

  return comments
    .filter((comment): comment is CommunityComment => Boolean(comment))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export async function createCommunityComment(postId: string, input: CommunityCommentInput, request: Request) {
  ensureBlobEnabled();

  const post = await getCommunityPost(postId);

  if (!post) {
    throw new CommunityError("帖子不存在", 404);
  }

  await assertRateLimit(request, "comment", 60 * 1000);

  const body = cleanText(input.body, 800);
  const author = cleanText(input.author || randomCuteName(), 24);

  if (!body) {
    throw new CommunityError("请填写评论内容");
  }

  const comment: CommunityComment = {
    id: crypto.randomUUID(),
    postId,
    author,
    body,
    createdAt: new Date().toISOString()
  };

  await putJson(`${COMMENT_PREFIX}${postId}/${comment.id}.json`, comment);
  await recordRateLimit(request, "comment", 60 * 1000);

  return comment;
}

export async function deleteCommunityPost(id: string, password: string | null) {
  ensureBlobEnabled();

  if (!process.env.ADMIN_DELETE_PASSWORD || password !== process.env.ADMIN_DELETE_PASSWORD) {
    throw new CommunityError("管理密码错误", 401);
  }

  const post = await getCommunityPost(id);

  if (!post) {
    throw new CommunityError("帖子不存在", 404);
  }

  const blobs = await Promise.all([
    listAll(`${COMMENT_PREFIX}${id}/`),
    listAll(`${LIKE_PREFIX}${id}/`)
  ]);
  const pathnames = blobs.flat().map((blob) => blob.pathname);
  pathnames.push(`${POST_PREFIX}${id}.json`);

  if (post.imagePath) {
    pathnames.push(post.imagePath);
  }

  await del(pathnames);

  return { ok: true };
}

async function uploadCommunityImage(postId: string, image: NonNullable<CommunityPostInput["image"]>) {
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    throw new CommunityError("只支持 jpg、png、webp 图片");
  }

  const buffer = dataUrlToBuffer(image.dataUrl);

  if (buffer.byteLength > COMMUNITY_IMAGE_MAX_BYTES) {
    throw new CommunityError("图片不能超过 1MB");
  }

  const ext = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const pathname = `${IMAGE_PREFIX}${postId}.${ext}`;
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: image.type
  });

  return {
    pathname,
    url: blob.url
  };
}

async function assertRateLimit(request: Request, action: "post" | "comment", windowMs: number) {
  const key = rateKey(request, action, windowMs);
  const existing = await listAll(key);

  if (existing.length > 0) {
    throw new CommunityError(action === "post" ? "1 小时内只能发一次帖子" : "1 分钟内只能评论一次", 429);
  }
}

async function recordRateLimit(request: Request, action: "post" | "comment", windowMs: number) {
  await putJson(`${rateKey(request, action, windowMs)}${crypto.randomUUID()}.json`, {
    action,
    createdAt: new Date().toISOString()
  });
}

function rateKey(request: Request, action: "post" | "comment", windowMs: number) {
  const identity = getIdentityHash(request);
  const bucket = Math.floor(Date.now() / windowMs);
  return `${RATE_PREFIX}${action}/${identity}/${bucket}/`;
}

function getIdentityHash(request: Request) {
  const clientId = request.headers.get("x-community-client-id") || "";
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const ua = request.headers.get("user-agent") || "";

  return createHash("sha256").update(`${clientId}:${ip}:${ua}`).digest("hex").slice(0, 32);
}

function ensureBlobEnabled() {
  if (!isCommunityEnabled()) {
    throw new CommunityError("尚未配置 Vercel Blob", 503);
  }
}

async function listAll(prefix: string) {
  const blobs: BlobListItem[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  return blobs;
}

async function countPrefix(prefix: string) {
  return (await listAll(prefix)).length;
}

async function readJsonBlob<T>(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function putJson(pathname: string, value: unknown) {
  return put(pathname, JSON.stringify(value, null, 2), {
    access: "public",
    contentType: "application/json"
  });
}

function cleanText(value: string | undefined, maxLength: number) {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function makeExcerpt(body: string) {
  return cleanText(body, 78) || "分享了一条新的异环笔记。";
}

function randomCuteName() {
  return COMMUNITY_CUTE_NAMES[Math.floor(Math.random() * COMMUNITY_CUTE_NAMES.length)];
}

function randomFallbackImage(seed: string) {
  const index = seed.charCodeAt(0) % COMMUNITY_FALLBACK_IMAGES.length;
  return COMMUNITY_FALLBACK_IMAGES[index];
}

function pickTone(seed: string): CommunityPost["tone"] {
  const tones: CommunityPost["tone"][] = ["pink", "cyan", "blue", "navy"];
  return tones[seed.charCodeAt(1) % tones.length];
}

function dataUrlToBuffer(dataUrl: string) {
  const [, base64] = dataUrl.split(",");

  if (!base64) {
    throw new CommunityError("图片数据无效");
  }

  return Buffer.from(base64, "base64");
}

function isSafeId(id: string) {
  return /^[a-zA-Z0-9-]+$/.test(id);
}
