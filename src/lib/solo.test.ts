import { describe, expect, it } from "vitest";
import {
  planSoloTransfers,
  SHAPES,
  STATUES,
  type Pair,
  type Shape,
  type Statue,
  type Triple,
} from "./verity";

const ORDERS: readonly Triple<Shape>[] = [
  ["circle", "triangle", "square"],
  ["circle", "square", "triangle"],
  ["triangle", "circle", "square"],
  ["triangle", "square", "circle"],
  ["square", "circle", "triangle"],
  ["square", "triangle", "circle"],
];

function checkPlan(inside: Triple<Shape>, self: Statue, available: Pair): void {
  const original = JSON.stringify({ inside, available });
  const plan = planSoloTransfers(inside, self, available);
  if (plan === null) {
    throw new Error("A valid solo room must have a distribution.");
  }
  const retained =
    available[0] === available[1] && available[0] !== inside[self] ? 1 : 0;
  expect(plan.keep).toHaveLength(retained);
  expect(plan.give).toHaveLength(2 - retained);
  expect(new Set(plan.give.map((transfer) => transfer.statue)).size).toBe(
    plan.give.length,
  );
  for (const transfer of plan.give) {
    expect(transfer.statue).not.toBe(self);
    expect(transfer.shape).not.toBe(inside[transfer.statue]);
  }
  expect(
    [...plan.give.map((transfer) => transfer.shape), ...plan.keep].sort(
      (left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right),
    ),
  ).toEqual(
    [...available].sort(
      (left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right),
    ),
  );
  expect(JSON.stringify({ inside, available })).toBe(original);
}

describe("smart solo-room distribution", () => {
  it("sends a teammate's shape to the other teammate, then sends your own shape", () => {
    expect(planSoloTransfers(SHAPES, 2, ["triangle", "square"])).toEqual({
      give: [
        { statue: 0, shape: "triangle" },
        { statue: 1, shape: "square" },
      ],
      keep: [],
    });
  });

  it("gives one copy of your own symbol to each other player", () => {
    expect(planSoloTransfers(SHAPES, 2, ["square", "square"])).toEqual({
      give: [
        { statue: 0, shape: "square" },
        { statue: 1, shape: "square" },
      ],
      keep: [],
    });
  });

  it("gives one duplicate teammate shape to the eligible player and keeps one", () => {
    expect(planSoloTransfers(SHAPES, 2, ["circle", "circle"])).toEqual({
      give: [{ statue: 1, shape: "circle" }],
      keep: ["circle"],
    });
  });

  it("distributes both different teammate symbols rather than treating them as finished", () => {
    expect(planSoloTransfers(SHAPES, 2, ["circle", "triangle"])).toEqual({
      give: [
        { statue: 1, shape: "circle" },
        { statue: 0, shape: "triangle" },
      ],
      keep: [],
    });
  });

  it.each(ORDERS.map((inside) => ({ inside })))(
    "conserves shapes and chooses eligible recipients for $inside",
    ({ inside }) => {
      let checked = 0;
      for (const self of STATUES) {
        for (const first of SHAPES) {
          for (const second of SHAPES) {
            checkPlan(inside, self, [first, second]);
            checked++;
          }
        }
      }
      expect(checked).toBe(27);
    },
  );

  it("rejects duplicate statue symbols", () => {
    expect(
      planSoloTransfers(["circle", "circle", "square"], 2, [
        "square",
        "square",
      ]),
    ).toBeNull();
  });
});
