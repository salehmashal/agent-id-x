import type { CompareView } from "@/lib/types";

export const compares: CompareView[] = [
  {
    slug: "oauth-2-0-vs-2-1",
    title: "OAuth 2.0 vs OAuth 2.1",
    subtitle:
      "2.1 is not a new protocol. It is 2.0 with the unsafe bits removed and PKCE folded into the core. Still a WG draft as of September 2026.",
    leftTitle: "OAuth 2.0 (RFC 6749 / 6750)",
    rightTitle: "OAuth 2.1 (draft-ietf-oauth-v2-1-16)",
    specSlugs: ["oauth-2-0", "oauth-2-1", "pkce", "oauth-security-bcp"],
    rows: [
      {
        aspect: "Status",
        left: "Internet Standard-track RFCs, universally deployed.",
        right:
          "Working Group Internet-Draft (rev 16, Sep 2026). Milestone: submit to IESG Dec 2026. Not an RFC yet.",
      },
      {
        aspect: "Authorization Code",
        left: "Defined. PKCE is a later extension (RFC 7636), originally for public clients.",
        right: "Authorization Code with PKCE is the default interactive grant. PKCE plain method removed.",
      },
      {
        aspect: "Implicit grant",
        left: "Defined (response_type=token).",
        right: "Omitted, following RFC 9700. Do not issue access tokens in the front channel.",
      },
      {
        aspect: "Resource Owner Password Credentials",
        left: "Defined.",
        right: "Omitted. The client must not collect passwords.",
      },
      {
        aspect: "Redirect URIs",
        left: "Matching rules were loose in practice.",
        right: "Exact string matching (RFC 9700 §4.1.3).",
      },
      {
        aspect: "Bearer tokens in URIs",
        left: "RFC 6750 allowed query-string tokens.",
        right: "Omitted. Tokens stay in the Authorization header.",
      },
      {
        aspect: "Public-client refresh tokens",
        left: "Often long-lived bearer secrets.",
        right: "Must be sender-constrained or one-time-use (rotated).",
      },
      {
        aspect: "redirect_uri on token request",
        left: "Required if it was sent on the authorization request.",
        right:
          "Removed; PKCE addresses code injection. Mixed-mode ASes may still require it for old clients.",
      },
      {
        aspect: "Sender constraint",
        left: "Optional. Bearer tokens are the 2012 default. DPoP/mTLS arrived later.",
        right:
          "Still not mandatory for all 2.1 ASes (FAPI 2.0 does mandate PoP). Public-client refresh tokens must be sender-constrained or rotated. Access-token PoP is discussed, not universally required.",
      },
      {
        aspect: "What an agent should implement",
        left: "Only as constrained by RFC 9700. Do not implement implicit or password grants from the 6749 text.",
        right:
          "Authorization code + PKCE S256, exact redirects, no tokens in URLs, resource indicators, iss checks. MCP already requires this shape while citing an older 2.1 draft.",
      },
      {
        aspect: "Identity",
        left: "None. Use OpenID Connect.",
        right:
          "Still none. Use OpenID Connect. ID Token response types remain OIDC's concern.",
      },
    ],
    takeaway:
      "For agent implementers, 'speak OAuth 2.1' means: authorization code + PKCE always, no implicit, no password grant, exact redirects, audience-restricted tokens, no tokens in URLs. MCP already requires this shape even while citing an older 2.1 draft.",
    fieldNotes: [
      {
        title: "Draft-16 vs what datatracker lists",
        body: "HTML of draft-ietf-oauth-v2-1-16 is dated 3 September 2026 and expires 7 March 2027. Some OAuth WG index views still showed -15 (2 March 2026) as the WG document row. Cite the revision you implemented. MCP 2026-07-28 still cites draft-13; implement token handling against -16 and RFC 9700.",
      },
      {
        title: "Browser apps TODO",
        body: "Draft-16 still has a TODO to import the browser-based apps BCP and cites draft-ietf-oauth-browser-based-apps-27. RFC 10017 published in August 2026. Chat UIs that broker agent OAuth in the browser should follow the RFC, not wait for 2.1 to finish copying it.",
      },
    ],
  },
  {
    slug: "oidc-vs-oauth",
    title: "OpenID Connect vs OAuth",
    subtitle:
      "OIDC is an identity layer on OAuth 2.0. OAuth authorizes API access. Agents usually need both, for different questions.",
    leftTitle: "OAuth 2.0 / 2.1",
    rightTitle: "OpenID Connect Core",
    specSlugs: ["oauth-2-0", "oauth-2-1", "oidc-core"],
    rows: [
      {
        aspect: "Question answered",
        left: "Is this client allowed to do these things at this API?",
        right: "Who authenticated, and to which relying party?",
      },
      {
        aspect: "Primary artifact",
        left: "Access token (opaque or at+jwt) presented to the resource server.",
        right: "ID Token (JWT) presented to the client. aud is the client_id.",
      },
      {
        aspect: "Audience",
        left: "The API (RFC 8707 / RFC 9068 aud).",
        right: "The relying party. Sending an ID Token to an API is a bug.",
      },
      {
        aspect: "UserInfo",
        left: "Not defined.",
        right: "Optional endpoint, authorized by the access token with openid scope.",
      },
      {
        aspect: "Agent role",
        left: "Agent is the client. Tools are resource servers.",
        right: "Agent is the relying party when it needs to know the user. The AS is the OP.",
      },
      {
        aspect: "AAuth relationship",
        left: "AAuth can coexist; it avoids bearer tokens and pre-registration.",
        right: "AAuth reuses OIDC claim names so resources can keep their user model.",
      },
      {
        aspect: "XAA / identity chaining",
        left: "Token exchange (RFC 8693) plus JWT bearer (RFC 7523) move access across ASes. XAA starts from an ID Token at the IdP, not at the API.",
        right:
          "ID Token (or refresh) is the subject_token that mints an ID-JAG. The ID Token still must not be sent to the resource API.",
      },
      {
        aspect: "typ / token confusion",
        left: "RFC 9068 access tokens are typ at+jwt. Untyped JWTs get accepted by sloppy RSes.",
        right:
          "ID Tokens are not at+jwt. nonce, at_hash, aud=client_id. Different validation rules.",
      },
    ],
    takeaway:
      "If a design says 'the agent sends the ID Token to the MCP server', that design is wrong. The MCP server wants an access token minted for it. The agent keeps the ID Token to know who it serves.",
    fieldNotes: [
      {
        title: "Agents usually need both",
        body: "OIDC answers which human signed in. OAuth answers what the host may do at this tool. WIMSE/SPIFFE answers which binary is calling. AAuth answers which agent instance a stranger's HTTP API can verify. Collapsing any two of those into one JWT is the recurring incident.",
      },
    ],
  },
  {
    slug: "aauth-vs-oauth",
    title: "AAuth vs vanilla OAuth",
    subtitle:
      "AAuth is an individual IETF draft for agent-to-resource authorization with cryptographic client identity. It complements OAuth; it does not have an RFC number.",
    leftTitle: "Vanilla OAuth 2.x + OIDC",
    rightTitle: "AAuth (draft-hardt-oauth-aauth-protocol-10)",
    specSlugs: ["oauth-2-1", "oidc-core", "aauth", "http-signature-keys", "dcr"],
    rows: [
      {
        aspect: "Client identity",
        left: "client_id issued by each AS. Meaningless at another AS. DCR or CIMD to mint one at runtime.",
        right:
          "Agent identifier aauth:local@domain bound to a key, published at a well-known URL. No per-resource pre-registration.",
      },
      {
        aspect: "Proof on the API call",
        left: "Bearer token, or DPoP/mTLS if you opted in.",
        right: "HTTP Message Signatures (RFC 9421) on every request. Stolen JWT without the key is useless.",
      },
      {
        aspect: "How authorization starts",
        left: "Redirect the user to /authorize, or CIBA, or client credentials.",
        right:
          "Call the resource; receive AAuth-Requirement. First call can be the registration. Optional person server for user claims.",
      },
      {
        aspect: "User identity",
        left: "OIDC ID Token at the client; sub in the access token at the API.",
        right:
          "Person server asserts claims (sub, email, groups, …) in an auth token. Identity is (iss, sub) at that PS.",
      },
      {
        aspect: "Open-world discovery",
        left: "RFC 9728 + RFC 8414. Still usually needs a client identifier at the AS.",
        right: "Designed so an agent that knows only a hostname can sign a request and be understood.",
      },
      {
        aspect: "Governance mid-task",
        left: "Step-up (RFC 9470), CIBA, or a new authorize request.",
        right: "Missions (natural language, s256-bound), permission/audit/interaction relay at the PS, optional R3 per-call.",
      },
      {
        aspect: "Maturity",
        left: "RFCs plus a late-stage 2.1 draft. What MCP and banks actually run.",
        right:
          "Individual Internet-Draft, not a WG item. Editor's copy is moving (four vs five access modes). Implement only with pinned revisions.",
      },
      {
        aspect: "Access modes",
        left: "Grants: authorization code, client credentials, refresh, plus extensions (CIBA, 8693, 7523).",
        right:
          "Draft-10: four modes (identity-based, resource-managed, PS-asserted, federated). Editor's copy: five (adds person-identity). Governance (missions) is orthogonal.",
      },
      {
        aspect: "Registration",
        left: "Pre-register, DCR (RFC 7591), or CIMD (URL as client_id).",
        right: "No AS-issued client_id. Agent provider issues aa-agent+jwt; resource fetches JWKS via iss+dwk.",
      },
    ],
    takeaway:
      "Use OAuth 2.1 where the API already is an OAuth RS (including MCP). Evaluate AAuth when the agent must identify itself to strangers without portals, or when you want signed requests instead of bearer tokens. Many systems will run both.",
    fieldNotes: [
      {
        title: "Complement, do not replace",
        body: "AAuth's own text says it complements OAuth. An MCP HTTP server in 2026 is still an OAuth 2.1 RS. Putting AAuth signatures on that same server is an extra profile, not what the MCP spec requires. CIMD is the OAuth WG's milder answer to 'no portal'.",
      },
      {
        title: "Four vs five modes",
        body: "Pin draft-10 if you need a datatracker snapshot. Pin the editor's copy if you need person tokens (aa-person+jwt) and person_token_endpoint. Interop between those two snapshots will fail on typ and endpoint names (token_endpoint vs auth_token_endpoint).",
      },
    ],
  },
  {
    slug: "delegated-vs-p2p",
    title: "User-delegated vs p2p agent-to-agent",
    subtitle:
      "'P2P' is overloaded. Next to AAuth it means two-party/identity-based access. In other rooms it means A2A communication or did:peer/DIDComm. None of those is a single IETF 'p2p RFC'.",
    leftTitle: "User-delegated (agent acts for a human)",
    rightTitle: "Peer / agent-to-agent (no user in the hop)",
    specSlugs: ["oauth-2-1", "token-exchange", "aauth", "a2a", "did-peer", "wimse-arch"],
    rows: [
      {
        aspect: "Who is the principal?",
        left: "The user (OIDC sub) plus the agent as actor (client_id or act).",
        right:
          "The calling agent (AAuth agent token, WIMSE/SPIFFE ID, A2A card, or did:peer). Pick one stack — they are not interchangeable identifiers.",
      },
      {
        aspect: "AAuth meaning of p2p",
        left: "AAuth three-party (PS-asserted) and four-party (federated) still have a user in the loop via the person server.",
        right:
          "AAuth identity-based: signed request, resource policy on agent identity, no PS, no AS. AAuth resource-managed (two-party): still no external AS; the resource runs its own login and issues an opaque session bound to the signature.",
      },
      {
        aspect: "A2A meaning of p2p",
        left: "A2A can carry a user-delegated OAuth token if the Agent Card says so (authorization code flow on the card).",
        right:
          "A2A v1.0 is a task protocol. Discovery is an Agent Card. Request auth is ordinary HTTP (OAuth, OIDC, mTLS, API keys) obtained out of band. Signed cards prove card integrity, not the request.",
      },
      {
        aspect: "did:peer / DIDComm meaning of p2p",
        left: "Not a user-delegation protocol. A VC about a user could be presented later, but that is OpenID4VP, not did:peer itself.",
        right:
          "Pairwise, self-certifying DIDs stored by the parties. DIDComm authcrypt messages. Not globally resolvable. Poor fit for a stranger's first HTTP call to an open API.",
      },
      {
        aspect: "Typical protocol (delegated vs peer)",
        left: "OAuth 2.1 authorization code / CIBA / XAA / AAuth three- or four-party.",
        right:
          "AAuth identity-based or two-party; A2A with mTLS/OAuth client credentials; WIMSE WIT+WPT inside a mesh; DIDComm authcrypt in SSI stacks.",
      },
      {
        aspect: "Consent",
        left: "Required unless enterprise policy (XAA) already authorized the connection.",
        right:
          "Resource policy on agent identity; no human in the hop. Humans may have pre-authorized the agent. AAuth two-party is the exception: the resource may still run a login page.",
      },
      {
        aspect: "Tokens",
        left: "Access token with sub=user, client_id/act=agent, aud=API. Prefer DPoP/mTLS.",
        right:
          "AAuth: agent token in Signature-Key, optional opaque session. A2A: often Bearer client-credentials. WIMSE: WIT+WPT, never WIT as bearer. did:peer: keys in the DID document, no OAuth token.",
      },
      {
        aspect: "Failure mode",
        left: "Confused deputy: agent uses user authority at the wrong API (missing aud / resource).",
        right:
          "Impersonation of a high-privilege agent; unconstrained agent-to-agent chaining (WIMSE §3.4.11 warns about this). A2A in-band credentials leak across hops.",
      },
    ],
    takeaway:
      "Design the hop explicitly: is this call on behalf of a user, or is it one workload talking to another? Then pick OAuth-delegation machinery or one specific peer stack — AAuth two-party, A2A, or did:peer — not a mash-up. Putting a user access token on an A2A call without audience and actor binding is how you mint a confused deputy.",
    fieldNotes: [
      {
        title: "There is no 'p2p RFC'",
        body: "Searching datatracker for a document titled P2P in this cluster will not yield a protocol. The word is a meeting shorthand. This site uses 'p2p' on flow pages only with a qualifier: AAuth identity-based, AAuth two-party, or A2A.",
      },
      {
        title: "AAuth two-party is not A2A",
        body: "AAuth resource-managed mode is still HTTP request/response with RFC 9421 signatures and an optional opaque session. A2A is tasks, skills, Agent Cards, JSON-RPC/gRPC. You can run A2A on top of AAuth-signed HTTP, but neither spec requires the other.",
      },
      {
        title: "AAuth identity-based is not did:peer",
        body: "Identity-based AAuth publishes an agent identifier at a well-known URL so a stranger can verify a first request. did:peer is deliberately not globally resolvable; the parties already exchanged DID documents. Use did:peer for private pairwise relationships; use AAuth identity-based for open-world HTTP APIs.",
      },
      {
        title: "Editor's person-identity mode is still not 'just p2p'",
        body: "The editor's copy adds person-identity: the resource accepts who the person is from a person server without a grant of operations. That hop has a user identifier and no AS, which confuses the delegated-vs-p2p binary. Treat it as federated login, not as identity-based agent access.",
      },
    ],
  },
];

export function getCompare(slug: string): CompareView | undefined {
  return compares.find((item) => item.slug === slug);
}
