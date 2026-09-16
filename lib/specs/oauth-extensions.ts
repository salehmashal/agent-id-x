import type { Spec } from "@/lib/types";

export const oauthExtensionSpecs: Spec[] = [
  {
    slug: "par",
    shortName: "PAR",
    officialName: "OAuth 2.0 Pushed Authorization Requests",
    id: "RFC 9126",
    status: "rfc",
    stability: "stable",
    date: "September 2021",
    authors: "T. Lodderstedt, B. Campbell, N. Sakimura, D. Tonge, F. Skokan",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    aliases: ["rfc9126", "pushed authorization"],
    problem:
      "Authorization requests stuffed into a front-channel redirect are large, leak via logs and Referer, and can be tampered with. PAR lets the client POST the request to the AS first and redirect with a short request_uri.",
    identityVsAuthnVsAuthz:
      "Protects the integrity and confidentiality of the authorization request. Required or recommended by FAPI 2.0 and by several agent-grant profiles.",
    actors: ["Client", "Authorization server", "Resource owner user-agent"],
    flow: "Client authenticates to the AS and POSTs the authorization parameters to the PAR endpoint. AS returns request_uri (and expires_in). Client redirects the user with client_id + request_uri only.",
    tokensAndClaims: [
      {
        name: "request_uri",
        meaning: "One-time reference to the pushed request. Short-lived.",
      },
    ],
    related: ["jar", "rar", "fapi-2", "agent-grants", "oauth-2-1"],
    implementerNotes:
      "Use PAR whenever an agent would otherwise put RAR JSON, many scopes, or a rich resource list on a URL.",
    whyAgentCares:
      "Agent consent screens need more context than a scope string. PAR is how you get that context to the AS without putting a mission description in a query string.",
    urls: [
      {
        label: "RFC 9126",
        href: "https://www.rfc-editor.org/rfc/rfc9126.html",
      },
    ],
  },
  {
    slug: "rar",
    shortName: "RAR",
    officialName: "OAuth 2.0 Rich Authorization Requests",
    id: "RFC 9396",
    status: "rfc",
    stability: "stable",
    date: "May 2023",
    authors: "T. Lodderstedt, J. Richer, B. Campbell",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    aliases: ["rfc9396", "rich authorization"],
    problem:
      "OAuth scopes are flat strings. Fine-grained, structured permissions (this account, that payment, those files) do not fit. RAR adds an authorization_details JSON parameter.",
    identityVsAuthnVsAuthz:
      "Authorization granularity. Complements, does not replace, scopes.",
    actors: ["Client", "Authorization server", "Resource server"],
    flow: "The client includes authorization_details as a JSON array of typed objects in the authorization (and token) request. The AS and RS interpret the type-specific fields. Often combined with PAR because the payload is large.",
    tokensAndClaims: [
      {
        name: "authorization_details",
        meaning:
          "Array of objects with a required type field plus type-specific fields (locations, actions, datatypes, identifier, privileges, …).",
      },
    ],
    related: ["par", "aauth-r3", "fapi-2", "jwt-access-tokens"],
    implementerNotes:
      "Define a type URI you control. A 2026 WG draft (draft-ietf-oauth-rar-metadata-remediation) works on metadata and error remediation for RAR. AAuth R3 is a cousin idea using vocabularies agents already speak (OpenAPI, MCP, GraphQL).",
    whyAgentCares:
      "An agent that needs 'create a draft invoice for vendor X under $500' cannot express that in scope=invoices.write. RAR is the OAuth-native answer; AAuth R3 is the agent-native answer.",
    urls: [
      {
        label: "RFC 9396",
        href: "https://www.rfc-editor.org/rfc/rfc9396.html",
      },
    ],
  },
  {
    slug: "jar",
    shortName: "JAR",
    officialName:
      "The OAuth 2.0 Authorization Framework: JWT-Secured Authorization Request",
    id: "RFC 9101",
    status: "rfc",
    stability: "stable",
    date: "August 2021",
    authors: "N. Sakimura, J. Bradley, M. Jones",
    org: "IETF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["rfc9101", "request object"],
    problem:
      "Front-channel authorization parameters can be modified in transit. JAR wraps them in a signed (and optionally encrypted) JWT request object.",
    identityVsAuthnVsAuthz:
      "Integrity and authenticity of the authorization request. Used heavily in FAPI 1.0; FAPI 2.0 prefers PAR but still allows signed requests.",
    actors: ["Client", "Authorization server"],
    flow: "Client creates a JWT containing the authorization parameters, signed with its key. Passes it as request or by reference as request_uri.",
    tokensAndClaims: [
      {
        name: "request JWT",
        meaning: "aud must be the AS. Can be combined with PAR.",
      },
    ],
    related: ["par", "fapi-2", "jwt-client-auth"],
    implementerNotes:
      "If you already have PAR and confidential client auth, JAR is optional for many agent deployments. Keep it when you must prove the request came from a specific client key through an untrusted browser.",
    whyAgentCares:
      "Useful when a user-agent in the middle of a consent flow should not be able to widen the agent's requested permissions.",
    urls: [
      {
        label: "RFC 9101",
        href: "https://www.rfc-editor.org/rfc/rfc9101.html",
      },
    ],
  },
  {
    slug: "dpop",
    shortName: "DPoP",
    officialName: "OAuth 2.0 Demonstrating Proof of Possession (DPoP)",
    id: "RFC 9449",
    status: "rfc",
    stability: "stable",
    date: "September 2023",
    authors: "D. Fett, B. Campbell, J. Bradley, T. Lodderstedt, M. Jones, D. Waite",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc9449"],
    problem:
      "Bearer access tokens are reusable if stolen. DPoP binds an access token to a key the client holds, using a signed proof JWT on each request, without requiring mTLS.",
    identityVsAuthnVsAuthz:
      "Sender-constrained authentication of the API call. The token still carries authorization.",
    actors: ["Client", "Authorization server", "Resource server"],
    flow: "Client generates a DPoP key pair. At the token endpoint (and later at the RS) it sends a DPoP proof JWT covering htm, htu, iat, jti, and the public JWK. The AS puts the JWK thumbprint in the access token cnf.jkt. The RS requires a fresh proof signed by that key.",
    tokensAndClaims: [
      { name: "DPoP proof JWT", meaning: "Per-request, short-lived, includes htm/htu." },
      { name: "cnf.jkt", meaning: "JWK thumbprint binding in the access token." },
    ],
    related: ["mtls", "oauth-security-bcp", "http-message-signatures", "agent-grants"],
    implementerNotes:
      "DPoP is application-layer PoP and works through TLS-terminating proxies. AAuth instead uses HTTP Message Signatures (RFC 9421) as its PoP. Do not mix proofs naively.",
    whyAgentCares:
      "If the agent must use OAuth bearer tokens, DPoP is the most deployable way to make a stolen token from a prompt injection less useful. It is not a substitute for not putting tokens in the model context.",
    urls: [
      {
        label: "RFC 9449",
        href: "https://www.rfc-editor.org/rfc/rfc9449.html",
      },
    ],
  },
  {
    slug: "mtls",
    shortName: "mTLS sender-constrained tokens",
    officialName:
      "OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens",
    id: "RFC 8705",
    status: "rfc",
    stability: "stable",
    date: "February 2020",
    authors: "B. Campbell, J. Bradley, N. Sakimura, T. Lodderstedt",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc8705"],
    problem:
      "Bind client authentication and access tokens to a client certificate used in mutual TLS, so stolen tokens cannot be replayed from another TLS stack.",
    identityVsAuthnVsAuthz:
      "Authentication of the client (and of the token presenter). Certificate subject is not the user.",
    actors: ["Client", "Authorization server", "Resource server"],
    flow: "Client presents a certificate during TLS to the AS. AS issues an access token with cnf.x5t#S256. RS requires the same certificate on the API call.",
    tokensAndClaims: [
      {
        name: "cnf.x5t#S256",
        meaning: "Certificate thumbprint confirmation claim.",
      },
    ],
    related: ["dpop", "spiffe", "wimse-creds", "fapi-2"],
    implementerNotes:
      "Excellent inside a mesh or when SPIFFE X.509-SVIDs are already the client cert. Painful for browsers and many serverless agent hosts. FAPI 2.0 allows mTLS or DPoP for sender constraint.",
    whyAgentCares:
      "Workload-style agents (SPIFFE/WIMSE) often already have a client cert. Binding the OAuth token to that cert is how you stop a stolen JWT from being replayed outside the workload.",
    urls: [
      {
        label: "RFC 8705",
        href: "https://www.rfc-editor.org/rfc/rfc8705.html",
      },
    ],
  },
  {
    slug: "token-exchange",
    shortName: "Token Exchange",
    officialName: "OAuth 2.0 Token Exchange",
    id: "RFC 8693",
    status: "rfc",
    stability: "stable",
    date: "January 2020",
    authors: "M. Jones, A. Nadalin, B. Campbell (ed.), J. Bradley, C. Mortimore",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    featured: true,
    aliases: ["rfc8693", "on-behalf-of", "obo"],
    problem:
      "A service that already has a token needs a different token: new audience, narrower scope, or an actor acting on behalf of a subject. Token Exchange is the standard grant for that conversion.",
    identityVsAuthnVsAuthz:
      "Authorization (and identity preservation) across hops. The act claim records who is acting; subject_token names who they act for.",
    actors: [
      "Client / actor (the agent or service calling exchange)",
      "Authorization server",
      "Subject (user or upstream service)",
      "Downstream resource",
    ],
    flow: "POST to the token endpoint with grant_type=urn:ietf:params:oauth:grant-type:token-exchange, a subject_token, optional actor_token, requested audience/resource/scope, and requested_token_type. AS issues a new token, often a JWT with nested act.",
    tokensAndClaims: [
      {
        name: "subject_token / actor_token",
        meaning: "Input tokens. Types are URNs (access token, JWT, ID token, SAML, …).",
      },
      {
        name: "act",
        meaning:
          "Nested actor identity. Agent A delegated to B delegated to C becomes nested act objects.",
      },
      {
        name: "may_act",
        meaning: "Who is allowed to act for this subject in a future exchange.",
      },
    ],
    related: [
      "jwt-access-tokens",
      "identity-chaining",
      "xaa",
      "transaction-tokens",
      "agent-grants",
    ],
    implementerNotes:
      "RFC 8693 does not by itself define cross-domain trust. Identity chaining (almost an RFC in 2026) profiles 8693 + 7523 for that. Attenuate scope at every hop; never expand.",
    whyAgentCares:
      "This, plus RFC 9068 JWT access tokens, is the backbone of 'the agent acts for the user at an API'. Multi-agent call chains that stay in OAuth-land are token exchanges with act, not new protocols.",
    urls: [
      {
        label: "RFC 8693",
        href: "https://www.rfc-editor.org/rfc/rfc8693.html",
      },
    ],
  },
  {
    slug: "jwt-access-tokens",
    shortName: "JWT access tokens",
    officialName: "JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens",
    id: "RFC 9068",
    status: "rfc",
    stability: "stable",
    date: "October 2021",
    authors: "V. Bertocci",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    featured: true,
    aliases: ["rfc9068"],
    problem:
      "RFC 6749 access tokens are opaque. Resource servers need a standard JWT layout so they can validate tokens locally: issuer, expiry, client, subject, audience, scopes.",
    identityVsAuthnVsAuthz:
      "Authorization credential format that can also carry a subject identifier. Not an ID Token: typ is at+jwt, not the OIDC ID Token typ.",
    actors: ["Authorization server", "Resource server", "Client"],
    flow: "AS issues a signed JWT access token. RS validates signature via AS JWKS, checks exp, aud (the RS), client_id, and scope. Optional authorization_details from RAR can appear.",
    tokensAndClaims: [
      { name: "typ: at+jwt", meaning: "Distinguishes access tokens from ID Tokens." },
      { name: "aud", meaning: "The resource server. Mandatory in this profile." },
      { name: "client_id", meaning: "The OAuth client that received the token." },
      { name: "sub", meaning: "Resource owner, or the client itself for client-credentials." },
    ],
    related: ["token-exchange", "resource-indicators", "rar", "oidc-core"],
    implementerNotes:
      "Always set and check aud. An agent presenting a token minted for a different MCP server must be rejected (MCP makes this a MUST via RFC 8707).",
    whyAgentCares:
      "When an agent calls an API, the RS should see both who the user is (sub) and which agent/client is calling (client_id), plus optional act. Opaque tokens hide that from the RS unless it introspects.",
    urls: [
      {
        label: "RFC 9068",
        href: "https://www.rfc-editor.org/rfc/rfc9068.html",
      },
    ],
  },
  {
    slug: "dcr",
    shortName: "Dynamic Client Registration",
    officialName: "OAuth 2.0 Dynamic Client Registration Protocol",
    id: "RFC 7591",
    status: "rfc",
    stability: "stable",
    date: "July 2015",
    authors: "J. Richer, M. Jones, J. Bradley, M. Machulak, P. Hunt",
    org: "IETF",
    layer: "identity",
    relevance: "foundation",
    aliases: ["rfc7591", "dynamic registration"],
    problem:
      "Clients that did not exist at AS-configuration time (mobile apps, and now agents and MCP clients) need a way to obtain a client_id without a human filling out a developer portal.",
    identityVsAuthnVsAuthz:
      "Client identity provisioning. It issues a client_id; it is not user identity.",
    actors: ["Software client", "Authorization server"],
    flow: "POST a metadata document to the registration endpoint. AS returns client_id, optional client_secret, and registered metadata. Optional RFC 7592 for management.",
    tokensAndClaims: [
      {
        name: "client_id / client_secret",
        meaning:
          "Newly issued credentials. Secrets in agent hosts are a liability; CIMD or public-key methods are preferable.",
      },
    ],
    related: ["cimd", "as-metadata", "mcp-auth", "aauth"],
    implementerNotes:
      "MCP 2026-07-28 deprecates DCR as the preferred mechanism in favor of Client ID Metadata Documents, keeping DCR as a MAY for old servers. Open registration without software statements is an abuse magnet.",
    whyAgentCares:
      "An agent that discovers a new MCP server at runtime historically called DCR. That is why the ecosystem is moving to URL-as-client_id (CIMD) and why AAuth skips client registration entirely in favor of a published agent key.",
    urls: [
      {
        label: "RFC 7591",
        href: "https://www.rfc-editor.org/rfc/rfc7591.html",
      },
    ],
  },
  {
    slug: "as-metadata",
    shortName: "AS metadata",
    officialName: "OAuth 2.0 Authorization Server Metadata",
    id: "RFC 8414",
    status: "rfc",
    stability: "stable",
    date: "June 2018",
    authors: "M. Jones, N. Sakimura, J. Bradley",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    aliases: ["rfc8414", "discovery"],
    problem:
      "Clients need a machine-readable map of the authorization server: issuer, endpoints, supported grants, PKCE methods, JWKS.",
    identityVsAuthnVsAuthz:
      "Discovery. Enables both OIDC-style identity and OAuth authorization without hardcoded URLs.",
    actors: ["Client", "Authorization server"],
    flow: "GET {issuer}/.well-known/oauth-authorization-server (or OIDC /.well-known/openid-configuration). Validate that the document's issuer matches.",
    tokensAndClaims: [
      {
        name: "issuer",
        meaning: "Must match the identifier used to fetch metadata. Mix-up defense.",
      },
    ],
    related: ["prm", "oidc-discovery", "mcp-auth", "cimd"],
    implementerNotes:
      "MCP clients MUST try both RFC 8414 and OIDC discovery path variants. Reject documents whose issuer does not match the fetched URL.",
    whyAgentCares:
      "Agents discover tools at runtime. Hardcoded token endpoints will not survive first contact with a new MCP server or a multi-tenant AS.",
    urls: [
      {
        label: "RFC 8414",
        href: "https://www.rfc-editor.org/rfc/rfc8414.html",
      },
    ],
  },
  {
    slug: "prm",
    shortName: "Protected Resource Metadata",
    officialName: "OAuth 2.0 Protected Resource Metadata",
    id: "RFC 9728",
    status: "rfc",
    stability: "stable",
    date: "April 2025",
    authors: "M. Jones, A. Parecki, F. Skokan",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    featured: true,
    aliases: ["rfc9728", "resource metadata"],
    problem:
      "A client that knows only the API URL does not know which authorization server protects it, which scopes exist, or whether DPoP/mTLS is required. RFC 8414 documented the AS; this documents the resource.",
    identityVsAuthnVsAuthz:
      "Discovery for the resource server. The missing half of 'agent finds a tool and learns how to auth'.",
    actors: ["Client", "Resource server", "Authorization server"],
    flow: "RS publishes JSON at /.well-known/oauth-protected-resource (with path insertion rules). A 401 WWW-Authenticate: Bearer resource_metadata=\"…\" can point at it. Document includes resource, authorization_servers, scopes_supported, bearer methods, jwks_uri, DPoP/mTLS hints.",
    tokensAndClaims: [
      {
        name: "resource",
        meaning: "Canonical identifier of the RS. Used as RFC 8707 resource parameter.",
      },
      {
        name: "authorization_servers",
        meaning: "AS issuer URLs. Client then fetches RFC 8414 metadata.",
      },
    ],
    related: ["as-metadata", "resource-indicators", "mcp-auth", "aauth"],
    implementerNotes:
      "MCP servers MUST implement RFC 9728. Validate TLS certificates for the resource identifier to prevent impersonation. Do not request every advertised scope.",
    whyAgentCares:
      "This is how an agent goes from 'I have a URL' to 'I know which AS to use and which audience to request' without a human pasting client IDs.",
    urls: [
      {
        label: "RFC 9728",
        href: "https://www.rfc-editor.org/rfc/rfc9728.html",
      },
    ],
  },
  {
    slug: "resource-indicators",
    shortName: "Resource Indicators",
    officialName: "Resource Indicators for OAuth 2.0",
    id: "RFC 8707",
    status: "rfc",
    stability: "stable",
    date: "February 2020",
    authors: "B. Campbell, J. Bradley, H. Tschofenig",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    aliases: ["rfc8707"],
    problem:
      "Access tokens that work at every API in a deployment get replayed at the wrong API. The resource parameter lets the client name the intended RS at authorization and token time so the AS can audience-restrict the token.",
    identityVsAuthnVsAuthz:
      "Authorization audience control. Complements RFC 9068 aud.",
    actors: ["Client", "Authorization server", "Resource server"],
    flow: "Client includes one or more resource parameters (absolute URIs) on authorization and token requests. AS issues a token valid only for those resources.",
    tokensAndClaims: [
      {
        name: "resource",
        meaning: "Canonical URI of the target RS. MCP requires the MCP server URI.",
      },
    ],
    related: ["jwt-access-tokens", "prm", "mcp-auth", "oauth-security-bcp"],
    implementerNotes:
      "MCP 2026-07-28 makes resource a MUST on both authorization and token requests, even if the AS ignores it. The RS MUST still reject tokens not issued for itself.",
    whyAgentCares:
      "Without audience restriction, a token an agent obtained for a calendar MCP server might be accepted by a payments MCP server. That is a confused-deputy class bug.",
    urls: [
      {
        label: "RFC 8707",
        href: "https://www.rfc-editor.org/rfc/rfc8707.html",
      },
    ],
  },
  {
    slug: "step-up",
    shortName: "Step-up authentication",
    officialName: "OAuth 2.0 Step Up Authentication Challenge Protocol",
    id: "RFC 9470",
    status: "rfc",
    stability: "stable",
    date: "September 2023",
    authors: "V. Bertocci, B. Campbell",
    org: "IETF",
    layer: "authn",
    relevance: "adjacent",
    aliases: ["rfc9470"],
    problem:
      "A resource may accept a token for some calls and require a stronger or more recent user authentication for others (high-value tool calls). The RS needs a standard way to say 'come back with a better acr / fresher auth_time'.",
    identityVsAuthnVsAuthz:
      "Authentication strength and recency, triggered from an authorization decision at the RS.",
    actors: ["Resource server", "Client", "Authorization server", "User"],
    flow: "RS returns 401 with insufficient_user_authentication and acr_values / max_age in WWW-Authenticate. Client starts a new authorization request with those parameters (OIDC acr_values / max_age). New token carries acr and auth_time.",
    tokensAndClaims: [
      { name: "acr", meaning: "Authentication context class achieved." },
      { name: "auth_time", meaning: "When the user last authenticated." },
    ],
    related: ["oidc-core", "ciba", "fapi-2", "mcp-auth"],
    implementerNotes:
      "MCP 2026-07-28 adds extra step-up rules (scope union / hierarchy). Pair with CIBA when the user is not in a browser in front of the agent.",
    whyAgentCares:
      "An agent with a long-lived delegated token should not be able to perform a wire transfer just because it could read email. Step-up is the OAuth way to force a human back into the loop for sensitive tools.",
    urls: [
      {
        label: "RFC 9470",
        href: "https://www.rfc-editor.org/rfc/rfc9470.html",
      },
    ],
  },
  {
    slug: "iss-param",
    shortName: "AS issuer identification",
    officialName: "OAuth 2.0 Authorization Server Issuer Identification",
    id: "RFC 9207",
    status: "rfc",
    stability: "stable",
    date: "March 2022",
    authors: "K. Meyer zu Selhausen, D. Fett",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc9207", "mix-up"],
    problem:
      "In mix-up attacks the client is tricked into sending an authorization response from AS A to a flow it started with AS B. Returning the issuer in the authorization response lets the client detect that.",
    identityVsAuthnVsAuthz:
      "Authenticates which AS produced the authorization response.",
    actors: ["Authorization server", "Client"],
    flow: "AS includes iss in the authorization response (including errors). Client compares it with the AS it intended, using simple string comparison.",
    tokensAndClaims: [
      {
        name: "iss (authorization response)",
        meaning: "AS issuer URL. Not the same field as a JWT iss, but the same identifier.",
      },
    ],
    related: ["oauth-security-bcp", "as-metadata", "mcp-auth"],
    implementerNotes:
      "MCP 2026-07-28 requires iss validation. Always set expected issuer from metadata, not from the response.",
    whyAgentCares:
      "Agents that talk to many authorization servers (SaaS tools, multiple MCP servers) are mix-up-prone. This is a small check that prevents a large class of token theft.",
    urls: [
      {
        label: "RFC 9207",
        href: "https://www.rfc-editor.org/rfc/rfc9207.html",
      },
    ],
  },
  {
    slug: "cimd",
    shortName: "Client ID Metadata Documents",
    officialName: "OAuth Client ID Metadata Document",
    id: "draft-ietf-oauth-client-id-metadata-document-02",
    status: "wg-draft",
    stability: "draft",
    date: "6 July 2026",
    authors: "A. Parecki, E. Smith",
    org: "IETF",
    layer: "identity",
    relevance: "foundation",
    aliases: ["cimd", "client_id url"],
    problem:
      "Dynamic Client Registration does not scale well for open-world clients (MCP clients, decentralized apps). Let the client_id be an HTTPS URL that the AS fetches for metadata.",
    identityVsAuthnVsAuthz:
      "Client identity without a registration handshake. The URL is the identifier; the JSON is the metadata.",
    actors: ["Client", "Authorization server"],
    flow: "Client uses its metadata URL as client_id. AS fetches the JSON, checks that client_id inside matches the URL, and uses redirect_uris, jwks, name, etc. from the document. Shared secrets as client auth are prohibited; public-key methods such as private_key_jwt are allowed.",
    tokensAndClaims: [
      {
        name: "client_id (URL)",
        meaning: "Must equal the fetched document URL by simple string comparison.",
      },
    ],
    related: ["dcr", "mcp-auth", "as-metadata", "aauth"],
    implementerNotes:
      "WG document, not an RFC. MCP 2026-07-28 prefers CIMD over DCR (the MCP spec still cites draft-00; the WG draft in July 2026 was -02). AS must consider SSRF when fetching client URLs.",
    whyAgentCares:
      "This is the OAuth WG's answer to 'my agent did not pre-register'. AAuth goes further and drops the AS-issued client_id altogether; CIMD is the evolutionary step inside OAuth.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/",
      },
      {
        label: "HTML of draft-02",
        href: "https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-02.html",
      },
    ],
  },
  {
    slug: "identity-chaining",
    shortName: "Identity chaining",
    officialName: "OAuth Identity and Authorization Chaining Across Domains",
    id: "draft-ietf-oauth-identity-chaining-17",
    status: "wg-draft",
    stability: "draft",
    date: "19 July 2026",
    authors:
      "A. Schwenkschuster, P. Kasselman, K. Burgin, M. Jenkins, B. Campbell, A. Parecki",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    featured: true,
    aliases: ["identity chaining", "cross-domain token exchange"],
    problem:
      "A request that starts in trust domain A needs to call a resource in trust domain B, carrying who the user is and what was granted, without flattening everything into a single AS.",
    identityVsAuthnVsAuthz:
      "Preserves identity (subject) and authorization context across domain boundaries. Combines RFC 8693 and RFC 7523.",
    actors: [
      "Client in domain A",
      "AS A",
      "AS B",
      "Resource server in domain B",
    ],
    flow: "Client in A performs token exchange at AS A to obtain a JWT authorization grant audience-restricted to AS B. Client presents that JWT to AS B using the RFC 7523 JWT bearer grant. AS B issues an access token for its resource. Repeat at every domain hop.",
    tokensAndClaims: [
      {
        name: "JWT authorization grant",
        meaning: "Output of the first exchange; input assertion to the second AS.",
      },
    ],
    related: ["token-exchange", "jwt-client-auth", "xaa", "transaction-tokens"],
    implementerNotes:
      "As of 19 July 2026 this document was in the RFC Editor queue (awaiting first editor) targeting Proposed Standard. Still cite it as an I-D until an RFC number is assigned. Do not invent a private cross-domain token format if you can wait for this.",
    whyAgentCares:
      "Enterprise agents that read mail in tenant A and file tickets in SaaS B are exactly this pattern. XAA is a profile of this draft for IdP-brokered app-to-app access.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/",
      },
      {
        label: "HTML of draft-17",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-identity-chaining-17",
      },
    ],
  },
  {
    slug: "xaa",
    shortName: "Cross-App Access (ID-JAG)",
    officialName: "Identity Assertion JWT Authorization Grant",
    id: "draft-ietf-oauth-identity-assertion-authz-grant-04",
    status: "wg-draft",
    stability: "draft",
    date: "21 May 2026",
    authors: "See draft (Parecki et al.; informally called XAA)",
    org: "IETF",
    layer: "authz",
    relevance: "agent-specific",
    featured: true,
    aliases: ["xaa", "id-jag", "cross-app access"],
    problem:
      "An enterprise app or AI agent already has an SSO session with the company IdP and needs to call another app's API on the user's behalf without a second OAuth consent circus at every SaaS.",
    identityVsAuthnVsAuthz:
      "Authorization brokered by the identity provider the resource already trusts for SSO. Extends the IdP from authentication into cross-domain API access.",
    actors: [
      "Requesting app / agent",
      "Enterprise IdP (AS)",
      "Resource app AS",
      "User (policy subject, often not interactively prompted)",
    ],
    flow: "Requesting app exchanges an ID Token (or refresh token) at the IdP via RFC 8693 for an Identity Assertion JWT Authorization Grant (ID-JAG) whose audience is the resource app's AS. It redeems the ID-JAG at that AS via RFC 7523 for an access token. IdP policy decides whether this cross-app connection is allowed.",
    tokensAndClaims: [
      {
        name: "ID-JAG",
        meaning:
          "JWT grant signed by the IdP, about the user, aud = resource AS — not aud = the requesting client (unlike an ID Token).",
      },
    ],
    related: ["identity-chaining", "token-exchange", "oidc-core", "mcp-auth", "ciba"],
    implementerNotes:
      "WG document. Vendors (Okta, Auth0) already document XAA for agents and MCP enterprise-managed authorization. This does not replace CIBA: use CIBA when a specific action needs a human on a phone, XAA when IT policy already authorized the connection.",
    whyAgentCares:
      "This is the emerging 'enterprise agent may call SaaS APIs as the employee' path that scales past per-tool OAuth popups. Still a draft; pin versions and test interoperability.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/",
      },
      {
        label: "HTML of draft-04",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-identity-assertion-authz-grant-04",
      },
    ],
  },
  {
    slug: "transaction-tokens",
    shortName: "Transaction Tokens",
    officialName: "Transaction Tokens",
    id: "draft-ietf-oauth-transaction-tokens-11",
    status: "wg-draft",
    stability: "draft",
    date: "30 July 2026",
    authors: "A. Tulshibagwale, G. Fletcher, P. Kasselman",
    org: "IETF",
    layer: "mixed",
    relevance: "foundation",
    aliases: ["txn-tokens", "txn-token"],
    problem:
      "Inside a trust domain, a user or external request fans out across many workloads. Each hop needs immutable user identity, workload identity, and authorization context that does not silently widen.",
    identityVsAuthnVsAuthz:
      "Carries identity and authorization context through a call chain. Complements WIMSE workload authn. Not a user-facing grant.",
    actors: [
      "External caller",
      "Transaction Token Service (TTS)",
      "Workloads in the trust domain",
    ],
    flow: "An entry workload authenticates, then requests a Txn-Token from the TTS using token exchange parameters (purpose, request_details, request_context). Downstream workloads receive the short-lived signed JWT and may replace it but must not mutate tctx immutables.",
    tokensAndClaims: [
      { name: "purp", meaning: "Purpose of the transaction." },
      { name: "tctx", meaning: "Immutable transaction context across the chain." },
      { name: "rctx", meaning: "Replaceable context that may change hop to hop." },
    ],
    related: ["token-exchange", "wimse-arch", "aims", "a2a"],
    implementerNotes:
      "WG Last Call / waiting for write-up as of late July 2026; OAuth WG milestone to submit to IESG in December 2026. Individual draft draft-araut-oauth-transaction-tokens-for-agents profiles this for agents. draft-liu-oauth-a2a-profile discusses Txn-Tokens on A2A call chains.",
    whyAgentCares:
      "An agent that orchestrates internal tools should pass a transaction token so every microservice sees the original user and the original purpose, not just the agent's workload identity.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/",
      },
    ],
  },
  {
    slug: "http-message-signatures",
    shortName: "HTTP Message Signatures",
    officialName: "HTTP Message Signatures",
    id: "RFC 9421",
    status: "rfc",
    stability: "stable",
    date: "February 2024",
    authors: "A. Backman, J. Richer, M. Sporny",
    org: "IETF",
    layer: "authn",
    relevance: "foundation",
    aliases: ["rfc9421", "httpsig"],
    problem:
      "HTTP requests and responses need application-level integrity and authentication that survives some intermediaries, without reinventing ad-hoc HMAC headers.",
    identityVsAuthnVsAuthz:
      "Authentication and integrity of the HTTP message. Authorization is left to the application (AAuth tokens, OAuth, etc.).",
    actors: ["Signer (agent, client, or server)", "Verifier"],
    flow: "Signer covers chosen components (@method, @authority, @path, headers, content-digest, …) in Signature-Input and produces Signature. Verifier reconstitutes the covered content and checks the signature against a known key.",
    tokensAndClaims: [
      {
        name: "Signature-Input / Signature",
        meaning: "The two headers that carry the signature base and the signature.",
      },
    ],
    related: ["http-signature-keys", "aauth", "wimse-wpt", "dpop"],
    implementerNotes:
      "AAuth profiles RFC 9421 rather than inventing a new signature scheme. WIMSE also has an HTTP signature method alongside WPT. Require coverage of method, authority, path, and the key-identifying header.",
    whyAgentCares:
      "This is the cryptographic primitive that lets an agent prove 'this request came from my key' without a bearer secret in the Authorization header.",
    urls: [
      {
        label: "RFC 9421",
        href: "https://www.rfc-editor.org/rfc/rfc9421.html",
      },
    ],
  },
  {
    slug: "spiffe-client-auth",
    shortName: "OAuth SPIFFE client auth",
    officialName: "OAuth SPIFFE Client Authentication",
    id: "draft-ietf-oauth-spiffe-client-auth-02",
    status: "wg-draft",
    stability: "draft",
    date: "15 June 2026",
    org: "IETF",
    layer: "authn",
    relevance: "adjacent",
    aliases: ["spiffe oauth"],
    problem:
      "Workloads already have SPIFFE identities. They should be able to authenticate to an OAuth authorization server as clients without a long-lived client_secret.",
    identityVsAuthnVsAuthz:
      "Client authentication using workload identity. Connects SPIFFE/WIMSE to OAuth token issuance.",
    actors: ["SPIFFE workload (agent)", "Authorization server"],
    flow: "The client presents a SPIFFE credential (JWT-SVID or X.509-SVID) as OAuth client authentication when hitting the token endpoint. The AS maps the SPIFFE ID to a client registration or policy.",
    tokensAndClaims: [
      {
        name: "SPIFFE ID",
        meaning: "URI such as spiffe://trust-domain/path used as the client identity.",
      },
    ],
    related: ["spiffe", "wimse-arch", "mtls", "oauth-2-1"],
    implementerNotes:
      "WG document. Pair with RFC 8705 if using X.509-SVIDs as the mTLS certificate.",
    whyAgentCares:
      "If your agent already runs under SPIRE, this is how it becomes an OAuth client without stuffing a secret into Kubernetes.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-spiffe-client-auth/",
      },
    ],
  },
];
