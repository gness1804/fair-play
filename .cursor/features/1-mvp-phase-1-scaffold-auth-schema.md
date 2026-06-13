---
github_issue: 1
---
# Mvp Phase 1 Scaffold Auth Schema

## Working directory

`~/Desktop/fair-play`

## Contents

Phase 1 of the Fair Play MVP per the approved plan (~/.claude/plans/eager-inventing-river.md).

Scope:
- create-next-app scaffold (TypeScript, App Router, src dir, @/* alias, no Tailwind, npm) into this repo, preserving .cursor/
- Port design tokens from ~/.claude/skills/graham-nessler-design/colors_and_type.css into src/app/theme.css + globals.css (light + dark themes)
- Root layout: header with logo placeholder + sun/moon theme toggle (persists)
- Full Prisma schema (Auth.js User/Account/Session/VerificationToken + Couple, Invitation, Card, CoupleCard, CurrentHolding, CardRating, Round, CompletionLog) + initial migration on SQLite
- Auth.js v5: Google provider only, JWT session strategy, edge-safe auth.config.ts, middleware coarse auth gating, PrismaAdapter
- src/env.ts zod env validation (never logs values); .env.example placeholders; .gitignore incl. .env*.local, dev.db, .cursor/security/, .cursor/tmp/
- Tests: env validation, db singleton, middleware redirect, auth session shape

Done means: dev server boots; Google sign-in creates a User; protected routes redirect unauthenticated users; migrate succeeds; theme toggle flips and persists. No commits. Never push. No secrets in any output.

## Acceptance criteria
