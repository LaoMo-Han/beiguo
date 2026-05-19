import { AdminCommunityPanel } from "@/components/AdminCommunityPanel";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "社区后台",
  description: "呗果社区帖子管理入口。",
  path: "/admin/community",
  noIndex: true
});

export default function AdminCommunityPage() {
  return (
    <BrowserShell>
      <section className="module-detail-page">
        <ModuleSidebar />
        <AdminCommunityPanel />
      </section>
    </BrowserShell>
  );
}
