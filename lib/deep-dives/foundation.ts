import type { SpecDeepDive } from "@/lib/types";

export const foundationDeepDives: Record<string, SpecDeepDive> = {
  "oauth-2-0": {
    agentGap: [
      "RFC 6749 solves delegated access for applications: a client obtains an access token representing a resource owner's authorization, without ever seeing the owner's password. The four roles — resource owner, client, authorization server, resource server — are still the map of almost every production 'agent calls an API' design.",
      "The gap for agents is what 6749 does not give you. The client has no portable identity: client_id is issued by each AS and is meaningless elsewhere. The user is identified only if you add OpenID Connect. The agent instance, the workload binary, and the tool URL are not roles in this RFC. Implicit and resource-owner-password grants exist on the page and are unsafe; agents that cargo-cult 2012 blog posts still implement them.",
      "Treat the agent as the OAuth client, the human as the resource owner, the tool as the resource server. If you need the agent to be a principal of its own at a stranger's API, you have left 6749 and are looking at CIMD, AAuth, or WIMSE.",
    ],
    trustBoundaries: [
      "The resource owner trusts the authorization server with their login and consent. They should not trust the client with a password. The client trusts the AS to issue tokens and the RS to honor them. The RS trusts the AS's tokens (opaque introspection or JWT signature) and must not trust the client to name the user.",
      "The browser or native user-agent is an untrusted channel for the authorization code. That is why later BCPs add PKCE. Agent runtimes (model context, logs, traces) are additional untrusted channels 6749 never considered: a bearer token that lands in a prompt is stolen.",
    ],
    mechanics: [
      "Authorization endpoint (front channel) and token endpoint (back channel) are the two HTTP endpoints that matter. Grant types in 6749: authorization code, implicit, resource owner password credentials, client credentials, plus extension grants. Token endpoint POST uses application/x-www-form-urlencoded: grant_type, code, redirect_uri, client_id, client_secret (or other client auth).",
      "Successful token response: access_token, token_type (typically Bearer), expires_in, optional refresh_token, optional scope. RFC 6749 does not require the access token to be a JWT. Refresh tokens are used only at the token endpoint.",
      "Protected resource access is specified in RFC 6750, not 6749. Scope is a space-delimited string. Redirect URI matching in 6749 was too loose in practice; RFC 9700 / OAuth 2.1 require exact string match.",
    ],
    claims: [
      {
        name: "access_token",
        meaning:
          "Quoted RFC 6749 credential presented to the RS. Opaque or structured; 6749 does not require JWT.",
        source: "quoted",
      },
      {
        name: "refresh_token",
        meaning:
          "Quoted: longer-lived credential for the token endpoint only. Never send to the RS.",
        source: "quoted",
      },
      {
        name: "scope",
        meaning:
          "Quoted: space-delimited permission strings. Too coarse for many tool calls — see RAR and AAuth R3.",
        source: "quoted",
      },
      {
        name: "client_id",
        meaning:
          "Quoted: identifier of the client at this AS. Not a global agent identity.",
        source: "quoted",
      },
      {
        name: "grant_type=authorization_code | client_credentials | …",
        meaning:
          "Quoted grant_type values. Do not implement implicit or password grants for new agent work.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "authz-code",
        title: "Authorization code (the grant you should still use)",
        steps: [
          "Client redirects the resource owner to the authorization endpoint with response_type=code, client_id, redirect_uri, scope, state (and in any modern deployment, PKCE).",
          "Resource owner authenticates at the AS and consents.",
          "AS redirects to redirect_uri with code (and state).",
          "Client POSTs grant_type=authorization_code, code, client authentication, and (in 6749) redirect_uri to the token endpoint.",
          "AS returns access_token and optional refresh_token. Client calls the RS with the access token.",
        ],
        notes:
          "OAuth 2.1 removes redirect_uri from the token request because PKCE replaced its injection-defense job. Mixed 2.0/2.1 servers may still require it.",
      },
      {
        id: "client-credentials",
        title: "Client credentials (agent on its own behalf)",
        when: "No user in the hop. The client is the resource owner of its own data, or the AS has some other policy.",
        steps: [
          "Client POSTs grant_type=client_credentials with client authentication and optional scope / resource.",
          "AS issues an access token. RFC 9068 will typically set sub to the client.",
        ],
        notes:
          "This is not 'the agent acts for Alice'. For that you need a user grant plus token exchange or AAuth three-party.",
      },
    ],
    layerDetail: [
      "Authorization, not identity. 6749 does not tell you who the user is. OpenID Connect adds that. Client authentication (secret, later mTLS or private_key_jwt) is authentication of the application, not of the user.",
      "Agents that treat 'we did OAuth' as 'we know the user' are mixing layers. The RS sees a token; unless the token is a profiled JWT or the RS introspects, it may not even see a subject.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "2.1 is 6749 plus RFC 9700 minus unsafe grants. New agent work should implement the 2.1 shape even while 6749 remains the deployed RFC.",
      },
      {
        specSlug: "oidc-core",
        how: "Identity layer on this framework. scope=openid, ID Token to the client. Do not send the ID Token to APIs.",
      },
      {
        specSlug: "oauth-security-bcp",
        how: "RFC 9700 updates 6749/6750 in place. Read it before implementing 6749 from memory.",
      },
      {
        specSlug: "aauth",
        how: "Replaces pre-registration and bearer tokens for open-world HTTP clients. Complements 6749 rather than editing it.",
      },
      {
        specSlug: "mcp-auth",
        how: "MCP HTTP treats the MCP client as a 6749/2.1 client and the MCP server as an RS.",
      },
    ],
    pitfalls: [
      {
        title: "Implicit and password grants",
        body: "Still in the RFC text. RFC 9700 deprecates them; OAuth 2.1 omits them. Agent SDKs that still request response_type=token or collect passwords are out of policy.",
      },
      {
        title: "Bearer leakage in agent context",
        body: "6749 has no sender constraint. Tokens in prompts, traces, and tool logs replay until expiry. Pair with DPoP, mTLS, or AAuth signatures.",
      },
      {
        title: "Confused deputy / audience",
        body: "6749 access tokens were often globally valid at every API in a deployment. Use RFC 8707 resource and RFC 9068 aud so a calendar token cannot call payments.",
      },
      {
        title: "client_id as agent identity",
        body: "A client_id is not portable. Multi-AS agents either register everywhere (DCR/CIMD) or use AAuth/WIMSE identifiers.",
      },
    ],
    stabilityDetail: [
      "RFC 6749, October 2012, D. Hardt (ed.), Proposed Standard, universally deployed. Still the baseline. Implement it only as constrained by RFC 9700 (January 2025) and, for new clients, OAuth 2.1 draft-16. Primary: https://www.rfc-editor.org/rfc/rfc6749.html",
    ],
  },
  "oauth-bearer": {
    agentGap: [
      "Once a client has an OAuth access token, RFC 6750 says how to present it and how the RS challenges. Agents inherit this because MCP HTTP and most SaaS APIs still use Authorization: Bearer.",
      "Bearer means possession is enough. An agent runtime that copies the token into model context, debug logs, or a support dump has given away the user's API access. That is the primary agent-specific failure of 6750, not a new grant type.",
    ],
    trustBoundaries: [
      "Anyone who can read the token can call the RS as that client/user until expiry or revocation. TLS protects the token on the wire; it does not protect it inside the agent process. Resource servers that log Authorization headers extend the trust boundary to the log sink.",
    ],
    mechanics: [
      "Authorization: Bearer <token> is the method you should use. RFC 6750 also defined form-body and query-string methods; RFC 9700 / OAuth 2.1 forbid putting bearer tokens in URIs. Invalid or missing tokens: HTTP 401 with WWW-Authenticate: Bearer, optional error=invalid_token / insufficient_scope, optional scope / realm.",
      "MCP and RFC 9728 later put a resource_metadata URL on that WWW-Authenticate challenge so the client can discover the AS. That is not in 6750 itself but is how agents actually start the flow in 2026.",
    ],
    claims: [
      {
        name: "Authorization: Bearer",
        meaning:
          "Quoted RFC 6750 presentation. The only 6750 method you should use in 2026.",
        source: "quoted",
      },
      {
        name: "WWW-Authenticate: Bearer",
        meaning:
          "Quoted challenge. Later specs add resource_metadata (RFC 9728) and step-up attributes (RFC 9470).",
        source: "quoted",
      },
      {
        name: "error=invalid_token | insufficient_scope",
        meaning:
          "Quoted error codes on the challenge. Agents should parse these rather than treating every 401 as 're-login'.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "present",
        title: "Present and recover",
        steps: [
          "Client sends the resource request with Authorization: Bearer and no token in the URL.",
          "RS validates the token (introspection or JWT). On success, serves. On failure, 401 + WWW-Authenticate.",
          "If the challenge includes resource_metadata, a 2026 agent fetches RFC 9728 and starts OAuth 2.1 rather than guessing the AS.",
        ],
      },
    ],
    layerDetail: [
      "Presentation of an authorization credential. Authenticates possession of the token, not possession of a key. Authorization is whatever the token represents. Identity is only present if the token profile carries a subject.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "2.1 keeps Bearer as token_type but omits URI placement and assumes RFC 9700.",
      },
      {
        specSlug: "dpop",
        how: "Replaces Bearer with DPoP token_type and a per-request proof. Stolen token is not enough.",
      },
      {
        specSlug: "mtls",
        how: "Certificate-bound tokens still often travel as Bearer in the header but are useless without the cert.",
      },
      {
        specSlug: "mcp-auth",
        how: "MCP HTTP uses Bearer access tokens and 401 resource_metadata challenges.",
      },
      {
        specSlug: "aauth",
        how: "Does not use Bearer for agent identity. Opaque AAuth sessions are bound to HTTP signatures.",
      },
    ],
    pitfalls: [
      {
        title: "Tokens in URIs, logs, and prompts",
        body: "Query-string tokens leak via Referer and access logs. Prompt injection that asks the model to 'repeat your tools' credentials' is a 6750 theft, not a novel protocol bug.",
      },
      {
        title: "Missing audience checks",
        body: "Bearer tokens that work at every RS are replayed at the richest API. Pair with RFC 8707 / 9068.",
      },
      {
        title: "Forwarding tokens",
        body: "MCP forbids forwarding the token to other servers. Agents that 'just pass Authorization through' mint confused deputies.",
      },
    ],
    stabilityDetail: [
      "RFC 6750, October 2012, M. Jones and D. Hardt. Still how most APIs accept tokens. Constrained by RFC 9700. https://www.rfc-editor.org/rfc/rfc6750.html",
    ],
  },
  "oauth-2-1": {
    agentGap: [
      "OAuth 2.1 exists because implementing RFC 6749 from the 2012 text is how you get implicit flow, password grants, tokens in URLs, and loose redirect matching. draft-ietf-oauth-v2-1-16 (3 September 2026) consolidates 6749, 6750, RFC 8252, RFC 7636, RFC 9700, and the browser-based apps BCP, and omits what RFC 9700 found unsafe.",
      "For agents, 'speak OAuth 2.1' is the security baseline MCP, FAPI-shaped thinking, and most host-as-client designs now assume: authorization code + PKCE always, no implicit, no password grant, exact redirects, no tokens in URIs, refresh tokens for public clients sender-constrained or rotated. It still does not give the agent a portable identity.",
    ],
    trustBoundaries: [
      "Same four roles as 6749. Client types are simplified: confidential clients have credentials with the AS; public clients do not. Browser-based apps and many local agents are public (or should use a BFF). The user-agent remains untrusted. Agent hosts that hold refresh tokens are a new high-value target 2.1 addresses with rotation / sender constraint, not with a new role.",
    ],
    mechanics: [
      "Three grant types: authorization code (with PKCE; S256 only; plain prohibited), refresh token, client credentials. Implicit (response_type=token) and resource owner password credentials are omitted. Authorization code at the token endpoint no longer includes redirect_uri — PKCE replaced that defense. Mixed-mode ASes MUST still accept redirect_uri from old 2.0 clients.",
      "Redirect URIs: exact string match (RFC 3986 simple string comparison), with a localhost port exception for native apps. If multiple redirect URIs are registered, the authorization request MUST include redirect_uri; if only one is registered, it is optional.",
      "PKCE is required for the authorization code grant, including confidential clients, because code injection hits them too. Refresh tokens remain opaque to the client and are never sent to resource servers. Public-client refresh tokens must be sender-constrained or one-time-use (rotated), following RFC 9700. Sender-constrained access tokens (DPoP, mTLS) are discussed as additional authentication when presenting a token; they are not mandatory for all 2.1 deployments (FAPI 2.0 does mandate them).",
      "Draft-16 §7.2 still has 'TODO: Bring in the normative text of the browser-based apps BCP when it is finalized.' RFC 10017 published in August 2026; the 2.1 draft still cites draft-ietf-oauth-browser-based-apps-27 (6 July 2026). Implement RFC 10017 for SPAs while that TODO remains.",
    ],
    claims: [
      {
        name: "code_challenge / code_verifier (S256)",
        meaning:
          "Quoted: PKCE is the default authorization-code exchange. plain is removed.",
        source: "quoted",
      },
      {
        name: "grant_type=authorization_code | refresh_token | client_credentials",
        meaning:
          "Quoted 2.1 grant set. Extension grants (token exchange, CIBA, JWT bearer) still exist as other specs.",
        source: "quoted",
      },
      {
        name: "redirect_uri on token request",
        meaning:
          "Quoted removal in 2.1. 2.0 servers that still require it will break a pure-2.1 client — detect mixed mode.",
        source: "quoted",
      },
      {
        name: "token_type=Bearer",
        meaning:
          "Still the default presentation. URI placement omitted. DPoP uses token_type=DPoP when that RFC applies.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "code-pkce",
        title: "Authorization code + PKCE (interactive agent consent)",
        steps: [
          "Client generates a fresh code_verifier and S256 code_challenge per authorization request.",
          "Authorization request: response_type=code, client_id, scope, resource (RFC 8707, required by MCP), code_challenge, code_challenge_method=S256, exact redirect_uri if multiple are registered.",
          "Prefer PAR (RFC 9126) if the request is large or sensitive. User authenticates (OIDC) and consents.",
          "Token request: grant_type=authorization_code, code, code_verifier, client authentication if confidential. No redirect_uri on a 2.1-only AS.",
          "Store refresh tokens bound to this client; rotate or sender-constrain them if the agent is a public client. Call the RS with Authorization: Bearer (or DPoP).",
        ],
      },
      {
        id: "cc",
        title: "Client credentials (autonomous agent)",
        steps: [
          "Client authenticates to the token endpoint (secret, private_key_jwt, mTLS, or SPIFFE client auth).",
          "grant_type=client_credentials, optional scope and resource.",
          "RS sees a token about the client, not about a user. Do not pretend otherwise.",
        ],
      },
    ],
    layerDetail: [
      "Still delegated authorization, not identity. Section 1 of draft-16 is explicit: OAuth is not an authentication protocol; use OpenID Connect if you need to authenticate users. An access token presented to a proprietary 'userinfo-ish' API is not OIDC.",
      "Client authentication is how the AS knows which application is at the token endpoint. Resource-request authentication of the caller is Bearer or a sender-constraint proof.",
    ],
    composition: [
      {
        specSlug: "oauth-2-0",
        how: "2.1 replaces and obsoletes 6749/6750 as a specification; the internet still runs 2.0. Compatibility notes in draft-16 §10.",
      },
      {
        specSlug: "oauth-security-bcp",
        how: "2.1 is RFC 9700 folded into the core. If 2.1 is still a draft in your compliance matrix, implement RFC 9700 on 2.0 today.",
      },
      {
        specSlug: "pkce",
        how: "Folded in; S256 only.",
      },
      {
        specSlug: "oidc-core",
        how: "Still the identity layer. ID Token response types remain OIDC's concern.",
      },
      {
        specSlug: "mcp-auth",
        how: "MCP 2026-07-28 requires OAuth 2.1 but still cites draft-13. Implement current -16 + RFC 9700, and obey MCP MUST/SHOULD (resource parameter, PRM, CIMD).",
      },
      {
        specSlug: "aauth",
        how: "Different protocol for open-world signed clients. Use 2.1 where the RS is OAuth; evaluate AAuth where client_id portals will not scale.",
      },
      {
        specSlug: "fapi-2",
        how: "High-security profile on top: PAR mandatory, confidential clients only, sender-constrained tokens, 60-second codes. 2.1 alone is not FAPI.",
      },
    ],
    pitfalls: [
      {
        title: "Not an RFC yet",
        body: "WG Internet-Draft, milestone to submit to IESG December 2026. The OAuth WG document list still showed -15 (2 March 2026) in some views while datatracker HTML for -16 (3 September 2026) exists. Cite the revision you implemented.",
      },
      {
        title: "Mix-up across many ASes",
        body: "Agents talk to many MCP servers / SaaS ASes. Implement RFC 9207 iss and exact issuer metadata checks; 2.1 assumes you read RFC 9700.",
      },
      {
        title: "Public-client refresh tokens",
        body: "A CLI agent that stores an unbound refresh token in a homedir file is the 2.1 public-client problem. Rotate or sender-constrain, or use a confidential BFF.",
      },
      {
        title: "Browser TODO vs RFC 10017",
        body: "Do not wait for 2.1 to finish importing browser-app text. RFC 10017 is published; XSS on a chat UI steals the agent's tokens.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-oauth-v2-1-16, 3 September 2026, expires 7 March 2027, OAuth WG, intended standards track. Authors: D. Hardt, A. Parecki, T. Lodderstedt. HTML: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-16. Latest tracker: https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/. You can ship the 2.1 shape today by implementing RFC 9700 + PKCE on 2.0; you cannot yet put 'OAuth 2.1 RFC' in a contract.",
    ],
  },
  pkce: {
    agentGap: [
      "Public clients cannot keep a client secret. An attacker who intercepts the authorization code — custom URI schemes, referrer leakage, a malicious app on the device, a compromised agent helper — can redeem it. PKCE binds redemption to the process that started the request.",
      "Agents that open a browser, a loopback redirect, or a device-code-adjacent window are in this threat model even if someone labelled them 'confidential' in a portal. OAuth 2.1 and RFC 9700 require PKCE for authorization-code clients including confidential ones, because authorization-code injection is not only a native-app problem.",
    ],
    trustBoundaries: [
      "The authorization code travels through the user-agent. The code_verifier never does: it stays in the client and appears only on the token-endpoint back channel. The AS is trusted to store the challenge and compare. The RS never sees PKCE parameters.",
    ],
    mechanics: [
      "Client creates a high-entropy code_verifier. code_challenge = BASE64URL(SHA256(verifier)) with code_challenge_method=S256. Authorization request carries the challenge; token request carries the verifier. AS accepts the code only if SHA256(verifier) matches. RFC 7636 also defined plain; OAuth 2.1 prohibits it.",
      "Generate a new verifier per authorization request. Do not log verifiers. Pair with exact redirect matching and, for mix-up, RFC 9207 iss.",
    ],
    claims: [
      {
        name: "code_challenge_method=S256",
        meaning:
          "Quoted as the only method OAuth 2.1 keeps. plain is prohibited.",
        source: "quoted",
      },
      {
        name: "code_verifier",
        meaning:
          "Quoted RFC 7636: cryptographically random string, sent only to the token endpoint.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "pkce",
        title: "PKCE on authorization code",
        steps: [
          "Client generates code_verifier, derives S256 code_challenge.",
          "Authorization request includes code_challenge and code_challenge_method=S256.",
          "After redirect, token request includes code and code_verifier (plus client auth if any).",
          "AS recomputes S256 and compares. Mismatch → invalid_grant.",
        ],
      },
    ],
    layerDetail: [
      "Protects the authorization-code redemption step — client-to-AS authentication of the token request, not user identity. Authorization of the API remains the access token.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "Folded into the core grant.",
      },
      {
        specSlug: "native-apps",
        how: "RFC 8252 required PKCE for native apps; 2.1 generalized it.",
      },
      {
        specSlug: "mcp-auth",
        how: "MCP clients doing authorization code MUST use PKCE as OAuth 2.1 clients.",
      },
      {
        specSlug: "dpop",
        how: "PKCE protects the code; DPoP protects later resource requests. Both are needed if the agent is public and the token is valuable.",
      },
    ],
    pitfalls: [
      {
        title: "Reuse of verifiers",
        body: "A static challenge is not PKCE. One verifier per request.",
      },
      {
        title: "plain method",
        body: "If the AS still allows plain, an interceptor who sees the challenge sees the verifier. Refuse to use plain.",
      },
      {
        title: "PKCE is not sender-constraint of the access token",
        body: "After redemption, a stolen Bearer access token still works. Add DPoP/mTLS/signatures.",
      },
    ],
    stabilityDetail: [
      "RFC 7636, September 2015, N. Sakimura, J. Bradley, N. Agarwal. Stable. Required by RFC 9700 and OAuth 2.1. https://www.rfc-editor.org/rfc/rfc7636.html",
    ],
  },
  jwt: {
    agentGap: [
      "RFC 7519 is a container: header, claims, optional signature or encryption. It does not decide whether you are looking at identity, authorization, or a workload credential. Agent stacks fail when they treat 'it is a JWT' as a complete protocol.",
      "Every modern agent-auth proposal — AAuth (aa-agent+jwt, aa-auth+jwt), WIMSE WIT (wit+jwt), RFC 9068 access tokens (at+jwt), ID Tokens, ID-JAG, transaction tokens, DPoP proofs — is a JWT profile. If you cannot validate iss, aud, typ, alg, exp, and cnf, you cannot implement the landscape.",
    ],
    trustBoundaries: [
      "The issuer's signing key is the trust anchor. The audience is who may accept the token. The subject is who the token is about — which might be a user, a client, or a workload, depending on the profile. Never let the presenter choose iss/aud for you.",
    ],
    mechanics: [
      "JWS compact serialization is what almost all OAuth/OIDC profiles use. Validate signature against an allow-listed alg (never none, never confuse alg with the payload). Check typ where the profile defines one (RFC 8725). Check exp, nbf, iat, iss, aud as the profile requires. Nested JWTs (JWE, or assertions inside assertions) need explicit policy — see 7523bis work.",
    ],
    claims: [
      {
        name: "iss / sub / aud",
        meaning:
          "Quoted registered claims. Identity is usually the pair (iss, sub). aud is who may accept the token — client_id for ID Tokens, API for access tokens.",
        source: "quoted",
      },
      {
        name: "exp / nbf / iat",
        meaning:
          "Quoted time window. Agent tokens should be short-lived; clock skew policy is profile-specific (FAPI 2.0 is strict).",
        source: "quoted",
      },
      {
        name: "typ",
        meaning:
          "Quoted JOSE header. Profiles use at+jwt, wit+jwt, wpt+jwt, aa-agent+jwt, etc. Unchecked typ is token confusion.",
        source: "quoted",
      },
      {
        name: "cnf",
        meaning:
          "Quoted RFC 7800 confirmation. DPoP jkt, mTLS x5t#S256, AAuth/WIMSE jwk. Proof-of-possession lives here.",
        source: "quoted",
      },
      {
        name: "act",
        meaning:
          "Quoted RFC 8693 actor claim for delegation chains. Overbroad act is an agent-specific hazard.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "validate",
        title: "Validate a profiled JWT",
        steps: [
          "Parse compact JWS. Reject unencrypted tokens if the profile required JWE (rare in this cluster).",
          "Check typ and alg against the profile allow-list.",
          "Verify signature with keys for that issuer (JWKS, trust anchors — profile says which, and some profiles forbid fetching JWKS from iss alone).",
          "Check exp/nbf, iss, aud, and profile claims (client_id, cnf, wth, …).",
          "Only then apply authorization policy.",
        ],
      },
    ],
    layerDetail: [
      "A container. An ID Token is identity; a JWT access token is authorization; a WIT or AAuth agent token is identity bound to a key. The profile, not RFC 7519, decides the layer.",
    ],
    composition: [
      {
        specSlug: "jwt-access-tokens",
        how: "RFC 9068 profiles 7519 as typ at+jwt with mandatory aud.",
      },
      {
        specSlug: "oidc-core",
        how: "ID Token is a 7519 JWT with OIDC validation rules (nonce, at_hash, aud=client_id).",
      },
      {
        specSlug: "aauth",
        how: "Multiple typed JWTs (aa-*). typ is load-bearing.",
      },
      {
        specSlug: "wimse-creds",
        how: "WIT is typ wit+jwt with cnf.jwk; must not be used as bearer.",
      },
      {
        specSlug: "token-exchange",
        how: "Often inputs and outputs JWTs; act is a 7519 claim defined by 8693.",
      },
    ],
    pitfalls: [
      {
        title: "alg=none and algorithm confusion",
        body: "Follow RFC 8725 (and 8725bis in the RFC Editor queue in 2026). Allow-list algorithms.",
      },
      {
        title: "Wrong audience",
        body: "Accepting a token because the signature is valid is how MCP servers get calendar tokens. Check aud.",
      },
      {
        title: "Untyped JWTs",
        body: "If typ is absent, do not guess. Cross-profile confusion (ID Token as access token, person token as auth token) is the recurring agent bug.",
      },
    ],
    stabilityDetail: [
      "RFC 7519, May 2015. Stable format. Profiles and RFC 8725 JWT BCP are what you actually implement. https://www.rfc-editor.org/rfc/rfc7519.html",
    ],
  },
  "oauth-security-bcp": {
    agentGap: [
      "RFC 6749's original threat model did not include mix-up, authorization-code injection at confidential clients, or token leakage via URLs at internet scale. RFC 9700 (BCP 240, January 2025) is the update that makes 2.0 safe enough to build agents on.",
      "Agent runtimes add leakage paths (prompts, traces, shared tool hosts) that make 9700's push toward sender-constrained, audience-restricted, short-lived tokens the cheapest upgrade before AAuth or WIMSE.",
    ],
    trustBoundaries: [
      "Assumes attackers on the network, in the browser, and who can steal tokens from clients. Authorization servers, clients, and resource servers all have MUST/SHOULD mitigations. An agent host is a client in this document — usually a confidential web app or a public native/browser app, not a new role.",
    ],
    mechanics: [
      "Not a new protocol. It mandates authorization code + PKCE, exact redirect matching, sender-constrained or rotating refresh tokens for public clients, audience-restricted access tokens when multiple resources exist, and deprecates implicit and password grants. Mix-up mitigation includes the iss authorization-response parameter (RFC 9207). Tokens must not be placed in URIs.",
      "An update draft (draft-ietf-oauth-security-topics-update) was an active WG document in July 2026. Read RFC 9700 first; treat the update as pending deltas.",
    ],
    claims: [
      {
        name: "iss in authorization response",
        meaning:
          "Quoted mix-up mitigation; see RFC 9207, required by this BCP's direction and by MCP.",
        source: "quoted",
      },
      {
        name: "PKCE for all authorization-code clients",
        meaning:
          "Quoted direction of RFC 9700, folded into OAuth 2.1.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "safe-code",
        title: "9700-shaped authorization code",
        steps: [
          "Register exact redirect URIs. Use HTTPS except native loopback.",
          "Authorization code + PKCE S256. Include resource indicators if talking to a specific API.",
          "Validate iss on the response against the AS you intended.",
          "Token request on the back channel. Store tokens outside model context. Prefer DPoP or mTLS.",
          "RS checks audience. No tokens in query strings.",
        ],
      },
    ],
    layerDetail: [
      "Security profile sitting across client authentication and request authorization. It is why OAuth 2.1 exists. It is not an identity protocol.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "2.1 is this BCP consolidated into the core document.",
      },
      {
        specSlug: "fapi-2",
        how: "FAPI 2.0 Security Profile is explicitly built on RFC 9700 and then tightens further (PAR, confidential-only, sender-constrained access tokens).",
      },
      {
        specSlug: "dpop",
        how: "Recommended sender-constraint mechanism when mTLS is impractical.",
      },
      {
        specSlug: "iss-param",
        how: "RFC 9207 is the concrete mix-up fix 9700 relies on.",
      },
    ],
    pitfalls: [
      {
        title: "Implementing 6749 without 9700",
        body: "The most common agent-SDK failure. If your library still offers implicit, it is not BCP-compliant.",
      },
      {
        title: "Audience-unrestricted tokens",
        body: "9700 requires restricting tokens when multiple RSes exist. MCP makes this a MUST even if the AS currently ignores resource.",
      },
      {
        title: "Refresh tokens in agent homedirs",
        body: "Public-client refresh tokens must be sender-constrained or one-time-use. A stolen refresh token is a standing session.",
      },
    ],
    stabilityDetail: [
      "RFC 9700 (BCP 240), January 2025, T. Lodderstedt, J. Bradley, A. Labunets, D. Fett. Stable BCP. Ship it today. https://www.rfc-editor.org/rfc/rfc9700.html",
    ],
  },
  "native-apps": {
    agentGap: [
      "RFC 8252 (BCP 212) is how a native app completes authorization code via the system browser with PKCE and claimed HTTPS or loopback redirects. Human-in-the-loop consent for a local agent often looks like this RFC, not like a server-side redirect.",
      "The agent is not the embedded WebView. Embedded WebViews are in-scope for attackers (credential phishing, cookie theft). CLI agents should use loopback + PKCE or a remote BFF.",
    ],
    trustBoundaries: [
      "The OS browser is the trusted user-agent for authentication. The app is a public client. Custom URI schemes are weaker than claimed HTTPS URLs because any app can register them on some platforms.",
    ],
    mechanics: [
      "Open the system browser to the authorization endpoint. Receive the code on https app links or http://127.0.0.1:{port}/callback. Exchange with PKCE. Do not intercept cookies in an embedded view. OAuth 2.1 cites this RFC as part of the consolidation.",
    ],
    claims: [],
    flows: [
      {
        id: "loopback",
        title: "CLI agent loopback + PKCE",
        steps: [
          "Agent binds 127.0.0.1 to an ephemeral port and generates PKCE.",
          "Opens the system browser to the AS authorize URL.",
          "User authenticates and consents. Redirect hits loopback with the code.",
          "Agent exchanges code+verifier on the back channel. Stores tokens outside the model context.",
        ],
      },
    ],
    layerDetail: [
      "Authorization UX for clients that are not servers. User authentication still happens at the AS (OIDC). The native app is the OAuth client.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "Native-app profile is an input to 2.1. Loopback port exception for redirect matching lives there.",
      },
      {
        specSlug: "pkce",
        how: "Required.",
      },
      {
        specSlug: "browser-apps",
        how: "Sibling BCP for code that runs in the browser rather than as an OS app.",
      },
      {
        specSlug: "ciba",
        how: "If there is no local browser, CIBA is the alternative HITL path.",
      },
    ],
    pitfalls: [
      {
        title: "Embedded WebViews",
        body: "8252 tells you not to. Agent 'login in the electron pane' is often a WebView.",
      },
      {
        title: "Custom schemes",
        body: "Prefer claimed HTTPS URIs. Custom schemes are interceptable.",
      },
    ],
    stabilityDetail: [
      "RFC 8252 (BCP 212), October 2017. Stable. https://www.rfc-editor.org/rfc/rfc8252.html",
    ],
  },
  "browser-apps": {
    agentGap: [
      "RFC 10017 (BCP 212, August 2026) is the SPA story: code in the browser cannot hide a client secret or reliably hide tokens from XSS. Chat UIs that broker agent OAuth in the browser are browser-based OAuth clients. XSS in the chat page is equivalent to stealing the agent's tokens.",
      "OAuth 2.1 draft-16 still TODOs importing this text and cites the -27 Internet-Draft (6 July 2026). The RFC itself is published — use the RFC.",
    ],
    trustBoundaries: [
      "The browser is hostile: XSS, malicious extensions, referrers. A Backend-for-Frontend that holds tokens in HTTP-only cookies moves the trust boundary to your server. Browser-only + PKCE keeps tokens in memory at best; localStorage is a gift to XSS.",
    ],
    mechanics: [
      "Authorization code + PKCE. Prefer BFF. If tokens must live in the browser, keep them in memory. Implicit is forbidden. CORS must be set on token and other AS endpoints the SPA calls; not on the authorization endpoint (that is a redirect).",
    ],
    claims: [],
    flows: [
      {
        id: "bff",
        title: "BFF in front of a chat UI",
        steps: [
          "Browser talks only to your BFF with session cookies.",
          "BFF performs authorization code + PKCE as a confidential client.",
          "BFF calls MCP/SaaS APIs with the access token. The model never sees the token.",
        ],
        notes:
          "This is the architecture that makes prompt injection unable to exfiltrate the Bearer token — it never entered the browser or the prompt.",
      },
    ],
    layerDetail: [
      "Authorization for public clients in the browser. Complements OIDC for SPAs. Does not define agent identity.",
    ],
    composition: [
      {
        specSlug: "oauth-2-1",
        how: "Input document; 2.1 has not finished copying the normative text as of -16.",
      },
      {
        specSlug: "pkce",
        how: "Required for the browser-only pattern.",
      },
      {
        specSlug: "oauth-security-bcp",
        how: "Same threat family: XSS, leakage, mix-up.",
      },
      {
        specSlug: "mcp-auth",
        how: "If the MCP client is a browser app, this BCP applies to how it holds tokens.",
      },
    ],
    pitfalls: [
      {
        title: "Tokens in localStorage",
        body: "XSS reads them. Memory-only or BFF.",
      },
      {
        title: "CORS on authorize",
        body: "FAPI and this BCP want redirects, not XHR, to the authorization endpoint.",
      },
    ],
    stabilityDetail: [
      "RFC 10017 (BCP 212), August 2026, A. Parecki, D. Waite, P. De Ryck. Newly stable RFC. https://www.rfc-editor.org/rfc/rfc10017.html",
    ],
  },
  "jwt-client-auth": {
    agentGap: [
      "RFC 7523 lets a client authenticate to an AS, or request a token, with a signed JWT assertion instead of a shared secret or an authorization code. Cross-domain 'the agent already has an identity assertion, needs an access token over here' is RFC 8693 then RFC 7523. Without 7523 there is no ID-JAG redemption step.",
      "Agents that already have a key (SPIFFE, AAuth, private_key_jwt CIMD clients) should prefer this over a client_secret in Kubernetes.",
    ],
    trustBoundaries: [
      "The assertion issuer (often the client itself for private_key_jwt, or an IdP for JWT bearer grants) is trusted by the receiving AS. The assertion MUST be audience-restricted to that AS. A stolen assertion replayed at another AS is the mix-up analogue.",
    ],
    mechanics: [
      "Client authentication: client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer and client_assertion=<jwt>. Authorization grant: grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer and assertion=<jwt>. The JWT carries iss, sub, aud (the AS), exp, jti. Short-lived. draft-ietf-oauth-rfc7523bis was in the RFC Editor queue in 2026 — watch it for nested JWT clarifications.",
    ],
    claims: [
      {
        name: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        meaning:
          "Quoted grant type for using a JWT as an authorization grant (identity chaining, XAA redemption).",
        source: "quoted",
      },
      {
        name: "client_assertion JWT",
        meaning:
          "Quoted client authentication form (private_key_jwt). aud must be the receiving AS.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "jwt-bearer-grant",
        title: "JWT bearer grant (redeem an assertion)",
        steps: [
          "Client obtains a JWT authorization grant audience-restricted to this AS (from token exchange / identity chaining / XAA).",
          "POSTs grant_type=jwt-bearer and assertion=the JWT, plus any requested resource/scope.",
          "AS validates signature, aud, exp, and policy, then issues an access token for its RS.",
        ],
      },
    ],
    layerDetail: [
      "Both: private_key_jwt is client authentication; jwt-bearer is an authorization grant. The assertion's subject is identity; the issued access token is authorization at this AS.",
    ],
    composition: [
      {
        specSlug: "token-exchange",
        how: "Often the step that mints the JWT grant 7523 redeems.",
      },
      {
        specSlug: "identity-chaining",
        how: "Profiles 8693 + 7523 for cross-domain hops.",
      },
      {
        specSlug: "xaa",
        how: "ID-JAG is redeemed via 7523 at the resource app's AS.",
      },
      {
        specSlug: "cimd",
        how: "CIMD forbids shared-secret client auth; public-key methods such as private_key_jwt are the intended pair.",
      },
    ],
    pitfalls: [
      {
        title: "Wrong aud on the assertion",
        body: "If aud is the client or the RS instead of the AS, you have an ID Token shaped object. XAA's whole point is that ID-JAG aud is the resource AS, unlike an ID Token.",
      },
      {
        title: "Replay",
        body: "jti and short exp matter. Bearer assertions without PoP can be stolen in logs.",
      },
    ],
    stabilityDetail: [
      "RFC 7523, May 2015. Stable. 7523bis in the RFC Editor queue in 2026 — watch for clarifications, do not wait to implement 7523. https://www.rfc-editor.org/rfc/rfc7523.html",
    ],
  },
};
