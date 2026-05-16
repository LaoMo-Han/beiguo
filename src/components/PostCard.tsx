import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/content";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={`post-card tone-${post.tone} card-${post.size}`}>
      <Link href={`/posts/${post.slug}`} className="card-image-link" aria-label={post.title}>
        <Image
          src={post.image}
          alt=""
          width={720}
          height={520}
          sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 24vw"
          className="card-image"
        />
        <span className="card-category">{post.category}</span>
      </Link>
      <div className="card-copy">
        <Link href={`/posts/${post.slug}`} className="card-title">
          {post.title}
        </Link>
        <p>{post.excerpt}</p>
        <footer className="card-meta">
          <span className="author-chip">{post.author}</span>
          <span className="likes">{post.likes} ♥</span>
        </footer>
      </div>
    </article>
  );
}
