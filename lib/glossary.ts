import type { GlossaryTerm } from "@/lib/types";

export const glossary: GlossaryTerm[] = [
  {
    term: "Access token",
    definition:
      "Credential the client presents to a resource server. In OAuth 2.0 it may be opaque; RFC 9068 profiles it as a JWT (typ at+jwt). It is not an ID Token.",
    seeAlso: ["jwt-access-tokens", "oauth-bearer"],
  },
  {
    term: "act (actor) claim",
    definition:
      "RFC 8693 JWT claim recording that the token presenter is acting for the subject. Nested act objects represent multi-hop delegation (A then B then C).",
    seeAlso: ["token-exchange"],
  },
  {
    term: "Agent",
    definition:
      "In this landscape: software that iteratively calls a model and tools. IETF AIMS treats it as a workload. AAuth treats it as any HTTP client with its own key. DIDComm uses 'agent' for a wallet endpoint — not the same thing.",
    seeAlso: ["aims", "aauth"],
  },
  {
    term: "Agent Card",
    definition:
      "A2A JSON document at /.well-known/agent-card.json describing identity, skills, interfaces, and securitySchemes. Optional JWS proves integrity of the card, not of later requests.",
    seeAlso: ["a2a"],
  },
  {
    term: "Agent token (AAuth)",
    definition:
      "JWT of type aa-agent+jwt binding an agent identifier to a signing key (cnf.jwk). Presented via the Signature-Key header, not as a bearer Authorization token.",
    seeAlso: ["aauth"],
  },
  {
    term: "Audience (aud)",
    definition:
      "Who is intended to accept a token. Access tokens should be audience-restricted to the API (RFC 8707/9068). ID Tokens are audience-restricted to the client. Mix-ups here are a leading agent-security bug.",
    seeAlso: ["resource-indicators", "jwt-access-tokens", "oidc-core"],
  },
  {
    term: "Authorization server (AS)",
    definition:
      "OAuth role that authenticates the resource owner (often via OIDC), authenticates the client, and issues tokens. AAuth's 'access server' is the resource-side cousin in four-party mode.",
    seeAlso: ["oauth-2-0", "aauth"],
  },
  {
    term: "Bearer token",
    definition:
      "A token that grants access to whoever presents it. RFC 6750. Contrast sender-constrained tokens (DPoP, mTLS, HTTP Message Signatures).",
    seeAlso: ["oauth-bearer", "dpop", "mtls"],
  },
  {
    term: "CIBA",
    definition:
      "Client-Initiated Backchannel Authentication: the client starts auth/consent without a browser redirect; the user approves on another device.",
    seeAlso: ["ciba"],
  },
  {
    term: "CIMD",
    definition:
      "Client ID Metadata Document: the client_id is an HTTPS URL the AS fetches. WG draft; MCP prefers this over Dynamic Client Registration.",
    seeAlso: ["cimd", "dcr"],
  },
  {
    term: "client_id",
    definition:
      "Identifier of an OAuth client at one authorization server. Not a global agent identity. AAuth exists partly because this identifier does not travel.",
    seeAlso: ["oauth-2-0", "aauth"],
  },
  {
    term: "Confidential vs public client",
    definition:
      "Confidential clients can keep a secret (or private key) on a server. Public clients cannot (browsers, many native apps, many local agents). OAuth 2.1 simplifies the distinction to 'has credentials or not'.",
    seeAlso: ["oauth-2-1"],
  },
  {
    term: "Confused deputy",
    definition:
      "A client with delegated authority is tricked into using it at the wrong resource or for the wrong purpose. Audience restriction, PKCE, and actor claims are mitigations.",
    seeAlso: ["resource-indicators", "pkce", "token-exchange"],
  },
  {
    term: "DPoP",
    definition:
      "Demonstrating Proof of Possession: per-request signed JWT binding an OAuth access token to a client key without requiring mTLS.",
    seeAlso: ["dpop"],
  },
  {
    term: "Dynamic Client Registration (DCR)",
    definition:
      "RFC 7591: POST metadata to mint a client_id at runtime. MCP 2026-07-28 deprecates it in favor of CIMD.",
    seeAlso: ["dcr", "cimd"],
  },
  {
    term: "FAPI 2.0",
    definition:
      "OIDF high-security profile of OAuth (PAR, PKCE, sender-constrained tokens, …) used in open banking and other high-value APIs.",
    seeAlso: ["fapi-2"],
  },
  {
    term: "GNAP",
    definition:
      "Grant Negotiation and Authorization Protocol (RFC 9635). A completed IETF alternative to OAuth, not an OAuth extension and not wire-compatible.",
    seeAlso: ["gnap"],
  },
  {
    term: "ID Token",
    definition:
      "OpenID Connect JWT authenticating the user to the client. Never send it to an API as if it were an access token.",
    seeAlso: ["oidc-core"],
  },
  {
    term: "ID-JAG / XAA",
    definition:
      "Identity Assertion JWT Authorization Grant, informally Cross-App Access: IdP mints a JWT grant for another app's AS so an agent/app can call that API under enterprise policy.",
    seeAlso: ["xaa", "identity-chaining"],
  },
  {
    term: "Issuer (iss)",
    definition:
      "Who minted a token or metadata document. Compare exactly. RFC 9207 puts iss in the authorization response to stop mix-up attacks.",
    seeAlso: ["iss-param", "as-metadata"],
  },
  {
    term: "JWT",
    definition:
      "JSON Web Token (RFC 7519): a signed or encrypted claims container. Profiles (ID Token, at+jwt, WIT, aa-agent+jwt) decide the semantics.",
    seeAlso: ["jwt"],
  },
  {
    term: "MCP",
    definition:
      "Model Context Protocol: how model hosts expose and call tools. HTTP authorization is an OAuth 2.1 profile, not a new token type.",
    seeAlso: ["mcp-auth"],
  },
  {
    term: "MCP host",
    definition:
      "The application that owns the model session and is the OAuth client in MCP HTTP — Claude Desktop, an IDE, a custom runtime. Distinct from the MCP server, which is the tool/resource. Stdio MCP is a local pipe and does not use the HTTP OAuth profile.",
    seeAlso: ["mcp-auth"],
  },
  {
    term: "Mission (AAuth)",
    definition:
      "Optional natural-language description of what the agent intends, approved at the person server and bound by SHA-256. Governance that cannot be reduced to static scopes.",
    seeAlso: ["aauth"],
  },
  {
    term: "Mix-up attack",
    definition:
      "The client is tricked into mixing tokens or codes from two authorization servers. Mitigated by RFC 9207 iss and exact issuer metadata checks.",
    seeAlso: ["iss-param"],
  },
  {
    term: "On-behalf-of (OBO)",
    definition:
      "Pattern where a service calls downstream as itself acting for a user. In IETF terms this is Token Exchange (RFC 8693) with subject and actor, not a separate grant name.",
    seeAlso: ["token-exchange"],
  },
  {
    term: "PAR",
    definition:
      "Pushed Authorization Requests (RFC 9126): POST the authorize parameters to the AS, redirect with a short request_uri.",
    seeAlso: ["par"],
  },
  {
    term: "Person server (PS)",
    definition:
      "AAuth role representing the user: issues auth tokens, runs missions, permission, audit, and interaction. Orthogonal to which resource-access mode is in use.",
    seeAlso: ["aauth"],
  },
  {
    term: "PKCE",
    definition:
      "Proof Key for Code Exchange (RFC 7636). Stops authorization-code interception. Required for authorization-code clients in OAuth 2.1.",
    seeAlso: ["pkce", "oauth-2-1"],
  },
  {
    term: "P2P (in this landscape)",
    definition:
      "Overloaded. (1) AAuth identity-based or two-party access: agent↔resource with no AS. (2) A2A agent-to-agent communication. (3) did:peer / DIDComm pairwise identity. There is no IETF RFC titled 'P2P OAuth' in this cluster. The deployment matrix keeps those as separate rows.",
    seeAlso: ["aauth", "a2a", "did-peer"],
  },
  {
    term: "Protected Resource Metadata",
    definition:
      "RFC 9728 JSON document a resource publishes so clients can discover its authorization servers and capabilities.",
    seeAlso: ["prm"],
  },
  {
    term: "RAR",
    definition:
      "Rich Authorization Requests (RFC 9396): structured authorization_details instead of only scopes.",
    seeAlso: ["rar", "aauth-r3"],
  },
  {
    term: "Resource owner",
    definition:
      "OAuth term for the entity that can grant access — usually a human, sometimes an organization or the client itself (client-credentials).",
    seeAlso: ["oauth-2-0"],
  },
  {
    term: "Resource server (RS)",
    definition:
      "The API or tool. In MCP HTTP, the MCP server is the RS. In AAuth, the 'resource' plays this role.",
    seeAlso: ["oauth-2-0", "mcp-auth"],
  },
  {
    term: "Scope",
    definition:
      "Space-delimited OAuth permission strings. Too coarse for many tool calls; see RAR and AAuth R3.",
    seeAlso: ["oauth-2-0", "rar"],
  },
  {
    term: "Sender-constrained token",
    definition:
      "An access token that can only be used by a presenter who proves a key (DPoP, mTLS certificate, HTTP signature). Contrast bearer.",
    seeAlso: ["dpop", "mtls", "http-message-signatures"],
  },
  {
    term: "Sidecar (mesh)",
    definition:
      "A helper process next to a workload that presents SPIFFE/WIMSE identity, usually via mTLS. The agent binary is still the workload; the sidecar is how identity is injected. Unattended: there is no OIDC user sub on this hop.",
    seeAlso: ["spiffe", "wimse-arch"],
  },
  {
    term: "SPIFFE / SPIRE",
    definition:
      "CNCF workload identity: SPIFFE IDs and SVIDs, typically issued by SPIRE from platform attestation. IETF WIMSE generalizes multi-system aspects.",
    seeAlso: ["spiffe", "wimse-arch"],
  },
  {
    term: "Step-up",
    definition:
      "RFC 9470: the resource demands a stronger or fresher user authentication before serving a request.",
    seeAlso: ["step-up"],
  },
  {
    term: "Transaction token (Txn-Token)",
    definition:
      "Short-lived JWT propagating user, workload, and purpose across a call chain inside a trust domain. WG draft.",
    seeAlso: ["transaction-tokens"],
  },
  {
    term: "Person token (AAuth)",
    definition:
      "Editor's-copy JWT typ aa-person+jwt: a directed identifier of the person at one resource. Identifies, does not authorize. Absent from draft-10's four-mode table. Must not be accepted where an auth token is required.",
    seeAlso: ["aauth"],
  },
  {
    term: "Signature-Key",
    definition:
      "HTTP header from draft-hardt-httpbis-signature-key that conveys or points at the public key for an RFC 9421 signature. AAuth puts the agent (or person/auth) JWT here with scheme=jwt.",
    seeAlso: ["http-signature-keys", "aauth"],
  },
  {
    term: "WIMSE",
    definition:
      "Workload Identity in Multi-System Environments: IETF WG architecture and credential drafts for workload identifiers, WIT/WIC, and proofs (WPT, HTTP signatures, mTLS).",
    seeAlso: ["wimse-arch"],
  },
  {
    term: "WIT / WPT",
    definition:
      "Workload Identity Token (credential) and Workload Proof Token (per-request PoP). WIMSE drafts; WIT must not be used as a bearer token.",
    seeAlso: ["wimse-creds", "wimse-wpt"],
  },
  {
    term: "Workload",
    definition:
      "Software executing for a purpose, possibly many instances. AIMS: an agent is a workload. Distinct from the user it may serve.",
    seeAlso: ["wimse-arch", "aims"],
  },
];

export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.trim().toLowerCase();
  if (!q) return glossary;
  return glossary.filter((term) => {
    const hay = `${term.term} ${term.definition}`.toLowerCase();
    return hay.includes(q);
  });
}
