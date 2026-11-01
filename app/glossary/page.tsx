import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { getCompare } from "@/lib/compares";
import { getFlow } from "@/lib/flows";
import { glossary } from "@/lib/glossary";
import { pageMetadata, ROUTE_META } from "@/lib/seo";
import { getSpec } from "@/lib/specs";
import Link from "next/link";

export const metadata = pageMetadata(ROUTE_META.glossary);

export default function GlossaryPage() {
  return (
    <PageShell>
      <PageKicker>Glossary</PageKicker>
      <PageTitle>Words this landscape overloads</PageTitle>
      <PageLead>
        Each term links to the spec or flow that defines it. On the boards, a
        token is a pass, a signature is a wax seal, Bearer is a photocopy, and
        DPoP is a pass glued to a key.
      </PageLead>
      <dl className="mt-8 divide-y divide-border/70 rounded-xl border border-border/80">
        {glossary.map((term) => (
          <div
            key={term.term}
            id={term.term}
            className="scroll-mt-20 px-4 py-5 md:px-5"
          >
            <dt className="font-heading text-lg">{term.term}</dt>
            <dd className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {term.definition}
            </dd>
            {term.seeAlso?.length || term.seeFlows?.length || term.seeCompares?.length ? (
              <dd className="mt-3 flex flex-wrap gap-2">
              {term.seeAlso?.map((slug) => {
                const spec = getSpec(slug);
                return (
                  <Link
                    key={`spec-${slug}`}
                    href={`/specs/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary/50"
                  >
                    <span className="uppercase tracking-wider text-brass">
                      Spec
                    </span>
                    {spec?.shortName ?? slug}
                  </Link>
                );
              })}
              {term.seeFlows?.map((slug) => {
                const flow = getFlow(slug);
                return (
                  <Link
                    key={`flow-${slug}`}
                    href={`/flows/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary/50"
                  >
                    <span className="uppercase tracking-wider text-brass">
                      Flow
                    </span>
                    {flow?.title ?? slug}
                  </Link>
                );
              })}
              {term.seeCompares?.map((slug) => {
                const view = getCompare(slug);
                return (
                  <Link
                    key={`compare-${slug}`}
                    href={`/compare/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary/50"
                  >
                    <span className="uppercase tracking-wider text-brass">
                      Compare
                    </span>
                    {view?.title ?? slug}
                  </Link>
                );
              })}
            </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
