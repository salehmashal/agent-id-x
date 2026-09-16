export const mentalModel = {
  asOf: "15 September 2026",
  identities: [
    {
      name: "User / person / resource owner",
      question: "Which human (or organization) is this for?",
      proveWith:
        "OpenID Connect (ID Token, UserInfo), AAuth person/auth tokens from a person server, sometimes a Verifiable Credential.",
      notTheSameAs:
        "The agent process. Putting the user into a SPIFFE ID or using an ID Token as an access token collapses this distinction.",
    },
    {
      name: "Agent instance",
      question: "Which running agent is calling?",
      proveWith:
        "AAuth agent token + HTTP Message Signatures; or an OAuth client_id (per AS); or CIMD URL; or a DID.",
      notTheSameAs:
        "The model vendor, the laptop, or the user. AAuth exists because client_id is not a portable agent identity.",
    },
    {
      name: "Workload",
      question: "Which binary / service account in which trust domain?",
      proveWith:
        "SPIFFE SVID or WIMSE WIT/WIC with WPT, HTTP signatures, or mTLS. Identifier like spiffe:// or wimse://.",
      notTheSameAs:
        "The user. A workload identity answers 'payment-api in prod', not 'Alice'.",
    },
    {
      name: "Tool / resource",
      question: "Which API is being called, and who protects it?",
      proveWith:
        "Canonical resource URI (RFC 8707), Protected Resource Metadata (RFC 9728), A2A Agent Card, AAuth resource metadata.",
      notTheSameAs:
        "The authorization server. Mixing them is how mix-up and token-replay bugs start.",
    },
  ],
  authentication: {
    summary:
      "Authentication is proving those identities. Different proofs for different principals, often on the same HTTP call.",
    mechanisms: [
      {
        principal: "User",
        proofs: [
          "OIDC authorization-code or CIBA",
          "Step-up (RFC 9470) when the existing auth is too weak or stale",
        ],
      },
      {
        principal: "Agent as OAuth client",
        proofs: [
          "PKCE on the code exchange",
          "private_key_jwt / mTLS / SPIFFE client auth",
          "DPoP on later API calls",
        ],
      },
      {
        principal: "Agent as AAuth client",
        proofs: [
          "RFC 9421 signatures covering method, authority, path, Signature-Key",
          "Agent token in Signature-Key with cnf-bound key",
        ],
      },
      {
        principal: "Workload",
        proofs: ["mTLS with X.509-SVID / WIC", "WIT + WPT", "WIT + HTTP signatures"],
      },
    ],
  },
  authorization: {
    summary:
      "Authorization is what the agent may do: grants, constraints, attenuation, and human approval.",
    mechanisms: [
      {
        name: "OAuth grants",
        detail:
          "Authorization code (user-delegated), client credentials (agent on its own behalf), token exchange (on-behalf-of / attenuation), CIBA (async user approval).",
      },
      {
        name: "Constraints",
        detail:
          "Scopes, RAR authorization_details, RFC 8707 audiences, DPoP/mTLS binding, FAPI 2.0 profile, AAuth R3 operations including per-call.",
      },
      {
        name: "Delegation chains",
        detail:
          "RFC 8693 act, identity chaining (8693+7523) across domains, XAA/ID-JAG for IdP-brokered SaaS, transaction tokens inside a domain, WIMSE hop re-binding.",
      },
      {
        name: "Human in the loop",
        detail:
          "Interactive consent, CIBA, RFC 9470 step-up, AAuth missions and interaction relay, enterprise policy (XAA) that sometimes removes the prompt on purpose.",
      },
      {
        name: "Revocation / staleness",
        detail:
          "Short-lived tokens, refresh rotation, SSF/CAEP events (session-revoked, credential-change), SPIFFE rotation instead of CRL-as-primary.",
      },
    ],
  },
  nesting: [
    {
      layer: "Foundation",
      items:
        "OAuth 2.0/2.1, RFC 9700, PKCE, OIDC, JWT, AS metadata, Protected Resource Metadata, Resource Indicators, JWT access tokens.",
    },
    {
      layer: "Hardening",
      items:
        "PAR, RAR, JAR, DPoP, mTLS, FAPI 2.0, RFC 9207, RFC 9470, CIMD, RFC 10017 / 8252.",
    },
    {
      layer: "Chaining for agents",
      items:
        "RFC 8693 Token Exchange, RFC 7523, identity chaining (RFC Editor queue), XAA, transaction tokens, agent-grant profiles.",
    },
    {
      layer: "Workload identity",
      items: "SPIFFE/SPIRE, WIMSE architecture/credentials/WPT, SPIFFE OAuth client auth.",
    },
    {
      layer: "Agent-native drafts",
      items:
        "AAuth + HTTP Signature Keys + R3, AIMS BCP, WIMSE-for-agents individual draft, AAP profiles.",
    },
    {
      layer: "Application protocols",
      items:
        "MCP authorization (OAuth 2.1 profile), A2A v1.0 (AAIF), GNAP (parallel IETF authz protocol).",
    },
    {
      layer: "Decentralized adjacent",
      items: "W3C DID/VC, OpenID4VP/VCI, did:peer, DIDComm, W3C Agent Identity CG.",
    },
  ],
  honestStatus: [
    {
      kind: "Stable enough to ship",
      examples:
        "RFC 6749 family as constrained by RFC 9700; OIDC Core; PKCE; PAR; DPoP; mTLS; RFC 9068; RFC 8693; RFC 9728; RFC 9421; GNAP RFCs; FAPI 2.0; CIBA; SSF/CAEP; MCP-over-OAuth as a protocol (while its cited OAuth 2.1 revision lags).",
    },
    {
      kind: "Late-stage drafts",
      examples:
        "OAuth 2.1 (WG, Dec 2026 IESG milestone), identity chaining (RFC Editor queue), transaction tokens (write-up), SD-JWT VC (Last Call as of 15 Sep 2026), CIMD, WIMSE suite.",
    },
    {
      kind: "Individual drafts — expect churn",
      examples:
        "AAuth (draft-10 vs editor's five-mode copy), HTTP Signature Keys, AAuth R3, AIMS, agent-grants, AAP, WIMSE AI-agent identity.",
    },
    {
      kind: "Vendor / foundation protocols",
      examples:
        "MCP specification, A2A v1.0 under AAIF/Linux Foundation, SPIFFE, DIDComm, did:peer. These are real and deployed; they are not RFCs.",
    },
  ],
};

