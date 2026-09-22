import Link from "next/link";
import { Ban, Fingerprint, GitCompare, KeyRound } from "lucide-react";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import { compares } from "@/lib/compares";
import { ROUTE_META } from "@/lib/seo";

export const metadata = {
  title: "Compare",
  description:
    "OAuth 2.0 vs 2.1, OIDC vs OAuth, AAuth vs OAuth, and user-delegated vs p2p agent access.",
};

const compareIcon = {
  "oauth-2-0-vs-2-1": Ban,
  "oidc-vs-oauth": Fingerprint,
  "aauth-vs-oauth": KeyRound,
  "delegated-vs-p2p": GitCompare,
} as const;

export default function CompareIndexPage() {
  return (
    <PageShell>
      <PageKicker>Compare</PageKicker>
      <PageTitle>Put two stories next to each other</PageTitle>
      <PageLead>
        The questions that keep coming up: what 2.1 actually changes, why OIDC
        is not OAuth, how AAuth differs from vanilla OAuth, and what people
        mean by p2p versus user-delegated agents.
      </PageLead>
      <div className="mt-6">
        <ShareBar path="/compare" title={ROUTE_META.compare.title} />
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {compares.map((item) => {
          const Icon =
            compareIcon[item.slug as keyof typeof compareIcon] ?? GitCompare;
          return (
            <li key={item.slug}>
              <Link
                href={`/compare/${item.slug}`}
                className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
                  <Icon className="size-4" aria-hidden />
                  Compare
                </p>
                <h2 className="mt-2 font-heading text-xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.subtitle}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
