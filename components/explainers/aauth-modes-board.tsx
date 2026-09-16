"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hop,
  InOneBoard,
  ModeTabs,
  Pass,
  Piece,
} from "@/components/explainers/shared";
import { aauthModeMeta } from "@/lib/identity-visuals";
import { cn } from "@/lib/utils";

const modes = [
  {
    id: "identity",
    label: "Identity-based",
    hint: "Draft-10 §4.1.1 — the AAuth meaning of p2p",
    draft: "Draft-10",
    blurb:
      "Agent and resource only. The resource decides from who the agent is. No person server, no access server, no grant of operations.",
    actors: {
      user: false,
      agent: true,
      resource: true,
      ps: false,
      as: false,
    },
    hops: [
      {
        from: "agent" as const,
        to: "resource" as const,
        label: "Signed HTTP · local policy",
      },
    ],
    tokens: {
      agent: true,
      session: false,
      person: false,
      resource: false,
      auth: false,
    },
    punchline:
      "The resource learns which agent called — not which human it serves. That is p2p in the AAuth sense, not A2A and not did:peer.",
  },
  {
    id: "two-party",
    label: "Two-party",
    hint: "Draft-10 §4.1.2 — resource-managed",
    draft: "Draft-10",
    blurb:
      "Still no external authorization server. The resource runs its own login (which may wrap OAuth behind the curtain) and issues an opaque session glued to the agent's key.",
    actors: {
      user: true,
      agent: true,
      resource: true,
      ps: false,
      as: false,
    },
    hops: [
      {
        from: "agent" as const,
        to: "resource" as const,
        label: "Signed call, then session",
      },
      {
        from: "user" as const,
        to: "resource" as const,
        label: "Resource's own login",
      },
    ],
    tokens: {
      agent: true,
      session: true,
      person: false,
      resource: false,
      auth: false,
    },
    punchline:
      "The session is a pass the agent cannot read. Stolen session without the signing key should not replay. Still not A2A.",
  },
  {
    id: "person",
    label: "Person-identity",
    hint: "Editor's copy only — not in draft-10's four-mode table",
    draft: "Editor's copy",
    blurb:
      "The person server says who the human is at this resource, without a grant of operations. Federated login, not identity-based p2p.",
    actors: {
      user: true,
      agent: true,
      resource: true,
      ps: true,
      as: false,
    },
    hops: [
      {
        from: "agent" as const,
        to: "ps" as const,
        label: "person_token_endpoint",
      },
      {
        from: "ps" as const,
        to: "agent" as const,
        label: "aa-person+jwt",
      },
      {
        from: "agent" as const,
        to: "resource" as const,
        label: "Signed call with person token",
      },
    ],
    tokens: {
      agent: true,
      session: false,
      person: true,
      resource: false,
      auth: false,
    },
    punchline:
      "Identifies, does not authorize. A resource MUST reject aa-person+jwt wherever an auth token is required. Pin the editor's copy if you implement this.",
  },
  {
    id: "three",
    label: "Three-party",
    hint: "Draft-10 §4.1.3 — PS-asserted",
    draft: "Draft-10",
    blurb:
      "The resource has no access server. User claims and consent come from the agent's person server. The grant is aa-auth+jwt, sealed to the agent's key.",
    actors: {
      user: true,
      agent: true,
      resource: true,
      ps: true,
      as: false,
    },
    hops: [
      {
        from: "resource" as const,
        to: "agent" as const,
        label: "aa-resource+jwt (aud = PS)",
      },
      {
        from: "agent" as const,
        to: "ps" as const,
        label: "Redeem for a grant",
      },
      {
        from: "user" as const,
        to: "ps" as const,
        label: "Approves at the PS",
      },
      {
        from: "agent" as const,
        to: "resource" as const,
        label: "aa-auth+jwt on the retry",
      },
    ],
    tokens: {
      agent: true,
      session: false,
      person: false,
      resource: true,
      auth: true,
    },
    punchline:
      "sub is directed per issuer. The resource still decides what that subject may do. This is user-delegated AAuth, not p2p.",
  },
  {
    id: "four",
    label: "Four-party",
    hint: "Draft-10 §4.1.4 — federated",
    draft: "Draft-10",
    blurb:
      "The resource has its own access server. The agent still talks only to the resource and its person server. The PS is the only party that calls the AS.",
    actors: {
      user: true,
      agent: true,
      resource: true,
      ps: true,
      as: true,
    },
    hops: [
      {
        from: "resource" as const,
        to: "agent" as const,
        label: "aa-resource+jwt (aud = AS)",
      },
      {
        from: "agent" as const,
        to: "ps" as const,
        label: "Agent never calls the AS",
      },
      {
        from: "ps" as const,
        to: "as" as const,
        label: "PS federates",
      },
      {
        from: "agent" as const,
        to: "resource" as const,
        label: "aa-auth+jwt (iss = AS)",
      },
    ],
    tokens: {
      agent: true,
      session: false,
      person: false,
      resource: true,
      auth: true,
    },
    punchline:
      "Not OpenID Federation and not identity chaining (RFC 8693 + 7523). The access server is a resource-side policy engine, not the user's IdP.",
  },
] as const;

