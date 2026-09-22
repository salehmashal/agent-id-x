import Link from "next/link";
import { notFound } from "next/navigation";
import { AauthModesBoard } from "@/components/explainers/aauth-modes-board";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { Oauth21Board } from "@/components/explainers/oauth-21-board";
import { OidcBoard } from "@/components/explainers/spec-boards";
import { PageKicker, PageShell } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import { compares, getCompare } from "@/lib/compares";
import { getSpec } from "@/lib/specs";

export function generateStaticParams() {
  return compares.map((item) => ({ pair: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const view = getCompare(pair);
  if (!view) return { title: "Not found" };
  return { title: view.title, description: view.subtitle };
}

function CompareExplainer({ slug }: { slug: string }) {
  if (slug === "oauth-2-0-vs-2-1") return <Oauth21Board />;
  if (slug === "oidc-vs-oauth") return <OidcBoard />;
  if (slug === "aauth-vs-oauth") return <AauthModesBoard />;
  if (slug === "delegated-vs-p2p") return <FourCousinsBoard />;
  return null;
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const view = getCompare(pair);
  if (!view) notFound();

  return (
    <PageShell>
      <PageKicker>Compare</PageKicker>
      <h1 className="mt-2 max-w-4xl font-heading text-3xl leading-tight md:text-4xl">
        {view.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        {view.subtitle}
      </p>

      <div className="mt-6">
        <ShareBar
          path={`/compare/${view.slug}`}
          title={view.title}
        />
      </div>

      <div className="mt-8">
        <CompareExplainer slug={view.slug} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/50 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Aspect</th>
              <th className="px-4 py-3 font-medium">{view.leftTitle}</th>
              <th className="px-4 py-3 font-medium">{view.rightTitle}</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={row.aspect} className="border-t border-border/70 align-top">
                <th className="px-4 py-3 font-heading text-foreground">
                  {row.aspect}
                </th>
                <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                  {row.left}
                </td>
                <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                  {row.right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 rounded-xl border border-primary/30 bg-primary/8 p-5">
        <h2 className="font-heading text-lg">Takeaway</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed">{view.takeaway}</p>
      </section>

      {view.fieldNotes && view.fieldNotes.length > 0 ? (
        <section className="mt-10 space-y-6">
          <h2 className="font-heading text-xl">Field notes</h2>
          {view.fieldNotes.map((note) => (
            <article
              key={note.title}
              className="rounded-xl border border-border/80 bg-card/40 p-5"
            >
              <h3 className="font-heading text-lg">{note.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {note.body}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-heading text-lg">Read the specs</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {view.specSlugs.map((slug) => {
            const spec = getSpec(slug);
            return (
              <li key={slug}>
                <Link
                  href={`/specs/${slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                >
                  {spec?.shortName ?? slug}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}
