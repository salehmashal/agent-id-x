import type {
  DeploymentPattern,
} from "@/lib/types";

const agentAsResource: DeploymentPattern = {
  slug: "agent-as-resource",
  title: "Agent as HTTP resource / tool provider",
  matrixTitle: "Agent as resource",
  summary:
    "Others call your agent. You are the resource server: publish how to authorize, then enforce it on every request. RFC 9728, an OAuth-protected resource, A2A Agent Card security schemes, or AAuth resource-managed if you run consent yourself.",
  inTheWild:
    "You shipped an HTTP API that is 'the agent.' You host an MCP server. You publish an A2A Agent Card so other agents can assign you tasks. Callers are other products, other agents, or a mesh sidecar — you do not get to assume a browser on their side.",
  actors: [
    {
      name: "Calling agent / client",
      principal: "agent-instance",
      trust: "Must obtain whatever your metadata advertised. May be an OAuth client, an AAuth signer, or a mesh workload.",
    },
    {
      name: "Your agent (resource)",
      principal: "resource",
      trust: "Publishes PRM and/or an Agent Card. Verifies the advertised scheme on the request. Signed Agent Cards prove the card was not tampered with; they do not authenticate the request.",
    },
    {
      name: "Optional authorization server",
      principal: "other",
      trust: "Present if you are an OAuth-protected resource. Absent if you are AAuth resource-managed and issue your own session.",
    },
  ],
  whyThese:
    "The caller needs a machine-readable answer to 'how do I authenticate to you?' RFC 9728 is that answer in OAuth. A2A puts the same idea on the Agent Card as securitySchemes (OAuth, OIDC, mTLS, API key). If you do not want an AS, AAuth two-party / resource-managed lets you run your own interaction and issue an opaque session bound to the caller's key. Do not treat a signed Agent Card as request authentication. Do not make API keys the primary scheme if you can avoid it.",
  userPresent: "no",
  asInPath: "sometimes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "sometimes",
  topology: {
    caption:
      "Callers discover your advertised scheme (PRM or Agent Card), obtain credentials, then call you. You are the RS.",
    nodes: [
      { id: "caller", label: "Calling agent", kind: "agent" },
      { id: "card", label: "Agent Card / RFC 9728", kind: "other" },
      { id: "as", label: "Optional AS", kind: "as" },
      { id: "you", label: "Your agent (RS)", kind: "resource" },
    ],
    edges: [
      { from: "caller", to: "card", label: "GET well-known metadata" },
      { from: "caller", to: "as", label: "If the card/PRM says OAuth, obtain a token" },
      { from: "caller", to: "you", label: "Authenticated task or API request" },
    ],
  },
  protocols: [
    { slug: "prm", fit: "primary", note: "RFC 9728." },
    { slug: "oauth-2-1", fit: "primary", note: "You are an OAuth-protected resource unless you chose AAuth instead." },
    { slug: "a2a", fit: "primary", note: "If you speak A2A, securitySchemes on the Agent Card are the advertisement." },
    {
      slug: "aauth",
      fit: "optional",
      note: "Resource-managed two-party: you run consent and issue a session. Individual draft.",
    },
    { slug: "mtls", fit: "optional" },
    { slug: "spiffe", fit: "optional", note: "If callers are mesh workloads in your trust domain." },
    { slug: "mcp-auth", fit: "optional", note: "If the thing you host is specifically an MCP server." },
    {
      slug: "oauth-bearer",
      fit: "anti-pattern",
      note: "API keys / unconstrained Bearer as the only scheme. Last resort, not a design.",
    },
    {
      label: "Signed Agent Card as request authentication",
      fit: "anti-pattern",
      note: "Card JWS is tamper evidence for the card. Still require a request-level scheme.",
    },
  ],
  relatedFlows: ["agent-as-resource", "a2a-agent-to-agent", "p2p-two-party"],
  aliases: ["tool provider", "agent API", "protected resource agent"],
  searchTerms: ["resource", "tool provider", "Agent Card", "RFC 9728", "PRM"],
};

