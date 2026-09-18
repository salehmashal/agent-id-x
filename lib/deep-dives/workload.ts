import type { SpecDeepDive } from "@/lib/types";

export const workloadDeepDives: Record<string, SpecDeepDive> = {
  "wimse-arch": {
    agentGap: [
      "Software executing as workloads — including AI intermediaries — needs identifiers, credentials, and security-context propagation across clouds, meshes, and administrative domains. SPIFFE solved much of this inside one trust domain; WIMSE aims at the multi-system case.",
      "Section 3.4.11 of draft-ietf-wimse-arch-08 (6 July 2026) is explicit: agentic AI systems are a special case of delegated workloads. They inherit an upstream principal's security context and MUST NOT silently widen it. Agent-to-agent hops MUST re-bind and scope context at each hop or a chain of AI-to-AI interactions can extend authority far beyond what was originally granted.",
      "If the agent is a workload in your mesh, WIMSE/SPIFFE is its identity. OAuth then answers what it may do for a user. AAuth argues WIMSE/SPIFFE do not help an agent across org boundaries without extra work — both views are about different deployment scopes.",
    ],
    trustBoundaries: [
      "A workload identifier is unique within a trust domain. Trust anchors for that domain are distributed out of band — you do not fetch them from a URL found only inside a token. Identity servers issue credentials. Relying workloads verify. Upstream principals (users or services) are a different name; stuffing the user into the workload URI collapses the architecture.",
      "AI intermediaries act as both delegated workload and, when they call other agents, as delegators. Each hop is a trust-boundary crossing even inside one cluster.",
    ],
    mechanics: [
      "Informational WG architecture, not a protocol RFC. A workload is provisioned with a Workload Identifier and credentials (WIT and/or WIC). It authenticates to peers with mTLS, WPT, or HTTP Message Signatures. When acting as a delegate, it propagates upstream security context (Txn-Tokens, OAuth tokens in their own headers) and re-binds/scopes it at each hop. Companion drafts: identifier, workload-creds, WPT.",
    ],
    claims: [
      {
        name: "Workload Identifier",
        meaning:
          "Quoted direction: URI unique within a trust domain; see draft-ietf-wimse-identifier. SPIFFE IDs conform.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "provision",
        title: "Provision then prove",
        steps: [
          "Platform/agent attests the workload to an identity server (SPIRE-like or otherwise).",
          "Workload receives WIT and/or WIC bound to one identifier and a key.",
          "Calling a peer: mTLS with WIC, or WIT + WPT, or WIT + HTTP signatures. Never WIT as bearer.",
          "If serving a user: also propagate OAuth/Txn-Token context in its own header. Re-scope before calling another agent.",
        ],
      },
    ],
    layerDetail: [
      "Primarily identity of the workload, plus how authentication protocols and authorization context (including delegation) should compose. Authorization decisions remain policy/OAuth/AAP. User identity remains OIDC/sub in a context token.",
    ],
    composition: [
      { specSlug: "wimse-creds", how: "WIT/WIC formats." },
      { specSlug: "wimse-wpt", how: "Application-layer PoP for WIT." },
      { specSlug: "spiffe", how: "Production-proven subset WIMSE generalizes." },
      { specSlug: "oauth-2-1", how: "User/delegation layer beside workload identity." },
      { specSlug: "transaction-tokens", how: "Immutable purpose across hops inside a domain." },
      { specSlug: "aauth", how: "Open-world HTTP identity vs multi-system workload identity. An agent can hold both." },
      { specSlug: "aims", how: "AIMS tells you to use WIMSE for agent-as-workload authentication." },
    ],
    pitfalls: [
      {
        title: "Silent widening on agent hops",
        body: "The architecture's AI section is a warning, not optional colour. Re-bind context every hop.",
      },
      {
        title: "User in the SPIFFE ID",
        body: "One identifier per credential. Alice is not a workload path.",
      },
      {
        title: "WIT as Bearer",
        body: "Forbidden by the credential draft. If you put WIT in Authorization: Bearer you have undone PoP.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-wimse-arch-08, 6 July 2026, expires 7 January 2027, informational WG architecture. Authors: J. Salowey, Y. Rosomakho, H. Tschofenig. https://datatracker.ietf.org/doc/draft-ietf-wimse-arch/. Use it as a design map; implement the credential/WPT drafts and/or SPIFFE for wire.",
    ],
  },
  "wimse-identifier": {
    agentGap: [
      "Need a canonical URI for a workload that can go into X.509 SANs and JWT sub values, interoperable with SPIFFE IDs. Gives the agent a stable name that is not a hostname and not an OAuth client_id.",
    ],
    trustBoundaries: [
      "The identifier is unique within a trust domain (the URI authority). Path semantics are deployment-specific. One identifier per credential — do not stuff both a user and a workload into a single URI.",
    ],
    mechanics: [
      "draft-ietf-wimse-identifier-03 still current when fetched 15 September 2026. Absolute URI with a non-empty authority (trust domain). SPIFFE IDs are a conforming scheme. WIMSE also defines wimse://<trust-domain>/<path>.",
    ],
    claims: [
      {
        name: "wimse://trust.example.com/service/payment",
        meaning:
          "Illustrative identifier. Path semantics are deployment-specific. SPIFFE form is equally valid.",
        source: "illustrative",
      },
    ],
    flows: [
      {
        id: "assign",
        title: "Assign an identifier",
        steps: [
          "Pick a trust domain you control (DNS name or SPIFFE trust domain).",
          "Assign a path that names the workload (service, not instance, unless policy wants instances).",
          "Embed that one URI in WIT sub or WIC SAN. Issue credentials from the identity server.",
        ],
      },
    ],
    layerDetail: [
      "Identifier syntax only. Credentials and proofs are separate drafts. Not authorization.",
    ],
    composition: [
      { specSlug: "wimse-arch", how: "Architecture uses this identifier." },
      { specSlug: "wimse-creds", how: "WIT sub / WIC SAN." },
      { specSlug: "spiffe", how: "spiffe:// URIs conform." },
    ],
    pitfalls: [
      {
        title: "Two names in one credential",
        body: "The creds draft forbids encoding a second workload identifier in the same WIT/WIC. Use jti or other claims for instance correlation.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-wimse-identifier-03, WG document. HTML: https://datatracker.ietf.org/doc/html/draft-ietf-wimse-identifier",
    ],
  },
  "wimse-creds": {
    agentGap: [
      "Bind a public key to a workload identifier in a credential that must not be used as a bearer token. This is the 'agent identity document' in the WIMSE world, analogous to AAuth's agent token but scoped to workload trust domains that share configured trust anchors.",
    ],
    trustBoundaries: [
      "Trust anchors for a trust domain are configured out of band. The iss claim MUST NOT be used to look up trust anchors from information carried only in the token (no 'fetch JWKS from whatever iss says'). Validators use the trust domain in sub. That is stricter than typical OAuth AS JWKS discovery — on purpose.",
    ],
    mechanics: [
      "draft-ietf-wimse-workload-creds-02, 2 July 2026. Workload Identity Token: JWS JWT, typ wit+jwt, sub = identifier, exp (hours-scale), cnf.jwk with alg (ES256 MUST be supported; none and symmetric/encryption algs forbidden). Conveyed in Workload-Identity-Token header — not Authorization. Workload Identity Certificate: X.509 with a single URI SAN, SPIFFE-compatible. Authors include B. Campbell, J. Salowey, A. Schwenkschuster, Y. Sheffer, Y. Rosomakho.",
    ],
    claims: [
      {
        name: "typ: wit+jwt",
        meaning: "Quoted: explicit typing per RFC 8725.",
        source: "quoted",
      },
      {
        name: "cnf.jwk + alg",
        meaning:
          "Quoted: public key of the workload. Proof of that key is mandatory. MUST NOT be used as a bearer token; not intended for Authorization.",
        source: "quoted",
      },
      {
        name: "Workload-Identity-Token header",
        meaning: "Quoted HTTP field for presenting a WIT.",
        source: "quoted",
      },
      {
        name: "WIC (X.509)",
        meaning: "Quoted: transport-layer identity certificate; URI SAN.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "wit-issue",
        title: "Issue and present a WIT",
        steps: [
          "Identity server mints wit+jwt with sub, cnf.jwk, exp on the order of hours.",
          "Workload presents Workload-Identity-Token plus a WPT (or HTTP signature) proving cnf.",
          "Recipient validates against configured trust anchors for the trust domain in sub, then the proof.",
          "On WIT validation failure, prefer HTTP 400 with problem details, not 401 Bearer — 401's WWW-Authenticate/Authorization pairing is not how WIT works.",
        ],
      },
    ],
    layerDetail: [
      "Identity credential. Proof-of-possession is specified in companion drafts (WPT, HTTP signature, mTLS). Authorization context (Txn-Tokens, OAuth) rides in other headers.",
    ],
    composition: [
      { specSlug: "wimse-wpt", how: "Application-layer PoP." },
      { specSlug: "spiffe", how: "WIC aligns with X509-SVID practice." },
      { specSlug: "jwt", how: "WIT is a typed JWT profile." },
      { specSlug: "transaction-tokens", how: "Explicitly allowed alongside WIT; different header." },
      { specSlug: "aauth", how: "Similar 'JWT + key + not bearer' idea; different typ, discovery, and trust-anchor story." },
    ],
    pitfalls: [
      {
        title: "JWKS from iss",
        body: "Forbidden as the sole trust source. Configure anchors per trust domain.",
      },
      {
        title: "Authorization: Bearer WIT",
        body: "The draft says not intended for Authorization and MUST NOT be used as bearer. Use WPT's Authorization: WPT scheme instead.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-wimse-workload-creds-02, 2 July 2026, expires 3 January 2027, standards-track WG. https://datatracker.ietf.org/doc/html/draft-ietf-wimse-workload-creds-02",
    ],
  },
  "wimse-wpt": {
    agentGap: [
      "A WIT must not be sent as a bearer token. WPT is a signed JWT proving possession of the WIT's private key for a specific HTTP request — closest WIMSE analogue to DPoP, for workload-to-workload calls including agent-to-tool inside the trust domain.",
    ],
    trustBoundaries: [
      "Caller proves the WIT key. Callee verifies WIT then WPT. A bearer token in the same Authorization header MUST NOT be used to authenticate the calling workload — that would reduce the request to its weakest credential. User/context tokens stay in other headers (Txn-Token) and can be bound via tth/oth.",
    ],
    mechanics: [
      "draft-ietf-wimse-wpt-02, 27 August 2026, B. Campbell and A. Schwenkschuster. WPT in Authorization using the WPT HTTP authentication scheme. typ wpt+jwt (media type application/wpt+jwt). alg MUST match the WIT cnf.jwk alg. Claims include aud, WIT hash wth (base64url SHA-256 of the WIT), plus optional binding hashes for other tokens. Replaces earlier draft-ietf-wimse-s2s-protocol packaging. HTTP Message Signatures over WIT are a sibling mechanism, out of this document's scope.",
    ],
    claims: [
      {
        name: "Authorization: WPT",
        meaning: "Quoted HTTP authentication scheme carrying the proof JWT.",
        source: "quoted",
      },
      {
        name: "typ: wpt+jwt / wth",
        meaning:
          "Quoted: explicit type; wth is the hash of the WIT so the proof and credential cannot be mixed.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "wpt",
        title: "WIT + WPT on an HTTP call",
        steps: [
          "Caller sends Workload-Identity-Token and Authorization: WPT <jwt>.",
          "Callee validates WIT (trust anchors, exp, cnf).",
          "Callee checks WPT typ, alg match, signature with WIT's cnf key, wth matches this WIT, aud/time bindings.",
          "Authorization policy uses workload identity from WIT plus any Txn-Token context — not a sibling Bearer token.",
        ],
      },
    ],
    layerDetail: [
      "Authentication / proof-of-possession at the application layer. Identity is the WIT. Authorization is policy on that identity plus context tokens.",
    ],
    composition: [
      { specSlug: "wimse-creds", how: "WIT is the credential WPT proves." },
      { specSlug: "dpop", how: "Same job in OAuth-land; different headers and hashes." },
      { specSlug: "http-message-signatures", how: "Alternative WIMSE PoP." },
      { specSlug: "transaction-tokens", how: "Bind with tth so context cannot be swapped." },
    ],
    pitfalls: [
      {
        title: "Bearer + WPT on one request",
        body: "The draft forbids using a bearer token to authenticate the caller when WPT is present. Honouring both undoes PoP.",
      },
      {
        title: "Replay inside the WPT lifetime",
        body: "Short-lived proofs; still capture-and-replay at intermediaries. Mitigations in the security considerations (audience, txn binding, short exp).",
      },
    ],
    stabilityDetail: [
      "draft-ietf-wimse-wpt-02, 27 August 2026, expires 28 February 2027, standards-track WG. https://datatracker.ietf.org/doc/draft-ietf-wimse-wpt/",
    ],
  },
  aims: {
    agentGap: [
      "The industry is reinventing agent auth in incompatible silos. draft-ietf-wimse-aims-00 (15 September 2026) — adopted by the WIMSE WG, replacing individual draft-klrc-aiagent-auth-03 — does not define a new protocol. It maps existing IETF/OIDF/CNCF work onto agent needs and names the functional gaps. Read this before inventing an 'agent auth standard' — it will tell you which existing RFC you are duplicating.",
      "Complementary to AAuth: AIMS says compose the old tools; AAuth says the old tools are insufficient for open-world HTTP clients. Both can be true in different deployments.",
    ],
    trustBoundaries: [
      "Agents are modeled as workloads that call LLMs and tools. Users/systems are upstream principals. AIMS is a conceptual Agent Identity Management System covering identifiers, credentials, provisioning, authentication, authorization, observability, policy, and compliance — not a wire protocol with its own tokens.",
    ],
    mechanics: [
      "Guidance, not endpoints: use WIMSE/SPIFFE for agent-as-workload authentication; use OAuth 2.0 for delegated or autonomous authorization (authorization code for user delegation, client credentials or JWT grants for autonomous agents); use identity chaining across domains; avoid API keys as the primary credential. Authors: P. Kasselman, J. Lombardo, Y. Rosomakho, B. Campbell, N. Steele, A. Parecki. Presented in WIMSE meetings (IETF 126).",
    ],
    claims: [],
    flows: [
      {
        id: "aims-map",
        title: "AIMS decision path (not a wire flow)",
        steps: [
          "Identify the principal: user, agent instance, workload, resource — separately.",
          "If the caller is a workload in your systems: WIMSE/SPIFFE (WIT+WPT or mTLS).",
          "If the call is on behalf of a user: OAuth 2.1 authorization code / CIBA / XAA, audience-restricted, preferably PoP.",
          "If crossing domains: identity chaining (8693+7523), not a copied access token.",
          "If inside a domain fan-out: transaction tokens for purpose. Observe and revoke via SSF/CAEP where sessions go stale.",
        ],
      },
    ],
    layerDetail: [
      "A map across identity, authentication, and authorization. It does not mint tokens. It tells you which RFC's tokens to use for which agent problem.",
    ],
    composition: [
      { specSlug: "wimse-arch", how: "Agent-as-workload identity." },
      { specSlug: "oauth-2-0", how: "Delegated and autonomous grants." },
      { specSlug: "token-exchange", how: "OBO and attenuation." },
      { specSlug: "transaction-tokens", how: "Internal call-chain context." },
      { specSlug: "spiffe", how: "Deployed workload identity." },
      { specSlug: "aauth", how: "Competing 'we need a new protocol' thesis. Compare honestly." },
    ],
    pitfalls: [
      {
        title: "Treating AIMS as a protocol",
        body: "There is no AIMS token type. If a vendor sells 'AIMS-compliant tokens', ask which RFC they mean.",
      },
      {
        title: "API keys anyway",
        body: "The draft's point is to stop using API keys as the primary agent credential. If you still ship them, you skipped the BCP.",
      },
    ],
    stabilityDetail: [
      "draft-ietf-wimse-aims-00, 15 September 2026, expires 19 March 2027, WIMSE WG informational. Replaces draft-klrc-aiagent-auth-03. https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/. Use as a reading list, not as a wire spec.",
    ],
  },
  spiffe: {
    agentGap: [
      "Workloads need automatically provisioned, short-lived cryptographic identities without bootstrap secrets, attested from platform properties (Kubernetes service account, Unix process, …). If the agent is deployed as a service, SPIFFE is how you stop putting API keys in env vars. It does not, by itself, express 'this call is on behalf of Alice'.",
    ],
    trustBoundaries: [
      "SPIRE server is the identity issuer for a trust domain. SPIRE agents attest workloads and issue SVIDs via the Workload API (often a Unix socket). Trust bundles distribute federation. JWT-SVIDs are bearer-ish unless combined with extra PoP — prefer X.509 mTLS or WPT-style proofs for agents.",
    ],
    mechanics: [
      "Not an IETF RFC. CNCF. SPIFFE ID: spiffe://<trust-domain>/<path> — a WIMSE-conforming identifier. X.509-SVID for mTLS; JWT-SVID for app-layer. Rotation replaces revocation as the primary control. Federation via trust bundles, not OAuth DCR.",
    ],
    claims: [
      {
        name: "SPIFFE ID",
        meaning:
          "Quoted shape: spiffe://<trust-domain>/<path> — a WIMSE-conforming identifier.",
        source: "quoted",
      },
      {
        name: "X.509-SVID / JWT-SVID",
        meaning:
          "Quoted credential types. Short-lived; rotation replaces revocation.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "spire",
        title: "SPIRE issues an SVID",
        steps: [
          "SPIRE agent attests the workload via platform selectors.",
          "Workload API (Unix socket) returns X.509-SVID or JWT-SVID plus trust bundle.",
          "Workload uses X.509 for mTLS to a tool, or presents JWT-SVID with additional PoP if app-layer.",
          "If also acting for a user, obtain an OAuth token separately and send both.",
        ],
      },
    ],
    layerDetail: [
      "Workload identity and authentication. Authorization is OPA/policy/OAuth on top. User identity is not in the SVID.",
    ],
    composition: [
      { specSlug: "wimse-arch", how: "IETF generalization of multi-system aspects." },
      { specSlug: "wimse-creds", how: "WIT/WIC align with SVID practice." },
      { specSlug: "spiffe-client-auth", how: "How the SVID authenticates to an OAuth AS." },
      { specSlug: "mtls", how: "Certificate-bound OAuth tokens on top of X.509-SVID." },
      { specSlug: "aims", how: "Recommended agent-as-workload identity." },
    ],
    pitfalls: [
      {
        title: "JWT-SVID as a standing Bearer",
        body: "Treat it like a stolen-able token unless you add PoP. Prefer mTLS.",
      },
      {
        title: "No user in the ID",
        body: "A stolen user OAuth token presented by a different binary is a different incident — keep workload identity even when you have OAuth.",
      },
    ],
    stabilityDetail: [
      "CNCF protocol, production-proven, not an RFC. https://spiffe.io/ WIMSE is the IETF track for multi-system pieces.",
    ],
  },
  "agent-grants": {
    agentGap: [
      "AI agents invoking APIs on behalf of users need a profile: identify the agent instance, get consent, issue resource-bound sender-constrained tokens, attenuate via token exchange, rotate refresh tokens — without new JWT claims or endpoints. If your constraint is 'we will not deploy a new protocol, only profile OAuth', this is the checklist.",
      "Positions itself as a profile, not a rival to AAuth. Cross-domain hops should use identity chaining rather than private formats.",
    ],
    trustBoundaries: [
      "Agent is an OAuth client instance. User is the resource owner. AS and RS are standard. No new parties. Grantex is an incomplete reference implementation and is not required for conformance.",
    ],
    mechanics: [
      "draft-mishra-oauth-agent-grants-02, 30 August 2026 (catalog previously said only '2026'), expires 3 March 2027, author S. Kumar (Orchestrum Technologies LLP) despite the 'mishra' filename. PAR + PKCE + resource indicators + JWT access tokens + PoP + RFC 8693 attenuation with act. No new endpoints, no new JWT claims.",
    ],
    claims: [
      {
        name: "act",
        meaning:
          "Quoted reuse of RFC 8693: delegation chain when the agent is a distinct actor. This profile defines no new claims.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "profile",
        title: "OAuth-only agent grant",
        steps: [
          "Identify the agent client instance (pre-register, CIMD, or DCR).",
          "PAR + PKCE + resource=API. User consents.",
          "AS issues audience-restricted, sender-constrained at+jwt (DPoP or mTLS).",
          "Downstream hops: token exchange with nested act, attenuated scope. Never expand.",
        ],
      },
    ],
    layerDetail: [
      "Mostly authorization, using existing OAuth identity of the user plus client identity of the agent. Not a new identity system.",
    ],
    composition: [
      { specSlug: "token-exchange", how: "Attenuation and OBO." },
      { specSlug: "par", how: "Front-channel hygiene." },
      { specSlug: "pkce", how: "Code binding." },
      { specSlug: "resource-indicators", how: "Audience." },
      { specSlug: "identity-chaining", how: "Cross-domain instead of private formats." },
      { specSlug: "aauth", how: "Rival thesis: this profile stays in OAuth; AAuth does not." },
    ],
    pitfalls: [
      {
        title: "Thinking Grantex is the spec",
        body: "The draft says the reference implementation is non-normative and incomplete.",
      },
      {
        title: "Adding claims anyway",
        body: "The point of this draft is not to mint aap_* fields. If you need structured agent claims, look at AAP — and compare carefully.",
      },
    ],
    stabilityDetail: [
      "Individual informational draft-02, 30 August 2026. https://datatracker.ietf.org/doc/html/draft-mishra-oauth-agent-grants-02 Pin it. Not a WG item.",
    ],
  },
  "aap-oauth": {
    agentGap: [
      "AS/RS need structured, auditable claims about agent identity, task context, constraints, delegation chains, and human oversight — without a new protocol. Another 'profile OAuth' proposal. Compare carefully with draft-mishra-oauth-agent-grants before implementing either.",
      "Not the same document as draft-fane-opena2a-aap (OpenA2A Agent Authorization Protocol). The acronym collision is real; always cite the draft name.",
    ],
    trustBoundaries: [
      "Agent is the OAuth client; often client-credentials for M2M, plus extra claims the RS must evaluate. May integrate SPIFFE SVIDs as client auth. The RS that ignores AAP claims has unconstrained agents with extra JSON.",
    ],
    mechanics: [
      "draft-aap-oauth-profile-01, 7 February 2026, expires 11 August 2026 — as of the 15 September 2026 research date this revision appears expired without a visible -02 on datatracker. Author A. Cruz. Standard OAuth issuance; RS must evaluate AAP claims before performing operations. Claim names are defined in the draft — verify against the text, do not invent from memory.",
    ],
    claims: [
      {
        name: "AAP structured claims",
        meaning:
          "Task/context/oversight fields defined by the profile. Quoted only by reference: read the draft for names; do not copy unofficial blogs.",
        source: "illustrative",
      },
    ],
    flows: [
      {
        id: "aap",
        title: "Issue an AAP-profiled token",
        steps: [
          "Agent authenticates as an OAuth client (secret, key, or SPIFFE).",
          "AS issues a JWT that includes the AAP claim set for this task.",
          "RS validates OAuth/JWT baseline then AAP constraints (task, oversight, chain) before the operation.",
        ],
      },
    ],
    layerDetail: [
      "Authorization profile on OAuth/JWT. Client is the agent. Identity of the user is whatever OAuth already put in sub, if anything.",
    ],
    composition: [
      { specSlug: "oauth-2-0", how: "Base protocol." },
      { specSlug: "token-exchange", how: "Delegation chains." },
      { specSlug: "spiffe", how: "Optional client auth." },
      { specSlug: "aims", how: "AIMS would rather you compose RFCs than add a parallel claim dialect — compare." },
      { specSlug: "agent-grants", how: "The other OAuth profile; this one adds claims, that one refuses to." },
    ],
    pitfalls: [
      {
        title: "Expired individual draft",
        body: "draft-01 expired 11 August 2026. Confirm datatracker before implementing. Do not treat as a living standard.",
      },
      {
        title: "AAP acronym collision",
        body: "OpenA2A AAP is a different document. Cite draft-aap-oauth-profile.",
      },
    ],
    stabilityDetail: [
      "Individual draft-01, 7 February 2026, expired 11 August 2026 unless renewed. https://datatracker.ietf.org/doc/draft-aap-oauth-profile/. Do not ship as a dependency without a current revision.",
    ],
  },
  "txntokens-agents": {
    agentGap: [
      "Apply the Transaction Token model to agent call chains so task context stays immutable as agents invoke tools and other agents inside a trust domain. Helps when you already run Txn-Tokens internally and the caller is now an LLM agent instead of a microservice.",
    ],
    trustBoundaries: [
      "Same as the WG transaction-tokens draft. The WG document is the one that will likely become the RFC; this is a usage profile.",
    ],
    mechanics: [
      "draft-araut-oauth-transaction-tokens-for-agents-02, 21 May 2026. Same TTS issuance as the WG draft, with agent-specific guidance for purpose and context fields.",
    ],
    claims: [
      {
        name: "tctx / purp",
        meaning: "Quoted reuse: immutable task context and purpose.",
        source: "quoted",
      },
    ],
    flows: [
      {
        id: "agent-txn",
        title: "Agent entry issues a Txn-Token",
        steps: [
          "Agent authenticates as a workload and, if needed, as a user delegate.",
          "Requests a Txn-Token with agent-appropriate purpose/context.",
          "Tool calls inside the domain carry the Txn-Token. tctx stays immutable.",
        ],
      },
    ],
    layerDetail: [
      "Context propagation of identity and authorization purpose, not a user login protocol.",
    ],
    composition: [
      { specSlug: "transaction-tokens", how: "Parent WG document — implement that." },
      { specSlug: "aims", how: "Fits the AIMS internal-chain guidance." },
      { specSlug: "a2a", how: "Possible A2A call-chain usage; not in A2A v1.0 core." },
    ],
    pitfalls: [
      {
        title: "Implementing the profile instead of the WG draft",
        body: "When they disagree, the WG document wins.",
      },
    ],
    stabilityDetail: [
      "Individual draft-02, 21 May 2026. https://datatracker.ietf.org/doc/search/?name=transaction-tokens-for-agents",
    ],
  },
  "wimse-ai-agent": {
    agentGap: [
      "A WIMSE workload identity names the agent process but not its owner. draft-ni-wimse-ai-agent-identity-02 (28 February 2026, expires 1 September 2026) states why SPIFFE-style 'the binary is payment-api' is insufficient for 'this agent is Alice's tax bot' and proposes a dual-identity credential binding agent to owner.",
      "Useful as a problem statement more than as a wire protocol. Not a WG item. Confirmed expired 1 September 2026 and not renewed as of 18 September 2026 (still draft-02).",
    ],
    trustBoundaries: [
      "Owner keys are pre-provisioned as trust anchors. Issuance models in the draft include owner-mediated (gateway) and server-mediated (challenge-response). Authorization still needs OAuth/AAuth/policy on top.",
    ],
    mechanics: [
      "Informational individual draft, Y. Ni (Huawei). Dual-identity credential format is a proposal, not a registered JWT typ. Three issuance models described; read the draft rather than implementing from this summary.",
    ],
    claims: [
      {
        name: "dual-identity credential",
        meaning:
          "Binds agent workload identity to owner identity. Not a registered JWT typ — illustrative name from the draft's problem framing.",
        source: "illustrative",
      },
    ],
    flows: [
      {
        id: "bind-owner",
        title: "Bind agent to owner (conceptual)",
        steps: [
          "Owner authenticates to an identity server or gateway.",
          "Agent proves its workload identity.",
          "Issuer mints a credential that cryptographically binds both.",
          "Relying party verifies both names before treating the call as Alice's agent.",
        ],
      },
    ],
    layerDetail: [
      "Identity binding (agent + owner). Authentication depends on the credential's proof. Authorization is out of scope.",
    ],
    composition: [
      { specSlug: "wimse-arch", how: "Problem statement sitting on WIMSE." },
      { specSlug: "aims", how: "Same gap AIMS names: workload ≠ user." },
      { specSlug: "aauth", how: "AAuth's agent token + person/auth tokens are another binding of agent and person." },
    ],
    pitfalls: [
      {
        title: "Expired individual draft",
        body: "Expired 1 September 2026; not renewed as of 18 September 2026. Confirm datatracker before citing as current.",
      },
      {
        title: "Not a registered token type",
        body: "Do not mint production typ values from this document.",
      },
    ],
    stabilityDetail: [
      "draft-ni-wimse-ai-agent-identity-02, 28 February 2026, expired 1 September 2026 and not renewed as of 18 September 2026. Individual informational. https://datatracker.ietf.org/doc/html/draft-ni-wimse-ai-agent-identity-02",
    ],
  },
};
