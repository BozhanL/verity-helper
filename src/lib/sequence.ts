export interface Progress {
  readonly completed: number;
  readonly selections: readonly [boolean, boolean];
}

export interface SequenceState {
  readonly total: number;
  readonly history: readonly [Progress, ...Progress[]];
}

export type SequenceAction =
  { type: "mark"; swap: number; selection: 0 | 1 | "both" } | { type: "undo" };

export function createSequenceState(total: number): SequenceState {
  return { total, history: [{ completed: 0, selections: [false, false] }] };
}

export function currentProgress(state: SequenceState): Progress {
  return state.history.at(-1) ?? state.history[0];
}

export function sequenceReducer(
  state: SequenceState,
  action: SequenceAction,
): SequenceState {
  if (action.type === "undo") {
    const [first, ...rest] = state.history;
    return rest.length === 0
      ? state
      : { ...state, history: [first, ...rest.slice(0, -1)] };
  }
  const latest = currentProgress(state);
  if (
    action.swap !== latest.completed ||
    latest.completed >= state.total ||
    (action.selection !== "both" && latest.selections[action.selection])
  ) {
    return state;
  }
  const selections: Progress["selections"] = [
    action.selection === "both" ||
      action.selection === 0 ||
      latest.selections[0],
    action.selection === "both" ||
      action.selection === 1 ||
      latest.selections[1],
  ];
  const next: Progress = selections.every(Boolean)
    ? { completed: latest.completed + 1, selections: [false, false] }
    : { completed: latest.completed, selections };
  return { ...state, history: [...state.history, next] };
}
