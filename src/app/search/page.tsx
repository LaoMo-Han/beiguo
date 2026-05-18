import Link from "next/link";
import { BrowserShell } from "@/components/BrowserShell";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { listCommunityPosts } from "@/lib/community-store";
import { searchAllContent, type SearchResult, type SearchResultType } from "@/lib/search";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const GROUPS: SearchResultType[] = ["帖子", "角色", "装备", "模块"];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const communityPosts = await safeCommunityPosts();
  const search = searchAllContent(query, communityPosts);

  return (
    <BrowserShell searchQuery={query}>
      <section className="module-detail-page">
        <ModuleSidebar activeSlug="discover" />

        <article className="module-detail-main">
          <section className="module-detail-hero search-hero">
            <p className="eyebrow">SITE SEARCH</p>
            <h1>站内搜索</h1>
            {query ? (
              <p>
                “{query}” 找到 {search.total} 条相关内容。
              </p>
            ) : (
              <p>输入角色、装备、帖子或模块名称，快速跳到对应内容。</p>
            )}
          </section>

          {!query ? (
            <section className="detail-section search-empty">
              <h2>开始搜索</h2>
              <p>试试搜索“配队模板”“娜娜莉”“弧盘”“强度榜”。</p>
            </section>
          ) : search.total === 0 ? (
            <section className="detail-section search-empty">
              <h2>没有找到相关内容</h2>
              <p>换一个更短的关键词再试试。</p>
            </section>
          ) : (
            GROUPS.map((group) =>
              search.grouped[group].length > 0 ? (
                <SearchGroup group={group} results={search.grouped[group]} key={group} />
              ) : null
            )
          )}
        </article>
      </section>
    </BrowserShell>
  );
}

function SearchGroup({ group, results }: { group: SearchResultType; results: SearchResult[] }) {
  return (
    <section className="detail-section search-group">
      <div className="section-title-row">
        <h2>{group}</h2>
        <span>{results.length} 条</span>
      </div>
      <div className="search-result-list">
        {results.map((result) => (
          <Link href={result.href} className="search-result-card" key={`${result.type}-${result.href}-${result.title}`}>
            <span>{result.source}</span>
            <strong>{result.title}</strong>
            <p>{result.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function safeCommunityPosts() {
  try {
    return await listCommunityPosts(50);
  } catch {
    return [];
  }
}
