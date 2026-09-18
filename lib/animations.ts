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

const oidc: ProtocolAnimation = {
  id: "oidc-core",
  title: "Nametag stays home; pass goes to the API",
  kicker: "Animated sequence · OIDC",
  summary:
    "The token endpoint returns two tickets. The ID Token authenticates the user to the client. The access token is the pass for the API. They are not interchangeable.",
  loop: true,
  actors: [
    actor("user", "User", "user"),
    actor("op", "OpenID provider", "as"),
    actor("agent", "Agent (RP)", "agent"),
    actor("api", "API / MCP server", "resource"),
  ],
  steps: [
    hop("login", "user", "op", "Authenticates at the OpenID provider", {
      packet: { kind: "consent", label: "login" },
      chapter: "Who signed in",
    }),
    hop(
      "id",
      "op",
      "agent",
      "ID Token — aud is the client_id. This nametag stays with the agent",
      {
        packet: { kind: "id-token", label: "ID Token" },
        tokensAppear: [
          { actorId: "agent", label: "ID Token", packet: "id-token" },
        ],
      },
    ),
    hop(
      "at",
      "op",
      "agent",
      "Access token — a different ticket, for a resource",
      {
        packet: { kind: "token", label: "access token" },
        tokensAppear: [
          { actorId: "agent", label: "access token", packet: "token" },
        ],
        chapter: "What the API may do",
      },
    ),
    hop(
      "call",
      "agent",
      "api",
      "Only the access token goes to the API (aud = this API)",
      { packet: { kind: "token", label: "access token" } },
    ),
    hop(
      "mixup",
      "agent",
      "api",
      "Sending the ID Token to the API is the classic mix-up — wrong audience",
      {
        packet: { kind: "id-token", label: "ID Token" },
        fail: true,
        challenge: true,
        note: "The nametag is not a pass. MCP servers must reject it.",
      },
    ),
  ],
  footnote:
    "OpenID Connect is the identity layer on OAuth. An ID Token is not an access token.",
};

const aauth: ProtocolAnimation = {
  id: "aauth",
  title: "Identity-based, then three-party",
  kicker: "Animated sequence · AAuth",
  summary:
    "AAuth p2p is signed HTTP with an agent token — no Agent Card, no did:peer handshake. If the resource needs user claims, it steps up to a person server. That is not A2A.",
  loop: true,
  actors: [
    actor("provider", "Agent provider", "other"),
    actor("agent", "Agent", "agent"),
    actor("resource", "Resource", "resource"),
    actor("ps", "Person server", "as"),
    actor("user", "User", "user"),
  ],
  steps: [
    hop(
      "issue",
      "provider",
      "agent",
      "Issues aa-agent+jwt bound to the agent's signing key",
      {
        packet: { kind: "proof", label: "aa-agent+jwt" },
        chapter: "Identity-based (AAuth p2p)",
        tokensAppear: [
          { actorId: "agent", label: "aa-agent+jwt", packet: "proof" },
        ],
      },
    ),
    hop(
      "signed",
      "agent",
      "resource",
      "Signed HTTP: Signature-Key (jwt) + Signature-Input + Signature",
      {
        packet: { kind: "proof", label: "RFC 9421" },
        note: "Cover signature-key in the signature base. No Bearer access token.",
      },
    ),
    hop(
      "jwks",
      "resource",
      "provider",
      "Fetches JWKS via iss + dwk well-known document",
      { packet: { kind: "request", label: "JWKS" } },
    ),
    hop(
      "decide",
      "resource",
      "agent",
      "Allows or denies from local policy for that agent identifier",
      {
        packet: { kind: "consent", label: "policy" },
        note: "The resource knows which agent called — not which human it serves.",
      },
    ),
    hop(
      "see-ps",
      "agent",
      "resource",
      "Signed call; resource sees a ps claim and wants user claims",
      {
        packet: { kind: "proof", label: "aa-agent+jwt" },
        chapter: "Three-party (PS-asserted)",
      },
    ),
    hop(
      "need-auth",
      "resource",
      "agent",
      "401 AAuth-Requirement: auth-token, plus a resource token (aud = PS)",
      {
        packet: { kind: "challenge", label: "401 auth-token" },
        challenge: true,
        tokensAppear: [
          { actorId: "agent", label: "resource token", packet: "token" },
        ],
      },
    ),
    hop(
      "to-ps",
      "agent",
      "ps",
      "Signed POST of the resource token to the person server",
      { packet: { kind: "token", label: "resource token" } },
    ),
    hop("user-ok", "user", "ps", "Approves the mission or scope at the PS", {
      packet: { kind: "consent", label: "consent" },
    }),
    hop(
      "auth-jwt",
      "ps",
      "agent",
      "aa-auth+jwt with user claims, cnf-bound to the agent key, aud = resource",
      {
        packet: { kind: "token", label: "aa-auth+jwt" },
        tokensAppear: [
          { actorId: "agent", label: "aa-auth+jwt", packet: "token" },
        ],
      },
    ),
    hop(
      "retry",
      "agent",
      "resource",
      "Retry signed HTTP with the auth token; resource applies policy to (iss, sub)",
      { packet: { kind: "token", label: "aa-auth+jwt" } },
    ),
  ],
  footnote:
    "Not A2A (no Agent Card, no tasks). Not did:peer (the identifier is published so a stranger can verify a first request). Draft-10 has four modes; the editor's copy adds person-identity as a fifth.",
};

