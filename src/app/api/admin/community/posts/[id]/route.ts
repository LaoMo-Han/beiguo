import { NextResponse } from "next/server";
import { CommunityError, deleteCommunityPost } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const password = request.headers.get("x-admin-password");
    const result = await deleteCommunityPost(id, password);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
