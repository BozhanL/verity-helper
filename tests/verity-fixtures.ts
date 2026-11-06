import type { Shape, Triple } from "../src/lib/verity";

export const SHAPE_ORDERS: readonly Triple<Shape>[] = [
  ["circle", "triangle", "square"],
  ["circle", "square", "triangle"],
  ["triangle", "circle", "square"],
  ["triangle", "square", "circle"],
  ["square", "circle", "triangle"],
  ["square", "triangle", "circle"],
];
