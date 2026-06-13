---
github_issue: 2
---
# Phase 1 Complete Handoff And Next Steps

## Working directory

`~/Desktop/fair-play`

## Contents

## Summary

Fair Play MVP — Phase 1 (scaffold + auth + schema) is **complete, verified, and committed** on branch `feature/mvp` (commit `ffec15e`, not pushed). Approved plan: `~/.claude/plans/eager-inventing-river.md`. Product spec: `.cursor/proj-init.md`. Phase 1 feature doc: `.cursor/features/1-mvp-phase-1-scaffold-auth-schema.md` (GitHub issue #1).

## What's done (Phase 1)

- **Scaffold:** Next.js 15 App Router, TypeScript strict, `src/` dir, `@/*` alias, no Tailwind, npm.
- **Schema:** `prisma/schema.prisma` — 14 models (Auth.js User/Account/Session/VerificationToken + Couple, Invitation, Card, CoupleCard, CurrentHolding, CardRating, Round, CompletionLog). Migration `20260613012359_init` applied to SQLite (`dev.db`, gitignored).
- **Auth:** Auth.js v5, Google provider only, JWT session strategy, edge-safe `src/auth.config.ts`, `src/middleware.ts` coarse auth gating, PrismaAdapter in `src/auth.ts`.
- **Design:** `src/app/theme.css` + `globals.css` port the `graham-nessler-design` tokens; dark default + light theme via `data-theme`; `ThemeToggle` (sun/moon) persists via localStorage with no-flash inline script. Inter / Lora / JetBrains Mono via `next/font`.
- **Env:** `src/env.ts` zod validation; error messages name variable names only, never values.
- **Pages:** landing (`/`) with Google sign-in; `/dashboard` stub showing session user + sign-out.
- **Tests:** 12 passing across 4 files (env validation, db singleton, theme toggle, auth-config).

**Verification (re-run independently, all green):** `lint` clean · `typecheck` clean · `test` 12/12 · `build` succeeds · `dev` serves the landing page.

## Open items / gotchas

- **`.env.local` needs real values before live sign-in works.** Graham fills it in: `npx auth secret` for `AUTH_SECRET`, then Google OAuth client ID/secret (redirect URI `http://localhost:3000/api/auth/callback/google`, both Google test accounts added). The orchestrator's tooling is blocked from reading `.env*` by permission settings — by design.
- **`.env.example` is currently gitignored** by the create-next-app blanket `.env*` rule and was therefore NOT committed. The orchestrator cannot read `.env*` to confirm it's placeholder-only, so it left the ignore in place rather than risk committing secrets. Graham can verify the file himself and, if it's placeholder-only, un-ignore it (add `!.env.example` under the `.env*` line) so the template is tracked. Low priority for a 2-person never-push repo.
- **No pre-commit hook yet.** The plan slated it for Phase 1 but it was not set up. Recommend running `/pre-commit` before further commits (blocks master commits + `TEMP:` comments, lints changed files, syncs CFS).
- **No Phase 1 code review or security review run yet.** Plan calls for a Sonnet code review after each phase and an Opus security review after Phases 2 and 6. A Phase 1 code review is a reasonable optional add before Phase 2.

## Next steps

1. (Optional) Run `/pre-commit` to install the hook; optionally a Sonnet code review of Phase 1.
2. **Phase 2 — UI kit + couple/invite flow:** `src/components/ui/*` (Button silver/blue/red, Card, Input, Textarea, Badge, Gauge, Modal, Toast), couple creation, invite token lifecycle (email-match required), `/onboarding/invite` (sender) + `/join/[token]` (invitee), phase-machine scaffolding in `src/lib/phase.ts` + `assertCoupleMember()` in `src/lib/couple.ts`.
3. **HARD STOP after Phase 2** (incl. its code review + Opus security review): summarize and wait for Graham's explicit go-ahead before Phase 3. Also stop at any daily token threshold (50/75/80/90/95%).
4. Phases 3–6 follow the plan: seed deck + questionnaire + current-state; valuation + finalize; MSC/CPE + unicorn + enter play; play + equity + re-deal + settings.

## Model cost/capability trade-off: Opus 4.8 vs Fable 5

Mid-session, **Fable 5 was disabled** and orchestration switched to **Opus 4.8 (1M context)**. Context for the decision:

- **Capability:** Fable 5 is Anthropic's top "Mythos-class" tier, positioned *above* Opus. Opus 4.8 is still a highly capable orchestrator — coordinating sub-agents, reading their reports, writing CFS docs, and making small edits are well within its range. No part of this plan requires Fable specifically.
- **Cost direction (important nuance):** the question framed Opus as "more expensive," but top-tier models normally cost *at or above* the tier below them. So Fable 5 is likely the *pricier* per-token option, meaning the forced fall-back to Opus is plausibly **cost-neutral to cheaper** for orchestration — not an increase. Exact Fable 5 per-token pricing is not confirmed here; verify current rates in the billing console before relying on a precise figure.
- **Why the impact is small either way:** orchestration is a *minority* of total spend. The bulk of the ~3.1–4.8M-token / ~200–315k-output budget is **Sonnet implementation sub-agents** plus **Opus review sub-agents** — and those assignments are unchanged regardless of which model orchestrates. The orchestrator's own tokens are roughly a quarter of throughput. Even under a pessimistic assumption (Opus orchestration ~1.5× Fable's rate applied to ~25% of spend), the total bill moves on the order of ~10%; under the more likely assumption (Fable ≥ Opus), the swap is flat or a small saving.
- **Bottom line:** continuing on Opus 4.8 is the recommended path — no capability gap that matters for this work, and no material cost penalty. If precise budgeting is needed, confirm live Opus 4.8 vs Fable 5 rates in the console and re-estimate against the per-phase token breakdown in the plan.

## How to resume

```
cd /Users/grahamnessler/Desktop/fair-play
git checkout feature/mvp        # already here; commit ffec15e
npm install                     # if deps not present
npm test && npm run build       # confirm green baseline
```
Then proceed with Phase 2 per `~/.claude/plans/eager-inventing-river.md`.

## Acceptance criteria
