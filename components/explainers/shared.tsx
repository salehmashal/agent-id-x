"use client";

import type { LucideIcon } from "lucide-react";
import { Copy, KeyRound, Stamp } from "lucide-react";
import type { ReactNode } from "react";
import {
  boardChoiceClass,
  boardFocusClass,
  pieceMeta,
  tokenMeta,
  type TokenKind,
} from "@/lib/identity-visuals";
import type { TopologyKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PieceKind = TopologyKind;

export const pieceTone: Record<PieceKind, string> = {
  user: pieceMeta.user.tone,
  agent: pieceMeta.agent.tone,
  workload: pieceMeta.workload.tone,
  resource: pieceMeta.resource.tone,
  as: pieceMeta.as.tone,
  other: pieceMeta.other.tone,
};

export function InOneBoard({
  kicker = "In one board",
  title,
  id,
  children,
  footnote,
}: {
  kicker?: string;
  title: string;
  id?: string;
  children: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-4 md:p-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
        {kicker}
      </p>
      <h2 className="mt-1 font-heading text-xl leading-tight md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
      {footnote ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}

export function Piece({
  kind,
  label,
  active = true,
  size = "md",
}: {
  kind: PieceKind;
  label: string;
  active?: boolean;
  size?: "xs" | "sm" | "md";
}) {
  const Icon = pieceMeta[kind].icon;
  const iconSize =
    size === "xs" ? "size-3.5" : size === "sm" ? "size-4" : "size-5";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border text-left",
        pieceMeta[kind].tone,
        size === "xs" && "px-1.5 py-0.5",
        size === "sm" && "px-2 py-1",
        size === "md" && "px-2.5 py-1.5",
        !active && "opacity-35",
      )}
    >
      <Icon className={cn("shrink-0", iconSize)} aria-hidden />
      <span
        className={cn(
          "min-w-0 font-mono leading-snug",
          size === "xs" ? "text-[10px]" : "text-[11px]",
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function Seal({ className }: { className?: string }) {
  return (
    <Stamp
      className={cn("size-3.5 shrink-0 text-grant", className)}
      aria-label="signature seal"
    />
  );
}

export type PassVariant =
  | "sealed"
  | "bearer"
  | "dpop"
  | "opaque"
  | "identity"
  | "plain";

const passByVariant: Record<
  PassVariant,
  { tone: string; icon: LucideIcon }
> = {
  sealed: { tone: tokenMeta.agent.tone, icon: Stamp },
  bearer: { tone: "border-dashed border-session/50 bg-session/10 text-session", icon: Copy },
  dpop: { tone: tokenMeta.auth.tone, icon: KeyRound },
  opaque: { tone: tokenMeta.session.tone, icon: Copy },
  identity: { tone: tokenMeta.person.tone, icon: tokenMeta.person.icon },
  plain: { tone: "border-border bg-muted/60 text-foreground", icon: Stamp },
};

export function Pass({
  label,
  variant = "plain",
  token,
  active = true,
  hint,
}: {
  label: string;
  variant?: PassVariant;
  token?: TokenKind;
  active?: boolean;
  hint?: string;
}) {
  const look = token ? tokenMeta[token] : passByVariant[variant];
  const Icon = look.icon;
  return (
    <span
      title={hint}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] leading-snug",
        look.tone,
        active ? "opacity-100" : "opacity-30",
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 break-all">{label}</span>
    </span>
  );
}

export function Hop({
  from,
  to,
  label,
  active = true,
}: {
  from: ReactNode;
  to: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center",
        !active && "opacity-35",
      )}
    >
      <div className="min-w-0">{from}</div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-brass md:text-center">
        <span className="hidden md:inline">→ </span>
        {label}
        <span className="md:hidden"> →</span>
      </p>
      <div className="min-w-0 md:justify-self-end">{to}</div>
    </div>
  );
}

export function ModeTabs({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; hint?: string; icon?: LucideIcon }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            title={option.hint}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors",
              boardFocusClass,
              boardChoiceClass(selected),
            )}
            onClick={() => onChange(option.id)}
          >
            {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function MetaphorLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
  );
}

export function MetaphorLegend() {
  return (
    <aside className="rounded-xl border border-dashed border-border bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
        How to read the boards
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        <li className="flex items-start gap-2">
          <Pass label="access token" variant="plain" />
          <span className="text-sm text-muted-foreground">
            A <span className="text-foreground">pass</span> — permission to
            enter one door.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 inline-flex items-center gap-1">
            <Seal />
            <span className="font-mono text-[11px] text-grant">seal</span>
          </span>
          <span className="text-sm text-muted-foreground">
            A <span className="text-foreground">wax seal</span> — a signature
            proving the key.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Pass label="Bearer" variant="bearer" />
          <span className="text-sm text-muted-foreground">
            A <span className="text-foreground">photocopy</span> anyone who
            holds it can use.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Pass label="DPoP" variant="dpop" />
          <span className="text-sm text-muted-foreground">
            A pass <span className="text-foreground">glued to a key</span> —
            theft of the paper is not enough.
          </span>
        </li>
      </ul>
    </aside>
  );
}
