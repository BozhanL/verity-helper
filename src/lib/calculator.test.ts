import { describe, expect, it } from "vitest";
import { calculatorReducer, createCalculatorState } from "./calculator";
import { SHAPES } from "./verity";

describe("calculator transitions", () => {
  it("rejects conflicting queued inside selections while allowing identical outside solids", () => {
    for (const shape of SHAPES) {
      const first = calculatorReducer(createCalculatorState(), {
        type: "inside",
        position: "leftShape",
        shape,
      });
      expect(
        calculatorReducer(first, {
          type: "inside",
          position: "middleShape",
          shape,
        }),
      ).toBe(first);
      expect(
        calculatorReducer(first, {
          type: "inside",
          position: "leftShape",
          shape,
        }),
      ).toBe(first);
    }
    const left = calculatorReducer(createCalculatorState(), {
      type: "outside",
      position: "leftSolid",
      solid: "cone",
    });
    expect(
      calculatorReducer(left, {
        type: "outside",
        position: "middleSolid",
        solid: "cone",
      }),
    ).toMatchObject({ leftSolid: "cone", middleSolid: "cone" });
  });

  it("resets only the requested input group", () => {
    const state = {
      leftShape: "circle",
      middleShape: "triangle",
      leftSolid: "sphere",
      middleSolid: "pyramid",
    } as const;
    expect(calculatorReducer(state, { type: "reset-inside" })).toEqual({
      ...state,
      leftShape: null,
      middleShape: null,
    });
    expect(calculatorReducer(state, { type: "reset-outside" })).toEqual({
      ...state,
      leftSolid: null,
      middleSolid: null,
    });
    expect(calculatorReducer(state, { type: "reset" })).toEqual(
      createCalculatorState(),
    );
  });
});
