import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityPostDetail } from "@/components/CommunityPostDetail";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, getPost } from "@/lib/content";
import { getCommunityPost, listCommunityComments } from "@/lib/community-store";
import { absoluteUrl, siteName } from "@/lib/seo";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug) || (slug.startsWith("community-") ? await getCommunityPost(slug.replace("community-", "")) : null);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: "id" in post ? `/posts/community-${post.id}` : `/posts/${post.slug}`
    },
    openGraph: {
      title: `${post.title} | 呗果`,
      description: post.excerpt,
      url: absoluteUrl("id" in post ? `/posts/community-${post.id}` : `/posts/${post.slug}`),
      siteName,
      images: [{ url: post.image }],
      locale: "zh_CN",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | 呗果`,
      description: post.excerpt,
      images: [post.image]
    }
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const staticPost = getPost(slug);
  const communityId = slug.startsWith("community-") ? slug.replace("community-", "") : "";
  const communityPost = staticPost ? null : communityId ? await getCommunityPost(communityId) : null;
  const post = staticPost || communityPost;

  if (!post) {
    notFound();
  }

  const comments = communityPost ? await listCommunityComments(communityPost.id) : [];
  const browserImage = post.image.startsWith("http") || post.image.startsWith("data:");

  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar />
        <article className="post-detail">
          <Link href="/" className="back-link">
            ← 返回发现
          </Link>
          <div className="detail-hero">
            {browserImage ? (
              <img src={post.image} alt="" className="detail-image" />
            ) : (
              <Image
                src={post.image}
                alt=""
                width={1200}
                height={680}
                sizes="(max-width: 900px) 92vw, 74vw"
                className="detail-image"
                priority
              />
            )}
            <div className="detail-title">
              <span>{post.category}</span>
              <h1>{post.title}</h1>
              <p>{post.excerpt}</p>
            </div>
          </div>
          <div className="detail-meta">
            <span>
              {post.author}
              {post.verified && post.authorAvatar ? <img src={post.authorAvatar} alt={`${post.author}认证头像`} className="verified-avatar" /> : null}
            </span>
            <span>{"createdAt" in post ? new Date(post.createdAt).toLocaleString("zh-CN") : post.date}</span>
            <span>{typeof post.likes === "number" ? post.likes.toLocaleString("zh-CN") : post.likes} ♥</span>
          </div>
          <div className="detail-body">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {communityPost ? <CommunityPostDetail post={communityPost} initialComments={comments} /> : null}
        </article>
      </section>
    </BrowserShell>
  );
}
