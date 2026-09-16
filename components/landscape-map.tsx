import type { ReactNode } from "react";
import Link from "next/link";
import { Fingerprint, KeyRound, LayoutGrid, Scale, Shield } from "lucide-react";

function Box({
  title,
  children,
  href,
  icon: Icon,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  icon: typeof Fingerprint;
}) {
  const inner = (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/50">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function LandscapeMap() {
  return (
    <section aria-label="Landscape map" className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Box title="Identity — who" href="/catalog?layer=identity" icon={Fingerprint}>
          <p>
            User / person. Agent instance. Workload. Tool/resource. Four names,
            four identifiers. Do not collapse them.
          </p>
          <p className="mt-2 font-mono text-xs text-foreground/80">
            OIDC sub · AAuth agent token · SPIFFE/WIMSE · RFC 9728 resource
          </p>
        </Box>
        <Box title="Authentication — proof" href="/catalog?layer=authn" icon={KeyRound}>
          <p>
            Prove control of a key or a session. Redirects and CIBA for humans.
            Seals, mTLS, DPoP, WPT for machines. Bearer is a photocopy; DPoP
            glues the pass to a key.
          </p>
          <p className="mt-2 font-mono text-xs text-foreground/80">
            RFC 9421 · DPoP · mTLS · OIDC · CIBA
          </p>
        </Box>
        <Box title="Authorization — may" href="/catalog?layer=authz" icon={Shield}>
          <p>
            Grants, audiences, attenuation, missions, human approval. What the
            agent is allowed to do after you know who it is.
          </p>
          <p className="mt-2 font-mono text-xs text-foreground/80">
            OAuth 2.1 · RFC 8693 · RAR · AAuth missions · FAPI 2.0
          </p>
        </Box>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
          How the specs nest
        </p>
        <ol className="mt-4 space-y-3">
          <li className="rounded-md border border-dashed border-primary/25 bg-muted/40 p-3">
            <p className="font-heading text-sm">Foundation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              OAuth 2.0 as constrained by RFC 9700, heading toward{" "}
              <Link className="text-primary underline-offset-4 hover:underline" href="/specs/oauth-2-1">
                OAuth 2.1
              </Link>
              .{" "}
              <Link className="text-primary underline-offset-4 hover:underline" href="/specs/oidc-core">
                OIDC
              </Link>{" "}
              answers who the user is. JWT profiles carry claims. Discovery via
              RFC 8414 and RFC 9728.
            </p>
          </li>
          <li className="rounded-md border border-dashed border-primary/25 bg-muted/40 p-3 md:ml-4">
            <p className="font-heading text-sm">Delegation extensions</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Token exchange, identity chaining, XAA, transaction tokens — how
              an agent acts for a user across hops and domains without minting a
              new protocol.
            </p>
          </li>
          <li className="rounded-md border border-dashed border-workload/35 bg-workload/8 p-3 md:ml-8">
            <p className="font-heading text-sm">Workload identity</p>
            <p className="mt-1 text-sm text-muted-foreground">
              SPIFFE and WIMSE name the binary. They do not replace user
              delegation; they sit beside it.
            </p>
          </li>
          <li className="rounded-md border border-agent/40 bg-agent/10 p-3 md:ml-12">
            <p className="font-heading text-sm">Agent-native drafts</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link className="text-primary underline-offset-4 hover:underline" href="/specs/aauth">
                AAuth
              </Link>{" "}
              (including its two-party / identity-based “p2p” modes), AIMS, R3.
              Individual or early WG work. Pin revisions.
            </p>
          </li>
          <li className="rounded-md border border-resource/40 bg-resource/10 p-3 md:ml-16">
            <p className="font-heading text-sm">Application protocols</p>
            <p className="mt-1 text-sm text-muted-foreground">
              MCP authorization is an OAuth 2.1 profile. A2A is how agents
              talk; it reuses OAuth/OIDC/mTLS. GNAP is a finished IETF
              alternative to OAuth, not the default path.
            </p>
          </li>
        </ol>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Box title="Deployment → protocol" href="/patterns" icon={LayoutGrid}>
          <p>
            How the agent actually runs decides which of those specs apply: product
            UI, headless worker, MCP host, mesh sidecar, AAuth p2p HTTP. Not the
            same cut as the sequence diagrams under Flows.
          </p>
          <p className="mt-2 font-mono text-xs text-foreground/80">
            Interactive delegated · MCP host · AAuth p2p · sidecar
          </p>
        </Box>
        <Box title="Four doors named p2p" href="/compare/delegated-vs-p2p" icon={Scale}>
          <p>
            Delegated OAuth, AAuth identity-based / two-party, A2A tasking, and
            did:peer are four different doors. Click through which has an AS,
            which token shows up, and which cousin people mix in.
          </p>
          <p className="mt-2 font-mono text-xs text-foreground/80">
            AS in path? · what token? · wrong cousin
          </p>
        </Box>
      </div>
    </section>
  );
}
