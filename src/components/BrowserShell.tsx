import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type BrowserShellProps = {
  children: ReactNode;
};

export function BrowserShell({ children }: BrowserShellProps) {
  return (
    <main className="site-shell">
      <div className="browser-chrome" aria-label="呗果站点框架">
        <Link className="brand-lockup" href="/" aria-label="回到呗果首页">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/assets/beiguo-icon.svg" alt="" width={44} height={44} priority />
          </span>
          <span>
            <strong>呗果</strong>
            <small>异环导航</small>
          </span>
        </Link>

        <form id="site-search" className="address-bar" action="/" role="search" aria-label="站内搜索">
          <span className="address-dot" />
          <input name="q" type="search" aria-label="输入搜索内容" placeholder="exoring.fun" />
        </form>

        <nav className="chrome-nav" aria-label="主导航">
          <button type="submit" form="site-search">
            搜索
          </button>
          <button type="button" className="post-action">
            发帖
          </button>
        </nav>
      </div>

      <div className="screen-panel">{children}</div>
    </main>
  );
}