const dpop: ProtocolAnimation = {
  id: "dpop",
  title: "Photocopy, or pass glued to a key",
  kicker: "Animated sequence · DPoP vs Bearer",
  summary:
    "A Bearer token is a photocopy: whoever holds the string may use it. DPoP glues the pass to a key. Stolen paper without the private key is a blank.",
  loop: true,
  actors: [
    actor("as", "Authorization server", "as"),
    actor("agent", "Client with key", "agent"),
    actor("api", "API", "resource"),
    actor("thief", "Thief", "other"),
  ],
  steps: [
    hop("mint-b", "as", "agent", "Mints a Bearer access token — just a string", {
      packet: { kind: "token", label: "Bearer" },
      chapter: "Bearer photocopy",
      tokensAppear: [{ actorId: "agent", label: "Bearer", packet: "token" }],
    }),
    hop("use-b", "agent", "api", "Authorization: Bearer — the API trusts the string", {
      packet: { kind: "token", label: "Bearer" },
    }),
    hop(
      "steal",
      "agent",
      "thief",
      "Logs, traces, or prompt injection photocopy the string",
      { packet: { kind: "token", label: "photocopy" } },
    ),
    hop(
      "replay",
      "thief",
      "api",
      "Same pass, no key needed — the API cannot tell",
      { packet: { kind: "token", label: "Bearer" } },
    ),
    hop(
      "mint-d",
      "as",
      "agent",
      "DPoP: access token carries cnf.jkt (thumbprint of the client's key)",
      {
        packet: { kind: "proof", label: "cnf.jkt" },
        chapter: "DPoP glued to a key",
        tokensAppear: [{ actorId: "agent", label: "DPoP token", packet: "proof" }],
      },
    ),
    hop(
      "use-d",
      "agent",
      "api",
      "Each request: token + short-lived proof JWT covering method and URL",
      { packet: { kind: "proof", label: "pass + proof" } },
    ),
    hop(
      "fail",
      "thief",
      "api",
      "Photocopy without the private key — 401, the paper is a blank",
      {
        packet: { kind: "token", label: "stolen string" },
        fail: true,
        challenge: true,
      },
    ),
  ],
  footnote:
    "RFC 9449. DPoP is application-layer proof and works through TLS proxies. AAuth uses HTTP Message Signatures instead — do not stack proofs naively.",
};

