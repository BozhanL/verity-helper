export const SHAPES = ["circle", "triangle", "square"] as const;
export const SOLIDS = [
  "sphere",
  "pyramid",
  "cube",
  "cone",
  "cylinder",
  "prism",
] as const;
export const STATUES = [0, 1, 2] as const;

export type Shape = (typeof SHAPES)[number];
export type Solid = (typeof SOLIDS)[number];
export type Statue = (typeof STATUES)[number];
export type Triple<T> = readonly [T, T, T];
export type Pair = readonly [Shape, Shape];
export type Board = Triple<Pair>;

export interface Puzzle {
  readonly inside: Triple<Shape>;
  readonly outside: Board;
}

export interface Excise {
  readonly statue: Statue;
  readonly shape: Shape;
}

export type Swap = readonly [Excise, Excise];

export const SOLID_SHAPES: Record<Solid, Pair> = {
  sphere: ["circle", "circle"],
  pyramid: ["triangle", "triangle"],
  cube: ["square", "square"],
  cone: ["circle", "triangle"],
  cylinder: ["circle", "square"],
  prism: ["triangle", "square"],
};

const TARGET_SHAPES: Record<Shape, Pair> = {
  circle: ["triangle", "square"],
  triangle: ["circle", "square"],
  square: ["circle", "triangle"],
};

const STATUE_PAIRS: readonly (readonly [Statue, Statue])[] = [
  [0, 1],
  [0, 2],
  [1, 2],
];

export function inferInside(left: Shape, middle: Shape): Triple<Shape> | null {
  const right = SHAPES.find((shape) => shape !== left && shape !== middle);
  return left !== middle && right !== undefined ? [left, middle, right] : null;
}

export function inferOutside(left: Solid, middle: Solid): Board | null {
  const first = SOLID_SHAPES[left];
  const second = SOLID_SHAPES[middle];
  const remaining: Shape[] = [];
  for (const shape of SHAPES) {
    const count = [...first, ...second].filter((item) => item === shape).length;
    if (count > 2) {
      return null;
    }
    for (let index = count; index < 2; index++) {
      remaining.push(shape);
    }
  }
  const [one, two] = remaining;
  return one !== undefined && two !== undefined
    ? [first, second, [one, two]]
    : null;
}

function pairKey(pair: Pair): string {
  return [...pair].sort((left, right) => left.localeCompare(right)).join(",");
}

function boardKey(board: Board): string {
  return board.map(pairKey).join("|");
}

export function getSolid(pair: Pair): Solid {
  const solid = SOLIDS.find(
    (candidate) => pairKey(SOLID_SHAPES[candidate]) === pairKey(pair),
  );
  if (solid === undefined) {
    throw new Error("A solid must contain two known shapes.");
  }
  return solid;
}

function isValidInside(inside: Triple<Shape>): boolean {
  return (
    new Set(inside).size === 3 &&
    SHAPES.every((shape) => inside.includes(shape))
  );
}

export function isValidPuzzle(puzzle: Puzzle): boolean {
  return (
    isValidInside(puzzle.inside) &&
    puzzle.outside.every((pair) =>
      pair.every((shape) => SHAPES.includes(shape)),
    ) &&
    SHAPES.every(
      (shape) =>
        puzzle.outside.flat().filter((item) => item === shape).length === 2,
    )
  );
}

export function targetBoard(inside: Triple<Shape>): Board {
  return [
    TARGET_SHAPES[inside[0]],
    TARGET_SHAPES[inside[1]],
    TARGET_SHAPES[inside[2]],
  ];
}

export function isSolved(puzzle: Puzzle): boolean {
  return STATUES.every((statue) => {
    const pair = puzzle.outside[statue];
    return pair[0] !== pair[1] && !pair.includes(puzzle.inside[statue]);
  });
}

function replaceShape(pair: Pair, removed: Shape, added: Shape): Pair {
  if (pair[0] === removed) {
    return [added, pair[1]];
  }
  if (pair[1] === removed) {
    return [pair[0], added];
  }
  throw new Error("The selected statue does not contain that shape.");
}

