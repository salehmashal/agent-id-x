/** Short "when this matters for agents" notes for adjacent DID/VC/etc. pages. */
export const agentAdjacentNotes: Record<string, string> = {
  "openid-federation":
    "When this matters for agents: if your agents must be accepted as OIDC clients across a national or campus federation without per-AS portals. Cross-org agent identity more often uses WIMSE, SPIFFE federation, or DID/VC. AAuth four-party mode is a different federation (PS to resource AS) — do not conflate them.",
  ssf: "When this matters for agents: an agent holding a delegated token after the user is fired, phished, or offboarded is a standing incident. SSF is how the IdP tells the agent platform to drop the session. Not an identity protocol for the agent itself.",
  caep: "When this matters for agents: CAEP is how you implement 'kill the agent' as a protocol (session-revoked, credential-change), including for robotic users. It does not issue tokens; it tells you to stop trusting ones you already have.",
  "oidc-ida":
    "When this matters for agents: only when policy is 'this agent may file a tax return only for a KYC'd user'. Most coding agents do not need Identity Assurance on day one. A display name on a GitHub account is not IDA.",
  openid4vp:
    "When this matters for agents: an agent acting as a verifier (checking a supplier's credential) or presenting an organizational VC as its identity. Cross-org agent-identity CGs often assume this stack. It is not how MCP HTTP authorizes tool calls.",
  openid4vci:
    "When this matters for agents: if your org issues an 'this agent is owned by Acme' credential, OpenID4VCI is the likely issuance protocol, with OpenID4VP for presentation. The OAuth access token at the credential endpoint is not the VC.",
  "sd-jwt-vc":
    "When this matters for agents: likely credential format if you bind an agent to an organization with selective disclosure (show role, hide home address). In Last Call as of 15 September 2026 targeting Proposed Standard — confirm datatracker before citing as an RFC. Not an OAuth access token.",
  gnap: "When this matters for agents: greenfield authorization with key-bound clients and negotiated grants. GNAP is a completed IETF alternative to OAuth (RFC 9635), not wire-compatible. In practice MCP and most SaaS APIs chose OAuth 2.1, so GNAP is adjacent rather than the default. AAuth occupies some of the same 'key-bound HTTP client' space with JWT vocabulary.",
  "gnap-rs":
    "When this matters for agents: only if you are actually deploying GNAP. Completes the GNAP picture the way RFC 9728 completes OAuth's. Skip it on an OAuth/MCP path.",
  "did-core":
    "When this matters for agents: some designs give each agent a DID instead of (or in addition to) an OAuth client_id or AAuth identifier. Resolution and key rotation become your problem. DID 1.1 drafts in 2026 are experimental — implement DID Core 1.0. This is not AAuth two-party mode and not A2A.",
  "vc-data-model":
    "When this matters for agents: natural format for 'Acme attests that agent X may operate in production until date Y', presented to a relying tool. A VC is not an OAuth access token. OpenID4VCI/VP move VCs over OAuth rails.",
  "did-peer":
    "When this matters for agents: one of the things people mean by 'p2p identity', especially in SSI communities. Pairwise, not globally resolvable. Useful when two agents want a private relationship without publishing a JWKS. Poor fit for open-world HTTP APIs that must verify a stranger's first request. Not AAuth two-party mode and not A2A.",
  didcomm:
    "When this matters for agents: if your 'p2p agent auth' conversation comes from digital-wallet people, they mean DIDComm (authcrypt/anoncrypt messaging). DIDComm 'agents' predate LLM agents. No interop with A2A or MCP is implied. Different stack, different problem.",
  "agent-identity-cg":
    "When this matters for agents: shows that 'agent identity' is being pursued in W3C as well as IETF, from a DID/VC angle, with planned MCP/A2A/OAuth/SPIFFE profiles. Community Group ≠ Recommendation. Watch for drafts before implementing. Overlaps AAuth/WIMSE problem space.",
};
