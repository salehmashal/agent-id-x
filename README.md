# Agent Identity Landscape

A documentation-style Next.js app that maps the **2025–2026 IETF / OIDF / W3C / protocol** work on **AI agent identity, authentication, and authorization**.

It exists to answer a concrete question: when people say *AAuth*, *p2p*, *OIDC*, and *OAuth 2.1* in the same breath, **what documents do they actually mean**, how do those documents nest, and what is stable versus draft versus a vendor protocol?

This is an educational reference. It is **not** a standards document and **not** legal or security advice.

Hard topics are taught with **interactive boards** (HTML/CSS, a little client state): four principals as seats, AAuth access-mode restaging, OAuth 2.1 “what got banned,” token-exchange `act` versus WIMSE hop re-bind, and four doors for delegated / AAuth p2p / A2A / did:peer. Tokens are passes, signatures are wax seals, Bearer is a photocopy, DPoP is a pass glued to a key. There is no course overlay, XP, or quiz hub.

## How to run locally

```bash
npm install
npm run dev
```

The dev script binds **0.0.0.0:43173** (an uncommon port, not 3000).

Then open `http://localhost:43173`.

```bash
npm run build
```

By default `next build` (and `npm run export`, which is the same command) writes a static site to **`out/`**. Preview that export with any static file server, for example:

```bash
npx serve out --listen tcp://0.0.0.0:43173
```

`next start` is not used for a static export. Cloudflare’s OpenNext/Workers path is different: it runs `npx opennextjs-cloudflare build` (or `npm run cf:build`), which must **not** use `output: "export"`. `next.config.ts` detects that path and skips the export. Preview the Worker locally with `npm run preview`.

## Share / Deploy

This is a static educational reference: **no auth, no database, no secrets**. Host it on a free HTTPS CDN and share the **HTTPS** URL only (do not send an `http://` link).

Ranked options:

1. **Easiest — Vercel Hobby (free HTTPS)**  
   In [vercel.com](https://vercel.com): **Add New… → Project → Import** a Git repository you control → deploy. Hobby includes automatic HTTPS. The repo already has `output: "export"` and `vercel.json` security headers. Vercel detects Next.js; you do not need a custom output directory.

2. **Best lock-in-free — Cloudflare (free HTTPS)**  
   In [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create**. Pick **one** of these; they are not interchangeable.

   **A. If Cloudflare injected `npx opennextjs-cloudflare build` (Workers / OpenNext)** — this is what the Next.js framework preset often selects automatically. Leave that custom build command. **Do not set an output directory of `out`.** OpenNext is incompatible with `output: "export"`; this repo now skips export when that command (or `CLOUDFLARE` / `OPEN_NEXT` / `STATIC_EXPORT=0`) runs, and includes `@opennextjs/cloudflare`, `wrangler.jsonc`, and `open-next.config.ts`. After this commit, that dashboard build should succeed. Local check: `npx opennextjs-cloudflare build` or `npm run cf:build`.

   **B. Pure static Pages** — Framework preset **None** (not Next.js). Build command `npm run build`, output directory `out`. Do **not** use OpenNext with `output: "export"`. Cloudflare copies `public/_headers` into the deploy so security headers apply. You can also **Upload assets** and drag-and-drop the `out/` folder after `npm run build`.

   **Netlify** (free HTTPS) is the static idea: import the Git repo (this tree has `netlify.toml`) or drag-and-drop `out/`.

3. **GitHub Pages — only if you already use GitHub**  
   This project may not have a public GitHub repository yet. Create a repo on GitHub (pick your own name), push this tree, then either connect that repo to Cloudflare Pages / Vercel as above, or enable **Settings → Pages** and publish the `out/` folder (keep the committed `public/.nojekyll` file so the `_next` assets are not ignored). If the site is served from a subpath (`https://<user>.github.io/<repo>/`) rather than a custom domain, set `basePath` in `next.config.ts` to that repo path and rebuild. Do not share the GitHub Pages URL until it is HTTPS (GitHub Pages is HTTPS by default).

All of these give **HTTPS for free**. After you have a git remote you control, connect that remote in the Cloudflare or Vercel dashboard. For Cloudflare, use **A** or **B** above — not a mix of OpenNext and `out/`.

There is no analytics, cookie banner, or third-party script, so the Content-Security-Policy can stay locked to `'self'` plus the inline script/style Next and Tailwind require.

## Spec status changes

Internet-Drafts expire, get renamed, and move from individual to working-group to RFC Editor. OpenID Final specs get errata. MCP and A2A version independently of the IETF.

**Before you implement, read the source:**

- [IETF Datatracker](https://datatracker.ietf.org/)
- [RFC Editor](https://www.rfc-editor.org/)
- [OpenID Foundation specs](https://openid.net/developers/specs/)
- MCP: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- A2A: [a2a-protocol.org](https://a2a-protocol.org/)

The copy in this repo was researched **15 September 2026**. AAuth draft-10 versus the editor’s copy already disagreed on four vs five access modes; that kind of drift will continue.

## Content map

| Route | What it is |
| --- | --- |
| `/` | Landscape map, four-principal board, four-doors explainer |
| `/catalog` | Filterable catalog (status, layer, relevance, stability) |
| `/specs/[slug]` | One document: at-a-glance plus, for main specs, a compact interactive board and a field-guide chapter (agent gap, trust boundaries, mechanics, numbered flows, composition, pitfalls, stability). Non-main specs stay as catalog entries. |
| `/patterns` | Deployment topology → protocol matrix (each row has a tiny actor toy), plus a “what is your shape?” explainer |
| `/patterns/[slug]` | One deployment pattern (unknown slugs 404) |
| `/compare` | OAuth 2.0 vs 2.1; OIDC vs OAuth; AAuth vs OAuth; user-delegated vs p2p — each pair opens with the matching board |
| `/flows` | Sequence-style protocol walkthroughs |
| `/glossary` | Overloaded terms (p2p, act, person server, MCP host, sidecar, …) |
| `/search` | Client-side search over the bundled data |

Typed modules live in:

- `lib/types.ts` — shared types
- `lib/specs/*.ts` — catalog entries
- `lib/deep-dives/*.ts` — field-guide chapters attached by slug
- `lib/patterns.ts` — deployment topology → protocol matrix
- `lib/flows.ts` — sequence walkthroughs
- `lib/compares.ts` — side-by-side views
- `lib/glossary.ts` — terms
- `lib/mental-model.ts` — principals and nesting
- `lib/search.ts` — client search index
- `lib/pattern-picker.ts` — deployment-shape decision tree

Interactive boards live in `components/explainers/`. Main spec slugs with a board: `aauth`, `oauth-2-1`, `oidc-core`, `token-exchange`, `dpop`, `wimse-arch`, `mcp-auth`, `a2a`.

## Named topics (short)

**AAuth** is `draft-hardt-oauth-aauth-protocol-10` (6 August 2026), an **individual** Internet-Draft by Dick Hardt. It is not an RFC and not an OAuth WG document. It defines cryptographic agent identity and agent-to-resource authorization using HTTP Message Signatures. Draft-10 has four access modes; the editor's copy adds a fifth (person-identity). Pin a snapshot.

**P2P** is not a single I-D title in this cluster. Next to AAuth it usually means identity-based or two-party (resource-managed) access: agent and resource, no authorization server. Elsewhere it means A2A (agent-to-agent tasks) or `did:peer` / DIDComm. Those are not the same protocol.

**OIDC** remains the user identity layer on OAuth. **OAuth 2.1** (`draft-ietf-oauth-v2-1-16`, 3 September 2026) consolidates OAuth 2.0 with RFC 9700 practices; it was still a WG draft in September 2026. MCP authorization (2026-07-28) is an OAuth 2.1 profile that still cites older draft numbers.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