const a2aTasking: DeploymentPattern = {
  slug: "a2a-tasking",
  title: "Agent-to-agent tasking (A2A)",
  matrixTitle: "A2A tasking",
  summary:
    "Two agents, Agent Cards, a task protocol. A2A v1.0 is how they talk. Authentication is whatever the card advertised — usually OAuth at those endpoints. This is not AAuth identity-based p2p, and it is not did:peer / DIDComm.",
  inTheWild:
    "A planner agent delegates a 'book travel' skill to a specialist that published /.well-known/agent-card.json. Enterprise agent fabrics that speak JSON-RPC/gRPC/HTTP+JSON with A2A-Version. Google-originated protocol, now under AAIF / Linux Foundation.",
  actors: [
    {
      name: "Client agent",
      principal: "agent-instance",
      trust: "Reads the server's Agent Card, obtains credentials out of band, then calls a supported interface.",
    },
    {
      name: "Server agent",
      principal: "resource",
      trust: "Advertises skills, interfaces, and securitySchemes. Enforces the scheme on each operation.",
    },
    {
      name: "Optional enterprise AS",
      principal: "other",
      trust: "Present when the card says OAuth or OIDC. Absent when the card says mTLS or an API key.",
    },
  ],
  whyThese:
    "A2A v1.0 is a task and discovery protocol. It does not mint a new identity layer: it reuses OAuth, OIDC, mTLS, or API keys at the advertised endpoints. That is why OAuth shows up here and must not show up on the AAuth p2p row. AAuth identity-based access is signed HTTP with Signature-Key and no AS — different wire, different identifier. did:peer / DIDComm is pairwise wallet messaging; Agent Cards are globally fetched JSON. Do not forward caller credentials in-band down an A2A chain (A2A §7.6.3). Implicit and password grants on cards are deprecated.",
  userPresent: "sometimes",
  asInPath: "sometimes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Discovery is the Agent Card. The task hop then uses whatever securitySchemes the card listed — usually OAuth, not AAuth signatures.",
    nodes: [
      { id: "client", label: "Client agent", kind: "agent" },
      { id: "card", label: "Agent Card", kind: "other" },
      { id: "as", label: "Optional AS", kind: "as" },
      { id: "server", label: "Server agent", kind: "resource" },
    ],
    edges: [
      { from: "server", to: "card", label: "Publishes /.well-known/agent-card.json" },
      { from: "client", to: "card", label: "Fetch; optionally verify JWS" },
      { from: "client", to: "as", label: "If the card says OAuth/OIDC, obtain a token out of band" },
      { from: "client", to: "server", label: "Authenticated A2A operation (JSON-RPC / gRPC / HTTP+JSON)" },
    ],
  },
  protocols: [
    { slug: "a2a", fit: "primary" },
    { slug: "oauth-2-0", fit: "primary", note: "At advertised endpoints. Prefer 2.1 practices (PKCE, no implicit)." },
    { slug: "oauth-2-1", fit: "optional", note: "What those advertised OAuth endpoints should actually implement." },
    { slug: "oidc-core", fit: "optional", note: "If the card lists an OIDC security scheme." },
    { slug: "mtls", fit: "optional" },
    { slug: "prm", fit: "optional", note: "If the A2A HTTP endpoint is also an OAuth resource with RFC 9728 metadata." },
    {
      slug: "aauth",
      fit: "anti-pattern",
      note: "AAuth p2p is signed HTTP with an agent token. A2A does not use Signature-Key. Keep the rows distinct.",
    },
    {
      slug: "did-peer",
      fit: "anti-pattern",
      note: "Pairwise DID, not a globally fetched Agent Card.",
    },
    {
      slug: "didcomm",
      fit: "anti-pattern",
      note: "A different messaging stack. Not A2A tasks.",
    },
    {
      label: "In-band credential exchange down the chain",
      fit: "anti-pattern",
      note: "A2A §7.6.3: secrets become visible to every hop. Prefer out-of-band.",
    },
  ],
  relatedFlows: ["a2a-agent-to-agent", "agent-as-resource", "p2p-identity-based"],
  relatedCompares: ["delegated-vs-p2p"],
  aliases: ["agent card", "A2A", "agent2agent"],
  searchTerms: ["A2A", "Agent Card", "task protocol", "p2p communication"],
};

