---
github_issue: 3
---
# Mvp Phase 2 Ui Kit And Coupleinvite Flow

## Working directory

`~/Desktop/fair-play`

## Contents

# MVP Phase 2 — UI Kit + Couple/Invite Flow

**Status:** complete on `feature/mvp`. Verified green: `lint`, `typecheck`, 54 tests, `build`. Not committed; not pushed.

## Scope delivered

- **UI kit** (CSS Modules + design tokens), `src/components/ui/*` with barrel `index.ts`: Button (silver/blue/red + ghost, sizes, loading), Card/CardHeader/CardBody, Input, Textarea, Badge, Gauge (equity share, `role=meter`), Modal (client; Esc + initial focus), Toast (client `ToastProvider` + `useToast`). `ToastProvider` mounted in `layout.tsx`.
- **Pure logic libs:** `src/lib/phase.ts` (phase machine INVITE→…→PLAYING; `nextPhase`/`phaseToRoute`/`phaseAtLeast`/`isPhase`), `src/lib/invitations.ts` (`normalizeEmail`, `generateInviteToken` 256-bit, `inviteExpiry` 7d, pure `evaluateInviteAcceptance`, `inviteRejectionMessage`), `src/lib/couple.ts` (`getCurrentUser`/`getCurrentUserWithCouple`/`assertCoupleMember`; resolves user by session email).
- **Server actions** `src/app/actions/couple.ts`: `createInvite` (creates couple on first invite, caps at 2, revokes prior pending, issues token; zod email, self-invite blocked) and `acceptInvite` (re-validates server-side, atomic single-use consume + in-transaction cap recheck, advances phase INVITE→QUESTIONNAIRE at 2 members).
- **Routes:** `/onboarding/invite` (+ `InviteForm` client, copy join link), `/join/[token]` (authoritative server-side evaluation → Accept or reason), `dashboard` routes by couple/phase, home honors sanitized `callbackUrl` for return-to-link after Google sign-in.

## Acceptance criteria — met

- A invites B by email; B's matching Google account joins via `/join/[token]`; phase advances to QUESTIONNAIRE at 2 members.
- Wrong email rejected (EMAIL_MISMATCH); expired / used / full / already-in-couple all handled with explicit messages.

## Reviews

Sonnet code review + Opus security review run. Fixed this phase:
- **Critical:** Google `email_verified` now enforced via `signIn` callback (`auth.config.ts`) — the invitation email-match control no longer rests on an unverified claim.
- **High:** TOCTOU race in `acceptInvite` — atomic conditional `updateMany` (single-use) + in-transaction member recount; lost race rolls back and the page re-evaluates.
- M2: `?error=` query param no longer overrides live evaluation (removed). Duplicate branch cleanup in `evaluateInviteAcceptance`. Modal initial focus. Toast timer cleanup.

## Deferred follow-ups (not blockers)

- DB-level couple-size constraint (defense in depth; app + atomic tx enforced now).
- Rate-limit `createInvite` before email delivery lands (later phase).
- Join-link origin from request `Host` header (sender-only text render) — consider a trusted base URL.
- Full Modal focus-trap (Tab cycling); initial focus done.
- Error-reason disclosure to holders of a (256-bit) token — low practical impact.
- Pre-existing: Next 16 `middleware`→`proxy` deprecation; workspace-root lockfile warning.

## Test coverage

54 tests: phase machine, invitation logic (all `evaluate` branches + token format), UI components (Button/Badge/Card/Input/Gauge/Modal/Toast), `signIn` email-verification callback.

## Acceptance criteria
