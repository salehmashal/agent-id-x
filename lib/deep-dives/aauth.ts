import type { SpecDeepDive } from "@/lib/types";

export const aauthDeepDive: SpecDeepDive = {
  agentGap: [
    "OAuth 2.0 and OpenID Connect were designed for applications that a human installs or a developer pre-registers: a client_id minted by each authorization server, a browser redirect for consent, a bearer access token, and a static scope string. An AI agent that discovers a new HTTP resource at runtime has none of those luxuries. It is not a user. It is not a workload identity inside one mesh. It is an HTTP client that must prove who it is to a stranger, then obtain a grant that may involve a human mid-task.",
    "The gap AAuth names is therefore four principals, not one: the user (person), the agent instance (cryptographic identity), the resource (the tool or API), and optionally a resource-side access server. Vanilla OAuth collapses the agent into 'the client' and gives it no portable identity. SPIFFE/WIMSE name the binary inside a trust domain but do not, by themselves, get the agent accepted at an arbitrary internet resource or carry user consent. MCP authorization reuses OAuth 2.1 for host-to-tool access and still assumes an AS that will issue a client identifier.",
    "AAuth's premise, quoted from draft-10's introduction, is that every agent has its own cryptographic identity: an identifier of the form aauth:local@domain bound to a signing key, published at a well-known URL, verifiable by any party — no pre-registration, no shared secrets, no dependency on a particular server. At its simplest the agent signs a request and the resource decides from who the agent is. That identity-based access is the foundation; authorization, governance, and federation are additive.",
  ],
  trustBoundaries: [
    "The agent is any HTTP client with a key and an agent token. It trusts its agent provider (who issued the agent token and hosts JWKS) and, if it has one, its person server. It does not have to trust the resource's access server until a four-party hop; it never treats a resource-issued opaque session token as something it can inspect.",
    "The agent provider is an identity issuer, not an OAuth authorization server. It attests 'this key speaks for this agent identifier'. Compromise of the provider's signing key is compromise of every agent it vouches for. The resource fetches the provider's JWKS via the token's iss and dwk; that fetch is a trust-boundary crossing (SSRF, mix-up of iss, stale JWKS).",
    "The resource is the verifier of signatures and the enforcer of its own policy. In identity-based and resource-managed modes it never talks to a person server. In three-party mode it issues a resource token whose audience is the person server and later verifies an auth token whose issuer is that PS. In four-party mode the resource token's audience is the resource's own access server; the PS federates to that AS. The resource must not confuse a person token (identity of the user) with an auth token (a grant).",
    "The person server represents the user: consent, missions, permission/audit/interaction relay. It is the only party that calls an access-server token endpoint in four-party mode. The user/person authenticates to the PS or to the resource's own login, never by handing a password to the agent. Draft-10 treats the PS as optional; an agent without a ps claim cannot complete auth-token flows.",
    "The access server (AS in AAuth's vocabulary) is a resource-side policy engine, not the user's IdP. Do not mash it together with an OIDC OP. Four-party federation is PS → resource AS, which is also not OpenID Federation 1.1.",
  ],
  mechanics: [
    "Wire authentication is HTTP Message Signatures (RFC 9421) plus HTTP Signature Keys (draft-hardt-httpbis-signature-key). Every signed request carries Signature-Key, Signature-Input, and Signature. AAuth presents the agent token (or, in the editor's copy, a person token or auth token) in Signature-Key with scheme=jwt. The cnf.jwk in that JWT is the signing key; a stolen JWT without the private key cannot produce a valid signature.",
    "Challenges replace browser redirects. A 401 carries AAuth-Requirement (for example requirement=agent-token, interaction, or auth-token). AAuth-Capabilities advertises what the resource can do. Subsequent resource-managed calls may present an opaque session via Authorization: AAuth <token> and/or AAuth-Access. AAuth-Mission can bind a content-addressed mission. These header names are from the draft; do not invent parallel names.",
    "Well-known documents are discovered with the dwk ('dot well-known') parameter from Signature-Key: aauth-agent.json, aauth-resource.json, aauth-person.json, aauth-access.json at {iss}/.well-known/{dwk}. Resource metadata may declare access_mode (advisory): in draft-10 the values are agent-token, aauth-access-token, and auth-token. The editor's copy adds person-token and renames the opaque credential a session token (session-token).",
    "JWT types in draft-10: aa-agent+jwt (identity of the agent; sub is the agent identifier; cnf.jwk binds the key; optional ps names the person server), aa-resource+jwt (issued by the resource to describe the access that needs authorizing; aud is the PS or AS that may redeem it; recommended lifetime five minutes or less), aa-auth+jwt (the grant; iss is PS or AS; aud is the resource; user claims such as sub, optional email/tenant/groups/roles; consented scope or R3 grants; cnf bound to the agent's key; MUST NOT exceed one hour). The editor's copy adds aa-person+jwt: a directed identifier of the person at one resource. It identifies; it does not authorize. A recipient MUST reject aa-person+jwt wherever an auth token is required.",
    "Person-server endpoints in draft-10 include a token_endpoint that accepts a resource token and returns an auth token (or 202 + interaction if the user must approve). The editor's copy splits this: person_token_endpoint (REQUIRED) and auth_token_endpoint (renamed from token_endpoint). Four-party: the PS discovers {aud}/.well-known/aauth-access.json and calls the AS token endpoint. Auth tokens reuse RFC 8693 act for delegation chains. Call chaining uses upstream_token / subagent_token so a sub-agent signs with its own key while nested act records the parent.",
    "Governance is orthogonal to access mode. Missions are natural-language (Markdown) intent, immutable via s256. Permission, audit, and interaction relay through the PS even when the resource is in identity-based mode. R3 (companion draft) replaces coarse scopes with vocabulary operations, including per-call approval.",
  ],
  claims: [
    {
      name: "typ: aa-agent+jwt",
      meaning:
        "Quoted from draft-10: agent identity JWT. sub is the agent identifier (aauth:local@domain). cnf.jwk is the signing key. Optional ps names the person server. Lifetime SHOULD NOT exceed 24 hours in the editor's copy.",
      source: "quoted",
    },
    {
      name: "typ: aa-auth+jwt",
      meaning:
        "Quoted from draft-10: the grant. Required payload claims include iss, dwk, aud (the resource), jti, agent, cnf.jwk, iat, exp. Lifetime MUST NOT exceed 1 hour. Optional act, user claims, scope / R3 fields, mission_s256.",
      source: "quoted",
    },
    {
      name: "typ: aa-resource+jwt",
      meaning:
        "Quoted from draft-10: issued by the resource; aud is the PS (three-party) or AS (four-party). Short-lived (five minutes recommended). Carries what needs authorizing so the PS/AS can show consent UX.",
      source: "quoted",
    },
    {
      name: "typ: aa-person+jwt",
      meaning:
        "Quoted from the editor's copy (absent from draft-10's four-mode table): directed person identifier at one resource. Identifies, does not authorize. MUST NOT be accepted where an auth token is required.",
      source: "quoted",
    },
    {
      name: "AAuth-Requirement / AAuth-Access / AAuth-Capabilities",
      meaning:
        "Quoted header names from draft-10. Challenges, opaque session/auth presentation, and capability discovery. Not WWW-Authenticate: Bearer.",
      source: "quoted",
    },
    {
      name: "Signature-Key: scheme=jwt",
      meaning:
        "Quoted usage: the JWT (agent, and in the editor's copy person or auth token) rides in Signature-Key. Cover the signature-key component in the RFC 9421 signature base so the header cannot be swapped.",
      source: "quoted",
    },
    {
      name: "access_mode=agent-token | aauth-access-token | auth-token",
      meaning:
        "Quoted from draft-10 resource metadata. Advisory. Editor's copy registry: agent-token, person-token, session-token, auth-token (R3 adds per-call).",
      source: "quoted",
    },
    {
      name: "Authorization: AAuth <session>",
      meaning:
        "Illustrative of resource-managed presentation in draft-10 examples. The session is opaque to the agent; the signature still binds the request. Do not copy example token values from blogs as test vectors.",
      source: "illustrative",
    },
  ],
  flows: [
    {
      id: "identity-based",
      title: "Identity-based (peer) — no PS, no AS",
      when: "Draft-10 §4.1.1 / editor 'agent identity'. The resource decides from cryptographic agent identity alone. This is the AAuth meaning of p2p.",
      steps: [
        "Agent provider issues aa-agent+jwt bound to the agent's signing key and publishes JWKS at the well-known document named by dwk.",
        "Agent sends a signed HTTP request: Signature-Key (scheme=jwt, the agent token) + Signature-Input + Signature covering method, authority, path, and the key-identifying header.",
        "Resource verifies RFC 9421, checks typ, exp, cnf.jwk against the signature, and fetches/caches issuer JWKS if needed.",
        "Resource applies local policy to the agent identifier (allow, deny, or rate-limit). No token exchange, no redirect, no person server.",
        "If the request lacked an AAuth agent token, the resource MAY 401 with requirement=agent-token.",
      ],
      notes:
        "The resource learns who the agent is, not which human it serves. For user claims, step up to resource-managed, person-identity (editor), or PS-asserted mode.",
    },
    {
      id: "resource-managed",
      title: "Resource-managed (two-party)",
      when: "Draft-10 §4.1.2. Still no external AS. The resource runs consent, account linking, or payment itself.",
      steps: [
        "Agent makes a signed call with its agent token.",
        "Resource returns 401 or 202 with AAuth-Requirement describing interaction (URL, wait, etc.). First call can be registration.",
        "User completes the resource's own page — which MAY wrap ordinary OAuth/OIDC behind the resource.",
        "Resource issues an opaque session (draft-10: via AAuth-Access; editor: session token) bound to the agent's signature.",
        "Subsequent calls: HTTP signature plus the opaque credential. Stolen session without the key should not replay.",
      ],
      notes:
        "Two-party is p2p in the sense of agent↔resource, not DIDComm. The resource may stuff an OAuth access token inside the opaque session; the agent must not fish it out and replay it as Bearer elsewhere.",
    },
    {
      id: "person-identity",
      title: "Person-identity (editor's copy only)",
      when: "Editor's fifth mode. Not in draft-10's four-mode table. Resource accepts who the person is from the PS, without a grant of operations.",
      steps: [
        "Agent token carries ps. Resource challenges with requirement=person-token (editor).",
        "Agent calls the PS person_token_endpoint with resource, mission_s256, optional subagent/upstream tokens.",
        "PS authenticates the person (if needed) and issues aa-person+jwt directed at that resource. Consent here is 'may this agent act at this resource as this person', not a scope list.",
        "Agent retries with the person token in Signature-Key. Resource verifies typ aa-person+jwt and serves whatever it serves to signed-in people.",
        "If a later operation needs a grant, the resource must demand an auth token; it MUST NOT treat the person token as one.",
      ],
      notes:
        "Pin the editor's copy if you implement this. Interop against draft-10 implementations that never heard of person tokens will fail closed — or worse, fail open if typ is not checked.",
    },
    {
      id: "three-party",
      title: "PS-asserted (three-party)",
      when: "Draft-10 §4.1.3 / editor 'PS authorization'. Resource has no AS. User claims and consent come from the agent's person server.",
      steps: [
        "Agent signs a request. Resource sees ps on the agent token (or already has a relationship).",
        "Resource 401s with requirement=auth-token and a resource token (aa-resource+jwt, aud = PS, ~five minutes).",
        "Agent POSTs the resource token to the PS token_endpoint (editor: auth_token_endpoint), signed with the agent key.",
        "If the user must approve a mission or scope, PS returns 202 + interaction. User approves at the PS, not at the resource.",
        "PS issues aa-auth+jwt with user claims (sub, optional email/tenant/groups/roles) and consented scope or R3 grants, cnf-bound to the agent key, aud = resource, exp ≤ 1 hour.",
        "Agent retries; resource verifies the auth token (iss = PS, aud = itself, cnf matches the signature) and applies its own policy to (iss, sub).",
      ],
      notes:
        "sub is directed per issuer. The same email from two person servers is two subjects. The resource still decides what that subject may do.",
    },
    {
      id: "four-party",
      title: "Federated (four-party)",
      when: "Draft-10 §4.1.4 / editor 'federated authorization'. Resource has its own access server. The agent still talks only to the resource and its PS.",
      steps: [
        "Same first call as three-party, but the resource token's aud is the resource's access server URL.",
        "Agent still POSTs the resource token to its PS. The agent does not call the AS.",
        "PS discovers {aud}/.well-known/aauth-access.json and federates to the AS token endpoint with the resource token and the agent token.",
        "AS evaluates resource policy and returns an auth token (iss = AS, dwk = aauth-access.json). PS may pass clarifications back via 202.",
        "Agent presents the auth token to the resource. Resource verifies against the AS JWKS.",
      ],
      notes:
        "This is not OpenID Federation and not identity chaining (RFC 8693 + 7523 across OAuth domains), though it rhymes. The PS is the only party that calls AS token endpoints.",
    },
  ],
  layerDetail: [
    "Identity: the agent token says which agent; the person token (editor) and auth-token user claims say which person; (iss, sub) at the PS is the user identifier. The agent identifier is not a client_id and not a SPIFFE ID.",
    "Authentication: RFC 9421 signatures proving possession of cnf.jwk on every request. Not bearer possession of a JWT. Signature-Key is how the verifier gets the key; it is not itself a grant.",
    "Authorization: auth tokens, opaque sessions, missions, R3 grants, and the resource's local policy. Identity-based mode is authorization-by-identity-list at the resource. Do not call a person token an authorization.",
  ],
  composition: [
    {
      specSlug: "oauth-2-1",
      how: "AAuth says it complements OAuth rather than replacing it. Where the API is already an OAuth 2.1 resource server (MCP included), keep PKCE, PAR, audience-restricted tokens. Use AAuth when the agent must identify itself to a resource that will not mint a client_id, or when you want signatures instead of bearer tokens.",
    },
    {
      specSlug: "oidc-core",
      how: "Auth-token user claims reuse OIDC names (sub, email, groups, roles) so identity-aware resources can keep their user model. AAuth does not issue an ID Token and does not make the resource an OpenID relying party. The person server may itself be backed by OIDC for how the human signs in.",
    },
    {
      specSlug: "http-signature-keys",
      how: "Normative dependency. Without Signature-Key schemes (jwt, jwks_uri, …) and dwk well-known discovery, the resource cannot bootstrap a stranger's key on the first request.",
    },
    {
      specSlug: "http-message-signatures",
      how: "The cryptographic primitive. AAuth profiles RFC 9421 rather than inventing HMAC headers. Cover @method, @authority, @path, and signature-key.",
    },
    {
      specSlug: "token-exchange",
      how: "AAuth auth tokens may carry RFC 8693 act for parent/sub-agent chains. That is not the OAuth token-exchange grant; there is no AS token endpoint in identity-based or two-party modes. Cross-domain OAuth hops still use RFC 8693 + 7523 / identity chaining.",
    },
    {
      specSlug: "dpop",
      how: "Different PoP. DPoP is an application-layer proof JWT on OAuth resource requests (Authorization: DPoP). AAuth uses HTTP Message Signatures. Do not stack proofs naively or skip covering the key header.",
    },
    {
      specSlug: "wimse-arch",
      how: "Overlapping problem, different deployment scope. WIMSE/SPIFFE name the workload inside and across systems that share trust anchors. AAuth targets open-world HTTP resources that will fetch a well-known JWKS. An agent can have both: WIT/WPT inside the mesh, AAuth at the internet resource.",
    },
    {
      specSlug: "mcp-auth",
      how: "MCP HTTP authorization is OAuth 2.1 + RFC 9728. It does not give the model a cryptographic agent identity. If an MCP server also verified AAuth signatures, that would be a profile on top — not what the 2026-07-28 MCP spec requires.",
    },
    {
      specSlug: "aauth-r3",
      how: "Optional structured authorization. Scopes remain in the core protocol; R3 is how operations in OpenAPI/MCP/GraphQL vocabularies become the grant, including per-call.",
    },
    {
      specSlug: "aims",
      how: "AIMS says compose existing IETF tools (WIMSE + OAuth). AAuth says those tools are insufficient for open-world HTTP clients. Read both; they disagree on whether you need a new protocol.",
    },
  ],
  pitfalls: [
    {
      title: "Draft-10 vs editor's five modes",
      body: "Datatracker HTML of draft-hardt-oauth-aauth-protocol-10 (6 August 2026) defines four resource access modes. The editor's copy (fetched September 2026, expires 18 March 2027) defines five, adding person-identity, aa-person+jwt, person_token_endpoint, and renaming token_endpoint → auth_token_endpoint. Implement against a pinned snapshot. Interop will fail if one side expects person tokens.",
    },
    {
      title: "typ confusion (fail open)",
      body: "The editor's copy is explicit: check typ before acting on any AAuth JWT; reject aa-person+jwt where an auth token is required; deployments SHOULD test this because it fails open. Mixing agent, person, resource, and auth tokens in the same slot is the local analogue of using an ID Token as an access token.",
    },
    {
      title: "Sender constraint is the signature",
      body: "If you accept the JWT from Signature-Key without verifying RFC 9421 over the request and the key header, you have reinvented bearer tokens. Cover signature-key in the signature base.",
    },
    {
      title: "Audience and confused deputy",
      body: "Auth tokens are audience-restricted to the resource. Resource tokens are audience-restricted to the PS or AS. Presenting an auth token minted for resource A at resource B is a confused-deputy bug. Missions bind intent via s256; do not let the agent swap mission text after approval.",
    },
    {
      title: "Overbroad act / call chaining",
      body: "Nested act records parent agents. Attenuate what a sub-agent may do. Draft-10 call chaining was still incomplete in some JS packages at research time. Never expand grants at a hop. Four-party AS policy must see the real agent keys, not a spoofable name.",
    },
    {
      title: "Token replay and lifetime",
      body: "Resource tokens ~five minutes; auth/person tokens ≤ 1 hour; agent tokens up to ~24 hours in the editor's copy. Revocation is best-effort via endpoints; verifiers check signatures locally and may not hear a revoke. The editor recommends refreshing when fewer than five minutes remain. Clock skew: exp is judged by the verifier with no tolerance in the editor's copy.",
    },
    {
      title: "Mix-up of iss / dwk / well-known fetch",
      body: "The resource fetches JWKS from a URL derived from iss + dwk. Validate TLS, bind iss, and do not let an attacker point dwk at an unexpected host (SSRF). This is the AAuth-shaped cousin of OAuth mix-up.",
    },
    {
      title: "Individual draft, not a WG item",
      body: "Not endorsed by the IETF, no RFC number, intended standards track only as a personal statement. Do not tell compliance it is 'the IETF agent standard'. Pin revisions. Complements OAuth; does not obsolete RFC 9700.",
    },
  ],
  stabilityDetail: [
    "Published snapshot: draft-hardt-oauth-aauth-protocol-10, 6 August 2026, expires 7 February 2027, individual Internet-Draft, replaces draft-hardt-aauth-protocol. Author: D. Hardt (Hellō). Datatracker: https://datatracker.ietf.org/doc/draft-hardt-oauth-aauth-protocol/. HTML: draft-hardt-oauth-aauth-protocol-10.",
    "Editor's copy at https://dickhardt.github.io/AAuth/draft-hardt-oauth-aauth-protocol.html (fetched 15 September 2026) is ahead: five modes, person tokens, endpoint renames. aauth.dev and explorer.aauth.dev track the moving copy. Implementations (TypeScript @aauth/*, .NET AAuth NuGet samples) exist at exploratory maturity.",
    "What you can ship today: experiment behind a pin; do not bet a compliance program on wire stability. For production user-delegated APIs, ship OAuth 2.1 + RFC 9700 now and keep AAuth in the evaluation track. Re-read datatracker before every release.",
  ],
};

