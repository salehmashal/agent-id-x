"use client";

import { useSearchParams } from "next/navigation";
import { CatalogFilters } from "@/components/catalog-filters";
import { SpecCard } from "@/components/spec-card";
import { filterSpecs } from "@/lib/specs";

function all(params: URLSearchParams, key: string): string[] {
  return params.getAll(key);
}

export function CatalogBrowser() {
  const searchParams = useSearchParams();
  const results = filterSpecs({
    q: searchParams.get("q") ?? undefined,
    status: all(searchParams, "status"),
    layer: all(searchParams, "layer"),
    relevance: all(searchParams, "relevance"),
    stability: all(searchParams, "stability"),
  });

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
      <CatalogFilters resultCount={results.length} />
      <div>
        {results.length === 0 ? (
          <div
            role="status"
            className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground"
          >
            No documents match. Reset the filters or search for an RFC number.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((spec) => (
              <SpecCard key={spec.slug} spec={spec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