const tokenExchange: ProtocolAnimation = {
  id: "token-exchange",
  title: "act grows down the chain",
  kicker: "Animated sequence · RFC 8693",
  summary:
    "Token exchange mints a new pass for a new audience or a narrower scope. The act claim records who is holding it. Attenuate — never expand. Nested act is a chain of hands, not a new user.",
  loop: true,
  actors: [
    actor("user", "Alice", "user"),
    actor("agent1", "Agent 1", "agent"),
    actor("as", "Authorization server", "as"),
    actor("agent2", "Agent 2", "agent"),
    actor("api", "API B", "resource"),
  ],
  steps: [
    hop(
      "alice",
      "user",
      "as",
      "Alice's access token. sub is Alice. No act yet",
      {
        packet: { kind: "token", label: "sub=Alice" },
        chapter: "Subject, then actor",
        tokensAppear: [
          { actorId: "agent1", label: "subject_token", packet: "token" },
        ],
      },
    ),
    hop(
      "ex1",
      "agent1",
      "as",
      "Token exchange: subject = user token, actor = agent, narrower scope",
      { packet: { kind: "token", label: "urn:...token-exchange" } },
    ),
    hop(
      "act1",
      "as",
      "agent1",
      "New pass. act names Agent 1. sub is still Alice",
      {
        packet: { kind: "id-token", label: "act: agent-1" },
        tokensAppear: [
          { actorId: "agent1", label: "act: agent-1", packet: "id-token" },
        ],
      },
    ),
    hop(
      "ex2",
      "agent2",
      "as",
      "Another exchange. The chain grows; scope must not widen",
      {
        packet: { kind: "token", label: "subject_token" },
        chapter: "Nested act",
      },
    ),
    hop(
      "act2",
      "as",
      "agent2",
      "act: { iss: agent-2, act: { iss: agent-1 } }",
      {
        packet: { kind: "id-token", label: "nested act" },
        tokensAppear: [
          { actorId: "agent2", label: "nested act", packet: "id-token" },
        ],
      },
    ),
    hop(
      "call",
      "agent2",
      "api",
      "Audience-restricted token at API B. Audit can still name every pair of hands",
      { packet: { kind: "token", label: "aud=API B" } },
    ),
  ],
  footnote:
    "RFC 8693 does not by itself define cross-domain trust — identity chaining profiles it with RFC 7523. Never expand scopes at a hop.",
};

const ciba: ProtocolAnimation = {
  id: "ciba",
  title: "Approval on another device",
  kicker: "Animated sequence · CIBA",
  summary:
    "The agent is unattended. It needs a specific approval on the user's phone before a sensitive tool runs. CIBA is that decoupled grant — not resource-server policy.",
  loop: true,
  actors: [
    actor("agent", "Agent", "agent"),
    actor("op", "OpenID provider", "as"),
    actor("user", "User (phone)", "user"),
  ],
  steps: [
    hop(
      "bc",
      "agent",
      "op",
      "Backchannel authorize: login_hint, scope, binding_message describing the action",
      {
        packet: { kind: "request", label: "CIBA auth" },
        chapter: "Consumption device",
      },
    ),
    hop(
      "push",
      "op",
      "user",
      "Push / app notification with the same binding message",
      {
        packet: { kind: "consent", label: "binding_message" },
        chapter: "Authentication device",
      },
    ),
    hop("decide", "user", "op", "Approve or deny on the phone", {
      packet: { kind: "consent", label: "approve" },
    }),
    hop(
      "poll",
      "agent",
      "op",
      "Poll the token endpoint: grant_type CIBA + auth_req_id",
      { packet: { kind: "request", label: "auth_req_id" } },
    ),
    hop("tokens", "op", "agent", "Issues the grant the agent needed for that action", {
      packet: { kind: "token", label: "tokens" },
      tokensAppear: [{ actorId: "agent", label: "access token", packet: "token" }],
    }),
  ],
  footnote:
    "CIBA authenticates and consents a grant. It does not replace resource-server policy. XAA is a different control for pre-approved app connections.",
};

const mcp: ProtocolAnimation = {
  id: "mcp-auth",
  title: "The host is the OAuth client",
  kicker: "Animated sequence · MCP HTTP",
  summary:
    "ChatGPT / Claude / Cursor calling your tools: vanilla OAuth 2.1 plus protected resource metadata. The model never sees a protocol other than 'call this tool'.",
  loop: true,
  actors: [
    actor("user", "User", "user"),
    actor("host", "MCP host", "agent"),
    actor("server", "MCP server", "resource"),
    actor("as", "Authorization server", "as"),
  ],
  steps: [
    hop("bare", "host", "server", "Unauthenticated HTTP request", {
      packet: { kind: "request", label: "HTTP" },
      chapter: "Discover the door",
    }),
    hop(
      "401",
      "server",
      "host",
      "401 + WWW-Authenticate resource_metadata URL (RFC 9728)",
      { packet: { kind: "challenge", label: "401 metadata" }, challenge: true },
    ),
    hop(
      "authz",
      "host",
      "as",
      "CIMD (preferred) or DCR, authorization code + PKCE, resource= this MCP URI",
      {
        packet: { kind: "proof", label: "PKCE + resource=" },
        chapter: "OAuth 2.1",
      },
    ),
    hop("consent", "user", "as", "Consents. OIDC if the tool needs who", {
      packet: { kind: "consent", label: "consent" },
    }),
    hop(
      "pass",
      "as",
      "host",
      "Access token with aud = this MCP server — not a portable agent identity",
      {
        packet: { kind: "token", label: "aud=MCP URI" },
        tokensAppear: [
          { actorId: "host", label: "Bearer (this server)", packet: "token" },
        ],
      },
    ),
    hop(
      "call",
      "host",
      "server",
      "Authorization: Bearer. Server checks audience == itself",
      { packet: { kind: "token", label: "Bearer" } },
    ),
  ],
  footnote:
    "MCP 2026-07-28 is an OAuth 2.1 profile, not an RFC. Stdio transports must not use this. Photocopy until you add DPoP. Never forward the pass to another audience. Not AAuth p2p.",
};

