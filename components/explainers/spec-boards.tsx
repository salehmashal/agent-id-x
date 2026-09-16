"use client";

import Link from "next/link";
import { InOneBoard, Hop, Pass, Piece, Seal } from "@/components/explainers/shared";

export function OidcBoard() {
  return (
    <InOneBoard
      kicker="In one board · OIDC vs OAuth"
      title="Nametag stays home; pass goes to the API"
      footnote={
        <>
          OpenID Connect is the identity layer on OAuth. An ID Token is not an
          access token.{" "}
          <Link
            href="/compare/oidc-vs-oauth"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Side-by-side
          </Link>
          .
        </>
      }
    >
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Two tickets come back from the token endpoint. They look related. They
        are not interchangeable. Sending the ID Token to an MCP server is the
        classic mix-up.
      </p>
      <ul className="mt-4 space-y-2">
        <li>
          <Hop
            from={<Piece kind="user" label="User" size="sm" />}
            to={<Piece kind="as" label="OpenID provider" size="sm" />}
            label="Authenticates"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="as" label="OP" size="sm" />}
            to={<Piece kind="agent" label="Agent (relying party)" size="sm" />}
            label="ID Token — aud is the client"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="agent" label="Agent" size="sm" />}
            to={<Piece kind="resource" label="API / MCP server" size="sm" />}
            label="Access token — aud is this API"
          />
        </li>
      </ul>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-chart-3/40 bg-chart-3/10 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-chart-3">
            Nametag
          </p>
          <div className="mt-2">
            <Pass
              label="ID Token"
              variant="identity"
              hint="JWT authenticating the user to the client"
            />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Stays with the agent. <span className="font-mono text-xs">aud</span>{" "}
            is the client_id. Answers who signed in — not what the API may do.
          </p>
        </article>
        <article className="rounded-lg border border-border/80 bg-background/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
            Pass
          </p>
          <div className="mt-2">
            <Pass label="access token" variant="bearer" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Goes to the resource. Glue it to a key with DPoP if the runtime is
            untrusted. Still a photocopy until you do.
          </p>
        </article>
      </div>
    </InOneBoard>
  );
}

export function DpopBoard() {
  return (
    <InOneBoard
      kicker="In one board · Bearer vs DPoP"
      title="Photocopy, or pass glued to a key"
      footnote={
        <>
          RFC 9449. DPoP is application-layer proof — it works through TLS
          proxies. AAuth uses HTTP Message Signatures instead; do not stack
          proofs naively.{" "}
          <Link
            href="/specs/mtls"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            mTLS is the other glue
          </Link>
          .
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-dashed border-border p-4">
          <p className="font-heading text-lg">Bearer</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Photocopy
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pass label="Authorization: Bearer" variant="bearer" />
            <Pass label="Authorization: Bearer" variant="bearer" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Whoever holds the string may use it until it expires. Prompt
            injection, logs, and traces are copy machines.
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Hop
                from={<Piece kind="agent" label="Thief" size="sm" />}
                to={<Piece kind="resource" label="API" size="sm" />}
                label="same pass, no key needed"
              />
            </li>
          </ul>
        </article>
        <article className="rounded-lg border border-moss/40 bg-moss/10 p-4">
          <p className="font-heading text-lg">DPoP</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-moss">
            Glued to a key
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pass
              label="access token + cnf.jkt"
              variant="dpop"
              hint="Thumbprint of the client's DPoP key"
            />
            <Seal />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Each request carries a short-lived proof JWT covering method and
            URL. Stolen paper without the private key is a blank.
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Hop
                from={<Piece kind="agent" label="Client with key" size="sm" />}
                to={<Piece kind="resource" label="API" size="sm" />}
                label="pass + fresh proof"
              />
            </li>
          </ul>
        </article>
      </div>
    </InOneBoard>
  );
}

export function McpBoard() {
  return (
    <InOneBoard
      kicker="In one board · MCP HTTP"
      title="The host is the OAuth client"
      footnote={
        <>
          MCP authorization (2026-07-28) is an OAuth 2.1 profile, not an RFC.
          It still cites an older 2.1 draft — implement token handling against
          current 2.1 and RFC 9700. Stdio transports must not use this; they
          take credentials from the environment.
        </>
      }
    >
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        ChatGPT / Claude / Cursor calling your tools is this shape: vanilla
        OAuth plus protected resource metadata. It does not give the model a
        cryptographic agent identity — only a pass for the host, audience-locked
        to this MCP server.
      </p>
      <ul className="mt-4 space-y-2">
        <li>
          <Hop
            from={<Piece kind="agent" label="MCP host" size="sm" />}
            to={<Piece kind="resource" label="MCP server" size="sm" />}
            label="401 + resource_metadata"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="user" label="User" size="sm" />}
            to={<Piece kind="as" label="Authorization server" size="sm" />}
            label="Consent (OIDC if you need who)"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="as" label="AS" size="sm" />}
            to={<Piece kind="agent" label="MCP host" size="sm" />}
            label="Pass with aud = this server"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="agent" label="MCP host" size="sm" />}
            to={<Piece kind="resource" label="MCP server" size="sm" />}
            label="Authorization: Bearer"
          />
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pass label="Bearer access token" variant="bearer" />
        <Pass label="resource= canonical MCP URI" variant="plain" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Photocopy until you add DPoP. Never put the pass in a query string.
        Never forward it to a different audience. Not AAuth p2p unless you
        deliberately leave this profile.
      </p>
    </InOneBoard>
  );
}

export function A2aBoard() {
  return (
    <InOneBoard
      kicker="In one board · A2A"
      title="The card is a catalog, not a login"
      footnote={
        <>
          A2A v1.0 is a task protocol (AAIF / Linux Foundation), not an RFC.
          Auth is out of band relative to the task messages.{" "}
          <Link
            href="/compare/delegated-vs-p2p"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Four doors
          </Link>
          .
        </>
      }
    >
      <ul className="space-y-2">
        <li>
          <Hop
            from={<Piece kind="agent" label="Server agent" size="sm" />}
            to={<Piece kind="other" label="/.well-known/agent-card.json" size="sm" />}
            label="Publishes skills + securitySchemes"
          />
        </li>
        <li>
          <Hop
            from={<Piece kind="agent" label="Client agent" size="sm" />}
            to={<Piece kind="agent" label="Server agent" size="sm" />}
            label="Whatever the card advertised"
          />
        </li>
      </ul>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-agent/35 bg-agent/10 p-4">
          <div className="flex items-center gap-2">
            <Pass label="Agent Card" variant="sealed" />
            <Seal />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Optional JWS is a wax seal on the catalog — tamper evidence. It
            does not authenticate the next JSON-RPC call.
          </p>
        </article>
        <article className="rounded-lg border border-border/80 bg-background/40 p-4">
          <Pass label="OAuth / mTLS / API key" variant="bearer" />
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Request auth is ordinary HTTP, obtained however{" "}
            <span className="font-mono text-xs">securitySchemes</span> says.
            Often a Bearer pass from some AS.
          </p>
        </article>
      </div>
      <p className="mt-4 rounded-lg border border-primary/30 bg-primary/8 px-3 py-3 text-sm leading-relaxed">
        Wrong cousins: AAuth identity-based p2p (signed HTTP, no Agent Card)
        and did:peer (pairwise, not globally fetched). A2A §7.6.3 — do not
        forward caller credentials in-band down the chain.
      </p>
    </InOneBoard>
  );
}
