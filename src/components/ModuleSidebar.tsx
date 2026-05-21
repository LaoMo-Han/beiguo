import Link from "next/link";

import { allModules } from "@/lib/content";

type ModuleSidebarProps = {
  activeSlug?: string;
  locale?: "zh" | "en";
};

export function ModuleSidebar({ activeSlug = "discover", locale = "zh" }: ModuleSidebarProps) {
  const isEnglish = locale === "en";

  return (
    <aside className="module-sidebar" aria-label={isEnglish ? "Content categories" : "内容分类"}>
      {allModules.filter((module) => module.slug === "discover").map((module) => {
        const href = module.slug === "discover" ? (isEnglish ? "/en" : "/") : `/modules/${module.slug}`;
        const isCurrent = module.slug === activeSlug;
        const itemClassName = `module-sidebar-item ${isCurrent ? "is-current" : ""}`;
        const label = isEnglish && module.slug === "discover" ? "Discover" : module.name;

        return (
          <div className="module-sidebar-group" key={module.slug}>
            <Link className={itemClassName} href={href}>
              <div className="item-link-area">
                <span>{label}</span>
                <strong>{module.count}</strong>
              </div>
            </Link>
          </div>
        );
      })}
    </aside>
  );
}
