import Link from "next/link";
import { BrowserShell } from "@/components/BrowserShell";

export default function NotFound() {
  return (
    <BrowserShell>
      <section className="empty-state">
        <p className="eyebrow">404</p>
        <h1>这条情报暂时失联</h1>
        <p>可能是静态内容还没有收录，先回发现页看看最新整理。</p>
        <Link href="/">返回首页</Link>
      </section>
    </BrowserShell>
  );
}
