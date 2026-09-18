import type { DeploymentPattern } from "@/lib/types";

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
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00): BCP map, not a wire protocol." },
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
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
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
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
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
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
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

export { interactive, headless, enterprise, mcpHost };