const aauthP2p: DeploymentPattern = {
  slug: "aauth-p2p",
  title: "AAuth identity-based / two-party (true p2p HTTP)",
  matrixTitle: "AAuth p2p",
  summary:
    "No authorization server in the path. The agent signs the HTTP request; the resource decides from cryptographic identity (identity-based) or runs its own consent and issues a session (two-party). AAuth + RFC 9421 + Signature-Key. OAuth Bearer does not apply.",
  inTheWild:
    "Open-world HTTP clients that will not pre-register at every API's AS. A personal agent calling a small resource that is willing to trust an agent token and a signature. Two-party: the resource already has a login page and would rather issue its own session than stand up OAuth. Individual draft — pin a revision.",
  actors: [
    {
      name: "Agent",
      principal: "agent-instance",
      trust: "Holds an aa-agent+jwt bound to its signing key. Identifier is portable (aauth:local@domain), not an AS client_id.",
    },
    {
      name: "Agent provider",
      principal: "other",
      trust: "Issues the agent token and hosts JWKS. The resource fetches keys; it does not call an AS token endpoint.",
    },
    {
      name: "Resource",
      principal: "resource",
      trust: "Verifies RFC 9421 + Signature-Key, then applies local policy. In two-party it also runs interaction and issues an opaque session.",
    },
    {
      name: "User (two-party only)",
      principal: "user",
      trust: "Completes the resource's own page. May be ordinary OIDC behind that page; the agent never talks to that AS.",
    },
  ],
  whyThese:
    "The whole point of this row is that there is no AS minting a Bearer access token. Authentication is RFC 9421 over the HTTP request, with the key conveyed by Signature-Key (draft-hardt-httpbis-signature-key) carrying the agent JWT. Authorization is local policy on that identity, or a resource-issued session in two-party mode. Optional R3 and missions constrain what the agent may do without turning the hop into OAuth. Listing OAuth Bearer as applicable would describe a different pattern. A2A is a task protocol with advertised OAuth; did:peer is pairwise and not resolvable by a stranger. Keep all three apart.",
  userPresent: "sometimes",
  asInPath: "no",
  workloadIdentity: "no",
  agentPortableIdentity: "yes",
  topology: {
    caption:
      "Two HTTP parties. The agent signs; the resource verifies. No token endpoint in the path.",
    nodes: [
      { id: "provider", label: "Agent provider (JWKS)", kind: "other" },
      { id: "agent", label: "Agent", kind: "agent" },
      { id: "resource", label: "Resource", kind: "resource" },
      { id: "user", label: "User (two-party)", kind: "user" },
    ],
    edges: [
      { from: "provider", to: "agent", label: "aa-agent+jwt bound to the signing key" },
      {
        from: "agent",
        to: "resource",
        label: "Signature-Key (jwt) + RFC 9421 Signature-Input/Signature",
      },
      { from: "resource", to: "provider", label: "Fetch JWKS at iss / well-known" },
      {
        from: "resource",
        to: "user",
        label: "Two-party only: resource-managed interaction",
      },
      {
        from: "resource",
        to: "agent",
        label: "Allow, or AAuth-Access session for subsequent signed calls",
      },
    ],
  },
  protocols: [
    { slug: "aauth", fit: "primary", note: "Individual draft (draft-10 vs editor's copy). Pin a revision." },
    { slug: "http-message-signatures", fit: "primary", note: "RFC 9421." },
    { slug: "http-signature-keys", fit: "primary", note: "Signature-Key header. Individual draft." },
    { slug: "aauth-r3", fit: "optional", note: "Fine-grained operations, including per-call. Individual draft." },
    {
      slug: "oidc-core",
      fit: "optional",
      note: "Only as the resource's own login page in two-party mode — not as the agent–resource hop.",
    },
    {
      slug: "oauth-bearer",
      fit: "anti-pattern",
      note: "Bearer access tokens are not this hop. Do not present Authorization: Bearer as AAuth p2p.",
    },
    {
      slug: "oauth-2-1",
      fit: "anti-pattern",
      note: "No authorization server in the path. If you need one, that is interactive delegated, not p2p.",
    },
    {
      slug: "a2a",
      fit: "anti-pattern",
      note: "A2A is agent-to-agent tasks with Agent Cards. Different protocol.",
    },
    {
      slug: "did-peer",
      fit: "anti-pattern",
      note: "Not globally resolvable; not a first-request HTTP identity.",
    },
    {
      slug: "didcomm",
      fit: "anti-pattern",
      note: "Messaging, not signed HTTP resource access.",
    },
  ],
  relatedFlows: ["p2p-identity-based", "p2p-two-party", "a2a-agent-to-agent"],
  relatedCompares: ["delegated-vs-p2p", "aauth-vs-oauth"],
  aliases: ["p2p", "peer to peer", "identity-based", "two-party AAuth", "true p2p"],
  searchTerms: ["p2p", "peer-to-peer", "Signature-Key", "identity-based", "no AS"],
};

