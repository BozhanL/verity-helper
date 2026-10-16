import { SHAPES, type Shape, type Triple } from "./verity";

export const PLATES = [0, 1, 2] as const;
export const ROOMS = [1, 2, 3] as const;
export type Plate = (typeof PLATES)[number];
export type Room = (typeof ROOMS)[number];
export type ConductorCallouts = Triple<Shape | null>;

// Start -> end, viewed from the entrance toward the exit.
// https://www.destructoid.com/destiny-2-salvations-edge-third-encounter-raid-guide-repository/
const CONNECTIONS: Record<Room, Triple<Plate>> = {
  1: [0, 1, 2],
  2: [1, 0, 2],
  3: [1, 2, 0],
};

export function getEndPlate(room: Room, start: Plate): Plate {
  return CONNECTIONS[room][start];
}

export function getStartPlate(room: Room, end: Plate): Plate {
  const start = PLATES.find((plate) => getEndPlate(room, plate) === end);
  if (start === undefined) {
    throw new Error("Every end plate must have a connected start plate.");
  }
  return start;
}

export function inferConductors(
  callouts: ConductorCallouts,
): Triple<Shape> | null {
  const known = callouts.filter((shape) => shape !== null);
  if (known.length !== 2 || new Set(known).size !== 2) {
    return null;
  }
  const remaining = SHAPES.find((shape) => !known.includes(shape));
  if (remaining === undefined) {
    return null;
  }
  return [
    callouts[0] ?? remaining,
    callouts[1] ?? remaining,
    callouts[2] ?? remaining,
  ];
}

export function getClosureTarget(
  room: Room,
  conductors: Triple<Shape>,
  held: Shape,
): { end: Plate; start: Plate } | null {
  if (new Set(conductors).size !== 3) {
    return null;
  }
  const end = PLATES.find((plate) => conductors[plate] === held);
  return end === undefined ? null : { end, start: getStartPlate(room, end) };
}
