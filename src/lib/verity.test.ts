import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applySwap,
  generatePuzzle,
  getSolid,
  inferInside,
  inferOutside,
  isSolved,
  isValidPuzzle,
  SHAPES,
  SOLID_SHAPES,
  SOLIDS,
  solve,
  STATUES,
  targetBoard,
  type Board,
  type Shape,
  type Triple,
} from "./verity";

afterEach(() => {
  vi.restoreAllMocks();
});

const ORDERS: Triple<Shape>[] = [
  ["circle", "triangle", "square"],
  ["circle", "square", "triangle"],
  ["triangle", "circle", "square"],
  ["triangle", "square", "circle"],
  ["square", "circle", "triangle"],
  ["square", "triangle", "circle"],
];

function allBoards(): Board[] {
  const boards: Board[] = [];
  for (const left of SOLIDS) {
    for (const middle of SOLIDS) {
      for (const right of SOLIDS) {
        const outside: Board = [
          SOLID_SHAPES[left],
          SOLID_SHAPES[middle],
          SOLID_SHAPES[right],
        ];
        if (isValidPuzzle({ inside: ORDERS[0] ?? SHAPES, outside })) {
          boards.push(outside);
        }
      }
    }
  }
  return boards;
}

describe("room inference", () => {
  it("infers the missing inside symbol and rejects duplicates", () => {
    expect(inferInside("square", "circle")).toEqual([
      "square",
      "circle",
      "triangle",
    ]);
    expect(inferInside("circle", "circle")).toBeNull();
  });

  it("infers the third solid while conserving two copies of every shape", () => {
    expect(inferOutside("sphere", "pyramid")).toEqual([
      ["circle", "circle"],
      ["triangle", "triangle"],
      ["square", "square"],
    ]);
    expect(inferOutside("cone", "cone")?.[2]).toEqual(["square", "square"]);
    expect(inferOutside("sphere", "cylinder")).toBeNull();
    expect(inferOutside("sphere", "sphere")).toBeNull();
  });

  it.each(SOLIDS)("recognizes %s regardless of component order", (solid) => {
    const pair = SOLID_SHAPES[solid];
    expect(getSolid([pair[1], pair[0]])).toBe(solid);
  });
});

describe("dissection solver", () => {
  it("solves all 126 valid ordered room configurations without changing the input", () => {
    const boards = allBoards();
    expect(boards).toHaveLength(21);
    let checked = 0;
    for (const inside of ORDERS) {
      for (const outside of boards) {
        const original = JSON.stringify(outside);
        const swaps = solve({ inside, outside });
        expect(swaps).not.toBeNull();
        if (swaps === null) {
          throw new Error("A valid room had no solution.");
        }
        let current = outside;
        for (const swap of swaps) {
          expect(swap[0].statue).not.toBe(swap[1].statue);
          expect(swap[0].shape).not.toBe(swap[1].shape);
          current = applySwap(current, swap);
          expect(isValidPuzzle({ inside, outside: current })).toBe(true);
        }
        expect(isSolved({ inside, outside: current })).toBe(true);
        for (const statue of STATUES) {
          const expected = SHAPES.filter((shape) => shape !== inside[statue]);
          expect(new Set(current[statue])).toEqual(new Set(expected));
        }
        expect(JSON.stringify(outside)).toBe(original);
        checked++;
      }
    }
    expect(checked).toBe(126);
  });

  it("returns zero, one, and three swaps for known minimal cases", () => {
    const inside: Triple<Shape> = ["circle", "triangle", "square"];
    expect(solve({ inside, outside: targetBoard(inside) })).toEqual([]);
    expect(
      solve({
        inside,
        outside: [
          ["circle", "triangle"],
          ["circle", "square"],
          ["triangle", "square"],
        ],
      }),
    ).toHaveLength(1);
    expect(
      solve({
        inside,
        outside: [
          ["circle", "circle"],
          ["triangle", "triangle"],
          ["square", "square"],
        ],
      }),
    ).toHaveLength(3);
  });

  it("distinguishes invalid rooms from solved rooms", () => {
    expect(
      solve({
        inside: ["circle", "circle", "square"],
        outside: targetBoard(SHAPES),
      }),
    ).toBeNull();
    expect(
      solve({
        inside: SHAPES,
        outside: [
          ["circle", "circle"],
          ["circle", "triangle"],
          ["square", "square"],
        ],
      }),
    ).toBeNull();
  });

  it("removes only one copy from a pure solid and rejects illegal swaps", () => {
    const outside: Board = [
      ["circle", "circle"],
      ["triangle", "triangle"],
      ["square", "square"],
    ];
    expect(
      applySwap(outside, [
        { statue: 0, shape: "circle" },
        { statue: 1, shape: "triangle" },
      ]),
    ).toEqual([
      ["triangle", "circle"],
      ["circle", "triangle"],
      ["square", "square"],
    ]);
    expect(() =>
      applySwap(outside, [
        { statue: 0, shape: "circle" },
        { statue: 0, shape: "triangle" },
      ]),
    ).toThrow();
    expect(() =>
      applySwap(outside, [
        { statue: 0, shape: "square" },
        { statue: 1, shape: "triangle" },
      ]),
    ).toThrow();
  });

  it("generates valid, unsolved rounds with each statue containing its own symbol", () => {
    for (const value of [0, 0.2, 0.49, 0.75, 0.999]) {
      vi.spyOn(Math, "random").mockReturnValue(value);
      const puzzle = generatePuzzle();
      expect(isValidPuzzle(puzzle)).toBe(true);
      expect(isSolved(puzzle)).toBe(false);
      for (const statue of STATUES) {
        expect(puzzle.outside[statue]).toContain(puzzle.inside[statue]);
      }
      expect(solve(puzzle)).not.toBeNull();
    }
  });
});