export const httpSignatureKeysDeepDive: SpecDeepDive = {
  agentGap: [
    "RFC 9421 tells you how to sign an HTTP message. It deliberately does not tell the verifier how to get the public key. Agents that are strangers to the resource cannot rely on a pre-shared JWKS URL configured in a portal. Something on the request has to carry or point at the key, with a scheme the verifier understands.",
    "HTTP Signature Keys is that missing bootstrapping layer. AAuth hangs the agent token in Signature-Key. Without this draft (or an equivalent), AAuth identity-based access cannot start. Workload identities that already have a mesh trust bundle may not need it; open-world HTTP agents do.",
  ],
  trustBoundaries: [
    "The signer asserts a key via a scheme: inline (hwk), JWT (jwt, self-jwt, jkt-jwt), JWKS fetch (jwks, jwks_uri), X.509, or a cache handle. Each scheme has a different trust story. jwt means 'trust this JWT's issuer to name the key'; hwk means 'here is a key with no identity'; x509 means 'walk a PKI'. Mixing schemes without policy is how you accept a throwaway key as if it were an agent.",
    "The verifier must fetch jwks_uri / well-known documents carefully (TLS, SSRF allow-lists). Accept-Signature-Scheme and Accept-Signature-Alg let the server say what it will take before the client signs. Signature-Error structures failures so clients can retry with a different scheme rather than guessing.",
  ],
  mechanics: [
    "Draft-hardt-httpbis-signature-key-09 (13 September 2026) defines five header fields for use with RFC 9421. Signature-Key carries the key or a pointer. Accept-Signature-Scheme and Accept-Signature-Alg (response) advertise what the server accepts. Signature-Error reports structured verification failures. Signature-Key-Cache issues a cache identifier so a later request can reference a previously presented assertion instead of resending it.",
    "Eight initial schemes in -09: hwk (pseudonymous inline keys), jkt-jwt (self-issued key delegation via JWK thumbprint JWTs), jwks_uri (identified signers with JWKS URI discovery), jwks (direct JWKS fetch), jwt (JWT-based delegation — AAuth's scheme), self-jwt, x509, and cached. Catalog text that only listed hwk/jwt/jwks_uri/jkt-jwt/x509 is incomplete relative to -09.",
    "dwk ('dot well-known') is how AAuth pins metadata document names: {iss}/.well-known/{dwk}. Cover the signature-key component in the signature base so an attacker cannot swap the header after the fact. Authors of -09: D. Hardt (Hellō) and T. Meunier (Cloudflare) — the catalog previously listed Hardt alone.",
  ],
  claims: [
    {
      name: "Signature-Key",
      meaning:
        "Quoted header. Conveys or references the verification key for this request. Parameters include scheme and scheme-specific members.",
      source: "quoted",
    },
    {
      name: "scheme=jwt | hwk | jwks_uri | jwks | jkt-jwt | self-jwt | x509 | cached",
      meaning:
        "Quoted initial schemes from draft-09. AAuth uses jwt for agent/person/auth tokens. hwk is a key without an identity issuer.",
      source: "quoted",
    },
    {
      name: "dwk",
      meaning:
        "Quoted parameter used with JWT schemes to name the well-known metadata document (AAuth: aauth-agent.json, aauth-resource.json, aauth-person.json, aauth-access.json).",
      source: "quoted",
    },
    {
      name: "Accept-Signature-Scheme / Signature-Error / Signature-Key-Cache",
      meaning:
        "Quoted companion headers in -09. Negotiation, structured errors, and cache handles. Not present in RFC 9421 itself.",
      source: "quoted",
    },
  ],
  flows: [
    {
      id: "jwt-first-call",
      title: "First call with scheme=jwt (AAuth-shaped)",
      steps: [
        "Client holds a JWT whose cnf.jwk is the signing key (agent token or similar).",
        "Client signs the HTTP request per RFC 9421, covering signature-key, and sends Signature-Key with scheme=jwt and the JWT.",
        "Server reads scheme, validates the JWT (typ, iss, exp, signature via JWKS at iss + dwk), extracts cnf.jwk, verifies the HTTP signature.",
        "On failure the server MAY return Signature-Error describing scheme/alg problems; the client may retry with a scheme from Accept-Signature-Scheme.",
      ],
    },
    {
      id: "hwk-pseudo",
      title: "Pseudonymous inline key (hwk)",
      when: "When the server is willing to accept a key with no issuer-backed identifier.",
      steps: [
        "Client puts an inline JWK in Signature-Key with scheme=hwk and signs the request.",
        "Server verifies the signature with that key and applies policy for 'unidentified key' (often deny except for specific endpoints).",
      ],
      notes:
        "Useful for privacy-preserving proofs. Not a substitute for an agent identifier when the resource must audit who called.",
    },
  ],
  layerDetail: [
    "This document is key distribution for authentication. It does not define who the signer is (that is the JWT profile or the certificate) and it does not define what the signer may do (AAuth auth tokens, OAuth, local policy).",
    "AAuth uses it as the identity presentation layer: the agent token rides in Signature-Key. WIMSE has its own WIT header plus WPT; do not assume Signature-Key is how WITs travel.",
  ],
  composition: [
    {
      specSlug: "http-message-signatures",
      how: "RFC 9421 is the signature algorithm and component coverage. This draft is the key-discovery companion the RFC left to applications.",
    },
    {
      specSlug: "aauth",
      how: "Normative building block. AAuth's first-call identity is Signature-Key + jwt + dwk well-knowns.",
    },
    {
      specSlug: "dpop",
      how: "DPoP puts a JWK in the proof JWT's header and a thumbprint in cnf.jkt on the access token. Different header, different protocol. A resource that speaks both must not confuse a DPoP proof with Signature-Key.",
    },
    {
      specSlug: "jwt",
      how: "jwt / jkt-jwt / self-jwt schemes are JWT profiles riding in an HTTP header. Validate typ, alg allow-lists, and iss as the profile requires.",
    },
    {
      specSlug: "wimse-wpt",
      how: "WPT is another application-layer PoP (Authorization: WPT plus Workload-Identity-Token). Complementary, not interchangeable.",
    },
  ],
  pitfalls: [
    {
      title: "Uncovered Signature-Key",
      body: "If signature-key is not a covered component, an attacker who can modify headers swaps in their JWT/key. The signature still verifies over the rest of the request.",
    },
    {
      title: "Scheme confusion",
      body: "Accepting hwk where you meant jwt means any key is an identity. Policy must be per-scheme.",
    },
    {
      title: "SSRF on jwks_uri / dwk",
      body: "Fetching attacker-controlled URLs from a signature header is a classic SSRF. Allow-list hosts, require HTTPS, cap redirects.",
    },
    {
      title: "Individual draft churn",
      body: "-09 added authors, cache headers, and more schemes versus earlier catalog summaries. Pin the revision. Not a WG HTTPBIS document despite the 'httpbis' in the filename.",
    },
  ],
  stabilityDetail: [
    "draft-hardt-httpbis-signature-key-09, 13 September 2026, expires 17 March 2027, individual, intended standards track. Authors: D. Hardt, T. Meunier. Datatracker: https://datatracker.ietf.org/doc/draft-hardt-httpbis-signature-key/.",
    "Designed as a building block for AAuth and other applications (the draft's abstract mentions flexible trust models from pseudonymous to PKI). You can prototype with AAuth; you cannot cite an RFC number yet.",
  ],
};

