import { describe, it, expect } from "vitest";
import {
  PHASES,
  isPhase,
  phaseIndex,
  nextPhase,
  phaseAtLeast,
  phaseToRoute,
} from "@/lib/phase";

describe("phase machine", () => {
  it("advances through the full sequence in order", () => {
    expect(nextPhase("INVITE")).toBe("QUESTIONNAIRE");
    expect(nextPhase("QUESTIONNAIRE")).toBe("CURRENT_STATE");
    expect(nextPhase("CURRENT_STATE")).toBe("VALUATION");
    expect(nextPhase("VALUATION")).toBe("FINALIZE");
    expect(nextPhase("FINALIZE")).toBe("STANDARDS");
    expect(nextPhase("STANDARDS")).toBe("UNICORN");
    expect(nextPhase("UNICORN")).toBe("PLAYING");
  });

  it("treats PLAYING as terminal", () => {
    expect(nextPhase("PLAYING")).toBe("PLAYING");
  });

  it("isPhase validates membership", () => {
    expect(isPhase("INVITE")).toBe(true);
    expect(isPhase("PLAYING")).toBe(true);
    expect(isPhase("NONSENSE")).toBe(false);
    expect(isPhase(42)).toBe(false);
    expect(isPhase(null)).toBe(false);
  });

  it("phaseIndex is monotonic across PHASES", () => {
    for (let i = 1; i < PHASES.length; i++) {
      expect(phaseIndex(PHASES[i])).toBeGreaterThan(phaseIndex(PHASES[i - 1]));
    }
  });

  it("phaseAtLeast compares ordering", () => {
    expect(phaseAtLeast("VALUATION", "QUESTIONNAIRE")).toBe(true);
    expect(phaseAtLeast("QUESTIONNAIRE", "QUESTIONNAIRE")).toBe(true);
    expect(phaseAtLeast("INVITE", "PLAYING")).toBe(false);
  });

  it("maps every phase to a route", () => {
    for (const phase of PHASES) {
      expect(phaseToRoute(phase)).toMatch(/^\//);
    }
    expect(phaseToRoute("INVITE")).toBe("/onboarding/invite");
    expect(phaseToRoute("PLAYING")).toBe("/dashboard");
  });
});
