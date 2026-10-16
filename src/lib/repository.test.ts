import { describe, expect, it } from "vitest";
import {
  getClosureTarget,
  getEndPlate,
  getStartPlate,
  inferConductors,
  PLATES,
  ROOMS,
  type ConductorCallouts,
  type Plate,
} from "./repository";
import { SHAPES, type Shape, type Triple } from "./verity";

const wiring: Record<1 | 2 | 3, Triple<Plate>> = {
  1: [0, 1, 2],
  2: [1, 0, 2],
  3: [1, 2, 0],
};
const permutations: readonly Triple<Shape>[] = [
  ["circle", "triangle", "square"],
  ["circle", "square", "triangle"],
  ["triangle", "circle", "square"],
  ["triangle", "square", "circle"],
  ["square", "circle", "triangle"],
  ["square", "triangle", "circle"],
];

describe("Repository plate rules", () => {
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
      for (const shapes of permutations) {
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
        for (const conductors of permutations) {
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
