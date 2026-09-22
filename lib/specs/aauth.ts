import type { Spec } from "@/lib/types";

export const aauthSpecs: Spec[] = [
  {
    slug: "aauth",
    shortName: "AAuth",
    officialName: "AAuth Protocol",
    id: "draft-hardt-oauth-aauth-protocol-10",
    status: "individual-draft",
    stability: "draft",
    date: "6 August 2026",
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
      "Identity-based (peer) mode: the agent signs the HTTP request with its agent token in Signature-Key (scheme=jwt). The resource verifies RFC 9421 signature + JWT, then applies local policy — no token exchange, no PS, no AS. Resource-managed (two-party): the resource runs its own interaction/consent and may issue an opaque session token in AAuth-Access. PS-asserted (three-party): the resource issues a resource token (aud = PS); the agent POSTs it to the PS token_endpoint; the PS returns an auth token with user claims and consent; the agent retries. Federated (four-party): the resource has its own access server; the PS federates to that AS. Orthogonal governance: missions (Markdown intent, immutable s256), permission, audit, and interaction relay through the PS. 401 responses carry AAuth-Requirement (and related AAuth-Capabilities) instead of a browser redirect.",
    tokensAndClaims: [
      {
        name: "aa-agent+jwt",
        meaning:
          "Agent identity. sub is the agent identifier (aauth:local@domain). cnf.jwk binds the signing key. Optional ps claim names the person server.",
      },
      {
        name: "aa-person+jwt",
        meaning:
          "Directed identifier of the person at one resource. Identifies, does not authorize. Editor's copy discusses this more than draft-10's four-mode table.",
      },
      {
        name: "aa-resource+jwt",
        meaning:
          "Issued by the resource to describe the access that needs authorizing; aud is the PS or AS that may redeem it.",
      },
      {
        name: "aa-auth+jwt",
        meaning:
          "The grant. Carries user claims (sub, optional email/tenant/groups/roles) and consented scope or R3 grants. Bound to the agent's key.",
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
      "Individual Internet-Draft: not a WG document, not endorsed by the IETF, no RFC number. Draft-10 (6 August 2026) describes four resource access modes. The editor's copy (published 20 September 2026, expires 24 March 2027) and aauth.dev describe five (adding person-identity) — treat the datatracker HTML as the published snapshot and the editor's copy as moving. Replaces earlier draft-hardt-aauth-protocol. Complements OAuth: where pre-registered clients and bearer tokens work, keep them. Implementations exist (TypeScript @aauth/*, .NET samples) but several features (call chaining, four-party federation) were still incomplete in the JS packages at research time. Do not implement from blog posts; read the draft.",
    whyAgentCares:
      "This is the draft people mean by 'AAuth'. It is the most complete attempt at agent-native identity plus authorization that still reuses OIDC claim vocabulary and HTTP. If you are evaluating whether agents can skip OAuth client registration, start here — and stay honest that it is an individual draft.",
    urls: [
      {
        label: "Datatracker",
        href: "https://datatracker.ietf.org/doc/draft-hardt-oauth-aauth-protocol/",
      },
      {
        label: "HTML of draft-10",
        href: "https://datatracker.ietf.org/doc/html/draft-hardt-oauth-aauth-protocol-10",
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
    id: "draft-hardt-aauth-r3 (editor's copy; exploratory)",
    status: "individual-draft",
    stability: "draft",
    date: "20 September 2026 (editor's copy)",
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
      "Editor's copy dated 20 September 2026 (expires 24 March 2027) still marks Status: Exploratory Draft. Confirm whether a given revision is on the datatracker; the canonical HTML at research time was the editor's copy. Do not confuse with OAuth RAR (RFC 9396), which is the stable structured-scope mechanism inside vanilla OAuth.",
    whyAgentCares:
      "If you want consent over 'create_invoice(amount=…)' rather than 'scope=invoices', this is the AAuth-shaped design. MCP tool lists are the obvious vocabulary.",
    urls: [
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
