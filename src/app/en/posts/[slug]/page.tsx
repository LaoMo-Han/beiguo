import type { Metadata } from "next";
import { allPosts } from "@/lib/content";
import { generatePostMetadata, PostDetailPage } from "@/app/posts/[slug]/page";

type EnglishPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: EnglishPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generatePostMetadata(slug, "en");
}

export default async function EnglishPostPage({ params }: EnglishPostPageProps) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} locale="en" />;
}
