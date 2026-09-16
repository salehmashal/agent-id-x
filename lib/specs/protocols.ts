import type { Spec } from "@/lib/types";

export const protocolSpecs: Spec[] = [
  {
    slug: "mcp-auth",
    shortName: "MCP authorization",
    officialName: "Model Context Protocol — Authorization (HTTP transports)",
    id: "MCP spec 2026-07-28 /basic/authorization",
    status: "protocol",
    stability: "vendor-protocol",
    date: "2026-07-28 (current at research time)",
    org: "MCP Steering",
    layer: "authz",
    relevance: "agent-specific",
    featured: true,
    aliases: ["model context protocol", "mcp oauth"],
    problem:
      "An MCP client (often an agent host) must access a restricted MCP server on behalf of a resource owner over HTTP, without inventing a proprietary token scheme.",
    identityVsAuthnVsAuthz:
      "Authorization at the transport. The MCP server is an OAuth 2.1 resource server; the MCP client is an OAuth 2.1 client. User identity is whatever the AS puts in the token (often via OIDC).",
    actors: ["MCP client", "MCP server (RS)", "Authorization server", "Resource owner"],
    flow: "Optional for MCP as a whole: stdio transports SHOULD NOT use this and take credentials from the environment. For HTTP: client hits the server, gets 401 with resource_metadata, fetches RFC 9728 PRM, discovers AS via RFC 8414 and/or OIDC Discovery, performs OAuth 2.1 with PKCE, MUST send resource=<canonical MCP URI> on authorization and token requests, then Authorization: Bearer on every call. Server MUST audience-validate. CIMD SHOULD; DCR MAY but is deprecated.",
    tokensAndClaims: [
      {
        name: "Bearer access token",
        meaning: "Issued for this MCP server as audience. Must not be forwarded elsewhere.",
      },
    ],
    related: [
      "oauth-2-1",
      "prm",
      "resource-indicators",
      "cimd",
      "dcr",
      "as-metadata",
      "iss-param",
      "oidc-discovery",
    ],
    implementerNotes:
      "Not an RFC. The 2026-07-28 revision still cites OAuth 2.1 draft-13 and CIMD draft-00 — those drafts have moved on. Follow MCP MUST/SHOULD language, but implement token handling against current OAuth 2.1 and RFC 9700. Never put MCP tokens in query strings. Protocol-level sessions were removed in this revision.",
    whyAgentCares:
      "This is how most 'ChatGPT/Claude/Cursor calls my tools' auth actually works in 2026: vanilla OAuth 2.1 plus protected resource metadata. It does not give the MCP server an independent agent identity for the model — only a client token for the host.",
    urls: [
      {
        label: "MCP authorization spec",
        href: "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization",
      },
    ],
  },
  {
    slug: "a2a",
    shortName: "A2A (Agent2Agent)",
    officialName: "Agent2Agent (A2A) Protocol",
    id: "A2A v1.0 (AAIF / Linux Foundation)",
    status: "protocol",
    stability: "vendor-protocol",
    date: "v1.0 announced March 2026; donated to LF in 2025; joined AAIF 2026",
    org: "AAIF",
    layer: "mixed",
    relevance: "agent-specific",
    featured: true,
    aliases: ["agent2agent", "google a2a"],
    problem:
      "Independent agents, built on different stacks, need a common way to discover skills, authenticate, delegate tasks, and exchange results across organizational boundaries.",
    identityVsAuthnVsAuthz:
      "Communication protocol with declared authentication schemes. Identity of an agent is the Agent Card (optionally signed). Request authentication is ordinary HTTP schemes (API key, Basic/Bearer, OAuth 2.0, OIDC, mTLS) advertised on the card — A2A does not replace OAuth or AAuth.",
    actors: ["A2A client agent", "A2A server agent", "Optional enterprise AS"],
    flow: "Server publishes /.well-known/agent-card.json. Client verifies optional JWS (RFC 8785 canonicalization). Client picks a supportedInterfaces entry, sends A2A-Version, and authenticates with a declared security scheme. Extended Agent Card may be fetched once authenticated. Tasks then flow over JSON-RPC, gRPC, or HTTP+JSON.",
    tokensAndClaims: [
      {
        name: "Agent Card",
        meaning:
          "JSON metadata: identity, skills, interfaces, securitySchemes. Signing is tamper evidence, not request auth.",
      },
    ],
    related: ["oauth-2-0", "oidc-core", "mtls", "mcp-auth", "transaction-tokens", "aauth"],
    implementerNotes:
      "v1.0 is the first stable spec; v0.3 remains relevant for migration. IBM's Agent Communication Protocol merged into A2A (August 2025). Auth is out-of-band relative to task messages: obtain the OAuth token however your scheme says, then attach it. Do not confuse A2A with AAuth; one is how agents talk, the other is how HTTP callers prove identity and get grants.",
    whyAgentCares:
      "If someone says 'p2p' meaning agent-to-agent communication, they often mean A2A. If they say 'p2p' next to AAuth, they more often mean AAuth's two-party / identity-based mode (no AS). Both uses appear in the wild — this site treats them as distinct.",
    urls: [
      {
        label: "A2A v1.0 specification",
        href: "https://a2a-protocol.org/v1.0.0/specification/",
      },
      {
        label: "AAIF project page",
        href: "https://aaif.io/projects/agent2agent",
      },
    ],
  },
  {
    slug: "gnap",
    shortName: "GNAP",
    officialName: "Grant Negotiation and Authorization Protocol",
    id: "RFC 9635",
    status: "rfc",
    stability: "stable",
    date: "October 2024",
    authors: "J. Richer (ed.), F. Imbault",
    org: "IETF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["rfc9635"],
    problem:
      "OAuth 2.0's fixed grants, bearer tokens, and redirect-centric interaction cannot cleanly express some delegation and key-bound client cases. GNAP is a different protocol (not an OAuth extension) for negotiating grants, including fine-grained access and identity assertions.",
    identityVsAuthnVsAuthz:
      "Authorization protocol that can also carry identity assertions. Intentionally not compatible with OAuth 2.0.",
    actors: ["Client instance", "Authorization server", "Resource owner", "Resource server"],
    flow: "Client POSTs a grant request including its key and requested access. AS returns a grant response that may include access tokens, interaction instructions, or continuation. Tokens are typically key-bound. Interaction can be redirect, user-code, or other modes.",
    tokensAndClaims: [
      {
        name: "GNAP access token",
        meaning: "Often presented with proof of the client key, not as a naked bearer secret.",
      },
    ],
    related: ["gnap-rs", "oauth-2-0", "aauth", "rar"],
    implementerNotes:
      "Proposed Standard. The GNAP WG has concluded. Parallel existence with OAuth is expected. AAuth occupies some of the same 'key-bound HTTP client' design space but stays closer to HTTP signatures + JWT vocabulary.",
    whyAgentCares:
      "If you are designing greenfield agent auth and can choose a protocol, GNAP is the completed IETF alternative to OAuth. In practice, MCP and most SaaS APIs chose OAuth 2.1, so GNAP is currently adjacent rather than the default.",
    urls: [
      {
        label: "RFC 9635",
        href: "https://www.rfc-editor.org/rfc/rfc9635.html",
      },
    ],
  },
  {
    slug: "gnap-rs",
    shortName: "GNAP RS connections",
    officialName: "GNAP Resource Server Connections",
    id: "RFC 9767",
    status: "rfc",
    stability: "stable",
    date: "April 2025",
    authors: "J. Richer (ed.), F. Imbault",
    org: "IETF",
    layer: "authz",
    relevance: "adjacent",
    aliases: ["rfc9767"],
    problem:
      "GNAP core needed a standard way for resource servers to connect to authorization servers (introspection-like, token discovery, well-known gnap-as-rs).",
    identityVsAuthnVsAuthz: "Authorization infrastructure for GNAP deployments.",
    actors: ["Resource server", "Authorization server"],
    flow: "RS discovers AS RS-facing metadata and presents tokens for validation / continuation as specified.",
    tokensAndClaims: [],
    related: ["gnap"],
    implementerNotes: "Read only if you are actually deploying GNAP.",
    whyAgentCares:
      "Completes the GNAP picture the way RFC 9728 completes OAuth's.",
    urls: [
      {
        label: "RFC 9767",
        href: "https://www.rfc-editor.org/rfc/rfc9767.html",
      },
    ],
  },
  {
    slug: "did-core",
    shortName: "W3C DID Core",
    officialName: "Decentralized Identifiers (DIDs) v1.0",
    id: "W3C DID Core 1.0 Recommendation; DID 1.1 experimental",
    status: "w3c",
    stability: "stable",
    date: "DID 1.0 Recommendation; DID 1.1 Working Draft 2026 (do not implement 1.1)",
    org: "W3C",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["did"],
    problem:
      "Identifiers that resolve to a document of verification methods and services without a single centralized registrar.",
    identityVsAuthnVsAuthz:
      "Identity. Authentication uses the keys in the DID document; authorization is out of scope (VCs, OAuth, etc.).",
    actors: ["DID controller", "DID subject", "Resolver", "Verifier"],
    flow: "Create a DID according to a method. Resolve to a DID document. Authenticate by proving control of a listed verification method.",
    tokensAndClaims: [
      {
        name: "did:method:…",
        meaning: "URI. Method specifies how to resolve and update.",
      },
    ],
    related: ["vc-data-model", "did-peer", "didcomm", "agent-identity-cg"],
    implementerNotes:
      "W3C's DID 1.1 draft in 2026 is explicitly experimental: implement 1.0. DID methods are not all equal; did:web is common for org agents, did:peer for pairwise.",
    whyAgentCares:
      "Some agent-identity designs give each agent a DID instead of (or in addition to) an OAuth client_id or AAuth identifier. Resolution and key rotation become your problem.",
    urls: [
      { label: "DID Core 1.0", href: "https://www.w3.org/TR/did-core/" },
      {
        label: "DID 1.1 (experimental)",
        href: "https://www.w3.org/TR/did-1.1/",
      },
    ],
  },
  {
    slug: "vc-data-model",
    shortName: "W3C Verifiable Credentials",
    officialName: "Verifiable Credentials Data Model",
    id: "VC Data Model 2.0 Recommendation; 2.1 Working Draft",
    status: "w3c",
    stability: "stable",
    org: "W3C",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["verifiable credentials", "vcdm"],
    problem:
      "An issuer needs to make tamper-evident claims about a subject that a verifier can check without phoning the issuer every time (though status/revocation may still require a check).",
    identityVsAuthnVsAuthz:
      "Identity (and other) claims. A VC is not an OAuth access token. OpenID4VCI/VP move VCs over OAuth.",
    actors: ["Issuer", "Holder", "Subject", "Verifier"],
    flow: "Issuer signs a credential. Holder stores it, presents a Verifiable Presentation to a verifier, who checks proofs and validity.",
    tokensAndClaims: [
      {
        name: "credential / presentation",
        meaning: "Data model objects; proofs may be embedded or enveloping.",
      },
    ],
    related: ["did-core", "openid4vp", "openid4vci", "oidc-ida"],
    implementerNotes:
      "Prefer VC DM 2.0 for new work. 2.1 is a working draft. Combine with SD-JWT VC when the credential must be a JWT with selective disclosure.",
    whyAgentCares:
      "Natural format for 'Acme attests that agent X may operate in production until date Y', presented by the agent to a relying tool.",
    urls: [
      {
        label: "VC Data Model 2.1 (WD)",
        href: "https://www.w3.org/TR/vc-data-model-2.1/",
      },
    ],
  },
  {
    slug: "did-peer",
    shortName: "did:peer",
    officialName: "Peer DID Method Specification",
    id: "did:peer (DIF method spec)",
    status: "protocol",
    stability: "vendor-protocol",
    org: "DIF",
    layer: "identity",
    relevance: "adjacent",
    aliases: ["peer did", "p2p did"],
    problem:
      "Many relationships are pairwise and should not require a ledger or public resolution. Peer DIDs are self-certifying identifiers stored by the parties who need them.",
    identityVsAuthnVsAuthz:
      "Pairwise identity. Authentication happens when those keys are used (often via DIDComm).",
    actors: ["Two (or n) peers", "Their agents"],
    flow: "Each party creates a peer DID and exchanges DID documents (typically inside DIDComm). Later messages authenticate against those keys. Not globally resolvable.",
    tokensAndClaims: [
      {
        name: "did:peer:…",
        meaning: "Method-specific identifier; variants (2, 3, 4) exist — read the current DIF spec.",
      },
    ],
    related: ["did-core", "didcomm", "a2a"],
    implementerNotes:
      "Not an IETF RFC. This is one of the things people mean by 'p2p identity', especially in SSI communities. It is not AAuth two-party mode.",
    whyAgentCares:
      "Useful when two agents want a private pairwise identity without publishing a well-known JWKS. Poor fit for open-world HTTP APIs that must verify a stranger's first request.",
    urls: [
      {
        label: "Peer DID method spec",
        href: "https://identity.foundation/peer-did-method-spec/",
      },
    ],
  },
  {
    slug: "didcomm",
    shortName: "DIDComm",
    officialName: "DIDComm Messaging v2",
    id: "DIDComm Messaging Specification v2.0 (DIF)",
    status: "protocol",
    stability: "vendor-protocol",
    org: "DIF",
    layer: "authn",
    relevance: "adjacent",
    aliases: ["didcomm v2"],
    problem:
      "Agents (in the SSI sense) need transport-agnostic, end-to-end encrypted, optionally authenticated messaging based on DID keys.",
    identityVsAuthnVsAuthz:
      "Authenticated (authcrypt) or anonymous (anoncrypt) messaging. Authorization is application-level.",
    actors: ["Sender agent", "Recipient agent"],
    flow: "Messages are packed to the recipient DID's keyAgreement keys. authcrypt requires the sender key to be authorized on the sender DID. Peer DIDs are recommended to reduce correlation.",
    tokensAndClaims: [
      {
        name: "from (DID)",
        meaning: "Required for authcrypt; must match an authorized sender key.",
      },
    ],
    related: ["did-peer", "did-core", "a2a"],
    implementerNotes:
      "DIDComm 'agents' predate LLM agents. Do not assume DIDComm interoperability with A2A or MCP. Different stack, different problem (messaging vs. HTTP API access vs. task protocol).",
    whyAgentCares:
      "If your 'p2p agent auth' conversation comes from digital-wallet people, they mean this. If it comes from OAuth/AAuth people, they probably do not.",
    urls: [
      {
        label: "DIDComm v2.0",
        href: "https://identity.foundation/didcomm-messaging/spec/v2.0/",
      },
    ],
  },
  {
    slug: "agent-identity-cg",
    shortName: "W3C Agent Identity CG",
    officialName: "Agent Identity Registry Protocol Community Group",
    id: "W3C Community Group (launched 2026)",
    status: "w3c",
    stability: "draft",
    date: "Proposed 22 April 2026",
    org: "W3C",
    layer: "identity",
    relevance: "agent-specific",
    aliases: ["agent identity registry"],
    problem:
      "AI agents need cryptographically verifiable credentials binding them to controlling organizations so they can negotiate trust across orgs without bilateral contracts in advance.",
    identityVsAuthnVsAuthz:
      "Identity infrastructure (DID method, VC format, trust levels, revocation). Integration profiles planned with MCP, A2A, OAuth/OIDC, SPIFFE.",
    actors: ["Controlling organization", "Agent", "Relying organization"],
    flow: "Not a finished protocol at research time. Charter lists DID method, agent credential format, trust negotiation, lifecycle, post-quantum requirements.",
    tokensAndClaims: [],
    related: ["did-core", "vc-data-model", "mcp-auth", "a2a", "spiffe"],
    implementerNotes:
      "Community Group ≠ W3C Recommendation. W3C hosting is not endorsement. Watch for drafts before implementing.",
    whyAgentCares:
      "Shows that 'agent identity' is being pursued in W3C as well as IETF. Overlaps AAuth/WIMSE problem space from a VC angle.",
    urls: [
      {
        label: "Community Group",
        href: "https://www.w3.org/community/agent-identity/",
      },
    ],
  },
];
