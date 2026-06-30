import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, seeAll, children }: { eyebrow?: string; title: string; seeAll?: { to: string; search?: any }; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && <div className="text-xs tracking-[0.3em] text-terracotta font-semibold">{eyebrow}</div>}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso mt-1">{title}</h2>
        {children}
      </div>
      {seeAll && (
        <Link to={seeAll.to as any} search={seeAll.search as any} className="text-sm font-semibold text-terracotta hover:underline whitespace-nowrap">
          See All →
        </Link>
      )}
    </div>
  );
}
