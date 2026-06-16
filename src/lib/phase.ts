// Couple setup-phase state machine.
//
// The couple's `phase` advances linearly through onboarding and then sits at
// PLAYING for the life of the relationship. Phase lives on the Couple (joint
// steps are collaborative); per-partner sub-steps are tracked elsewhere via
// user flags / row presence.

export const PHASES = [
  "INVITE",
  "QUESTIONNAIRE",
  "CURRENT_STATE",
  "VALUATION",
  "FINALIZE",
  "STANDARDS",
  "UNICORN",
  "PLAYING",
] as const;

export type Phase = (typeof PHASES)[number];

/** Route each phase renders at, used to send a couple to its current step. */
const PHASE_ROUTES: Record<Phase, string> = {
  INVITE: "/onboarding/invite",
  QUESTIONNAIRE: "/onboarding/questionnaire",
  CURRENT_STATE: "/onboarding/current-state",
  VALUATION: "/onboarding/valuation",
  FINALIZE: "/onboarding/finalize",
  STANDARDS: "/onboarding/standards",
  UNICORN: "/onboarding/unicorn",
  PLAYING: "/dashboard",
};

export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && (PHASES as readonly string[]).includes(value);
}

export function phaseIndex(phase: Phase): number {
  return PHASES.indexOf(phase);
}

/** The next phase in the machine; PLAYING is terminal and returns itself. */
export function nextPhase(phase: Phase): Phase {
  const i = phaseIndex(phase);
  return PHASES[Math.min(i + 1, PHASES.length - 1)];
}

/** True when `current` is at or beyond `required` in the linear order. */
export function phaseAtLeast(current: Phase, required: Phase): boolean {
  return phaseIndex(current) >= phaseIndex(required);
}

export function phaseToRoute(phase: Phase): string {
  return PHASE_ROUTES[phase];
}
