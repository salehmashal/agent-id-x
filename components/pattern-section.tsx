import Link from "next/link";
import { PatternToy } from "@/components/explainers/pattern-toy";
import { PatternTopologyDiagram } from "@/components/pattern-topology";
import { compares } from "@/lib/compares";
import {
  isDraftChurn,
  protocolDisplayName,
  protocolsByFit,
  resolveFlows,
  resolveSpec,
  resolveSpecs,
} from "@/lib/patterns";
import type { DeploymentPattern, PatternProtocol } from "@/lib/types";

const principalLabel = {
  user: "User",
  "agent-instance": "Agent instance",
  workload: "Workload",
  resource: "Resource",
  other: "Other",
} as const;

export function PatternSection({
  pattern,
  titleAs = "h2",
}: {
  pattern: DeploymentPattern;
  titleAs?: "h1" | "h2";
}) {
  const primary = protocolsByFit(pattern, "primary");
  const optional = protocolsByFit(pattern, "optional");
  const anti = protocolsByFit(pattern, "anti-pattern");
  const flows = resolveFlows(pattern.relatedFlows);
  const compareViews = (pattern.relatedCompares ?? [])
    .map((slug) => compares.find((item) => item.slug === slug))
    .filter((item): item is (typeof compares)[number] => Boolean(item));
  const Title = titleAs;

  return (
    <article
      id={pattern.slug}
      className="scroll-mt-20 rounded-xl border border-border/80 bg-card/30 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
          {pattern.matrixTitle}
        </p>
      </div>
      <div className="mt-2">
        <PatternToy topology={pattern.topology} />
      </div>
      <Title
        className={
          titleAs === "h1"
            ? "mt-2 max-w-4xl font-heading text-3xl leading-tight md:text-4xl"
            : "mt-2 font-heading text-2xl leading-tight"
        }
      >
        {pattern.title}
      </Title>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        <Link href={`/patterns/${pattern.slug}`} className="hover:text-foreground">
          /patterns/{pattern.slug}
        </Link>
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
        {pattern.summary}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="font-heading text-lg">When you see it</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {pattern.inTheWild}
          </p>
        </section>
        <section>
          <h3 className="font-heading text-lg">Actors and trust</h3>
          <ul className="mt-3 space-y-3">
            {pattern.actors.map((actor) => (
              <li key={actor.name}>
                <p className="text-sm">
                  <span className="font-heading">{actor.name}</span>
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-brass">
                    {principalLabel[actor.principal]}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {actor.trust}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <h3 className="font-heading text-lg">Topology</h3>
        <div className="mt-3">
          <PatternTopologyDiagram topology={pattern.topology} />
        </div>
      </section>

      {pattern.hostVariants && pattern.hostVariants.length > 0 ? (
        <section className="mt-6">
          <h3 className="font-heading text-lg">Three host runtimes</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {pattern.hostVariants.map((variant) => {
              const specs = resolveSpecs(variant.primarySlugs);
              return (
                <div
                  key={variant.slug}
                  id={`${pattern.slug}-${variant.slug}`}
                  className="scroll-mt-20 rounded-lg border border-border/70 bg-background/40 p-4"
                >
                  <h4 className="font-heading text-base">{variant.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {variant.situation}
                  </p>
                  <div className="mt-3">
                    <PatternTopologyDiagram topology={variant.topology} />
                  </div>
                  {specs.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {specs.map((spec) => (
                        <li key={spec.slug}>
                          <Link
                            href={`/specs/${spec.slug}`}
                            className="inline-flex rounded-full border border-border px-2.5 py-1 font-mono text-[11px] hover:border-primary/50"
                          >
                            {spec.shortName}
                            {isDraftChurn(spec) ? (
                              <span className="ml-1 text-[9px] uppercase text-brass">
                                draft
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="text-foreground">Token pitfall: </span>
                    {variant.pitfalls}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <ProtocolGroup title="Primary" items={primary} />
        <ProtocolGroup title="Optional" items={optional} />
        <ProtocolGroup title="Do not use" items={anti} anti />
      </section>

      <section className="mt-6">
        <h3 className="font-heading text-lg">Why these, and not those</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {pattern.whyThese}
        </p>
      </section>

      {flows.length > 0 ? (
        <section className="mt-6">
          <h3 className="font-heading text-lg">Related flows</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sequence diagrams, not this topology cut.{" "}
            <Link
              href="/flows"
              className="text-foreground underline decoration-primary/40 underline-offset-4"
            >
              All flows
            </Link>
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {flows.map((flow) => (
              <li key={flow.slug}>
                <Link
                  href={`/flows/${flow.slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                >
                  {flow.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {compareViews.length > 0 ? (
        <section className="mt-6">
          <h3 className="font-heading text-lg">Comparisons</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {compareViews.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/compare/${item.slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function ProtocolGroup({
  title,
  items,
  anti = false,
}: {
  title: string;
  items: PatternProtocol[];
  anti?: boolean;
}) {
  const visible = items.filter((item) => protocolDisplayName(item));
  return (
    <div>
      <h3 className="font-heading text-lg">{title}</h3>
      {visible.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">None listed.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {visible.map((item, index) => {
            const spec = resolveSpec(item.slug);
            const name = protocolDisplayName(item);
            return (
              <li key={`${item.slug ?? item.label}-${index}`}>
                {spec ? (
                  <Link
                    href={`/specs/${spec.slug}`}
                    className={
                      anti
                        ? "font-mono text-xs text-muted-foreground underline decoration-destructive/40 underline-offset-4 hover:text-foreground"
                        : "font-mono text-xs text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                    }
                  >
                    {name}
                    {isDraftChurn(spec) ? (
                      <span className="ml-2 text-[9px] uppercase tracking-wider text-brass no-underline">
                        draft / churn
                      </span>
                    ) : null}
                  </Link>
                ) : (
                  <span className="font-mono text-xs">{name}</span>
                )}
                {item.note ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.note}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
