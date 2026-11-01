import Link from "next/link";
import { Fingerprint, GitBranch, KeyRound, LayoutGrid, Shield } from "lucide-react";

function LayerCard({
  title,
  remember,
  specs,
  href,
  icon: Icon,
}: {
  title: string;
  remember: string;
  specs: string;
  href: string;
  icon: typeof Fingerprint;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {title}
      </p>
      <p className="mt-3 text-base leading-relaxed text-foreground/90">{remember}</p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">{specs}</p>
    </Link>
  );
}

const nestFloors = [
  {
    layer: "Foundation",
    remember: "OAuth 2.1 is how a client gets a pass. OIDC is who the user is.",
    href: "/specs/oauth-2-1",
    detail: "JWT profiles carry claims. Discovery is RFC 8414 and RFC 9728.",
  },
  {
    layer: "Delegation",
    remember: "Token exchange and chaining move that pass across hops — no new protocol.",
    href: "/specs/token-exchange",
    detail: "Identity chaining, XAA, transaction tokens sit on this floor.",
  },
  {
    layer: "Workload",
    remember: "SPIFFE and WIMSE name the binary. They do not replace the user.",
    href: "/specs/spiffe",
    detail: "Workload identity sits beside user delegation, never instead of it.",
  },
  {
    layer: "Agent-native",
    remember: "AAuth gives the agent a key a stranger's API can verify. Pin the draft.",
    href: "/specs/aauth",
    detail: "Including identity-based and two-party “p2p” modes. Individual or early WG work.",
  },
  {
    layer: "Application",
    remember: "MCP is an OAuth 2.1 profile. A2A is how agents talk. Neither is “p2p OAuth”.",
    href: "/specs/mcp-auth",
    detail: "GNAP is a finished IETF alternative to OAuth, not the default path.",
  },
] as const;

export function LandscapeMap() {
  return (
    <section aria-label="How the specs nest" className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <LayerCard
          title="Identity — who"
          href="/catalog?layer=identity"
          icon={Fingerprint}
          remember="Four names, four identifiers. Do not collapse them."
          specs="OIDC sub · AAuth agent token · SPIFFE/WIMSE · RFC 9728 resource"
        />
        <LayerCard
          title="Authentication — proof"
          href="/catalog?layer=authn"
          icon={KeyRound}
          remember="Prove a key or a session. Bearer is a photocopy; DPoP glues the pass to a key."
          specs="RFC 9421 · DPoP · mTLS · OIDC · CIBA"
        />
        <LayerCard
          title="Authorization — may"
          href="/catalog?layer=authz"
          icon={Shield}
          remember="What the agent may do after you know who it is."
          specs="OAuth 2.1 · RFC 8693 · RAR · AAuth missions · FAPI 2.0"
        />
      </div>

      <ol className="relative space-y-4 border-l-2 border-ink-rule pl-6 md:pl-8">
        {nestFloors.map((floor, index) => (
          <li key={floor.layer} className="relative">
            <span
              className="absolute -left-[1.7rem] top-5 size-3 rounded-full border-2 border-brass bg-card md:-left-[2.2rem]"
              aria-hidden
            />
            <Link
              href={floor.href}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                Floor {String(index + 1).padStart(2, "0")} · {floor.layer}
              </p>
              <p className="mt-2 font-heading text-lg text-foreground">
                {floor.remember}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {floor.detail}
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link
          href="/patterns"
          className="inline-flex items-center gap-1.5 text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          <LayoutGrid className="size-3.5" aria-hidden />
          Deployment decides which floor you are on
        </Link>
        <Link
          href="/flows"
          className="inline-flex items-center gap-1.5 text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-primary"
        >
          <GitBranch className="size-3.5" aria-hidden />
          Sequences live on Flows, not on this map
        </Link>
      </p>
    </section>
  );
}
