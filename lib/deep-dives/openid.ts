import type { SpecDeepDive } from "@/lib/types";

export const openidDeepDives: Record<string, SpecDeepDive> = {
  "oidc-core": {
    agentGap: [
      "OAuth 2.0 does not tell the client who authenticated. OpenID Connect adds an ID Token and a UserInfo endpoint so a relying party can obtain an authenticated end-user identity. User-delegated agents still need to know which human they serve; OIDC remains the way that human authenticates to the authorization server.",
      "Mixing the layers is the most common design error in agent stacks: sending the ID Token to an MCP server, treating sub as a SPIFFE ID, or assuming OIDC authorized a specific tool call. XAA even starts from an ID Token as the subject_token — at the IdP, not at the API.",
    ],
    trustBoundaries: [
      "The end-user authenticates to the OpenID provider (OP). The relying party (the agent host / client) consumes the ID Token; aud is the client_id. The OP is also an OAuth AS. Resource servers are not OIDC relying parties and must not accept ID Tokens as access tokens.",
    ],
    mechanics: [
      "Authorization Code flow (with PKCE in modern deployments) adding scope=openid. Token endpoint returns an ID Token (JWT) plus an access token (and optional refresh token). RP validates iss, aud (the client_id), exp, iat, nonce, signature; optional azp, at_hash, c_hash. UserInfo endpoint, authorized by the access token with openid scope, returns additional claims. Implicit and hybrid exist in the 2014 spec; do not use them for new agents.",
      "OpenID Connect Core 1.0 incorporating errata set 2. Authors: N. Sakimura, J. Bradley, M. Jones, B. de Medeiros, C. Mortimore. Final 2014 with ongoing errata.",
    ],
    claims: [
      {
        name: "id_token",
        meaning:
          "Quoted: JWT authenticating the user to the client. aud is the client, not the API.",
        source: "quoted",
      },
      {
        name: "sub",
        meaning:
          "Quoted: stable subject identifier at that issuer. Pair with iss. Pairwise subs are allowed.",
        source: "quoted",
      },
      {
        name: "nonce / at_hash / c_hash",
        meaning:
          "Quoted: replay and token-binding checks between ID Token and the code/access token.",
        source: "quoted",
      },
      {
        name: "scope=openid",
        meaning:
          "Quoted: the switch that makes an OAuth request an OIDC request.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "code",
        title: "Authorization code + ID Token",
        steps: [
          "RP redirects with scope=openid (plus others), nonce, PKCE, resource if also requesting API access.",
          "User authenticates at the OP. Consent covers identity and any API scopes.",
          "Token endpoint returns id_token + access_token. RP validates the ID Token locally.",
          "RP keeps the ID Token. It uses the access token (audience-restricted) at APIs. Optional UserInfo call.",
        ],
        notes:
          "If a design says 'the agent sends the ID Token to the MCP server', that design is wrong.",
      },
    ],
    layerDetail: [
      "Identity and authentication of the user. Authorization of API access remains OAuth (the access token). Client authentication is still OAuth client auth. AAuth reuses OIDC claim names so identity-aware resources can keep their user model without becoming OIDC RPs.",
    ],
    composition: [
      { specSlug: "oauth-2-0", how: "OIDC is an identity layer on OAuth 2.0." },
      { specSlug: "oauth-2-1", how: "Same relationship; use 2.1-shaped code+PKCE to obtain the ID Token." },
      { specSlug: "oidc-discovery", how: "How the RP finds the OP." },
      { specSlug: "xaa", how: "ID Token (or refresh) is the subject_token for minting an ID-JAG." },
      { specSlug: "aauth", how: "Reuses sub/email/groups/roles; does not issue ID Tokens." },
      { specSlug: "ciba", how: "Decoupled OIDC authentication/consent when the user is on another device." },
    ],
    pitfalls: [
      {
        title: "ID Token as access token",
        body: "aud is the client. An API that accepts it is trusting the wrong audience. MCP wants an access token minted for the MCP server.",
      },
      {
        title: "Skipping nonce",
        body: "Replay of an ID Token into a different agent session. Always send and check nonce on interactive flows.",
      },
      {
        title: "Pairwise sub surprise",
        body: "The same human may have different sub values at different RPs. Do not use sub as a global person identifier across OPs either — always (iss, sub).",
      },
    ],
    stabilityDetail: [
      "OIDF Final, 2014, errata set 2 current. Stable. Implement with RFC 9700/OAuth 2.1 practices (PKCE, no implicit). https://openid.net/specs/openid-connect-core-1_0.html",
    ],
  },
  "oidc-discovery": {
    agentGap: [
      "Relying parties need to discover OP endpoints and capabilities from an issuer URL. Runtime discovery of 'where does this user authenticate' is mandatory once agents use many IdPs. MCP clients must support this in addition to RFC 8414.",
    ],
    trustBoundaries: [
      "Issuer URL comparison is exact. A document that lies about issuer is an attack. Path insertion/append variants exist; implement the ones MCP requires so you do not miss a multi-tenant OP.",
    ],
    mechanics: [
      "GET {issuer}/.well-known/openid-configuration (with path insertion/append variants). Validate issuer. Use authorization_endpoint, token_endpoint, jwks_uri, userinfo_endpoint, id_token_signing_alg_values_supported, etc.",
    ],
    claims: [
      {
        name: "issuer",
        meaning:
          "Quoted: must match the identifier used to construct the well-known URL.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "oidc-disco",
        title: "Discover an OP",
        steps: [
          "Start from an issuer (IdP URL or from PRM/AS metadata).",
          "GET openid-configuration. If that fails, MCP also tries RFC 8414 paths.",
          "Reject issuer mismatch. Cache JWKS from jwks_uri.",
        ],
      },
    ],
    layerDetail: [
      "Discovery for the identity layer, parallel to RFC 8414. Some OPs publish both documents; they should agree on issuer.",
    ],
    composition: [
      { specSlug: "oidc-core", how: "How you use the endpoints you discovered." },
      { specSlug: "as-metadata", how: "OAuth-only ASes may only have 8414. MCP requires both client-side." },
      { specSlug: "mcp-auth", how: "MUST support both discovery mechanisms." },
    ],
    pitfalls: [
      {
        title: "Trailing slash / path issuers",
        body: "https://issuer.example/tenant is not https://issuer.example/tenant/. Implement the spec's path rules.",
      },
    ],
    stabilityDetail: [
      "OIDF Final (errata updates ongoing). Stable. https://openid.net/specs/openid-connect-discovery-1_0.html",
    ],
  },
  ciba: {
    agentGap: [
      "The client has an identifier for the user but the user is not in a browser in front of that client — they will authenticate and consent on another device. This is the existing standard for human-in-the-loop approval when the agent is unattended. If a vendor says 'async authorization for genAI', they are often wrapping CIBA.",
      "Use CIBA for 'agent wants to do X while the user is away'; XAA for 'IT already authorized this app connection'; AAuth missions for natural-language, multi-resource intent; RFC 9470 when the RS demands stronger auth on an existing grant.",
    ],
    trustBoundaries: [
      "Consumption device (the agent) never sees the user's password. Authentication device (phone) is where the user actually authenticates. The OP binds them with auth_req_id and an optional binding_message so the user knows which action they are approving. Polling the token endpoint must be authenticated as the client.",
    ],
    mechanics: [
      "Client POSTs to the backchannel authorization endpoint with a login hint, scope, optional binding_message and requested_expiry. OP returns auth_req_id. User is notified out of band. Client polls (or uses ping/push) the token endpoint with grant_type=urn:openid:params:grant-type:ciba until approved, denied, or expired. FAPI 2.0 Security Profile supports CIBA and notes that authorization-code and CIBA have been through detailed security analysis.",
    ],
    claims: [
      {
        name: "auth_req_id",
        meaning: "Quoted: handle for the pending authentication.",
        source: "quoted",
      },
      {
        name: "binding_message",
        meaning:
          "Quoted: short string shown on both agent UI and phone so the user knows which action they are approving.",
        source: "quoted",
      },
      {
        name: "grant_type=urn:openid:params:grant-type:ciba",
        meaning: "Quoted token-endpoint grant while polling.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "ciba-poll",
        title: "Poll until the phone approves",
        steps: [
          "Agent POSTs backchannel authorize: login_hint, scope, binding_message describing the tool call, client auth.",
          "OP returns auth_req_id (and expires_in / interval).",
          "User sees a push with the binding message and approves or denies.",
          "Agent polls token endpoint with grant_type CIBA + auth_req_id (slow_down / pending / denied / expired).",
          "On success, ID Token + access token as in OIDC. Use the access token at the API, not the ID Token.",
        ],
      },
    ],
    layerDetail: [
      "Authentication and consent, decoupled from the consumption device. The tokens that result are still OAuth/OIDC tokens (authorization + identity at the client).",
    ],
    composition: [
      { specSlug: "oidc-core", how: "CIBA is an OIDC authentication flow producing the same token types." },
      { specSlug: "step-up", how: "RS can demand CIBA-shaped re-auth via 9470 challenges." },
      { specSlug: "fapi-2", how: "Supported high-security profile for CIBA deployments." },
      { specSlug: "aauth", how: "Missions/interaction relay are the AAuth HITL analogue; CIBA is the OIDC one." },
      { specSlug: "xaa", how: "Orthogonal: preapproved connections vs per-action approval." },
    ],
    pitfalls: [
      {
        title: "Missing binding_message",
        body: "The user approves 'something' on the phone. For agent tool calls, the message must name the action.",
      },
      {
        title: "Polling as a confused client",
        body: "auth_req_id without client authentication is stealable. Confidential client auth (or FAPI methods) on the token poll.",
      },
      {
        title: "Using CIBA to skip consent policy",
        body: "CIBA authenticates/consents a grant; it does not replace RS policy or audience checks.",
      },
    ],
    stabilityDetail: [
      "OIDF Final 2021 (errata revisions exist). Stable. https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html",
    ],
  },
  "fapi-2": {
    agentGap: [
      "High-value APIs (open banking, anything an agent could drain) need a profile of OAuth that has been argued against an attacker model. FAPI 2.0 Security Profile is that profile: PAR, PKCE S256, sender-constrained tokens (mTLS and/or DPoP), confidential clients only, exact redirects, iss in the response, 60-second authorization codes. If you are connecting an agent to an open-banking API, the bank will not take 'we used OAuth 2.0'.",
      "It follows RFC 9700 and has been formally analysed against the FAPI attacker model. Do not assume FAPI 1.0 (JWS request objects, different constraints) is the same profile.",
    ],
    trustBoundaries: [
      "Confidential clients only — a public CLI agent is not FAPI 2.0 compliant without a confidential BFF. Authorization servers and resource servers have paired shalls. Public clients, implicit, password grants, and unconstrained Bearer tokens are out.",
    ],
    mechanics: [
      "Not a new grant. Constrain authorization-code or CIBA: sender-constrained access tokens via mTLS (RFC 8705) and/or DPoP (RFC 9449); PAR required (reject authorize without PAR); PKCE S256; client authentication via private_key_jwt or mTLS; iss in authorization response (RFC 9207); no http redirects except native loopback; authorization codes ≤ 60 seconds; clock skew rules for JWT iat/nbf (accept 0–10 seconds future, reject > 60). TLS 1.2+ per BCP 195.",
    ],
    claims: [
      {
        name: "sender-constrained access token",
        meaning:
          "Quoted requirement: mTLS and/or DPoP. Unconstrained Bearer is non-compliant.",
        source: "quoted",
      },
      {
        name: "PAR + PKCE S256 + response_type=code",
        meaning: "Quoted authorization request constraints.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "fapi-code",
        title: "FAPI 2.0 authorization code",
        steps: [
          "Confidential client authenticates and POSTs PAR with PKCE S256, redirect_uri, resource.",
          "Redirect with request_uri only. User authenticates. Response includes iss.",
          "Token request with client auth and DPoP or mTLS. Code lifetime already ticking (≤ 60s).",
          "RS requires the same sender constraint. Step-up if the call is extra-sensitive.",
        ],
      },
    ],
    layerDetail: [
      "A security profile wrapping OAuth authorization and (optionally) OIDC authentication. Identity is still OIDC if you asked for openid. Authorization is the constrained token.",
    ],
    composition: [
      { specSlug: "oauth-security-bcp", how: "FAPI 2.0 is built on RFC 9700 then tightens." },
      { specSlug: "oauth-2-1", how: "Compatible direction; FAPI is stricter (confidential-only, PAR mandatory, PoP mandatory)." },
      { specSlug: "par", how: "Mandatory." },
      { specSlug: "dpop", how: "One allowed PoP method." },
      { specSlug: "mtls", how: "The other allowed PoP method." },
      { specSlug: "ciba", how: "Supported flow under the same attacker model." },
    ],
    pitfalls: [
      {
        title: "Public agent hosts",
        body: "A local LLM wrapper is not a confidential client. Put FAPI behind a BFF or do not claim FAPI.",
      },
      {
        title: "FAPI 1 vs 2",
        body: "Request objects and JARM are FAPI 1-era headlines. FAPI 2's headline is PAR + PoP.",
      },
      {
        title: "Refresh token rotation",
        body: "FAPI 2.0 tells ASes not to use refresh token rotation except in extraordinary circumstances (see the spec's Note 1). Do not cargo-cult SPA rotation into a FAPI AS.",
      },
    ],
    stabilityDetail: [
      "OIDF FAPI 2.0 Security Profile Final. Stable enough that banks certify against it. https://openid.net/specs/fapi-security-profile-2_0-final.html",
    ],
  },
};
