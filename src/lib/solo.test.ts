import { describe, expect, it } from "vitest";
import {
  planSoloAfterTrades,
  planSoloTransfers,
  SHAPES,
  STATUES,
  type Pair,
  type Shape,
  type SoloPlan,
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

function distribute(
  rooms: readonly Pair[],
  plans: readonly SoloPlan[],
): Pair[] {
  const next = plans.map((plan) => [...plan.keep]);
  for (const plan of plans) {
    for (const transfer of plan.give) {
      next[transfer.statue]?.push(transfer.shape);
    }
  }
  expect(
    next
      .flat()
      .sort((left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right)),
  ).toEqual(
    rooms
      .flat()
      .sort((left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right)),
  );
  return next.map((room) => {
    expect(room).toHaveLength(2);
    const [first, second] = room;
    if (first === undefined || second === undefined) {
      throw new Error("Each room must receive exactly two shapes.");
    }
    return [first, second];
  });
}

describe("smart solo-room distribution", () => {
  it.each(ORDERS.map((inside) => ({ inside })))(
    "finishes all normal starting distributions across the three rooms for $inside",
    ({ inside }) => {
      for (const extras of ORDERS) {
        const opening: Pair[] = STATUES.map((self) => [
          inside[self],
          extras[self],
        ]);
        const openingPlans = STATUES.map((self) => {
          const room = opening[self];
          if (room === undefined) {
            throw new Error("Opening room must exist.");
          }
          const plan = planSoloTransfers(inside, self, room);
          if (plan === null) {
            throw new Error("Opening trades must be defined.");
          }
          // Every starting instance must leave before checking received shapes.
          expect(plan.keep).toHaveLength(0);
          expect(
            plan.give
              .map((transfer) => transfer.shape)
              .sort(
                (left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right),
              ),
          ).toEqual(
            [...room].sort(
              (left, right) => SHAPES.indexOf(left) - SHAPES.indexOf(right),
            ),
          );
          return plan;
        });
        const received = distribute(opening, openingPlans);
        const afterPlans = STATUES.map((self) => {
          const room = received[self];
          if (room === undefined) {
            throw new Error("Received room must exist.");
          }
          const plan = planSoloAfterTrades(inside, self, room);
          if (plan === null) {
            throw new Error("Received shapes must have a final plan.");
          }
          return plan;
        });
        const final = distribute(received, afterPlans);
        for (const self of STATUES) {
          expect(new Set(final[self])).toEqual(
            new Set(SHAPES.filter((shape) => shape !== inside[self])),
          );
        }
      }
    },
  );
  it.each(ORDERS.map((inside) => ({ inside })))(
    "checks received pairs without sending away a completed key for $inside",
    ({ inside }) => {
      for (const self of STATUES) {
        for (const first of SHAPES) {
          for (const second of SHAPES) {
            const available: Pair = [first, second];
            const plan = planSoloAfterTrades(inside, self, available);
            if (available.includes(inside[self])) {
              expect(plan).toBeNull();
            } else if (first === second) {
              expect(plan).toEqual({
                give: [
                  {
                    statue: STATUES.find(
                      (statue) => statue !== self && inside[statue] !== first,
                    ),
                    shape: first,
                  },
                ],
                keep: [first],
              });
            } else {
              expect(plan).toEqual({ give: [], keep: available });
            }
          }
        }
      }
    },
  );

  it("rejects duplicate statue symbols after trades", () => {
    expect(
      planSoloAfterTrades(["square", "circle", "circle"], 0, [
        "circle",
        "triangle",
      ]),
    ).toBeNull();
  });
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
