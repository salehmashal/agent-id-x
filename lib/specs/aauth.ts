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
    authors: "D. Hardt (Hell\u014d)",
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
      "Person server (PS) \u2014 optional user representative",
      "Access server (AS) \u2014 optional resource-side policy engine",
      "User / person",
    ],
    flow:
      "Agent identity (the figure is still titled Identity-Based Access; this is the AAuth meaning of p2p): the agent signs the HTTP request with its agent token in Signature-Key (scheme=jwt). The resource verifies the RFC 9421 signature and the JWT, then applies local policy \u2014 no token exchange, no PS, no AS. Resource-managed (two-party): the resource runs its own interaction and may return an opaque session token in AAuth-Access. Person identity: the agent obtains aa-person+jwt from the PS person_token_endpoint and signs with that instead of the agent token. It identifies the person and does not authorize. PS authorization (three-party): a resource issues a resource token only after it has verified a person token or an auth token; otherwise it answers requirement=person-token. requirement=auth-token then carries aa-resource+jwt (aud = PS); the agent POSTs it to the PS auth_token_endpoint and retries with aa-auth+jwt in Signature-Key. Federated authorization (four-party): the resource token's audience is the resource's access server, and the PS is the only party that calls that AS. Orthogonal governance: missions (Markdown intent, immutable mission_s256), permission, audit, and interaction relay through the PS. Draft-11 dropped the act claim; the person server holds the delegation chain. 401 responses carry AAuth-Requirement (and AAuth-Capabilities) instead of a browser redirect.",
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
      "This is the draft people mean by 'AAuth'. It is the most complete attempt at agent-native identity plus authorization that still reuses OIDC claim vocabulary and HTTP. If you are evaluating whether agents can skip OAuth client registration, start here \u2014 and stay honest that it is an individual draft.",
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
];
