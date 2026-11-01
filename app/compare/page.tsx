import Link from "next/link";
import { Ban, Fingerprint, GitCompare, KeyRound } from "lucide-react";
import { PageKicker, PageLead, PageShell, PageTitle } from "@/components/page-shell";
import { ShareBar } from "@/components/share-bar";
import { compares } from "@/lib/compares";
import { pageMetadata, ROUTE_META } from "@/lib/seo";

export const metadata = pageMetadata(ROUTE_META.compare);

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
        The questions that keep coming up, as two columns: what 2.1 actually
        changes, why OIDC is not OAuth, how AAuth differs from vanilla OAuth,
        and the four doors people call p2p. OAuth 2.0 vs 2.1 and the four-doors
        page are the sharpest cuts.
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
