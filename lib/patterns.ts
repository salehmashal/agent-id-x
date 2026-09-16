import { getFlow } from "@/lib/flows";
import { getSpec } from "@/lib/specs";
import type {
  AgentFlow,
  DeploymentPattern,
  HostVariant,
  PatternProtocol,
  ProtocolFit,
  Spec,
} from "@/lib/types";

export const matrixColumns = [
  {
    key: "userPresent" as const,
    label: "User present?",
    hint: "A human is in the loop for this call — in the same browser, or on another device.",
  },
  {
    key: "asInPath" as const,
    label: "AS in path?",
    hint: "An OAuth/OIDC authorization server issues the credential the resource accepts.",
  },
  {
    key: "workloadIdentity" as const,
    label: "Workload identity?",
    hint: "SPIFFE/WIMSE names the binary. That is not the user, and not a portable AAuth agent token.",
  },
  {
    key: "agentPortableIdentity" as const,
    label: "Agent-portable identity?",
    hint: "The caller has an identifier that travels across authorization servers — an AAuth agent token, not an AS-local client_id.",
  },
];

export const patternScopeNotes = [
  {
    title: "did:peer and DIDComm are not a row",
    body: "Pairwise, not globally resolvable, and not how a stranger's first HTTP call is authenticated. They sit in the catalog as adjacent identity/messaging. Do not substitute them for AAuth p2p, and do not substitute A2A Agent Cards for a DID document.",
    specSlugs: ["did-peer", "didcomm"],
  },
  {
    title: "GNAP is finished, and not what these products speak",
    body: "RFC 9635 is a complete IETF alternative to OAuth. Interactive agent UIs, MCP HTTP, and A2A cards overwhelmingly profile OAuth 2.1 / OIDC instead. It is omitted as a primary protocol on every row below for that reason, not because it is invalid.",
    specSlugs: ["gnap"],
  },
];

const interactive: DeploymentPattern = {
  slug: "interactive-user-delegated",
  title: "Interactive user-delegated agent",
  matrixTitle: "Interactive delegated",
  summary:
    "A human is in a product UI. The agent calls APIs as that user. This is still the production default: OAuth 2.1 authorization code + PKCE, OIDC for the user, audience-restricted access tokens.",
  inTheWild:
    "Chat UIs that connect Gmail or Jira, Copilot-in-the-IDE with a browser login, any SaaS 'enable the assistant' button that pops an authorization screen. The agent is an OAuth client; the human is the resource owner.",
  actors: [
    {
      name: "User / resource owner",
      principal: "user",
      trust: "Authenticates to the authorization server (OIDC). Consents to what this client may do.",
    },
    {
      name: "Agent (OAuth client)",
      principal: "agent-instance",
      trust: "Identified by client_id at this AS (or a CIMD URL). Not a portable agent identity. Public or confidential depending on the host.",
    },
    {
      name: "Authorization server",
      principal: "other",
      trust: "Issues the access token the API will accept. Often the company IdP or the API vendor's AS.",
    },
    {
      name: "Resource server / API",
      principal: "resource",
      trust: "Trusts tokens from that AS, audience-restricted to itself (RFC 8707 / RFC 9068). Does not automatically learn which agent instance called.",
    },
  ],
  whyThese:
    "You have a browser and a human. Authorization code + PKCE is the OAuth 2.1 default; OIDC authenticates the user to the client; RFC 9728 tells the client which AS protects the API; RFC 8707 keeps the token from being replayed at a different API; RFC 9700 is the safety floor (no implicit, no password grant, exact redirects). PAR and RAR are for fat or fine-grained requests, not a different grant. DPoP or mTLS so a stolen access token is not enough. AAuth identity-based p2p is the wrong tool unless you are deliberately replacing the AS — it has no authorization-code redirect and no Bearer access token.",
  userPresent: "yes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Human in the browser, agent as OAuth client, AS mints an audience-restricted token, API consumes it.",
    nodes: [
      { id: "user", label: "User (browser)", kind: "user" },
      { id: "agent", label: "Agent (OAuth client)", kind: "agent" },
      { id: "as", label: "Authorization server", kind: "as" },
      { id: "api", label: "API / tool", kind: "resource" },
    ],
    edges: [
      { from: "user", to: "agent", label: "Asks the product to call an API" },
      { from: "agent", to: "as", label: "Auth code + PKCE (PAR if the request is rich)" },
      { from: "user", to: "as", label: "Authenticates (OIDC) and consents" },
      { from: "as", to: "agent", label: "Access token (and optional refresh)" },
      { from: "agent", to: "api", label: "Authorization: Bearer or DPoP; aud = this API" },
    ],
  },
  protocols: [
    { slug: "oauth-2-1", fit: "primary" },
    { slug: "pkce", fit: "primary" },
    { slug: "oidc-core", fit: "primary" },
    { slug: "prm", fit: "primary", note: "RFC 9728 — discover the AS from the API." },
    { slug: "resource-indicators", fit: "primary", note: "RFC 8707 — aud = this API." },
    { slug: "oauth-security-bcp", fit: "primary", note: "RFC 9700 — the safety floor on top of RFC 6749." },
    { slug: "par", fit: "optional", note: "When the authorize request is large or must not hit the front channel." },
    { slug: "rar", fit: "optional", note: "When scopes are too coarse for the tool call." },
    { slug: "dpop", fit: "optional", note: "Sender-constrain without mTLS." },
    { slug: "mtls", fit: "optional", note: "Sender-constrain when the client already has a cert." },
    { slug: "jwt-access-tokens", fit: "optional" },
    { slug: "cimd", fit: "optional", note: "If the agent is not pre-registered at this AS." },
    { slug: "fapi-2", fit: "optional", note: "High-risk APIs: PAR + PKCE + sender-constraint required." },
    { slug: "agent-grants", fit: "optional", note: "Individual draft: profile OAuth for agent clients without new endpoints." },
    { slug: "aims", fit: "optional", note: "Individual draft: BCP map, not a wire protocol." },
    {
      slug: "aauth",
      fit: "anti-pattern",
      note: "Not for this hop unless you are replacing the AS. AAuth p2p has no auth-code redirect.",
    },
    {
      label: "Resource Owner Password Credentials",
      fit: "anti-pattern",
      note: "Removed from OAuth 2.1; forbidden by RFC 9700.",
    },
    {
      slug: "oauth-bearer",
      fit: "anti-pattern",
      note: "Bearer tokens exist, but unconstrained Bearer as the whole design is the 2012 default RFC 9700 is walking away from.",
    },
  ],
  relatedFlows: ["user-delegated-api", "agent-as-client-mcp"],
  relatedCompares: ["delegated-vs-p2p", "aauth-vs-oauth"],
  aliases: ["product UI agent", "chat UI oauth", "authorization code agent"],
  searchTerms: [
    "interactive",
    "user-delegated",
    "browser login",
    "auth code",
    "PKCE",
  ],
};