export const aauthR3DeepDive: SpecDeepDive = {
  agentGap: [
    "OAuth scopes are strings like invoices.write. RAR (RFC 9396) adds typed JSON authorization_details, still in a vocabulary the AS invented. Agents already speak OpenAPI operations, MCP tool names, gRPC methods, GraphQL fields. Asking a human to approve a second vocabulary is how you get rubber-stamp consent.",
    "R3 lets a resource publish a content-addressed authorization document in the agent's native vocabulary, including which operations are fully grantable and which still need a human per call. That is the agent-native cousin of RAR, sitting on AAuth rather than on an OAuth authorize query string.",
  ],
  trustBoundaries: [
    "The resource authors the R3 document and the vocabulary. The person server or access server shows it to the user and puts hashes and granted operations on the auth token. The agent must not be able to swap the document after approval (r3_s256). The resource must enforce the granted set, not trust the agent's memory of the conversation.",
  ],
  mechanics: [
    "Editor's copy draft-hardt-aauth-r3-latest, published 14 September 2026 (catalog previously cited 3 September), expires 18 March 2027, marked 'Status: Exploratory Draft'. Not obviously on datatracker as a numbered I-D at fetch time — canonical HTML is the GitHub editor's copy.",
    "Resources advertise r3_vocabularies in metadata and annotate individual operations with the credential each requires (so an agent can plan before a 401). Agents include r3_operations when requesting authorization. Auth tokens carry r3_uri, r3_s256, r3_granted, and optional r3_per_call. Fully granted operations execute immediately; per-call operations require a proposal bound to that invocation.",
    "The document addresses five limits of scopes: human comprehension, machine precision, audit completeness (which version was approved), call-specific consequence (parameters and state, not just the operation name), and agent planning (per-operation credential requirements rather than one resource-wide access_mode).",
  ],
  claims: [
    {
      name: "r3_uri / r3_s256",
      meaning:
        "Quoted from the R3 editor's copy: content-addressed R3 document in effect at approval time. The hash is the audit provenance.",
      source: "quoted",
    },
    {
      name: "r3_granted",
      meaning:
        "Quoted: operations fully authorized by the grant. Resource enforces this set.",
      source: "quoted",
    },
    {
      name: "r3_per_call",
      meaning:
        "Quoted: operations that still need per-invocation approval (proposal bound to that call).",
      source: "quoted",
    },
    {
      name: "access_mode per operation (R3 annotation)",
      meaning:
        "Quoted direction: R3 can state the AAuth access mode for an individual operation. Editor AAuth registry includes per-call as an R3 addition.",
      source: "quoted",
    },
  ],
  flows: [
    {
      id: "r3-grant",
      title: "Grant with vocabulary operations",
      steps: [
        "Resource publishes an R3 document and vocabularies; metadata points at them and hashes them.",
        "Agent requests authorization including r3_operations in the native vocabulary (for example MCP tool names).",
        "PS/AS shows a human-displayable rendering. User approves a subset. Auth token gets r3_uri, r3_s256, r3_granted, maybe r3_per_call.",
        "Agent calls a granted operation with the usual AAuth signature + auth token. Resource checks hash and set.",
        "For a per-call operation the agent submits a proposal; the PS interaction path approves that invocation.",
      ],
    },
  ],
  layerDetail: [
    "Authorization detail and consent UX. Does not replace AAuth identity or HTTP signatures. Does not replace OAuth RAR inside vanilla OAuth — if you are on MCP/OAuth, RFC 9396 is the structured-scope tool; R3 is the AAuth-shaped analogue.",
  ],
  composition: [
    {
      specSlug: "aauth",
      how: "Extension. Core AAuth still works with scopes. R3 attaches when the resource advertises vocabularies.",
    },
    {
      specSlug: "rar",
      how: "Cousin, not a profile. RAR is RFC 9396 authorization_details on OAuth requests. R3 is content-addressed vocabularies on AAuth auth tokens. Do not send R3 fields to an OAuth AS and expect them to work.",
    },
    {
      specSlug: "mcp-auth",
      how: "MCP tool lists are the obvious vocabulary. That does not change MCP's OAuth 2.1 transport. Bridging would be a new profile.",
    },
    {
      specSlug: "oauth-2-1",
      how: "No direct wire relationship. If you stayed in OAuth, use RAR + PAR instead of R3.",
    },
  ],
  pitfalls: [
    {
      title: "Exploratory, maybe not on datatracker",
      body: "Do not treat R3 as a stable IETF document. Confirm whether a given revision is posted to datatracker. Pin the GitHub HTML you implemented.",
    },
    {
      title: "Hash swap",
      body: "If you check r3_granted but not r3_s256 against the document you published, the agent can pair an old grant with a new, wider document.",
    },
    {
      title: "Per-call is still human-in-the-loop",
      body: "r3_per_call is not 'the model may always drop_table'. It is CIBA-shaped approval for that invocation, in AAuth clothing.",
    },
  ],
  stabilityDetail: [
    "Editor's copy https://dickhardt.github.io/AAuth/draft-hardt-aauth-r3.html dated 14 September 2026, exploratory, expires 18 March 2027. Source markdown in the AAuth GitHub repo. Individual work, not a WG item. Ship only in experiments that already pin AAuth.",
  ],
};
