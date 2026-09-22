import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpecExplainer, isMainExplainerSpec } from "@/components/explainers/spec-explainer";
import { PageKicker, PageShell } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import { SpecDeepDiveGuide } from "@/components/spec-deep-dive";
import {
  LayerBadge,
  RelevanceBadge,
  StabilityBadge,
  StatusBadge,
} from "@/components/spec-badges";
import { Badge } from "@/components/ui/badge";
import { getSpec, relatedSpecs, specs } from "@/lib/specs";

export function generateStaticParams() {
  return specs.map((spec) => ({ slug: spec.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spec = getSpec(slug);
  if (!spec) return { title: "Not found" };
  return {
    title: `${spec.shortName} (${spec.id})`,
    description: spec.whyAgentCares,
  };
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl">{title}</h2>
      <div className="mt-3 max-w-3xl text-[15px] leading-7 text-foreground/85 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default async function SpecDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spec = getSpec(slug);
  if (!spec) notFound();
  const related = relatedSpecs(spec);
  const dive = spec.deepDive;
  const share = {
    path: `/specs/${spec.slug}`,
    title: `${spec.shortName} (${spec.id})`,
  };

  return (
    <PageShell>
      <PageKicker>
        {spec.org} · {spec.date ?? "date: see source"}
      </PageKicker>
      <h1 className="mt-2 max-w-4xl font-heading text-3xl leading-tight md:text-4xl">
        {spec.officialName}
      </h1>
      <p className="mt-3 font-mono text-sm text-brass">{spec.id}</p>
      {spec.authors ? (
        <p className="mt-1 text-sm text-muted-foreground">{spec.authors}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <StatusBadge status={spec.status} />
        <StabilityBadge stability={spec.stability} />
        <LayerBadge layer={spec.layer} />
        <RelevanceBadge relevance={spec.relevance} />
        {dive ? (
          <Badge
            variant="outline"
            className="border-primary/50 font-mono text-[10px] uppercase text-primary"
          >
            Field guide
          </Badge>
        ) : null}
      </div>

      <p className="mt-6 max-w-3xl text-base leading-7 text-foreground/85 md:text-lg">
        {spec.whyAgentCares}
      </p>

      <section className="mt-8 rounded-xl border border-border/80 bg-card/40 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
          At a glance
        </p>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="font-heading text-sm">Problem</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {spec.problem}
            </dd>
          </div>
          <div>
            <dt className="font-heading text-sm">
              Identity / authn / authz
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {spec.identityVsAuthnVsAuthz}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <p className="font-heading text-sm">Actors</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {spec.actors.map((actor) => (
              <li
                key={actor}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {actor}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {isMainExplainerSpec(spec.slug) ? (
        <div className="mt-8">
          <SpecExplainer slug={spec.slug} share={share} />
        </div>
      ) : (
        <div className="mt-6">
          <ShareBar path={share.path} title={share.title} />
        </div>
      )}

      {spec.agentAdjacentNote ? (
        <section className="mt-8 rounded-xl border border-agent/35 bg-agent/10 p-5">
          <h2 className="font-heading text-lg">When this matters for agents</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {spec.agentAdjacentNote}
          </p>
        </section>
      ) : null}

      {dive ? (
        <SpecDeepDiveGuide spec={spec} dive={dive} />
      ) : (
        <>
          <Block title="Flow in plain language">
            <p>{spec.flow}</p>
          </Block>
          {spec.tokensAndClaims.length > 0 ? (
            <Block title="Key tokens and claims">
              <dl className="space-y-3">
                {spec.tokensAndClaims.map((item) => (
                  <div key={item.name}>
                    <dt className="font-mono text-xs text-foreground">
                      {item.name}
                    </dt>
                    <dd className="mt-1">{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}
          <Block title="Implementer notes">
            <p>{spec.implementerNotes}</p>
          </Block>
        </>
      )}

      {dive && spec.tokensAndClaims.length > 0 ? (
        <Block title="Catalog claims (short form)">
          <dl className="space-y-3">
            {spec.tokensAndClaims.map((item) => (
              <div key={item.name}>
                <dt className="font-mono text-xs text-foreground">
                  {item.name}
                </dt>
                <dd className="mt-1">{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </Block>
      ) : null}

      {dive ? (
        <Block title="Implementer notes">
          <p>{spec.implementerNotes}</p>
        </Block>
      ) : null}

      {related.length > 0 ? (
        <Block title="Relationship to others">
          <ul className="flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/specs/${item.slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50 hover:text-foreground"
                >
                  {item.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}
      <Block title="Primary sources">
        <ul className="space-y-2">
          {spec.urls.map((url) => (
            <li key={url.href}>
              <a
                href={url.href}
                className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {url.label}
              </a>
              <span className="ml-2 break-all font-mono text-[11px] text-muted-foreground">
                {url.href}
              </span>
            </li>
          ))}
        </ul>
      </Block>
    </PageShell>
  );
}
