import type { AgentFlow, FlowStep, TopologyKind } from "@/lib/types";

export type PacketKind =
  | "request"
  | "token"
  | "id-token"
  | "proof"
  | "challenge"
  | "card"
  | "consent"
  | "session"
  | "code";

export interface AnimationActor {
  id: string;
  label: string;
  kind: TopologyKind;
}

export interface AnimationPacket {
  kind: PacketKind;
  label: string;
}

export interface AnimationHeldToken {
  actorId: string;
  label: string;
  packet: PacketKind;
}

export interface AnimationStep {
  id: string;
  from: string;
  to: string;
  action: string;
  note?: string;
  chapter?: string;
  durationMs?: number;
  packet?: AnimationPacket;
  challenge?: boolean;
  fail?: boolean;
  tokensAppear?: AnimationHeldToken[];
}

export interface ProtocolAnimation {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  actors: AnimationActor[];
  steps: AnimationStep[];
  footnote?: string;
  loop?: boolean;
}

const DEFAULT_DURATION_MS = 2600;

function actor(id: string, label: string, kind: TopologyKind): AnimationActor {
  return { id, label, kind };
}

function hop(
  id: string,
  from: string,
  to: string,
  action: string,
  extra: Partial<AnimationStep> = {},
): AnimationStep {
  return { id, from, to, action, durationMs: extra.durationMs ?? DEFAULT_DURATION_MS, ...extra };
}
