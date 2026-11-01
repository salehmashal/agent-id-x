import type { Spec } from "@/lib/types";

export const oauthExtensionSpecs: Spec[] = [
  {
    slug: "par",
    shortName: "PAR",
    officialName: "OAuth 2.0 Pushed Authorization Requests",
    id: "RFC 9126",
    status: "rfc",
    stability: "stable",
    date: "September 2021",
    authors: "T. Lodderstedt, B. Campbell, N. Sakimura, D. Tonge, F. Skokan",
    org: "IETF",
    layer: "authz",
    relevance: "foundation",
    aliases: ["rfc9126", "pushed authorization"],
    problem:
      "Authorization requests stuffed into a front-channel redirect are large, leak via logs and Referer, and can be tampered with. PAR lets the client POST the request to the AS first and redirect with a short request_uri.",
    identityVsAuthnVsAuthz:
      "Protects the integrity and confidentiality of the authorization request. Required or recommended by FAPI 2.0 and by several agent-grant profiles.",
    actors: ["Client", "Authorization server", "Resource owner user-agent"],
    flow: "Client authenticates to the AS and POSTs the authorization parameters to the PAR endpoint. AS returns request_uri (and expires_in). Client redirects the user with client_id + request_uri only.",
    tokensAndClaims: [
      {
        name: "request_uri",
        meaning: "One-time reference to the pushed request. Short-lived.",
      },
    ],
    related: ["par", "jar", "rar", "fapi-2", "agent-grants", "oauth-2-1"].slice(1),
