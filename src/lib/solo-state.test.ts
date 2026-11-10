import { describe, expect, it } from "vitest";
import { createSoloState, soloReducer, type SoloState } from "./solo";

const OBSERVATION: SoloState = {
  left: "circle",
  middle: "triangle",
  self: 2,
  first: "square",
  second: "square",
  phase: "opening",
};

describe("solo observation transitions", () => {
  it("clears only room shapes on a real stage change and preserves them on repeated events", () => {
    expect(soloReducer(OBSERVATION, { type: "phase", phase: "opening" })).toBe(
      OBSERVATION,
    );
    const after = soloReducer(OBSERVATION, { type: "phase", phase: "after" });
    expect(after).toEqual({
      ...OBSERVATION,
      phase: "after",
      first: null,
      second: null,
    });
    const observed = soloReducer(after, {
      type: "room-shape",
      position: "first",
      shape: "circle",
    });
    expect(soloReducer(observed, { type: "phase", phase: "after" })).toBe(
      observed,
    );
    expect(soloReducer(observed, { type: "phase", phase: "opening" })).toEqual({
      ...after,
      phase: "opening",
    });
  });

  it("preserves unrelated observations on scoped resets and returns to opening on full reset", () => {
    const state = { ...OBSERVATION, phase: "after" } as const;
    expect(soloReducer(state, { type: "reset-inside" })).toEqual({
      ...state,
      left: null,
      middle: null,
      self: null,
    });
    expect(soloReducer(state, { type: "reset-room" })).toEqual({
      ...state,
      first: null,
      second: null,
    });
    expect(soloReducer(state, { type: "reset" })).toEqual(createSoloState());
  });

  it("guards identity until symbols are known and rejects duplicate symbols at the transition boundary", () => {
    const initial = createSoloState();
    expect(soloReducer(initial, { type: "self", statue: 2 })).toBe(initial);
    expect(
      soloReducer(OBSERVATION, {
        type: "inside",
        position: "left",
        shape: "triangle",
      }),
    ).toBe(OBSERVATION);
    expect(
      soloReducer(OBSERVATION, {
        type: "inside",
        position: "left",
        shape: "square",
      }),
    ).toEqual({ ...OBSERVATION, left: "square" });
  });
});
