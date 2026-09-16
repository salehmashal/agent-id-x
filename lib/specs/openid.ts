import type { Spec } from "@/lib/types";

export const openidSpecs: Spec[] = [
  {
    slug: "oidc-core",
    shortName: "OpenID Connect Core",
    officialName: "OpenID Connect Core 1.0 incorporating errata set 2",
    id: "OpenID.Core",
    status: "oidf-final",
    stability: "stable",
    date: "Final 2014; errata set 2 current",
    authors: "N. Sakimura, J. Bradley, M. Jones, B. de Medeiros, C. Mortimore",
    org: "OIDF",
    layer: "identity",
    relevance: "foundation",
    featured: true,
    aliases: ["oidc", "openid connect"],
    problem:
      "OAuth 2.0 does not tell the client who authenticated. OpenID Connect adds an ID Token and a UserInfo endpoint so a relying party can obtain an authenticated end-user identity.",
    identityVsAuthnVsAuthz:
      "Identity and authentication of the user. Authorization of API access remains OAuth. Mixing them up is the most common design error in agent stacks.",
    actors: [
      "End-user",
      "Relying party (client)",
      "OpenID provider (authorization server + identity)",
    ],
    flow: "Authorization Code flow (with PKCE in modern deployments) adding scope=openid. The token endpoint returns an ID Token (JWT) plus an access token. The RP validates iss, aud (the client_id), exp, nonce, signature. Optional UserInfo call for additional claims.",
    tokensAndClaims: [
      {
        name: "id_token",
        meaning:
          "JWT authenticating the user to the client. aud is the client, not the API.",
      },
      {
        name: "sub",
        meaning: "Stable subject identifier at that issuer. Pair with iss.",
      },
      { name: "nonce / at_hash / c_hash", meaning: "Replay and token-binding checks." },
    ],
    related: ["oauth-2-0", "oauth-2-1", "oidc-discovery", "ciba", "xaa", "aauth"],
    implementerNotes:
      "An ID Token is not an access token. Do not send it to APIs. AAuth reuses OIDC claim names (sub, email, groups) so identity-aware resources can keep their existing user model.",
    whyAgentCares:
      "User-delegated agents still need to know which human they serve. OIDC remains the way that human authenticates to the authorization server. XAA even starts from an ID Token as the subject_token.",
    urls: [
      {
        label: "OIDC Core",
        href: "https://openid.net/specs/openid-connect-core-1_0.html",
      },
    ],
  },
  {
    slug: "oidc-discovery",
    shortName: "OIDC Discovery",
    officialName: "OpenID Connect Discovery 1.0",
    id: "OpenID.Discovery",
    status: "oidf-final",
    stability: "stable",
    date: "Final (errata updates ongoing)",
    org: "OIDF",
    layer: "mixed",
    relevance: "foundation",
    aliases: ["openid-configuration"],
    problem:
      "Relying parties need to discover OP endpoints and capabilities from an issuer URL.",
    identityVsAuthnVsAuthz: "Discovery for the identity layer, parallel to RFC 8414.",
    actors: ["Relying party", "OpenID provider"],
    flow: "GET {issuer}/.well-known/openid-configuration (with path insertion/append variants). Validate issuer. MCP clients must support this in addition to RFC 8414.",
    tokensAndClaims: [
      {
        name: "issuer",
        meaning: "Must match the identifier used to construct the well-known URL.",
      },
    ],
    related: ["oidc-core", "as-metadata", "mcp-auth"],
    implementerNotes:
      "Issuer URL comparison is exact. A document that lies about issuer is an attack.",
    whyAgentCares:
      "Runtime discovery of 'where does this user authenticate' is mandatory once agents use many IdPs.",
    urls: [
      {
        label: "Discovery spec",
        href: "https://openid.net/specs/openid-connect-discovery-1_0.html",
      },
    ],
  },
  {
    slug: "ciba",
    shortName: "CIBA",
    officialName:
      "OpenID Connect Client-Initiated Backchannel Authentication Flow — Core 1.0",
    id: "OpenID.CIBA",
    status: "oidf-final",
    stability: "stable",
    date: "Final 2021 (errata revisions exist)",
    org: "OIDF",
    layer: "authn",
    relevance: "agent-specific",
    featured: true,
    aliases: ["client initiated backchannel", "decoupled flow"],
    problem:
      "The client has an identifier for the user but the user is not in a browser in front of that client — they will authenticate and consent on another device (phone, hardware token).",
    identityVsAuthnVsAuthz:
      "Authentication and consent, decoupled from the consumption device. The tokens that result are still OAuth/OIDC tokens (authorization).",
    actors: [
      "Consumption device (the agent)",
      "Authentication device (user's phone)",
      "OpenID provider",
      "User",
    ],
    flow: "Client POSTs to the backchannel authorization endpoint with a login hint, scope, optional binding_message and requested_expiry. OP returns auth_req_id. User is notified out of band. Client polls (or uses ping/push) the token endpoint with grant_type=urn:openid:params:grant-type:ciba until approved, denied, or expired.",
    tokensAndClaims: [
      {
        name: "auth_req_id",
        meaning: "Handle for the pending authentication.",
      },
      {
        name: "binding_message",
        meaning: "Short string shown on both agent UI and phone so the user knows which action they are approving.",
      },
    ],
    related: ["oidc-core", "step-up", "fapi-2", "aauth", "xaa"],
    implementerNotes:
      "FAPI 2.0 Security Profile supports CIBA and notes that authorization-code and CIBA have been through detailed security analysis. Use CIBA for 'agent wants to do X while the user is away'; use XAA for 'IT already authorized this app connection'; use AAuth missions for natural-language, multi-resource intent.",
    whyAgentCares:
      "This is the existing standard for human-in-the-loop approval when the agent is unattended. If a vendor says 'async authorization for genAI', they are often wrapping CIBA.",
    urls: [
      {
        label: "CIBA Core",
        href: "https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html",
      },
    ],
  },
  {
    slug: "openid-federation",
    shortName: "OpenID Federation",
    officialName: "OpenID Federation 1.1",
    id: "openid-federation-1_1-final",
    status: "oidf-final",
    stability: "stable",
    date: "Approved Final 6 May 2026",
    org: "OIDF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["oidfed"],
    problem:
      "Large numbers of OPs and RPs cannot pairwise-register. Federation lets them discover and trust each other through a chain of signed entity statements from trust anchors.",
    identityVsAuthnVsAuthz:
      "Trust establishment for identity providers and relying parties. Not the user-authentication protocol itself.",
    actors: ["Trust anchors", "Intermediate entities", "OPs", "RPs"],
    flow: "Each entity publishes a well-known entity statement. Relying parties walk the chain to a trust anchor, verifying signatures and metadata policies, then proceed with OIDC/OAuth.",
    tokensAndClaims: [
      {
        name: "entity statement JWT",
        meaning: "Signed metadata about an entity, including authority hints.",
      },
    ],
    related: ["oidc-core", "aauth", "did-core"],
    implementerNotes:
      "OpenID Federation for OpenID Connect 1.1 was approved Final in the same vote. AAuth's four-party mode is a different federation (PS to resource AS), not OpenID Federation — do not conflate them.",
    whyAgentCares:
      "If your agents must be accepted as clients across a national or campus federation without per-AS portals, this is the OIDC way. Cross-org agent identity more often uses WIMSE, SPIFFE federation, or DID/VC work instead.",
    urls: [
      {
        label: "OpenID Federation 1.1",
        href: "https://openid.net/specs/openid-federation-1_1-final.html",
      },
      {
        label: "Approval announcement",
        href: "https://openid.net/openid-federation-1-1-final-specifications-approved/",
      },
    ],
  },
  {
    slug: "fapi-2",
    shortName: "FAPI 2.0",
    officialName: "FAPI 2.0 Security Profile",
    id: "fapi-security-profile-2_0-final",
    status: "oidf-final",
    stability: "stable",
    date: "Final (OIDF FAPI WG)",
    org: "OIDF",
    layer: "mixed",
    relevance: "adjacent",
    aliases: ["fapi2"],
    problem:
      "High-value APIs (open banking, anything an agent could drain) need a profile of OAuth that has been argued against an attacker model: PAR, PKCE, sender-constrained tokens, exact redirects, and more.",
    identityVsAuthnVsAuthz:
      "A security profile wrapping OAuth authorization and (optionally) OIDC authentication. Follows RFC 9700.",
    actors: ["Confidential clients", "Authorization servers", "Resource servers"],
    flow: "Not a new grant. Constrain an authorization-code or CIBA deployment: sender-constrained access tokens via mTLS and/or DPoP, PAR, PKCE S256, issuer checks, etc.",
    tokensAndClaims: [
      {
        name: "sender-constrained access token",
        meaning: "mTLS (RFC 8705) and/or DPoP (RFC 9449) required by the profile.",
      },
    ],
    related: ["oauth-security-bcp", "par", "dpop", "mtls", "ciba", "oauth-2-1"],
    implementerNotes:
      "Use FAPI 2.0 when the agent's tools move money or equally sensitive data. Do not assume FAPI 1.0 (JWS request objects, different constraints) is the same profile.",
    whyAgentCares:
      "If you are connecting an agent to an open-banking API, the bank will not take 'we used OAuth 2.0'. They will take FAPI 2.0. It is also a checklist for any high-risk agent tool.",
    urls: [
      {
        label: "FAPI 2.0 Security Profile",
        href: "https://openid.net/specs/fapi-security-profile-2_0-final.html",
      },
    ],
  },
  {
    slug: "ssf",
    shortName: "Shared Signals Framework",
    officialName: "OpenID Shared Signals Framework 1.0",
    id: "openid-sharedsignals-framework-1_0",
    status: "oidf-final",
    stability: "stable",
    date: "Final (SSF 1.0)",
    org: "OIDF",
    layer: "authn",
    relevance: "adjacent",
    aliases: ["ssf", "shared signals", "risc"],
    problem:
      "Once a session or credential is compromised, every relying party that accepted it needs to hear quickly. SSF profiles Security Event Tokens (RFC 8417) for stream-based sharing between transmitters and receivers. RISC is the account-compromise profile; CAEP is the session/access profile.",
    identityVsAuthnVsAuthz:
      "Continuous evaluation of authentication and session risk, not initial login.",
    actors: ["Transmitter (IdP, device vendor, …)", "Receiver (SaaS, agent platform)"],
    flow: "Receiver discovers transmitter configuration, manages an event stream, and consumes SETs via push (RFC 8935) or poll (RFC 8936). Events name subjects using RFC 9493 subject identifiers.",
    tokensAndClaims: [
      {
        name: "Security Event Token",
        meaning: "JWT wrapping an events object with typed event URIs.",
      },
    ],
    related: ["caep", "oidc-core", "step-up"],
    implementerNotes:
      "Implement SSF before inventing webhook-based 'session revoked' APIs. RISC remains the account-takeover event set; CAEP covers session-revoked, credential-change, device-compliance-change.",
    whyAgentCares:
      "An agent holding a delegated token after the user is fired, phished, or offboarded is a standing incident. SSF/CAEP is how the IdP tells the agent platform to drop the session.",
    urls: [
      {
        label: "SSF 1.0 (markdown final)",
        href: "https://openid.net/specs/openid-sharedsignals-framework-1_0-final.md",
      },
    ],
  },
  {
    slug: "caep",
    shortName: "CAEP",
    officialName: "OpenID Continuous Access Evaluation Profile 1.0",
    id: "openid-caep-1_0-final",
    status: "oidf-final",
    stability: "stable",
    org: "OIDF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["continuous access"],
    problem:
      "Access decisions made at token-issuance time go stale. CAEP defines event types so cooperating systems can attenuate access when sessions, credentials, or device posture change — including for robotic users.",
    identityVsAuthnVsAuthz:
      "Authorization continuity. Explicitly mentions shared human or robotic users.",
    actors: ["SSF transmitter", "SSF receiver (agent platform, MCP host, SaaS)"],
    flow: "Same transport as SSF. Event types under https://schemas.openid.net/secevent/caep/event-type/ including session-revoked and credential-change.",
    tokensAndClaims: [
      {
        name: "credential-change",
        meaning: "Signals create/change/revoke/delete of passwords, FIDO, VCs, app credentials, …",
      },
    ],
    related: ["ssf", "step-up", "aims"],
    implementerNotes:
      "CAEP does not issue tokens; it tells you to stop trusting ones you already have.",
    whyAgentCares:
      "Agent sessions are long. CAEP is how you implement 'kill the agent' as a protocol, not a Slack message to on-call.",
    urls: [
      {
        label: "CAEP 1.0",
        href: "https://openid.net/specs/openid-caep-1_0-final.html",
      },
    ],
  },
  {
    slug: "oidc-ida",
    shortName: "OIDC for Identity Assurance",
    officialName: "OpenID Connect for Identity Assurance 1.0",
    id: "openid-connect-4-identity-assurance-1_0",
    status: "oidf-final",
    stability: "stable",
    org: "OIDF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["eKYC", "verified_claims"],
    problem:
      "Ordinary OIDC claims are self-asserted or weakly verified. Regulated use cases need claims bundled with evidence about how they were verified.",
    identityVsAuthnVsAuthz:
      "Higher-assurance identity attributes. Not authorization of APIs.",
    actors: ["OP with IDA", "Relying party", "End-user"],
    flow: "RP requests verified_claims. OP returns verified claims plus verification metadata and evidence, distinct from unverified claims.",
    tokensAndClaims: [
      {
        name: "verified_claims",
        meaning: "Container binding claims to verification evidence.",
      },
    ],
    related: ["oidc-core", "openid4vp", "vc-data-model"],
    implementerNotes:
      "Relevant when an agent must act only for an identity-proofed user (finance, health). Most coding agents do not need IDA on day one.",
    whyAgentCares:
      "If policy is 'the agent may file a tax return only for a KYC'd user', OIDC IDA or a VC is how you know the user is KYC'd — not a display name on a GitHub account.",
    urls: [
      {
        label: "OIDC IDA 1.0",
        href: "https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html",
      },
    ],
  },
  {
    slug: "openid4vp",
    shortName: "OpenID4VP",
    officialName: "OpenID for Verifiable Presentations 1.0",
    id: "openid-4-verifiable-presentations-1_0-final",
    status: "oidf-final",
    stability: "stable",
    date: "Final approved 10 July 2025",
    org: "OIDF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["openid4vp", "dcp"],
    problem:
      "A verifier needs to request a presentation of credentials from a wallet (W3C VC, SD-JWT VC, mdoc) using OAuth rails, including over the W3C Digital Credentials API.",
    identityVsAuthnVsAuthz:
      "Identity presentation. Can be combined with issuance of an access token based on the presentation.",
    actors: ["Verifier", "Wallet / holder", "User"],
    flow: "Verifier sends an authorization request with a DCQL query. Wallet returns a vp_token with presentations. Alternative transport: Digital Credentials API instead of HTTPS redirects.",
    tokensAndClaims: [
      { name: "vp_token", meaning: "Container for one or more presentations." },
      { name: "dcql_query", meaning: "Digital Credentials Query Language request." },
    ],
    related: ["openid4vci", "vc-data-model", "sd-jwt-vc", "oidc-core"],
    implementerNotes:
      "Product of the OpenID DCP working group. v1.1 was planned without breaking changes (estimated late 2026). Do not implement the older 'OpenID Connect for Verifiable Presentations' drafts; they are superseded.",
    whyAgentCares:
      "An agent acting as a verifier (checking a supplier's credential) or presenting an organizational VC as its identity will hit OpenID4VP. Cross-org agent identity CGs often assume this stack.",
    urls: [
      {
        label: "OpenID4VP 1.0 Final",
        href: "https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html",
      },
    ],
  },
  {
    slug: "openid4vci",
    shortName: "OpenID4VCI",
    officialName: "OpenID for Verifiable Credential Issuance 1.0",
    id: "openid-4-verifiable-credential-issuance-1_0-final",
    status: "oidf-final",
    stability: "stable",
    date: "Final approved 16 September 2025",
    org: "OIDF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["openid4vci"],
    problem:
      "Wallets need an OAuth-protected API to obtain credentials (SD-JWT VC, mdoc, W3C VCDM) from an issuer.",
    identityVsAuthnVsAuthz:
      "Issuance of identity (and other) credentials. Access to the issuance API is OAuth authorization.",
    actors: ["Issuer", "Wallet", "Authorization server", "User"],
    flow: "Credential offer, authorization, token, credential (and optional deferred) endpoints. Pre-authorized code grant is common. Proof JWTs bind the credential to a holder key.",
    tokensAndClaims: [
      {
        name: "access token for credential endpoint",
        meaning: "OAuth token authorizing issuance, not the VC itself.",
      },
    ],
    related: ["openid4vp", "sd-jwt-vc", "oauth-2-0"],
    implementerNotes:
      "Issuers can extend existing OIDC providers. Formats are not limited to W3C VCs.",
    whyAgentCares:
      "If your org issues an 'this agent is owned by Acme' credential, OpenID4VCI is the likely issuance protocol, with OpenID4VP for presentation.",
    urls: [
      {
        label: "OpenID4VCI 1.0",
        href: "https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html",
      },
    ],
  },
  {
    slug: "sd-jwt-vc",
    shortName: "SD-JWT VC",
    officialName: "SD-JWT-based Verifiable Digital Credentials (SD-JWT VC)",
    id: "draft-ietf-oauth-sd-jwt-vc-19",
    status: "wg-draft",
    stability: "draft",
    date: "31 August 2026 (IETF Last Call ending 15 September 2026)",
    org: "IETF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["sd-jwt"],
    problem:
      "Need a JWT-shaped verifiable credential that supports selective disclosure, usable with OpenID4VP/VCI.",
    identityVsAuthnVsAuthz: "Credential format for identity (and other) claims.",
    actors: ["Issuer", "Holder", "Verifier"],
    flow: "Issuer creates an SD-JWT with salted disclosures. Holder presents a subset. Verifier checks signature and digests.",
    tokensAndClaims: [
      {
        name: "SD-JWT + disclosures",
        meaning: "Combined presentation format; not an OAuth access token.",
      },
    ],
    related: ["openid4vp", "openid4vci", "jwt"],
    implementerNotes:
      "In Last Call as of 15 September 2026, targeting Proposed Standard. Related RFC 9901 covers generic SD-JWT. Confirm status on datatracker before citing as an RFC.",
    whyAgentCares:
      "Likely credential format if you bind an agent to an organization with selective disclosure (show role, hide home address).",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/",
      },
    ],
  },
];
