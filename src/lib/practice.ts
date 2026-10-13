import {
  applySwap,
  isSolved,
  type Excise,
  type Puzzle,
  type Swap,
} from "./verity";

export const ROUND_SECONDS = 210;

export const PREVIEW_PUZZLE: Puzzle = {
  inside: ["circle", "triangle", "square"],
  outside: [
    ["circle", "circle"],
    ["triangle", "triangle"],
    ["square", "square"],
  ],
};

export interface PracticeState {
  readonly puzzle: Puzzle;
  readonly phase: "ready" | "running" | "won" | "expired";
  readonly remaining: number;
  readonly deadline: number | null;
  readonly pending: Excise | null;
  readonly swaps: readonly Swap[];
}

export type PracticeAction =
  | { type: "start"; puzzle: Puzzle; now: number }
  | { type: "tick"; now: number }
  | { type: "excise"; selection: Excise; now: number }
  | { type: "cancel" };

export function createPracticeState(): PracticeState {
  return {
    puzzle: PREVIEW_PUZZLE,
    phase: "ready",
    remaining: ROUND_SECONDS,
    deadline: null,
    pending: null,
    swaps: [],
  };
}

function updateClock(state: PracticeState, now: number): PracticeState {
  if (state.phase !== "running" || state.deadline === null) {
    return state;
  }
  const remaining = Math.max(0, Math.ceil((state.deadline - now) / 1000));
  if (remaining === 0) {
    return { ...state, remaining, phase: "expired", pending: null };
  }
  return remaining === state.remaining ? state : { ...state, remaining };
}

export function canExcise(state: PracticeState, selection: Excise): boolean {
  return (
    state.phase === "running" &&
    state.puzzle.outside[selection.statue].includes(selection.shape) &&
    (state.pending === null ||
      (state.pending.statue !== selection.statue &&
        state.pending.shape !== selection.shape))
  );
}

function excise(state: PracticeState, selection: Excise): PracticeState {
  if (!canExcise(state, selection)) {
    return state;
  }
  if (state.pending === null) {
    return { ...state, pending: selection };
  }
  const swap: Swap = [state.pending, selection];
  const puzzle = {
    ...state.puzzle,
    outside: applySwap(state.puzzle.outside, swap),
  };
  return {
    ...state,
    puzzle,
    pending: null,
    swaps: [...state.swaps, swap],
    phase: isSolved(puzzle) ? "won" : "running",
  };
}

export function practiceReducer(
  state: PracticeState,
  action: PracticeAction,
): PracticeState {
  switch (action.type) {
    case "start":
      return {
        puzzle: action.puzzle,
        phase: "running",
        remaining: ROUND_SECONDS,
        deadline: action.now + ROUND_SECONDS * 1000,
        pending: null,
        swaps: [],
      };
    case "tick":
      return updateClock(state, action.now);
    case "excise":
      return excise(updateClock(state, action.now), action.selection);
    case "cancel":
      return { ...state, pending: null };
  }
}

export function formatTime(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.ceil(seconds));
  return (
    String(Math.floor(wholeSeconds / 60)) +
    ":" +
    String(wholeSeconds % 60).padStart(2, "0")
  );
}
