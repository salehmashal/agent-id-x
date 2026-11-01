import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { SearchPanel } from "@/components/search-panel";
import { pageMetadata, ROUTE_META } from "@/lib/seo";

export const metadata = pageMetadata(ROUTE_META.search);

export default function SearchPage() {
  return (
    <PageShell>
      <PageKicker>Search</PageKicker>
      <PageTitle>Find a draft, RFC, or overloaded word</PageTitle>
      <PageLead>
        Client-side search over the bundled catalog. Try{" "}
        <span className="font-mono text-sm text-foreground">AAuth</span>,{" "}
        <span className="font-mono text-sm text-foreground">PKCE</span>,{" "}
        <span className="font-mono text-sm text-foreground">p2p</span>, or{" "}
        <span className="font-mono text-sm text-foreground">SPIFFE</span>.
        Nothing leaves this page.
      </PageLead>
      <div className="mt-8 max-w-3xl">
        <SearchPanel autoFocus />
      </div>
    </PageShell>
  );
}
