import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Ban,
  Bot,
  Box,
  Copy,
  Fingerprint,
  GitBranch,
  KeyRound,
  Lock,
  Network,
  Server,
  Shield,
  Stamp,
  User,
  Users,
} from "lucide-react";
import type { TopologyKind } from "@/lib/types";

export type PrincipalId = "user" | "agent" | "workload" | "resource";

export const principalMeta: Record<
  PrincipalId,
  { short: string; icon: LucideIcon; tone: string }
> = {
  user: {
    short: "User",
    icon: User,
    tone: "border-user/50 bg-user/12 text-user",
  },
  agent: {
    short: "Agent",
    icon: Bot,
    tone: "border-agent/50 bg-agent/12 text-agent",
  },
  workload: {
    short: "Workload",
    icon: Server,
    tone: "border-workload/50 bg-workload/12 text-workload",
  },
  resource: {
    short: "Resource",
    icon: Box,
    tone: "border-resource/50 bg-resource/12 text-resource",
  },
};

export const pieceMeta: Record<
  TopologyKind,
  { icon: LucideIcon; tone: string }
> = {
  user: principalMeta.user,
  agent: principalMeta.agent,
  workload: principalMeta.workload,
  resource: principalMeta.resource,
  as: {
    icon: Shield,
    tone: "border-grant/45 bg-grant/10 text-grant",
  },
  other: {
    icon: Network,
    tone: "border-session/45 bg-session/10 text-session",
  },
};

export type TokenKind = "agent" | "person" | "resource" | "auth" | "session";

export const tokenMeta: Record<
  TokenKind,
  { label: string; icon: LucideIcon; tone: string }
> = {
  agent: {
    label: "aa-agent+jwt",
    icon: KeyRound,
    tone: "border-agent/50 bg-agent/12 text-agent",
  },
  person: {
    label: "aa-person+jwt",
    icon: User,
    tone: "border-user/50 bg-user/12 text-user",
  },
  resource: {
    label: "aa-resource+jwt",
    icon: Box,
    tone: "border-resource/50 bg-resource/12 text-resource",
  },
  auth: {
    label: "aa-auth+jwt",
    icon: Stamp,
    tone: "border-grant/50 bg-grant/12 text-grant",
  },
  session: {
    label: "session",
    icon: Copy,
    tone: "border-session/50 bg-session/12 text-session",
  },
};

export const doorMeta = {
  delegated: { icon: KeyRound },
  aauth: { icon: Stamp },
  a2a: { icon: ArrowLeftRight },
  did: { icon: Lock },
} as const;

export const aauthModeMeta = {
  identity: { icon: Bot },
  "two-party": { icon: Users },
  person: { icon: Fingerprint },
  three: { icon: GitBranch },
  four: { icon: Network },
} as const;

export const oauthBanMeta = {
  implicit: { icon: Ban },
  password: { icon: KeyRound },
  url: { icon: Copy },
} as const;

export const boardChoiceClass = (selected: boolean) =>
  selected
    ? "cursor-pointer border-primary bg-primary/10 text-foreground shadow-sm hover:bg-primary/15"
    : "cursor-pointer border-border bg-card text-muted-foreground hover:border-primary/45 hover:bg-muted hover:text-foreground";

export const boardFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
