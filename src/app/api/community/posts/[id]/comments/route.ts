import { NextResponse } from "next/server";
import {
  CommunityError,
  createCommunityComment,
  listCommunityComments
} from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const comments = await listCommunityComments(id);

  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const comment = await createCommunityComment(id, await request.json(), request);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
