import { describe, expect, it } from "vitest";
import {
  canExcise,
  createPracticeState,
  formatTime,
  practiceReducer,
  PREVIEW_PUZZLE,
  ROUND_SECONDS,
  type PracticeState,
} from "./practice";
import { solve, type Excise } from "./verity";

const FIRST: Excise = { statue: 0, shape: "circle" };
const SECOND: Excise = { statue: 1, shape: "triangle" };

function start(): PracticeState {
  return practiceReducer(createPracticeState(), {
    type: "start",
    puzzle: PREVIEW_PUZZLE,
    now: 1000,
  });
}

describe("practice round", () => {
  it("keeps untimed rounds playable past the timed deadline and still detects completion", () => {
    let state = practiceReducer(createPracticeState(), {
      type: "start",
      puzzle: PREVIEW_PUZZLE,
      now: 1000,
      mode: "untimed",
    });
    expect(state).toMatchObject({
      mode: "untimed",
      phase: "running",
      deadline: null,
    });
    expect(practiceReducer(state, { type: "tick", now: 999999 })).toBe(state);
    const swaps = solve(PREVIEW_PUZZLE);
    if (swaps === null) {
      throw new Error("Preview puzzle must be solvable.");
    }
    for (const swap of swaps) {
      for (const selection of swap) {
        state = practiceReducer(state, {
          type: "excise",
          selection,
          now: 999999,
        });
      }
    }
    expect(state.phase).toBe("won");
    expect(canExcise(state, FIRST)).toBe(false);
    const timed = practiceReducer(state, {
      type: "start",
      puzzle: PREVIEW_PUZZLE,
      now: 1000000,
      mode: "timed",
    });
    expect(timed).toMatchObject({
      mode: "timed",
      deadline: 1210000,
      remaining: 210,
      pending: null,
      swaps: [],
    });
    expect(practiceReducer(timed, { type: "tick", now: 1210000 }).phase).toBe(
      "expired",
    );
  });
  it("starts a complete 210-second round only when requested", () => {
    const ready = createPracticeState();
    expect(ready.phase).toBe("ready");
    expect(canExcise(ready, FIRST)).toBe(false);
    expect(start()).toMatchObject({
      phase: "running",
      remaining: 210,
      deadline: 211000,
      swaps: [],
      pending: null,
    });
  });

  it("waits for two legal excisions, then applies exactly one swap", () => {
    const started = start();
    const selected = practiceReducer(started, {
      type: "excise",
      selection: FIRST,
      now: 1000,
    });
    expect(selected.pending).toEqual(FIRST);
    expect(selected.puzzle).toBe(started.puzzle);
    expect(canExcise(selected, FIRST)).toBe(false);
    expect(canExcise(selected, { statue: 1, shape: "circle" })).toBe(false);
    const exchanged = practiceReducer(selected, {
      type: "excise",
      selection: SECOND,
      now: 1000,
    });
    expect(exchanged.pending).toBeNull();
    expect(exchanged.swaps).toHaveLength(1);
    expect(exchanged.puzzle.outside[0]).toEqual(["triangle", "circle"]);
    expect(started.puzzle).toEqual(PREVIEW_PUZZLE);
  });

  it("cancels a pending excision without altering the room or swap count", () => {
    const selected = practiceReducer(start(), {
      type: "excise",
      selection: FIRST,
      now: 1000,
    });
    const cancelled = practiceReducer(selected, { type: "cancel" });
    expect(cancelled.pending).toBeNull();
    expect(cancelled.swaps).toHaveLength(0);
    expect(cancelled.puzzle).toEqual(PREVIEW_PUZZLE);
  });

  it("uses elapsed wall time, expires at the deadline, and blocks late input", () => {
    const selected = practiceReducer(start(), {
      type: "excise",
      selection: FIRST,
      now: 1000,
    });
    expect(
      practiceReducer(selected, { type: "tick", now: 209001 }).remaining,
    ).toBe(2);
    const expired = practiceReducer(selected, {
      type: "excise",
      selection: SECOND,
      now: 211000,
    });
    expect(expired).toMatchObject({
      phase: "expired",
      remaining: 0,
      pending: null,
      swaps: [],
    });
    expect(practiceReducer(expired, { type: "tick", now: 999999 })).toBe(
      expired,
    );
  });

  it("wins after the final exchange and freezes the timer and board", () => {
    let state = start();
    const swaps = solve(PREVIEW_PUZZLE);
    if (swaps === null) {
      throw new Error("Preview puzzle must be solvable.");
    }
    for (const swap of swaps) {
      for (const selection of swap) {
        state = practiceReducer(state, {
          type: "excise",
          selection,
          now: 5000,
        });
      }
    }
    expect(state.phase).toBe("won");
    expect(state.remaining).toBe(206);
    expect(practiceReducer(state, { type: "tick", now: 999999 })).toBe(state);
    expect(
      practiceReducer(state, { type: "excise", selection: FIRST, now: 999999 }),
    ).toBe(state);
  });

  it("resets an expired round, clearing the previous selections and deadline", () => {
    const expired = practiceReducer(start(), { type: "tick", now: 300000 });
    const restarted = practiceReducer(expired, {
      type: "start",
      puzzle: PREVIEW_PUZZLE,
      now: 500000,
    });
    expect(restarted).toMatchObject({
      phase: "running",
      deadline: 710000,
      remaining: ROUND_SECONDS,
      swaps: [],
      pending: null,
    });
  });

  it("formats the countdown without negative seconds", () => {
    expect(formatTime(210)).toBe("3:30");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(-5)).toBe("0:00");
  });
});
