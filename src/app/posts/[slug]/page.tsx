import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, getPost } from "@/lib/content";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/posts/${post.slug}`
    },
    openGraph: {
      title: `${post.title} | 呗果`,
      description: post.excerpt,
      url: `https://exoring.fun/posts/${post.slug}`,
      images: [{ url: post.image }]
    }
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar />
        <article className="post-detail">
          <Link href="/" className="back-link">
            ← 返回发现
          </Link>
          <div className="detail-hero">
            <Image
              src={post.image}
              alt=""
              width={1200}
              height={680}
              sizes="(max-width: 900px) 92vw, 74vw"
              className="detail-image"
              priority
            />
            <div className="detail-title">
              <span>{post.category}</span>
              <h1>{post.title}</h1>
              <p>{post.excerpt}</p>
            </div>
          </div>
          <div className="detail-meta">
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>{post.likes} ♥</span>
          </div>
          <div className="detail-body">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </section>
    </BrowserShell>
  );
}
