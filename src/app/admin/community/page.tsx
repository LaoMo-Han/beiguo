import { AdminCommunityPanel } from "@/components/AdminCommunityPanel";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";

export const dynamic = "force-dynamic";

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
