import { NextResponse } from "next/server";
import { COMMUNITY_HOME_LIMIT } from "@/lib/community-types";
import { CommunityError, createCommunityPost, listCommunityPosts } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || COMMUNITY_HOME_LIMIT);
  const posts = await listCommunityPosts(Number.isFinite(limit) ? limit : COMMUNITY_HOME_LIMIT);

  return NextResponse.json({ posts });
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

  return NextResponse.json({ error: "发帖失败，请稍后再试" }, { status: 500 });
}
