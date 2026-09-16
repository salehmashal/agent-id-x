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
import { boardChoiceClass, boardFocusClass } from "@/lib/identity-visuals";
import { cn } from "@/lib/utils";
import { GitBranch, Server } from "lucide-react";

const oauthSteps = [
  {
    title: "User token at API A",
    body: "Alice's access token. sub is Alice. No act. The pass names who it is for, not who is holding it.",
    act: "act: —",
    hop: {
      from: { kind: "user" as const, label: "Alice" },
      to: { kind: "resource" as const, label: "API A" },
      label: "Bearer / DPoP pass",
    },
  },
  {
    title: "Agent exchanges",
    body: "RFC 8693 mints a new pass for a new audience or a narrower scope. act records the agent as the actor. Attenuate — never expand.",
    act: "act: { iss: agent-1, … }",
    hop: {
      from: { kind: "agent" as const, label: "Agent 1" },
      to: { kind: "as" as const, label: "Authorization server" },
      label: "token-exchange",
    },
  },
  {
    title: "Sub-agent hop",
    body: "Another exchange nests act. The chain grows: C acting for B acting for Alice. Audit can still name every pair of hands.",
    act: "act: { iss: agent-2, act: { iss: agent-1 } }",
    hop: {
      from: { kind: "agent" as const, label: "Agent 2" },
      to: { kind: "resource" as const, label: "API B" },
      label: "new aud, nested act",
    },
  },
] as const;

const wimseSteps = [
  {
    title: "Workload A proves itself",
    body: "WIT names the binary (spiffe:// or wimse://). WPT or mTLS is the seal. Never put WIT in Authorization: Bearer — that would be a photocopy of a workload pass.",
    act: "WIT sub = payment-api, not Alice",
    hop: {
      from: { kind: "workload" as const, label: "Workload A" },
      to: { kind: "resource" as const, label: "Peer B" },
      label: "WIT + WPT (or mTLS)",
    },
  },
  {
    title: "Hop re-bind",
    body: "B authenticates as itself with its own WIT. It does not replay A's identity. WIMSE §3.4.11: agent hops MUST re-bind and scope context or a chain silently widens.",
    act: "New WIT for B · A's WIT is not forwarded",
    hop: {
      from: { kind: "workload" as const, label: "Workload B" },
      to: { kind: "workload" as const, label: "Workload C" },
      label: "re-bind, do not forward",
    },
  },
  {
    title: "User context stays aside",
    body: "If Alice is in the picture, her pass travels in another header (Txn-Token / OAuth) — not stuffed into the SPIFFE path. Workload identity answers 'which binary', not 'which customer'.",
    act: "Txn-Token / OAuth beside WIT — two names",
    hop: {
      from: { kind: "user" as const, label: "Alice (context)" },
      to: { kind: "workload" as const, label: "Workload C" },
      label: "separate header, re-scoped",
    },
  },
] as const;

export function TokenHopBoard({
  initial = "oauth",
}: {
  initial?: "oauth" | "wimse";
}) {
  const [lane, setLane] = useState<"oauth" | "wimse">(initial);
  const [step, setStep] = useState(0);
  const steps = lane === "oauth" ? oauthSteps : wimseSteps;
  const current = steps[step] ?? steps[0];

  function switchLane(next: "oauth" | "wimse") {
    setLane(next);
    setStep(0);
  }

  return (
    <InOneBoard
      kicker="In one board · hops"
      title={
        lane === "oauth"
          ? "act grows down the chain"
          : "WIMSE re-binds each hop"
      }
      footnote={
        lane === "oauth" ? (
          <>
            RFC 8693 does not by itself define cross-domain trust — identity
            chaining profiles it with RFC 7523.{" "}
            <Link
              href="/specs/wimse-arch"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Contrast with WIMSE
            </Link>
            .
          </>
        ) : (
          <>
            WIMSE architecture is a WG informational draft, not a protocol RFC.
            Implement WIT/WPT or SPIFFE for wire.{" "}
            <Link
              href="/specs/token-exchange"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Contrast with token exchange
            </Link>
            .
          </>
        )
      }
    >
      <ModeTabs
        label="Hop story"
        value={lane}
        onChange={(id) => switchLane(id as "oauth" | "wimse")}
        options={[
          {
            id: "oauth",
            label: "OAuth act chain",
            hint: "RFC 8693 — nested actor claim",
            icon: GitBranch,
          },
          {
            id: "wimse",
            label: "WIMSE re-bind",
            hint: "Each hop authenticates as itself",
            icon: Server,
          },
        ]}
      />

      <div
        role="tablist"
        aria-label="Hop step"
        className="mt-4 flex flex-wrap gap-1.5"
      >
        {steps.map((entry, index) => (
          <button
            key={entry.title}
            type="button"
            role="tab"
            aria-selected={index === step}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-sm transition-colors",
              boardFocusClass,
              boardChoiceClass(index === step),
            )}
            onClick={() => setStep(index)}
          >
            Hop {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Hop
          from={
            <Piece
              kind={current.hop.from.kind}
              label={current.hop.from.label}
              size="sm"
            />
          }
          to={
            <Piece
              kind={current.hop.to.kind}
              label={current.hop.to.label}
              size="sm"
            />
          }
          label={current.hop.label}
        />
      </div>

      <h3 className="mt-4 font-heading text-lg">{current.title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {current.body}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-[11px] leading-relaxed text-foreground">
        {current.act}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        {lane === "oauth" ? (
          <>
            <Pass label="subject_token" variant="plain" />
            <Pass
              label="act"
              variant={step === 0 ? "plain" : "identity"}
              active={step > 0}
              hint="Nested actor — grows, does not replace sub"
            />
          </>
        ) : (
          <>
            <Pass label="WIT" variant="sealed" hint="Workload identity JWT — not Bearer" />
            <Pass label="WPT" variant="dpop" hint="Per-request proof glued to the WIT key" />
          </>
        )}
      </div>
    </InOneBoard>
  );
}
