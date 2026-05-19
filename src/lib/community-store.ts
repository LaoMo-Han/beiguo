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
import { getCommunityDb } from "@/lib/community-db";
import {
  getReservedWorldAuthorNames,
  getVisibleWorldPosts,
  getWorldAccountByName,
  getWorldPostById,
  getWorldPostComments,
  isWorldPostId
} from "@/lib/world-social";
import { getR2Object, isR2Configured, uploadCommunityImageToR2 } from "@/lib/r2-storage";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type CommunityPostRow = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  author_kind?: CommunityPost["authorKind"];
  verified?: boolean;
  image: string;
  image_path: string | null;
  body: string[];
  tone: CommunityPost["tone"];
  size: CommunityPost["size"];
  base_likes?: number | string | null;
  created_at: Date | string;
  likes: number | string | null;
};

type CommunityCommentRow = {
  id: string;
  post_id: string;
  author: string;
  author_kind?: CommunityComment["authorKind"];
  verified?: boolean;
  body: string;
  created_at: Date | string;
};

export class CommunityError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function isCommunityEnabled() {
  return Boolean(getCommunityDb());
}

export async function listCommunityPosts(limit = COMMUNITY_HOME_LIMIT) {
  const sql = getCommunityDb();

  if (!sql) {
    return getVisibleWorldPosts().slice(0, Math.max(1, Math.min(limit, COMMUNITY_HOME_LIMIT)));
  }

  const safeLimit = Math.max(1, Math.min(limit, COMMUNITY_HOME_LIMIT));

  try {
    await ensureCommunitySchema();
    await ensureTodayWorldPosts();

    const rows = await sql<CommunityPostRow[]>`
      select
        p.*,
        coalesce(p.base_likes, 0) + count(l.id) as likes
      from community_posts p
      left join community_likes l on l.post_id = p.id
      group by p.id
      order by p.created_at desc
      limit ${safeLimit}
    `;

    return rows.map(mapPostRow);
  } catch (error) {
    console.error("community posts query error", error);
    throw new CommunityError("社区帖子暂时加载失败", 503);
  }
}

export async function getCommunityPost(id: string) {
  const sql = getCommunityDb();

  if (!sql || !isSafeId(id)) {
    return isSafeId(id) ? getWorldPostById(id) : null;
  }

  try {
    await ensureCommunitySchema();
    await ensureTodayWorldPosts();

    const rows = await sql<CommunityPostRow[]>`
      select
        p.*,
        coalesce(p.base_likes, 0) + count(l.id) as likes
      from community_posts p
      left join community_likes l on l.post_id = p.id
      where p.id = ${id}
      group by p.id
      limit 1
    `;

    return rows[0] ? mapPostRow(rows[0]) : getWorldPostById(id);
  } catch (error) {
    console.error("community post query error", error);
    throw new CommunityError("帖子读取失败", 503);
  }
}

export async function createCommunityPost(input: CommunityPostInput, request: Request) {
  const sql = getCommunityDb();

  if (!sql) {
    throw new CommunityError("尚未配置 Supabase 数据库", 503);
  }

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

  if (getReservedWorldAuthorNames().has(author)) {
    if (!isAdminAuthorRequest(request)) {
      throw new CommunityError("这个名字是游戏角色或官方账号专用，请换一个昵称", 403);
    }
  }

  const id = crypto.randomUUID();
  const paragraphs = body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const worldAccount = getWorldAccountByName(author);
  const isVerifiedAuthor = Boolean(worldAccount && isAdminAuthorRequest(request));
  const uploadedImage = input.image ? await normalizeAndUploadCommunityImage(input.image, id) : null;
  const image = uploadedImage ? communityImageUrl(uploadedImage.key) : worldAccount?.image || randomFallbackImage(id);
  const imagePath = uploadedImage?.key || null;
  const tone = worldAccount?.tone || pickTone(id);

  try {
    await ensureCommunitySchema();

    const rows = await sql<CommunityPostRow[]>`
      insert into community_posts (
        id,
        title,
        excerpt,
        category,
        author,
        author_kind,
        verified,
        image,
        image_path,
        body,
        tone,
        size,
        base_likes
      )
      values (
        ${id},
        ${title},
        ${makeExcerpt(body)},
        ${category},
        ${author},
        ${isVerifiedAuthor ? worldAccount?.kind || "system" : "player"},
        ${isVerifiedAuthor},
        ${image},
        ${imagePath},
        ${paragraphs},
        ${tone},
        ${"medium"},
        ${0}
      )
      returning *, 0 as likes
    `;

    await recordRateLimit(request, "post", 60 * 60 * 1000);

    return mapPostRow(rows[0]);
  } catch (error) {
    console.error("community post insert error", error);
    throw new CommunityError("发帖失败，请稍后再试", 500);
  }
}

