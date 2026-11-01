import Link from "next/link";
import { notFound } from "next/navigation";
import { SequencePlayer } from "@/components/animations/sequence-player";
import { PageKicker, PageShell } from "@/components/page-shell";
import { SequenceList } from "@/components/sequence-list";
import { animationFromFlow } from "@/lib/animations";
import { flows, getFlow } from "@/lib/flows";
import { patternsForFlow } from "@/lib/related";
import { flowPageTitle, pageMetadata } from "@/lib/seo";
import { getSpec } from "@/lib/specs";

export function generateStaticParams() {
  return flows.map((flow) => ({ slug: flow.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const flow = getFlow(slug);
  if (!flow) return { title: "Not found" };
  return pageMetadata({
    title: flowPageTitle(flow.title, flow.protocol),
    description: flow.summary,
    path: `/flows/${flow.slug}`,
  });
}

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const flow = getFlow(slug);
  if (!flow) notFound();
  const relatedPatterns = patternsForFlow(flow.slug);

  return (
    <PageShell>
      <PageKicker>Flow · {flow.pattern}</PageKicker>
      <h1 className="mt-2 max-w-4xl font-heading text-3xl leading-tight md:text-4xl">
        {flow.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        {flow.summary}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Use the hop list beside the stage, or the phase labels, to jump. Every
        hop has Now, Why, the RFC, and chips — none are skipped.
      </p>

      <section className="mt-8">
        <h2 className="font-heading text-lg">Actors</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {flow.actors.join(" · ")}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg">Sequence</h2>
        <div className="mt-4">
          <SequencePlayer
            key={flow.slug}
            sequence={animationFromFlow(flow)}
            share={{
              path: `/flows/${flow.slug}`,
              title: flowPageTitle(flow.title, flow.protocol),
            }}
          />
        </div>
        <h3 className="mt-8 font-heading text-base">Transcript</h3>
        <div className="mt-4">
          <SequenceList steps={flow.steps} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg">Caveats</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {flow.caveats}
        </p>
      </section>

      {flow.detail && flow.detail.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="font-heading text-lg">Why this hop looks this way</h2>
          {flow.detail.map((para, index) => (
            <p
              key={index}
              className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]"
            >
              {para}
            </p>
          ))}
        </section>
      ) : null}

      {flow.alsoSee && flow.alsoSee.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg">Do not confuse with</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {flow.alsoSee.map((slugName) => {
              const other = getFlow(slugName);
              return (
                <li key={slugName}>
                  <Link
                    href={`/flows/${slugName}`}
                    className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                  >
                    {other?.title ?? slugName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {relatedPatterns.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg">Deployment patterns</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedPatterns.map((pattern) => (
              <li key={pattern.slug}>
                <Link
                  href={`/patterns/${pattern.slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                >
                  {pattern.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-heading text-lg">Specs in play</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {flow.specs.map((slugName) => {
            const spec = getSpec(slugName);
            return (
              <li key={slugName}>
                <Link
                  href={`/specs/${slugName}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                >
                  {spec?.shortName ?? slugName}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}
