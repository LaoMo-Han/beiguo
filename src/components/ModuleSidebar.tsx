"use client";

import Link from "next/link";
import { useState } from "react";

import { allModules } from "@/lib/content";

type ModuleSidebarProps = {
  activeSlug?: string;
};

export function ModuleSidebar({ activeSlug = "discover" }: ModuleSidebarProps) {
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(() => new Set());

  function toggleExpanded(slug: string) {
    setExpandedSlugs((current) => {
      const next = new Set(current);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      return next;
    });
  }

  return (
    <aside className="module-sidebar" aria-label="内容分类">
      {allModules.map((module) => {
        const href = module.slug === "discover" ? "/" : `/modules/${module.slug}`;
        const isCurrent = module.slug === activeSlug;
        const hasChildren = !!module.children;
        const isExpanded = expandedSlugs.has(module.slug);
        const itemClassName = `module-sidebar-item ${isCurrent ? "is-current" : ""} ${
          hasChildren ? "has-children" : ""
        }`;

        return (
          <div className="module-sidebar-group" key={module.slug}>
            {hasChildren ? (
              <button
                aria-expanded={isExpanded}
                className={itemClassName}
                onClick={() => toggleExpanded(module.slug)}
                type="button"
              >
                <div className="item-link-area">
                  <span>{module.name}</span>
                </div>
                <span className="toggle-indicator" aria-hidden="true">
                  ↓
                </span>
              </button>
            ) : (
              <Link className={itemClassName} href={href}>
                <div className="item-link-area">
                  <span>{module.name}</span>
                  <strong>{module.count}</strong>
                </div>
              </Link>
            )}

            {hasChildren && isExpanded ? (
              <div className="module-sidebar-children" aria-label={`${module.name}子类别`}>
                {module.children?.map((child) => (
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
