"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { searchAll, type SearchHit } from "@/lib/search";

const kindLabel: Record<SearchHit["kind"], string> = {
  spec: "Spec",
  flow: "Flow",
  compare: "Compare",
  glossary: "Glossary",
  pattern: "Pattern",
};

export function SearchPanel({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const hits = useMemo(() => searchAll(query), [query]);
  const searching = query.trim().length > 0;
  const empty = searching && hits.length === 0;

  return (
    <div className="space-y-4">
      <Input
        value={query}
        autoFocus={autoFocus}
        placeholder="AAuth, MCP host, sidecar, p2p, DPoP, person server…"
        aria-label="Search the landscape"
        onChange={(event) => setQuery(event.target.value)}
      />
      {!searching ? (
        <p className="text-sm text-muted-foreground">
          Client-side search over the bundled catalog, deployment patterns,
          flows, comparisons, and glossary. Nothing leaves this page.
        </p>
      ) : null}
      {empty ? (
        <div
          role="status"
          className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground"
        >
          No matches for “{query.trim()}”. Try a draft id, RFC number, a
          deployment word such as MCP host or sidecar, or a role name such as
          person server.
        </div>
      ) : null}
      {searching && hits.length > 0 ? (
        <ul className="divide-y divide-border/70 rounded-lg border border-border/80">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.href}-${hit.title}`}>
              <Link
                href={hit.href}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-muted/40 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span>
                  <span className="font-heading">{hit.title}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {hit.subtitle}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
                  {kindLabel[hit.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