const headless: DeploymentPattern = {
  slug: "headless-async-delegated",
  title: "Headless / async user-delegated",
  matrixTitle: "Headless / async",
  summary:
    "The agent runs without a browser on its own device. A human still has to approve, but on another device. CIBA is the OpenID answer; RFC 9470 steps up an existing grant; AAuth interaction relay is the person-server-shaped alternative.",
  inTheWild:
    "A nightly research agent that must confirm before sending mail, a factory-floor bot whose operator has a phone, a CLI agent started over SSH, any 'approve this tool on your phone' prompt. If there is no human at all, that is unattended batch — a different row.",
  actors: [
    {
      name: "Agent (no browser)",
      principal: "agent-instance",
      trust: "Confidential client at the OpenID provider, or an AAuth agent with a person server.",
    },
    {
      name: "User on another device",
      principal: "user",
      trust: "Approves a binding message (CIBA) or completes an interaction URL (AAuth PS / RFC 9470).",
    },
    {
      name: "OpenID provider or person server",
      principal: "other",
      trust: "Authenticates the person and mints the grant the agent will present.",
    },
    {
      name: "Resource server",
      principal: "resource",
      trust: "Still enforces audience and policy. CIBA is not a replacement for RS checks.",
    },
  ],
  whyThese:
    "Authorization code needs a redirect user-agent the agent does not have. CIBA starts the grant on the back channel and pushes the human on an authentication device. RFC 9470 is for the case you already have a grant that is too weak or too stale for this tool. AAuth's person-server interaction relay is the same human-in-the-loop idea without an OAuth AS in the agent–resource hop: the PS parks the request, the person approves, the agent retries with an auth token. Do not automate a headless browser against an authorize endpoint, and do not stuff a user password into the agent.",
  userPresent: "sometimes",
  asInPath: "sometimes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "sometimes",
  topology: {
    caption:
      "Agent has no browser. The human approves on another device; the grant comes back on the back channel (CIBA) or via the person server (AAuth).",
    nodes: [
      { id: "agent", label: "Headless agent", kind: "agent" },
      { id: "op", label: "OpenID provider / person server", kind: "as" },
      { id: "user", label: "User (other device)", kind: "user" },
      { id: "api", label: "API / tool", kind: "resource" },
    ],
    edges: [
      { from: "agent", to: "op", label: "CIBA backchannel authorize, or AAuth 401 + interaction" },
      { from: "op", to: "user", label: "Push / binding message / interaction URL" },
      { from: "user", to: "op", label: "Approve or deny" },
      { from: "op", to: "agent", label: "Access token or aa-auth+jwt" },
      { from: "agent", to: "api", label: "Call with the freshly approved grant" },
    ],
  },
  protocols: [
    { slug: "ciba", fit: "primary" },
    { slug: "oidc-core", fit: "primary" },
    { slug: "step-up", fit: "primary", note: "RFC 9470 — existing grant is too weak or stale." },
    {
      slug: "aauth",
      fit: "optional",
      note: "Person-server interaction relay: the AAuth-shaped alternative when there is no OAuth AS in the hop.",
    },
    { slug: "fapi-2", fit: "optional", note: "CIBA is commonly paired with FAPI-class APIs." },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    {
      slug: "oauth-2-1",
      fit: "anti-pattern",
      note: "Authorization-code redirect is the wrong grant when the agent has no browser. Use CIBA (or AAuth interaction), not a fake redirect.",
    },
    {
      label: "Headless browser against the authorize endpoint",
      fit: "anti-pattern",
      note: "That is not a grant. It is scraping a login page.",
    },
    {
      label: "Resource Owner Password Credentials",
      fit: "anti-pattern",
      note: "Never collect the user's password in the agent.",
    },
  ],
  relatedFlows: ["ciba-hitl", "three-party-aauth"],
  aliases: ["CIBA agent", "async consent", "other device approval"],
  searchTerms: ["headless", "async", "CIBA", "step-up", "interaction relay"],
};

