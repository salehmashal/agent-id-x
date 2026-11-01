import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { pageMetadata, ROUTE_META } from "@/lib/seo";
import { SPEC_COUNT } from "@/lib/specs";

export const metadata = pageMetadata(ROUTE_META.catalog);

export default function CatalogPage() {
  return (
    <PageShell>
      <PageKicker>Catalog</PageKicker>
      <PageTitle>Every document in this map</PageTitle>
      <PageLead>
        {SPEC_COUNT} specifications and protocols. Filter by status (RFC vs
        draft vs related protocol), layer (identity / authentication /
        authorization), and whether the work is foundation, agent-specific, or
        adjacent. Copy is from primary sources researched 15 September 2026
        and re-checked 1 November 2026.
      </PageLead>

      <Suspense
        fallback={
          <div className="mt-8 h-64 animate-pulse rounded-lg bg-muted/40" />
        }
      >
        <CatalogBrowser />
      </Suspense>
    </PageShell>
  );
}
