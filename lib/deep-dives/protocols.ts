import type { SpecDeepDive } from "@/lib/types";

export const protocolDeepDives: Record<string, SpecDeepDive> = {
  "mcp-auth": {
    agentGap: [
      "An MCP client (often an agent host) must access a restricted MCP server on behalf of a resource owner over HTTP, without inventing a proprietary token scheme. The 2026-07-28 specification — still current when fetched 15 September 2026 — makes the MCP server an OAuth 2.1 resource server and the MCP client an OAuth 2.1 client.",
      "This is how most 'ChatGPT/Claude/Cursor calls my tools' auth actually works in 2026: vanilla OAuth 2.1 plus protected resource metadata. It does not give the MCP server an independent agent identity for the model — only a client token for the host. Stdio transports SHOULD NOT use this profile; they take credentials from the environment.",
    ],
    trustBoundaries: [
      "Resource owner authenticates at the AS (often via OIDC). MCP client stores tokens and must not put them in query strings or forward them to other servers. MCP server (RS) must audience-validate: a token minted for another MCP server is an attack. Authorization servers may be third-party; clients MUST support both RFC 8414 and OIDC discovery. Client credentials obtained via DCR or pre-registration MUST be keyed by AS issuer and MUST NOT be reused if PRM points at a new AS.",
    ],
    mechanics: [
      "Authorization is OPTIONAL for MCP as a whole. When HTTP authorization is used: (1) AS MUST implement OAuth 2.1 with appropriate security for confidential and public clients. (2) AS and clients SHOULD support CIMD (the spec still cites draft-ietf-oauth-client-id-metadata-document-00; WG draft is -02). (3) DCR MAY, but is deprecated. (4) MCP servers MUST implement RFC 9728; clients MUST use it for AS discovery. (5) AS MUST provide RFC 8414 and/or OIDC Discovery; clients MUST support both. (6) Clients MUST send RFC 8707 resource=<canonical MCP URI> on authorization and token requests regardless of whether the AS honours it. (7) Bearer access tokens per OAuth 2.1 §5; RS MUST validate audience. (8) RFC 9207 iss validation is required in this revision. Protocol-level sessions were removed in 2026-07-28.",
      "Step-up: MCP adds scope-union / hierarchy rules on top of RFC 9470. WWW-Authenticate on 401 carries resource_metadata. CIMD vs DCR selection is specified on the client-registration page.",
    ],
    claims: [
      {
        name: "resource (RFC 8707)",
        meaning:
          "Quoted MCP MUST: canonical MCP server URI on both authorization and token requests, even if the AS ignores it.",
        source: "quoted",
      },
      {
        name: "Bearer access token",
        meaning:
          "Quoted: issued for this MCP server as audience. Must not be forwarded elsewhere.",
        source: "quoted",
      },
      {
        name: "WWW-Authenticate resource_metadata",
        meaning: "Quoted bootstrap to RFC 9728 PRM.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "mcp-http",
        title: "HTTP MCP authorization",
        steps: [
          "MCP client sends an unauthenticated HTTP request to the MCP server.",
          "Server 401s with WWW-Authenticate including resource_metadata URL.",
          "Client fetches RFC 9728 PRM, records resource and authorization_servers.",
          "Client discovers AS via RFC 8414 and/or OIDC Discovery; verifies issuer.",
          "Client obtains a client_id: CIMD (SHOULD), pre-registration, or DCR (MAY, deprecated).",
          "Authorization code + PKCE (OAuth 2.1). resource=canonical MCP URI on authorize and token requests. Validate iss on the response.",
          "Client calls the MCP server with Authorization: Bearer. Server checks the token was issued for itself. Tokens never go in query strings.",
        ],
        notes:
          "Stdio MUST NOT use this. The model never sees a protocol other than 'call this tool' — the host is the OAuth client.",
      },
    ],
    layerDetail: [
      "Authorization at the transport. User identity is whatever the AS puts in the token (often via OIDC). The MCP server does not learn a cryptographic agent-instance identity unless you add AAuth/WIMSE alongside. Client identity is client_id (CIMD URL or registered).",
    ],
    composition: [
      { specSlug: "oauth-2-1", how: "Required shape. MCP still cites draft-13; implement -16 + RFC 9700." },
      { specSlug: "prm", how: "MUST for servers and for client discovery." },
      { specSlug: "resource-indicators", how: "MUST send resource even if AS ignores it." },
      { specSlug: "cimd", how: "SHOULD. MCP cites -00; WG is -02." },
      { specSlug: "dcr", how: "MAY, deprecated." },
      { specSlug: "as-metadata", how: "MUST try RFC 8414 paths." },
      { specSlug: "oidc-discovery", how: "MUST also try OIDC discovery." },
      { specSlug: "iss-param", how: "MUST validate iss (2026-07-28)." },
      { specSlug: "aauth", how: "Not required. Would be a different identity for the caller than the host's OAuth client_id." },
    ],
    pitfalls: [
      {
        title: "Audience skip",
        body: "If the MCP server accepts any token from a popular AS, calendar tokens call payments. Audience check is a MUST.",
      },
      {
        title: "Forwarding tokens",
        body: "The host must not pass the MCP access token to third-party APIs. That is confused deputy.",
      },
      {
        title: "Citation lag",
        body: "OAuth 2.1-13 and CIMD-00 in the spec text. Implement current drafts/RFCs for token handling; still obey MCP MUST/SHOULD.",
      },
      {
        title: "DCR on an open AS",
        body: "Deprecated for a reason. Prefer CIMD. Bind any leftover DCR secrets to the issuer.",
      },
      {
        title: "Tokens in model context",
        body: "Bearer tokens plus prompt injection is RFC 6750 theft. Keep tokens in the host, not in the prompt.",
      },
    ],
    stabilityDetail: [
      "Not an RFC. MCP specification revision 2026-07-28 is current as of 15 September 2026. Vendor/protocol stability: the MCP steering process versions independently of the IETF. https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization — ship this profile for HTTP MCP; pin the revision date.",
    ],
  },
  a2a: {
    agentGap: [
      "Independent agents, built on different stacks, need a common way to discover skills, authenticate, delegate tasks, and exchange results across organizational boundaries. A2A v1.0 (AAIF / Linux Foundation; v1.0 announced March 2026) is that task protocol. It is not an identity protocol and not AAuth.",
      "If someone says 'p2p' meaning agent-to-agent communication, they often mean A2A. If they say 'p2p' next to AAuth, they more often mean AAuth's two-party / identity-based mode (no AS). Both uses appear in the wild — this site treats them as distinct. did:peer is a third meaning.",
    ],
    trustBoundaries: [
      "A2A client agent and A2A server agent. Identity of an agent is the Agent Card (optionally signed JWS with RFC 8785 canonicalization) — tamper evidence of the card, not request authentication. Request authentication is ordinary HTTP schemes advertised on the card (API key, Basic/Bearer, OAuth 2.0, OIDC, mTLS). Credentials are obtained out of band unless an extension negotiates in-band — and in-band credential exchange across chains of A2A agents exposes those credentials to each hop.",
      "Authorization models are agent-defined (user, role, project, tenant, custom). The protocol requires that list/get/cancel operations be scoped to the authenticated caller; it does not prescribe the model. Extended Agent Cards are only after authentication and MUST NOT leak extra skills to anonymous callers.",
    ],
    mechanics: [
      "Server publishes /.well-known/agent-card.json. Card fields include identity, skills, supportedInterfaces, securitySchemes / security (OpenAPI-shaped: apiKey, http, oauth2, openIdConnect, mutualTLS). OAuth2SecurityScheme has flows (authorizationCode, clientCredentials, implicit and password deprecated, deviceCode) and optional oauth2MetadataUrl (RFC 8414, TLS required). Client picks a supported interface, sends A2A-Version, authenticates with a declared scheme, then tasks over JSON-RPC, gRPC, or HTTP+JSON.",
      "Get Extended Agent Card requires authentication using a public-card scheme. In-task authorization can pause a task (TASK_STATE_AUTH_REQUIRED) for out-of-band credentials. Implicit and password OAuth flows are deprecated on the card.",
    ],
    claims: [
      {
        name: "Agent Card (/.well-known/agent-card.json)",
        meaning:
          "Quoted: JSON metadata — identity, skills, interfaces, securitySchemes. Optional JWS is card integrity, not request auth.",
        source: "quoted",
      },
      {
        name: "securitySchemes / OAuth2SecurityScheme",
        meaning:
          "Quoted: HTTP schemes plus OAuth2/OIDC/mTLS. oauth2MetadataUrl is RFC 8414. implicit and password flows deprecated.",
        source: "quoted",
      },
      {
        name: "A2A-Version",
        meaning:
          "Quoted protocol version header using Major.Minor (e.g. 1.0). Patch numbers MUST NOT drive negotiation.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "a2a-task",
        title: "Discover, authenticate out of band, task",
        steps: [
          "Client GETs /.well-known/agent-card.json. Optionally verifies JWS.",
          "Client selects a security scheme from the card (e.g. OAuth authorization code or mTLS).",
          "Out of band: obtain the credential (OAuth 2.1 at oauth2MetadataUrl, present a cert, …).",
          "Client calls a supported interface with A2A-Version and the credential.",
          "Optional: Get Extended Agent Card once authenticated; replace the cached public card for this session.",
          "Tasks flow. List/Get/Cancel MUST be scoped to this caller. If AUTH_REQUIRED, obtain more credentials out of band (or via a negotiated extension).",
        ],
        notes:
          "Do not confuse this with AAuth identity-based access: A2A still often uses OAuth client-credentials bearer tokens. Do not confuse it with did:peer: there is no pairwise DID here unless you layer one yourself.",
      },
    ],
    layerDetail: [
      "Communication protocol with declared authentication schemes. Identity of an agent is the card URL/contents (and optional signature). Authentication is the HTTP scheme on the request. Authorization is the server agent's own model plus whatever the OAuth token encoded. A2A does not replace OAuth, OIDC, AAuth, or WIMSE.",
    ],
    composition: [
      { specSlug: "oauth-2-0", how: "Card-advertised OAuth. Obtain tokens however the flow says, then attach them." },
      { specSlug: "oauth-2-1", how: "Do not use the card's deprecated implicit/password flows; use code+PKCE or client credentials." },
      { specSlug: "oidc-core", how: "openIdConnect security scheme on the card." },
      { specSlug: "mtls", how: "mutualTLS scheme on the card." },
      { specSlug: "mcp-auth", how: "MCP is host-to-tool OAuth; A2A is agent-to-agent tasks. An A2A server might also be an MCP server; the auth stacks can coexist." },
      { specSlug: "aauth", how: "AAuth could theoretically be a custom security scheme, but v1.0 does not define one. Different problem (HTTP caller identity vs task protocol)." },
      { specSlug: "transaction-tokens", how: "Not in v1.0. Usage profiles exist as separate I-Ds." },
      { specSlug: "did-peer", how: "Different p2p: pairwise DIDs, not Agent Cards." },
    ],
    pitfalls: [
      {
        title: "Signed card ≠ authenticated request",
        body: "A valid JWS on the card proves the card was not tampered with. Every request still needs a scheme from securitySchemes.",
      },
      {
        title: "In-band credentials across hops",
        body: "Section 7.6.3 warns that in-band credential exchange can pass secrets through every A2A agent in a chain. Prefer out-of-band.",
      },
      {
        title: "Authorization scoping",
        body: "List Tasks MUST NOT leak other callers' tasks. Check authz before queries that would reveal existence.",
      },
      {
        title: "Deprecated OAuth flows on cards",
        body: "If a card still advertises implicit or password, do not use them. That is RFC 9700 plus the A2A schema's own deprecation.",
      },
    ],
    stabilityDetail: [
      "A2A v1.0 is the first stable spec (announced March 2026), donated to the Linux Foundation (2025) and under AAIF (2026). Not an RFC. v0.3 remains relevant for migration. IBM's Agent Communication Protocol merged into A2A (August 2025). https://a2a-protocol.org/v1.0.0/specification/",
    ],
  },
};