const enterprise: DeploymentPattern = {
  slug: "enterprise-idp-brokered",
  title: "Enterprise SaaS / IdP-brokered",
  matrixTitle: "Enterprise IdP",
  summary:
    "A company agent needs Slack, Google, or another SaaS the IdP already federates. The IdP brokers the grant (XAA / ID-JAG) instead of sending the human through a second OAuth circus at every app.",
  inTheWild:
    "Enterprise Copilot or a custom agent that files a ticket in ServiceNow and posts to Slack under the employee's identity, with admin policy deciding which apps are pre-approved. The user signed into the company IdP this morning; the agent should not pop a new consent screen per SaaS if policy already allows the connection.",
  actors: [
    {
      name: "Employee (user)",
      principal: "user",
      trust: "Has an SSO session at the company IdP. May never see a second consent if policy pre-approves the app connection.",
    },
    {
      name: "Company agent / app",
      principal: "agent-instance",
      trust: "Already registered at the IdP. Not a portable AAuth identity; it is an enterprise OAuth client.",
    },
    {
      name: "Company IdP",
      principal: "other",
      trust: "Issues an identity-assertion JWT authorization grant (ID-JAG) for the target app's AS.",
    },
    {
      name: "SaaS authorization server + API",
      principal: "resource",
      trust: "Already trusts this IdP for SSO. Redeems the JWT grant (RFC 7523) for an access token to its own API.",
    },
  ],
  whyThese:
    "XAA / ID-JAG is the IdP-brokered profile of 'the user is already signed in here; mint a grant the other app's AS will accept.' Identity chaining is the general two-AS version of the same idea. OIDC is how the IdP authenticated the employee. FAPI 2.0 if the SaaS is high-risk (open banking, payments). This is not AAuth p2p (there is very much an AS in the path) and not MCP (the wire to Slack is Slack's API, not an MCP session). AIMS tells you to compose these RFCs rather than invent a company-specific token.",
  userPresent: "sometimes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "IdP already has the user session. It mints a JWT grant for the SaaS AS; the agent never collects a second password.",
    nodes: [
      { id: "user", label: "Employee", kind: "user" },
      { id: "idp", label: "Company IdP", kind: "as" },
      { id: "agent", label: "Company agent", kind: "agent" },
      { id: "saas-as", label: "SaaS AS", kind: "as" },
      { id: "saas", label: "SaaS API", kind: "resource" },
    ],
    edges: [
      { from: "user", to: "idp", label: "SSO session (OIDC)" },
      { from: "agent", to: "idp", label: "Request ID-JAG / identity-chaining grant; aud = SaaS AS" },
      { from: "idp", to: "agent", label: "JWT authorization grant" },
      { from: "agent", to: "saas-as", label: "RFC 7523 JWT bearer grant" },
      { from: "saas-as", to: "agent", label: "Access token for this SaaS" },
      { from: "agent", to: "saas", label: "Call Slack / Google / …" },
    ],
  },
  protocols: [
    { slug: "xaa", fit: "primary", note: "ID-JAG / Cross-App Access — WG draft." },
    { slug: "identity-chaining", fit: "primary", note: "General form; RFC Editor queue, no RFC number yet." },
    { slug: "oidc-core", fit: "primary" },
    { slug: "jwt-client-auth", fit: "optional", note: "RFC 7523 — the JWT bearer grant the SaaS AS redeems." },
    { slug: "token-exchange", fit: "optional", note: "RFC 8693 — often the mechanism at the IdP." },
    { slug: "fapi-2", fit: "optional", note: "When the target API is high-risk." },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "iss-param", fit: "optional", note: "RFC 9207 mix-up defenses once two ASes are in play." },
    {
      slug: "aauth",
      fit: "anti-pattern",
      note: "Enterprise SaaS APIs expect OAuth tokens from an AS they already trust, not Signature-Key.",
    },
    {
      label: "Per-SaaS password or a user refresh token harvested at install time",
      fit: "anti-pattern",
      note: "The IdP is supposed to broker this. Storing a Google refresh token in the agent bypasses enterprise policy.",
    },
  ],
  relatedFlows: ["multi-hop-obo", "user-delegated-api"],
  aliases: ["XAA", "ID-JAG", "cross-app access", "enterprise copilot"],
  searchTerms: ["Slack", "Google", "IdP", "SaaS", "enterprise", "ID-JAG", "XAA"],
};

const mcpHost: DeploymentPattern = {
  slug: "mcp-host-server",
  title: "MCP host ↔ MCP server (tools)",
  matrixTitle: "MCP host ↔ server",
  summary:
    "A model host (Claude Desktop, an IDE, a custom runtime) calls tools on an HTTP MCP server. The host is the OAuth client. The MCP authorization spec is an OAuth 2.1 profile, not a new token type.",
  inTheWild:
    "Claude Desktop attached to a remote MCP server, Cursor or another IDE with MCP tools, any custom host that speaks MCP HTTP. Stdio MCP is a local pipe and MUST NOT use this OAuth profile — if your 'MCP server' is a subprocess, you are not on this row.",
  actors: [
    {
      name: "User",
      principal: "user",
      trust: "Sits at the host. Authorizes the host to call this MCP server as them.",
    },
    {
      name: "MCP host (client)",
      principal: "agent-instance",
      trust: "The OAuth client. Identified by CIMD URL or (deprecated) DCR. The model never sees OAuth.",
    },
    {
      name: "MCP server (resource)",
      principal: "resource",
      trust: "The RS. Publishes RFC 9728 metadata, validates audience == itself, does not forward tokens.",
    },
    {
      name: "Authorization server",
      principal: "other",
      trust: "Discovered from PRM. Issues tokens audience-restricted to the MCP server URI.",
    },
  ],
  whyThese:
    "MCP HTTP authorization is explicitly an OAuth 2.1 profile: Protected Resource Metadata to find the AS, CIMD preferred over Dynamic Client Registration, authorization code + PKCE, resource indicator = the MCP server. That is why this row is not 'invent a tool token.' AAuth applies only if you deliberately leave the MCP-OAuth profile and speak agent-native HTTP signatures instead — a different contract than the MCP spec, and one MCP hosts will not implement by default. Do not put OAuth on stdio MCP. Do not let the server forward the host's token to someone else.",
  userPresent: "yes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Host is the OAuth client. MCP server is the resource. The model only sees 'call this tool'.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "host", label: "MCP host", kind: "agent" },
      { id: "as", label: "Authorization server", kind: "as" },
      { id: "server", label: "MCP server (tools)", kind: "resource" },
    ],
    edges: [
      { from: "host", to: "server", label: "Unauthenticated MCP HTTP request" },
      { from: "server", to: "host", label: "401 + WWW-Authenticate resource_metadata (RFC 9728)" },
      { from: "host", to: "as", label: "CIMD or DCR, auth code + PKCE, resource = MCP URI" },
      { from: "user", to: "as", label: "Consent at the host's browser" },
      { from: "host", to: "server", label: "Authorization: Bearer; server checks aud == itself" },
    ],
  },
  protocols: [
    { slug: "mcp-auth", fit: "primary" },
    { slug: "oauth-2-1", fit: "primary" },
    { slug: "pkce", fit: "primary" },
    { slug: "prm", fit: "primary", note: "RFC 9728." },
    { slug: "cimd", fit: "primary", note: "Preferred client identification in the 2026-07-28 MCP spec." },
    { slug: "resource-indicators", fit: "optional" },
    { slug: "dcr", fit: "optional", note: "Deprecated in MCP 2026-07-28 in favor of CIMD." },
    { slug: "dpop", fit: "optional" },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    {
      slug: "aauth",
      fit: "anti-pattern",
      note: "Only if you deliberately replace MCP-OAuth with agent-native signatures. Default MCP hosts will not.",
    },
    {
      label: "OAuth on stdio MCP",
      fit: "anti-pattern",
      note: "The MCP spec: stdio MUST NOT use the HTTP authorization profile.",
    },
    {
      label: "Forwarding the host token to another server",
      fit: "anti-pattern",
      note: "Confused deputy. The MCP server is the audience, not a gateway.",
    },
  ],
  relatedFlows: ["agent-as-client-mcp", "user-delegated-api"],
  aliases: ["MCP host", "mcp host", "Claude Desktop", "MCP tools"],
  searchTerms: ["MCP host", "MCP server", "tools", "CIMD", "PRM", "Claude Desktop", "IDE"],
};

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
    { slug: "aims", fit: "optional", note: "Individual draft — complementary BCP, not this wire." },
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

