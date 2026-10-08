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

function actor(
  id: string,
  label: string,
  kind: TopologyKind,
): AnimationActor {
  return { id, label, kind };
}

function hop(
  id: string,
  from: string,
  to: string,
  action: string,
  extra: Partial<AnimationStep> = {},
): AnimationStep {
  return {
    id,
    from,
    to,
    action,
    durationMs: extra.durationMs ?? DEFAULT_DURATION_MS,
    ...extra,
  };
}

const oauth21: ProtocolAnimation = {
  id: "oauth-2-1",
  title: "Authorization code + PKCE",
  kicker: "Animated sequence · OAuth 2.1",
  summary:
    "The interactive default in OAuth 2.1: a code, a PKCE verifier, tokens in the Authorization header. No implicit grant, no password grant, no access token in the URL.",
  loop: true,
  actors: [
    actor("user", "User", "user"),
    actor("agent", "Agent (client)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("rs", "Resource server", "resource"),
  ],
  steps: [
    hop(
      "ask",
      "user",
      "agent",
      "Asks the agent to call an API that needs a pass",
      { packet: { kind: "consent", label: "task" }, chapter: "Front channel" },
    ),
    hop(
      "authz",
      "agent",
      "as",
      "Authorization request: PKCE S256 + resource= API URI (PAR if the request is rich)",
      {
        packet: { kind: "proof", label: "code_challenge" },
        note: "The verifier stays with the agent. Only the hash goes to the AS.",
      },
    ),
    hop(
      "consent",
      "user",
      "as",
      "Authenticates (OIDC if you need who) and consents",
      { packet: { kind: "consent", label: "consent" } },
    ),
    hop(
      "code",
      "as",
      "agent",
      "Authorization code in the redirect — never an access token in the URL",
      { packet: { kind: "code", label: "code" } },
    ),
    hop(
      "redeem",
      "agent",
      "as",
      "Token request: code + code_verifier. AS hashes and matches S256",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Back channel",
      },
    ),
    hop(
      "mint",
      "as",
      "agent",
      "Issues an access token (and maybe a refresh token). Header only.",
      {
        packet: { kind: "token", label: "access token" },
        tokensAppear: [
          { actorId: "agent", label: "access token", packet: "token" },
        ],
      },
    ),
    hop(
      "call",
      "agent",
      "rs",
      "Authorization header to the API — Bearer or DPoP, never the query string",
      { packet: { kind: "token", label: "Authorization" } },
    ),
  ],
  footnote:
    "OAuth 2.1 is still draft-ietf-oauth-v2-1-16 (3 September 2026), not an RFC. MCP HTTP is this shape with RFC 9728 discovery on the front.",
};
