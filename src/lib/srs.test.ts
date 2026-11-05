import { describe, it, expect } from "vitest";
import { newCard, review, isDue } from "../lib/srs";

describe("SM-2", () => {
  it("creates new card due now", () => {
    const c = newCard(1);
    expect(c.reps).toBe(0);
    expect(c.ease).toBe(2.5);
    expect(isDue(c)).toBe(true);
  });
  it("wrong answer resets reps and short interval", () => {
    const c = newCard(1);
    const r = review(c, 1);
    expect(r.reps).toBe(0);
    expect(r.interval).toBe(1);
    expect(r.lapses).toBe(1);
  });
  it("correct answers increase interval", () => {
    const c = newCard(1);
    const r1 = review(c, 4);
    const r2 = review(r1, 4);
    const r3 = review(r2, 4);
    expect(r3.interval).toBeGreaterThan(r2.interval);
    expect(r3.reps).toBe(3);
  });
  it("ease floor 1.3", () => {
    let c = newCard(1);
    for (let i = 0; i < 5; i++) c = review(c, 0);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
});
