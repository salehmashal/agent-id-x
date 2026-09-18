# Agent Identity Landscape

A field guide to **AI agent identity, authentication, and authorization**: OAuth 2.1, OIDC, AAuth, related IETF / OIDF / W3C / protocol work, deployment patterns, and interactive boards.

It exists to answer a concrete question: when people say *AAuth*, *p2p*, *OIDC*, and *OAuth 2.1* in the same breath, **what documents do they actually mean**, how do those documents nest, and what is stable versus draft versus a vendor protocol?

- **Live demo:** [https://agent-id-x.demooie.com/](https://agent-id-x.demooie.com/)
- **Source:** [https://github.com/salehmashal/agent-id-x](https://github.com/salehmashal/agent-id-x)

This is an educational reference. It is **not** a standards document and **not** legal or security advice.

Hard topics are taught with **interactive boards** and **animated sequences** (CSS/SVG + a little React state): four principals as seats, AAuth access-mode restaging, OAuth 2.1 “what got banned,” token-exchange `act` versus WIMSE hop re-bind, four doors for delegated / AAuth p2p / A2A / did:peer, and motion that shows messages hopping — 401 challenges, PKCE verifiers, Agent Cards, nested `act`. Tokens are passes, signatures are wax seals, Bearer is a photocopy, DPoP is a pass glued to a key. There is no course overlay, XP, or quiz hub.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui.

## How to run locally

```bash
npm install
npm run dev
```

The dev script binds **0.0.0.0:43173**. Open [http://localhost:43173](http://localhost:43173).

## Build

```bash
npm run build
```

By default `next build` (and `npm run export`, which is the same command) writes a static site to **`out/`**. Preview that export with any static file server, for example:

```bash
npx serve out --listen tcp://0.0.0.0:43173
```

`next start` is not used for a static export.

## Deploy

This is a static educational reference: **no auth, no database, no secrets**. Host it over HTTPS.

### Static export (Vercel, Netlify, GitHub Pages, Cloudflare Pages)

`npm run build` produces `out/`. Point the host at that directory.

- **Vercel:** import the Git repo. The project uses `output: "export"` and `vercel.json` security headers; no custom output directory is required.
- **Netlify:** import the repo (`netlify.toml` is included) or upload `out/`.
- **GitHub Pages:** publish `out/` (keep `public/.nojekyll` so `_next` assets are not ignored). For a project-site subpath (`https://<user>.github.io/<repo>/`), set `basePath` in `next.config.ts` and rebuild.
- **Cloudflare Pages (static):** framework preset **None**, build command `npm run build`, output directory `out`. Security headers come from `public/_headers`.

### Cloudflare Workers (OpenNext)

OpenNext is **not** the static `out/` pipeline. Do not combine `output: "export"` with OpenNext.

```bash
npm run cf:build
npx wrangler deploy
```

`wrangler.jsonc` names the Worker **`agent-id-x`**. `next.config.ts` skips static export when OpenNext / `cf:build` is detected (or when `CLOUDFLARE` / `OPEN_NEXT` / `STATIC_EXPORT=0` is set). Preview locally with `npm run preview`.

There is no analytics, cookie banner, or third-party script, so the Content-Security-Policy stays locked to `'self'` plus the inline script/style Next and Tailwind require.

## Spec status

Internet-Drafts expire, get renamed, and move from individual to working-group to RFC Editor. OpenID Final specs get errata. MCP and A2A version independently of the IETF.

**Before you implement, read the source:**

- [IETF Datatracker](https://datatracker.ietf.org/)
- [RFC Editor](https://www.rfc-editor.org/)
- [OpenID Foundation specs](https://openid.net/developers/specs/)
- MCP: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- A2A: [a2a-protocol.org](https://a2a-protocol.org/)

The copy in this repo was researched **15 September 2026** and re-checked **18 September 2026**. AAuth draft-10 versus the editor’s copy already disagreed on four vs five access modes; AIMS moved from an individual draft to WIMSE WG `draft-ietf-wimse-aims-00` on 15 September. That kind of drift will continue.

## Content map

| Route | What it is |
| --- | --- |
| `/` | Landscape map, four-principal board, four-doors explainer |
| `/catalog` | Filterable catalog (status, layer, relevance, stability) |
| `/specs/[slug]` | One document: at-a-glance plus, for main specs, an **animated sequence** of how the protocol works, a compact interactive board, and a field-guide chapter (agent gap, trust boundaries, mechanics, numbered flows, composition, pitfalls, stability). Non-main specs stay as catalog entries. |
| `/patterns` | Deployment topology → protocol matrix (each row has a tiny actor toy), plus a “what is your shape?” explainer |
| `/patterns/[slug]` | One deployment pattern (unknown slugs 404) |
| `/compare` | OAuth 2.0 vs 2.1; OIDC vs OAuth; AAuth vs OAuth; user-delegated vs p2p — each pair opens with the matching board |
| `/flows` | Sequence-style protocol walkthroughs with the same animated player (play / pause / step / speed) |
| `/glossary` | Overloaded terms (p2p, act, person server, MCP host, sidecar, …) |
| `/search` | Client-side search over the bundled data |

Typed modules live in:

- `lib/types.ts` — shared types
- `lib/specs/*.ts` — catalog entries
- `lib/deep-dives/*.ts` — field-guide chapters attached by slug
- `lib/patterns.ts` — deployment topology → protocol matrix
- `lib/flows.ts` — sequence walkthroughs
- `lib/animations.ts` — data-driven animated sequences (main specs + every flow)
- `lib/compares.ts` — side-by-side views
- `lib/glossary.ts` — terms
- `lib/mental-model.ts` — principals and nesting
- `lib/search.ts` — client search index
- `lib/pattern-picker.ts` — deployment-shape decision tree

Interactive boards live in `components/explainers/`. Animated sequences live in `components/animations/` and play on main spec pages plus every `/flows/[slug]`. Main spec slugs with a dedicated sequence: `aauth`, `oauth-2-1`, `oidc-core`, `token-exchange`, `dpop`, `wimse-arch`, `mcp-auth`, `a2a`, `ciba`, `pkce`, `par`.

## Named topics (short)

**AAuth** is `draft-hardt-oauth-aauth-protocol-10` (6 August 2026), an **individual** Internet-Draft by Dick Hardt. It is not an RFC and not an OAuth WG document. It defines cryptographic agent identity and agent-to-resource authorization using HTTP Message Signatures. Draft-10 has four access modes; the editor's copy adds a fifth (person-identity). Pin a snapshot.

**P2P** is not a single I-D title in this cluster. Next to AAuth it usually means identity-based or two-party (resource-managed) access: agent and resource, no authorization server. Elsewhere it means A2A (agent-to-agent tasks) or `did:peer` / DIDComm. Those are not the same protocol.

**OIDC** remains the user identity layer on OAuth. **OAuth 2.1** (`draft-ietf-oauth-v2-1-16`, 3 September 2026) consolidates OAuth 2.0 with RFC 9700 practices; it was still a WG draft in September 2026. MCP authorization (2026-07-28) is an OAuth 2.1 profile that still cites older draft numbers.
