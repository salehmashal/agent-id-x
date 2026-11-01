import {
  egChip,
  specChip,
  type AgentFlow,
  type FlowStep,
  type PayloadChip,
  type TopologyKind,
} from "@/lib/types";

export type PacketKind =
  | "request"
  | "token"
  | "id-token"
  | "proof"
  | "challenge"
  | "card"
  | "consent"
  | "session"
  | "code";

export interface AnimationActor {
  id: string;
  label: string;
  kind: TopologyKind;
}

export interface AnimationPacket {
  kind: PacketKind;
  label: string;
}

export interface AnimationHeldToken {
  actorId: string;
  label: string;
  packet: PacketKind;
}

export interface AnimationStep {
  id: string;
  from: string;
  to: string;
  action: string;
  note?: string;
  chapter?: string;
  durationMs?: number;
  packet?: AnimationPacket;
  challenge?: boolean;
  fail?: boolean;
  tokensAppear?: AnimationHeldToken[];
  why?: string;
  caption?: string;
  citation?: string;
  chips?: PayloadChip[];
  now?: string;
}

export interface ProtocolAnimation {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  actors: AnimationActor[];
  steps: AnimationStep[];
  footnote?: string;
  loop?: boolean;
  /** Protocol or cluster name, e.g. OAuth 2.1. */
  protocol?: string;
  /** Question this sequence answers. */
  question?: string;
  /** Shown on the last hop of a loop. */
  takeaway?: string;
}

export const DEFAULT_DURATION_MS = 2600;

function actor(
  id: string,
  label: string,
  kind: TopologyKind,
): AnimationActor {
  return { id, label, kind };
}

/** Pedagogy every hop must carry so a beginner never hits a silent skip. */
type HopPedagogy = {
  chapter: string;
  citation: string;
  now: string;
  why: string;
  caption: string;
  chips: PayloadChip[];
} & Partial<
  Omit<
    AnimationStep,
    | "id"
    | "from"
    | "to"
    | "action"
    | "chapter"
    | "citation"
    | "now"
    | "why"
    | "caption"
    | "chips"
  >
>;

function hop(
  id: string,
  from: string,
  to: string,
  action: string,
  extra: HopPedagogy,
): AnimationStep {
  return {
    id,
    from,
    to,
    action,
    durationMs: extra.durationMs ?? DEFAULT_DURATION_MS,
    ...extra,
  };
}

export { specChip, egChip };

