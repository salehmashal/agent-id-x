import Link from "next/link";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { PatternMatrix } from "@/components/pattern-matrix";
import { PatternPicker } from "@/components/pattern-picker";
import { PatternSection } from "@/components/pattern-section";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import {
  PATTERN_COUNT,
  patternScopeNotes,
  patterns,
  resolveSpec,
} from "@/lib/patterns";
import { RESEARCH_AS_OF } from "@/lib/types";

export const metadata = {
  title: "Deployment patterns",
  description:
    "How an AI agent is deployed — browser, MCP host, mesh sidecar, p2p HTTP — and which identity and auth protocols actually apply.",
};

export default function PatternsPage() {
  return (
    <PageShell>
      <PageKicker>Deployment · runtime shape</PageKicker>
      <PageTitle>How the agent is deployed, and which protocols apply</PageTitle>
      <PageLead>
        Sequence diagrams live under{" "}
        <Link
          href="/flows"
          className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          Flows
        </Link>
        . This page is the other cut: the runtime topology — product UI, headless
        worker, MCP host, mesh sidecar, true p2p HTTP — and the specs that
        actually attach to that shape. {PATTERN_COUNT} patterns, researched{" "}
        {RESEARCH_AS_OF}. Drafts are marked; RFC numbers are not invented. If
        you are not sure which row you are on, the picker names the shape — it
        does not score you.
      </PageLead>

      <div className="mt-8">
        <PatternPicker />
      </div>

      <div className="mt-10">
        <FourCousinsBoard />
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Overview matrix</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Rows are deployment patterns. Columns are the questions that decide
          the protocol: is a user in the loop, is an authorization server minting
          the credential, does a workload identity name the binary, and does the
          agent have an identity that is not an AS-local{" "}
          <span className="font-mono text-xs">client_id</span>. Each row is a
          tiny topology of actors. Primary protocol names link into the catalog.
        </p>
        <div className="mt-6">
          <PatternMatrix patterns={patterns} />
        </div>
      </section>

      <nav aria-label="Pattern sections" className="mt-10">
        <h2 className="font-heading text-2xl">Jump to a pattern</h2>
        <ul className="mt-4 columns-1 gap-2 sm:columns-2">
          {patterns.map((pattern) => (
            <li key={pattern.slug} className="break-inside-avoid py-1">
              <Link
                href={`#${pattern.slug}`}
                className="text-sm underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {pattern.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 space-y-8">
        {patterns.map((pattern) => (
          <PatternSection key={pattern.slug} pattern={pattern} />
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-dashed border-border p-5">
        <h2 className="font-heading text-xl">Adjacent, on purpose not a row</h2>
        <ul className="mt-4 space-y-4">
          {patternScopeNotes.map((note) => (
            <li key={note.title}>
              <p className="font-heading text-base">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {note.body}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {note.specSlugs.map((slug) => {
                  const spec = resolveSpec(slug);
                  if (!spec) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/specs/${spec.slug}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {spec.shortName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
