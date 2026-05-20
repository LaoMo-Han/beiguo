"use client";

const AD_CONTAINER_ID = "container-e3059178ce63a29aba4483acf9a8f29d";
const AD_SCRIPT_SRC = "https://pl29499268.effectivecpmnetwork.com/e3059178ce63a29aba4483acf9a8f29d/invoke.js";
const AD_FRAME_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
    <style>
      html,
      body {
        width: 100%;
        min-height: 100%;
        margin: 0;
        overflow: hidden;
        background: transparent;
      }

      #${AD_CONTAINER_ID} {
        width: 100%;
        min-height: 100%;
      }
    </style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="${AD_SCRIPT_SRC}"></script>
    <div id="${AD_CONTAINER_ID}"></div>
  </body>
</html>`;

export function AdPostCard() {
  return (
    <article className="post-card tone-cream card-short author-ad ad-post-card" aria-label="兰德瑞克香氛广告">
      <div className="ad-card-frame">
        <span className="card-category">广告</span>
        <iframe
          className="ad-network-frame"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          srcDoc={AD_FRAME_HTML}
          title="兰德瑞克香氛广告"
        />
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
