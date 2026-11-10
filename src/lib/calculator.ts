import type { Shape, Solid } from "./verity";

export interface CalculatorState {
  readonly leftShape: Shape | null;
  readonly middleShape: Shape | null;
  readonly leftSolid: Solid | null;
  readonly middleSolid: Solid | null;
}

export type CalculatorAction =
  | { type: "inside"; position: "leftShape" | "middleShape"; shape: Shape }
  | { type: "outside"; position: "leftSolid" | "middleSolid"; solid: Solid }
  | { type: "reset-inside" }
  | { type: "reset-outside" }
  | { type: "reset" };

export function createCalculatorState(): CalculatorState {
  return {
    leftShape: null,
    middleShape: null,
    leftSolid: null,
    middleSolid: null,
  };
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "inside": {
      const other =
        action.position === "leftShape" ? "middleShape" : "leftShape";
      return state[other] === action.shape ||
        state[action.position] === action.shape
        ? state
        : { ...state, [action.position]: action.shape };
    }
    case "outside":
      return state[action.position] === action.solid
        ? state
        : { ...state, [action.position]: action.solid };
    case "reset-inside":
      return { ...state, leftShape: null, middleShape: null };
    case "reset-outside":
      return { ...state, leftSolid: null, middleSolid: null };
    case "reset":
      return createCalculatorState();
  }
}
