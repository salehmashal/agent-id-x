import type { AgentFlow } from "@/lib/types";

export const flows: AgentFlow[] = [
  {
    slug: "user-delegated-api",
    title: "User-delegated agent calling APIs",
    summary:
      "A human authorizes an agent (as an OAuth client) to call an API. OAuth 2.1 + PKCE + audience-restricted JWT access tokens. This is still the production default.",
    pattern: "user-delegated",
    actors: ["User", "Agent (OAuth client)", "Authorization server", "Resource server"],
    steps: [
      {
        from: "User",
        to: "Agent",
        action: "Asks the agent to do something that needs an API",
      },
      {
        from: "Agent",
        to: "Authorization server",
        action:
          "Authorization Code + PKCE (PAR if the request is rich). scope + resource=API URI",
        note: "Browser or native-app redirect, or CIBA if the user is on another device",
      },
      {
        from: "User",
        to: "Authorization server",
        action: "Authenticates (OIDC) and consents",
      },
      {
        from: "Authorization server",
        to: "Agent",
        action: "Issues access token (RFC 9068 JWT) and optional refresh token",
        note: "Prefer DPoP or mTLS binding so a stolen token is not enough",
      },
      {
        from: "Agent",
        to: "Resource server",
        action: "Authorization: Bearer (or DPoP) with aud = this API",
      },
    ],
    specs: [
      "oauth-2-1",
      "pkce",
      "oidc-core",
      "jwt-access-tokens",
      "resource-indicators",
      "dpop",
    ],
    caveats:
      "The API sees a client_id and a user sub. It does not automatically see a distinct 'which agent instance' identity unless you put one in claims or use AAuth/WIMSE alongside.",
    detail: [
      "This is still the production default. MCP HTTP is this pattern with RFC 9728 discovery bolted on the front. FAPI 2.0 is this pattern with PAR and sender-constraint made mandatory.",
      "If you need the tool to know which binary called, add SPIFFE/WIMSE on the same request in a different header. If you need the tool to know a portable agent identity without a client_id, that is AAuth — a different flow.",
    ],
    alsoSee: ["agent-as-client-mcp", "p2p-identity-based"],
  },
  {
    slug: "p2p-identity-based",
    title: "Peer-to-peer: AAuth identity-based access",
    summary:
      "No authorization server in the path. The agent signs the request; the resource decides from cryptographic identity. This is the 'p2p' that sits next to AAuth.",
    pattern: "p2p",
    actors: ["Agent", "Agent provider (JWKS)", "Resource"],
    steps: [
      {
        from: "Agent provider",
        to: "Agent",
        action: "Issues aa-agent+jwt bound to the agent's signing key",
      },
      {
        from: "Agent",
        to: "Resource",
        action:
          "Signed HTTP request: Signature-Key (jwt) + Signature-Input + Signature",
      },
      {
        from: "Resource",
        to: "Agent provider",
        action: "Fetches JWKS via iss + dwk well-known document",
      },
      {
        from: "Resource",
        to: "Agent",
        action: "Allows or denies based on local policy for that agent identifier",
        note: "No token exchange, no person server, no OAuth redirect. 401 requirement=agent-token if the signature was missing.",
      },
    ],
    specs: ["aauth", "http-signature-keys", "http-message-signatures"],
    caveats:
      "The resource learns who the agent is, not necessarily which human it serves. For user claims, step up to two-party interaction or three-party PS-asserted mode. Individual draft — pin a revision. Draft-10 has four modes; the editor's copy adds person-identity as a fifth.",
    detail: [
      "This is the AAuth meaning of p2p: agent and resource, no authorization server, no person server. It is as complete as AAuth two-party for the identity question and weaker for the user question.",
      "It is not A2A (no Agent Card, no tasks). It is not did:peer (the identifier is published at a well-known URL so a stranger can verify a first request). It is not OAuth client-credentials (no client_id, no Bearer access token).",
      "Wire: Signature-Key (scheme=jwt, aa-agent+jwt) + RFC 9421 Signature-Input/Signature. Cover signature-key in the signature base. Resource metadata access_mode=agent-token is advisory.",
    ],
    alsoSee: ["p2p-two-party", "a2a-agent-to-agent", "three-party-aauth"],
  },
  {
    slug: "p2p-two-party",
    title: "Peer-to-peer: AAuth two-party (resource-managed)",
    summary:
      "Still no external AS. The resource runs consent/account creation itself, then issues an opaque session token for subsequent signed calls.",
    pattern: "p2p",
    actors: ["Agent", "Resource", "User (at the resource's interaction URL)"],
    steps: [
      {
        from: "Agent",
        to: "Resource",
        action: "Signed call with agent token",
      },
      {
        from: "Resource",
        to: "Agent",
        action: "401/202 + AAuth-Requirement: interaction",
        note: "First call can be registration, payment, or consent",
      },
      {
        from: "User",
        to: "Resource",
        action: "Completes the resource's own page (or existing OAuth/OIDC behind it)",
      },
      {
        from: "Resource",
        to: "Agent",
        action: "AAuth-Access session token (opaque to the agent)",
      },
      {
        from: "Agent",
        to: "Resource",
        action: "Subsequent calls: signature + Authorization: AAuth <session>",
      },
    ],
    specs: ["aauth", "http-signature-keys", "oidc-core"],
    caveats:
      "The resource may wrap an ordinary OAuth token inside the opaque session. Two-party is 'p2p' in the sense of agent↔resource, not in the DIDComm sense. Editor's copy calls the opaque credential a session token (session-token) rather than aauth-access-token.",
    detail: [
      "Compare with identity-based: both are two HTTP parties and no AS. Identity-based stops at 'I know this agent'. Two-party adds 'the resource ran its own consent and issued a session bound to the agent's key'. Stolen session without the signing key should not replay.",
      "Compare with A2A: the resource here is an HTTP API, not an A2A server advertising skills. Compare with did:peer: the resource may never have seen the agent before; discovery is a 401 AAuth-Requirement, not an exchanged DID document.",
      "The resource's login page MAY be ordinary OIDC. That does not make this hop an OAuth authorization-code flow from the agent's point of view — the agent never talks to that AS.",
    ],
    alsoSee: ["p2p-identity-based", "a2a-agent-to-agent", "user-delegated-api"],
  },
  {
    slug: "agent-as-client-mcp",
    title: "Agent host as OAuth client (MCP HTTP)",
    summary:
      "The MCP client discovers how to authorize from Protected Resource Metadata and performs OAuth 2.1. The model never sees a protocol other than 'call this tool'.",
    pattern: "agent-as-client",
    actors: ["User", "MCP client (agent host)", "MCP server", "Authorization server"],
    steps: [
      {
        from: "MCP client",
        to: "MCP server",
        action: "Unauthenticated HTTP request",
      },
      {
        from: "MCP server",
        to: "MCP client",
        action: "401 + WWW-Authenticate resource_metadata URL (RFC 9728)",
      },
      {
        from: "MCP client",
        to: "Authorization server",
        action:
          "Discover AS (RFC 8414 / OIDC), CIMD or DCR, Authorization Code + PKCE, resource=MCP URI",
      },
      {
        from: "MCP client",
        to: "MCP server",
        action: "Authorization: Bearer. Server checks audience == itself",
      },
    ],
    specs: ["mcp-auth", "oauth-2-1", "prm", "cimd", "resource-indicators"],
    caveats:
      "Stdio MCP MUST NOT use this profile. Tokens must not be forwarded to other servers. CIMD is preferred; DCR is deprecated in the 2026-07-28 spec. The spec cites OAuth 2.1 draft-13 and CIMD draft-00; implement current revisions for token handling.",
    detail: [
      "The model never sees OAuth. The host is the client. Audience validation at the MCP server is the difference between a calendar token and a payments incident.",
    ],
    alsoSee: ["user-delegated-api"],
  },
  {
    slug: "agent-as-resource",
    title: "Agent as resource (others call it)",
    summary:
      "Your agent exposes an HTTP API or A2A skill. Callers authenticate using whatever the Agent Card or Protected Resource Metadata advertises.",
    pattern: "agent-as-resource",
    actors: ["Calling agent", "Your agent (RS)", "Optional AS"],
    steps: [
      {
        from: "Calling agent",
        to: "Your agent",
        action: "Fetches Agent Card or RFC 9728 metadata",
      },
      {
        from: "Calling agent",
        to: "AS or your agent",
        action:
          "Obtains credentials: OAuth client credentials, mTLS, AAuth identity-based, or API key (last resort)",
      },
      {
        from: "Calling agent",
        to: "Your agent",
        action: "Authenticated task/API request (A2A-Version or signed HTTP)",
      },
    ],
    specs: ["a2a", "prm", "aauth", "mtls", "oauth-2-1"],
    caveats:
      "A2A signed Agent Cards prove the card was not tampered with; they do not authenticate the request. Still require a request-level scheme.",
  },
  {
    slug: "a2a-agent-to-agent",
    title: "Agent-to-agent tasks (A2A)",
    summary:
      "Discovery and task delegation between opaque agents. Authentication is declared, not invented: OAuth, OIDC, mTLS, or API keys.",
    pattern: "p2p",
    actors: ["Client agent", "Server agent", "Enterprise AS (optional)"],
    steps: [
      {
        from: "Server agent",
        to: "Client agent",
        action: "GET /.well-known/agent-card.json (optionally verify JWS)",
      },
      {
        from: "Client agent",
        to: "AS",
        action: "If the card says OAuth/OIDC, obtain a token out of band",
      },
      {
        from: "Client agent",
        to: "Server agent",
        action: "Authenticated A2A operation on a supported interface",
      },
    ],
    specs: ["a2a", "oauth-2-0", "oidc-core", "mtls"],
    caveats:
      "This is p2p communication, not p2p AAuth. Inside a mesh you may additionally pass WIMSE proofs or transaction tokens. Implicit and password OAuth flows on Agent Cards are deprecated.",
    detail: [
      "A2A v1.0 is how agents talk: Agent Cards, skills, tasks, JSON-RPC/gRPC/HTTP+JSON. Authentication is declared, not invented. A signed card is tamper evidence.",
      "If the card says OAuth client credentials, the hop has no user — that is peer access using OAuth as a credential format, not AAuth identity-based access. If the card says authorization code, the hop became user-delegated while still being A2A communication.",
      "In-band credential exchange across a chain of A2A agents exposes secrets to every hop (A2A §7.6.3). Prefer out-of-band.",
    ],
    alsoSee: ["p2p-identity-based", "p2p-two-party", "agent-as-resource"],
  },
  {
    slug: "three-party-aauth",
    title: "AAuth three-party (PS-asserted user claims)",
    summary:
      "The resource has no AS of its own. It accepts identity claims from the agent's person server after the user consents at the PS.",
    pattern: "user-delegated",
    actors: ["Agent", "Resource", "Person server", "User"],
    steps: [
      {
        from: "Agent",
        to: "Resource",
        action: "Signed request; resource sees ps claim on the agent token",
      },
      {
        from: "Resource",
        to: "Agent",
        action: "401 requirement=auth-token plus resource token (aud = PS)",
      },
      {
        from: "Agent",
        to: "Person server",
        action: "Signed POST of the resource token to token_endpoint",
        note: "May 202 + interaction if the user must approve a mission or scope",
      },
      {
        from: "Person server",
        to: "Agent",
        action: "aa-auth+jwt with user claims and consent",
      },
      {
        from: "Agent",
        to: "Resource",
        action: "Retry with auth token; resource applies its own policy to (iss, sub)",
      },
    ],
    specs: ["aauth", "http-signature-keys", "oidc-core"],
    caveats:
      "sub is directed per issuer. The same email from two person servers is two subjects. Draft-10 vs editor's copy may differ on person tokens and a fifth mode. Editor's copy splits token_endpoint into person_token_endpoint and auth_token_endpoint.",
    detail: [
      "This is user-delegated AAuth, not p2p. The agent still signs every HTTP call; the grant comes from the PS as aa-auth+jwt (≤ 1 hour, cnf-bound to the agent key, aud = resource).",
      "Four-party adds a resource-side access server. The agent still only talks to the resource and its PS; the PS federates. That federation is not OpenID Federation and not OAuth identity chaining.",
    ],
    alsoSee: ["p2p-identity-based", "p2p-two-party", "ciba-hitl"],
  },
  {
    slug: "multi-hop-obo",
    title: "Multi-hop on-behalf-of (Token Exchange + chaining)",
    summary:
      "The user authorizes Agent A. A calls Service B. B must call API C in another domain without pretending to be the user or widening scope.",
    pattern: "multi-hop",
    actors: ["User", "Agent A", "AS A", "AS B", "API C"],
    steps: [
      {
        from: "User",
        to: "AS A",
        action: "Delegates to Agent A (OAuth 2.1 / OIDC)",
      },
      {
        from: "Agent A",
        to: "AS A",
        action:
          "Token exchange: subject = user token, actor = agent, attenuated scope, aud toward B",
        note: "RFC 8693 act claim records the agent",
      },
      {
        from: "Agent A",
        to: "AS A",
        action:
          "If crossing domains: exchange for a JWT grant aud=AS B (identity chaining)",
      },
      {
        from: "Agent A",
        to: "AS B",
        action: "RFC 7523 JWT bearer grant → access token for API C",
      },
      {
        from: "Agent A",
        to: "API C",
        action: "Present audience-restricted, preferably PoP-bound token",
      },
    ],
    specs: [
      "token-exchange",
      "jwt-access-tokens",
      "identity-chaining",
      "xaa",
      "transaction-tokens",
    ],
    caveats:
      "Never expand scopes at a hop. Inside one domain, transaction tokens carry immutable purpose. Across domains, identity chaining is in the RFC Editor queue — still cite the draft until an RFC number exists.",
  },
  {
    slug: "ciba-hitl",
    title: "Human-in-the-loop via CIBA",
    summary:
      "The agent is unattended. It needs a specific approval on the user's phone before a sensitive tool runs.",
    pattern: "consent",
    actors: ["Agent", "OpenID provider", "User (authentication device)"],
    steps: [
      {
        from: "Agent",
        to: "OpenID provider",
        action:
          "Backchannel authorize: login_hint, scope, binding_message describing the action",
      },
      {
        from: "OpenID provider",
        to: "User",
        action: "Push / app notification with the binding message",
      },
      {
        from: "User",
        to: "OpenID provider",
        action: "Approve or deny",
      },
      {
        from: "Agent",
        to: "OpenID provider",
        action: "Poll token endpoint with grant_type CIBA + auth_req_id",
      },
    ],
    specs: ["ciba", "oidc-core", "step-up", "fapi-2"],
    caveats:
      "CIBA authenticates/consents a grant; it does not replace resource-server policy. For enterprise pre-approved app connections, XAA may avoid a prompt entirely — that is a different control.",
  },
  {
    slug: "workload-then-user",
    title: "Workload identity plus user delegation",
    summary:
      "SPIFFE/WIMSE proves which agent binary is calling. OAuth proves which user it may act for. Both are required in production meshes.",
    pattern: "multi-hop",
    actors: ["SPIRE", "Agent workload", "OAuth AS", "Tool"],
    steps: [
      {
        from: "SPIRE",
        to: "Agent",
        action: "Issues X.509-SVID or WIT+WPT material",
      },
      {
        from: "Agent",
        to: "OAuth AS",
        action: "Client authentication via SPIFFE (or mTLS RFC 8705) + user grant",
      },
      {
        from: "Agent",
        to: "Tool",
        action: "mTLS (workload) + access token (user) or Txn-Token context",
      },
    ],
    specs: ["spiffe", "wimse-arch", "spiffe-client-auth", "oauth-2-1", "transaction-tokens"],
    caveats:
      "Do not stuff the user into the SPIFFE ID. Do not skip workload identity because you have an OAuth token — a stolen user token presented by a different binary is a different incident.",
  },
];

export function getFlow(slug: string): AgentFlow | undefined {
  return flows.find((flow) => flow.slug === slug);
}

export function searchFlows(query: string): AgentFlow[] {
  const q = query.trim().toLowerCase();
  if (!q) return flows;
  return flows.filter((flow) =>
    [flow.title, flow.summary, flow.caveats, ...flow.actors, ...(flow.detail ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
