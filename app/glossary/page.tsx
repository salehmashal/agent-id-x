import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { glossary } from "@/lib/glossary";
import { getSpec } from "@/lib/specs";
import Link from "next/link";

export const metadata = {
  title: "Glossary",
  description:
    "Definitions for overloaded agent identity terms: p2p, act, person server, bearer, MCP, AAuth.",
};

export default function GlossaryPage() {
  return (
    <PageShell>
      <PageKicker>Glossary</PageKicker>
      <PageTitle>Words this landscape overloads</PageTitle>
      <PageLead>
        “Agent”, “p2p”, “token”, and even “authorization server” do not mean
        the same thing in every room. These definitions match how the bundled
        specs use them. On the boards, a token is a pass, a signature is a wax
        seal, Bearer is a photocopy, and DPoP is a pass glued to a key.
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
            {term.seeAlso && term.seeAlso.length > 0 ? (
              <dd className="mt-3 flex flex-wrap gap-2">
                {term.seeAlso.map((slug) => {
                  const spec = getSpec(slug);
                  return (
                    <Link
                      key={slug}
                      href={`/specs/${slug}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {spec?.shortName ?? slug}
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
