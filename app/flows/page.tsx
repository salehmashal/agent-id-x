import Link from "next/link";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { flows } from "@/lib/flows";

export const metadata = {
  title: "Flows",
  description:
    "Sequence-style explanations of user-delegated, p2p, MCP, A2A, on-behalf-of, and CIBA agent patterns.",
};

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
        Sequence-style walkthroughs of the patterns that show up in design
        reviews: user-delegated API calls, AAuth p2p modes, MCP as an OAuth
        client, A2A, on-behalf-of chaining, CIBA, and workload-plus-user. For
        the other cut — how the agent is deployed, and which protocols attach to
        that runtime — see{" "}
        <Link
          href="/patterns"
          className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          deployment patterns
        </Link>
        .
      </PageLead>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {flows.map((flow) => (
          <li key={flow.slug}>
            <Link
              href={`/flows/${flow.slug}`}
            className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
                {patternLabel[flow.pattern]}
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
