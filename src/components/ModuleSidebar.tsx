import Link from "next/link";

import { allModules } from "@/lib/content";

type ModuleSidebarProps = {
  activeSlug?: string;
};

export function ModuleSidebar({ activeSlug = "discover" }: ModuleSidebarProps) {
  return (
    <aside className="module-sidebar" aria-label="内容分类">
      {allModules.filter((module) => module.slug === "discover").map((module) => {
        const href = module.slug === "discover" ? "/" : `/modules/${module.slug}`;
        const isCurrent = module.slug === activeSlug;
        const itemClassName = `module-sidebar-item ${isCurrent ? "is-current" : ""}`;

        return (
          <div className="module-sidebar-group" key={module.slug}>
            <Link className={itemClassName} href={href}>
              <div className="item-link-area">
                <span>{module.name}</span>
                <strong>{module.count}</strong>
              </div>
            </Link>
          </div>
        );
      })}
    </aside>
  );
}