const multiHop: DeploymentPattern = {
  slug: "multi-hop-obo",
  title: "Multi-hop on-behalf-of inside one domain",
  matrixTitle: "Multi-hop (one domain)",
  summary:
    "Orchestrator → specialist → API, still inside one trust domain. RFC 8693 act records who is acting. Transaction tokens carry immutable purpose. WIMSE re-binds the workload identity at each hop. AAuth call chaining (upstream_token / subagent_token) if you are already on AAuth.",
  inTheWild:
    "An orchestrator agent that fans out to a retrieval agent and a payments agent, all in the same cluster, all acting for the employee who started the task. Internal toolchains where every hop is your mesh. If the next hop is another company's AS, that is the cross-domain row.",
  actors: [
    {
      name: "User (at the start)",
      principal: "user",
      trust: "Authorized the first agent. Must not be silently widened at a later hop.",
    },
    {
      name: "Orchestrator agent",
      principal: "agent-instance",
      trust: "Holds the original grant. Exchanges or re-binds before calling specialists — does not forward the raw user access token.",
    },
    {
      name: "Specialist / downstream API",
      principal: "resource",
      trust: "Sees an attenuated token: subject = user, act = the calling agent, audience = itself, purpose unchanged.",
    },
    {
      name: "Workload identity issuer",
      principal: "workload",
      trust: "SPIRE / WIMSE names each binary so a stolen user token presented by the wrong pod is a different incident.",
    },
  ],
  whyThese:
    "Inside one domain you do not need identity chaining across ASes. You do need a recorded actor (RFC 8693 act), a purpose that cannot grow (transaction tokens), and a workload identity that is re-bound at each hop (WIMSE). Agent-grants and AAP are individual OAuth profiles that try to say the same thing with extra claims — mark them draft/churn. If the fabric is AAuth, call chaining with upstream_token / subagent_token is the analogue: the sub-agent signs with its own key while nested act records the parent. Never expand scopes at a hop. Never forward the original user access token.",
  userPresent: "sometimes",
  asInPath: "yes",
  workloadIdentity: "yes",
  agentPortableIdentity: "sometimes",
  topology: {
    caption:
      "Same trust domain. Each hop attenuates and re-binds. The user grant does not travel as a raw Bearer token.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "orch", label: "Orchestrator", kind: "agent" },
      { id: "spec", label: "Specialist", kind: "agent" },
      { id: "api", label: "API", kind: "resource" },
      { id: "wimse", label: "SPIRE / WIMSE", kind: "workload" },
    ],
    edges: [
      { from: "user", to: "orch", label: "Original grant (OAuth or AAuth)" },
      { from: "wimse", to: "orch", label: "Workload identity for this binary" },
      { from: "wimse", to: "spec", label: "Hop re-bind for the specialist" },
      {
        from: "orch",
        to: "spec",
        label: "RFC 8693 / txn-token / AAuth subagent_token — attenuated",
      },
      { from: "spec", to: "api", label: "Audience-restricted, purpose-frozen call" },
    ],
  },
  protocols: [
    { slug: "token-exchange", fit: "primary", note: "RFC 8693 act." },
    { slug: "transaction-tokens", fit: "primary", note: "WG draft — immutable purpose inside the domain." },
    { slug: "wimse-arch", fit: "primary", note: "Hop re-bind of workload identity." },
    { slug: "wimse-wpt", fit: "optional" },
    {
      slug: "aauth",
      fit: "optional",
      note: "Call chaining: upstream_token / subagent_token. Individual draft; some implementations still incomplete.",
    },
    { slug: "txntokens-agents", fit: "optional", note: "Individual usage profile of transaction tokens. Draft/churn." },
    { slug: "agent-grants", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — expect churn. Expired draft-01 unless renewed." },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "jwt-access-tokens", fit: "optional" },
    {
      label: "Forwarding the original user access token",
      fit: "anti-pattern",
      note: "Every hop becomes the user. No actor, no attenuation, no audience.",
    },
    {
      label: "Expanding scopes at a hop",
      fit: "anti-pattern",
      note: "On-behalf-of is a narrowing, not a promotion.",
    },
    {
      slug: "identity-chaining",
      fit: "anti-pattern",
      note: "That draft is for crossing authorization servers / domains. Wrong row.",
    },
  ],
  relatedFlows: ["multi-hop-obo", "workload-then-user"],
  aliases: ["on-behalf-of", "OBO", "orchestrator", "act claim"],
  searchTerms: ["multi-hop", "on-behalf-of", "act", "transaction tokens", "call chaining"],
};

