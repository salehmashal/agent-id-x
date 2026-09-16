"use client";

import { useState } from "react";
import Link from "next/link";
import {
  InOneBoard,
  Pass,
  Piece,
  Seal,
} from "@/components/explainers/shared";
import {
  boardChoiceClass,
  boardFocusClass,
  doorMeta,
} from "@/lib/identity-visuals";
import { cn } from "@/lib/utils";

const doors = [
  {
    id: "delegated",
    label: "Delegated",
    asInPath: "Yes — an authorization server mints the access token",
    token: "Bearer or DPoP pass; sub is the user; agent is client_id or act",
    tokenVisual: { label: "access token", variant: "bearer" as const },
    wrong:
      "Not AAuth identity-based: there is very much an AS. Putting this pass on an A2A call without aud and actor binding is a confused deputy.",
    href: "/patterns/interactive-user-delegated",
    pieces: [
      { kind: "user" as const, label: "User" },
      { kind: "agent" as const, label: "Agent (client)" },
      { kind: "as" as const, label: "AS" },
      { kind: "resource" as const, label: "API" },
    ],
  },
  {
    id: "aauth",
    label: "AAuth p2p",
    asInPath: "No",
    token: "aa-agent+jwt in Signature-Key, wax seal on every request (RFC 9421)",
    tokenVisual: { label: "aa-agent+jwt", variant: "sealed" as const },
    wrong:
      "Not A2A (no Agent Card, no tasks). Not did:peer (the agent JWKS is globally fetchable). Two-party still has no external AS — the resource runs its own login.",
    href: "/patterns/aauth-p2p",
    pieces: [
      { kind: "agent" as const, label: "Agent" },
      { kind: "resource" as const, label: "Resource" },
    ],
  },
  {
    id: "a2a",
    label: "A2A",
    asInPath: "Usually — whatever the Agent Card advertised, often OAuth",
    token: "The card is a catalog. Request auth is ordinary HTTP (OAuth, mTLS, API key) obtained out of band.",
    tokenVisual: { label: "Agent Card", variant: "sealed" as const },
    wrong:
      "A signed card is tamper evidence for the catalog, not authentication of the request. Not AAuth p2p (no Signature-Key). Not did:peer (cards are globally fetched JSON).",
    href: "/patterns/a2a-tasking",
    pieces: [
      { kind: "agent" as const, label: "Client agent" },
      { kind: "agent" as const, label: "Server agent" },
    ],
  },
  {
    id: "did",
    label: "did:peer",
    asInPath: "No",
    token: "Pairwise DID keys in the document. No OAuth pass. DIDComm authcrypt, not a stranger's first HTTP call.",
    tokenVisual: { label: "did:peer keys", variant: "identity" as const },
    wrong:
      "Deliberately not globally resolvable. Do not substitute for AAuth identity-based, and do not treat an Agent Card as a DID document. Adjacent in the catalog — not a deployment row.",
    href: "/specs/did-peer",
    pieces: [
      { kind: "agent" as const, label: "Party A" },
      { kind: "agent" as const, label: "Party B" },
    ],
  },
] as const;

export function FourCousinsBoard() {
  const [id, setId] = useState<(typeof doors)[number]["id"]>("delegated");
  const door = doors.find((item) => item.id === id) ?? doors[0];

  return (
    <InOneBoard
      kicker="In one board · four doors"
      title="Delegated · AAuth p2p · A2A · did:peer"
      footnote="There is no IETF RFC titled P2P in this cluster. The word is meeting shorthand. Pick one door and stay in it."
    >
      <div
        role="tablist"
        aria-label="Four cousin protocols"
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        {doors.map((item) => {
          const on = item.id === id;
          const Icon = doorMeta[item.id].icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setId(item.id)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left transition-colors",
                boardFocusClass,
                boardChoiceClass(on),
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="block font-heading text-base text-foreground">
                  {item.label}
                </span>
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.id === "delegated"
                  ? "AS yes"
                  : item.id === "a2a"
                    ? "AS often"
                    : "No AS"}
              </span>
            </button>
          );
        })}
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-brass">
            AS in path?
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {door.asInPath}
          </dd>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-brass">
            What token?
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {door.token}
          </dd>
          <dd className="mt-2">
            <Pass
              label={door.tokenVisual.label}
              variant={door.tokenVisual.variant}
            />
            {door.id === "aauth" ? (
              <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs text-muted-foreground">
                <Seal />
                every request
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {door.pieces.map((piece, index) => (
          <Piece
            key={`${piece.label}-${index}`}
            kind={piece.kind}
            label={piece.label}
            size="sm"
          />
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-primary/30 bg-primary/8 px-3 py-3 text-sm leading-relaxed">
        <span className="font-heading">Wrong cousin: </span>
        {door.wrong}
      </p>
      <p className="mt-3">
        <Link
          href={door.href}
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          Open this door →
        </Link>
      </p>
    </InOneBoard>
  );
}
