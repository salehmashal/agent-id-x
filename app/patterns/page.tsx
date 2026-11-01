import Link from "next/link";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { PatternMatrix } from "@/components/pattern-matrix";
import { PatternPicker } from "@/components/pattern-picker";
import { PatternSection } from "@/components/pattern-section";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import {
  PATTERN_COUNT,
  patternScopeNotes,
  patterns,
  resolveSpec,
} from "@/lib/patterns";
import { pageMetadata, ROUTE_META } from "@/lib/seo";
import { RESEARCH_AS_OF } from "@/lib/types";

export const metadata = pageMetadata(ROUTE_META.patterns);

export default function PatternsPage() {
  return (
    <PageShell>
      <PageKicker>Deployment · runtime shape</PageKicker>
      <PageTitle>How the agent is deployed, and which protocols apply</PageTitle>
      <PageLead>
        The matrix is the map: runtime shape on the rows, the questions that
        decide a protocol on the columns. Sequences live under{" "}
        <Link
          href="/flows"
          className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          Flows
        </Link>
        . {PATTERN_COUNT} patterns, researched {RESEARCH_AS_OF}. The picker
        below names the row — it does not score you.
      </PageLead>

      <div className="mt-6">
        <ShareBar path="/patterns" title={ROUTE_META.patterns.title} />
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Overview matrix</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Is a user in the loop? Is an authorization server minting the
          credential? Does a workload identity name the binary? Does the agent
          have an identity that is not an AS-local{" "}
          <span className="font-mono text-xs">client_id</span>? Each row is a
          tiny topology. Protocol names link into the catalog.
        </p>
        <div className="mt-6">
          <PatternMatrix patterns={patterns} />
        </div>
      </section>

      <div className="mt-12">
        <PatternPicker />
      </div>

      <div className="mt-12">
        <FourCousinsBoard />
      </div>

      <nav aria-label="Pattern sections" className="mt-12">
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
