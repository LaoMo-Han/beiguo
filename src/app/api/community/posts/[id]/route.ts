import { NextResponse } from "next/server";
import { getCommunityPost } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const post = await getCommunityPost(id);

  if (!post) {
    return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