export async function likeCommunityPost(id: string) {
  const sql = getCommunityDb();

  if (!sql || !isSafeId(id)) {
    throw new CommunityError("帖子不存在", 404);
  }

  const post = await getCommunityPost(id);

  if (!post) {
    throw new CommunityError("帖子不存在", 404);
  }

  try {
    await ensureCommunitySchema();

    await sql`
      insert into community_likes (post_id)
      values (${id})
    `;

    return { likes: await countLikes(id) };
  } catch (error) {
    console.error("community like insert error", error);
    throw new CommunityError("点赞失败", 500);
  }
}

export async function listCommunityComments(postId: string) {
  const sql = getCommunityDb();

  if (!sql || !isSafeId(postId)) {
    return isSafeId(postId) ? getWorldPostComments(postId) : [];
  }

  try {
    await ensureCommunitySchema();

    const rows = await sql<CommunityCommentRow[]>`
      select *
      from community_comments
      where post_id = ${postId}
      order by created_at asc
    `;

    return rows.length > 0 ? rows.map(mapCommentRow) : getWorldPostComments(postId);
  } catch (error) {
    console.error("community comments query error", error);
    throw new CommunityError("评论暂时加载失败", 503);
  }
}

export async function createCommunityComment(postId: string, input: CommunityCommentInput, request: Request) {
  const sql = getCommunityDb();

  if (!sql || !isSafeId(postId)) {
    throw new CommunityError("帖子不存在", 404);
  }

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

  if (getReservedWorldAuthorNames().has(author)) {
    if (!isAdminAuthorRequest(request)) {
      throw new CommunityError("这个名字是游戏角色或官方账号专用，请换一个昵称", 403);
    }
  }

  try {
    await ensureCommunitySchema();
    const worldAccount = getWorldAccountByName(author);
    const isVerifiedAuthor = Boolean(worldAccount && isAdminAuthorRequest(request));

    const rows = await sql<CommunityCommentRow[]>`
      insert into community_comments (post_id, author, author_kind, verified, body)
      values (${postId}, ${author}, ${isVerifiedAuthor ? worldAccount?.kind || "system" : "player"}, ${isVerifiedAuthor}, ${body})
      returning *
    `;

    await recordRateLimit(request, "comment", 60 * 1000);

    return mapCommentRow(rows[0]);
  } catch (error) {
    console.error("community comment insert error", error);
    throw new CommunityError("评论失败", 500);
  }
}

export async function deleteCommunityPost(id: string, password: string | null) {
  const sql = getCommunityDb();

  if (!sql || !isSafeId(id)) {
    throw new CommunityError("帖子不存在", 404);
  }

  if (!process.env.ADMIN_DELETE_PASSWORD || password !== process.env.ADMIN_DELETE_PASSWORD) {
    throw new CommunityError("管理密码错误", 401);
  }

  try {
    await sql`
      delete from community_posts
      where id = ${id}
    `;

    return { ok: true };
  } catch (error) {
    console.error("community post delete error", error);
    throw new CommunityError("删除失败", 500);
  }
}

export async function getCommunityImage(name: string) {
  if (!/^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i.test(name)) {
    throw new CommunityError("图片不存在", 404);
  }

  try {
    return await getR2Object(`community/posts/${name}`);
  } catch (error) {
    console.error("community image read error", error);
    throw new CommunityError("图片不存在", 404);
  }
}

async function assertRateLimit(request: Request, action: "post" | "comment", windowMs: number) {
  const sql = getCommunityDb();

  if (!sql) {
    throw new CommunityError("尚未配置 Supabase 数据库", 503);
  }

  const key = rateKey(request, action, windowMs);
  const now = new Date();

  try {
    await sql`
      delete from community_rate_limits
      where expires_at < ${now}
    `;

    const rows = await sql<{ key: string }[]>`
      select key
      from community_rate_limits
      where key = ${key}
      limit 1
    `;

    if (rows.length > 0) {
      throw new CommunityError(action === "post" ? "1 小时内只能发一次帖子" : "1 分钟内只能评论一次", 429);
    }
  } catch (error) {
    if (error instanceof CommunityError) {
      throw error;
    }

    console.error("community rate limit query error", error);
    throw new CommunityError("频率限制检查失败", 503);
  }
}

async function recordRateLimit(request: Request, action: "post" | "comment", windowMs: number) {
  const sql = getCommunityDb();

  if (!sql) {
    throw new CommunityError("尚未配置 Supabase 数据库", 503);
  }

  const key = rateKey(request, action, windowMs);
  const expiresAt = new Date(Math.ceil(Date.now() / windowMs) * windowMs + windowMs);

  try {
    await sql`
      insert into community_rate_limits (
        key,
        action,
        identity_hash,
        bucket,
        expires_at
      )
      values (
        ${key},
        ${action},
        ${getIdentityHash(request)},
        ${Math.floor(Date.now() / windowMs)},
        ${expiresAt}
      )
      on conflict (key) do update set expires_at = excluded.expires_at
    `;
  } catch (error) {
    console.error("community rate limit insert error", error);
    throw new CommunityError("频率限制记录失败", 503);
  }
}

