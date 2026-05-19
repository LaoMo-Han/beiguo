import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/content";
import type { CommunityPost } from "@/lib/community-types";

type PostCardProps = {
  post: Post | CommunityPost;
};

export function PostCard({ post }: PostCardProps) {
  const href = "id" in post ? `/posts/community-${post.id}` : post.href ?? `/posts/${post.slug}`;
  const likes = typeof post.likes === "number" ? post.likes.toLocaleString("zh-CN") : post.likes;
  const isModuleEntry = !("id" in post) && post.href?.startsWith("/modules/");
  const isWorldPost = Boolean(post.verified && post.authorKind && post.authorKind !== "player");
  const browserImage = post.image.startsWith("http") || post.image.startsWith("data:");

  return (
    <article className={`post-card tone-${post.tone} card-${post.size} ${isWorldPost ? `world-post author-${post.authorKind}` : ""}`}>
      <Link href={href} className="card-image-link" aria-label={post.title}>
        {browserImage ? (
          <img src={post.image} alt="" className="card-image" />
        ) : (
          <Image
            src={post.image}
            alt=""
            width={720}
            height={520}
            sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 24vw"
            className="card-image"
          />
        )}
        <span className="card-category">{post.category}</span>
      </Link>
      <div className="card-copy">
        <Link href={href} className="card-title">
          {post.title}
        </Link>
        <p>{post.excerpt}</p>
        <footer className="card-meta">
          <span className="author-chip">
            {post.author}
            {post.verified ? <span className="verified-badge" aria-label="官方认证">呗</span> : null}
          </span>
          <span className="likes">{isModuleEntry ? likes : `${likes} ♥`}</span>
        </footer>
      </div>
    </article>
  );
}
