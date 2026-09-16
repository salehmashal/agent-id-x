import Link from "next/link";
import { LandscapeMap } from "@/components/landscape-map";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { MetaphorLegend } from "@/components/explainers/shared";
import { PrincipalsBoard } from "@/components/explainers/principals-board";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { SpecCard } from "@/components/spec-card";
import { buttonVariants } from "@/components/ui/button";
import { LayoutGrid, Library, Users } from "lucide-react";
import { featuredSpecs, SPEC_COUNT } from "@/lib/specs";
import { landscapeNotes, mentalModel } from "@/lib/mental-model";
import { RESEARCH_AS_OF } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featured = featuredSpecs();

  return (
    <PageShell>
      <PageKicker>IETF · OIDF · W3C · 2025–2026</PageKicker>
      <PageTitle>Identity, authentication, and authorization for AI agents</PageTitle>
      <PageLead>
        A readable map of the specifications people mean when they say AAuth,
        p2p, OIDC, and OAuth 2.1 — plus the surrounding cluster that actually
        exists on datatracker, at the OpenID Foundation, and in MCP/A2A.{" "}
        {SPEC_COUNT} documents, researched {RESEARCH_AS_OF}. Drafts change;
        this is a field guide, not a substitute for the source. The four
        principals below are the mental model; click a seat to see how that
        party proves itself.
      </PageLead>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="#principals" className={buttonVariants()}>
          <Users />
          Four principals
        </Link>
        <Link href="/patterns" className={buttonVariants({ variant: "outline" })}>
          <LayoutGrid />
          Deployment patterns
        </Link>
        <Link
          href="/catalog"
          className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground")}
        >
          <Library />
          Open the catalog
        </Link>
      </div>

      <div className="mt-10">
        <PrincipalsBoard />
      </div>

      <div className="mt-6">
        <MetaphorLegend />
      </div>

      <div className="mt-12">
        <LandscapeMap />
      </div>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-xl">What AAuth actually is</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {landscapeNotes.aauth}
          </p>
          <p className="mt-4">
            <Link
              href="/specs/aauth"
            className="text-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Restage the access modes
            </Link>
          </p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-xl">What “p2p” actually is</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {landscapeNotes.p2p}
          </p>
          <p className="mt-4">
            <Link
              href="/flows/p2p-identity-based"
            className="text-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Walk the identity-based flow
            </Link>
          </p>
        </article>
      </section>

      <div className="mt-14">
        <FourCousinsBoard />
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-2xl">Honest maturity</h2>
        <ul className="mt-4 space-y-3">
          {mentalModel.honestStatus.map((item) => (
            <li
              key={item.kind}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-brass">
                {item.kind}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.examples}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl">Start with these documents</h2>
          <Link
            href="/catalog"
          className="text-sm text-primary hover:underline"
          >
            All {SPEC_COUNT} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 9).map((spec) => (
            <SpecCard key={spec.slug} spec={spec} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