const a2a: ProtocolAnimation = {
  id: "a2a",
  title: "The card is a catalog, not a login",
  kicker: "Animated sequence · A2A",
  summary:
    "A2A is how agents talk: Agent Cards, skills, tasks. Authentication is declared on the card and obtained out of band. A signed card is tamper evidence, not a request credential.",
  loop: true,
  actors: [
    actor("client", "Client agent", "agent"),
    actor("server", "Server agent", "agent"),
    actor("as", "Enterprise AS", "as"),
  ],
  steps: [
    hop(
      "publish",
      "server",
      "client",
      "GET /.well-known/agent-card.json — skills + securitySchemes",
      {
        packet: { kind: "card", label: "Agent Card" },
        chapter: "Catalog",
        tokensAppear: [
          { actorId: "client", label: "Agent Card", packet: "card" },
        ],
      },
    ),
    hop(
      "jws",
      "server",
      "client",
      "Optional JWS on the card — wax seal on the catalog, not a login",
      { packet: { kind: "proof", label: "JWS on card" } },
    ),
    hop(
      "oauth",
      "client",
      "as",
      "If the card says OAuth/OIDC, obtain a token out of band",
      {
        packet: { kind: "token", label: "out of band" },
        chapter: "Request auth is ordinary HTTP",
        note: "Implicit and password flows on Agent Cards are deprecated.",
      },
    ),
    hop(
      "task",
      "client",
      "server",
      "Authenticated A2A operation (JSON-RPC / gRPC / HTTP+JSON) + A2A-Version",
      { packet: { kind: "request", label: "A2A-Version 1.0" } },
    ),
  ],
  footnote:
    "Wrong cousins: AAuth identity-based p2p (signed HTTP, no Agent Card) and did:peer (pairwise, not globally fetched). A2A §7.6.3 — do not forward caller credentials in-band down the chain.",
};

const wimse: ProtocolAnimation = {
  id: "wimse-arch",
  title: "Each hop re-binds",
  kicker: "Animated sequence · WIMSE",
  summary:
    "WIT names the binary. WPT or mTLS is the seal. A hop authenticates as itself — it does not replay the previous workload's identity. User context travels in another header.",
  loop: true,
  actors: [
    actor("spire", "SPIRE", "workload"),
    actor("a", "Workload A", "workload"),
    actor("b", "Workload B", "workload"),
    actor("c", "Workload C", "workload"),
    actor("user", "Alice (context)", "user"),
  ],
  steps: [
    hop("wit", "spire", "a", "Issues WIT (and WPT material). sub is the binary, not Alice", {
      packet: { kind: "proof", label: "WIT" },
      chapter: "Workload identity",
      tokensAppear: [{ actorId: "a", label: "WIT", packet: "proof" }],
    }),
    hop("a2b", "a", "b", "WIT + WPT (or mTLS). Never put WIT in Authorization: Bearer", {
      packet: { kind: "proof", label: "WIT+WPT" },
    }),
    hop(
      "rebind",
      "b",
      "c",
      "B authenticates as itself with a new WIT. A's identity is not forwarded",
      {
        packet: { kind: "proof", label: "B's WIT" },
        chapter: "Hop re-bind",
        note: "WIMSE §3.4.11: agent hops MUST re-bind and scope context or a chain silently widens.",
      },
    ),
    hop(
      "user",
      "user",
      "c",
      "If Alice is in the picture, her pass is a separate header (Txn-Token / OAuth)",
      { packet: { kind: "token", label: "Txn-Token" } },
    ),
  ],
  footnote:
    "WIMSE architecture is a WG informational draft, not a protocol RFC. Implement WIT/WPT or SPIFFE for wire. Do not stuff the user into the SPIFFE ID.",
};

