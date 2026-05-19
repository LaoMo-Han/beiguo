import { NextResponse } from "next/server";
import { COMMUNITY_HOME_LIMIT } from "@/lib/community-types";
import { CommunityError, createCommunityPost, listCommunityPosts } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || COMMUNITY_HOME_LIMIT);
  const offset = Number(searchParams.get("offset") || 0);
  const safeLimit = Number.isFinite(limit) ? limit : COMMUNITY_HOME_LIMIT;
  const safeOffset = Number.isFinite(offset) ? offset : 0;

  try {
    const posts = await withTimeout(listCommunityPosts(safeLimit, safeOffset), 6000);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("community posts fallback", error);

    return NextResponse.json({
      posts: [],
      degraded: true
    });
  }
}

export async function POST(request: Request) {
  try {
    const post = await createCommunityPost(await request.json(), request);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return communityErrorResponse(error);
  }
}

function communityErrorResponse(error: unknown) {
  if (error instanceof CommunityError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("community post error", error);

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发帖失败，请稍后再试" },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "发帖失败，请稍后再试" }, { status: 500 });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("社区帖子读取超时")), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
