import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityPostDetail } from "@/components/CommunityPostDetail";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, getPost } from "@/lib/content";
import { getCommunityPost, listCommunityComments } from "@/lib/community-store";
import { absoluteUrl, englishSiteName, siteName } from "@/lib/seo";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generatePostMetadata(slug, "zh");
}

export async function generatePostMetadata(slug: string, locale: "zh" | "en"): Promise<Metadata> {
  const post = getPost(slug) || (slug.startsWith("community-") ? await getCommunityPost(slug.replace("community-", "")) : null);

  if (!post) {
    return {};
  }

  const pathPrefix = locale === "en" ? "/en" : "";
  const path = "id" in post ? `${pathPrefix}/posts/community-${post.id}` : `${pathPrefix}/posts/${post.slug}`;
  const currentSiteName = locale === "en" ? englishSiteName : siteName;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: `${post.title} | ${currentSiteName}`,
      description: post.excerpt,
      url: absoluteUrl(path),
      siteName: currentSiteName,
      images: [{ url: post.image }],
      locale: locale === "en" ? "en_US" : "zh_CN",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${currentSiteName}`,
      description: post.excerpt,
      images: [post.image]
    }
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} locale="zh" />;
}

export async function PostDetailPage({ slug, locale }: { slug: string; locale: "zh" | "en" }) {
  const staticPost = getPost(slug);
  const communityId = slug.startsWith("community-") ? slug.replace("community-", "") : "";
  const communityPost = staticPost ? null : communityId ? await getCommunityPost(communityId) : null;
  const post = staticPost || communityPost;

  if (!post) {
    notFound();
  }

  const comments = communityPost ? await listCommunityComments(communityPost.id) : [];
  const browserImage = post.image.startsWith("http") || post.image.startsWith("data:");
  const isEnglish = locale === "en";

  return (
    <BrowserShell locale={locale}>
      <section className="module-detail-page">
        <ModuleSidebar locale={locale} />
        <article className="post-detail">
          <Link href={isEnglish ? "/en" : "/"} className="back-link">
            {isEnglish ? "← Back to Discover" : "← 返回发现"}
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
              {post.verified && post.authorAvatar ? (
                <img src={post.authorAvatar} alt={isEnglish ? `${post.author} verified avatar` : `${post.author}认证头像`} className="verified-avatar" />
              ) : null}
            </span>
            <span>{"createdAt" in post ? new Date(post.createdAt).toLocaleString(isEnglish ? "en-US" : "zh-CN") : post.date}</span>
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
