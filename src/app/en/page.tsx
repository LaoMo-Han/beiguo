import { redirect } from "next/navigation";
import { BrowserShell } from "@/components/BrowserShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { allPosts, moduleEntryPosts } from "@/lib/content";
import { englishDescription, englishSiteName, englishTitle, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: englishTitle,
  description: englishDescription,
  path: "/en",
  locale: "en_US",
  siteName: englishSiteName,
  keywords: [
    "Neverness to Everness",
    "NTE guide",
    "Neverness to Everness characters",
    "Neverness to Everness tier list",
    "Neverness to Everness gear",
    "Arc Disc guide",
    "cassette set guide",
    "drive block guide",
    "Yihuan guide",
    "Exoring",
    "Beiguo"
  ]
});

type EnglishHomeProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function EnglishHome({ searchParams }: EnglishHomeProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (query) {
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <BrowserShell locale="en">
      <section className="home-grid">
        <ModuleSidebar activeSlug="discover" locale="en" />

        <section className="feed-zone">
          <CommunityFeed staticPosts={[...moduleEntryPosts, ...allPosts]} locale="en" />
        </section>
      </section>
    </BrowserShell>
  );
}
