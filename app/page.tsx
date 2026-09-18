import Link from "next/link";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { MetaphorLegend } from "@/components/explainers/shared";
import { PrincipalsBoard } from "@/components/explainers/principals-board";
import { LandscapeMap } from "@/components/landscape-map";
import {
  MapSection,
  PageKicker,
  PageLead,
  PageShell,
  PageTitle,
} from "@/components/page-shell";
import { SpecCard } from "@/components/spec-card";
import { buttonVariants } from "@/components/ui/button";
import { GitBranch, Library, Users } from "lucide-react";
import { featuredSpecs, SPEC_COUNT } from "@/lib/specs";
import { mentalModel } from "@/lib/mental-model";
import { RESEARCH_AS_OF } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featured = featuredSpecs();

  return (
    <PageShell>
      <PageKicker>IETF · OIDF · W3C · 2025–2026</PageKicker>
      <PageTitle>Identity, authentication, and authorization for AI agents</PageTitle>
      <PageLead>
        Four principals. Nested specs. Four doors people call p2p. A readable
        map of the documents — {SPEC_COUNT} of them, researched {RESEARCH_AS_OF}{" "}
        — not a course, and not a substitute for the source.
      </PageLead>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link href="#principals" className={buttonVariants()}>
          <Users />
          Four principals
        </Link>
        <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
          <Library />
          Open the catalog
        </Link>
        <Link
          href="/flows/user-delegated-api"
          className={cn(
            buttonVariants({ variant: "link" }),
            "h-auto px-1 text-muted-foreground",
          )}
        >
          <GitBranch />
          Walk a delegated call
        </Link>
      </div>

      <MapSection
        index="01"
        title="Four principals"
        remember="User, agent, workload, resource. Four names, four proofs. Do not smash them into one string."
      >
        <PrincipalsBoard />
        <div className="mt-6">
          <MetaphorLegend />
        </div>
      </MapSection>

      <MapSection
        id="landscape"
        index="02"
        title="How the specs nest"
        remember="OAuth is the basement. Agent drafts are the attic. Do not skip floors."
      >
        <LandscapeMap />
      </MapSection>

      <MapSection
        index="03"
        title="Four doors named p2p"
        remember="Delegated OAuth, AAuth p2p, A2A, and did:peer are four doors — not one protocol."
      >
        <FourCousinsBoard />
      </MapSection>

      <MapSection
        id="maturity"
        index="04"
        title="Honest maturity"
        remember="Ship RFCs. Pin drafts. Vendor protocols are real; they are not RFCs."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {mentalModel.honestStatus.map((item) => (
            <li
              key={item.kind}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-brass">
                {item.kind}
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground/90">
                {item.line}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.examples}
              </p>
            </li>
          ))}
        </ul>
      </MapSection>

      <MapSection
        id="catalog"
        index="05"
        title="Start with these documents"
        remember="These are the papers people mean when they say AAuth, OIDC, OAuth 2.1, and SPIFFE in the same breath."
      >
        <div className="mb-6">
          <Link
            href="/catalog"
            className="text-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            All {SPEC_COUNT} in the catalog →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 9).map((spec) => (
            <SpecCard key={spec.slug} spec={spec} />
          ))}
        </div>
      </MapSection>
    </PageShell>
  );
}
