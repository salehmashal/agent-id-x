import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSpec } from "@/lib/specs";
import type { Spec, SpecDeepDive } from "@/lib/types";

const TOC = [
  { id: "agent-gap", label: "Agent gap" },
  { id: "trust", label: "Trust boundaries" },
  { id: "mechanics", label: "Mechanics" },
  { id: "flows", label: "Flows" },
  { id: "layers", label: "Identity / authn / authz" },
  { id: "composition", label: "Composition" },
  { id: "pitfalls", label: "Pitfalls" },
  { id: "stability", label: "Stability" },
] as const;

function Prose({ parts }: { parts: string[] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, index) => (
        <p
          key={index}
          className="text-sm leading-relaxed text-foreground/85 md:text-[15px]"
        >
          {part}
        </p>
      ))}
    </div>
  );
}

function GuideSection({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {kicker ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
          {kicker}
        </p>
      ) : null}
      <h2 className="mt-1 font-heading text-xl md:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SpecDeepDiveGuide({
  spec,
  dive,
}: {
  spec: Spec;
  dive: SpecDeepDive;
}) {
  return (
    <div className="mt-12">
      <nav
        aria-label="Field guide sections"
        className="mb-8 overflow-x-auto rounded-xl border border-border/80 bg-card/40 p-3 md:p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
          Field guide · {spec.shortName}
        </p>
        <ul className="mt-3 flex min-w-max flex-wrap gap-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        <GuideSection
          id="agent-gap"
          kicker="01"
          title="The gap for agents"
        >
          <Prose parts={dive.agentGap} />
        </GuideSection>

        <GuideSection
          id="trust"
          kicker="02"
          title="Actors and trust boundaries"
        >
          <Prose parts={dive.trustBoundaries} />
        </GuideSection>

        <GuideSection
          id="mechanics"
          kicker="03"
          title="Mechanics"
        >
          <Prose parts={dive.mechanics} />
          {dive.claims && dive.claims.length > 0 ? (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {dive.claims.map((claim) => (
                <div
                  key={claim.name}
                  className="rounded-lg border border-border/80 bg-card/50 p-3"
                >
                  <dt className="flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-xs text-foreground">
                      {claim.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase"
                    >
                      {claim.source === "quoted" ? "from spec" : "illustrative"}
                    </Badge>
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {claim.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </GuideSection>

        <GuideSection id="flows" kicker="04" title="Step-by-step flows">
          <div className="space-y-6">
            {dive.flows.map((flow, index) => (
              <article
                key={flow.id}
                id={`flow-${flow.id}`}
                className="rounded-xl border border-border/80 bg-card/40 p-4 md:p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                  Flow {index + 1}
                  {dive.flows.length > 1
                    ? ` of ${dive.flows.length}`
                    : ""}
                </p>
                <h3 className="mt-1 font-heading text-lg">{flow.title}</h3>
                {flow.when ? (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    {flow.when}
                  </p>
                ) : null}
                <ol className="mt-4 space-y-2">
                  {flow.steps.map((step, stepIndex) => (
                    <li
                      key={`${flow.id}-${stepIndex}`}
                      className="grid grid-cols-[auto_1fr] gap-3"
                    >
                      <span className="mt-0.5 flex size-6 items-center justify-center rounded-full border border-primary/40 font-mono text-[11px] text-primary">
                        {stepIndex + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
                {flow.notes ? (
                  <p className="mt-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                    {flow.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </GuideSection>

        <GuideSection
          id="layers"
          kicker="05"
          title="Identity vs authentication vs authorization"
        >
          <Prose parts={dive.layerDetail} />
        </GuideSection>

        <GuideSection
          id="composition"
          kicker="06"
          title="How it composes"
        >
          <ul className="space-y-3">
            {dive.composition.map((item) => {
              const other = getSpec(item.specSlug);
              return (
                <li
                  key={item.specSlug}
                  className="rounded-lg border border-border/80 bg-card/40 p-4"
                >
                  {other ? (
                    <Link
                      href={`/specs/${other.slug}`}
                      className="font-heading text-base underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                    >
                      {other.shortName}
                    </Link>
                  ) : (
                    <span className="font-heading text-base">{item.specSlug}</span>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.how}
                  </p>
                </li>
              );
            })}
          </ul>
        </GuideSection>

        <GuideSection
          id="pitfalls"
          kicker="07"
          title="What bites agent implementers"
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {dive.pitfalls.map((pitfall) => (
              <li
                key={pitfall.title}
                className="rounded-lg border border-border/80 bg-card/40 p-4"
              >
                <h3 className="font-heading text-base">{pitfall.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pitfall.body}
                </p>
              </li>
            ))}
          </ul>
        </GuideSection>

        <GuideSection
          id="stability"
          kicker="08"
          title="Stability — what you can ship"
        >
          <Prose parts={dive.stabilityDetail} />
        </GuideSection>
      </div>
    </div>
  );
}