const crossDomain: DeploymentPattern = {
  slug: "cross-domain-chaining",
  title: "Cross-domain identity chaining",
  matrixTitle: "Cross-domain chaining",
  summary:
    "The grant starts at AS A and must be accepted at AS B in another organization. Identity chaining (I-D) composes RFC 8693 and RFC 7523. RFC 9207 mix-up defenses exist because two issuers are now in play.",
  inTheWild:
    "An agent reads mail in the company tenant and files a ticket in a vendor SaaS whose AS is not yours. Partner integrations where each side has its own authorization server. Distinct from XAA only in that XAA is the IdP-brokered profile of a similar grant; this row is the general two-AS chain.",
  actors: [
    {
      name: "Client in domain A",
      principal: "agent-instance",
      trust: "Holds a token from AS A. Must not present it at API C in domain B.",
    },
    {
      name: "AS A",
      principal: "other",
      trust: "Token-exchanges a JWT authorization grant audience-restricted to AS B.",
    },
    {
      name: "AS B",
      principal: "other",
      trust: "Redeems that JWT via RFC 7523 and issues an access token for its own resource. Must not be mixed up with AS A.",
    },
    {
      name: "Resource in domain B",
      principal: "resource",
      trust: "Accepts only tokens from AS B, aud = itself.",
    },
  ],
  whyThese:
    "Two authorization servers means identity chaining, not a private JWT format and not a transaction token (txn-tokens are same-domain). RFC 8693 produces the grant; RFC 7523 is how B consumes a JWT assertion; the chaining I-D writes that down as a profile (RFC Editor queue as of July 2026 — no RFC number yet). RFC 9207 iss in the authorization response, plus exact issuer metadata checks, are how you stop mix-up when the client talks to more than one AS. XAA is the IdP-shaped variant; FAPI if B is high-risk.",
  userPresent: "sometimes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Two ASes, two audiences. The client exchanges at A for a grant B will redeem. Mix-up defenses are mandatory.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "asa", label: "AS A", kind: "as" },
      { id: "agent", label: "Agent in A", kind: "agent" },
      { id: "asb", label: "AS B", kind: "as" },
      { id: "api", label: "API in B", kind: "resource" },
    ],
    edges: [
      { from: "user", to: "asa", label: "Original delegation" },
      { from: "agent", to: "asa", label: "RFC 8693 exchange → JWT grant, aud = AS B" },
      { from: "agent", to: "asb", label: "RFC 7523 JWT bearer grant (iss checks / RFC 9207)" },
      { from: "asb", to: "agent", label: "Access token for API C" },
      { from: "agent", to: "api", label: "Call in domain B" },
    ],
  },
  protocols: [
    {
      slug: "identity-chaining",
      fit: "primary",
      note: "WG draft in the RFC Editor queue — cite the I-D until an RFC number exists.",
    },
    { slug: "jwt-client-auth", fit: "primary", note: "RFC 7523." },
    { slug: "token-exchange", fit: "primary", note: "RFC 8693." },
    { slug: "iss-param", fit: "primary", note: "RFC 9207 mix-up defenses." },
    { slug: "xaa", fit: "optional", note: "IdP-brokered profile of a similar grant." },
    { slug: "fapi-2", fit: "optional" },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "as-metadata", fit: "optional", note: "Exact issuer metadata comparison." },
    {
      slug: "transaction-tokens",
      fit: "anti-pattern",
      note: "Same-domain context propagation, not a cross-AS grant.",
    },
    {
      label: "Presenting AS A's access token at API C",
      fit: "anti-pattern",
      note: "Wrong audience, wrong issuer, classic confused deputy.",
    },
    {
      label: "A private cross-domain token format",
      fit: "anti-pattern",
      note: "The chaining I-D exists so you do not invent one.",
    },
  ],
  relatedFlows: ["multi-hop-obo"],
  aliases: ["identity chaining", "cross-domain", "RFC 7523", "mix-up"],
  searchTerms: ["cross-domain", "identity chaining", "7523", "9207", "mix-up"],
};

