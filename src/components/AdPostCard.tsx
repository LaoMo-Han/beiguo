"use client";

import Script from "next/script";

const AD_CONTAINER_ID = "container-e3059178ce63a29aba4483acf9a8f29d";
const AD_SCRIPT_SRC = "https://pl29499268.effectivecpmnetwork.com/e3059178ce63a29aba4483acf9a8f29d/invoke.js";

export function AdPostCard() {
  return (
    <article className="post-card tone-cream card-short author-ad ad-post-card" aria-label="兰德瑞克香氛广告">
      <div className="ad-card-frame">
        <span className="card-category">广告</span>
        <Script id="effectivecpm-home-card" async data-cfasync="false" src={AD_SCRIPT_SRC} strategy="afterInteractive" />
        <div id={AD_CONTAINER_ID} className="ad-network-slot" />
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