const tokenCatalog = [
  {
    key: "agent" as const,
    label: "aa-agent+jwt",
    hint: "Who the agent is. Bound to cnf.jwk. Rides in Signature-Key.",
  },
  {
    key: "session" as const,
    label: "session",
    hint: "Opaque resource-managed pass. Agent cannot inspect it.",
  },
  {
    key: "person" as const,
    label: "aa-person+jwt",
    hint: "Editor only. Identifies the person. Not a grant.",
  },
  {
    key: "resource" as const,
    label: "aa-resource+jwt",
    hint: "Short-lived description of what needs authorizing. aud is PS or AS.",
  },
  {
    key: "auth" as const,
    label: "aa-auth+jwt",
    hint: "The grant. User claims + consented operations. Bound to the agent key.",
  },
];

const actorMeta = {
  user: { kind: "user" as const, label: "User" },
  agent: { kind: "agent" as const, label: "Agent" },
  resource: { kind: "resource" as const, label: "Resource" },
  ps: { kind: "other" as const, label: "Person server" },
  as: { kind: "as" as const, label: "Access server" },
};

export function AauthModesBoard() {
  const [id, setId] = useState<(typeof modes)[number]["id"]>("identity");
  const mode = modes.find((item) => item.id === id) ?? modes[0];

  return (
    <InOneBoard
      kicker="In one board · AAuth access modes"
      title="Restage the hop"
      footnote={
        <>
          Draft-10 (6 August 2026) has four modes. Person-identity and{" "}
          <span className="font-mono text-xs">aa-person+jwt</span> are the
          editor&apos;s fifth. Individual Internet-Draft — not an RFC, not an
          OAuth WG document.{" "}
          <Link
            href="/compare/aauth-vs-oauth"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            AAuth vs OAuth
          </Link>
          .
        </>
      }
    >
      <ModeTabs
        label="AAuth access mode"
        value={id}
        onChange={(next) => setId(next as typeof id)}
        options={modes.map((item) => ({
          id: item.id,
          label: item.label,
          hint: item.hint,
          icon: aauthModeMeta[item.id].icon,
        }))}
      />

      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-brass">
        {mode.draft}
        <span className="mx-2 opacity-40">·</span>
        {mode.hint}
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {mode.blurb}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-0 flex-wrap gap-2">
          {(
            [
              ["agent", mode.actors.agent],
              ["user", mode.actors.user],
              ["resource", mode.actors.resource],
              ["ps", mode.actors.ps],
              ["as", mode.actors.as],
            ] as const
          ).map(([key, on]) => (
            <Piece
              key={key}
              kind={actorMeta[key].kind}
              label={actorMeta[key].label}
              active={on}
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {mode.hops.map((hop) => (
          <li key={`${hop.from}-${hop.to}-${hop.label}`}>
            <Hop
              from={
                <Piece
                  kind={actorMeta[hop.from].kind}
                  label={actorMeta[hop.from].label}
                  size="sm"
                />
              }
              to={
                <Piece
                  kind={actorMeta[hop.to].kind}
                  label={actorMeta[hop.to].label}
                  size="sm"
                />
              }
              label={hop.label}
            />
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
          Which passes exist
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tokenCatalog.map((token) => (
            <Pass
              key={token.key}
              label={token.label}
              token={token.key}
              active={mode.tokens[token.key]}
              hint={token.hint}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Dimmed tickets are not in this mode. Sealed tickets ride with a wax
          seal (RFC 9421). The session is a photocopy-proof opaque pass: the
          agent cannot open it.
        </p>
      </div>

      <p
        className={cn(
          "mt-4 rounded-lg border border-primary/30 bg-primary/8 px-3 py-3 text-sm leading-relaxed text-foreground",
        )}
      >
        {mode.punchline}
      </p>
    </InOneBoard>
  );
}