export const landscapeNotes = {
  aauth:
    "AAuth is draft-hardt-oauth-aauth-protocol (rev 10, 6 August 2026), an individual IETF Internet-Draft by Dick Hardt. It is not draft-oauth-aauth as a working-group item and it is not an RFC. It gives every HTTP client a cryptographic identity. The published snapshot defines four resource access modes (identity-based, resource-managed two-party, PS-asserted three-party, federated four-party) plus optional missions. The editor's copy (September 2026) adds a fifth mode — person-identity — and aa-person+jwt. It builds on RFC 9421 and draft-hardt-httpbis-signature-key-09. It reuses OIDC claim vocabulary and says it complements OAuth rather than replacing it.",
  p2p: "There is no current IETF RFC or WG draft whose title is simply 'P2P' in the AAuth cluster. When people list 'aauth, p2p, OIDC, OAuth 2.1' they usually mean AAuth's identity-based and two-party modes: the agent and the resource speak directly, with HTTP Message Signatures, without an authorization server in the path. Identity-based: the resource decides from the agent token alone. Two-party (resource-managed): the resource runs its own login and issues an opaque session bound to the agent's key. Separate meanings you will also hear, and must keep apart: (a) A2A agent-to-agent task protocol — Agent Cards and out-of-band HTTP auth, not AAuth signatures; (b) did:peer + DIDComm pairwise identity — not globally resolvable, not for a stranger's first HTTP call. The editor's AAuth person-identity mode is a fifth access mode that carries a user identifier without a grant — federated login, not identity-based p2p. This site labels those explicitly so they are not mashed together.",
};
