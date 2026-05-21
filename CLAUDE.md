# kwg-website — Claude Instructions

B2B wholesale website for Kelston Way Greenhouse. Live at kelstonway.com.

## ⚠️ MANDATORY: Codex Review Before Every Deploy

**No code ships without Codex adversarial review. No exceptions.**

```bash
node "/home/samuel/.claude/plugins/cache/openai-codex/codex/1.0.4/scripts/codex-companion.mjs" adversarial-review "[describe what changed]" 2>&1
```

**Deploy command breaks `.git`** — if Codex fails "not a git repo", restore: `mv .git_backup .git`

Deploy:
```bash
mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

## Stack
- React 19 + Vite + TypeScript + Tailwind v3
- Supabase: `wuemcpptmjmvtzaciezq` (kelston-way project)
- Vercel serverless functions in `/api/` (`@vercel/node`)
- Resend for transactional email (domain: kelstonway.com)
- Sentry for error monitoring (`VITE_SENTRY_DSN`)

## Env Vars
| Var | Where used |
|-----|-----------|
| `VITE_SUPABASE_URL` | Frontend |
| `VITE_SUPABASE_ANON_KEY` | Frontend |
| `VITE_SENTRY_DSN` | Frontend (Sentry init) |
| `SUPABASE_URL` | API functions |
| `SUPABASE_SERVICE_KEY` | API functions (elevated access) |
| `RESEND_API_KEY` | API functions |
| `SAMUEL_EMAIL` | API functions (order notify) |

`VITE_*` = exposed to browser. Non-prefixed = server only.

## Key Supabase Tables
- `plants` — plant catalog (name, sku, size, org_id)
- `availability_releases` — published availability snapshots
- `availability_release_items` — line items; must JOIN plants for name/sku/size
- `wholesale_orders` — customer orders (status: pending → confirmed)
- `wholesale_order_items` — order line items

RLS: public anon SELECT on all four. Authenticated only for writes.

## API Routes (Vercel Functions)
- `POST /api/submit-order` — creates order, sends Resend emails to customer + Samuel
- `POST /api/confirm-order` — Samuel confirms via token link
- `POST /api/send-contact` — contact form
- `POST /api/send-inquiry` — home page inquiry form

Emails send from `orders@kelstonway.com` — domain must be verified in Resend.

## Deploy
Free tier workaround (no GitHub auto-deploy yet):
```bash
mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```
Once GitHub is connected to Vercel, just `git push`.

## Brand
- Fonts: Newsreader (headings) + Manrope (body/UI). No substitutions.
- Primary: `#4c614c` | Secondary: `#6e5b42` | Background: `#f9f9f9`
- Buttons: 2px radius (nearly square — intentional)
- Logo: always `Kelston Way - Transparent.png`
- Never rebuild from scratch — fork Stitch templates from OneDrive

## Known Quirks
- `availability_release_items` has no plant_name/sku — always `.select('*, plants(name, sku, size)')`
- Cart stored in localStorage under key `kwg_cart`
- Order confirm uses a UUID token in `wholesale_orders.confirm_token`
- CSP in vercel.json — if adding a new external service, add its domain to connect-src
- Founder order always: Art → Titus → Samuel

## Infrastructure (Established 2026-05-20)

**Supabase TypeScript types:** `src/lib/database.types.ts` — auto-generated, never hand-edit.
Regenerate: `supabase gen types typescript --project-id wuemcpptmjmvtzaciezq > src/lib/database.types.ts`
Client is wired: `createClient<Database>(url, key)` in `src/lib/supabase.ts`.

**Prettier:** `.prettierrc` at root — singleQuote, no semi, printWidth 100, prettier-plugin-tailwindcss.

**ESLint:** Enforces `no-explicit-any: warn` and `consistent-type-imports: error`.

## Coding Standards (Codex-reviewed)

**Component structure:** Named exports, one component per file, PascalCase filenames, static arrays above component.

**TypeScript:** No implicit `any`. `|| undefined` not `|| null` for optional RPC params. No `as T` casts to paper over nullables.

**Codex review after every task:** `/codex:adversarial-review`

## Coding Decisions

- Search bar removed from Availability page (2026-05-20) — it did nothing useful
