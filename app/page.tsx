import Link from "next/link";
import { FourCousinsBoard } from "@/components/explainers/four-cousins-board";
import { MetaphorLegend } from "@/components/explainers/shared";
import { PrincipalsBoard } from "@/components/explainers/principals-board";
import { JsonLd } from "@/components/json-ld";
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
import { GitBranch, LayoutGrid, Library } from "lucide-react";
import { faqPageJsonLd, HOME_FAQ, pageMetadata, ROUTE_META } from "@/lib/seo";
import { featuredSpecs, SPEC_COUNT } from "@/lib/specs";
import { mentalModel } from "@/lib/mental-model";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata(ROUTE_META.home);

export default function HomePage() {
  const featured = featuredSpecs();

  return (
    <PageShell>
      <JsonLd data={faqPageJsonLd()} />
      <PageKicker>IETF · OIDF · W3C · 2025–2026</PageKicker>
      <PageTitle>
        AI agent identity, authentication, and authorization
      </PageTitle>
      <PageLead>
        <p>
          <span className="block leading-snug">Who is the user?</span>
          <span className="block leading-snug">Who is the agent?</span>
          <span className="block leading-snug">Which binary?</span>
          <span className="block leading-snug">Which API?</span>
        </p>
        <p>
          If those collapse into one token, agent auth is already wrong. This
          site is a <strong>map of the RFCs and drafts</strong> people mean by
          OAuth 2.1, OIDC, AAuth, MCP, A2A, SPIFFE, and WIMSE: what each one is
          for, how they nest, and which <strong>door</strong> you are in
          (delegated OAuth vs AAuth p2p vs A2A vs did:peer).
        </p>
        <p>
          <strong>Look for:</strong> the four seats below, then the four doors,
          then a spec page when you need the hop-by-hop flow.
        </p>
      </PageLead>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link href="/catalog" className={buttonVariants()}>
          <Library />
          Open the catalog
        </Link>
        <Link href="/patterns" className={buttonVariants({ variant: "outline" })}>
          <LayoutGrid />
          Open the patterns
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
        id="principals"
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

      <MapSection
        id="faq"
        index="06"
        title="Questions people actually ask"
        remember="Short answers you can quote. The compare pages and catalog carry the rest."
      >
        <dl className="divide-y divide-border/70 rounded-xl border border-border/80 bg-card/40">
          {HOME_FAQ.map((item) => (
            <div key={item.question} className="px-5 py-4 md:px-6">
              <dt className="font-heading text-lg">{item.question}</dt>
              <dd className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          See{" "}
          <Link
            href="/specs/aauth"
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            AAuth
          </Link>
          ,{" "}
          <Link
            href="/compare/oauth-2-0-vs-2-1"
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            OAuth 2.0 vs 2.1
          </Link>
          ,{" "}
          <Link
            href="/compare/delegated-vs-p2p"
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            delegated vs p2p
          </Link>
          , and the{" "}
          <Link
            href="/glossary"
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            glossary
          </Link>
          .
        </p>
      </MapSection>
    </PageShell>
  );
}
