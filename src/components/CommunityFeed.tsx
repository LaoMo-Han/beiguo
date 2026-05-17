"use client";

import { useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/content";
import { COMMUNITY_HOME_LIMIT, type CommunityPost } from "@/lib/community-types";

type CommunityFeedProps = {
  staticPosts: Post[];
};

export function CommunityFeed({ staticPosts }: CommunityFeedProps) {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`/api/community/posts?limit=${COMMUNITY_HOME_LIMIT}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { posts?: CommunityPost[] }) => {
        if (active) {
          setCommunityPosts(payload.posts || []);
        }
      })
      .catch(() => {
        if (active) {
          setStatus("社区帖子暂时加载失败");
        }
      });

    function handleCreated(event: Event) {
      const post = (event as CustomEvent<CommunityPost>).detail;
      setCommunityPosts((current) => [post, ...current.filter((item) => item.id !== post.id)].slice(0, COMMUNITY_HOME_LIMIT));
    }

    window.addEventListener("community-post-created", handleCreated);

    return () => {
      active = false;
      window.removeEventListener("community-post-created", handleCreated);
    };
  }, []);

  const posts = useMemo(() => [...communityPosts, ...staticPosts], [communityPosts, staticPosts]);

  return (
    <section className="discover-posts is-primary" aria-label="发现文章">
      <div className="section-title-row">
        <h2 className="visually-hidden">发现文章</h2>
        <span>{posts.length} 篇</span>
      </div>
      {status ? <p className="feed-status">{status}</p> : null}
      <div className="masonry-feed">
        {posts.map((post) => (
          <PostCard post={post} key={"id" in post ? post.id : post.slug} />
        ))}
      </div>
    </section>
  );
}
