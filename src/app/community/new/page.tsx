import Link from "next/link";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityNewPostForm } from "@/components/CommunityNewPostForm";
import { ModuleSidebar } from "@/components/ModuleSidebar";

export default function NewCommunityPostPage() {
  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug="discover" />
        <article className="post-detail">
          <Link href="/" className="back-link">
            ← 返回发现
          </Link>
          <div className="module-detail-hero">
            <p className="eyebrow">COMMUNITY POST</p>
            <h1>发布新帖子</h1>
            <p>分享攻略、问题或新发现。作者为空会随机生成可爱昵称，类别为空会默认显示为分享。</p>
          </div>
          <CommunityNewPostForm />
        </article>
      </section>
    </BrowserShell>
  );
}
