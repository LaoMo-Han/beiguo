import { NextResponse } from "next/server";
import { CommunityError, likeCommunityPost } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const result = await likeCommunityPost(id);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "点赞失败" }, { status: 500 });
  }
}
