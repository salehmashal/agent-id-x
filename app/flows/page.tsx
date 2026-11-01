import Link from "next/link";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import { flows } from "@/lib/flows";
import { pageMetadata, ROUTE_META } from "@/lib/seo";

export const metadata = pageMetadata(ROUTE_META.flows);

const patternLabel: Record<(typeof flows)[number]["pattern"], string> = {
  "user-delegated": "User-delegated",
  p2p: "Peer / p2p",
  "agent-as-client": "Agent as client",
  "agent-as-resource": "Agent as resource",
  "multi-hop": "Multi-hop",
  consent: "Human approval",
};

export default function FlowsIndexPage() {
  return (
    <PageShell>
      <PageKicker>Flows</PageKicker>
      <PageTitle>How an agent actually gets in</PageTitle>
      <PageLead>
        This is where the sequences live. Each page is a full hop-by-hop player:
        phase labels, a hop list you can click, Now / Why / RFC / chips. The map
        at home does not replay them. For the other cut — how the agent is
        deployed, and which protocols attach to that runtime — see{" "}
        <Link
          href="/patterns"
          className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          deployment patterns
        </Link>
        .
      </PageLead>
      <div className="mt-6">
        <ShareBar path="/flows" title={ROUTE_META.flows.title} />
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {flows.map((flow) => (
          <li key={flow.slug}>
            <Link
              href={`/flows/${flow.slug}`}
              className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
                {patternLabel[flow.pattern]}
                <span className="mx-2 opacity-40">·</span>
                {flow.steps.length} hops
              </p>
              <h2 className="mt-2 font-heading text-xl">{flow.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {flow.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
