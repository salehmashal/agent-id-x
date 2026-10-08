import type { Spec } from "@/lib/types";

export const aauthSpecs: Spec[] = [
  {
    slug: "aauth",
    shortName: "AAuth",
    officialName: "AAuth Protocol",
    id: "draft-hardt-oauth-aauth-protocol-11",
    status: "individual-draft",
    stability: "draft",
    date: "25 September 2026",
    authors: "D. Hardt (Hellō)",
    org: "IETF",
    layer: "mixed",
    relevance: "agent-specific",
    featured: true,
    aliases: ["aauth protocol", "agent authorization", "draft-hardt-oauth-aauth", "p2p"],
    problem:
      "OAuth 2.0 and OpenID Connect assume pre-registered clients, browser redirects, bearer tokens, and static scopes. Agents discover resources at runtime, need their own cryptographic identity (not just a client_id minted by each AS), must prove possession of a key on every call, and often need mid-task human governance that cannot be reduced to a scope string.",
    identityVsAuthnVsAuthz:
      "All three. Agent tokens are identity (who the agent is). HTTP Message Signatures are authentication (proof of the key). Auth tokens, resource tokens, missions, and R3 grants are authorization (what it may do, for whom). AAuth complements OAuth/OIDC rather than claiming to obsolete them.",
    actors: [
      "Agent (any HTTP client with a key and agent token)",
      "Agent provider (issues the agent token, hosts JWKS)",
      "Resource",
      "Person server (PS) — optional user representative",
      "Access server (AS) — optional resource-side policy engine",
      "User / person",
    ],
    flow:
      "Agent identity (the figure is still titled Identity-Based Access; this is the AAuth meaning of p2p): the agent signs the HTTP request with its agent token in Signature-Key (scheme=jwt). The resource verifies the RFC 9421 signature and the JWT, then applies local policy — no token exchange, no PS, no AS. Resource-managed (two-party): the resource runs its own interaction and may return an opaque session token in AAuth-Access. Person identity: the agent obtains aa-person+jwt from the PS person_token_endpoint and signs with that instead of the agent token. It identifies the person and does not authorize. PS authorization (three-party): a resource issues a resource token only after it has verified a person token or an auth token; otherwise it answers requirement=person-token. requirement=auth-token then carries aa-resource+jwt (aud = PS); the agent POSTs it to the PS auth_token_endpoint and retries with aa-auth+jwt in Signature-Key. Federated authorization (four-party): the resource token's audience is the resource's access server, and the PS is the only party that calls that AS. Orthogonal governance: missions (Markdown intent, immutable mission_s256), permission, audit, and interaction relay through the PS. Draft-11 dropped the act claim; the person server holds the delegation chain. 401 responses carry AAuth-Requirement (and AAuth-Capabilities) instead of a browser redirect.",
    tokensAndClaims: [
      {
        name: "aa-agent+jwt",
        meaning:
          "Agent identity. sub is the agent identifier (aauth:local@domain). cnf.jwk binds the signing key. Optional ps claim names the person server.",
      },
      {
        name: "aa-person+jwt",
        meaning:
          "Directed identifier of the person at one resource (draft-11 person-identity mode). Identifies, does not authorize. A resource MUST reject it where an auth token is required.",
      },
      {
        name: "aa-resource+jwt",
        meaning:
          "Issued by the resource to describe the access that needs authorizing; aud is the PS or AS that may redeem it.",
      },
      {
        name: "aa-auth+jwt",
        meaning:
          "The grant. Required aud, ps, and a directed sub, bound to the agent's key. No agent identifier and no act chain. Optional scope, mission_s256, tenant, or R3 grants.",
      },
      {
        name: "AAuth-Requirement / AAuth-Access / AAuth-Capabilities",
        meaning:
          "HTTP headers for challenges, session/auth presentation, and capability discovery.",
      },
    ],
    related: [
      "http-signature-keys",
      "http-message-signatures",
      "aauth-r3",
      "oauth-2-0",
      "oauth-2-1",
      "oidc-core",
      "wimse-arch",
      "mcp-auth",
    ],
    implementerNotes:
      "Individual Internet-Draft: not a WG document, not endorsed by the IETF, no RFC number. Published snapshot is draft-11 (25 September 2026, expires 29 March 2027) and defines five resource access modes: agent identity, resource-managed (two-party), person identity, PS authorization (three-party), and federated authorization (four-party). Person tokens and auth_token_endpoint (renamed from token_endpoint) are in that snapshot; draft-10's four-mode table is obsolete. The editor HTML was regenerated 3 October 2026 (expires 6 April 2027); the protocol markdown last changed with the -11 submission, so pin draft-11. Replaces earlier draft-hardt-aauth-protocol. Complements OAuth: where pre-registered clients and bearer tokens work, keep them. Implementations exist (TypeScript @aauth/*, .NET samples); several features were still incomplete in the JS packages at the September 2026 research pass. Do not implement from blog posts; read the draft.",
    whyAgentCares:
      "This is the draft people mean by 'AAuth'. It is the most complete attempt at agent-native identity plus authorization that still reuses OIDC claim vocabulary and HTTP. If you are evaluating whether agents can skip OAuth client registration, start here — and stay honest that it is an individual draft.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-hardt-oauth-aauth-protocol/",
      },
      {
        label: "HTML of draft-11",
        href: "https://datatracker.ietf.org/doc/html/draft-hardt-oauth-aauth-protocol-11",
      },
      {
        label: "Editor's copy",
        href: "https://dickhardt.github.io/AAuth/draft-hardt-oauth-aauth-protocol.html",
      },
      { label: "aauth.dev", href: "https://www.aauth.dev/" },
      { label: "Protocol explorer", href: "https://explorer.aauth.dev/" },
      { label: "Source", href: "https://github.com/dickhardt/AAuth" },
    ],
  },
  {
    slug: "http-signature-keys",
    shortName: "HTTP Signature Keys",
    officialName: "HTTP Signature Keys",
    id: "draft-hardt-httpbis-signature-key-09",
    status: "individual-draft",
    stability: "draft",
    date: "13 September 2026",
    authors: "D. Hardt (Hellō), T. Meunier (Cloudflare)",
    org: "IETF",
    layer: "authn",
    relevance: "agent-specific",
    featured: true,
    aliases: ["signature-key", "dwk"],
    problem:
      "RFC 9421 signs HTTP messages but does not say how the verifier gets the signer's public key. Signature-Key is a general-purpose header and discovery mechanism so keys can be inline, in JWTs, at JWKS URLs, or in certificates.",
    identityVsAuthnVsAuthz:
      "Key distribution for authentication. AAuth uses it as the identity presentation layer (the agent token rides in Signature-Key).",
    actors: ["HTTP client (agent)", "HTTP server (resource, PS, AS)"],
    flow: "Every signed request includes Signature-Key plus RFC 9421 Signature-Input and Signature. Draft-09 schemes include hwk, jwt, jwks_uri, jwks, jkt-jwt, self-jwt, x509, and cached. Accept-Signature-Scheme / Accept-Signature-Alg advertise what the server wants. Signature-Error structures failures. Signature-Key-Cache issues a handle for a previously presented assertion. Well-known documents are discovered via a dwk ('dot well-known') parameter.",
    tokensAndClaims: [
      {
        name: "Signature-Key",
        meaning: "Conveys or references the verification key for this request.",
      },
      {
        name: "dwk",
        meaning:
          "AAuth pins dwk values: aauth-agent.json, aauth-resource.json, aauth-person.json, aauth-access.json at {iss}/.well-known/{dwk}.",
      },
    ],
    related: ["http-message-signatures", "aauth", "jwt"],
    implementerNotes:
      "Individual draft, intended standards track, not a WG document despite 'httpbis' in the filename. Draft-09 (13 September 2026) lists eight schemes (hwk, jkt-jwt, jwks_uri, jwks, jwt, self-jwt, x509, cached) and adds Accept-Signature-Scheme, Signature-Error, and Signature-Key-Cache. Designed as a building block: AAuth and Email Verification both use it. Cover the signature-key component in the signature base so an attacker cannot swap the key header.",
    whyAgentCares:
      "Without this (or an equivalent), AAuth cannot bootstrap 'here is my key' on the first call to a resource that has never seen the agent.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-hardt-httpbis-signature-key/",
      },
      {
        label: "HTML of draft-09",
        href: "https://datatracker.ietf.org/doc/html/draft-hardt-httpbis-signature-key-09",
      },
    ],
  },
  {
    slug: "aauth-r3",
    shortName: "AAuth R3",
    officialName: "AAuth Rich Resource Requests (R3)",
    id: "draft-hardt-aauth-r3-00",
    status: "individual-draft",
    stability: "draft",
    date: "28 September 2026",
    authors: "D. Hardt",
    org: "IETF",
    layer: "authz",
    relevance: "agent-specific",
    aliases: ["r3", "rich resource requests"],
    problem:
      "Agents already speak OpenAPI, MCP tools, gRPC, and GraphQL. OAuth scopes and even RAR types are a second vocabulary. R3 lets a resource publish a content-addressed authorization document in the agent's native vocabulary, including per-call operations that still need a human.",
    identityVsAuthnVsAuthz:
      "Authorization detail and consent UX. Extends AAuth; does not replace identity.",
    actors: ["Agent", "Resource", "Person server / access server"],
    flow: "Resource advertises r3_vocabularies in metadata. Agent includes r3_operations when requesting authorization. Auth tokens carry r3_uri, r3_s256, r3_granted, and optional r3_per_call. Fully granted operations execute immediately; per-call operations require a proposal bound to that invocation.",
    tokensAndClaims: [
      { name: "r3_uri / r3_s256", meaning: "Content-addressed R3 document in effect at approval time." },
      { name: "r3_granted", meaning: "Operations fully authorized." },
      { name: "r3_per_call", meaning: "Operations that still need per-invocation approval." },
    ],
    related: ["aauth", "rar", "mcp-auth"],
    implementerNotes:
      "Published snapshot is draft-hardt-aauth-r3-00 (28 September 2026, expires 1 April 2027). The introduction still marks Status: Exploratory Draft. The editor HTML was regenerated 3 October 2026; the markdown last changed with the -00 submission, so pin -00. Not a WG item. Do not confuse with OAuth RAR (RFC 9396), which is the stable structured-scope mechanism inside vanilla OAuth.",
    whyAgentCares:
      "If you want consent over 'create_invoice(amount=…)' rather than 'scope=invoices', this is the AAuth-shaped design. MCP tool lists are the obvious vocabulary.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-hardt-aauth-r3/",
      },
      {
        label: "HTML of draft-00",
        href: "https://datatracker.ietf.org/doc/html/draft-hardt-aauth-r3-00",
      },
      {
        label: "Editor's copy",
        href: "https://dickhardt.github.io/AAuth/draft-hardt-aauth-r3.html",
      },
      {
        label: "Source markdown",
        href: "https://github.com/dickhardt/AAuth/blob/main/draft-hardt-aauth-r3.md",
      },
    ],
  },
];