async function countLikes(postId: string) {
  const sql = getCommunityDb();

  if (!sql) {
    return 0;
  }

  const rows = await sql<{ count: number | string }[]>`
    select coalesce(p.base_likes, 0) + count(l.id) as count
    from community_posts p
    left join community_likes l on l.post_id = p.id
    where p.id = ${postId}
    group by p.id
  `;

  return Number(rows[0]?.count || 0);
}

function mapPostRow(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    authorKind: row.author_kind || "player",
    verified: Boolean(row.verified),
    image: row.image_path ? communityImageUrl(row.image_path) : row.image,
    imagePath: row.image_path || undefined,
    body: row.body,
    createdAt: toIsoString(row.created_at),
    likes: Number(row.likes || 0),
    tone: row.tone,
    size: row.size
  };
}

function mapCommentRow(row: CommunityCommentRow): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author,
    authorKind: row.author_kind || "player",
    verified: Boolean(row.verified),
    body: row.body,
    createdAt: toIsoString(row.created_at)
  };
}

let schemaReady = false;

async function ensureCommunitySchema() {
  const sql = getCommunityDb();

  if (!sql || schemaReady) {
    return;
  }

  await sql`alter table public.community_posts add column if not exists author_kind text not null default 'player'`;
  await sql`alter table public.community_posts add column if not exists verified boolean not null default false`;
  await sql`alter table public.community_posts add column if not exists base_likes integer not null default 0`;
  await sql`alter table public.community_comments add column if not exists author_kind text not null default 'player'`;
  await sql`alter table public.community_comments add column if not exists verified boolean not null default false`;

  schemaReady = true;
}

async function ensureTodayWorldPosts() {
  const sql = getCommunityDb();

  if (!sql) {
    return;
  }

  const posts = getVisibleWorldPosts();

  for (const post of posts) {
    const rows = await sql<{ id: string }[]>`
      insert into community_posts (
        id,
        title,
        excerpt,
        category,
        author,
        author_kind,
        verified,
        image,
        image_path,
        body,
        tone,
        size,
        base_likes,
        created_at
      )
      values (
        ${post.id},
        ${post.title},
        ${post.excerpt},
        ${post.category},
        ${post.author},
        ${post.authorKind || "system"},
        ${Boolean(post.verified)},
        ${post.image},
        ${null},
        ${post.body},
        ${post.tone},
        ${post.size},
        ${post.likes},
        ${post.createdAt}
      )
      on conflict (id) do update set
        author_kind = excluded.author_kind,
        verified = excluded.verified,
        base_likes = greatest(community_posts.base_likes, excluded.base_likes)
      returning id
    `;

    await ensureWorldComments(post.id);
  }
}

async function ensureWorldComments(postId: string) {
  const sql = getCommunityDb();

  if (!sql || !isWorldPostId(postId)) {
    return;
  }

  for (const comment of getWorldPostComments(postId)) {
    await sql`
      insert into community_comments (
        id,
        post_id,
        author,
        author_kind,
        verified,
        body,
        created_at
      )
      values (
        ${comment.id},
        ${postId},
        ${comment.author},
        ${comment.authorKind || "system"},
        ${Boolean(comment.verified)},
        ${comment.body},
        ${comment.createdAt}
      )
      on conflict (id) do nothing
    `;
  }
}

function normalizeCommunityImage(image: NonNullable<CommunityPostInput["image"]>) {
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    throw new CommunityError("只支持 jpg、png、webp 图片");
  }

  if (!image.dataUrl.startsWith(`data:${image.type};base64,`)) {
    throw new CommunityError("图片数据无效");
  }

  const buffer = dataUrlToBuffer(image.dataUrl);

  if (buffer.byteLength > COMMUNITY_IMAGE_MAX_BYTES) {
    throw new CommunityError("图片不能超过 1MB");
  }

  return image.dataUrl;
}

async function normalizeAndUploadCommunityImage(image: NonNullable<CommunityPostInput["image"]>, postId: string) {
  normalizeCommunityImage(image);

  if (!isR2Configured()) {
    throw new CommunityError("R2 存储未配置，暂时不能上传图片", 503);
  }

  try {
    return await uploadCommunityImageToR2({
      dataUrl: image.dataUrl,
      type: image.type,
      name: image.name,
      postId
    });
  } catch (error) {
    console.error("community image r2 upload error", error);
    throw new CommunityError("图片上传失败，请稍后再试", 500);
  }
}

function rateKey(request: Request, action: "post" | "comment", windowMs: number) {
  const identity = getIdentityHash(request);
  const bucket = Math.floor(Date.now() / windowMs);
  return `${action}:${identity}:${bucket}`;
}

function getIdentityHash(request: Request) {
  const clientId = request.headers.get("x-community-client-id") || "";
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const ua = request.headers.get("user-agent") || "";

  return createHash("sha256").update(`${clientId}:${ip}:${ua}`).digest("hex").slice(0, 32);
}

function isAdminAuthorRequest(request: Request) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_DELETE_PASSWORD && password === process.env.ADMIN_DELETE_PASSWORD);
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

function communityImageUrl(imagePath: string) {
  return `/api/community/images/${imagePath.split("/").pop()}`;
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

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
