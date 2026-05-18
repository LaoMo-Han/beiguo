import { NextResponse } from "next/server";
import { CommunityError, getCommunityImage } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ name: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { name } = await params;
    const result = await getCommunityImage(name);

    return new Response(result.stream, {
      headers: {
        "content-type": result.blob.contentType,
        "cache-control": "public, max-age=300"
      }
    });
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "图片读取失败" }, { status: 500 });
  }
}