const aauthPs: DeploymentPattern = {
  slug: "aauth-person-server",
  title: "AAuth three/four-party with person server",
  matrixTitle: "AAuth + person server",
  summary:
    "Portable agent identity plus a user grant from the person's server. Three-party: the resource has no AS. Four-party: the resource has an access server the PS federates to. OIDC may sit behind the PS to authenticate the person.",
  inTheWild:
    "A personal agent that carries the user's consent to resources that will never register it as an OAuth client. The user approves a mission at their person server once; the agent retries with an aa-auth+jwt. Four-party shows up when the resource already has a policy engine and will not evaluate auth tokens itself.",
  actors: [
    {
      name: "Agent",
      principal: "agent-instance",
      trust: "Signs every HTTP call. Holds an agent token that names its person server (ps claim).",
    },
    {
      name: "Person server",
      principal: "other",
      trust: "Represents the user: consent, missions, auth tokens, optional interaction. May authenticate the person with ordinary OIDC behind the scenes.",
    },
    {
      name: "User / person",
      principal: "user",
      trust: "Approves at the PS, not at each resource's OAuth screen.",
    },
    {
      name: "Resource",
      principal: "resource",
      trust: "Issues a resource token (aud = PS), then accepts aa-auth+jwt and applies its own policy to (iss, sub).",
    },
    {
      name: "Resource access server (four-party)",
      principal: "other",
      trust: "Optional. The PS federates to it; the agent still only talks to the resource and the PS.",
    },
  ],
  whyThese:
    "You want AAuth's portable agent identity and a user grant, which identity-based p2p does not carry. The grant is aa-auth+jwt from the PS (short-lived, cnf-bound, aud = resource), not an OAuth Bearer access token from a client_id the resource minted. R3 and missions are the authorization language at the PS. Four-party adds a resource-side access server; that federation is not OpenID Federation and not OAuth identity chaining. OIDC belongs behind the PS (authenticate the person), not on the agent–resource hop.",
  userPresent: "yes",
  asInPath: "sometimes",
  workloadIdentity: "no",
  agentPortableIdentity: "yes",
  topology: {
    caption:
      "Agent and resource still speak signed HTTP. The user grant comes from the person server. Four-party inserts a resource-side access server the PS talks to.",
    nodes: [
      { id: "user", label: "Person", kind: "user" },
      { id: "ps", label: "Person server", kind: "as" },
      { id: "agent", label: "Agent", kind: "agent" },
      { id: "resource", label: "Resource", kind: "resource" },
      { id: "ras", label: "Resource AS (four-party)", kind: "as" },
    ],
    edges: [
      { from: "agent", to: "resource", label: "Signed request; resource sees ps on the agent token" },
      { from: "resource", to: "agent", label: "401 requirement=auth-token + resource token (aud = PS)" },
      { from: "agent", to: "ps", label: "Signed POST of the resource token" },
      { from: "user", to: "ps", label: "Approve mission / scope (OIDC may authenticate here)" },
      { from: "ps", to: "ras", label: "Four-party: PS federates to the resource access server" },
      { from: "ps", to: "agent", label: "aa-auth+jwt (user claims, cnf-bound)" },
      { from: "agent", to: "resource", label: "Retry signed, with auth token" },
    ],
  },
  protocols: [
    { slug: "aauth", fit: "primary", note: "Auth tokens, person server, optional four-party access server. Individual draft." },
    { slug: "http-signature-keys", fit: "primary" },
    { slug: "http-message-signatures", fit: "primary", note: "RFC 9421." },
    { slug: "aauth-r3", fit: "optional", note: "Individual draft." },
    {
      slug: "oidc-core",
      fit: "optional",
      note: "Authenticating the person at the PS — not the agent–resource credential.",
    },
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — complementary BCP, not this wire." },
    {
      slug: "oauth-bearer",
      fit: "anti-pattern",
      note: "The agent–resource hop is signed AAuth, not Authorization: Bearer.",
    },
    {
      slug: "identity-chaining",
      fit: "anti-pattern",
      note: "Four-party PS→resource-AS federation is not OAuth identity chaining.",
    },
    {
      slug: "openid-federation",
      fit: "anti-pattern",
      note: "Different federation. Do not mix the documents.",
    },
  ],
  relatedFlows: ["three-party-aauth", "p2p-identity-based", "ciba-hitl"],
  relatedCompares: ["aauth-vs-oauth", "delegated-vs-p2p"],
  aliases: ["person server", "three-party AAuth", "four-party AAuth", "PS-asserted"],
  searchTerms: ["person server", "three-party", "four-party", "auth token", "mission"],
};

export { agentAsResource, a2aTasking, aauthP2p, aauthPs };
