import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { SearchField } from "@/components/SearchField";

type BrowserShellProps = {
  children: ReactNode;
  searchQuery?: string;
  locale?: "zh" | "en";
};

export function BrowserShell({ children, searchQuery = "", locale = "zh" }: BrowserShellProps) {
  const isEnglish = locale === "en";
  const copy = isEnglish
    ? {
        frameLabel: "Beiguo site frame",
        homeLabel: "Go to the Beiguo English homepage",
        brand: "Beiguo",
        tagline: "NTE guide",
        search: "Search",
        post: "Post",
        navLabel: "Primary navigation",
        langHref: "/",
        langLabel: "中",
        langAria: "Switch to Chinese"
      }
    : {
        frameLabel: "呗果站点框架",
        homeLabel: "回到呗果首页",
        brand: "呗果",
        tagline: "异环导航",
        search: "搜索",
        post: "发帖",
        navLabel: "主导航",
        langHref: "/en",
        langLabel: "A",
        langAria: "Switch to English"
      };

  return (
    <main className="site-shell">
      <div className="browser-chrome" aria-label={copy.frameLabel}>
        <Link className="brand-lockup" href={isEnglish ? "/en" : "/"} aria-label={copy.homeLabel}>
          <span className="brand-mark" aria-hidden="true">
            <Image src="/assets/beiguo-icon.svg" alt="" width={44} height={44} priority />
          </span>
          <span>
            <strong>{copy.brand}</strong>
            <small>{copy.tagline}</small>
          </span>
        </Link>

        <SearchField defaultQuery={searchQuery} locale={locale} />

        <nav className="chrome-nav" aria-label={copy.navLabel}>
          <button type="submit" form="site-search">
            {copy.search}
          </button>
          <Link href="/community/new" className="post-action">
            {copy.post}
          </Link>
        </nav>

        <Link href={copy.langHref} className="language-switch" aria-label={copy.langAria} title={copy.langAria}>
          {copy.langLabel}
        </Link>
      </div>

      <div className="screen-panel">{children}</div>
    </main>
  );
}
