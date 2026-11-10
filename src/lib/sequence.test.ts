import { describe, expect, it } from "vitest";
import {
  createSequenceState,
  currentProgress,
  sequenceReducer,
  type SequenceAction,
} from "./sequence";

describe("manual dissection progress", () => {
  it.each([[0, 1], [1, 0], [0, "both"], [1, "both"], ["both"]] as const)(
    "advances once and undoes every action for marking order %j",
    (...selections) => {
      const initial = createSequenceState(3);
      let state = initial;
      const snapshots = [state];
      for (let swap = 0; swap < 3; swap++) {
        for (const selection of selections) {
          state = sequenceReducer(state, { type: "mark", swap, selection });
          snapshots.push(state);
        }
        expect(currentProgress(state)).toEqual({
          completed: swap + 1,
          selections: [false, false],
        });
      }
      snapshots.pop();
      for (const snapshot of snapshots.toReversed()) {
        state = sequenceReducer(state, { type: "undo" });
        expect(state).toEqual(snapshot);
      }
      expect(sequenceReducer(state, { type: "undo" })).toBe(state);
    },
  );

  it("ignores repeated, future, past and beyond-the-end marks without polluting undo history", () => {
    const initial = createSequenceState(1);
    const mark: SequenceAction = { type: "mark", swap: 0, selection: 1 };
    const partial = sequenceReducer(initial, mark);
    expect(sequenceReducer(partial, mark)).toBe(partial);
    for (const swap of [-1, 1, 99]) {
      expect(
        sequenceReducer(partial, { type: "mark", swap, selection: "both" }),
      ).toBe(partial);
    }
    const complete = sequenceReducer(partial, {
      type: "mark",
      swap: 0,
      selection: "both",
    });
    for (const swap of [0, 1]) {
      expect(
        sequenceReducer(complete, { type: "mark", swap, selection: "both" }),
      ).toBe(complete);
    }
    expect(sequenceReducer(complete, { type: "undo" })).toEqual(partial);
    const empty = createSequenceState(0);
    expect(
      sequenceReducer(empty, { type: "mark", swap: 0, selection: "both" }),
    ).toBe(empty);
  });
});
