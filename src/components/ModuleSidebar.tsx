import Link from "next/link";

import { allModules } from "@/lib/content";

type ModuleSidebarProps = {
  activeSlug?: string;
};

export function ModuleSidebar({ activeSlug = "discover" }: ModuleSidebarProps) {
  return (
    <aside className="module-sidebar" aria-label="内容分类">
      {allModules.map((module) => {
        const href = module.slug === "discover" ? "/" : `/modules/${module.slug}`;
        const isCurrent = module.slug === activeSlug;

        return (
          <div className="module-sidebar-group" key={module.slug}>
            <Link className={isCurrent ? "is-current" : ""} href={href}>
              <span>{module.name}</span>
              <strong>{module.count}</strong>
            </Link>

            {module.children ? (
              <div className="module-sidebar-children" aria-label={`${module.name}子类别`}>
                {module.children.map((child) => (
                  <Link href={`/modules/${module.slug}#${child.slug}`} key={child.slug}>
                    <span>{child.name}</span>
                    <strong>{child.count}</strong>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}