const sidecar: DeploymentPattern = {
  slug: "workload-sidecar",
  title: "Workload / mesh sidecar (unattended, no user)",
  matrixTitle: "Mesh sidecar",
  summary:
    "The agent is a binary in a mesh. SPIFFE/SPIRE names it, WIMSE WIT/WPT prove it, mTLS carries it. Client credentials or SPIFFE client auth if an AS is still in the picture. Not an OIDC user sub.",
  inTheWild:
    "An inference service in Kubernetes with a SPIRE agent (or mesh sidecar) issuing X.509-SVIDs. Internal tool-calling microservices with no human on the request. Sidecar proxies that present mTLS to the next hop so the app code never sees a static API key.",
  actors: [
    {
      name: "Workload (agent binary)",
      principal: "workload",
      trust: "Identified by a SPIFFE ID / WIMSE identifier. That string is 'payment-api in prod', not 'Alice'.",
    },
    {
      name: "SPIRE / identity server",
      principal: "other",
      trust: "Attests the platform and issues short-lived SVIDs or WIT/WIC.",
    },
    {
      name: "Sidecar / mesh proxy",
      principal: "other",
      trust: "Often the process that actually presents mTLS. The workload identity is still the app's, not the proxy vendor's.",
    },
    {
      name: "Relying workload / API",
      principal: "resource",
      trust: "Authenticates the peer cert or WPT. Authorization is policy on the SPIFFE ID, optionally plus an OAuth client-credentials token.",
    },
  ],
  whyThese:
    "There is no user on this hop, so OIDC user sub is the wrong identifier to stuff into a SPIFFE ID. SPIFFE/SPIRE is how production meshes already name binaries. WIMSE generalizes that across systems (WIT must not be used as Bearer; WPT or HTTP signatures or mTLS are the proof). If the API still wants OAuth, the client authenticates with SPIFFE (or mTLS RFC 8705) and uses the client-credentials grant — the token is the workload's, not Alice's. AIMS is the BCP that says this out loud. AAuth portable agent identity is a different scope (open-world HTTP clients, not your cluster).",
  userPresent: "no",
  asInPath: "sometimes",
  workloadIdentity: "yes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Platform attests the binary. Sidecar or the app presents mTLS / WPT. Optional AS only for client-credentials, never for a user sub.",
    nodes: [
      { id: "spire", label: "SPIRE / WIMSE issuer", kind: "workload" },
      { id: "sidecar", label: "Sidecar", kind: "other" },
      { id: "agent", label: "Agent workload", kind: "agent" },
      { id: "as", label: "Optional AS", kind: "as" },
      { id: "api", label: "Peer API", kind: "resource" },
    ],
    edges: [
      { from: "spire", to: "agent", label: "X.509-SVID or WIT+WIC" },
      { from: "agent", to: "sidecar", label: "Workload API / identity for this pod" },
      { from: "sidecar", to: "api", label: "mTLS / WPT / HTTP signatures" },
      { from: "agent", to: "as", label: "Optional: SPIFFE client auth + client_credentials" },
    ],
  },
  protocols: [
    { slug: "spiffe", fit: "primary" },
    { slug: "wimse-arch", fit: "primary" },
    { slug: "wimse-creds", fit: "primary", note: "WIT / WIC. WIT is not a Bearer token." },
    { slug: "wimse-wpt", fit: "primary" },
    { slug: "mtls", fit: "primary" },
    { slug: "spiffe-client-auth", fit: "optional", note: "When the workload must also be an OAuth client." },
    { slug: "oauth-2-1", fit: "optional", note: "Client credentials only — there is no user." },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn. Agents as workloads." },
    { slug: "wimse-ai-agent", fit: "optional", note: "Individual draft: why workload ID is not owner ID." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — structured claims on a client-credentials token." },
    {
      slug: "oidc-core",
      fit: "anti-pattern",
      note: "Do not put the user sub in the SPIFFE ID, and do not send an ID Token to the API.",
    },
    {
      label: "Static API keys in the sidecar env",
      fit: "anti-pattern",
      note: "The SVID is supposed to replace that.",
    },
  ],
  relatedFlows: ["workload-then-user"],
  aliases: ["sidecar", "mesh", "SPIFFE", "SPIRE", "unattended workload"],
  searchTerms: ["sidecar", "mesh", "SPIFFE", "SPIRE", "WIMSE", "WIT", "WPT", "mTLS"],
};

