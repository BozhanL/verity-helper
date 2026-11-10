import { describe, expect, it } from "vitest";
import { SHAPE_ORDERS } from "../../tests/verity-fixtures";
import {
  createRepositoryState,
  getClosureTarget,
  getEndPlate,
  getStartPlate,
  inferConductors,
  PLATES,
  repositoryReducer,
  ROOMS,
  type ConductorCallouts,
  type Plate,
} from "./repository";
import { SHAPES, type Triple } from "./verity";

const wiring: Record<1 | 2 | 3, Triple<Plate>> = {
  1: [0, 1, 2],
  2: [1, 0, 2],
  3: [1, 2, 0],
};

describe("Repository plate rules", () => {
  it("guards setup, duplicates and the inferred third callout independently of the UI", () => {
    const initial = createRepositoryState();
    expect(
      repositoryReducer(initial, {
        type: "callout",
        plate: 0,
        shape: "circle",
      }),
    ).toBe(initial);
    expect(repositoryReducer(initial, { type: "held", shape: "circle" })).toBe(
      initial,
    );
    const roomOnly = repositoryReducer(initial, { type: "room", room: 1 });
    expect(repositoryReducer(roomOnly, { type: "held", shape: "circle" })).toBe(
      roomOnly,
    );
    const setup = repositoryReducer(roomOnly, { type: "start", plate: 0 });
    const one = repositoryReducer(setup, {
      type: "callout",
      plate: 0,
      shape: "circle",
    });
    expect(
      repositoryReducer(one, { type: "callout", plate: 1, shape: "circle" }),
    ).toBe(one);
    const two = repositoryReducer(one, {
      type: "callout",
      plate: 1,
      shape: "triangle",
    });
    expect(
      repositoryReducer(two, { type: "callout", plate: 2, shape: "square" }),
    ).toBe(two);
    const cleared = repositoryReducer(two, {
      type: "callout",
      plate: 0,
      shape: null,
    });
    expect(
      inferConductors(
        repositoryReducer(cleared, {
          type: "callout",
          plate: 2,
          shape: "square",
        }).callouts,
      ),
    ).toEqual(["circle", "triangle", "square"]);
  });

  it("preserves observations for the same room or a new start, but clears them for a new room", () => {
    const state = {
      start: 0,
      room: 1,
      callouts: ["circle", "triangle", null],
      held: "square",
    } as const;
    expect(repositoryReducer(state, { type: "room", room: 1 })).toBe(state);
    expect(repositoryReducer(state, { type: "start", plate: 2 })).toEqual({
      ...state,
      start: 2,
    });
    expect(repositoryReducer(state, { type: "room", room: 2 })).toEqual({
      ...state,
      room: 2,
      callouts: [null, null, null],
      held: null,
    });
    expect(repositoryReducer(state, { type: "reset" })).toEqual(
      createRepositoryState(),
    );
  });

  it.each(ROOMS)(
    "matches the documented start/end wiring in room %i",
    (room) => {
      for (const start of PLATES) {
        const end = wiring[room][start];
        expect(getEndPlate(room, start)).toBe(end);
        expect(getStartPlate(room, end)).toBe(start);
      }
    },
  );

  it.each(PLATES)(
    "infers conductor %i from either pair of other callouts",
    (missing) => {
      for (const shapes of SHAPE_ORDERS) {
        const callouts: ConductorCallouts = [
          missing === 0 ? null : shapes[0],
          missing === 1 ? null : shapes[1],
          missing === 2 ? null : shapes[2],
        ];
        expect(inferConductors(callouts)).toEqual(shapes);
      }
    },
  );

  it.each<ConductorCallouts>([
    [null, null, null],
    ["circle", null, null],
    ["circle", "circle", null],
    [null, "square", "square"],
    ["circle", "square", "triangle"],
  ])("rejects incomplete or non-pair callouts: %j", (...callouts) => {
    expect(inferConductors(callouts)).toBeNull();
  });

  it("routes all 162 room, assignment, conductor, and held-resonance combinations", () => {
    let checked = 0;
    for (const room of ROOMS) {
      for (const assignedStart of PLATES) {
        for (const conductors of SHAPE_ORDERS) {
          for (const held of SHAPES) {
            const target = getClosureTarget(room, conductors, held);
            const end = conductors.indexOf(held);
            expect(target).toEqual({
              end,
              start: wiring[room].indexOf(end as Plate),
            });
            expect(getEndPlate(room, assignedStart)).toBe(
              wiring[room][assignedStart],
            );
            checked++;
          }
        }
      }
    }
    expect(checked).toBe(162);
  });

  it("rejects ambiguous conductor layouts", () => {
    expect(
      getClosureTarget(3, ["circle", "circle", "square"], "circle"),
    ).toBeNull();
  });
});