export function applySwap(board: Board, swap: Swap): Board {
  const [first, second] = swap;
  if (first.statue === second.statue || first.shape === second.shape) {
    throw new Error("Excise different shapes from two different statues.");
  }
  const next: [Pair, Pair, Pair] = [board[0], board[1], board[2]];
  next[first.statue] = replaceShape(
    board[first.statue],
    first.shape,
    second.shape,
  );
  next[second.statue] = replaceShape(
    board[second.statue],
    second.shape,
    first.shape,
  );
  return next;
}

function possibleSwaps(board: Board): Swap[] {
  const swaps: Swap[] = [];
  for (const [left, right] of STATUE_PAIRS) {
    for (const first of new Set(board[left])) {
      for (const second of new Set(board[right])) {
        if (first !== second) {
          swaps.push([
            { statue: left, shape: first },
            { statue: right, shape: second },
          ]);
        }
      }
    }
  }
  return swaps;
}

/** Breadth-first search returns the fewest paired swaps, or null for invalid input. */
export function solve(puzzle: Puzzle): readonly Swap[] | null {
  if (!isValidPuzzle(puzzle)) {
    return null;
  }
  const queue: { board: Board; swaps: Swap[] }[] = [
    { board: puzzle.outside, swaps: [] },
  ];
  const visited = new Set([boardKey(puzzle.outside)]);
  for (const current of queue) {
    if (isSolved({ inside: puzzle.inside, outside: current.board })) {
      return current.swaps;
    }
    for (const swap of possibleSwaps(current.board)) {
      const board = applySwap(current.board, swap);
      const key = boardKey(board);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ board, swaps: [...current.swaps, swap] });
      }
    }
  }
  return null;
}

function shuffledShapes(random: () => number): Triple<Shape> {
  const shapes: [Shape, Shape, Shape] = [...SHAPES];
  for (let index = shapes.length - 1; index > 0; index--) {
    const selectedIndex = Math.floor(random() * (index + 1));
    const selected = shapes[selectedIndex];
    const current = shapes[index];
    if (selected === undefined || current === undefined) {
      throw new Error(
        "The random source must return a value from zero up to, but not including, one.",
      );
    }
    shapes[index] = selected;
    shapes[selectedIndex] = current;
  }
  return shapes;
}

/** Every starting statue contains its own inside symbol, just like the exercise reference. */
export function generatePuzzle(random: () => number = Math.random): Puzzle {
  const inside = shuffledShapes(random);
  const extras = shuffledShapes(random);
  return {
    inside,
    outside: [
      [inside[0], extras[0]],
      [inside[1], extras[1]],
      [inside[2], extras[2]],
    ],
  };
}

export interface SoloTransfer {
  readonly statue: Statue;
  readonly shape: Shape;
}

export interface SoloPlan {
  readonly give: readonly SoloTransfer[];
  readonly keep: readonly Shape[];
}

/** Plan direct solo-room transfers for the two currently available shapes. */
export function planSoloTransfers(
  inside: Triple<Shape>,
  self: Statue,
  available: Pair,
): SoloPlan | null {
  if (!isValidInside(inside)) {
    return null;
  }
  const [firstShape, secondShape] = available;
  if (firstShape === secondShape && firstShape !== inside[self]) {
    const recipient = STATUES.find(
      (statue) => statue !== self && inside[statue] !== firstShape,
    );
    return recipient === undefined
      ? null
      : {
          give: [{ statue: recipient, shape: firstShape }],
          keep: [firstShape],
        };
  }
  const [one, two] = STATUES.filter((statue) => statue !== self);
  if (one === undefined || two === undefined) {
    return null;
  }
  for (const [first, second] of [
    [one, two],
    [two, one],
  ] as const) {
    if (inside[first] !== firstShape && inside[second] !== secondShape) {
      return {
        give: [
          { statue: first, shape: firstShape },
          { statue: second, shape: secondShape },
        ],
        keep: [],
      };
    }
  }
  return null;
}