const hostRuntime: DeploymentPattern = {
  slug: "host-runtime",
  title: "Browser, native, and server-side agent hosts",
  matrixTitle: "Host runtime",
  summary:
    "Where the OAuth client actually runs changes token storage and client type. RFC 10017 for browser-based hosts, RFC 8252 for native apps, confidential client + DPoP or mTLS for server-side runtimes. Same grant, different failure modes.",
  inTheWild:
    "A chat SPA that holds the agent's tokens in the page. A desktop companion (Claude Desktop, a CLI with a loopback redirect). A backend worker that is the confidential client and never shows tokens to the model or the browser. This row is orthogonal to the others: an interactive delegated agent is also one of these three hosts.",
  actors: [
    {
      name: "Human",
      principal: "user",
      trust: "Still authenticates at the AS. The host type decides which user-agent and where tokens land afterwards.",
    },
    {
      name: "Agent host (the OAuth client)",
      principal: "agent-instance",
      trust: "Public client in a browser or many native apps; confidential client on a server. Must not leak tokens into model context, logs, or XSS-reachable storage.",
    },
    {
      name: "Authorization server",
      principal: "other",
      trust: "Enforces PKCE, exact redirect URIs, and (for confidential clients) client authentication.",
    },
  ],
  whyThese:
    "OAuth 2.1 does not change the fact that browsers cannot hide secrets, native apps must not embed a webview, and servers can keep a key. RFC 10017 is the browser BCP: prefer a Backend-for-Frontend with HTTP-only cookies; if tokens must live in the page, keep them in memory, never localStorage. RFC 8252 is the native BCP: system browser, PKCE, claimed HTTPS or loopback redirects. Server-side agents are confidential clients and should sender-constrain with DPoP or mTLS so a leaked access token is not replayable from a laptop. Token storage is the incident: XSS in the chat page, an embedded webview, a refresh token in localStorage, or a token concatenated into a prompt.",
  userPresent: "yes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Three places the same OAuth client can live. Pick one; do not mix their token-storage rules.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "browser", label: "Browser host", kind: "agent" },
      { id: "native", label: "Native host", kind: "agent" },
      { id: "server", label: "Server runtime", kind: "workload" },
      { id: "as", label: "Authorization server", kind: "as" },
    ],
    edges: [
      { from: "user", to: "browser", label: "SPA / chat UI (RFC 10017)" },
      { from: "user", to: "native", label: "System browser (RFC 8252)" },
      { from: "user", to: "server", label: "Optional; server holds the client key" },
      { from: "browser", to: "as", label: "Auth code + PKCE; prefer BFF cookies" },
      { from: "native", to: "as", label: "Auth code + PKCE; claimed HTTPS or loopback" },
      { from: "server", to: "as", label: "Confidential client + DPoP or mTLS" },
    ],
  },
  hostVariants: [
    {
      slug: "browser",
      title: "Browser-based agent host",
      situation:
        "The product UI is the OAuth client: a chat SPA, an embedded assistant, anything whose JavaScript could see a token.",
      topology: {
        caption: "RFC 10017: PKCE always. Tokens belong in a BFF cookie or in memory — not in localStorage.",
        nodes: [
          { id: "user", label: "User", kind: "user" },
          { id: "spa", label: "Browser agent host", kind: "agent" },
          { id: "bff", label: "Optional BFF", kind: "workload" },
          { id: "as", label: "AS", kind: "as" },
          { id: "api", label: "API", kind: "resource" },
        ],
        edges: [
          { from: "user", to: "spa", label: "Uses the chat UI" },
          { from: "spa", to: "bff", label: "Prefer the BFF as the confidential client" },
          { from: "bff", to: "as", label: "Auth code + PKCE" },
          { from: "bff", to: "api", label: "Server-side call; HTTP-only session cookie to the page" },
        ],
      },
      primarySlugs: ["browser-apps", "pkce", "oauth-2-1"],
      pitfalls:
        "XSS on the chat page is token theft. localStorage and sessionStorage survive XSS. Do not put access tokens in the DOM, in analytics, or in model prompts. Implicit flow is gone.",
    },
    {
      slug: "native",
      title: "Native app host",
      situation:
        "Desktop or mobile companion: Claude Desktop, a CLI, an IDE plugin that opens a browser for login.",
      topology: {
        caption: "RFC 8252: system browser, PKCE, claimed HTTPS or loopback. No embedded webview.",
        nodes: [
          { id: "user", label: "User", kind: "user" },
          { id: "app", label: "Native agent host", kind: "agent" },
          { id: "browser", label: "System browser", kind: "other" },
          { id: "as", label: "AS", kind: "as" },
        ],
        edges: [
          { from: "app", to: "browser", label: "Open authorize URL" },
          { from: "user", to: "browser", label: "Authenticate and consent" },
          { from: "browser", to: "app", label: "Authorization code on claimed HTTPS or loopback" },
          { from: "app", to: "as", label: "Code + PKCE exchange" },
        ],
      },
      primarySlugs: ["native-apps", "pkce", "oauth-2-1"],
      pitfalls:
        "Embedded webviews are in-scope for phishing the password. Custom URI schemes are a last resort if claimed HTTPS is unavailable. OS token stores beat a plaintext file next to the binary.",
    },
    {
      slug: "server",
      title: "Server-side agent runtime",
      situation:
        "The agent is a backend process. It can keep a client key. The browser, if any, never sees access tokens.",
      topology: {
        caption: "Confidential client. Authenticate with a key; sender-constrain the access token.",
        nodes: [
          { id: "user", label: "User (optional UI)", kind: "user" },
          { id: "ui", label: "Front end (no tokens)", kind: "other" },
          { id: "rt", label: "Server-side agent", kind: "workload" },
          { id: "as", label: "AS", kind: "as" },
          { id: "api", label: "API", kind: "resource" },
        ],
        edges: [
          { from: "user", to: "ui", label: "Session cookie only" },
          { from: "rt", to: "as", label: "Client auth (private_key_jwt / mTLS) + user grant or client_credentials" },
          { from: "rt", to: "api", label: "DPoP or mTLS-bound access token" },
        ],
      },
      primarySlugs: ["oauth-2-1", "dpop", "mtls"],
      pitfalls:
        "Tokens in logs, traces, and tool arguments are the usual leak. Do not ship the client secret to the browser 'for convenience.' Do not hand the model the refresh token.",
    },
  ],
  protocols: [
    { slug: "browser-apps", fit: "primary", note: "RFC 10017 — browser-based hosts." },
    { slug: "native-apps", fit: "primary", note: "RFC 8252 — native / CLI hosts." },
    { slug: "oauth-2-1", fit: "primary" },
    { slug: "pkce", fit: "primary" },
    { slug: "dpop", fit: "primary", note: "Server-side (and anywhere you can) sender-constraint." },
    { slug: "mtls", fit: "optional", note: "Confidential clients that already have a cert." },
    { slug: "oauth-security-bcp", fit: "optional", note: "RFC 9700." },
    {
      label: "Tokens in localStorage or the DOM",
      fit: "anti-pattern",
      note: "XSS reads them. RFC 10017 is explicit.",
    },
    {
      label: "Embedded webview for login",
      fit: "anti-pattern",
      note: "RFC 8252: use the system browser.",
    },
    {
      label: "Client secret in browser JavaScript",
      fit: "anti-pattern",
      note: "There is no confidential client in the page.",
    },
  ],
  relatedFlows: ["user-delegated-api", "agent-as-client-mcp"],
  aliases: ["RFC 10017", "RFC 8252", "BFF", "native app", "SPA agent"],
  searchTerms: [
    "browser",
    "native app",
    "server-side",
    "token storage",
    "localStorage",
    "BFF",
    "RFC 10017",
    "RFC 8252",
  ],
};