const oauth21: ProtocolAnimation = {
  id: "oauth-2-1",
  protocol: "OAuth 2.1",
  question: "How does a client get an access token without putting it in the URL?",
  title: "Authorization code + PKCE, hop by hop",
  kicker: "Animated sequence · OAuth 2.1",
  summary:
    "Four roles: resource owner, client, authorization server, resource server. The client discovers how to authorize, proves it started the flow with PKCE, collects a code on the front channel, redeems it on the back channel, and calls the API with an Authorization header. No implicit grant. Optional hops (PRM, AS metadata, PAR, introspection) are labeled — not omitted.",
  loop: true,
  takeaway:
    "The code is a ticket. The pass is minted on the back channel and sent in the Authorization header — never the query string. Login and consent are different hops.",
  actors: [
    actor("user", "RO (user)", "user"),
    actor("agent", "Client (agent)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("rs", "Resource server", "resource"),
  ],
  steps: [
    hop(
      "need",
      "user",
      "agent",
      "Asks the client (agent/host) to call an API that needs a pass",
      {
        packet: { kind: "consent", label: "task" },
        chapter: "Discover",
        citation: "OAuth 2.1 roles",
        why: "The resource owner is not the client. Collapsing this into 'the agent logs in' hides who consents and who later holds the token.",
        now: "The resource owner (RO) asks the OAuth client to reach a resource server (RS). The authorization server (AS) has not been called yet.",
        caption: "Someone at the desk asks a messenger to fetch a pass for a locked room.",
        chips: [
          specChip("resource owner"),
          specChip("client"),
          specChip("authorization server"),
          specChip("resource server"),
        ],
      },
    ),
    hop(
      "probe",
      "agent",
      "rs",
      "Calls the API with no Authorization header yet",
      {
        packet: { kind: "request", label: "HTTP" },
        chapter: "Discover",
        citation: "RFC 6750",
        why: "Optional if the client already knows the RS URI and its AS. Shown so a beginner sees why the 401 and metadata hops exist.",
        now: "The client hits the resource. There is no access token yet. This is not login.",
        caption: "Knock on the locked door with empty hands.",
        chips: [specChip("resource server"), specChip("Authorization", "Absent")],
      },
    ),
    hop(
      "prm-challenge",
      "rs",
      "agent",
      "401 + WWW-Authenticate pointing at resource_metadata",
      {
        packet: { kind: "challenge", label: "401 PRM" },
        challenge: true,
        chapter: "Discover",
        citation: "RFC 9728",
        why: "Optional only if the client is already configured with this AS. Otherwise the RS must advertise how to authorize — the client must not guess.",
        now: "The resource server returns 401. WWW-Authenticate carries a resource_metadata URL for protected resource metadata.",
        caption: "The door posts the address of the desk that issues passes.",
        chips: [
          specChip("WWW-Authenticate"),
          specChip("resource_metadata"),
          specChip("401"),
        ],
      },
    ),
    hop(
      "prm",
      "agent",
      "rs",
      "GET protected resource metadata (PRM)",
      {
        packet: { kind: "card", label: "PRM" },
        chapter: "Discover",
        citation: "RFC 9728",
        why: "Optional if the client already cached PRM. This hop is how it learns authorization_servers and the canonical resource identifier (RFC 8707 resource=).",
        now: "The client fetches RFC 9728 metadata from the RS. That document lists the authorization server(s) and the resource URI the later token must be audience-restricted to.",
        caption: "Read the notice on the door: which desk, which room name.",
        chips: [
          specChip("protected resource metadata"),
          specChip("authorization_servers"),
          specChip("resource"),
        ],
      },
    ),
    hop(
      "as-meta",
      "agent",
      "as",
      "GET authorization-server metadata",
      {
        packet: { kind: "request", label: "RFC 8414" },
        chapter: "Discover",
        citation: "RFC 8414",
        why: "Optional if the client already knows the authorization and token endpoint URLs. Shown so a stranger can find them without a hardcoded blog snippet.",
        now: "The client GETs /.well-known/oauth-authorization-server (or the URI PRM named). It learns authorization_endpoint, token endpoint, pushed_authorization_request_endpoint if any, and PKCE methods.",
        caption: "Read the desk's own hours: where to file, where to cash tickets.",
        chips: [
          specChip("authorization_endpoint"),
          specChip("token_endpoint"),
          specChip("code_challenge_methods_supported"),
        ],
      },
    ),
    hop(
      "pkce",
      "agent",
      "agent",
      "Generates a PKCE code_verifier and S256 code_challenge",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Prove",
        citation: "RFC 7636",
        why: "The secret must never appear on the front channel. A static challenge is not PKCE. OAuth 2.1 keeps only S256; plain is gone.",
        now: "The client creates a fresh high-entropy code_verifier and stores it. It will send only BASE64URL(SHA256(verifier)) as code_challenge.",
        caption: "Write a secret in the drawer. Only the hash will go in the mail.",
        chips: [
          specChip("code_verifier"),
          specChip("code_challenge"),
          specChip("S256"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "code_verifier", packet: "proof" },
        ],
      },
    ),
    hop(
      "par",
      "agent",
      "as",
      "POST pushed authorization request (PAR) with the rich parameters",
      {
        packet: { kind: "request", label: "PAR" },
        chapter: "Grant",
        citation: "RFC 9126",
        why: "Optional. Skip only if the authorization request is small enough for a query string. FAPI 2.0 and several agent profiles want PAR. Shown so a mission description never silently rides the URL.",
        now: "The client POSTs the pushed authorization request endpoint: client_id, redirect_uri, scope, resource, code_challenge, code_challenge_method=S256, maybe authorization_details. Confidential clients authenticate here.",
        caption: "File the long form at the back desk. The postcard will only carry a claim ticket.",
        chips: [
          specChip("pushed authorization request endpoint"),
          specChip("code_challenge"),
          specChip("resource", "RFC 8707"),
          specChip("authorization_details", "RAR, if used"),
        ],
      },
    ),
    hop(
      "request-uri",
      "as",
      "agent",
      "Returns request_uri (one-time, short-lived)",
      {
        packet: { kind: "code", label: "request_uri" },
        chapter: "Grant",
        citation: "RFC 9126",
        why: "Optional — only when PAR was used. request_uri is a reference, not an authorization code and not an access token.",
        now: "The AS returns request_uri and expires_in. The client will put that URI on the front-channel redirect instead of the rich query string.",
        caption: "A claim ticket for the form you already filed.",
        chips: [specChip("request_uri"), specChip("expires_in")],
        tokensAppear: [
          { actorId: "agent", label: "request_uri", packet: "code" },
        ],
      },
    ),
    hop(
      "authorize",
      "agent",
      "as",
      "Redirects the browser to the authorization endpoint: response_type=code, code_challenge, …",
      {
        packet: { kind: "proof", label: "response_type=code" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "This is the front channel. If PAR was used, the query is only client_id + request_uri. If not, it carries response_type=code, code_challenge, code_challenge_method=S256, redirect_uri, scope, resource, and state.",
        now: "The user-agent is sent to the authorization endpoint. response_type is code — never token. The access token is not requested on this hop.",
        caption: "Walk the owner to the desk. The postcard must not carry the pass.",
        chips: [
          specChip("authorization endpoint"),
          specChip("response_type=code"),
          specChip("code_challenge"),
          specChip("resource", "RFC 8707"),
          specChip("state"),
        ],
      },
    ),
    hop(
      "login",
      "user",
      "as",
      "Authenticates at the authorization server",
      {
        packet: { kind: "consent", label: "login" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Authentication and consent are different hops. Logging in does not yet grant the client anything. OIDC, if used, happens here as the identity layer — it still does not mint the API pass.",
        now: "The resource owner proves who they are to the AS (password, passkey, federation…). The client does not see the password. The API has not been called.",
        caption: "The owner shows ID at the desk. The permission slip is still blank.",
        chips: [specChip("resource owner"), specChip("authentication")],
      },
    ),
    hop(
      "consent",
      "user",
      "as",
      "Consents to this client for this resource and scope",
      {
        packet: { kind: "consent", label: "consent" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "The AS must know the RO approved this client for this resource. Consent is not the API call and not the ID Token.",
        now: "The resource owner reviews client_id, scope, and resource (or the PAR/RAR details) and approves. That is the grant decision.",
        caption: "The owner signs the permission slip for this messenger and this room.",
        chips: [specChip("consent"), specChip("scope"), specChip("resource")],
      },
    ),
    hop(
      "code",
      "as",
      "agent",
      "Redirects back with an authorization code — never an access token in the URL",
      {
        packet: { kind: "code", label: "code" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Implicit (token in the URL) is gone. The code is a one-time ticket that rides the user-agent — that is why PKCE exists.",
        now: "The authorization endpoint 302s to redirect_uri with code (and state). The access token is not in this hop. Query-string tokens are banned.",
        caption: "A ticket, not the pass — never tape the pass to the URL.",
        chips: [specChip("code"), specChip("redirect_uri"), specChip("no implicit")],
      },
    ),
    hop(
      "token-req",
      "agent",
      "as",
      "POSTs the token endpoint: code + code_verifier (and client auth if confidential)",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Grant",
        citation: "RFC 7636",
        why: "A stolen code is useless without the verifier the client kept. Confidential clients also authenticate (secret, private_key_jwt, or mTLS). Public clients send PKCE only. Optional: DPoP proof on this POST (see the DPoP sequence).",
        now: "Back channel: grant_type=authorization_code, code, code_verifier, redirect_uri as required by the AS. The browser never sees code_verifier. The AS hashes the verifier with S256 and matches the stored challenge.",
        caption: "Only the desk that kept the secret can cash the ticket.",
        chips: [
          specChip("token endpoint"),
          specChip("grant_type=authorization_code"),
          specChip("code"),
          specChip("code_verifier"),
          specChip("client authentication", "Confidential clients"),
        ],
      },
    ),
    hop(
      "token-res",
      "as",
      "agent",
      "Returns an access token (and a refresh token if any)",
      {
        packet: { kind: "token", label: "access token" },
        chapter: "Grant",
        citation: "RFC 6750",
        why: "The pass is minted where logs of the URL cannot steal it. A refresh token, if issued, is optional and is used only at the token endpoint — never at the RS.",
        now: "The token endpoint returns access_token, token_type, expires_in, optional refresh_token, optional scope. Prefer RFC 9068 JWT access tokens with aud = this RS (RFC 8707).",
        caption: "The pass is printed in the back office, not on the postcard.",
        chips: [
          specChip("access_token"),
          specChip("token_type"),
          specChip("refresh_token", "Optional"),
          specChip("aud", "RFC 9068 / RFC 8707"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "access token", packet: "token" },
        ],
      },
    ),
    hop(
      "call",
      "agent",
      "rs",
      "Calls the RS with Authorization header, audience-restricted",
      {
        packet: { kind: "token", label: "Authorization" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "Query-string tokens leak in logs and Referer. Header only. Bearer is a photocopy until you add DPoP or mTLS.",
        now: "The client calls the resource server with Authorization: Bearer (or DPoP). The token's audience must be this RS. The RS is not the AS.",
        caption: "Show the pass at the door. Do not photocopy it onto the query string.",
        chips: [
          specChip("Authorization"),
          specChip("Bearer"),
          specChip("DPoP", "RFC 9449 if sender-constrained"),
          specChip("aud"),
        ],
      },
    ),
    hop(
      "validate",
      "rs",
      "agent",
      "Validates the token (JWT RFC 9068 locally, or introspection) and responds",
      {
        packet: { kind: "token", label: "validated" },
        chapter: "Call",
        citation: "RFC 9068",
        why: "JWT access tokens are checked locally (signature, exp, aud). Opaque tokens use RFC 7662 introspection (RS → AS). Either way the RS must not trust the client to name the user. Optional hop detail: introspection is its own HTTP call when the token is opaque — not skipped, just the same 'validate' job.",
        now: "The RS verifies the pass is for itself and still valid, then returns the resource. An ID Token, if the client also has one, is not used here.",
        caption: "The door checks the pass against its own stamp, then opens.",
        chips: [
          specChip("aud"),
          specChip("exp"),
          specChip("RFC 9068 JWT"),
          specChip("RFC 7662 introspection", "Opaque tokens"),
        ],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "OAuth 2.1 is still draft-ietf-oauth-v2-1 (not an RFC). MCP HTTP is this shape with RFC 9728 discovery on the front. PAR, PRM, and AS metadata are optional only when the client is already configured — they are not secret steps.",
};

const oidc: ProtocolAnimation = {
  id: "oidc-core",
  protocol: "OpenID Connect",
  question: "Which token says who signed in, and which one is the API pass?",
  title: "Nametag stays home; pass goes to the API",
  kicker: "Animated sequence · OIDC",
  summary:
    "OpenID Connect is the identity layer on OAuth. The client sends a nonce, redeems a code, and the token endpoint can return two tickets. The ID Token authenticates the user to the client (aud = client_id). The access token is the pass for a resource. They are not interchangeable. UserInfo is optional.",
  loop: true,
  takeaway:
    "An ID Token is not a Bearer at the API. sub names the user at this OpenID provider. The access token is the pass. nonce stops replay of the nametag.",
  actors: [
    actor("user", "User", "user"),
    actor("op", "OpenID provider", "as"),
    actor("agent", "RP (client)", "agent"),
    actor("api", "API / MCP server", "resource"),
  ],
  steps: [
    hop("need", "user", "agent", "Asks the relying party to sign in (and maybe later call an API)", {
      packet: { kind: "consent", label: "sign in" },
      chapter: "Discover",
      citation: "OIDC Core",
      why: "The relying party (RP) is the OAuth client. The OpenID provider (OP) is the AS plus identity. The user is not the API.",
      now: "The user wants the RP to know who signed in. If an API call is needed later, that will use an access token — not the ID Token.",
      caption: "Ask the front desk for a nametag. A pass for a back room is a different paper.",
      chips: [specChip("relying party"), specChip("OpenID provider"), specChip("end-user")],
    }),
    hop(
      "discover",
      "agent",
      "op",
      "GET OpenID Provider configuration",
      {
        packet: { kind: "request", label: "OIDC discovery" },
        chapter: "Discover",
        citation: "OIDC Discovery",
        why: "Optional if the RP is already configured. Shown so a beginner sees where authorization_endpoint, token_endpoint, jwks_uri, and userinfo_endpoint come from.",
        now: "The RP GETs /.well-known/openid-configuration. That document is RFC 8414-shaped metadata plus OIDC fields (userinfo_endpoint, id_token signing algs).",
        caption: "Read the nametag desk's own hours before walking over.",
        chips: [
          specChip("openid-configuration"),
          specChip("jwks_uri"),
          specChip("userinfo_endpoint"),
        ],
      },
    ),
    hop(
      "prove",
      "agent",
      "agent",
      "Generates PKCE verifier+challenge and a fresh nonce",
      {
        packet: { kind: "proof", label: "nonce + PKCE" },
        chapter: "Prove",
        citation: "OIDC Core",
        why: "nonce binds the ID Token to this authentication request so a stolen nametag cannot be replayed. PKCE binds the code to this client. Neither is optional in a modern agent client.",
        now: "The RP stores code_verifier and nonce. It will send code_challenge (S256) and nonce on the authorization request. state is also generated to bind the redirect.",
        caption: "Drawer secret for the ticket; a one-time word for the nametag.",
        chips: [
          specChip("nonce"),
          specChip("code_verifier"),
          specChip("code_challenge"),
          specChip("state"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "nonce + verifier", packet: "proof" },
        ],
      },
    ),
    hop(
      "authorize",
      "agent",
      "op",
      "Redirects to the authorization endpoint: scope=openid, nonce, response_type=code, code_challenge",
      {
        packet: { kind: "proof", label: "scope=openid" },
        chapter: "Grant",
        citation: "OIDC Core",
        why: "scope=openid is what makes this OIDC rather than plain OAuth. nonce must go on this request so it can later appear in the ID Token.",
        now: "Front channel: response_type=code, scope includes openid, nonce, code_challenge=S256, client_id, redirect_uri. Optional PAR (RFC 9126) if the request is rich — same as OAuth 2.1.",
        caption: "Walk the owner to the nametag desk with the one-time word in the form.",
        chips: [
          specChip("scope=openid"),
          specChip("nonce"),
          specChip("response_type=code"),
          specChip("code_challenge"),
        ],
      },
    ),
    hop("login", "user", "op", "Authenticates at the OpenID provider", {
      packet: { kind: "consent", label: "login" },
      chapter: "Grant",
      citation: "OIDC Core",
      why: "Authentication is not consent and not the API call. The OP authenticates the end-user to itself on this hop.",
      now: "The user proves who they are at the OP. The RP does not see the password. No token has been issued yet.",
      caption: "The person shows ID at the desk that issues nametags.",
      chips: [specChip("authentication"), specChip("OpenID provider")],
    }),
    hop("consent", "user", "op", "Consents to this RP (and to any API scopes)", {
      packet: { kind: "consent", label: "consent" },
      chapter: "Grant",
      citation: "OIDC Core",
      why: "The user must approve this client. API scopes, if requested, are a separate grant from 'tell this RP who I am'.",
      now: "The user consents. openid means the RP may receive an ID Token. Other scopes (if any) mean an access token may also be minted for a resource.",
      caption: "The owner signs: nametag for this desk, and maybe a pass for a door.",
      chips: [specChip("consent"), specChip("openid"), specChip("scope")],
    }),
    hop(
      "code",
      "op",
      "agent",
      "Redirects back with an authorization code — not the ID Token, not the access token",
      {
        packet: { kind: "code", label: "code" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Hybrid and implicit ID Token-in-the-URL tricks are the wrong default for agents. Authorization code is the grant.",
        now: "The OP redirects to the RP with code (and state). The ID Token is not in this hop unless you chose a hybrid flow — do not.",
        caption: "A ticket. The nametag is still in the back office.",
        chips: [specChip("code"), specChip("no implicit")],
      },
    ),
    hop(
      "token-req",
      "agent",
      "op",
      "POSTs the token endpoint: code + code_verifier",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Grant",
        citation: "RFC 7636",
        why: "Same back-channel redemption as OAuth 2.1. Confidential RPs also authenticate. The nonce is not sent here — it was on the authorization request and must come back inside the ID Token.",
        now: "grant_type=authorization_code, code, code_verifier. The OP will mint tokens only if S256(verifier) matches.",
        caption: "Cash the ticket with the drawer secret.",
        chips: [
          specChip("token endpoint"),
          specChip("code"),
          specChip("code_verifier"),
        ],
      },
    ),
    hop(
      "id-token",
      "op",
      "agent",
      "Issues an ID Token — aud is the client_id. This nametag stays with the RP",
      {
        packet: { kind: "id-token", label: "ID Token" },
        chapter: "Grant",
        citation: "OIDC Core",
        why: "The ID Token answers 'which user signed in to this client', not 'what may this client do at an API'. It must contain the nonce the RP sent.",
        now: "The token response includes id_token. aud = this client_id. sub is the user at this OP. nonce matches the stored value. iss is this OP.",
        caption: "A nametag for the client, not a pass for the door.",
        chips: [
          specChip("ID Token"),
          specChip("sub"),
          specChip("aud=client_id"),
          specChip("nonce"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "ID Token", packet: "id-token" },
        ],
      },
    ),
    hop(
      "at",
      "op",
      "agent",
      "Issues an access token — a different ticket, for a resource",
      {
        packet: { kind: "token", label: "access token" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "APIs authorize with an access token whose audience is the resource, not the client_id. This hop is in the same HTTP token response as the ID Token; it is shown separately so the two tickets cannot be mashed together.",
        now: "The same token response may include access_token (and optional refresh_token). If only identity was requested, an access token might still be issued for UserInfo.",
        caption: "A pass for a door — a different piece of paper, same envelope.",
        chips: [
          specChip("access_token"),
          specChip("refresh_token", "Optional"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "access token", packet: "token" },
        ],
      },
    ),
    hop(
      "check-id",
      "agent",
      "agent",
      "Validates the ID Token: iss, aud=client_id, nonce, signature, exp",
      {
        packet: { kind: "id-token", label: "validate ID Token" },
        chapter: "Grant",
        citation: "OIDC Core",
        why: "Without this hop the RP cannot know the nametag is for this login. Skipping nonce check is how replayed ID Tokens sneak in.",
        now: "The RP fetches OP JWKS (jwks_uri from discovery) if needed, verifies the signature, and checks iss, aud, exp, nonce. This validation is at the RP — not at the API.",
        caption: "Read the nametag against the one-time word you wrote down.",
        chips: [
          specChip("jwks_uri"),
          specChip("iss"),
          specChip("aud"),
          specChip("nonce"),
        ],
      },
    ),
    hop(
      "userinfo",
      "agent",
      "op",
      "Optional UserInfo request with the access token — not with the ID Token as Bearer",
      {
        packet: { kind: "token", label: "UserInfo" },
        chapter: "Call",
        citation: "OIDC Core",
        why: "Optional. UserInfo is an OAuth-protected resource at the OP. It uses the access token. Do not send the ID Token as Authorization: Bearer here either.",
        now: "If claims are not all in the ID Token, the RP may call userinfo_endpoint with the access token. This is still not your business API.",
        caption: "Ask the nametag desk for extra biographical notes, using the desk's own pass.",
        chips: [
          specChip("userinfo_endpoint"),
          specChip("access token"),
          specChip("Authorization"),
        ],
      },
    ),
    hop(
      "call",
      "agent",
      "api",
      "Calls the API with the access token (aud = this API). The ID Token stays home",
      {
        packet: { kind: "token", label: "access token" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "The RS must see a pass minted for itself. The ID Token's audience is the client, so it is the wrong ticket.",
        now: "The RP calls the API with the access token in the Authorization header. The ID Token does not leave the RP.",
        caption: "Show the pass at the API door. Leave the nametag in the drawer.",
        chips: [specChip("Authorization"), specChip("access token"), specChip("aud")],
      },
    ),
    hop(
      "mixup",
      "agent",
      "api",
      "Sending the ID Token to the API is the mix-up — wrong audience, wrong token type",
      {
        packet: { kind: "id-token", label: "ID Token" },
        fail: true,
        challenge: true,
        chapter: "Call",
        citation: "OIDC Core",
        why: "Teaching hop: aud is the client, not the API. MCP servers and other RS must reject it. This is not an optional success path.",
        now: "The ID Token is not a Bearer at the API. Wrong audience, wrong token type. The RS should 401.",
        caption: "A nametag is not a pass. The door should refuse it.",
        chips: [
          specChip("ID Token"),
          specChip("not Bearer at the API"),
          specChip("401"),
        ],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "OpenID Connect is the identity layer on OAuth. An ID Token authenticates the user to the client. It is not an access token. nonce is required for this authentication request.",
};

const aauth: ProtocolAnimation = {
  id: "aauth",
  protocol: "AAuth",
  question: "How does an agent prove who it is when there is no authorization server?",
  title: "Identity-based, then three-party",
  kicker: "Animated sequence · AAuth",
  summary:
    "Identity-based AAuth is signed HTTP with an agent token — no Agent Card, no AS in the path. JWKS fetch is a real hop. If the resource needs user claims, it steps up to a person server (not an OAuth AS) via 401 AAuth-Requirement and a resource token. Four-party adds a resource-side access server. That is still not A2A.",
  loop: true,
  takeaway:
    "Identity-based AAuth has no AS. Wire is RFC 9421 + Signature-Key (aa-agent+jwt). User claims need a person server (aa-auth+jwt). An access server, if any, sits on the resource side.",
  actors: [
    actor("provider", "Agent provider", "other"),
    actor("agent", "Agent", "agent"),
    actor("resource", "Resource", "resource"),
    actor("ps", "Person server", "as"),
    actor("user", "User", "user"),
  ],
  steps: [
    hop(
      "issue",
      "provider",
      "agent",
      "Issues aa-agent+jwt bound to the agent's signing key",
      {
        packet: { kind: "proof", label: "aa-agent+jwt" },
        chapter: "Discover",
        citation: "AAuth draft",
        why: "The provider attests the key. It is not an OAuth authorization server and mints no Bearer access token.",
        now: "The agent provider issues typ aa-agent+jwt (sub = agent identifier, cnf binds the key). Optional ps names a person server — unused until three-party.",
        caption: "A wax-sealed ID card for the agent — not a photocopied pass.",
        chips: [
          specChip("typ: aa-agent+jwt"),
          specChip("cnf"),
          specChip("iss / dwk"),
          specChip("ps", "Optional until three-party"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "aa-agent+jwt", packet: "proof" },
        ],
      },
    ),
    hop(
      "jwks-publish",
      "provider",
      "provider",
      "Publishes JWKS at {iss}/.well-known/{dwk}",
      {
        packet: { kind: "request", label: "JWKS" },
        chapter: "Discover",
        citation: "AAuth draft",
        why: "Do not skip this. A stranger cannot verify a first request unless the provider hosts keys at the well-known document named by dwk.",
        now: "The provider publishes aauth-agent.json (dwk) and JWKS at {iss}/.well-known/{dwk}. This is not an OAuth token endpoint.",
        caption: "Hang the signet on the wall where any door can look it up.",
        chips: [specChip("iss"), specChip("dwk"), specChip("JWKS")],
      },
    ),
    hop(
      "signed",
      "agent",
      "resource",
      "First signed HTTP request: Signature-Key + Signature-Input + Signature",
      {
        packet: { kind: "proof", label: "RFC 9421" },
        chapter: "Prove",
        citation: "RFC 9421",
        why: "A stranger can verify the caller from the signature and JWKS. There is still no AS in this hop. Cover signature-key in the signature base.",
        now: "The agent authenticates with HTTP Message Signatures. Signature-Key carries the JWT (scheme=jwt). This is the first request — the resource has never seen this agent.",
        caption: "Wax seal on the envelope — the key, not a photocopied pass.",
        chips: [
          specChip("Signature-Key"),
          specChip("Signature-Input"),
          specChip("Signature"),
          specChip("typ: aa-agent+jwt"),
        ],
      },
    ),
    hop(
      "jwks-fetch",
      "resource",
      "provider",
      "Fetches JWKS via iss + dwk well-known document",
      {
        packet: { kind: "request", label: "JWKS" },
        chapter: "Prove",
        citation: "AAuth draft",
        why: "Do not skip JWKS fetch. The resource verifies the seal against the provider's published keys. This fetch is a trust-boundary crossing (SSRF, iss mix-up, stale JWKS).",
        now: "The resource resolves {iss}/.well-known/{dwk} and fetches JWKS. That is not an OAuth token request and not a person-server call.",
        caption: "Check the wax against the published signet.",
        chips: [specChip("iss"), specChip("dwk"), specChip("JWKS")],
      },
    ),
    hop(
      "verify",
      "resource",
      "resource",
      "Verifies RFC 9421 signature, typ, exp, and cnf.jwk",
      {
        packet: { kind: "proof", label: "verify" },
        chapter: "Prove",
        citation: "RFC 9421",
        why: "Signature, JWT type, expiry, and key binding are separate checks. Skipping typ is how the wrong JWT is accepted as an agent token.",
        now: "The resource checks the signature base (including signature-key), typ aa-agent+jwt, exp, and that cnf matches the key that signed. Missing signature → 401 AAuth-Requirement: agent-token.",
        caption: "Feel the wax, read the card type, check the date, match the signet.",
        chips: [
          specChip("typ: aa-agent+jwt"),
          specChip("cnf"),
          specChip("exp"),
          specChip("AAuth-Requirement", "If signature missing"),
        ],
      },
    ),
    hop(
      "decide",
      "resource",
      "agent",
      "Allows or denies from local policy for that agent identifier",
      {
        packet: { kind: "consent", label: "policy" },
        chapter: "Call",
        citation: "AAuth draft",
        why: "Identity-based access answers which agent called — not which human it serves. No token exchange, no person server, no OAuth redirect.",
        now: "The resource applies local policy to the agent identifier (allow, deny, rate-limit). access_mode=agent-token on resource metadata is advisory.",
        caption: "The door knows the seal. It does not yet know who sent the messenger.",
        chips: [
          specChip("access_mode=agent-token"),
          specChip("local policy"),
        ],
      },
    ),
    hop(
      "see-ps",
      "agent",
      "resource",
      "Signed call; resource sees a ps claim and wants user claims",
      {
        packet: { kind: "proof", label: "aa-agent+jwt" },
        chapter: "Discover",
        citation: "AAuth draft",
        why: "Three-party starts here. The resource will not mint user identity. It asks the agent's person server. There is still no OAuth AS on the resource.",
        now: "The agent token's ps claim names the person server. The resource still has no authorization server of its own. Wire is still signed HTTP.",
        caption: "The door wants the owner's nametag, not just the messenger's seal.",
        chips: [specChip("ps"), specChip("aa-agent+jwt")],
      },
    ),
    hop(
      "need-auth",
      "resource",
      "agent",
      "401 AAuth-Requirement: auth-token, plus a resource token (aud = PS)",
      {
        packet: { kind: "challenge", label: "401 auth-token" },
        challenge: true,
        chapter: "Grant",
        citation: "AAuth draft",
        why: "Challenges replace browser redirects. The resource token describes what needs authorizing. This is not WWW-Authenticate: Bearer.",
        now: "401 carries AAuth-Requirement (requirement=auth-token) and typ aa-resource+jwt whose aud is the person server — not an OAuth AS. SHOULD NOT exceed five minutes. Draft-11 sends this only after a person token or an auth token was verified; otherwise the 401 is requirement=person-token.",
        caption: "The door hands back a short note: go get the owner's permission slip.",
        chips: [
          specChip("AAuth-Requirement"),
          specChip("requirement=auth-token"),
          specChip("typ: aa-resource+jwt"),
          specChip("aud=person server"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "aa-resource+jwt", packet: "token" },
        ],
      },
    ),
    hop(
      "to-ps",
      "agent",
      "ps",
      "Signed POST of the resource token to the person-server auth_token_endpoint",
      {
        packet: { kind: "token", label: "aa-resource+jwt" },
        chapter: "Grant",
        citation: "AAuth draft",
        why: "Only the person server speaks for the user. The agent never presents a password to the resource. The agent does not call an OAuth authorization endpoint.",
        now: "Draft-11: the agent POSTs aa-resource+jwt to the PS auth_token_endpoint, still signed with the agent key. A resource token is issued only after a person token or an auth token was verified.",
        caption: "Take the door's note to the owner's notary.",
        chips: [
          specChip("auth_token_endpoint"),
          specChip("typ: aa-resource+jwt"),
          specChip("RFC 9421"),
        ],
      },
    ),
    hop(
      "pending",
      "ps",
      "agent",
      "May 202 + interaction if the user must approve",
      {
        packet: { kind: "challenge", label: "202 interaction" },
        challenge: true,
        chapter: "Grant",
        citation: "AAuth draft",
        why: "Optional only if the user already approved this mission/scope. Do not skip the wait: without this hop a beginner thinks the auth token arrives instantly.",
        now: "If consent is needed, the PS returns 202 with interaction instructions. The agent still has no aa-auth+jwt. The user will authenticate at the PS, not at the resource.",
        caption: "The notary says: wait — I have to ask the owner.",
        chips: [specChip("202"), specChip("interaction")],
      },
    ),
    hop(
      "notify",
      "ps",
      "user",
      "Notifies the user that this agent wants a grant at this resource",
      {
        packet: { kind: "consent", label: "notify" },
        chapter: "Grant",
        citation: "AAuth draft",
        why: "The user must see what is being asked. This is not an OAuth front-channel redirect from the agent.",
        now: "The person server contacts the user (app, email, login page). The resource is not in this hop.",
        caption: "A ping from the owner's notary: is this the errand you meant?",
        chips: [specChip("person server"), specChip("user")],
      },
    ),
    hop(
      "user-login",
      "user",
      "ps",
      "Authenticates at the person server",
      {
        packet: { kind: "consent", label: "login" },
        chapter: "Grant",
        citation: "AAuth draft",
        why: "Authentication and consent are different hops. The user authenticates to the PS. That page MAY wrap ordinary OIDC — the agent still never talks to that OP.",
        now: "The user proves who they are at the person server. No password is given to the agent or to the resource.",
        caption: "The owner shows ID at their own desk, not at the door.",
        chips: [specChip("authentication"), specChip("person server")],
      },
    ),
    hop(
      "user-ok",
      "user",
      "ps",
      "Consents to the mission or scope at the person server",
      {
        packet: { kind: "consent", label: "consent" },
        chapter: "Grant",
        citation: "AAuth draft",
        why: "User consent lives at the PS, not at an OAuth authorization endpoint on this hop.",
        now: "The user approves the grant (scope or R3 / mission). This is the three-party authorization decision.",
        caption: "The owner signs the permission slip at their own desk.",
        chips: [specChip("consent"), specChip("mission / scope")],
      },
    ),
    hop(
      "auth-jwt",
      "ps",
      "agent",
      "Issues aa-auth+jwt with user claims, cnf-bound to the agent key, aud = resource",
      {
        packet: { kind: "token", label: "aa-auth+jwt" },
        chapter: "Grant",
        citation: "AAuth draft",
        why: "The grant names the user (sub at this PS) and is glued to the agent's key. It is not a Bearer access token from an OAuth AS.",
        now: "typ aa-auth+jwt: iss is the PS, aud is the resource, cnf matches the agent key, lifetime ≤ 1 hour. sub is directed per issuer.",
        caption: "A permission slip wax-sealed to this messenger's key.",
        chips: [
          specChip("typ: aa-auth+jwt"),
          specChip("sub"),
          specChip("cnf"),
          specChip("aud=resource"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "aa-auth+jwt", packet: "token" },
        ],
      },
    ),
    hop(
      "retry",
      "agent",
      "resource",
      "Retries signed HTTP with the auth token",
      {
        packet: { kind: "token", label: "aa-auth+jwt" },
        chapter: "Call",
        citation: "RFC 9421",
        why: "Every call is still signed. Presenting aa-auth+jwt without a signature is the wrong cousin of Bearer.",
        now: "The agent retries the resource request. Signature-Key carries the auth token (or the draft's presentation header). The resource must verify again — do not reuse the identity-based decision.",
        caption: "Seal plus permission slip. Back to the same door.",
        chips: [
          specChip("Signature-Key"),
          specChip("typ: aa-auth+jwt"),
        ],
      },
    ),
    hop(
      "ps-jwks",
      "resource",
      "ps",
      "Fetches the person server's JWKS to verify the auth token",
      {
        packet: { kind: "request", label: "PS JWKS" },
        chapter: "Call",
        citation: "AAuth draft",
        why: "Do not skip this. The auth token is signed by the PS, not by the agent provider. A cached agent JWKS is the wrong keyring.",
        now: "The resource resolves the PS well-known (iss / dwk on aa-auth+jwt) and fetches JWKS. Four-party would instead verify against a resource-side access server — the agent still would not talk to that AS.",
        caption: "Check the permission slip against the notary's published signet.",
        chips: [specChip("iss"), specChip("dwk"), specChip("JWKS")],
      },
    ),
    hop(
      "verify-auth",
      "resource",
      "agent",
      "Verifies signature + aa-auth+jwt (iss, aud, cnf) and applies policy to (iss, sub)",
      {
        packet: { kind: "token", label: "policy" },
        chapter: "Call",
        citation: "AAuth draft",
        why: "The resource still verifies the HTTP signature. The auth token adds which user, at which PS. (iss, sub) is directed — the same email from two person servers is two subjects.",
        now: "Checks: RFC 9421 signature, typ aa-auth+jwt, aud = this resource, cnf matches the signing key, exp ≤ 1 hour. Then local policy on (iss, sub).",
        caption: "Seal plus permission slip. The door decides from both.",
        chips: [
          specChip("typ: aa-auth+jwt"),
          specChip("iss"),
          specChip("sub"),
          specChip("cnf"),
          specChip("aud"),
        ],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "Not A2A (no Agent Card, no tasks). Not did:peer (the identifier is published so a stranger can verify a first request). Draft-11 has five modes, including person identity. Agent-identity mode has no AS. PS authorization uses a person server, not an OAuth AS.",
};

const dpop: ProtocolAnimation = {
  id: "dpop",
  protocol: "DPoP",
  question: "Why isn't a stolen access token enough?",
  title: "Photocopy, or pass glued to a key",
  kicker: "Animated sequence · DPoP vs Bearer",
  summary:
    "A Bearer token is a photocopy: whoever holds the string may use it. DPoP (RFC 9449) glues the pass to a key. The client generates a key pair, then sends a DPoP proof JWT on the token request AND on every resource request (htm/htu). The access token's cnf.jkt must match. Stolen paper without the private key is a blank.",
  loop: true,
  takeaway:
    "Bearer = photocopy. DPoP = pass glued to a key. Present Authorization: DPoP plus a DPoP proof JWT on the token request and on the resource request — not a Bearer string alone.",
  actors: [
    actor("as", "Authorization server", "as"),
    actor("agent", "Client with key", "agent"),
    actor("api", "API", "resource"),
    actor("thief", "Thief", "other"),
  ],
  steps: [
    hop("mint-b", "as", "agent", "Mints a Bearer access token — just a string", {
      packet: { kind: "token", label: "Bearer" },
      chapter: "Discover",
      citation: "RFC 6750",
      why: "Contrast hop. Bearer means possession of the string is authorization. The authorization-code grant that produced this token is the OAuth 2.1 sequence — not replayed here.",
      now: "The AS issues token_type=Bearer. Anyone who copies the string can present Authorization: Bearer.",
      caption: "A pass that is a photocopy — whoever holds the paper gets in.",
      chips: [specChip("token_type=Bearer"), specChip("Authorization")],
      tokensAppear: [{ actorId: "agent", label: "Bearer", packet: "token" }],
    }),
    hop("use-b", "agent", "api", "Authorization: Bearer — the API trusts the string", {
      packet: { kind: "token", label: "Bearer" },
      chapter: "Call",
      citation: "RFC 6750",
      why: "The RS cannot tell a legitimate client from a log scrape.",
      now: "The client sends the access token in the Authorization header as Bearer. No proof of a key.",
      caption: "Show the photocopy at the door.",
      chips: [specChip("Authorization: Bearer")],
    }),
    hop(
      "steal",
      "agent",
      "thief",
      "Logs, traces, or prompt injection photocopy the string",
      {
        packet: { kind: "token", label: "photocopy" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "Bearer tokens in logs, transcripts, or tool args are already leaked credentials.",
        now: "The string is the credential. Copying it copies the grant.",
        caption: "A photocopy of a photocopy is still a pass.",
        chips: [specChip("Bearer"), egChip("stolen string")],
      },
    ),
    hop(
      "replay",
      "thief",
      "api",
      "Same pass, no key needed — the API cannot tell",
      {
        packet: { kind: "token", label: "Bearer" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "Without sender-constraint, replay succeeds. This is why DPoP exists.",
        now: "The thief presents Authorization: Bearer with the copied string. The RS sees a valid pass.",
        caption: "The door cannot tell whose pocket the photocopy came from.",
        chips: [specChip("Authorization: Bearer")],
      },
    ),
    hop(
      "keypair",
      "agent",
      "agent",
      "Generates a DPoP key pair and keeps the private key",
      {
        packet: { kind: "proof", label: "DPoP key" },
        chapter: "Prove",
        citation: "RFC 9449",
        why: "Do not skip key generation. Without a key there is no proof JWT. The public JWK will be in every DPoP proof; the private key never leaves the client.",
        now: "The client creates an asymmetric key pair for DPoP. This is not the AS signing key and not an AAuth agent token.",
        caption: "Cut a key that will be glued to every pass you collect.",
        chips: [specChip("DPoP"), specChip("jwk")],
        tokensAppear: [{ actorId: "agent", label: "DPoP key", packet: "proof" }],
      },
    ),
    hop(
      "token-proof",
      "agent",
      "as",
      "Token request with a DPoP proof JWT (htm=POST, htu=token endpoint)",
      {
        packet: { kind: "proof", label: "DPoP proof" },
        chapter: "Grant",
        citation: "RFC 9449",
        why: "DPoP starts at the token request — not only at the API. Skipping this hop issues an unbound Bearer. The authorization code + PKCE grant still happened (see OAuth 2.1); this hop is that token POST plus DPoP.",
        now: "The client POSTs the token endpoint (code + code_verifier as usual) with header DPoP carrying a proof JWT. Claims: htm=POST, htu=the token endpoint URI, jti, iat; header holds the public JWK.",
        caption: "Ask the back office for a pass, and glue your key to the request.",
        chips: [
          specChip("DPoP"),
          specChip("htm"),
          specChip("htu"),
          specChip("token endpoint"),
        ],
      },
    ),
    hop(
      "as-check",
      "as",
      "as",
      "AS checks the DPoP proof: signature, htm, htu, iat",
      {
        packet: { kind: "proof", label: "htm/htu" },
        chapter: "Grant",
        citation: "RFC 9449",
        why: "If the AS does not check htm/htu, a proof minted for another URL can be replayed here. This hop is the AS's job before it mints cnf.jkt.",
        now: "The AS verifies the proof JWT signature with the embedded JWK, checks htm and htu match this token request, and computes jkt (JWK thumbprint).",
        caption: "The back office checks the glue before printing the pass.",
        chips: [specChip("htm"), specChip("htu"), specChip("jkt")],
      },
    ),
    hop(
      "mint-d",
      "as",
      "agent",
      "Issues an access token with cnf.jkt (thumbprint of the client's DPoP key)",
      {
        packet: { kind: "proof", label: "cnf.jkt" },
        chapter: "Grant",
        citation: "RFC 9449",
        why: "The pass names the key it is glued to. token_type is DPoP, not Bearer. A photocopy of the paper is not enough.",
        now: "The AS issues an access token with cnf.jkt matching the proof's JWK. The client stores token + private key together.",
        caption: "The pass is glued to a key. Theft of the paper leaves a blank.",
        chips: [
          specChip("cnf.jkt"),
          specChip("token_type=DPoP"),
        ],
        tokensAppear: [{ actorId: "agent", label: "DPoP token", packet: "proof" }],
      },
    ),
    hop(
      "use-d",
      "agent",
      "api",
      "Resource request: Authorization: DPoP plus a new DPoP proof JWT (htm/htu of this call)",
      {
        packet: { kind: "proof", label: "DPoP proof" },
        chapter: "Call",
        citation: "RFC 9449",
        why: "A new proof is minted per resource request. Replaying the token-endpoint proof fails htu. Authorization scheme is DPoP, not Bearer.",
        now: "Header DPoP carries a proof JWT for this HTTP method and URL (htm/htu). Authorization: DPoP <access-token>. The proof's JWK thumbprint must match cnf.jkt.",
        caption: "Pass glued to a key — the door checks the glue every time.",
        chips: [
          specChip("DPoP"),
          specChip("htm"),
          specChip("htu"),
          specChip("Authorization: DPoP"),
        ],
      },
    ),
    hop(
      "rs-cnf",
      "api",
      "api",
      "RS checks cnf.jkt against the proof's JWK and verifies htm/htu",
      {
        packet: { kind: "proof", label: "cnf.jkt" },
        chapter: "Call",
        citation: "RFC 9449",
        why: "Do not skip the RS check. Valid JWT access token without a matching proof is still a fail. htm/htu stop replay at a different method or URL.",
        now: "The RS verifies the DPoP proof signature, matches jkt to cnf.jkt, and checks htm/htu for this request. Then it authorizes the call.",
        caption: "The door checks the glue against the stamp on the pass.",
        chips: [
          specChip("cnf.jkt"),
          specChip("htm"),
          specChip("htu"),
        ],
      },
    ),
    hop(
      "ok-d",
      "api",
      "agent",
      "Responds — the caller proved the key the token is glued to",
      {
        packet: { kind: "token", label: "200" },
        chapter: "Call",
        citation: "RFC 9449",
        why: "Success path after both proofs. DPoP is application-layer and works through TLS proxies. AAuth uses HTTP Message Signatures instead — do not stack proofs naively.",
        now: "The RS returns the resource. The thief still does not have the private key.",
        caption: "The door opens for the key that matches the glue.",
        chips: [specChip("200"), specChip("DPoP")],
      },
    ),
    hop(
      "fail",
      "thief",
      "api",
      "Photocopy without the private key — 401, the paper is a blank",
      {
        packet: { kind: "token", label: "stolen string" },
        fail: true,
        challenge: true,
        chapter: "Call",
        citation: "RFC 9449",
        why: "Without the key, the thief cannot mint a valid DPoP proof JWT whose jkt matches cnf.jkt.",
        now: "A stolen DPoP access token without a matching proof (and key) is rejected. Bearer replay does not apply.",
        caption: "A photocopied pass with the glue torn off.",
        chips: [specChip("cnf.jkt"), specChip("401")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "RFC 9449. DPoP is application-layer proof and works through TLS proxies. AAuth uses HTTP Message Signatures instead — do not stack proofs naively. Proofs are required on the token request and on each resource request.",
};

const tokenExchange: ProtocolAnimation = {
  id: "token-exchange",
  protocol: "RFC 8693",
  question: "How does an actor get a new pass without becoming the user?",
  title: "act grows down the chain",
  kicker: "Animated sequence · RFC 8693",
  summary:
    "Token exchange mints a new pass for a new audience or a narrower scope. The client presents a subject_token; the AS returns a new token with an act claim appended. subject_token is who the call is for; actor_token is who is holding it. Attenuate — never expand. Nested act is not a new user.",
  loop: true,
  takeaway:
    "sub stays the user. act names the holders. Nested act is a chain of hands, not a new resource owner. Never widen scope at a hop.",
  actors: [
    actor("user", "Alice (RO)", "user"),
    actor("agent1", "Agent 1 (actor)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("agent2", "Agent 2 (actor)", "agent"),
    actor("api", "API B (RS)", "resource"),
  ],
  steps: [
    hop(
      "alice-login",
      "user",
      "as",
      "Authenticates at the AS (ordinary user-delegated grant)",
      {
        packet: { kind: "consent", label: "login" },
        chapter: "Discover",
        citation: "OAuth 2.1",
        why: "Do not start at the exchange. Alice is still the resource owner. The authorization-code + PKCE hops are the OAuth 2.1 sequence; we show login and consent so subject_token has a pedigree.",
        now: "Alice authenticates at the authorization server. Agent 1 is the client, not the user.",
        caption: "Alice shows ID. The messenger is not Alice.",
        chips: [specChip("resource owner"), specChip("authentication")],
      },
    ),
    hop(
      "alice-consent",
      "user",
      "as",
      "Consents to Agent 1 calling APIs on her behalf",
      {
        packet: { kind: "consent", label: "consent" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Consent is not the exchange. This hop is the original grant. Token exchange later must not widen what she approved.",
        now: "Alice approves Agent 1 for a scope. That scope is the ceiling for every later act hop.",
        caption: "Alice signs the first permission slip.",
        chips: [specChip("consent"), specChip("scope")],
      },
    ),
    hop(
      "alice",
      "as",
      "agent1",
      "Issues Alice's access token. sub is Alice. No act yet",
      {
        packet: { kind: "token", label: "subject_token" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Agent 1 now holds a pass for Alice from an ordinary grant. This string is the subject_token the exchange will present.",
        now: "subject_token will be this access token. sub = Alice. There is no act claim yet.",
        caption: "Alice's pass is in Agent 1's hand. The name on it is still Alice.",
        chips: [
          specChip("sub"),
          specChip("subject_token"),
        ],
        tokensAppear: [
          { actorId: "agent1", label: "subject_token", packet: "token" },
        ],
      },
    ),
    hop(
      "ex1",
      "agent1",
      "as",
      "Presents subject_token at the token endpoint (token exchange)",
      {
        packet: { kind: "token", label: "token-exchange" },
        chapter: "Grant",
        citation: "RFC 8693",
        why: "The AS must mint a new pass for a new audience or tighter scope, and record who is acting. Do not reuse Alice's original token at API B.",
        now: "POST token endpoint: grant_type=urn:ietf:params:oauth:grant-type:token-exchange with subject_token (Alice's access token) and actor_token (Agent 1). Request a narrower scope and audience toward the next hop.",
        caption: "Ask the desk for a new pass: same owner, this messenger, a smaller door.",
        chips: [
          specChip("grant_type=token-exchange"),
          specChip("subject_token"),
          specChip("actor_token"),
          specChip("audience / scope"),
        ],
      },
    ),
    hop(
      "act1",
      "as",
      "agent1",
      "Returns a new token with act appended. sub is still Alice",
      {
        packet: { kind: "id-token", label: "act: agent-1" },
        chapter: "Grant",
        citation: "RFC 8693",
        why: "act records the actor. sub must not flip to the agent. The new token is a different string — not Alice's original pass with a sticker.",
        now: "The issued token keeps sub=Alice and adds act identifying Agent 1. That is not a new resource owner.",
        caption: "The pass still says Alice. A footnote names the hand holding it.",
        chips: [
          specChip("sub=Alice"),
          specChip("act"),
        ],
        tokensAppear: [
          { actorId: "agent1", label: "act: agent-1", packet: "id-token" },
        ],
      },
    ),
    hop(
      "hand",
      "agent1",
      "agent2",
      "Hands the attenuated token to Agent 2 for the next hop",
      {
        packet: { kind: "token", label: "subject_token" },
        chapter: "Grant",
        citation: "RFC 8693",
        why: "The next actor should exchange again — not replay Agent 1's identity. Optional: Agent 1 could call an API itself instead of handing off.",
        now: "Agent 2 will present this token as subject_token and itself as actor_token. Scope must not widen.",
        caption: "Pass the slip to the next messenger. Do not widen what it unlocks.",
        chips: [specChip("subject_token"), specChip("act")],
      },
    ),
    hop(
      "ex2",
      "agent2",
      "as",
      "Presents that token as subject_token; actor_token is Agent 2",
      {
        packet: { kind: "token", label: "actor_token" },
        chapter: "Grant",
        citation: "RFC 8693",
        why: "Each hop adds a hand. Expanding scope would let a downstream actor do more than Alice granted.",
        now: "Token exchange again: subject_token is the previous result, actor_token is Agent 2.",
        caption: "Another desk stamp: still Alice, now two names in the margin.",
        chips: [
          specChip("subject_token"),
          specChip("actor_token"),
          specChip("nested act"),
        ],
      },
    ),
    hop(
      "act2",
      "as",
      "agent2",
      "Returns a new token: act nests Agent 2 wrapping Agent 1. sub is still Alice",
      {
        packet: { kind: "id-token", label: "nested act" },
        chapter: "Grant",
        citation: "RFC 8693",
        why: "Audit can name every pair of hands. The user did not change. Nested act is not WIMSE hop re-bind.",
        now: "Nested act is a chain of actors. It is not a new sub and not WIMSE hop re-bind.",
        caption: "A chain of hands in the margin — not a new owner's name.",
        chips: [
          specChip("act"),
          specChip("sub"),
          egChip("act.act", "Nested actor object"),
        ],
        tokensAppear: [
          { actorId: "agent2", label: "nested act", packet: "id-token" },
        ],
      },
    ),
    hop(
      "call",
      "agent2",
      "api",
      "Presents the audience-restricted token at API B. Authorization header, not query",
      {
        packet: { kind: "token", label: "aud=API B" },
        chapter: "Call",
        citation: "RFC 8693",
        why: "The RS authorizes from aud and policy on act. Cross-domain trust needs identity chaining (8693+7523), not 8693 alone.",
        now: "Present the new pass at API B. Prefer DPoP/mTLS so the chain cannot be photocopied.",
        caption: "Show the pass at door B. The door can still read every hand in the margin.",
        chips: [
          specChip("aud"),
          specChip("Authorization"),
          specChip("act"),
        ],
      },
    ),
    hop(
      "rs-check",
      "api",
      "agent2",
      "Validates aud, exp, and act; responds",
      {
        packet: { kind: "token", label: "validated" },
        chapter: "Call",
        citation: "RFC 8693",
        why: "The RS must check audience and may apply policy to the act chain. Skipping act policy lets a nested actor do more than intended.",
        now: "API B checks the token is for itself and still names Alice as sub. Nested act is audit and policy input, not a new user.",
        caption: "The door reads the name and every hand in the margin, then opens.",
        chips: [specChip("aud"), specChip("sub"), specChip("act")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "RFC 8693 does not by itself define cross-domain trust — identity chaining profiles it with RFC 7523. Never expand scopes at a hop. Nested act is not WIMSE re-bind. Present subject_token; receive a new token with act appended.",
};

const ciba: ProtocolAnimation = {
  id: "ciba",
  protocol: "CIBA",
  question: "How does an unattended client get approval on another device?",
  title: "Backchannel grant, not a redirect",
  kicker: "Animated sequence · CIBA",
  summary:
    "Client-Initiated Backchannel Authentication: the client has no browser. It POSTs a backchannel authentication request, gets auth_req_id, and waits. The user is notified, authenticates, and consents on the authentication device. Token delivery is poll by default; ping and push are alternatives named in Why — the wait is not skipped.",
  loop: true,
  takeaway:
    "CIBA is a grant on another device (auth_req_id + poll by default). It authenticates and consents. It does not replace resource-server policy.",
  actors: [
    actor("agent", "Client (agent)", "agent"),
    actor("op", "OpenID provider", "as"),
    actor("user", "User (auth device)", "user"),
    actor("api", "Resource server", "resource"),
  ],
  steps: [
    hop(
      "bc",
      "agent",
      "op",
      "POSTs a backchannel authentication request: login_hint, scope, binding_message",
      {
        packet: { kind: "request", label: "CIBA auth" },
        chapter: "Discover",
        citation: "OpenID CIBA",
        why: "There is no front-channel redirect. The client is unattended. This is not the authorization endpoint used by code+PKCE.",
        now: "The client POSTs the backchannel authentication endpoint with a hint for which user, the scope, and a binding_message the user will see.",
        caption: "The unattended desk phones the notary instead of sending the owner a browser link.",
        chips: [
          specChip("backchannel_authentication_endpoint"),
          specChip("login_hint"),
          specChip("binding_message"),
          specChip("scope"),
        ],
      },
    ),
    hop(
      "id",
      "op",
      "agent",
      "Returns auth_req_id (and expires_in, interval)",
      {
        packet: { kind: "code", label: "auth_req_id" },
        chapter: "Grant",
        citation: "OpenID CIBA",
        why: "auth_req_id is the handle the client uses at the token endpoint (poll) or correlates with ping/push. It is not an access token.",
        now: "The OP returns auth_req_id. Delivery mode was declared at registration: poll (default in this sequence), ping, or push.",
        caption: "A ticket number for a grant that does not exist yet.",
        chips: [
          specChip("auth_req_id"),
          specChip("expires_in"),
          specChip("interval"),
        ],
        tokensAppear: [
          { actorId: "agent", label: "auth_req_id", packet: "code" },
        ],
      },
    ),
    hop(
      "notify",
      "op",
      "user",
      "Notifies the authentication device with the same binding_message",
      {
        packet: { kind: "consent", label: "binding_message" },
        chapter: "Grant",
        citation: "OpenID CIBA",
        why: "The user must see the same binding message the client showed, so they approve the right action. Do not skip notify.",
        now: "The OP contacts the user's authentication device (app/push). The agent is not in this hop and still has no token.",
        caption: "A ping on the phone: is this the action you meant?",
        chips: [specChip("binding_message"), specChip("authentication device")],
      },
    ),
    hop("login", "user", "op", "Authenticates on the authentication device", {
      packet: { kind: "consent", label: "login" },
      chapter: "Grant",
      citation: "OpenID CIBA",
      why: "Authentication and consent are different hops. Unlocking the phone is not yet an approval of the agent's request.",
      now: "The user proves who they are on the other device. The client still has only auth_req_id.",
      caption: "The owner unlocks the phone. The permission slip is still blank.",
      chips: [specChip("authentication")],
    }),
    hop("decide", "user", "op", "Consents — approves or denies — on the authentication device", {
      packet: { kind: "consent", label: "approve" },
      chapter: "Grant",
      citation: "OpenID CIBA",
      why: "Consent happens off the agent's screen. That is the point of CIBA.",
      now: "The user approves (or denies) the action that matches the binding_message. The client has not been told yet.",
      caption: "The owner signs on the phone, not in the agent's window.",
      chips: [specChip("consent"), specChip("binding_message")],
    }),
    hop(
      "poll-wait",
      "agent",
      "op",
      "Polls the token endpoint: grant_type CIBA + auth_req_id — authorization_pending",
      {
        packet: { kind: "request", label: "authorization_pending" },
        chapter: "Grant",
        citation: "OpenID CIBA",
        why: "Do not skip the wait. Poll is the default shown here: the client asks, the OP says not yet. Ping: the OP POSTs the client notification endpoint, then the client polls once. Push: the OP POSTs the tokens to the client. Mentioning ping/push in Why is not a substitute for this hop — the grant does not exist until the user finishes.",
        now: "Token endpoint grant_type=urn:openid:params:grant-type:ciba with auth_req_id. Response is authorization_pending (slow down by interval). The client still has no access token.",
        caption: "Ask again with the ticket number. The pass has not been printed.",
        chips: [
          specChip("token endpoint"),
          specChip("grant_type=ciba"),
          specChip("auth_req_id"),
          specChip("authorization_pending"),
          specChip("ping / push", "Alternatives to poll"),
        ],
      },
    ),
    hop(
      "poll-ok",
      "agent",
      "op",
      "Polls again after the wait — the user has now consented",
      {
        packet: { kind: "request", label: "auth_req_id" },
        chapter: "Grant",
        citation: "OpenID CIBA",
        why: "Still poll (default). If delivery were ping, this poll would happen after the notification. If push, this hop is the OP POSTing tokens instead — same result, different transport.",
        now: "The client repeats the token request with the same auth_req_id. The OP is now ready to mint.",
        caption: "Ask again. This time the notary has the owner's signature.",
        chips: [
          specChip("token endpoint"),
          specChip("auth_req_id"),
        ],
      },
    ),
    hop("tokens", "op", "agent", "Delivers the tokens for that approved action", {
      packet: { kind: "token", label: "tokens" },
      chapter: "Grant",
      citation: "OpenID CIBA",
      why: "CIBA mints a grant. The RS still enforces audience and policy. An ID Token appears only if openid was in scope — it is still not the API Bearer.",
      now: "The client receives the access token (and maybe an ID Token). CIBA is not resource-server policy and not XAA.",
      caption: "The pass arrives after the phone said yes.",
      chips: [specChip("access_token"), specChip("ID Token", "If OIDC scope")],
      tokensAppear: [{ actorId: "agent", label: "access token", packet: "token" }],
    }),
    hop(
      "call",
      "agent",
      "api",
      "Calls the RS with the access token — never with auth_req_id",
      {
        packet: { kind: "token", label: "Authorization" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "CIBA's job ended at token delivery. This hop exists so a beginner does not think auth_req_id is presented to APIs. The RS still checks audience and policy.",
        now: "The access token goes in the Authorization header to the resource the scope named. auth_req_id stays with the client.",
        caption: "The ticket number stays in the drawer. The pass goes to the door.",
        chips: [specChip("Authorization"), specChip("access_token")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "CIBA authenticates and consents a grant. It does not replace resource-server policy. XAA is a different control for pre-approved app connections. Poll is the default delivery shown; ping and push change who speaks first, not whether the user must finish.",
};

const mcp: ProtocolAnimation = {
  id: "mcp-auth",
  protocol: "MCP HTTP",
  question: "Who is the OAuth client when a host calls your tools?",
  title: "The host is the OAuth client",
  kicker: "Animated sequence · MCP HTTP",
  summary:
    "ChatGPT / Claude / Cursor calling your tools: vanilla OAuth 2.1 plus protected resource metadata. PRM is its own hop. Then authorization-code + PKCE as in OAuth 2.1, abbreviated only where the hops are identical. The host is the client. The resource is this MCP server. The model never sees a protocol other than 'call this tool'.",
  loop: true,
  takeaway:
    "Host = OAuth client. Resource = this MCP server (RFC 9728 PRM, RFC 8707 resource=). Photocopy until you add DPoP. Not AAuth p2p.",
  actors: [
    actor("user", "User", "user"),
    actor("host", "MCP host (client)", "agent"),
    actor("server", "MCP server (RS)", "resource"),
    actor("as", "Authorization server", "as"),
  ],
  steps: [
    hop("bare", "host", "server", "Unauthenticated HTTP request to the MCP server", {
      packet: { kind: "request", label: "HTTP" },
      chapter: "Discover",
      citation: "MCP auth",
      why: "The host does not guess the AS. The resource tells it how to authorize. Stdio transports must not use this profile.",
      now: "The MCP host (OAuth client) calls the MCP server (resource). The model is not the client.",
      caption: "Knock on the tool's door with no pass yet.",
      chips: [specChip("MCP host"), specChip("MCP server")],
    }),
    hop(
      "401",
      "server",
      "host",
      "401 + WWW-Authenticate resource_metadata URL (RFC 9728 PRM)",
      {
        packet: { kind: "challenge", label: "401 PRM" },
        challenge: true,
        chapter: "Discover",
        citation: "RFC 9728",
        why: "Protected resource metadata is how the client finds the AS and the canonical resource URI. Do not skip this challenge.",
        now: "WWW-Authenticate points at RFC 9728 protected resource metadata. resource = this MCP server, not a portable agent identity.",
        caption: "The door posts the address of the notice that names the desk.",
        chips: [
          specChip("WWW-Authenticate"),
          specChip("resource_metadata"),
          specChip("RFC 9728 PRM"),
        ],
      },
    ),
    hop(
      "prm",
      "host",
      "server",
      "GET protected resource metadata — this hop is not optional in MCP HTTP",
      {
        packet: { kind: "card", label: "PRM" },
        chapter: "Discover",
        citation: "RFC 9728",
        why: "Do not fold PRM into the 401. The metadata document is a separate GET. It names authorization_servers and the resource identifier the later token must use.",
        now: "The host fetches PRM from the URL the 401 advertised. That document is how MCP boots OAuth 2.1.",
        caption: "Read the notice on the tool's door: which desk, which room name.",
        chips: [
          specChip("protected resource metadata"),
          specChip("authorization_servers"),
          specChip("resource"),
        ],
      },
    ),
    hop(
      "as-meta",
      "host",
      "as",
      "GET authorization-server metadata (RFC 8414)",
      {
        packet: { kind: "request", label: "RFC 8414" },
        chapter: "Discover",
        citation: "RFC 8414",
        why: "Same hop as OAuth 2.1 discovery. Optional only if the host already knows the endpoints. Shown because MCP clients are often strangers to the AS.",
        now: "The host GETs AS metadata: authorization_endpoint, token_endpoint, PKCE methods, optional PAR.",
        caption: "Read the desk's hours — same as any OAuth 2.1 client.",
        chips: [
          specChip("authorization_endpoint"),
          specChip("token_endpoint"),
        ],
      },
    ),
    hop(
      "cimd",
      "host",
      "as",
      "Registers or identifies the host as a client (CIMD preferred; DCR deprecated)",
      {
        packet: { kind: "request", label: "CIMD" },
        chapter: "Discover",
        citation: "CIMD",
        why: "Optional if the host is already registered. MCP 2026-07-28 prefers CIMD and deprecates DCR. The model is still not the client.",
        now: "The host gets a client_id at this AS. That identifier is not a portable agent identity.",
        caption: "The host — not the model — takes a number at this desk.",
        chips: [specChip("CIMD"), specChip("client_id"), specChip("DCR", "Deprecated in MCP")],
      },
    ),
    hop(
      "pkce",
      "host",
      "host",
      "Generates PKCE code_verifier and S256 code_challenge",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Prove",
        citation: "RFC 7636",
        why: "Identical to OAuth 2.1 Prove. Shown so MCP is not a different login.",
        now: "The host stores a fresh code_verifier. Only the S256 hash will go to the AS.",
        caption: "Drawer secret — same as the OAuth 2.1 hop.",
        chips: [specChip("code_verifier"), specChip("S256")],
        tokensAppear: [
          { actorId: "host", label: "code_verifier", packet: "proof" },
        ],
      },
    ),
    hop(
      "authorize",
      "host",
      "as",
      "Authorization request: response_type=code, code_challenge, resource= this MCP URI",
      {
        packet: { kind: "proof", label: "PKCE + resource=" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Identical grant to OAuth 2.1, abbreviated: same front channel, plus RFC 8707 resource= bound to this MCP server. PAR if the request is rich.",
        now: "The host sends the user-agent to the authorization endpoint. resource= is this MCP server's canonical URI from PRM.",
        caption: "Walk the owner to the desk for a pass to this one tool.",
        chips: [
          specChip("response_type=code"),
          specChip("code_challenge"),
          specChip("resource=", "RFC 8707"),
        ],
      },
    ),
    hop("login", "user", "as", "Authenticates at the authorization server", {
      packet: { kind: "consent", label: "login" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "Identical to OAuth 2.1. Login is not consent and not the tool call.",
      now: "The resource owner authenticates at the AS. The MCP server has not been called with a token yet.",
      caption: "The owner shows ID at the pass desk.",
      chips: [specChip("authentication")],
    }),
    hop("consent", "user", "as", "Consents. OIDC if the tool needs who — ID Token is not the MCP Bearer", {
      packet: { kind: "consent", label: "consent" },
      chapter: "Grant",
      citation: "OIDC Core",
      why: "Identical to OAuth 2.1 / OIDC consent. An ID Token, if issued, stays with the host.",
      now: "The resource owner consents at the AS. The MCP server will later see an access token, not an ID Token.",
      caption: "The owner signs the slip for this tool, not a nametag for the API.",
      chips: [specChip("consent"), specChip("ID Token", "Not the API Bearer")],
    }),
    hop(
      "code",
      "as",
      "host",
      "Redirects back with an authorization code — not an access token in the URL",
      {
        packet: { kind: "code", label: "code" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Identical to OAuth 2.1. MCP does not revive implicit.",
        now: "The host receives a code. The MCP Bearer is not in this hop.",
        caption: "A ticket for this tool's desk.",
        chips: [specChip("code"), specChip("no implicit")],
      },
    ),
    hop(
      "token-req",
      "host",
      "as",
      "POSTs the token endpoint: code + code_verifier",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Grant",
        citation: "RFC 7636",
        why: "Identical to OAuth 2.1 back-channel redemption.",
        now: "grant_type=authorization_code, code, code_verifier. Prefer DPoP on this POST if you can.",
        caption: "Cash the ticket with the drawer secret.",
        chips: [
          specChip("token endpoint"),
          specChip("code"),
          specChip("code_verifier"),
        ],
      },
    ),
    hop(
      "pass",
      "as",
      "host",
      "Returns an access token with aud = this MCP server — not a portable agent identity",
      {
        packet: { kind: "token", label: "aud=MCP URI" },
        chapter: "Grant",
        citation: "RFC 8707",
        why: "Audience is this resource. Forwarding the pass to another MCP server is a mix-up. Still a Bearer photocopy until you add DPoP.",
        now: "The token endpoint returns an access token to the host. The model never sees it.",
        caption: "A pass for this door, held by the host.",
        chips: [
          specChip("access token"),
          specChip("aud"),
          specChip("Bearer"),
        ],
        tokensAppear: [
          { actorId: "host", label: "Bearer (this server)", packet: "token" },
        ],
      },
    ),
    hop(
      "call",
      "host",
      "server",
      "Authorization: Bearer. Server checks audience == itself",
      {
        packet: { kind: "token", label: "Bearer" },
        chapter: "Call",
        citation: "RFC 6750",
        why: "Audience validation is the difference between a calendar token and a payments incident. Not AAuth signed HTTP. Not an Agent Card.",
        now: "The host calls the MCP server with the access token in the Authorization header.",
        caption: "Show the pass at this tool's door. Do not photocopy it to the next tool.",
        chips: [
          specChip("Authorization: Bearer"),
          specChip("aud"),
        ],
      },
    ),
    hop(
      "validate",
      "server",
      "host",
      "Validates aud (RFC 9068 JWT or introspection) and responds",
      {
        packet: { kind: "token", label: "validated" },
        chapter: "Call",
        citation: "RFC 9068",
        why: "Identical to the OAuth 2.1 Call validation hop. The MCP server is the RS.",
        now: "The MCP server checks the token is for itself and returns the tool result. An ID Token must not be accepted here.",
        caption: "The tool checks the stamp matches this door, then answers.",
        chips: [specChip("aud"), specChip("RFC 9068"), specChip("RFC 7662", "Opaque tokens")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "MCP 2026-07-28 is an OAuth 2.1 profile, not an RFC. Stdio transports must not use this. Photocopy until you add DPoP. Never forward the pass to another audience. Not AAuth p2p. PRM is a hop of its own.",
};

const a2a: ProtocolAnimation = {
  id: "a2a",
  protocol: "A2A",
  question: "Is the Agent Card a login?",
  title: "The card is a catalog, not a login",
  kicker: "Animated sequence · A2A",
  summary:
    "A2A is how agents talk: Agent Cards, skills, tasks. Fetch the card, read securitySchemes, then HTTP to the advertised endpoint. Authentication is declared on the card and obtained out of band. A signed card is tamper evidence, not a request credential. This is not AAuth p2p.",
  loop: true,
  takeaway:
    "Agent Card + securitySchemes = catalog. Request auth is ordinary HTTP, out of band. Not AAuth signed HTTP, not a did:peer handshake.",
  actors: [
    actor("client", "Client agent", "agent"),
    actor("server", "Server agent", "agent"),
    actor("as", "Enterprise AS", "as"),
  ],
  steps: [
    hop(
      "fetch-card",
      "client",
      "server",
      "GET /.well-known/agent-card.json — do not skip the card",
      {
        packet: { kind: "card", label: "Agent Card" },
        chapter: "Discover",
        citation: "A2A v1.0",
        why: "The card is how you learn the advertised URL, skills, and securitySchemes. Calling a guessed endpoint without reading the card is not A2A.",
        now: "The client fetches the Agent Card from the server agent. This GET is discovery, not login.",
        caption: "Take the catalog off the door before you try to order.",
        chips: [
          specChip("Agent Card"),
          specChip("/.well-known/agent-card.json"),
        ],
        tokensAppear: [
          { actorId: "client", label: "Agent Card", packet: "card" },
        ],
      },
    ),
    hop(
      "read-schemes",
      "client",
      "client",
      "Reads securitySchemes, skills, and the advertised endpoint URL",
      {
        packet: { kind: "card", label: "securitySchemes" },
        chapter: "Discover",
        citation: "A2A v1.0",
        why: "Do not skip this read. securitySchemes declare OAuth, OIDC, mTLS, or API keys — obtained out of band. The url field is where the later HTTP call goes.",
        now: "The client parses the card: skills (what the server can do), securitySchemes (how to authenticate), url (the advertised endpoint). Nothing has authenticated yet.",
        caption: "Read the menu: hours, dishes, and which pass the kitchen wants.",
        chips: [
          specChip("securitySchemes"),
          specChip("skills"),
          specChip("url"),
        ],
      },
    ),
    hop(
      "jws",
      "server",
      "client",
      "Optional JWS on the card — wax seal on the catalog, not a login",
      {
        packet: { kind: "proof", label: "JWS on card" },
        chapter: "Prove",
        citation: "A2A v1.0",
        why: "Optional. A signed card proves the catalog was not swapped. It does not authenticate the later request. Still require a request-level scheme from securitySchemes.",
        now: "Verify the card signature if present. This hop does not replace OAuth, mTLS, or API keys.",
        caption: "Wax seal on the menu. You still need a pass to order.",
        chips: [specChip("JWS"), specChip("tamper evidence")],
      },
    ),
    hop(
      "oauth",
      "client",
      "as",
      "If the card says OAuth/OIDC, obtain a token out of band",
      {
        packet: { kind: "token", label: "out of band" },
        chapter: "Grant",
        citation: "OAuth 2.1",
        why: "Optional if securitySchemes named mTLS or an API key instead. A2A does not invent a p2p login. Implicit and password flows on Agent Cards are deprecated. The full code+PKCE hops are the OAuth 2.1 sequence.",
        now: "If securitySchemes say OAuth, the client talks to an AS like any other HTTP API. That is not AAuth identity-based access.",
        caption: "Go to the ordinary desk for the pass the catalog asked for.",
        chips: [
          specChip("securitySchemes"),
          specChip("OAuth / OIDC / mTLS"),
          specChip("out of band"),
        ],
        tokensAppear: [
          { actorId: "client", label: "request credential", packet: "token" },
        ],
      },
    ),
    hop(
      "task",
      "client",
      "server",
      "HTTP to the advertised endpoint: authenticated A2A operation + A2A-Version",
      {
        packet: { kind: "request", label: "A2A-Version" },
        chapter: "Call",
        citation: "A2A v1.0",
        why: "The request goes to the url the card advertised — not to a guessed path. Auth is whatever the card declared. Do not forward caller credentials in-band down a chain.",
        now: "JSON-RPC / gRPC / HTTP+JSON plus A2A-Version. Auth is ordinary HTTP (Authorization, mTLS, …) — not Signature-Key aa-agent+jwt.",
        caption: "Place the order at the kitchen the menu named, with the pass the menu asked for.",
        chips: [
          specChip("A2A-Version"),
          specChip("url"),
          specChip("task"),
          specChip("not AAuth p2p"),
        ],
      },
    ),
    hop(
      "respond",
      "server",
      "client",
      "Server agent handles the task and responds",
      {
        packet: { kind: "request", label: "task result" },
        chapter: "Call",
        citation: "A2A v1.0",
        why: "A2A communication ends with a task result, not with an OAuth code. A signed Agent Card still was not this request's credential.",
        now: "The server agent returns the task (result, artifact, or working). Request auth was whatever securitySchemes named.",
        caption: "The kitchen sends the dish. The menu's wax seal is still not the bill.",
        chips: [specChip("task"), specChip("A2A-Version")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "Wrong cousins: AAuth identity-based p2p (signed HTTP, no Agent Card) and did:peer (pairwise, not globally fetched). A2A §7.6.3 — do not forward caller credentials in-band down the chain. Fetch the card; read securitySchemes; call the advertised endpoint.",
};

const wimse: ProtocolAnimation = {
  id: "wimse-arch",
  protocol: "WIMSE",
  question: "Who is calling at this hop — the binary, or the user?",
  title: "Each hop re-binds",
  kicker: "Animated sequence · WIMSE",
  summary:
    "WIT names the workload (the binary), not the user. WPT is bound to this hop. The next hop must re-bind with a new WPT — it does not replay the previous workload's identity. User context travels in another header (Txn-Token / OAuth).",
  loop: true,
  takeaway:
    "WIT/WPT name the binary. Each hop re-binds. Do not put WIT in Authorization: Bearer. User sub is a separate pass.",
  actors: [
    actor("spire", "SPIRE / issuer", "workload"),
    actor("a", "Workload A", "workload"),
    actor("b", "Workload B", "workload"),
    actor("c", "Workload C", "workload"),
  ],
  steps: [
    hop("wit", "spire", "a", "Issues WIT (workload identity token). sub is the binary, not a user", {
      packet: { kind: "proof", label: "WIT" },
      chapter: "Discover",
      citation: "WIMSE",
      why: "Workload identity answers which service in which trust domain — not which human. This credential is not an OAuth access token.",
      now: "WIT names A. The issuer (often SPIRE) also provides the key material used to mint WPTs. This is not a user sub.",
      caption: "A badge for the machine, not a nametag for Alice.",
      chips: [
        specChip("WIT"),
        specChip("sub=workload"),
      ],
      tokensAppear: [{ actorId: "a", label: "WIT", packet: "proof" }],
    }),
    hop(
      "wpt-a",
      "a",
      "a",
      "Mints a WPT bound to this hop (A → B)",
      {
        packet: { kind: "proof", label: "WPT" },
        chapter: "Prove",
        citation: "WIMSE WPT",
        why: "Do not skip the bind. A WIT presented as Authorization: Bearer is the wrong cousin of an access token. WPT (or mTLS) is the proof for this hop's method and target.",
        now: "A creates a workload proof token bound to calling B (this hop). Optional user context (Txn-Token / OAuth) is a different header — not inside the SPIFFE ID.",
        caption: "Glue this hop's wax to the machine badge. Alice's pass, if any, is a second paper.",
        chips: [
          specChip("WPT"),
          specChip("this hop"),
          specChip("Txn-Token", "User context, separate header"),
        ],
        tokensAppear: [{ actorId: "a", label: "WPT for B", packet: "proof" }],
      },
    ),
    hop("a2b", "a", "b", "A authenticates to B with WIT + WPT (or mTLS)", {
      packet: { kind: "proof", label: "WIT+WPT" },
      chapter: "Call",
      citation: "WIMSE WPT",
      why: "The proof is bound to this hop. B learns A is A — not that A is Alice.",
      now: "A presents WIT plus the WPT minted for B. mTLS is an alternative proof. Never put WIT in Authorization: Bearer.",
      caption: "Show the machine badge plus this doorway's wax.",
      chips: [
        specChip("WIT"),
        specChip("WPT"),
        specChip("mTLS", "Alternative"),
      ],
    }),
    hop(
      "b-wit",
      "spire",
      "b",
      "B already has (or now receives) its own WIT — A's identity is not forwarded",
      {
        packet: { kind: "proof", label: "B's WIT" },
        chapter: "Discover",
        citation: "WIMSE",
        why: "Optional as a network hop if B was issued WIT at startup. Shown so a beginner sees B has its own credential. Do not photocopy A's WIT onward.",
        now: "B's sub is B. That is not nested act and not a user sub.",
        caption: "A second machine badge, already in B's pocket.",
        chips: [specChip("WIT"), specChip("sub=B")],
        tokensAppear: [{ actorId: "b", label: "WIT", packet: "proof" }],
      },
    ),
    hop(
      "wpt-b",
      "b",
      "b",
      "Mints a new WPT bound to the next hop (B → C)",
      {
        packet: { kind: "proof", label: "new WPT" },
        chapter: "Prove",
        citation: "WIMSE WPT",
        why: "Re-bind. Forwarding A's WPT would let the chain silently widen. This is not RFC 8693 nested act.",
        now: "B creates a proof bound to calling C. A's WPT must not be replayed here.",
        caption: "New wax for the next doorway. Tear off the last hop's glue.",
        chips: [specChip("WPT"), specChip("hop re-bind")],
        tokensAppear: [{ actorId: "b", label: "WPT for C", packet: "proof" }],
      },
    ),
    hop(
      "rebind",
      "b",
      "c",
      "B authenticates as itself with B's WIT + the new WPT",
      {
        packet: { kind: "proof", label: "B's WIT+WPT" },
        chapter: "Call",
        citation: "WIMSE",
        why: "Each hop must re-bind. C should see B, not A pretending to still be on the wire.",
        now: "B presents B's WIT/WPT to C. User context, if any, still rides in a different header.",
        caption: "New seal at every doorway. Do not photocopy the last machine's badge.",
        chips: [
          specChip("WIT"),
          specChip("WPT"),
          specChip("hop re-bind"),
          specChip("not user sub"),
        ],
      },
    ),
    hop(
      "c-ok",
      "c",
      "b",
      "C verifies this hop's WPT and responds",
      {
        packet: { kind: "proof", label: "verified" },
        chapter: "Call",
        citation: "WIMSE",
        why: "Verification is per hop. Accepting A's identity here would skip re-bind.",
        now: "C checks B's WIT and that the WPT is bound to this hop, then answers. Nested act (RFC 8693) is a different chain.",
        caption: "The third doorway checks this doorway's wax, not the first messenger's.",
        chips: [specChip("WPT"), specChip("this hop")],
        durationMs: 3200,
      },
    ),
  ],
  footnote:
    "WIMSE architecture is a WG informational draft, not a protocol RFC. Implement WIT/WPT or SPIFFE for wire. Do not stuff the user into the SPIFFE ID. Nested act (RFC 8693) is a different chain. Credential, bind WPT to this hop, re-bind at the next hop.",
};

const pkce: ProtocolAnimation = {
  id: "pkce",
  protocol: "PKCE",
  question: "Why can't a stolen authorization code be redeemed?",
  title: "Only the process that started the flow can finish it",
  kicker: "Animated sequence · PKCE",
  summary:
    "The client keeps a high-entropy code_verifier. The authorization server only sees a hash (code_challenge, S256). An interceptor who steals the code from the redirect cannot redeem it. OAuth 2.1 keeps only S256; plain is gone. Authentication and consent stay separate hops.",
  loop: true,
  takeaway:
    "code_verifier never rides the browser. S256 only. A stolen code without the verifier fails at the token endpoint.",
  actors: [
    actor("agent", "Client (agent)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("user", "RO (user)", "user"),
  ],
  steps: [
    hop(
      "make",
      "agent",
      "agent",
      "Creates a code_verifier and keeps it",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Prove",
        citation: "RFC 7636",
        why: "The secret must never appear on the front channel. A static challenge is not PKCE. Generate a new verifier per authorization request.",
        now: "The client generates a fresh code_verifier and holds it in the process that will later call the token endpoint.",
        caption: "Write a secret in the desk drawer.",
        chips: [specChip("code_verifier")],
        tokensAppear: [
          { actorId: "agent", label: "code_verifier", packet: "proof" },
        ],
      },
    ),
    hop(
      "challenge",
      "agent",
      "agent",
      "Derives code_challenge = S256(code_verifier)",
      {
        packet: { kind: "proof", label: "code_challenge" },
        chapter: "Prove",
        citation: "RFC 7636",
        why: "Only the hash goes to the AS. OAuth 2.1 dropped the plain method.",
        now: "code_challenge is BASE64URL(SHA256(code_verifier)). code_challenge_method is S256.",
        caption: "Only the hash will go in the mail.",
        chips: [specChip("code_challenge"), specChip("S256")],
      },
    ),
    hop("send", "agent", "as", "Authorization request carries code_challenge, not the verifier", {
      packet: { kind: "proof", label: "code_challenge" },
      chapter: "Grant",
      citation: "RFC 7636",
      why: "The AS stores the hash so it can match later. The verifier stays with the client. PAR (RFC 9126) may carry this on the back channel instead — optional, see the PAR sequence.",
      now: "authorization endpoint: response_type=code, code_challenge, code_challenge_method=S256.",
      caption: "Mail the hash. Keep the drawer closed.",
      chips: [
        specChip("authorization endpoint"),
        specChip("code_challenge"),
        specChip("code_challenge_method=S256"),
      ],
    }),
    hop("login", "user", "as", "Authenticates at the authorization server", {
      packet: { kind: "consent", label: "login" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "PKCE does not replace authentication. Login is not consent.",
      now: "The resource owner authenticates at the AS. An interceptor might still see the later redirect.",
      caption: "The owner shows ID. The ticket can still be seen in transit later.",
      chips: [specChip("authentication")],
    }),
    hop("ok", "user", "as", "Consents to this client", {
      packet: { kind: "consent", label: "consent" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "PKCE does not replace consent. It protects the code redemption.",
      now: "The resource owner approves. The code has not been issued yet.",
      caption: "The owner signs. The drawer secret is still what will cash the ticket.",
      chips: [specChip("consent")],
    }),
    hop("code", "as", "agent", "Authorization code in the redirect (an interceptor might see this)", {
      packet: { kind: "code", label: "code" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "The code is a ticket that rides the user-agent. That is why PKCE exists.",
      now: "The authorization endpoint returns a code on the front channel. Without the verifier, the code should not redeem.",
      caption: "A ticket in the open. Cashable only with the drawer secret.",
      chips: [specChip("code")],
    }),
    hop(
      "redeem",
      "agent",
      "as",
      "Token request: code + the original code_verifier",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Grant",
        citation: "RFC 7636",
        why: "The AS accepts the code only if SHA-256(verifier) matches the stored challenge. A stolen code without the verifier fails here.",
        now: "token endpoint: grant_type=authorization_code, code, code_verifier. The browser never sees the verifier.",
        caption: "Open the drawer. Only this desk can cash the ticket.",
        chips: [
          specChip("token endpoint"),
          specChip("code"),
          specChip("code_verifier"),
        ],
      },
    ),
    hop("match", "as", "as", "Hashes the verifier with S256 and matches the stored challenge", {
      packet: { kind: "proof", label: "S256 match" },
      chapter: "Grant",
      citation: "RFC 7636",
      why: "Do not skip the match. Issuing a token without checking S256 is not PKCE.",
      now: "The AS computes BASE64URL(SHA256(code_verifier)) and compares it to the code_challenge from the authorization request.",
      caption: "The desk checks the hash against what was mailed.",
      chips: [specChip("S256"), specChip("code_challenge")],
    }),
    hop("token", "as", "agent", "Match — access token. Stolen code without the verifier fails", {
      packet: { kind: "token", label: "access token" },
      chapter: "Grant",
      citation: "RFC 6750",
      why: "PKCE protected the ticket. The pass still belongs in the Authorization header. Generate a new verifier next time.",
      now: "The token endpoint mints the access token on the back channel. An interceptor who had only the code has nothing.",
      caption: "The pass is printed only for the desk that kept the secret.",
      chips: [specChip("access_token")],
      durationMs: 3200,
    }),
  ],
  footnote:
    "RFC 7636. OAuth 2.1 keeps only S256; the plain method is gone. Generate a new verifier per authorization request.",
};

const par: ProtocolAnimation = {
  id: "par",
  protocol: "PAR",
  question: "How do rich authorization requests stay off the URL?",
  title: "The rich request never rides the URL",
  kicker: "Animated sequence · PAR",
  summary:
    "Pushed Authorization Requests (RFC 9126) put RAR JSON, many scopes, or a mission description on a back-channel POST. The browser redirect carries only a short request_uri. Then the usual code + PKCE redemption. Authentication and consent stay separate.",
  loop: true,
  takeaway:
    "POST the pushed authorization request; the front channel carries only request_uri. Then redeem the code with PKCE as usual.",
  actors: [
    actor("agent", "Client (agent)", "agent"),
    actor("as", "Authorization server", "as"),
    actor("user", "RO (user)", "user"),
  ],
  steps: [
    hop(
      "pkce",
      "agent",
      "agent",
      "Generates PKCE code_verifier and S256 code_challenge",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Prove",
        citation: "RFC 7636",
        why: "PAR does not replace PKCE. The verifier still stays in the client.",
        now: "The client stores a fresh code_verifier. The challenge will be POSTed on PAR, not on a juicy query string.",
        caption: "Drawer secret first. Then file the long form.",
        chips: [specChip("code_verifier"), specChip("S256")],
        tokensAppear: [
          { actorId: "agent", label: "code_verifier", packet: "proof" },
        ],
      },
    ),
    hop(
      "push",
      "agent",
      "as",
      "POST authorization parameters to the PAR endpoint (client authenticates)",
      {
        packet: { kind: "request", label: "pushed request" },
        chapter: "Grant",
        citation: "RFC 9126",
        why: "Rich payloads (RAR, many scopes, resource indicators, mission text) must not land in browser logs.",
        now: "The client POSTs the pushed authorization request endpoint: scope, resource, PKCE challenge, maybe authorization_details. Confidential clients authenticate on this POST.",
        caption: "File the long form at the back desk. The postcard will only carry a claim ticket.",
        chips: [
          specChip("pushed authorization request endpoint"),
          specChip("code_challenge"),
          specChip("authorization_details", "RAR, if used"),
        ],
      },
    ),
    hop("uri", "as", "agent", "Returns request_uri + expires_in — one-time, short-lived", {
      packet: { kind: "code", label: "request_uri" },
      chapter: "Grant",
      citation: "RFC 9126",
      why: "request_uri is a reference, not the request and not an authorization code. It expires quickly and should be single-use.",
      now: "The AS returns request_uri and expires_in. That URI is not an access token.",
      caption: "A claim ticket for the form you already filed.",
      chips: [specChip("request_uri"), specChip("expires_in")],
      tokensAppear: [
        { actorId: "agent", label: "request_uri", packet: "code" },
      ],
    }),
    hop(
      "redirect",
      "agent",
      "as",
      "Front-channel redirect: client_id + request_uri only",
      {
        packet: { kind: "code", label: "request_uri" },
        chapter: "Grant",
        citation: "RFC 9126",
        why: "Logs and Referer see a short URI, not the mission text. response_type=code still applies — the PAR body already said so.",
        now: "The authorization endpoint redirect carries client_id and request_uri. Nothing juicy in the query string.",
        caption: "The postcard only has the claim ticket.",
        chips: [
          specChip("authorization endpoint"),
          specChip("client_id"),
          specChip("request_uri"),
        ],
      },
    ),
    hop("login", "user", "as", "Authenticates at the authorization server", {
      packet: { kind: "consent", label: "login" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "PAR did not skip login. Authentication is not consent.",
      now: "The resource owner authenticates. The AS will show the pushed request, not a truncated query string.",
      caption: "The owner shows ID. The full form is already at the desk.",
      chips: [specChip("authentication")],
    }),
    hop("consent", "user", "as", "Sees the pushed request and consents", {
      packet: { kind: "consent", label: "consent" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "The RO reviews what was pushed, not a truncated query string.",
      now: "The resource owner consents to the request the client already pushed.",
      caption: "The owner reads the full form at the desk, then signs.",
      chips: [specChip("consent")],
    }),
    hop("code", "as", "agent", "Redirects back with an authorization code", {
      packet: { kind: "code", label: "code" },
      chapter: "Grant",
      citation: "OAuth 2.1",
      why: "PAR did not replace the code. The code still redeems at the token endpoint with code_verifier.",
      now: "The AS returns a code on the front channel. Still no access token in the URL.",
      caption: "A ticket. Cash it the usual way.",
      chips: [specChip("code"), specChip("no implicit")],
    }),
    hop(
      "redeem",
      "agent",
      "as",
      "POSTs the token endpoint: code + code_verifier",
      {
        packet: { kind: "proof", label: "code_verifier" },
        chapter: "Grant",
        citation: "RFC 7636",
        why: "FAPI 2.0 and several agent-grant profiles want PAR plus PKCE. Do not skip redemption.",
        now: "grant_type=authorization_code, code, code_verifier. Same as OAuth 2.1.",
        caption: "Open the drawer. Cash the ticket.",
        chips: [
          specChip("token endpoint"),
          specChip("code"),
          specChip("code_verifier"),
        ],
      },
    ),
    hop("token", "as", "agent", "Returns the access token on the back channel", {
      packet: { kind: "token", label: "access token" },
      chapter: "Grant",
      citation: "RFC 6750",
      why: "The pass is minted in the back office. PAR only kept the form off the postcard.",
      now: "Token endpoint returns access_token. Call the RS with Authorization header next (see OAuth 2.1 Call).",
      caption: "The pass is printed only after the long form and the drawer secret both checked out.",
      chips: [specChip("access_token")],
      durationMs: 3200,
    }),
  ],
  footnote:
    "RFC 9126. FAPI 2.0 and several agent-grant profiles want PAR. Use it whenever an agent would otherwise put a mission on a query string.",
};

const specAnimations: Record<string, ProtocolAnimation> = {
  "oauth-2-1": oauth21,
  "oidc-core": oidc,
  aauth,
  dpop,
  "token-exchange": tokenExchange,
  ciba,
  "mcp-auth": mcp,
  a2a,
  "wimse-arch": wimse,
  pkce,
  par,
};

export function getSpecAnimation(slug: string): ProtocolAnimation | undefined {
  return specAnimations[slug];
}

export function specHasAnimation(slug: string): boolean {
  return slug in specAnimations;
}

export function slugifyActor(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "actor";
}

export function inferActorKind(label: string): TopologyKind {
  const l = label.toLowerCase();
  if (/thief/.test(l)) return "other";
  if (
    /user|alice|human|authentication device|resource owner/.test(l) &&
    !/agent/.test(l)
  ) {
    return "user";
  }
  if (
    /person server|authorization server|\bas\b|openid provider|\bop\b|oauth as|\bidp\b/.test(
      l,
    )
  ) {
    return "as";
  }
  if (/agent provider|\bprovider\b/.test(l)) return "other";
  if (/\bmcp server\b|resource server|\bapis?\b|\btool\b/.test(l) && !/agent/.test(l)) {
    return "resource";
  }
  if (/spire|workload|spiffe/.test(l)) return "workload";
  if (/agent|mcp client|mcp host|\bhost\b/.test(l)) return "agent";
  if (/resource/.test(l)) return "resource";
  return "other";
}

export function inferPacket(step: FlowStep): AnimationPacket {
  const text = `${step.action} ${step.note ?? ""} ${step.now ?? ""} ${step.citation ?? ""}`.toLowerCase();
  if (/401|challenge|requirement|www-authenticate|authorization_pending|202 \+ interaction/.test(text)) {
    return { kind: "challenge", label: /202/.test(text) ? "202" : "401" };
  }
  if (/agent card|agent-card/.test(text)) {
    return { kind: "card", label: "Agent Card" };
  }
  if (/protected resource metadata|\bprm\b|resource_metadata/.test(text)) {
    return { kind: "card", label: "PRM" };
  }
  if (/id token/.test(text)) {
    return { kind: "id-token", label: "ID Token" };
  }
  if (/dpop/.test(text)) {
    return { kind: "proof", label: "DPoP" };
  }
  if (/\bwpt\b|\bwit\b/.test(text)) {
    return { kind: "proof", label: "WIT/WPT" };
  }
  if (/jwks/.test(text)) {
    return { kind: "request", label: "JWKS" };
  }
  if (/session/.test(text)) {
    return { kind: "session", label: "session" };
  }
  if (/aa-auth|auth token/.test(text)) {
    return { kind: "token", label: "aa-auth+jwt" };
  }
  if (/aa-resource|resource token/.test(text)) {
    return { kind: "token", label: "aa-resource+jwt" };
  }
  if (/aa-agent|agent token/.test(text)) {
    return { kind: "proof", label: "aa-agent+jwt" };
  }
  if (/nonce/.test(text)) {
    return { kind: "proof", label: "nonce" };
  }
  if (/auth_req_id/.test(text)) {
    return { kind: "code", label: "auth_req_id" };
  }
  if (/request_uri|pushed authorization|\bpar\b/.test(text)) {
    return { kind: "code", label: "request_uri" };
  }
  if (/signature|signed http|code_verifier|pkce|code_challenge/.test(text)) {
    return { kind: "proof", label: /pkce|verifier|challenge/.test(text) ? "PKCE" : "proof" };
  }
  if (/consent|authenticat|approve|login/.test(text)) {
    return { kind: "consent", label: /login|authenticat/.test(text) ? "login" : "consent" };
  }
  if (/\bcode\b/.test(text)) {
    return { kind: "code", label: "code" };
  }
  if (/token|jwt|bearer|introspect/.test(text)) {
    return { kind: "token", label: "token" };
  }
  return { kind: "request", label: "HTTP" };
}

function inferHeldPacket(label: string): PacketKind {
  return inferPacket({ from: "", to: "", action: label }).kind;
}

function resolveActorId(
  name: string,
  byId: Map<string, AnimationActor>,
): string {
  const exact = slugifyActor(name);
  if (byId.has(exact)) return exact;
  const lower = name.toLowerCase();
  for (const item of byId.values()) {
    const lab = item.label.toLowerCase();
    if (lab === lower || lab.startsWith(`${lower} `) || lab.startsWith(`${lower}(`)) {
      return item.id;
    }
    const head = lab.split(" (")[0];
    if (head === lower) return item.id;
  }
  const created = actor(exact, name, inferActorKind(name));
  byId.set(exact, created);
  return exact;
}

export function animationFromFlow(flow: AgentFlow): ProtocolAnimation {
  const byId = new Map<string, AnimationActor>();
  for (const name of flow.actors) {
    const id = slugifyActor(name);
    if (!byId.has(id)) {
      byId.set(id, actor(id, name, inferActorKind(name)));
    }
  }
  for (const step of flow.steps) {
    resolveActorId(step.from, byId);
    resolveActorId(step.to, byId);
  }

  const steps: AnimationStep[] = flow.steps.map((step, index) => {
    const packet = inferPacket(step);
    const text = `${step.action} ${step.note ?? ""} ${step.now ?? ""}`;
    const held = step.held?.map((item) => ({
      actorId: resolveActorId(item.actor, byId),
      label: item.label,
      packet: inferHeldPacket(item.label),
    }));
    return hop(
      `${flow.slug}-${index}`,
      resolveActorId(step.from, byId),
      resolveActorId(step.to, byId),
      step.action,
      {
        note: step.note,
        durationMs: step.durationMs ?? DEFAULT_DURATION_MS,
        packet,
        challenge: step.challenge ?? /401|requirement=/i.test(text),
        fail: step.fail,
        why: step.why ?? step.note ?? "This hop is part of the grant or call; it is not silent.",
        caption: step.caption ?? step.action,
        citation: step.citation ?? flow.protocol ?? "spec",
        chips: step.chips ?? [],
        now: step.now ?? step.action,
        chapter: step.chapter ?? "Call",
        tokensAppear: held,
      },
    );
  });

  return {
    id: flow.slug,
    title: flow.title,
    kicker: `Animated sequence · ${flow.pattern}`,
    summary: flow.summary,
    protocol: flow.protocol,
    question: flow.question,
    takeaway: flow.takeaway,
    actors: [...byId.values()],
    steps,
    footnote: flow.caveats,
    loop: true,
  };
}
