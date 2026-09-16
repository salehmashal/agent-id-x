"use client";

import { useState } from "react";
import Link from "next/link";
import { mentalModel } from "@/lib/mental-model";
import {
  boardChoiceClass,
  boardFocusClass,
  principalMeta,
} from "@/lib/identity-visuals";
import { cn } from "@/lib/utils";
import { InOneBoard, Pass, Piece, Seal } from "@/components/explainers/shared";

const seats = [
  {
    id: "user",
    kind: "user" as const,
    short: "User",
    name: mentalModel.identities[0].name,
    question: mentalModel.identities[0].question,
    proveWith: mentalModel.identities[0].proveWith,
    notTheSameAs: mentalModel.identities[0].notTheSameAs,
    typicalId: "OIDC / person server",
    specs: [
      { href: "/specs/oidc-core", label: "OIDC" },
      { href: "/specs/ciba", label: "CIBA" },
      { href: "/specs/aauth", label: "AAuth person / auth" },
    ],
    proofs: [
      { label: "ID Token", variant: "identity" as const, hint: "Nametag for the relying party — not a pass to the API" },
      { label: "aa-person+jwt", token: "person" as const, hint: "Editor's AAuth: identifies, does not authorize" },
    ],
  },
  {
    id: "agent",
    kind: "agent" as const,
    short: "Agent",
    name: mentalModel.identities[1].name,
    question: mentalModel.identities[1].question,
    proveWith: mentalModel.identities[1].proveWith,
    notTheSameAs: mentalModel.identities[1].notTheSameAs,
    typicalId: "AAuth agent token or client_id",
    specs: [
      { href: "/specs/aauth", label: "AAuth" },
      { href: "/specs/cimd", label: "CIMD" },
      { href: "/specs/oauth-2-1", label: "OAuth 2.1 client" },
    ],
    proofs: [
      { label: "aa-agent+jwt", token: "agent" as const, hint: "Pass glued to a signing key — the seal is RFC 9421" },
      { label: "client_id", variant: "plain" as const, hint: "Name at one authorization server, meaningless at the next" },
    ],
  },
  {
    id: "workload",
    kind: "workload" as const,
    short: "Workload",
    name: mentalModel.identities[2].name,
    question: mentalModel.identities[2].question,
    proveWith: mentalModel.identities[2].proveWith,
    notTheSameAs: mentalModel.identities[2].notTheSameAs,
    typicalId: "SPIFFE / WIMSE",
    specs: [
      { href: "/specs/spiffe", label: "SPIFFE" },
      { href: "/specs/wimse-arch", label: "WIMSE" },
      { href: "/specs/wimse-wpt", label: "WPT" },
    ],
    proofs: [
      { label: "WIT + WPT", variant: "sealed" as const, hint: "Workload pass plus proof — never WIT as Bearer" },
      { label: "X.509-SVID", variant: "dpop" as const, hint: "Certificate in the TLS handshake" },
    ],
  },
  {
    id: "resource",
    kind: "resource" as const,
    short: "Resource",
    name: mentalModel.identities[3].name,
    question: mentalModel.identities[3].question,
    proveWith: mentalModel.identities[3].proveWith,
    notTheSameAs: mentalModel.identities[3].notTheSameAs,
    typicalId: "RFC 9728 / Agent Card",
    specs: [
      { href: "/specs/prm", label: "RFC 9728" },
      { href: "/specs/resource-indicators", label: "RFC 8707" },
      { href: "/specs/a2a", label: "A2A Agent Card" },
    ],
    proofs: [
      { label: "resource metadata", variant: "plain" as const, hint: "How a caller finds the door and the mint" },
      { label: "Agent Card", variant: "sealed" as const, hint: "Catalog of skills — seal on the card is not request auth" },
    ],
  },
] as const;

export function PrincipalsBoard() {
  const [selected, setSelected] = useState<(typeof seats)[number]["id"]>("user");
  const seat = seats.find((item) => item.id === selected) ?? seats[0];

  return (
    <InOneBoard
      id="principals"
      kicker="Mental model · four seats"
      title="Four principals — click one"
      footnote="One HTTP call can prove more than one of these. Do not smash them into a single string. Tokens are passes; signatures are wax seals."
    >
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Most broken agent-auth designs collapse these four names. Keep them
        separate, then pick a proof for each. This board is the map; the catalog
        is the shelf.
      </p>

      <div className="relative grid gap-3 sm:grid-cols-2">
        {seats.map((item, index) => {
          const on = item.id === selected;
          const Icon = principalMeta[item.id].icon;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(item.id)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-colors",
                boardFocusClass,
                boardChoiceClass(on),
                on && principalMeta[item.id].tone,
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg border",
                    principalMeta[item.id].tone,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Seat {String(index + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-3 block font-heading text-lg text-foreground">
                {item.short}
              </span>
              <span className="mt-1 block text-sm italic text-foreground/80">
                {item.question}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Piece kind={seat.kind} label={seat.short} />
          <p className="font-heading text-lg">{seat.name}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">
          {seat.proveWith}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {seat.proofs.map((proof) => (
            <Pass
              key={proof.label}
              label={proof.label}
              variant={"variant" in proof ? proof.variant : "plain"}
              token={"token" in proof ? proof.token : undefined}
              hint={proof.hint}
            />
          ))}
          {seat.id === "agent" ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Seal />
              <span>HTTP Message Signatures on the request</span>
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground">Not the same as: </span>
          {seat.notTheSameAs}
        </p>
        <p className="mt-3 font-mono text-[11px] text-foreground/80">
          Typical id: {seat.typicalId}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {seat.specs.map((spec) => (
            <li key={spec.href}>
              <Link
                href={spec.href}
                className="inline-flex cursor-pointer rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary/50 hover:bg-muted"
              >
                {spec.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </InOneBoard>
  );
}
