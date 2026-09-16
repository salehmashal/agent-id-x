import type { SpecDeepDive } from "@/lib/types";

export const oauthExtensionDeepDives: Record<string, SpecDeepDive> = {
  par: {
    agentGap: [
      "Authorization requests stuffed into a front-channel redirect leak via logs and Referer and can be tampered with. Agent consent needs more context than a scope string — RAR JSON, resource lists, mission-like descriptions. PAR lets the client POST that payload to the AS and redirect with a short request_uri.",
      "FAPI 2.0 requires PAR. Several agent-grant profiles recommend it. If your agent would otherwise put authorization_details on a URL, you are in PAR territory.",
    ],
    trustBoundaries: [
      "The PAR endpoint is a back-channel client-to-AS call: client authentication applies. The user-agent only sees request_uri and client_id. The RS is not involved. An attacker who steals request_uri still needs the user session at the AS; request_uri is one-time and short-lived.",
    ],
    mechanics: [
      "POST application/x-www-form-urlencoded (or JWT) to the PAR endpoint with the authorization parameters. AS returns request_uri and expires_in. Authorization redirect: client_id + request_uri only. RFC 9126, September 2021.",
    ],
    claims: [
      {
        name: "request_uri",
        meaning:
          "Quoted RFC 9126: one-time reference to the pushed request. Short-lived.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "par",
        title: "Push then redirect",
        steps: [
          "Client authenticates to the PAR endpoint and POSTs scope, resource, PKCE challenge, authorization_details, redirect_uri, …",
          "AS stores the request, returns request_uri.",
          "Client redirects the user with client_id and request_uri.",
          "AS looks up the request; user authenticates and consents; code issued as usual.",
        ],
      },
    ],
    layerDetail: [
      "Protects integrity and confidentiality of the authorization request. Not user identity. Authorization detail may ride inside (RAR).",
    ],
    composition: [
      { specSlug: "rar", how: "PAR is how you transport large authorization_details safely." },
      { specSlug: "jar", how: "JAR signs the request; PAR hides it from the front channel. Combinable. FAPI 2.0 prefers PAR." },
      { specSlug: "fapi-2", how: "PAR is mandatory; unauthenticated pushed requests are rejected." },
      { specSlug: "oauth-2-1", how: "Compatible extension; not folded into 2.1 core." },
      { specSlug: "agent-grants", how: "The OAuth agent-grants profile uses PAR + PKCE + resource indicators." },
    ],
    pitfalls: [
      {
        title: "Front-channel fallback",
        body: "If the AS allows the same parameters on /authorize without PAR, attackers will use that path. FAPI forbids it.",
      },
      {
        title: "request_uri theft is still a session",
        body: "Treat request_uri as a capability: one-time, short exp, bound to the client.",
      },
    ],
    stabilityDetail: [
      "RFC 9126, September 2021. Stable. Ship it. https://www.rfc-editor.org/rfc/rfc9126.html",
    ],
  },
  rar: {
    agentGap: [
      "An agent that needs 'create a draft invoice for vendor X under $500' cannot say that with scope=invoices.write. RFC 9396 adds authorization_details: a JSON array of typed objects (locations, actions, datatypes, identifier, privileges, …).",
      "AAuth R3 is the cousin that uses vocabularies agents already speak. Inside vanilla OAuth (including MCP if the AS supports it), RAR is the structured-scope tool.",
    ],
    trustBoundaries: [
      "The AS must understand the type URIs. The RS must enforce the same types. A client that invents fields the RS ignores has a false sense of constraint. Users must be shown a rendering they can actually decide on — otherwise RAR is theatre.",
    ],
    mechanics: [
      "authorization_details on authorize and token requests (and in JWT access tokens). Each object has a required type plus type-specific fields. Combine with PAR because the payload is large. A 2026 WG draft (draft-ietf-oauth-rar-metadata-remediation) works on metadata and error remediation.",
    ],
    claims: [
      {
        name: "authorization_details",
        meaning:
          "Quoted RFC 9396: array of objects with required type plus type-specific fields.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "rar",
        title: "Structured grant",
        steps: [
          "Client builds authorization_details (your type URI, actions, locations, limits).",
          "Pushes via PAR, user consents to the rendered request.",
          "Access token carries the granted details (RFC 9068 may include them).",
          "RS authorizes the specific call against those details, not just a scope string.",
        ],
      },
    ],
    layerDetail: [
      "Authorization granularity. Complements scopes. Does not identify the user or the agent instance.",
    ],
    composition: [
      { specSlug: "par", how: "Usual transport." },
      { specSlug: "jwt-access-tokens", how: "RS can read authorization_details without introspection." },
      { specSlug: "aauth-r3", how: "Agent-native analogue on AAuth, not wire-compatible." },
      { specSlug: "fapi-2", how: "Often combined in high-value APIs." },
    ],
    pitfalls: [
      {
        title: "AS understands, RS does not",
        body: "Granting structured details the RS ignores collapses back to a coarse token.",
      },
      {
        title: "Unregistered types",
        body: "Define a type URI you control. Do not reuse someone else's type with different fields.",
      },
    ],
    stabilityDetail: [
      "RFC 9396, May 2023. Stable. https://www.rfc-editor.org/rfc/rfc9396.html",
    ],
  },
  jar: {
    agentGap: [
      "Front-channel authorization parameters can be modified in transit. JAR wraps them in a signed (optionally encrypted) JWT request object. Useful when a user-agent in the middle of a consent flow should not be able to widen the agent's requested permissions.",
      "FAPI 1.0 used JAR heavily. FAPI 2.0 prefers PAR but still allows signed requests. If you already have PAR and confidential client auth, JAR is optional for many agent deployments.",
    ],
    trustBoundaries: [
      "The client's signing key authenticates the request contents. aud must be the AS. The browser still carries the request or request_uri; encryption (JWE) hides contents from the user-agent.",
    ],
    mechanics: [
      "RFC 9101: JWT containing authorization parameters, signed with the client key, passed as request or by reference as request_uri. Can combine with PAR (push a JAR).",
    ],
    claims: [
      {
        name: "request JWT",
        meaning: "Quoted: aud must be the AS. Integrity of the authorization request.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "jar",
        title: "Signed authorization request",
        steps: [
          "Client builds a JWT with the authorize parameters, aud=AS, signed with its key.",
          "Passes request=JWT or request_uri to a hosted object (or PAR).",
          "AS verifies signature and uses the JWT claims as the request, ignoring unsigned duplicates that would widen it.",
        ],
      },
    ],
    layerDetail: [
      "Integrity and authenticity of the authorization request. Not user identity.",
    ],
    composition: [
      { specSlug: "par", how: "PAR hides; JAR signs. Together they cover leakage and tampering." },
      { specSlug: "fapi-2", how: "PAR is the FAPI 2 requirement; JAR is not the headline control." },
      { specSlug: "jwt-client-auth", how: "Same client keys often used for private_key_jwt and JAR." },
    ],
    pitfalls: [
      {
        title: "Unsigned duplicates",
        body: "The AS must not let query parameters override signed values to a broader grant.",
      },
    ],
    stabilityDetail: [
      "RFC 9101, August 2021. Stable. https://www.rfc-editor.org/rfc/rfc9101.html",
    ],
  },
  dpop: {
    agentGap: [
      "Bearer access tokens are reusable if stolen from an agent prompt or log. DPoP (RFC 9449, September 2023) binds an access token to a client key using a signed proof JWT on each request, without requiring mTLS — the most deployable sender-constraint for agents that are not in a mesh.",
      "It is not a substitute for keeping tokens out of model context. A stolen token plus a stolen key is still game over. It does stop 'I found a token in a gist' replay from a different machine.",
    ],
    trustBoundaries: [
      "The client's DPoP key is the sender. The AS puts the JWK thumbprint in the access token cnf.jkt. The RS requires a fresh proof signed by that key covering htm and htu. TLS-terminating proxies do not break DPoP the way they break mTLS passthrough.",
    ],
    mechanics: [
      "Client generates a DPoP key pair. Token endpoint (and later RS) receive a DPoP header: a JWT with typ dpop+jwt, jwk in the header, claims htm, htu, iat, jti, and when presenting an access token, ath (hash of the token). AS issues token_type=DPoP with cnf.jkt. RS checks proof freshness, uniqueness of jti (replay cache), and binding.",
      "Nonce mechanism lets the RS/AS demand a fresh proof. Authorization codes can be bound to the DPoP key (FAPI 2.0 requires this when using DPoP).",
    ],
    claims: [
      {
        name: "DPoP proof JWT (htm, htu, iat, jti, ath)",
        meaning:
          "Quoted RFC 9449: per-request, short-lived, method and URI binding. ath when sending an access token.",
        source: "quoted",
      },
      {
        name: "cnf.jkt",
        meaning: "Quoted: JWK thumbprint binding in the access token.",
        source: "quoted",
      },
      {
        name: "Authorization: DPoP / DPoP: <jwt>",
        meaning:
          "Quoted presentation: token_type DPoP, proof in the DPoP header — not Bearer.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "dpop",
        title: "Bind then prove",
        steps: [
          "Client creates a DPoP key (often ephemeral per session).",
          "Token request includes a DPoP proof. AS returns an access token with cnf.jkt.",
          "Each RS call: new proof covering this method and URI, plus the access token, Authorization scheme DPoP.",
          "RS verifies token signature/introspection, jkt matches the proof key, proof signature, htm/htu, iat window, jti not replayed.",
        ],
      },
    ],
    layerDetail: [
      "Sender-constrained authentication of the API call. The token still carries authorization. DPoP does not identify the user; OIDC still does that at the AS.",
    ],
    composition: [
      { specSlug: "mtls", how: "Alternative sender-constraint. FAPI 2.0 allows either. mTLS is stronger at the transport; DPoP survives TLS termination." },
      { specSlug: "oauth-security-bcp", how: "9700's recommended app-layer PoP." },
      { specSlug: "http-message-signatures", how: "AAuth's PoP. Do not mix proofs naively on one request." },
      { specSlug: "wimse-wpt", how: "WPT is the WIMSE analogue (Authorization: WPT + WIT header)." },
      { specSlug: "mcp-auth", how: "MCP still specifies Bearer; adding DPoP is an AS/RS profile, not required by MCP 2026-07-28." },
    ],
    pitfalls: [
      {
        title: "Proof replay",
        body: "Without a jti cache and tight iat, a captured proof+token pair replays at the same URI. Use nonce where possible.",
      },
      {
        title: "htu mismatches",
        body: "Proxies that rewrite URLs break htu. Normalize carefully; do not skip the check.",
      },
      {
        title: "Key in the agent filesystem",
        body: "If the DPoP private key sits next to the token in the same dump, you have not gained much. Isolate keys.",
      },
    ],
    stabilityDetail: [
      "RFC 9449, September 2023. Stable. Ship it for any agent that must use OAuth tokens outside a mesh. https://www.rfc-editor.org/rfc/rfc9449.html",
    ],
  },
  mtls: {
    agentGap: [
      "RFC 8705 binds client authentication and access tokens to a client certificate used in mutual TLS, so stolen tokens cannot be replayed from another TLS stack. Workload-style agents that already have SPIFFE X.509-SVIDs should use this rather than inventing a JWT-only story.",
      "Painful for browsers and many serverless agent hosts — that is why DPoP exists. FAPI 2.0 allows mTLS or DPoP.",
    ],
    trustBoundaries: [
      "The TLS terminator that sees the client cert must be the RS (or a trusted ingress that forwards the cert in a header you actually trust). A CDN that strips mTLS makes cnf.x5t#S256 theatre. The certificate subject is not the user.",
    ],
    mechanics: [
      "Client presents a certificate during TLS to the AS. AS issues an access token with cnf.x5t#S256 (SHA-256 thumbprint of the cert). RS requires the same certificate on the API call. Also defines mTLS client authentication (PKI or self-signed) at the token endpoint, with metadata use_mtls_endpoint_aliases.",
    ],
    claims: [
      {
        name: "cnf.x5t#S256",
        meaning: "Quoted RFC 8705: certificate thumbprint confirmation claim.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "mtls-bound",
        title: "Certificate-bound access token",
        steps: [
          "Client opens TLS to the AS token endpoint with its cert (SPIFFE SVID or otherwise).",
          "AS authenticates the client and issues an access token bound to the cert thumbprint.",
          "Client calls the RS on mTLS with the same cert and Authorization: Bearer (the token is still a bearer header, but useless without the cert).",
          "RS checks TLS cert thumbprint equals cnf.",
        ],
      },
    ],
    layerDetail: [
      "Authentication of the client and of the token presenter. Authorization remains the token. User identity remains OIDC/sub.",
    ],
    composition: [
      { specSlug: "spiffe", how: "X.509-SVID is the cert. Pair with SPIFFE OAuth client auth." },
      { specSlug: "dpop", how: "App-layer alternative when you cannot pass client certs." },
      { specSlug: "fapi-2", how: "One of two allowed sender-constraint methods." },
      { specSlug: "wimse-creds", how: "WIC is an X.509 workload credential; mTLS is the transport-layer presentation WIMSE expects for certificates." },
    ],
    pitfalls: [
      {
        title: "Terminated TLS",
        body: "If ingress terminates TLS and the app never sees the client cert, binding is fiction unless you have a trusted header from that ingress.",
      },
      {
        title: "User vs cert",
        body: "Do not stuff Alice into the certificate DN. Keep user in the token; keep workload in the cert.",
      },
    ],
    stabilityDetail: [
      "RFC 8705, February 2020. Stable. https://www.rfc-editor.org/rfc/rfc8705.html",
    ],
  },
  "token-exchange": {
    agentGap: [
      "A service that already has a token needs a different token: new audience, narrower scope, or an actor acting on behalf of a subject. RFC 8693 is the standard grant. Multi-agent call chains that stay in OAuth-land are token exchanges with act, not new protocols.",
      "This, plus RFC 9068 JWT access tokens, is the backbone of 'the agent acts for the user at an API'. RFC 8693 does not by itself define cross-domain trust — identity chaining profiles 8693 + 7523 for that.",
    ],
    trustBoundaries: [
      "The AS that performs the exchange must trust the subject_token and optional actor_token issuers. Downstream RSes trust the new token's issuer. Each hop should attenuate, never expand. The actor is a distinct principal; hiding it is how you lose audit and how confused deputies spawn.",
    ],
    mechanics: [
      "POST grant_type=urn:ietf:params:oauth:grant-type:token-exchange with subject_token, subject_token_type, optional actor_token / actor_token_type, requested audience/resource/scope, requested_token_type. Token types are URNs (access token, JWT, ID token, SAML, …). Output often a JWT with nested act. may_act on an input token constrains who may act later.",
    ],
    claims: [
      {
        name: "subject_token / actor_token",
        meaning:
          "Quoted RFC 8693 inputs. Types are URNs. The subject is who they act for; the actor is who is calling.",
        source: "quoted",
      },
      {
        name: "act",
        meaning:
          "Quoted §4.1: nested actor identity. Agent A delegated to B delegated to C becomes nested act objects.",
        source: "quoted",
      },
      {
        name: "may_act",
        meaning:
          "Quoted: who is allowed to act for this subject in a future exchange. Enforce it.",
        source: "quoted",
      },
      {
        name: "urn:ietf:params:oauth:grant-type:token-exchange",
        meaning: "Quoted grant_type.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "obo",
        title: "On-behalf-of attenuation",
        steps: [
          "User delegates to Agent A (authorization code). A holds a token with sub=user, client_id=A.",
          "A calls token exchange: subject_token=user token, actor_token=A's identity if distinct, resource=downstream API, narrower scope.",
          "AS issues a JWT with sub=user, act=A, aud=downstream, reduced scope.",
          "A (or Service B) presents that token. Downstream must see both sub and act.",
        ],
        notes:
          "Never expand scope. If crossing domains, do not send this access token to AS B — mint a JWT grant (identity chaining) instead.",
      },
    ],
    layerDetail: [
      "Authorization (and identity preservation) across hops. act records who is acting; subject_token names who they act for. Client authentication of the exchanger is still required.",
    ],
    composition: [
      { specSlug: "jwt-access-tokens", how: "Structured output so the RS sees sub, client_id, act, aud." },
      { specSlug: "identity-chaining", how: "Profiles this grant plus 7523 for AS A → AS B." },
      { specSlug: "xaa", how: "Exchanges an ID Token for an ID-JAG via 8693, then redeems via 7523." },
      { specSlug: "transaction-tokens", how: "Txn-Tokens are often requested using token-exchange-shaped parameters at a TTS inside one domain." },
      { specSlug: "aauth", how: "AAuth may nest RFC 8693 act on auth tokens for sub-agents; that is not this grant." },
    ],
    pitfalls: [
      {
        title: "Overbroad act",
        body: "If hop 2 still has the full user scope, the sub-agent is the user. Attenuate every hop. Log the chain.",
      },
      {
        title: "Using an ID Token as subject_token carelessly",
        body: "XAA does this on purpose with IdP policy. Randomly stuffing ID Tokens into 8693 at an API AS is the 'send ID Token to the API' bug in a trench coat.",
      },
      {
        title: "Cross-domain without chaining",
        body: "A token minted by AS A is not valid at AS B. Identity chaining exists because people tried anyway.",
      },
    ],
    stabilityDetail: [
      "RFC 8693, January 2020, M. Jones, A. Nadalin, B. Campbell (ed.), J. Bradley, C. Mortimore. Stable. Ship it. https://www.rfc-editor.org/rfc/rfc8693.html",
    ],
  },
  "jwt-access-tokens": {
    agentGap: [
      "RFC 6749 access tokens are opaque. Resource servers need a standard JWT layout so they can validate locally: issuer, expiry, client, subject, audience, scopes. When an agent calls an API, the RS should see both who the user is (sub) and which agent/client is calling (client_id), plus optional act.",
      "This is not an ID Token. typ is at+jwt. Sending an ID Token because 'it is a JWT with a sub' is the classic mix-up.",
    ],
    trustBoundaries: [
      "The RS trusts the AS JWKS. aud must be this RS. client_id names the OAuth client, not a portable agent. Opaque tokens hide all of this unless the RS introspects — which agents that fan out to many APIs make expensive and easy to skip.",
    ],
    mechanics: [
      "RFC 9068: signed JWT, typ at+jwt, required iss, exp, aud, client_id, sub, iat; scope or authorization_details as granted. RS validates signature, exp, aud (the RS), client_id, and scope. Optional cnf for DPoP/mTLS.",
    ],
    claims: [
      {
        name: "typ: at+jwt",
        meaning: "Quoted: distinguishes access tokens from ID Tokens.",
        source: "quoted",
      },
      {
        name: "aud",
        meaning: "Quoted: the resource server. Mandatory in this profile.",
        source: "quoted",
      },
      {
        name: "client_id",
        meaning: "Quoted: the OAuth client that received the token.",
        source: "quoted",
      },
      {
        name: "sub",
        meaning:
          "Quoted: resource owner, or the client itself for client-credentials.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "rs-validate",
        title: "RS local validation",
        steps: [
          "AS issues at+jwt with aud=canonical RS URI (RFC 8707 resource).",
          "Agent presents Bearer or DPoP.",
          "RS checks typ, sig, exp, aud==itself, then scope/authorization_details, then optional cnf proof.",
          "Reject tokens minted for a different MCP server or API even if the signature is valid.",
        ],
      },
    ],
    layerDetail: [
      "Authorization credential format that can also carry a subject identifier. Authentication of the presenter is Bearer or PoP. Identity of the user is sub, not a substitute for an ID Token at the client.",
    ],
    composition: [
      { specSlug: "resource-indicators", how: "How aud gets set to the right RS." },
      { specSlug: "token-exchange", how: "Output of OBO hops should remain at+jwt with nested act." },
      { specSlug: "oidc-core", how: "Different typ, different aud. Never interchangeable." },
      { specSlug: "mcp-auth", how: "MCP RS MUST audience-validate; 9068 is how you do that without introspection." },
    ],
    pitfalls: [
      {
        title: "Missing aud",
        body: "If your AS emits JWTs without aud, you do not have 9068. MCP will fail closed — or worse, a sloppy RS will accept anything from that issuer.",
      },
      {
        title: "ID Token confusion",
        body: "Check typ. Check aud is the API, not the client_id.",
      },
    ],
    stabilityDetail: [
      "RFC 9068, October 2021, V. Bertocci. Stable. https://www.rfc-editor.org/rfc/rfc9068.html",
    ],
  },
  dcr: {
    agentGap: [
      "Clients that did not exist at AS-configuration time need a client_id without a human filling out a developer portal. RFC 7591 is how mobile apps and, later, MCP clients minted one at runtime. Open registration without software statements is an abuse magnet — spam clients, secret leakage, no lifecycle.",
      "MCP 2026-07-28 deprecates DCR as the preferred mechanism in favor of CIMD, keeping DCR as a MAY for old servers. AAuth skips client registration entirely in favor of a published agent key.",
    ],
    trustBoundaries: [
      "The registration endpoint is a provisioning plane. An open endpoint lets anyone become a client. Software statements (signed metadata) and initial access tokens are how you close it. client_secret in an agent host is a liability.",
    ],
    mechanics: [
      "POST a metadata document to the registration endpoint. AS returns client_id, optional client_secret, and registered metadata. RFC 7592 (management) is optional. MCP requires that credentials obtained via DCR are bound to that AS issuer and not reused if PRM points at a new AS.",
    ],
    claims: [
      {
        name: "client_id / client_secret",
        meaning:
          "Quoted outputs. Secrets in agent hosts are a liability; CIMD or public-key methods are preferable.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "dcr",
        title: "Register then authorize",
        steps: [
          "Client discovers registration_endpoint from RFC 8414 metadata.",
          "POSTs redirect_uris, client_name, token_endpoint_auth_method, jwks, …",
          "Stores client_id (and secret if any) keyed by AS issuer.",
          "Proceeds with authorization code + PKCE.",
        ],
      },
    ],
    layerDetail: [
      "Client identity provisioning. Issues a client_id; not user identity. Not authorization of APIs.",
    ],
    composition: [
      { specSlug: "cimd", how: "Evolutionary replacement for open-world clients: URL as client_id, no handshake." },
      { specSlug: "mcp-auth", how: "DCR MAY, deprecated. CIMD SHOULD." },
      { specSlug: "aauth", how: "AAuth's answer to the same pain is to stop issuing AS-local client_ids." },
      { specSlug: "as-metadata", how: "Discovers the registration endpoint." },
    ],
    pitfalls: [
      {
        title: "Open registration abuse",
        body: "Botnets will register. Require software statements or CIMD instead.",
      },
      {
        title: "Secret reuse across ASes",
        body: "MCP explicitly forbids reusing DCR credentials when the AS changes. Mix-up adjacent.",
      },
    ],
    stabilityDetail: [
      "RFC 7591, July 2015. Stable RFC, politically deprecated for MCP-like open-world clients in favor of CIMD. https://www.rfc-editor.org/rfc/rfc7591.html",
    ],
  },
  "as-metadata": {
    agentGap: [
      "Clients need a machine-readable map of the authorization server: issuer, endpoints, supported grants, PKCE methods, JWKS. Agents discover tools at runtime; hardcoded token endpoints will not survive first contact with a new MCP server or a multi-tenant AS.",
    ],
    trustBoundaries: [
      "The issuer identifier in the document MUST match the identifier used to fetch it. A document that lies about issuer is an attack (mix-up). Fetch over HTTPS; do not follow to a different host blindly.",
    ],
    mechanics: [
      "RFC 8414: GET {issuer}/.well-known/oauth-authorization-server (OIDC uses /.well-known/openid-configuration). Path insertion rules exist when the issuer has a path. MCP clients MUST try both RFC 8414 and OIDC discovery path variants.",
    ],
    claims: [
      {
        name: "issuer",
        meaning:
          "Quoted: must match the identifier used to fetch metadata. Mix-up defense.",
        source: "quoted",
      },
      {
        name: "authorization_endpoint / token_endpoint / jwks_uri",
        meaning: "Quoted core fields. Also grant_types_supported, code_challenge_methods_supported, …",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "discover-as",
        title: "Discover an AS",
        steps: [
          "Start from an issuer URL (from PRM authorization_servers, or from user input).",
          "GET well-known metadata (8414 and/or OIDC).",
          "Reject if issuer does not match. Cache with TTL.",
          "Use endpoints and capability flags (PKCE S256, PAR, DPoP, CIMD) from the document.",
        ],
      },
    ],
    layerDetail: [
      "Discovery. Enables both OIDC-style identity and OAuth authorization without hardcoded URLs.",
    ],
    composition: [
      { specSlug: "prm", how: "PRM lists authorization_servers; then you fetch 8414." },
      { specSlug: "oidc-discovery", how: "Parallel document at openid-configuration. MCP requires supporting both." },
      { specSlug: "mcp-auth", how: "Clients MUST support both discovery mechanisms." },
      { specSlug: "cimd", how: "AS advertises CIMD support in metadata." },
    ],
    pitfalls: [
      {
        title: "Issuer mismatch",
        body: "Always compare exactly. Trailing slashes matter.",
      },
      {
        title: "User-supplied issuer",
        body: "SSRF and mix-up. Allow-list when you can; always use HTTPS.",
      },
    ],
    stabilityDetail: [
      "RFC 8414, June 2018. Stable. https://www.rfc-editor.org/rfc/rfc8414.html",
    ],
  },
  prm: {
    agentGap: [
      "A client that knows only the API URL does not know which AS protects it, which scopes exist, or whether DPoP/mTLS is required. RFC 8414 documented the AS; RFC 9728 (April 2025) documents the resource. This is how an agent goes from 'I have a URL' to 'I know which AS to use and which audience to request'.",
      "MCP servers MUST implement RFC 9728. A 401 WWW-Authenticate: Bearer resource_metadata=\"…\" is the usual bootstrap.",
    ],
    trustBoundaries: [
      "Validate TLS for the resource identifier to prevent impersonation. The document's resource field is the canonical URI used as RFC 8707 resource. authorization_servers are AS issuer URLs — then fetch 8414 and check those issuers. Do not request every advertised scope.",
    ],
    mechanics: [
      "JSON at /.well-known/oauth-protected-resource with path insertion rules. Fields include resource, authorization_servers, scopes_supported, bearer_methods_supported, jwks_uri, DPoP/mTLS hints, resource_documentation. WWW-Authenticate can point at the document.",
    ],
    claims: [
      {
        name: "resource",
        meaning:
          "Quoted: canonical identifier of the RS. Used as RFC 8707 resource parameter.",
        source: "quoted",
      },
      {
        name: "authorization_servers",
        meaning: "Quoted: AS issuer URLs. Client then fetches RFC 8414 metadata.",
        source: "quoted",
      },
      {
        name: "WWW-Authenticate resource_metadata",
        meaning:
          "Quoted challenge parameter used by MCP and others to bootstrap discovery from a 401.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "prm-bootstrap",
        title: "401 → metadata → AS → token",
        steps: [
          "Client calls the API, gets 401 with resource_metadata URL.",
          "Fetches PRM. Records resource and authorization_servers.",
          "Fetches AS metadata (8414 and/or OIDC). Verifies issuer.",
          "Performs OAuth 2.1 with resource=canonical URI. Presents the token only to this RS.",
        ],
      },
    ],
    layerDetail: [
      "Discovery for the resource server. The missing half of 'agent finds a tool and learns how to auth'. Not itself an identity or grant protocol.",
    ],
    composition: [
      { specSlug: "as-metadata", how: "Next hop after reading authorization_servers." },
      { specSlug: "resource-indicators", how: "resource field becomes the resource parameter." },
      { specSlug: "mcp-auth", how: "MUST for MCP servers and clients (HTTP)." },
      { specSlug: "aauth", how: "AAuth has its own aauth-resource.json well-known. Different document, similar job." },
    ],
    pitfalls: [
      {
        title: "Wrong resource identifier",
        body: "If PRM resource does not match the URL you call, you will mint a token the RS must reject — or a sloppy RS will accept a confused-deputy token.",
      },
      {
        title: "Scope greed",
        body: "scopes_supported is a menu, not a shopping list. Request least privilege.",
      },
    ],
    stabilityDetail: [
      "RFC 9728, April 2025, M. Jones, A. Parecki, F. Skokan. Stable and new enough that older MCP guides omit it. https://www.rfc-editor.org/rfc/rfc9728.html",
    ],
  },
  "resource-indicators": {
    agentGap: [
      "Access tokens that work at every API get replayed at the wrong API. RFC 8707's resource parameter lets the client name the intended RS at authorization and token time so the AS can audience-restrict the token.",
      "Without this, a token an agent obtained for a calendar MCP server might be accepted by a payments MCP server. That is a confused-deputy class bug. MCP 2026-07-28 makes resource a MUST on both authorization and token requests, even if the AS ignores it. The RS MUST still reject tokens not issued for itself.",
    ],
    trustBoundaries: [
      "The client asserts where it wants to go. The AS decides whether that is allowed and mints aud accordingly. The RS is the last gate: it must not honor a token for someone else.",
    ],
    mechanics: [
      "One or more resource parameters (absolute URIs) on authorization and token requests. AS issues a token valid only for those resources. MCP requires the canonical MCP server URI.",
    ],
    claims: [
      {
        name: "resource",
        meaning:
          "Quoted RFC 8707: canonical URI of the target RS. Repeatable. MCP requires it even if the AS currently ignores it.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "aud-restrict",
        title: "Request a token for one RS",
        steps: [
          "From PRM, take the resource identifier.",
          "Include resource=that URI on authorize and token requests.",
          "AS puts it in RFC 9068 aud (or equivalent).",
          "RS compares aud to itself; mismatch → 401.",
        ],
      },
    ],
    layerDetail: [
      "Authorization audience control. Complements RFC 9068 aud. Not identity.",
    ],
    composition: [
      { specSlug: "jwt-access-tokens", how: "Where aud is carried." },
      { specSlug: "prm", how: "Where the canonical resource URI is published." },
      { specSlug: "mcp-auth", how: "MUST on both requests." },
      { specSlug: "oauth-security-bcp", how: "Audience restriction when multiple resources exist." },
    ],
    pitfalls: [
      {
        title: "AS ignores resource",
        body: "You still send it (MCP MUST). The RS must still audience-check. An AS that mints globally valid tokens is not MCP-safe.",
      },
      {
        title: "Multiple resources in one token",
        body: "8707 allows several. Narrower is better for agents. Prefer one RS per token.",
      },
    ],
    stabilityDetail: [
      "RFC 8707, February 2020. Stable. https://www.rfc-editor.org/rfc/rfc8707.html",
    ],
  },
  "step-up": {
    agentGap: [
      "An agent with a long-lived delegated token should not perform a wire transfer just because it could read email. RFC 9470 lets the RS say 'come back with a stronger or more recent user authentication' via acr_values / max_age on a 401 challenge.",
      "MCP 2026-07-28 adds extra step-up rules (scope union / hierarchy). Pair with CIBA when the user is not in a browser in front of the agent.",
    ],
    trustBoundaries: [
      "The RS decides that this call needs a better authentication context. The AS performs that authentication. The client is a messenger. The user is on whatever device the AS reaches.",
    ],
    mechanics: [
      "RS returns 401 with insufficient_user_authentication and acr_values / max_age in WWW-Authenticate. Client starts a new authorization request with those OIDC parameters. New token carries acr and auth_time. The RS compares.",
    ],
    claims: [
      {
        name: "acr / auth_time",
        meaning:
          "Quoted: authentication context class achieved, and when the user last authenticated.",
        source: "quoted",
      },
      {
        name: "error=insufficient_user_authentication",
        meaning: "Quoted RFC 9470 challenge error code.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "step-up",
        title: "Sensitive tool forces fresh auth",
        steps: [
          "Agent calls a high-value tool with an existing access token.",
          "RS 401s with insufficient_user_authentication, acr_values, optional max_age.",
          "Agent starts authorize/CIBA with those parameters.",
          "User re-authenticates. New token has acr/auth_time. Agent retries.",
        ],
      },
    ],
    layerDetail: [
      "Authentication strength and recency, triggered from an authorization decision at the RS. The new token is still an authorization credential.",
    ],
    composition: [
      { specSlug: "oidc-core", how: "acr_values and max_age / auth_time are OIDC." },
      { specSlug: "ciba", how: "HITL when the user is not in a browser." },
      { specSlug: "fapi-2", how: "High-value APIs that already constrain tokens still use step-up for extra-sensitive calls." },
      { specSlug: "mcp-auth", how: "Extra scope-union/hierarchy rules in the 2026-07-28 MCP spec." },
    ],
    pitfalls: [
      {
        title: "Step-up without binding the action",
        body: "If the new token is still a broad Bearer, you only proved the user is awake, not that they approved this transfer. Combine with RAR, R3, or CIBA binding_message.",
      },
    ],
    stabilityDetail: [
      "RFC 9470, September 2023. Stable. https://www.rfc-editor.org/rfc/rfc9470.html",
    ],
  },
  "iss-param": {
    agentGap: [
      "In mix-up attacks the client is tricked into sending an authorization response from AS A to a flow it started with AS B. Agents that talk to many authorization servers (SaaS tools, multiple MCP servers) are mix-up-prone. RFC 9207 returns iss in the authorization response so the client can detect that.",
      "MCP 2026-07-28 requires iss validation. Always set expected issuer from metadata, not from the response.",
    ],
    trustBoundaries: [
      "The client compares iss to the AS it intended (from its own state + metadata). Simple string comparison. The response is otherwise unauthenticated until this check (and PKCE) succeed.",
    ],
    mechanics: [
      "AS includes iss in the authorization response (including errors). Client compares with the intended issuer. RFC 9207, March 2022.",
    ],
    claims: [
      {
        name: "iss (authorization response)",
        meaning:
          "Quoted RFC 9207: AS issuer URL. Not the same field as a JWT iss, but the same identifier.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "mix-up",
        title: "Detect mix-up",
        steps: [
          "Client starts a flow at AS B, storing expected issuer from B's metadata.",
          "Attacker causes the user-agent to deliver AS A's response to the client.",
          "Client sees iss=A ≠ expected B and aborts. No token request is made.",
        ],
      },
    ],
    layerDetail: [
      "Authenticates which AS produced the authorization response. Small check, large class of token theft.",
    ],
    composition: [
      { specSlug: "oauth-security-bcp", how: "9700's mix-up mitigation." },
      { specSlug: "as-metadata", how: "Source of the expected issuer." },
      { specSlug: "mcp-auth", how: "MUST validate iss." },
      { specSlug: "fapi-2", how: "AS shall return iss per 9207." },
    ],
    pitfalls: [
      {
        title: "Trusting iss to choose the AS",
        body: "iss is a detector, not a discovery mechanism. Expected issuer comes from your state.",
      },
    ],
    stabilityDetail: [
      "RFC 9207, March 2022, K. Meyer zu Selhausen, D. Fett. Stable. https://www.rfc-editor.org/rfc/rfc9207.html",
    ],
  },
  cimd: {
    agentGap: [
      "DCR does not scale well for open-world clients (MCP clients, decentralized apps). CIMD lets the client_id be an HTTPS URL that the AS fetches for metadata. This is the OAuth WG's answer to 'my agent did not pre-register'. AAuth goes further and drops the AS-issued client_id; CIMD is the evolutionary step inside OAuth.",
      "MCP 2026-07-28 prefers CIMD over DCR but still cites draft-00; the WG draft fetched 15 September 2026 remains draft-02 (expires 7 January 2027). Implement -02, not the MCP citation.",
    ],
    trustBoundaries: [
      "The AS fetches a URL the client named. That is SSRF. HTTPS only, no userinfo, must contain a path, no fragment, simple string comparison (https://example.com/client and https://example.com:443/client are not equal). Document client_id MUST match the fetched URL. Shared secrets as client auth are prohibited; public-key methods such as private_key_jwt are allowed.",
      "Localhost and ephemeral URLs are a poor fit — the draft says this works best for clients with a stable public web presence. Dev-loop agents may still need DCR or pre-registration (see the draft's §7 / §8.10 guidance).",
    ],
    mechanics: [
      "Client uses its metadata URL as client_id. AS fetches JSON (200, JSON content type), checks client_id inside matches, uses redirect_uris, jwks, client_name, token_endpoint_auth_method, etc. AS advertises support in RFC 8414 metadata. MCP clients SHOULD check for that capability and MAY fall back to DCR.",
    ],
    claims: [
      {
        name: "client_id (HTTPS URL)",
        meaning:
          "Quoted: MUST equal the fetched document URL by simple string comparison. MUST have a path; SHOULD NOT be /.",
        source: "quoted",
      },
      {
        name: "token_endpoint_auth_method",
        meaning:
          "Quoted direction: shared secrets prohibited; private_key_jwt etc. allowed. Other specs MAY require private_key_jwt.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "cimd",
        title: "URL as client_id",
        steps: [
          "Publisher hosts https://agent.example/oauth-client.json with matching client_id, redirect_uris, jwks.",
          "Agent starts authorize with client_id=that URL and PKCE.",
          "AS fetches the document, validates match and TLS, caches per policy.",
          "User sees the name/icon from the document. Token request uses private_key_jwt (or other public-key method).",
        ],
      },
    ],
    layerDetail: [
      "Client identity without a registration handshake. The URL is the identifier; the JSON is the metadata. User identity remains OIDC. API authorization remains the access token.",
    ],
    composition: [
      { specSlug: "dcr", how: "CIMD avoids the registration POST. MCP: CIMD SHOULD, DCR MAY deprecated." },
      { specSlug: "mcp-auth", how: "Preferred registration mechanism; spec citation lags at draft-00." },
      { specSlug: "as-metadata", how: "Advertises CIMD support." },
      { specSlug: "aauth", how: "AAuth's portable agent identifier is a different answer to the same open-world problem." },
      { specSlug: "jwt-client-auth", how: "private_key_jwt is the natural client auth." },
    ],
    pitfalls: [
      {
        title: "SSRF",
        body: "The AS is now an HTTP client of arbitrary URLs. Allow-lists, scheme checks, no link-local, size limits, cache carefully.",
      },
      {
        title: "URL change = new client",
        body: "Simple string comparison. Rotating the path is a new identity; users re-consent.",
      },
      {
        title: "MCP citation lag",
        body: "Implement draft-02 (or current datatracker), not the -00 cited in MCP 2026-07-28.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-client-id-metadata-document-02, expires 7 January 2027 (implies ~6 July 2026 publication), OAuth WG, not an RFC. Authors: A. Parecki, E. Smith. https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/. You can ship behind AS support; pin the draft.",
    ],
  },
  "identity-chaining": {
    agentGap: [
      "A request that starts in trust domain A needs to call a resource in trust domain B, carrying who the user is and what was granted, without flattening everything into a single AS. Enterprise agents that read mail in tenant A and file tickets in SaaS B are exactly this pattern.",
      "This draft combines RFC 8693 and RFC 7523. XAA is a profile of it for IdP-brokered app-to-app access. Still an I-D in the RFC Editor queue as of 19 July 2026 (rev 17) — cite the draft until an RFC number exists.",
    ],
    trustBoundaries: [
      "AS A must be willing to mint a JWT authorization grant whose audience is AS B. AS B must trust AS A's signatures as a grant issuer (not as an access-token issuer). The client in A never presents A's access token to B's RS. Repeat at every domain hop; attenuate every time.",
    ],
    mechanics: [
      "Client in A performs token exchange at AS A to obtain a JWT authorization grant audience-restricted to AS B. Client presents that JWT to AS B using the RFC 7523 JWT bearer grant. AS B issues an access token for its resource. draft-ietf-oauth-identity-chaining-17, 19 July 2026, intended Proposed Standard, RFC Editor state In Progress / awaiting first editor on the WG list.",
    ],
    claims: [
      {
        name: "JWT authorization grant (aud = AS B)",
        meaning:
          "Quoted pattern: output of the first exchange; input assertion to the second AS. Not an access token for B's API.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "chain",
        title: "Two-domain hop",
        steps: [
          "User delegates to the client at AS A. Client holds an access token for A's APIs.",
          "Client token-exchanges at AS A: requested token type = JWT grant, audience = AS B issuer.",
          "Client POSTs jwt-bearer assertion to AS B's token endpoint, plus resource=B's API.",
          "AS B validates the grant (trust in A, aud=B, exp, policy) and issues an at+jwt for its RS.",
          "Client calls B's RS with that access token, never with A's token.",
        ],
      },
    ],
    layerDetail: [
      "Preserves identity (subject) and authorization context across domain boundaries. Client authentication happens at each AS. User authentication already happened in domain A (OIDC).",
    ],
    composition: [
      { specSlug: "token-exchange", how: "First hop." },
      { specSlug: "jwt-client-auth", how: "Second hop (7523)." },
      { specSlug: "xaa", how: "IdP-shaped profile of this pattern; ID-JAG is the grant." },
      { specSlug: "transaction-tokens", how: "Inside one domain, Txn-Tokens carry purpose; chaining is for crossing AS trust domains." },
      { specSlug: "aauth", how: "Four-party AAuth is a different federation (PS to resource AS), not this draft." },
    ],
    pitfalls: [
      {
        title: "Presenting A's access token at B",
        body: "The whole point is not to do that. Audience and issuer checks at B's RS will (must) fail.",
      },
      {
        title: "No RFC number yet",
        body: "IESG: RFC Editor queue. Do not invent a private cross-domain format if you can wait; do not claim it is already an RFC.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-identity-chaining-17, 19 July 2026, expires 20 January 2027, OAuth WG, Proposed Standard target, RFC Editor In Progress. https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/. Implement with pinned revision; expect an RFC number, not wire churn, if the queue completes cleanly.",
    ],
  },
  xaa: {
    agentGap: [
      "An enterprise app or AI agent already has an SSO session with the company IdP and needs to call another app's API on the user's behalf without a second OAuth consent circus at every SaaS. draft-ietf-oauth-identity-assertion-authz-grant-04 (21 May 2026) provides that mechanism and is informally called Cross-App Access (XAA).",
      "This does not replace CIBA: use CIBA when a specific action needs a human on a phone; XAA when IT policy already authorized the connection. Still a WG draft; vendors (Okta, Auth0) already document XAA for agents and MCP enterprise-managed authorization.",
    ],
    trustBoundaries: [
      "The enterprise IdP is the policy brain: it decides whether this requesting app may obtain a grant for that resource app. The resource app's AS already trusts the IdP for SSO; it now also trusts ID-JAGs as RFC 7523 assertions. The user is often not interactively prompted. That is a feature for IT and a hazard if policy is too broad.",
    ],
    mechanics: [
      "Requesting app exchanges an ID Token (or refresh token) at the IdP via RFC 8693 for an Identity Assertion JWT Authorization Grant (ID-JAG) whose audience is the resource app's AS — not the requesting client (unlike an ID Token). It redeems the ID-JAG at that AS via RFC 7523 for an access token. Authors: A. Parecki, K. McGuinness, B. Campbell.",
    ],
    claims: [
      {
        name: "ID-JAG",
        meaning:
          "Quoted concept: JWT grant signed by the IdP, about the user, aud = resource AS. Not aud = the requesting client.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "xaa",
        title: "IdP-brokered app-to-app",
        steps: [
          "User has an SSO session. Requesting app holds an ID Token from the enterprise IdP.",
          "App token-exchanges at the IdP: subject=ID Token, requested grant for resource AS.",
          "IdP policy allows or denies. On allow, ID-JAG issued (aud=resource AS).",
          "App redeems ID-JAG at the resource AS (jwt-bearer). Access token for the SaaS API is issued.",
          "App/agent calls the SaaS RS. No second consent screen unless policy demands it.",
        ],
      },
    ],
    layerDetail: [
      "Authorization brokered by the identity provider the resource already trusts for SSO. Extends the IdP from authentication into cross-domain API access. User identity is in the grant; the access token is authorization at the resource AS.",
    ],
    composition: [
      { specSlug: "identity-chaining", how: "XAA is a profile of that pattern with the IdP in the middle." },
      { specSlug: "token-exchange", how: "Mints the ID-JAG." },
      { specSlug: "oidc-core", how: "ID Token (or refresh) is the subject_token. Do not send the ID Token to the SaaS API." },
      { specSlug: "mcp-auth", how: "Enterprise-managed MCP authorization often maps onto XAA so employees do not OAuth-popup every tool." },
      { specSlug: "ciba", how: "Different control: per-action human approval vs IT-preapproved connections." },
    ],
    pitfalls: [
      {
        title: "Policy too wide",
        body: "If the IdP allows 'any internal agent → any SaaS', you have automated confused deputy at enterprise scale. Scope the connections.",
      },
      {
        title: "ID Token vs ID-JAG audience",
        body: "If you redeem a token whose aud is the requesting app, you are presenting an ID Token. The grant's aud must be the resource AS.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-identity-assertion-authz-grant-04, 21 May 2026, expires 22 November 2026, OAuth WG. https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/. Pin versions; test vendor interop. Not an RFC.",
    ],
  },
  "transaction-tokens": {
    agentGap: [
      "Inside a trust domain, a user or external request fans out across many workloads. Each hop needs immutable user identity, workload identity, and authorization context that does not silently widen. An agent that orchestrates internal tools should pass a transaction token so every microservice sees the original user and the original purpose, not just the agent's workload identity.",
      "Complements WIMSE (who is calling) rather than replacing it. draft-ietf-oauth-transaction-tokens-11, 30 July 2026. Individual draft-araut-oauth-transaction-tokens-for-agents profiles this for agents.",
    ],
    trustBoundaries: [
      "The Transaction Token Service (TTS) is trusted inside the domain. External callers never present a Txn-Token as their only credential. Downstream workloads may replace replaceable context (rctx) but must not mutate tctx immutables. Crossing a domain boundary is identity chaining, not a longer Txn-Token.",
    ],
    mechanics: [
      "An entry workload authenticates, then requests a Txn-Token from the TTS using token-exchange-shaped parameters (purpose, request_details, request_context). The token is a short-lived signed JWT, typically carried in a Txn-Token header — not Authorization, so Authorization stays available for WIT/WPT or DPoP. Claims include purp, tctx (immutable), rctx (replaceable). WPT can bind tth/oth to the txn token.",
    ],
    claims: [
      {
        name: "purp",
        meaning: "Quoted: purpose of the transaction.",
        source: "quoted",
      },
      {
        name: "tctx",
        meaning: "Quoted: immutable transaction context across the chain.",
        source: "quoted",
      },
      {
        name: "rctx",
        meaning: "Quoted: replaceable context that may change hop to hop.",
        source: "quoted",
      },
      {
        name: "Txn-Token header",
        meaning:
          "Quoted direction in related WIMSE/WPT text: not the Authorization header. Illustrative of how it composes with WIT/WPT.",
        source: "illustrative",
      },
    ],
    flows: [
      {
        id: "txn",
        title: "Entry workload issues a Txn-Token",
        steps: [
          "External request authenticated (OAuth user token, mTLS, …).",
          "Entry workload requests a Txn-Token from the TTS with purpose and context.",
          "Downstream calls carry Txn-Token plus workload authn (WIT+WPT or mTLS).",
          "Each hop verifies both. tctx stays immutable. Workloads may replace the token per the draft's rules but must not widen authority.",
        ],
      },
    ],
    layerDetail: [
      "Carries identity and authorization context through a call chain. Complements WIMSE workload authn. Not a user-facing grant. Not a substitute for audience-restricted OAuth at the domain edge.",
    ],
    composition: [
      { specSlug: "token-exchange", how: "Issuance often uses exchange parameters at the TTS." },
      { specSlug: "wimse-arch", how: "Workload identity + txn context is the internal pair." },
      { specSlug: "wimse-wpt", how: "WPT binds hashes of other tokens (tth) so they cannot be swapped." },
      { specSlug: "aims", how: "AIMS recommends Txn-Tokens for internal agent call chains." },
      { specSlug: "a2a", how: "draft-liu-oauth-a2a-profile discusses Txn-Tokens on A2A call chains — a usage idea, not A2A v1.0 itself." },
    ],
    pitfalls: [
      {
        title: "Mutating purpose",
        body: "If tctx can be edited, you no longer have a transaction token. Enforcement is the whole value.",
      },
      {
        title: "Using Txn-Tokens as bearer access tokens at the edge",
        body: "They are context for a trusted domain, not a grant to a stranger's API.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-transaction-tokens-11, 30 July 2026, expires 31 January 2027, OAuth WG, intended standards track. Milestone toward IESG in December 2026 on the WG list. https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/. Implement inside a domain you control; expect claim-name stability to be good but not RFC-frozen.",
    ],
  },
  "http-message-signatures": {
    agentGap: [
      "HTTP requests need application-level integrity that survives some intermediaries, without ad-hoc HMAC headers. RFC 9421 is the cryptographic primitive that lets an agent prove 'this request came from my key' without a bearer secret in Authorization.",
      "AAuth profiles this. WIMSE also has an HTTP signature method alongside WPT. DPoP is a different proof (a JWT in a header), not 9421.",
    ],
    trustBoundaries: [
      "Signer and verifier share a key-discovery story (Signature-Key, WIT, static config). Intermediaries that add unsigned headers are fine; intermediaries that change covered components break the signature. Do not cover hop-by-hop headers you cannot control.",
    ],
    mechanics: [
      "Signer covers chosen components (@method, @authority, @path, selected headers, content-digest, created, …) in Signature-Input and produces Signature. Verifier reconstitutes the signature base and checks against a known key. Require coverage of method, authority, path, and the key-identifying header (signature-key or equivalent).",
    ],
    claims: [
      {
        name: "Signature-Input / Signature",
        meaning:
          "Quoted RFC 9421 headers that carry the covered components and the signature.",
        source: "quoted",
      },
      {
        name: "@method / @authority / @path",
        meaning:
          "Quoted derived components. AAuth and any agent profile should cover these.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "sign-verify",
        title: "Sign a request",
        steps: [
          "Choose components (minimum method, authority, path, key header).",
          "Build Signature-Input with created and a nonce or keyid as required by the profile.",
          "Sign the signature base; send Signature plus key discovery (Signature-Key or WIT).",
          "Verifier rebuilds the base, fetches the key, checks alg, created window, and signature.",
        ],
      },
    ],
    layerDetail: [
      "Authentication and integrity of the HTTP message. Authorization is left to the application (AAuth tokens, OAuth, local policy).",
    ],
    composition: [
      { specSlug: "http-signature-keys", how: "Key distribution companion." },
      { specSlug: "aauth", how: "Profiles 9421 as the only API-call PoP." },
      { specSlug: "wimse-wpt", how: "Alternative application-layer PoP using a JWT in Authorization." },
      { specSlug: "dpop", how: "Different PoP; do not assume a DPoP proof satisfies a 9421 verifier." },
    ],
    pitfalls: [
      {
        title: "Under-covering",
        body: "If you do not cover the path, an attacker rewrites /read to /admin. If you do not cover signature-key, they swap identity.",
      },
      {
        title: "Clock / created",
        body: "Replay windows depend on created and verifier policy. Pair with jti-like uniqueness if the profile provides it.",
      },
    ],
    stabilityDetail: [
      "RFC 9421, February 2024, A. Backman, J. Richer, M. Sporny. Stable. https://www.rfc-editor.org/rfc/rfc9421.html",
    ],
  },
  "spiffe-client-auth": {
    agentGap: [
      "Workloads already have SPIFFE identities. They should authenticate to an OAuth AS as clients without a long-lived client_secret. If your agent already runs under SPIRE, this is how it becomes an OAuth client without stuffing a secret into Kubernetes.",
    ],
    trustBoundaries: [
      "The AS must trust the SPIFFE trust domain's keys (JWT-SVID) or the X.509-SVID (mTLS). Mapping SPIFFE ID → client policy is the AS's job. This authenticates the workload, not the user.",
    ],
    mechanics: [
      "draft-ietf-oauth-spiffe-client-auth-02, 15 June 2026: present a SPIFFE credential (JWT-SVID or X.509-SVID) as OAuth client authentication at the token endpoint. Pair X.509-SVIDs with RFC 8705. WG document.",
    ],
    claims: [
      {
        name: "SPIFFE ID",
        meaning:
          "Quoted shape: URI such as spiffe://trust-domain/path used as the client identity.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "spiffe-cc",
        title: "Workload client-credentials",
        steps: [
          "SPIRE issues an X.509-SVID or JWT-SVID to the agent workload.",
          "Agent hits the token endpoint with that credential as client auth, grant_type=client_credentials (or a user grant if also delegated).",
          "AS maps SPIFFE ID to a client/policy and issues an access token.",
        ],
      },
    ],
    layerDetail: [
      "Client authentication using workload identity. Connects SPIFFE/WIMSE to OAuth token issuance. User identity is a separate grant.",
    ],
    composition: [
      { specSlug: "spiffe", how: "Source of the credential." },
      { specSlug: "mtls", how: "How X.509-SVIDs bind tokens." },
      { specSlug: "wimse-arch", how: "Multi-system generalization of the same identifier idea." },
      { specSlug: "oauth-2-1", how: "Token endpoint client authentication slot." },
    ],
    pitfalls: [
      {
        title: "JWT-SVID as bearer client auth without extra PoP",
        body: "Prefer X.509 mTLS or a proof profile. A stolen JWT-SVID is a stolen client.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-spiffe-client-auth-02, 15 June 2026, OAuth WG. Not an RFC. https://datatracker.ietf.org/doc/draft-ietf-oauth-spiffe-client-auth/",
    ],
  },
};
