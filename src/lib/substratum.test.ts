import { describe, expect, it } from "vitest";
import {
  canMark,
  CHECKPOINTS,
  createSubstratumProgress,
  markCheckpoint,
} from "./substratum";

describe("Substratum manual progress", () => {
  it("requires both route marks before closing and both conductors before banking", () => {
    const start = createSubstratumProgress();
    expect(markCheckpoint(start, "bank")).toBe(start);
    expect(markCheckpoint(start, "conductorA")).toBe(start);
    const first = markCheckpoint(start, "tormentor2");
    expect(markCheckpoint(first, "tormentor2")).toBe(first);
    expect(canMark(first, "conductorB")).toBe(false);
    const routes = markCheckpoint(first, "tormentor1");
    const oneClosed = markCheckpoint(routes, "conductorB");
    expect(canMark(oneClosed, "bank")).toBe(false);
    expect(canMark(markCheckpoint(oneClosed, "conductorA"), "bank")).toBe(true);
    expect(start.marks.tormentor2).toBe(false);
  });

  it("starts each cycle empty, completes exactly three, and preserves snapshots for undo", () => {
    let progress = createSubstratumProgress();
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const checkpoint of CHECKPOINTS) {
        progress = markCheckpoint(progress, checkpoint);
      }
      const beforeBank = progress;
      progress = markCheckpoint(progress, "bank");
      expect(progress.completedCycles).toBe(cycle + 1);
      expect(Object.values(progress.marks)).toEqual([
        false,
        false,
        false,
        false,
      ]);
      expect(Object.values(beforeBank.marks)).toEqual([true, true, true, true]);
    }
    for (const checkpoint of [...CHECKPOINTS, "bank"] as const) {
      expect(canMark(progress, checkpoint)).toBe(false);
      expect(markCheckpoint(progress, checkpoint)).toBe(progress);
    }
  });
});
