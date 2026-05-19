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
    const image = await getCommunityImage(name);

    return new Response(image.body, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": image.contentType
      }
    });
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "图片读取失败" }, { status: 500 });
  }
}