const unattended: DeploymentPattern = {
  slug: "unattended-batch",
  title: "Unattended batch / service agent",
  matrixTitle: "Unattended batch",
  summary:
    "A cron, a queue worker, a service account with no human on the request. Client credentials and workload identity. Never the password grant. Never a long-lived user refresh token stuffed into the job.",
  inTheWild:
    "Nightly summarization over a corpus the service owns, a pipeline that classifies tickets as itself, a scheduled agent that calls internal APIs with a workload identity. If a human must approve a specific action, that is headless/async (CIBA), not this row.",
  actors: [
    {
      name: "Service agent",
      principal: "workload",
      trust: "Acts as itself. Identified by client_id plus workload identity, not by a user sub.",
    },
    {
      name: "Authorization server (optional)",
      principal: "other",
      trust: "Issues a client-credentials access token audience-restricted to the API.",
    },
    {
      name: "Resource",
      principal: "resource",
      trust: "Authorizes a service account / SPIFFE ID. There is no 'on behalf of Alice' unless you moved to an OBO row.",
    },
  ],
  whyThese:
    "Client credentials (OAuth 2.1) and workload identity (SPIFFE/WIMSE) answer 'which robot is this?' They do not answer 'which human?' — and this row has no human. The password grant is gone (OAuth 2.1 / RFC 9700) and was always the wrong way to let a batch job impersonate someone. A long-lived user refresh token in a cron secret is delegated access with no session, no rotation story, and no way for the user to know the job is still running. If you need a user, use CIBA or an interactive grant at the time of action. AAP and AIMS are draft profiles/BCPs on this shape; treat them as churn.",
  userPresent: "no",
  asInPath: "sometimes",
  workloadIdentity: "yes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "No user. The job authenticates as itself — client credentials and/or a workload SVID — then calls the API.",
    nodes: [
      { id: "cron", label: "Batch / cron agent", kind: "workload" },
      { id: "spire", label: "SPIRE / issuer", kind: "other" },
      { id: "as", label: "AS", kind: "as" },
      { id: "api", label: "API", kind: "resource" },
    ],
    edges: [
      { from: "spire", to: "cron", label: "Workload identity" },
      { from: "cron", to: "as", label: "client_credentials (SPIFFE or mTLS client auth)" },
      { from: "cron", to: "api", label: "Service-account call; aud = this API" },
    ],
  },
  protocols: [
    { slug: "oauth-2-1", fit: "primary", note: "Client credentials grant." },
    { slug: "spiffe", fit: "primary" },
    { slug: "jwt-client-auth", fit: "optional", note: "RFC 7523 private_key_jwt client auth or JWT grants." },
    { slug: "spiffe-client-auth", fit: "optional" },
    { slug: "mtls", fit: "optional" },
    { slug: "wimse-creds", fit: "optional" },
    { slug: "aims", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — client-credentials plus structured agent claims." },
    { slug: "oauth-security-bcp", fit: "optional", note: "RFC 9700." },
    {
      label: "Resource Owner Password Credentials",
      fit: "anti-pattern",
      note: "Never. Removed from OAuth 2.1.",
    },
    {
      label: "Long-lived user refresh token in a cron",
      fit: "anti-pattern",
      note: "That is someone else's grant, parked in a job. Use client credentials, or CIBA when a human must approve.",
    },
    {
      slug: "oidc-core",
      fit: "anti-pattern",
      note: "No user on this hop. An ID Token is not an access token.",
    },
  ],
  relatedFlows: ["workload-then-user", "ciba-hitl"],
  aliases: ["cron agent", "service account", "batch", "client credentials"],
  searchTerms: [
    "unattended",
    "batch",
    "cron",
    "client credentials",
    "service agent",
    "password grant",
  ],
};

export const patterns: DeploymentPattern[] = [
  interactive,
  headless,
  enterprise,
  mcpHost,
  agentAsResource,
  a2aTasking,
  aauthP2p,
  aauthPs,
  multiHop,
  crossDomain,
  sidecar,
  hostRuntime,
  unattended,
];

const bySlug = new Map(patterns.map((pattern) => [pattern.slug, pattern]));

export function getPattern(slug: string): DeploymentPattern | undefined {
  return bySlug.get(slug);
}

export const PATTERN_COUNT = patterns.length;

export function protocolsByFit(
  pattern: DeploymentPattern,
  fit: ProtocolFit,
): PatternProtocol[] {
  return pattern.protocols.filter((item) => item.fit === fit);
}

export function primaryProtocolSlugs(pattern: DeploymentPattern): string[] {
  return protocolsByFit(pattern, "primary")
    .map((item) => item.slug)
    .filter((slug): slug is string => Boolean(slug));
}

/** Skip unknown catalog slugs instead of throwing. */
export function resolveSpec(slug: string | undefined): Spec | undefined {
  if (!slug) return undefined;
  return getSpec(slug);
}

export function resolveSpecs(slugs: string[]): Spec[] {
  return slugs
    .map((slug) => getSpec(slug))
    .filter((spec): spec is Spec => Boolean(spec));
}

export function resolveFlows(slugs: string[]): AgentFlow[] {
  return slugs
    .map((slug) => getFlow(slug))
    .filter((flow): flow is AgentFlow => Boolean(flow));
}

export function protocolDisplayName(item: PatternProtocol): string | undefined {
  if (item.label) return item.label;
  if (!item.slug) return undefined;
  return getSpec(item.slug)?.shortName ?? undefined;
}

/** True when the catalog marks this document as an individual draft (AIMS, agent-grants, AAP, AAuth, …). */
export function isDraftChurn(spec: Spec | undefined): boolean {
  return spec?.status === "individual-draft";
}

export function patternHaystack(pattern: DeploymentPattern): string {
  const protocolNames = pattern.protocols
    .map((item) => {
      const spec = item.slug ? getSpec(item.slug) : undefined;
      return [item.slug, item.label, item.note, spec?.shortName, spec?.id]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
  const variantText = (pattern.hostVariants ?? [])
    .map((variant) => hostVariantHaystack(variant))
    .join(" ");
  return [
    pattern.title,
    pattern.matrixTitle,
    pattern.summary,
    pattern.inTheWild,
    pattern.whyThese,
    pattern.slug,
    ...(pattern.aliases ?? []),
    ...(pattern.searchTerms ?? []),
    ...pattern.actors.map((actor) => `${actor.name} ${actor.trust}`),
    pattern.topology.caption,
    protocolNames,
    variantText,
  ]
    .join(" ")
    .toLowerCase();
}

function hostVariantHaystack(variant: HostVariant): string {
  return [
    variant.title,
    variant.situation,
    variant.pitfalls,
    variant.topology.caption,
    ...variant.primarySlugs,
  ].join(" ");
}

export function searchPatterns(query: string): DeploymentPattern[] {
  const q = query.trim().toLowerCase();
  if (!q) return patterns;
  return patterns.filter((pattern) => patternHaystack(pattern).includes(q));
}
