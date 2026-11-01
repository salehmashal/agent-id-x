import {
  egChip,
  specChip,
  type AgentFlow,
  type FlowStep,
  type PayloadChip,
  type TopologyKind,
} from "@/lib/types";

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

export function inferActorKind(label: string): TopologyKind {
  const l = label.toLowerCase();
  if (/thief/.test(l)) return "other";
  if (
    /user|alice|human|authentication device|resource owner/.test(l) &&
    !/agent/.test(l)
  ) {
    return "user";
  }
  if (
    /person server|authorization server|\bas\b|openid provider|\bop\b|oauth as|\bidp\b/.test(
      l,
    )
  ) {
    return "as";
  }
  if (/agent provider|\bprovider\b/.test(l)) return "other";
  if (/\bmcp server\b|resource server|\bapis?\b|\btool\b/.test(l) && !/agent/.test(l)) {
    return "resource";
  }
  if (/spire|workload|spiffe/.test(l)) return "workload";
  if (/agent|mcp client|mcp host|\bhost\b/.test(l)) return "agent";
  if (/resource/.test(l)) return "resource";
  return "other";
}
