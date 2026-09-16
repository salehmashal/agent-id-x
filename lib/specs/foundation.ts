import type { Spec } from "@/lib/types";

export const foundationSpecs: Spec[] = [
  {
    slug: "oauth-2-0",
    shortName: "OAuth 2.0",
    officialName: "The OAuth 2.0 Authorization Framework",
    id: "RFC 6749",
    status: "rfc",
    stability: "stable",
    date: "October 2012",
    authors: "D. Hardt (ed.)",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    featured: true,
    aliases: ["oauth2", "rfc6749"],
    problem:
      "An application needs limited access to a user's resources at an HTTP API without receiving the user's password. OAuth 2.0 splits the resource owner, the client, the authorization server, and the resource server, and issues an access token after an authorization grant.",
    identityVsAuthnVsAuthz:
      "Authorization, not identity. OAuth 2.0 does not tell you who the user is; it tells a resource server that a client has been granted some access. The client itself has no portable identity: a client_id is issued by each authorization server and is meaningless elsewhere.",
    actors: [
      "Resource owner (typically a human)",
      "Client (the application — an agent is usually this)",
      "Authorization server",
      "Resource server (API / tool)",
    ],
    flow: "The client redirects the resource owner to the authorization server (or uses another grant). After approval, the authorization server issues an authorization code (or, in grants now considered unsafe, tokens directly). The client exchanges the code at the token endpoint for an access token and optionally a refresh token, then presents the access token to the resource server.",
    tokensAndClaims: [
      {
        name: "access_token",
        meaning:
          "Opaque or structured credential presented to the resource server. RFC 6749 does not require a JWT.",
      },
      {
        name: "refresh_token",
        meaning: "Longer-lived credential used only at the token endpoint to mint new access tokens.",
      },
      {
        name: "scope",
        meaning:
          "Space-delimited permission strings. Too coarse for many agent tool calls; later specs (RAR, AAuth R3) address this.",
      },
      {
        name: "client_id",
        meaning:
          "Identifier of the client at this authorization server only. Not a global agent identity.",
      },
    ],
    related: [
      "oauth-bearer",
      "oauth-2-1",
      "oidc-core",
      "oauth-security-bcp",
      "aauth",
    ],
    implementerNotes:
      "Still the deployed baseline. Do not implement the Implicit or Resource Owner Password Credentials grants for new work. Pair with RFC 9700. For agents, treat the agent as the OAuth client, not as a new OAuth role.",
    whyAgentCares:
      "Almost every production 'agent calls an API on behalf of a user' design is still an OAuth 2.0 client using an authorization grant. AAuth, MCP authorization, and A2A security schemes all assume you know this model so they can extend or replace parts of it.",
    urls: [
      {
        label: "RFC 6749",
        href: "https://www.rfc-editor.org/rfc/rfc6749.html",
      },
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/rfc6749/",
      },
    ],
  },
  {
    slug: "oauth-bearer",
    shortName: "Bearer tokens",
    officialName: "The OAuth 2.0 Authorization Framework: Bearer Token Usage",
    id: "RFC 6750",
    status: "rfc",
    stability: "stable",
    date: "October 2012",
    authors: "M. Jones, D. Hardt",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc6750", "bearer"],
    problem:
      "Once a client has an OAuth access token, how does it present that token to a resource server, and how does the server reject a missing or invalid token?",
    identityVsAuthnVsAuthz:
      "Presentation of an authorization credential. A bearer token authenticates possession of the token, not possession of a key. Anyone who steals the token can use it.",
    actors: ["Client", "Resource server"],
    flow: "The client sends Authorization: Bearer <token> on the resource request. Query-string and form-body methods were defined; later security BCPs forbid putting bearer tokens in URIs. Invalid tokens produce HTTP 401 with a WWW-Authenticate: Bearer challenge.",
    tokensAndClaims: [
      {
        name: "Authorization: Bearer",
        meaning: "The only presentation method you should use in 2026.",
      },
      {
        name: "WWW-Authenticate",
        meaning:
          "Challenge header. MCP and Protected Resource Metadata later put a resource_metadata URL here.",
      },
    ],
    related: ["oauth-2-0", "oauth-2-1", "dpop", "mtls", "oauth-security-bcp"],
    implementerNotes:
      "Agents that cache bearer tokens in prompts, logs, or tool traces leak them. Prefer sender-constrained tokens (DPoP, mTLS, HTTP Message Signatures) whenever the agent runtime is untrusted.",
    whyAgentCares:
      "MCP HTTP authorization still uses bearer access tokens. That is convenient and also the main reason a compromised agent process can replay a user's API access until the token expires.",
    urls: [
      {
        label: "RFC 6750",
        href: "https://www.rfc-editor.org/rfc/rfc6750.html",
      },
    ],
  },
  {
    slug: "oauth-2-1",
    shortName: "OAuth 2.1",
    officialName: "The OAuth 2.1 Authorization Framework",
    id: "draft-ietf-oauth-v2-1-16",
    status: "wg-draft",
    stability: "draft",
    date: "3 September 2026",
    authors: "D. Hardt, A. Parecki, T. Lodderstedt",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    featured: true,
    aliases: ["oauth21", "oauth 2.1"],
    problem:
      "OAuth 2.0 plus a decade of extensions and deprecations is too fragmented to implement safely from RFC 6749 alone. OAuth 2.1 consolidates the core framework with the security practices that actually survived contact with the internet.",
    identityVsAuthnVsAuthz:
      "Same layer as OAuth 2.0: delegated authorization. It still is not an identity protocol. OpenID Connect remains the identity layer that rides on top.",
    actors: [
      "Resource owner",
      "Client (confidential or public)",
      "Authorization server",
      "Resource server",
    ],
    flow: "Authorization Code is the interactive grant, with PKCE required. Client Credentials remains for the client acting on its own behalf. Implicit and Resource Owner Password Credentials are omitted. Exact string matching of redirect URIs. Bearer tokens are not placed in URI query strings. Public-client refresh tokens must be sender-constrained or one-time use (rotated).",
    tokensAndClaims: [
      {
        name: "code_challenge / code_verifier",
        meaning:
          "PKCE is the default authorization-code exchange. The plain method is removed.",
      },
      {
        name: "redirect_uri at token endpoint",
        meaning:
          "Removed in 2.1 because PKCE already stops code injection. Mixed 2.0/2.1 servers may still require it for old clients.",
      },
    ],
    related: [
      "oauth-2-0",
      "pkce",
      "oauth-security-bcp",
      "native-apps",
      "browser-apps",
      "mcp-auth",
      "oidc-core",
    ],
    implementerNotes:
      "Not an RFC as of September 2026. OAuth WG milestone is to submit it to the IESG in December 2026. MCP's 2026-07-28 authorization spec still cites draft-ietf-oauth-v2-1-13; implement against the current draft-16 text and RFC 9700, not against memory of 2.0. Draft-16's browser-apps section still had a TODO to import RFC 10017 once finalized — RFC 10017 has since been published.",
    whyAgentCares:
      "This is the security baseline MCP, FAPI 2.0 thinking, and most 'agent as OAuth client' designs now assume: PKCE always, no implicit, no password grant, no tokens in URLs. If your agent SDK still does implicit or stores refresh tokens unbound in local storage, it is not 2.1-shaped.",
    urls: [
      {
        label: "Datatracker (latest)",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/",
      },
      {
        label: "HTML of draft-16",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-16",
      },
      { label: "oauth.net/2.1", href: "https://oauth.net/2.1/" },
    ],
  },
  {
    slug: "pkce",
    shortName: "PKCE",
    officialName: "Proof Key for Code Exchange by OAuth Public Clients",
    id: "RFC 7636",
    status: "rfc",
    stability: "stable",
    date: "September 2015",
    authors: "N. Sakimura, J. Bradley, N. Agarwal",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc7636", "proof key"],
    problem:
      "Public clients (native apps, many SPAs, many agents) cannot keep a client secret. An attacker who intercepts the authorization code can otherwise redeem it.",
    identityVsAuthnVsAuthz:
      "Protects the authorization-code redemption step (a form of client-to-AS authentication of the token request). Does not identify the user.",
    actors: ["Public or confidential client", "Authorization server"],
    flow: "The client creates a code_verifier, sends its hash as code_challenge (S256) on the authorization request, and presents the original verifier at the token endpoint. The AS accepts the code only if the verifier matches.",
    tokensAndClaims: [
      {
        name: "code_challenge_method=S256",
        meaning: "The only method OAuth 2.1 keeps. 'plain' is prohibited.",
      },
    ],
    related: ["oauth-2-0", "oauth-2-1", "native-apps", "mcp-auth"],
    implementerNotes:
      "OAuth 2.1 and RFC 9700 require PKCE for authorization-code clients, including confidential ones. Generate a new verifier per authorization request.",
    whyAgentCares:
      "An agent that opens a browser (or a loopback redirect) to get user consent is a public or at-best confidential client in a hostile environment. PKCE is the difference between 'the code in the redirect is enough' and 'only the process that started the flow can finish it'.",
    urls: [
      {
        label: "RFC 7636",
        href: "https://www.rfc-editor.org/rfc/rfc7636.html",
      },
    ],
  },
  {
    slug: "jwt",
    shortName: "JWT",
    officialName: "JSON Web Token (JWT)",
    id: "RFC 7519",
    status: "rfc",
    stability: "stable",
    date: "May 2015",
    authors: "M. Jones, J. Bradley, N. Sakimura",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    aliases: ["rfc7519", "json web token"],
    problem:
      "Parties need a compact, URL-safe way to carry claims between systems, optionally signed or encrypted.",
    identityVsAuthnVsAuthz:
      "A container. An ID Token is identity; a JWT access token is authorization; a WIT or AAuth agent token is identity bound to a key. The JWT format does not decide the layer — the profile does.",
    actors: ["Issuer", "Subject", "Audience / relying party"],
    flow: "Issuer constructs a JOSE header + claims set, signs (JWS) or encrypts (JWE). Receiver verifies signature, standard claims (iss, aud, exp, nbf), and profile-specific rules.",
    tokensAndClaims: [
      { name: "iss / sub / aud", meaning: "Issuer, subject, audience. Identity is usually the pair (iss, sub)." },
      { name: "exp / nbf / iat", meaning: "Time window. Agent tokens should be short-lived." },
      { name: "cnf", meaning: "Confirmation key, used by DPoP, mTLS, AAuth, WIMSE to bind a key." },
      { name: "act", meaning: "Actor claim from RFC 8693, used for delegation chains." },
    ],
    related: ["jwt-access-tokens", "oidc-core", "token-exchange", "aauth", "wimse-creds"],
    implementerNotes:
      "Never treat an unprofiled JWT as an access token. Follow RFC 8725 JWT BCP (and the 2026 rfc8725bis work in the RFC Editor queue). Check typ, alg allow-lists, and audience.",
    whyAgentCares:
      "Every modern agent-auth proposal — AAuth (aa-agent+jwt, aa-auth+jwt), WIMSE WIT, RFC 9068 access tokens, ID-JAG, transaction tokens — is a JWT profile. If you cannot validate iss, aud, typ, and cnf, you cannot implement the landscape.",
    urls: [
      {
        label: "RFC 7519",
        href: "https://www.rfc-editor.org/rfc/rfc7519.html",
      },
    ],
  },
  {
    slug: "oauth-security-bcp",
    shortName: "OAuth Security BCP",
    officialName: "Best Current Practice for OAuth 2.0 Security",
    id: "RFC 9700 (BCP 240)",
    status: "rfc",
    stability: "stable",
    date: "January 2025",
    authors: "T. Lodderstedt, J. Bradley, A. Labunets, D. Fett",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    featured: true,
    aliases: ["rfc9700", "security topics"],
    problem:
      "RFC 6749's original threat model is incomplete. Mix-up attacks, authorization-code injection, token leakage via URLs, and unsafe grants showed up in production. This BCP updates 6749/6750/6819 with what actually works.",
    identityVsAuthnVsAuthz:
      "Security profile sitting across authentication of the client and authorization of the request. It is why OAuth 2.1 exists.",
    actors: ["Clients", "Authorization servers", "Resource servers"],
    flow: "Not a new protocol. It mandates authorization code + PKCE, exact redirect matching, sender-constrained or rotating refresh tokens for public clients, audience-restricted access tokens when multiple resources exist, and deprecates implicit and password grants.",
    tokensAndClaims: [
      {
        name: "iss in authorization response",
        meaning: "Mix-up mitigation; see RFC 9207.",
      },
    ],
    related: ["oauth-2-0", "oauth-2-1", "pkce", "iss-param", "dpop", "fapi-2"],
    implementerNotes:
      "An update draft (draft-ietf-oauth-security-topics-update) was an active WG document in July 2026. Read RFC 9700 first; treat the update as pending deltas. FAPI 2.0 Security Profile is explicitly built on this BCP.",
    whyAgentCares:
      "Agent runtimes leak tokens through logs, traces, and model context. RFC 9700's push toward sender-constrained, audience-restricted, short-lived tokens is the cheapest security upgrade you can make before AAuth or WIMSE.",
    urls: [
      {
        label: "RFC 9700",
        href: "https://www.rfc-editor.org/rfc/rfc9700.html",
      },
    ],
  },
  {
    slug: "native-apps",
    shortName: "OAuth for native apps",
    officialName: "OAuth 2.0 for Native Apps",
    id: "RFC 8252 (BCP 212)",
    status: "rfc",
    stability: "stable",
    date: "October 2017",
    authors: "W. Denniss, J. Bradley",
    org: "IETF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["rfc8252"],
    problem:
      "Native apps cannot safely embed a user-agent and must complete an authorization-code flow via the system browser with PKCE and claimed HTTPS redirect URIs (or loopback).",
    identityVsAuthnVsAuthz:
      "Authorization UX for clients that are not servers. Relevant when an agent has a companion desktop or mobile console that must collect user consent.",
    actors: ["Native app", "System browser", "Authorization server"],
    flow: "App opens the system browser to the authorization endpoint, receives the code on a claimed HTTPS URL or loopback, exchanges it with PKCE.",
    tokensAndClaims: [],
    related: ["oauth-2-1", "pkce", "browser-apps"],
    implementerNotes:
      "Do not use custom URI schemes if HTTPS app links / claimed HTTPS URIs are available. Embedded webviews are in-scope for attackers.",
    whyAgentCares:
      "Human-in-the-loop consent for a local agent often looks like this RFC, not like a server-side redirect. Loopback + PKCE is the usual pattern for CLI agents.",
    urls: [
      {
        label: "RFC 8252",
        href: "https://www.rfc-editor.org/rfc/rfc8252.html",
      },
    ],
  },
  {
    slug: "browser-apps",
    shortName: "OAuth for browser apps",
    officialName: "OAuth 2.0 for Browser-Based Applications",
    id: "RFC 10017 (BCP 212)",
    status: "rfc",
    stability: "stable",
    date: "August 2026",
    authors: "A. Parecki, D. Waite, P. De Ryck",
    org: "IETF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["rfc10017", "spa oauth"],
    problem:
      "Code running in a browser cannot hide a client secret or reliably hide tokens from XSS. The implicit flow is unsafe. This BCP describes threats and recommended architectures (BFF vs. browser-only with PKCE).",
    identityVsAuthnVsAuthz:
      "Authorization for public clients in the browser. Complements OIDC for SPAs.",
    actors: ["Browser-based app", "Optional BFF", "Authorization server"],
    flow: "Authorization Code + PKCE. Prefer a Backend-for-Frontend that holds tokens in HTTP-only cookies. If tokens must live in the browser, keep them in memory, not localStorage.",
    tokensAndClaims: [],
    related: ["oauth-2-1", "pkce", "oauth-security-bcp"],
    implementerNotes:
      "OAuth 2.1 draft-16 still had a TODO to import this text; the RFC itself published in August 2026. Confirm the RFC Editor page for the exact author list if citing academically.",
    whyAgentCares:
      "Chat UIs that broker agent OAuth in the browser are browser-based OAuth clients. XSS in the chat page is equivalent to stealing the agent's tokens.",
    urls: [
      {
        label: "RFC 10017",
        href: "https://www.rfc-editor.org/rfc/rfc10017.html",
      },
      {
        label: "oauth.net summary",
        href: "https://oauth.net/2/browser-based-apps/",
      },
    ],
  },
  {
    slug: "jwt-client-auth",
    shortName: "JWT authorization grants",
    officialName:
      "JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants",
    id: "RFC 7523",
    status: "rfc",
    stability: "stable",
    date: "May 2015",
    authors: "M. Jones, B. Campbell, C. Mortimore",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    aliases: ["rfc7523"],
    problem:
      "A client needs to authenticate to an authorization server, or request a token, using a signed JWT assertion instead of a shared secret or an authorization code.",
    identityVsAuthnVsAuthz:
      "Both: private_key_jwt is client authentication; urn:ietf:params:oauth:grant-type:jwt-bearer is an authorization grant. Identity chaining and XAA reuse the grant form.",
    actors: ["Client", "Authorization server", "Assertion issuer"],
    flow: "The client posts grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer and assertion=<jwt>, or uses client_assertion_type for client auth. The AS validates the JWT and issues an access token.",
    tokensAndClaims: [
      {
        name: "assertion JWT",
        meaning: "Must be audience-restricted to the receiving AS. Short-lived.",
      },
    ],
    related: ["token-exchange", "identity-chaining", "xaa", "oauth-2-0"],
    implementerNotes:
      "draft-ietf-oauth-rfc7523bis was in the RFC Editor queue in 2026 (awaiting first editor). New implementations should watch 7523bis for clarifications, especially around nested JWT handling.",
    whyAgentCares:
      "Cross-domain 'agent already has an identity assertion, needs an access token over here' is RFC 8693 then RFC 7523. Without 7523 there is no ID-JAG redemption step.",
    urls: [
      {
        label: "RFC 7523",
        href: "https://www.rfc-editor.org/rfc/rfc7523.html",
      },
    ],
  },
];
