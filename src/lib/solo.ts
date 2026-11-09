import { inferInside, type Shape, type SoloPhase, type Statue } from "./verity";

export interface SoloState {
  readonly left: Shape | null;
  readonly middle: Shape | null;
  readonly self: Statue | null;
  readonly first: Shape | null;
  readonly second: Shape | null;
  readonly phase: SoloPhase;
}

export type SoloAction =
  | { type: "inside"; position: "left" | "middle"; shape: Shape }
  | { type: "self"; statue: Statue }
  | { type: "room-shape"; position: "first" | "second"; shape: Shape }
  | { type: "phase"; phase: SoloPhase }
  | { type: "reset-inside" }
  | { type: "reset-room" }
  | { type: "reset" };

export function createSoloState(): SoloState {
  return {
    left: null,
    middle: null,
    self: null,
    first: null,
    second: null,
    phase: "opening",
  };
}

export function soloReducer(state: SoloState, action: SoloAction): SoloState {
  switch (action.type) {
    case "inside": {
      const other = action.position === "left" ? "middle" : "left";
      return state[other] === action.shape ||
        state[action.position] === action.shape
        ? state
        : { ...state, [action.position]: action.shape };
    }
    case "self":
      return inferInside(state.left, state.middle) === null ||
        state.self === action.statue
        ? state
        : { ...state, self: action.statue };
    case "room-shape":
      return state[action.position] === action.shape
        ? state
        : { ...state, [action.position]: action.shape };
    case "phase":
      return state.phase === action.phase
        ? state
        : { ...state, phase: action.phase, first: null, second: null };
    case "reset-inside":
      return { ...state, left: null, middle: null, self: null };
    case "reset-room":
      return { ...state, first: null, second: null };
    case "reset":
      return createSoloState();
  }
}