const pkce: ProtocolAnimation = {
  id: "pkce",
  title: "Only the process that started the flow can finish it",
  kicker: "Animated sequence · PKCE",
  summary:
    "The agent keeps a high-entropy verifier. The authorization server only sees a hash. An attacker who steals the code from the redirect cannot redeem it.",
  loop: true,
  actors: [
    actor("agent", "Agent (client)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("user", "User", "user"),
  ],
  steps: [
    hop(
      "make",
      "agent",
      "agent",
      "Creates a code_verifier and keeps it. Sends S256(code_verifier) as code_challenge",
      {
        packet: { kind: "proof", label: "S256 challenge" },
        chapter: "Start",
        tokensAppear: [
          { actorId: "agent", label: "code_verifier", packet: "proof" },
        ],
      },
    ),
    hop("send", "agent", "as", "Authorization request carries the challenge, not the verifier", {
      packet: { kind: "proof", label: "code_challenge" },
    }),
    hop("ok", "user", "as", "Authenticates and consents", {
      packet: { kind: "consent", label: "consent" },
    }),
    hop("code", "as", "agent", "Authorization code in the redirect (an interceptor might see this)", {
      packet: { kind: "code", label: "code" },
    }),
    hop(
      "redeem",
      "agent",
      "as",
      "Token request: code + the original verifier. AS hashes and matches",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Redeem",
      },
    ),
    hop("token", "as", "agent", "Match — access token. A stolen code without the verifier fails", {
      packet: { kind: "token", label: "access token" },
    }),
  ],
  footnote:
    "RFC 7636. OAuth 2.1 keeps only S256; the plain method is gone. Generate a new verifier per authorization request.",
};

