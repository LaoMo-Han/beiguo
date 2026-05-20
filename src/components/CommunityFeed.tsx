"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdPostCard } from "@/components/AdPostCard";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/content";
import { COMMUNITY_HOME_LIMIT, type CommunityPost } from "@/lib/community-types";

const AD_INSERT_AFTER_INDEX = 8;

type CommunityFeedProps = {
  staticPosts: Post[];
};

export function CommunityFeed({ staticPosts }: CommunityFeedProps) {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const requestSerialRef = useRef(0);

  const loadPosts = useCallback((offset: number) => {
    if (isFetchingRef.current) {
      return () => {};
    }

    let active = true;
    let timedOut = false;
    const requestSerial = requestSerialRef.current + 1;
    requestSerialRef.current = requestSerial;
    isFetchingRef.current = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);
    const isFirstPage = offset === 0;

    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setStatus("");

    fetch(`/api/community/posts?limit=${COMMUNITY_HOME_LIMIT}&offset=${offset}`, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load community posts");
        }

        return response.json();
      })
      .then((payload: { posts?: CommunityPost[]; degraded?: boolean }) => {
        if (!active) {
          return;
        }

        const nextPosts = payload.posts || [];

        setCommunityPosts((current) => (isFirstPage ? nextPosts : [...current, ...nextPosts]));
        setHasMore(!payload.degraded && nextPosts.length === COMMUNITY_HOME_LIMIT);
      })
      .catch((error) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError" && !timedOut)) {
          return;
        }

        setHasMore(false);
        setStatus("社区帖子暂时加载失败");
      })
      .finally(() => {
        window.clearTimeout(timer);

        if (requestSerialRef.current === requestSerial) {
          isFetchingRef.current = false;

          if (active) {
            setIsLoading(false);
            setIsLoadingMore(false);
          }
        }
      });

    return () => {
      active = false;
      window.clearTimeout(timer);
      if (requestSerialRef.current === requestSerial) {
        isFetchingRef.current = false;
      }
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const cancelLoad = loadPosts(0);

    function handleCreated(event: Event) {
      const post = (event as CustomEvent<CommunityPost>).detail;
      setCommunityPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
    }

    window.addEventListener("community-post-created", handleCreated);

    return () => {
      cancelLoad();
      window.removeEventListener("community-post-created", handleCreated);
    };
  }, [loadPosts]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || !hasMore || isLoading || isLoadingMore || communityPosts.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadPosts(communityPosts.length);
        }
      },
      { rootMargin: "360px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [communityPosts.length, hasMore, isLoading, isLoadingMore, loadPosts]);

  const posts = useMemo(() => (communityPosts.length > 0 ? communityPosts : isLoading ? [] : staticPosts), [communityPosts, isLoading, staticPosts]);

  return (
    <section className="discover-posts is-primary" aria-label="发现文章">
      <div className="section-title-row">
        <h2 className="visually-hidden">发现文章</h2>
        <span>{posts.length} 篇</span>
      </div>
      {isLoading ? <FeedRefreshUi /> : null}
      {status ? <p className="feed-status">{status}</p> : null}
      <div className="masonry-feed">
        {posts.map((post, index) => {
          const postKey = "id" in post ? post.id : post.slug;

          return (
            <Fragment key={postKey}>
              <PostCard post={post} />
              {index === AD_INSERT_AFTER_INDEX ? <AdPostCard /> : null}
            </Fragment>
          );
        })}
      </div>
      <div ref={loadMoreRef} className="feed-load-anchor" aria-hidden="true" />
      {isLoadingMore ? <FeedRefreshUi /> : null}
    </section>
  );
}

function FeedRefreshUi() {
  return (
    <div className="feed-refresh-ui" role="status" aria-live="polite">
      <span className="refresh-spinner" aria-hidden="true" />
    </div>
  );
}
