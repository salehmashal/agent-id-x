import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { SearchPanel } from "@/components/search-panel";

export const metadata = {
  title: "Search",
  description:
    "Client-side search across the bundled agent identity specification catalog.",
};

export default function SearchPage() {
  return (
    <PageShell>
      <PageKicker>Search</PageKicker>
      <PageTitle>Find a draft, RFC, or overloaded word</PageTitle>
      <PageLead>
        All content is bundled in TypeScript modules. Search does not call a
        network. Try “MCP host”, “sidecar”, “p2p”, or “person server”. If
        this page is empty, type a query — there is no loading spinner because
        there is nothing to fetch.
      </PageLead>
      <div className="mt-8 max-w-3xl">
        <SearchPanel autoFocus />
      </div>
    </PageShell>
  );
}
