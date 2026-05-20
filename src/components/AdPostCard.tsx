"use client";

import { useEffect, useRef } from "react";

const AD_CONTAINER_ID = "container-e3059178ce63a29aba4483acf9a8f29d";
const AD_SCRIPT_SRC = "https://pl29499268.effectivecpmnetwork.com/e3059178ce63a29aba4483acf9a8f29d/invoke.js";

export function AdPostCard() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const script = document.createElement("script");
    const container = document.createElement("div");

    script.async = true;
    script.setAttribute("async", "async");
    script.setAttribute("data-cfasync", "false");
    script.src = AD_SCRIPT_SRC;

    container.id = AD_CONTAINER_ID;
    container.className = "ad-network-slot";

    host.replaceChildren(script, container);

    return () => {
      host.replaceChildren();
    };
  }, []);

  return (
    <article className="post-card tone-cream card-short author-ad ad-post-card" aria-label="兰德瑞克香氛广告">
      <div className="ad-card-frame">
        <span className="card-category">广告</span>
        <div ref={hostRef} className="ad-network-host" />
      </div>
      <div className="card-copy ad-card-copy">
        <span className="card-title">兰德瑞克香氛赞助位</span>
        <p>今日城市频道合作推荐。</p>
        <footer className="card-meta">
          <span className="author-chip">兰德瑞克香氛</span>
          <span className="likes">AD</span>
        </footer>
      </div>
    </article>
  );
}
