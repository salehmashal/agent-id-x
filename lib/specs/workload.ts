import type { Spec } from "@/lib/types";

export const workloadSpecs: Spec[] = [
  {
    slug: "wimse-arch",
    shortName: "WIMSE architecture",
    officialName:
      "Workload Identity in a Multi System Environment (WIMSE) Architecture",
    id: "draft-ietf-wimse-arch-08",
    status: "wg-draft",
    stability: "draft",
    date: "6 July 2026",
    authors: "J. Salowey, Y. Rosomakho, H. Tschofenig",
    org: "IETF",
    layer: "identity",
    relevance: "agent-specific",
    featured: true,
    aliases: ["wimse"],
    problem:
      "Software executing as workloads — including AI intermediaries — needs a coherent architecture for identifiers, credentials, and security-context propagation across clouds, meshes, and administrative domains. SPIFFE solved much of this inside one trust domain; WIMSE aims at the multi-system case.",
    identityVsAuthnVsAuthz:
      "Primarily identity of the workload, plus how authentication protocols and authorization context (including delegation) should compose. Explicitly treats agentic AI as a delegated workload that must not silently widen authority across agent-to-agent hops.",
    actors: [
      "Workload (including an AI agent)",
      "Identity server / issuer",
      "Relying workload",
      "Upstream principal (user or service)",
    ],
    flow: "A workload is provisioned with a Workload Identifier and credentials (WIT and/or WIC). It authenticates to peers with mTLS, WPT, or HTTP Message Signatures. When acting as a delegate, it propagates upstream security context and re-binds/scopes it at each hop.",
    tokensAndClaims: [
      {
        name: "Workload Identifier",
        meaning: "URI unique within a trust domain; see draft-ietf-wimse-identifier.",
      },
    ],
    related: [
      "wimse-identifier",
      "wimse-creds",
      "wimse-wpt",
      "spiffe",
      "aims",
      "transaction-tokens",
      "aauth",
    ],
    implementerNotes:
      "WG informational architecture, not a protocol RFC yet. Section 3.4.11 (AI and ML-based intermediaries) is the paragraph to quote when someone asks 'does WIMSE cover agents?'. AAuth's own draft argues WIMSE/SPIFFE do not help an agent across org boundaries without extra work — both views are about different deployment scopes.",
    whyAgentCares:
      "If the agent is a workload in your mesh, WIMSE/SPIFFE is its identity. OAuth then answers what it may do for a user. Mixing those layers is how you get both 'which binary called us' and 'which customer they were serving'.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-wimse-arch/",
      },
    ],
  },
  {
    slug: "wimse-identifier",
    shortName: "WIMSE identifier",
    officialName: "Workload Identifier",
    id: "draft-ietf-wimse-identifier-03",
    status: "wg-draft",
    stability: "draft",
    org: "IETF",
    layer: "identity",
    relevance: "agent-specific",
    aliases: ["wimse://"],
    problem:
      "Need a canonical URI for a workload that can go into X.509 SANs and JWT sub values, interoperable with SPIFFE IDs.",
    identityVsAuthnVsAuthz: "Identifier syntax only. Credentials are a separate draft.",
    actors: ["Issuer", "Workload", "Verifier"],
    flow: "Assign an absolute URI with a non-empty authority (trust domain). SPIFFE IDs are a conforming scheme. WIMSE also defines wimse://<trust-domain>/<path>.",
    tokensAndClaims: [
      {
        name: "wimse://trust.example.com/service/payment",
        meaning: "Example identifier. Path semantics are deployment-specific.",
      },
    ],
    related: ["wimse-arch", "wimse-creds", "spiffe"],
    implementerNotes:
      "One identifier per credential. Do not stuff both a user and a workload into a single URI.",
    whyAgentCares:
      "Gives the agent a stable name that is not a hostname and not an OAuth client_id.",
    urls: [
      {
        label: "HTML of draft-03",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-wimse-identifier",
      },
    ],
  },
  {
    slug: "wimse-creds",
    shortName: "WIMSE credentials",
    officialName: "WIMSE Workload Credentials",
    id: "draft-ietf-wimse-workload-creds-02",
    status: "wg-draft",
    stability: "draft",
    date: "2 July 2026",
    org: "IETF",
    layer: "identity",
    relevance: "agent-specific",
    aliases: ["wit", "wic"],
    problem:
      "Bind a public key to a workload identifier in a credential that must not be used as a bearer token.",
    identityVsAuthnVsAuthz:
      "Identity credential. Proof-of-possession is specified in companion drafts (WPT, HTTP signature, mTLS).",
    actors: ["Identity server", "Workload", "Relying party"],
    flow: "Issuer mints a Workload Identity Token (signed JWT with sub = identifier and a bound key) and/or a Workload Identity Certificate (X.509, SPIFFE-compatible). Presentation without PoP is forbidden by architecture.",
    tokensAndClaims: [
      { name: "WIT (JWS JWT)", meaning: "Application-layer identity token; not bearer." },
      { name: "WIC (X.509)", meaning: "Transport-layer identity certificate; URI SAN." },
    ],
    related: ["wimse-wpt", "wimse-arch", "spiffe", "jwt"],
    implementerNotes:
      "WIT in sub, WIC in a single URI SAN. Aligns with X509-SVID practice.",
    whyAgentCares:
      "This is the 'agent identity document' in the WIMSE world, analogous to AAuth's agent token but scoped to workload trust domains.",
    urls: [
      {
        label: "HTML of draft-02",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-wimse-workload-creds-02",
      },
    ],
  },
  {
    slug: "wimse-wpt",
    shortName: "WIMSE WPT",
    officialName: "WIMSE Workload Proof Token",
    id: "draft-ietf-wimse-wpt-02",
    status: "wg-draft",
    stability: "draft",
    date: "27 August 2026",
    authors: "B. Campbell, A. Schwenkschuster",
    org: "IETF",
    layer: "authn",
    relevance: "agent-specific",
    aliases: ["wpt"],
    problem:
      "A WIT must not be sent as a bearer token. WPT is a signed JWT proving possession of the WIT's private key for a specific HTTP request.",
    identityVsAuthnVsAuthz: "Authentication / proof-of-possession at the application layer.",
    actors: ["Calling workload", "Called workload"],
    flow: "Caller sends WIT plus a WPT bound to the HTTP request. Callee verifies WIT, then WPT signature and bindings. Designed to compose in multi-hop chains.",
    tokensAndClaims: [
      {
        name: "WPT",
        meaning: "Request-bound proof JWT. Replaces the idea of presenting WIT alone.",
      },
    ],
    related: ["wimse-creds", "dpop", "http-message-signatures"],
    implementerNotes:
      "Replaces earlier draft-ietf-wimse-s2s-protocol packaging. Sibling draft covers HTTP Message Signatures over WIT.",
    whyAgentCares:
      "Closest WIMSE analogue to DPoP, for workload-to-workload calls including agent-to-tool inside the trust domain.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-ietf-wimse-wpt/",
      },
    ],
  },
  {
    slug: "wimse-ai-agent",
    shortName: "WIMSE for AI agents",
    officialName: "WIMSE applicability to Agentic AI (AI Agent Identity)",
    id: "draft-ni-wimse-ai-agent-identity-02",
    status: "individual-draft",
    stability: "draft",
    date: "28 February 2026 (expires 1 September 2026)",
    authors: "Y. Ni (Huawei)",
    org: "IETF",
    layer: "identity",
    relevance: "agent-specific",
    aliases: ["dual-identity credential"],
    problem:
      "A WIMSE workload identity names the agent process but not its owner. Agents that act for a human or organization need a credential that cryptographically binds agent identity to owner identity.",
    identityVsAuthnVsAuthz:
      "Identity binding (agent + owner). Authorization still needs OAuth/AAuth/policy on top.",
    actors: ["Owner", "Agent", "Issuer / identity server"],
    flow: "Three issuance models: owner-mediated (gateway), and server-mediated (challenge-response), plus a third mediation point described in the draft. Trust anchors for the owner's key are pre-provisioned.",
    tokensAndClaims: [
      {
        name: "dual-identity credential",
        meaning: "Binds agent workload identity to owner identity; format is a proposal, not a registered JWT typ.",
      },
    ],
    related: ["wimse-arch", "aims", "aauth"],
    implementerNotes:
      "Expired 1 September 2026 and was not renewed as of 18 September 2026 (still draft-02). Informational individual draft, not a WG item. Useful as a problem statement more than as a wire protocol.",
    whyAgentCares:
      "States clearly why SPIFFE-style 'the binary is payment-api' is insufficient for 'this agent is Alice's tax bot'.",
    urls: [
      {
        label: "HTML of draft-02",
        href: "https://datatracker.ietf.org/doc/html/draft-ni-wimse-ai-agent-identity-02",
      },
    ],
  },
  {
    slug: "aims",
    shortName: "AIMS (agent auth BCP)",
    officialName: "AI Identity Management System",
    id: "draft-ietf-wimse-aims-00",
    status: "wg-draft",
    stability: "draft",
    date: "15 September 2026",
    authors:
      "P. Kasselman, J. Lombardo, Y. Rosomakho, B. Campbell, N. Steele, A. Parecki",
    org: "IETF",
    layer: "mixed",
    relevance: "agent-specific",
    featured: true,
    aliases: [
      "aims",
      "agent identity management system",
      "draft-klrc-aiagent-auth",
      "klrc",
    ],
    problem:
      "The industry is reinventing agent auth in incompatible silos. This draft does not define a new protocol. It maps existing IETF/OIDF/CNCF work onto agent needs and names the functional gaps.",
    identityVsAuthnVsAuthz:
      "A conceptual Agent Identity Management System covering identifiers, credentials, provisioning, authentication, authorization, observability, policy, and compliance. Agents are modeled as workloads that call LLMs and tools.",
    actors: ["User or system", "Agent", "LLM", "Tools / resources", "AIMS components"],
    flow: "Not a wire flow. Guidance: use WIMSE/SPIFFE for agent-as-workload authentication; use OAuth 2.0 for delegated or autonomous authorization (authorization code for user delegation, client credentials or JWT grants for autonomous agents); use identity chaining across domains; avoid API keys as the primary credential.",
    tokensAndClaims: [],
    related: [
      "wimse-arch",
      "oauth-2-0",
      "token-exchange",
      "transaction-tokens",
      "spiffe",
      "aauth",
    ],
    implementerNotes:
      "WIMSE working-group draft as of 15 September 2026 (replaces individual draft-klrc-aiagent-auth-03). Informational BCP-style map — still not a protocol RFC and it still does not mint an 'AIMS token'. Read this before inventing an agent-auth standard; it will tell you which existing RFC you are duplicating.",
    whyAgentCares:
      "Best current map of 'use this RFC for that agent problem'. Complementary to AAuth: AIMS says compose the old tools; AAuth says the old tools are insufficient for open-world HTTP clients.",
    urls: [
      {
        label: "Datatracker (WIMSE WG)",
        href: "https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/",
      },
      {
        label: "HTML of draft-ietf-wimse-aims-00",
        href: "https://datatracker.ietf.org/doc/html/draft-ietf-wimse-aims-00",
      },
      {
        label: "Replaced individual draft-03",
        href: "https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/",
      },
    ],
  },
  {
    slug: "spiffe",
    shortName: "SPIFFE / SPIRE",
    officialName: "Secure Production Identity Framework For Everyone",
    id: "SPIFFE (CNCF); SVIDs via SPIRE",
    status: "protocol",
    stability: "vendor-protocol",
    org: "CNCF",
    layer: "identity",
    relevance: "foundation",
    featured: true,
    aliases: ["spire", "svid"],
    problem:
      "Workloads need automatically provisioned, short-lived cryptographic identities without bootstrap secrets, attested from platform properties (Kubernetes service account, Unix process, …).",
    identityVsAuthnVsAuthz:
      "Workload identity and authentication (X.509-SVID mTLS, JWT-SVID). Authorization is OPA/policy/OAuth on top.",
    actors: ["SPIRE server", "SPIRE agent", "Workload", "Relying workload"],
    flow: "SPIRE agent attests the workload, issues an SVID via the Workload API (often a Unix socket). Workload uses X.509-SVID for mTLS or JWT-SVID for app-layer auth. Trust bundles distribute federation.",
    tokensAndClaims: [
      {
        name: "SPIFFE ID",
        meaning: "spiffe://<trust-domain>/<path> — a WIMSE-conforming identifier.",
      },
      {
        name: "X.509-SVID / JWT-SVID",
        meaning: "The actual credentials. Short-lived; rotation replaces revocation.",
      },
    ],
    related: ["wimse-arch", "wimse-creds", "spiffe-client-auth", "mtls", "aims"],
    implementerNotes:
      "Not an IETF RFC. Production-proven. WIMSE is the IETF effort to generalize multi-system aspects. JWT-SVIDs are bearer-ish unless combined with extra PoP — prefer X.509 mTLS or WPT-style proofs for agents.",
    whyAgentCares:
      "If the agent is deployed as a service, SPIFFE is how you stop putting API keys in env vars. It does not, by itself, express 'this call is on behalf of Alice'.",
    urls: [
      { label: "spiffe.io", href: "https://spiffe.io/" },
      {
        label: "SVIDs",
        href: "https://spiffe.io/docs/latest/deploying/svids/",
      },
    ],
  },
  {
    slug: "agent-grants",
    shortName: "OAuth agent grants",
    officialName: "OAuth profile for agent grants (identifying agent clients)",
    id: "draft-mishra-oauth-agent-grants-02",
    status: "individual-draft",
    stability: "draft",
    date: "30 August 2026",
    authors: "S. Kumar (Orchestrum Technologies LLP)",
    org: "IETF",
    layer: "authz",
    relevance: "agent-specific",
    aliases: ["grantex"],
    problem:
      "AI agents invoking APIs on behalf of users need a profile: identify the agent instance, get consent, issue resource-bound sender-constrained tokens, attenuate via token exchange, rotate refresh tokens — without new JWT claims or endpoints.",
    identityVsAuthnVsAuthz:
      "Mostly authorization, using existing OAuth identity of the user plus client identity of the agent.",
    actors: ["Agent client instance", "User", "Authorization server", "Resource server"],
    flow: "PAR + PKCE + resource indicators + JWT access tokens + PoP + RFC 8693 attenuation with act. No new endpoints.",
    tokensAndClaims: [
      {
        name: "act",
        meaning: "Delegation chain when the agent is a distinct actor.",
      },
    ],
    related: ["token-exchange", "par", "pkce", "resource-indicators", "identity-chaining"],
    implementerNotes:
      "Individual draft. Positions itself as a profile, not a rival protocol to AAuth. Cross-domain hops should use identity chaining rather than private formats. Reference implementation 'Grantex' is explicitly non-normative.",
    whyAgentCares:
      "If your constraint is 'we will not deploy a new protocol, only profile OAuth', this is the checklist.",
    urls: [
      {
        label: "HTML of draft-02",
        href: "https://datatracker.ietf.org/doc/html/draft-mishra-oauth-agent-grants-02",
      },
    ],
  },
  {
    slug: "aap-oauth",
    shortName: "AAP (OAuth profile)",
    officialName: "Agent Authorization Profile (AAP) for OAuth 2.0",
    id: "draft-aap-oauth-profile-01",
    status: "individual-draft",
    stability: "draft",
    org: "IETF",
    layer: "authz",
    relevance: "agent-specific",
    date: "7 February 2026 (draft-01 expired 11 August 2026)",
    authors: "A. Cruz",
    aliases: ["agent authorization profile"],
    problem:
      "AS/RS need structured, auditable claims about agent identity, task context, constraints, delegation chains, and human oversight — without a new protocol.",
    identityVsAuthnVsAuthz:
      "Authorization profile on OAuth/JWT. Client is the agent; often client-credentials for M2M, plus extra claims.",
    actors: ["Agent (OAuth client)", "Authorization server", "Resource server"],
    flow: "Standard OAuth issuance; RS must evaluate AAP claims before performing operations. May integrate SPIFFE SVIDs as client auth.",
    tokensAndClaims: [
      {
        name: "AAP structured claims",
        meaning:
          "Task/context/oversight fields defined by the profile — verify against the draft, do not invent names from memory.",
      },
    ],
    related: ["oauth-2-0", "token-exchange", "spiffe", "aims"],
    implementerNotes:
      "Not the same document as draft-fane-opena2a-aap (OpenA2A Agent Authorization Protocol), which is a brokered capability-grant protocol. The acronym collision is real; always cite the draft name. Draft-01 expired 11 August 2026 — confirm datatracker for a renewal before implementing.",
    whyAgentCares:
      "Another 'profile OAuth' proposal. Compare carefully with draft-mishra-oauth-agent-grants before implementing either.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-aap-oauth-profile/",
      },
    ],
  },
  {
    slug: "txntokens-agents",
    shortName: "Txn-Tokens for agents",
    officialName: "Transaction Tokens For Agents",
    id: "draft-araut-oauth-transaction-tokens-for-agents-02",
    status: "individual-draft",
    stability: "draft",
    date: "21 May 2026",
    org: "IETF",
    layer: "mixed",
    relevance: "agent-specific",
    aliases: [],
    problem:
      "Apply the Transaction Token model to agent call chains so task context stays immutable as agents invoke tools and other agents inside a trust domain.",
    identityVsAuthnVsAuthz:
      "Context propagation of identity and authorization purpose, not a user login protocol.",
    actors: ["Agent workloads", "Transaction Token Service", "Tools"],
    flow: "Same TTS issuance as the WG transaction-tokens draft, with agent-specific guidance for purpose and context fields.",
    tokensAndClaims: [
      { name: "tctx / purp", meaning: "Immutable task context and purpose." },
    ],
    related: ["transaction-tokens", "aims", "a2a"],
    implementerNotes:
      "Individual draft. The WG document is the one that will likely become the RFC; this is a usage profile.",
    whyAgentCares:
      "Helps when you already run Txn-Tokens internally and the caller is now an LLM agent instead of a microservice.",
    urls: [
      {
        label: "Datatracker search",
        href: "https://datatracker.ietf.org/doc/search/?name=transaction-tokens-for-agents",
      },
    ],
  },
];