const par: ProtocolAnimation = {
  id: "par",
  title: "The rich request never rides the URL",
  kicker: "Animated sequence · PAR",
  summary:
    "Pushed Authorization Requests put RAR JSON, many scopes, or a mission description on a back-channel POST. The browser redirect carries only a short request_uri.",
  loop: true,
  actors: [
    actor("agent", "Agent (client)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("user", "User", "user"),
  ],
  steps: [
    hop(
      "push",
      "agent",
      "as",
      "POST the authorization parameters to the PAR endpoint (client authenticates)",
      {
        packet: { kind: "request", label: "rich request" },
        chapter: "Back channel",
      },
    ),
    hop("uri", "as", "agent", "Returns request_uri + expires_in — one-time, short-lived", {
      packet: { kind: "code", label: "request_uri" },
      tokensAppear: [
        { actorId: "agent", label: "request_uri", packet: "code" },
      ],
    }),
    hop(
      "redirect",
      "agent",
      "as",
      "Front-channel redirect: client_id + request_uri only — nothing juicy in logs",
      {
        packet: { kind: "code", label: "request_uri" },
        chapter: "Front channel",
      },
    ),
    hop("consent", "user", "as", "Sees the pushed request and consents", {
      packet: { kind: "consent", label: "consent" },
    }),
    hop("code", "as", "agent", "Authorization code; redeem as usual with PKCE", {
      packet: { kind: "code", label: "code" },
    }),
  ],
  footnote:
    "RFC 9126. FAPI 2.0 and several agent-grant profiles want PAR. Use it whenever an agent would otherwise put a mission on a query string.",
};

export const delegatedCallTeaser: ProtocolAnimation = {
  id: "delegated-call-teaser",
  title: "How a delegated call works",
  kicker: "Animated sequence",
  summary:
    "A human authorizes an agent, as an OAuth client, to call an API. This is still the production default — including MCP HTTP.",
  loop: true,
  actors: [
    actor("user", "User", "user"),
    actor("agent", "Agent", "agent"),
    actor("as", "Authorization server", "as"),
    actor("rs", "API", "resource"),
  ],
  steps: [
    hop("ask", "user", "agent", "Asks the agent to do something that needs an API", {
      packet: { kind: "consent", label: "task" },
      durationMs: 2200,
    }),
    hop(
      "authz",
      "agent",
      "as",
      "Authorization code + PKCE (PAR if the request is rich)",
      { packet: { kind: "proof", label: "PKCE" }, durationMs: 2200 },
    ),
    hop("consent", "user", "as", "Authenticates and consents", {
      packet: { kind: "consent", label: "consent" },
      durationMs: 2200,
    }),
    hop("token", "as", "agent", "Issues an audience-restricted access token", {
      packet: { kind: "token", label: "access token" },
      durationMs: 2200,
    }),
    hop("call", "agent", "rs", "Authorization header to this API — not a photocopy if you add DPoP", {
      packet: { kind: "token", label: "Bearer / DPoP" },
      durationMs: 2400,
    }),
  ],
  footnote: "Walk the full sequence on the Flows page — including AAuth p2p, MCP, A2A, and CIBA.",
};

const specAnimations: Record<string, ProtocolAnimation> = {
  "oauth-2-1": oauth21,
  "oidc-core": oidc,
  aauth,
  dpop,
  "token-exchange": tokenExchange,
  ciba,
  "mcp-auth": mcp,
  a2a,
  "wimse-arch": wimse,
  pkce,
  par,
};

export function getSpecAnimation(slug: string): ProtocolAnimation | undefined {
  return specAnimations[slug];
}

export function specHasAnimation(slug: string): boolean {
  return slug in specAnimations;
}

export function slugifyActor(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "actor";
}

export function inferActorKind(label: string): TopologyKind {
  const l = label.toLowerCase();
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
  if (/\bmcp server\b|resource server|\bapis?\b|\btool\b/.test(l) && !/agent/.test(l)) {
    return "resource";
  }
  if (/spire|workload|spiffe/.test(l)) return "workload";
  if (/agent|mcp client|mcp host|\bhost\b/.test(l)) return "agent";
  if (/resource/.test(l)) return "resource";
  return "other";
}

export function inferPacket(step: FlowStep): AnimationPacket {
  const text = `${step.action} ${step.note ?? ""}`.toLowerCase();
  if (/401|challenge|requirement|www-authenticate/.test(text)) {
    return { kind: "challenge", label: "401" };
  }
  if (/agent card|agent-card/.test(text)) {
    return { kind: "card", label: "Agent Card" };
  }
  if (/id token/.test(text)) {
    return { kind: "id-token", label: "ID Token" };
  }
  if (/dpop/.test(text)) {
    return { kind: "proof", label: "DPoP" };
  }
  if (/session/.test(text)) {
    return { kind: "session", label: "session" };
  }
  if (/aa-auth|auth token/.test(text)) {
    return { kind: "token", label: "aa-auth+jwt" };
  }
  if (/aa-agent|agent token/.test(text)) {
    return { kind: "proof", label: "aa-agent+jwt" };
  }
  if (/wit|wpt|signature|signed http/.test(text)) {
    return { kind: "proof", label: "proof" };
  }
  if (/consent|authenticat|approve/.test(text)) {
    return { kind: "consent", label: "consent" };
  }
  if (/code_verifier|pkce|code_challenge/.test(text)) {
    return { kind: "proof", label: "PKCE" };
  }
  if (/\bcode\b/.test(text)) {
    return { kind: "code", label: "code" };
  }
  if (/token|jwt|bearer/.test(text)) {
    return { kind: "token", label: "token" };
  }
  return { kind: "request", label: "HTTP" };
}

function resolveActorId(
  name: string,
  byId: Map<string, AnimationActor>,
): string {
  const exact = slugifyActor(name);
  if (byId.has(exact)) return exact;
  const lower = name.toLowerCase();
  for (const item of byId.values()) {
    const lab = item.label.toLowerCase();
    if (lab === lower || lab.startsWith(`${lower} `) || lab.startsWith(`${lower}(`)) {
      return item.id;
    }
    const head = lab.split(" (")[0];
    if (head === lower) return item.id;
  }
  const created = actor(exact, name, inferActorKind(name));
  byId.set(exact, created);
  return exact;
}

export function animationFromFlow(flow: AgentFlow): ProtocolAnimation {
  const byId = new Map<string, AnimationActor>();
  for (const name of flow.actors) {
    const id = slugifyActor(name);
    if (!byId.has(id)) {
      byId.set(id, actor(id, name, inferActorKind(name)));
    }
  }
  for (const step of flow.steps) {
    resolveActorId(step.from, byId);
    resolveActorId(step.to, byId);
  }

  const steps: AnimationStep[] = flow.steps.map((step, index) => {
    const packet = inferPacket(step);
    const text = `${step.action} ${step.note ?? ""}`;
    return hop(
      `${flow.slug}-${index}`,
      resolveActorId(step.from, byId),
      resolveActorId(step.to, byId),
      step.action,
      {
        note: step.note,
        durationMs: step.durationMs ?? DEFAULT_DURATION_MS,
        packet,
        challenge: /401|requirement=/i.test(text),
      },
    );
  });

  return {
    id: flow.slug,
    title: flow.title,
    kicker: `Animated sequence · ${flow.pattern}`,
    summary: flow.summary,
    actors: [...byId.values()],
    steps,
    footnote: flow.caveats,
    loop: true,
  };
}

export { DEFAULT_DURATION_MS };
