import Link from "next/link";
import type { ReactNode } from "react";

type BrowserShellProps = {
  children: ReactNode;
};

export function BrowserShell({ children }: BrowserShellProps) {
  return (
    <main className="site-shell">
      <div className="browser-chrome" aria-label="呗果站点框架">
        <Link className="brand-lockup" href="/" aria-label="回到呗果首页">
          <span className="brand-mark">贝</span>
          <span>
            <strong>呗果</strong>
            <small>异环导航</small>
          </span>
        </Link>

        <div className="address-bar" aria-label="站点地址">
          <span className="address-dot" />
          <span>https://exoring.fun/</span>
        </div>

        <nav className="chrome-nav" aria-label="主导航">
          <Link href="/">发现</Link>
          <Link href="/data">数据</Link>
        </nav>
      </div>

      <div className="screen-panel">{children}</div>
    </main>
  );
}
