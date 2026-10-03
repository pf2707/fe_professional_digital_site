"use client";

import { useState } from "react";
import type { Profile } from "@/lib/profile";

const GROUPS = [
  { key: "ai", label: "AI & Agents" },
  { key: "mobile", label: "Mobile Apps" },
] as const;

export function Projects({
  projects,
  featuredPerGroup,
}: {
  projects: Profile["projects"];
  featuredPerGroup: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = GROUPS.some(
    (g) => projects.filter((p) => p.category === g.key).length > featuredPerGroup,
  );

  return (
    <>
      {GROUPS.map((group) => {
        const items = projects.filter((p) => p.category === group.key);
        if (items.length === 0) return null;
        const shown = expanded ? items : items.slice(0, featuredPerGroup);

        return (
          <div className="proj-group" key={group.key}>
            <h3 className="proj-group-title">
              {group.label} <span>({items.length})</span>
            </h3>
            <div className="proj-grid">
              {shown.map((p) => (
                <div className="proj-card" key={p.name}>
                  <div className="proj-thumb">{p.icon}</div>
                  <div className="proj-body">
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="proj-more">
          <button
            className="btn btn-ghost"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : `View all projects (${projects.length})`}
          </button>
        </div>
      )}
    </>
  );
}
