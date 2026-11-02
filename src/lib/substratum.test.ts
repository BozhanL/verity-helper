import { describe, expect, it } from "vitest";
import {
  canPlaceMarker,
  DOOR_LINKS,
  emptyMarkers,
  isMapRoom,
  isMarker,
  MAP_ROOMS,
  placeMarker,
} from "./substratum";

describe("Substratum room markers", () => {
  it("moves only the chosen marker and lets the player share either role's room", () => {
    const start = emptyMarkers();
    const sender = placeMarker(start, "sender", "vase");
    const pair = placeMarker(sender, "closer", "glyph");
    const self = placeMarker(pair, "you", "vase");
    expect(self).toEqual({ you: "vase", sender: "vase", closer: "glyph" });
    const moved = placeMarker(self, "you", "glyph");
    expect(moved).toEqual({ you: "glyph", sender: "vase", closer: "glyph" });
    expect(start).toEqual(emptyMarkers());
    expect(placeMarker(moved, "you", "glyph")).toBe(moved);
    expect(placeMarker(moved, "closer", null)).toEqual({
      you: "glyph",
      sender: "vase",
      closer: null,
    });
  });

  it("rejects invalid rooms, hub endpoints, and overlapping endpoints without deleting prior markers", () => {
    const pair = { you: "main", sender: "vase", closer: "glyph" } as const;
    for (const role of ["sender", "closer"] as const) {
      expect(canPlaceMarker(pair, role, "main")).toBe(false);
      expect(placeMarker(pair, role, "main")).toBe(pair);
      expect(placeMarker(pair, role, "unknown")).toBe(pair);
    }
    expect(placeMarker(pair, "closer", "vase")).toBe(pair);
    expect(placeMarker(pair, "sender", "glyph")).toBe(pair);
    expect(placeMarker(pair, "you", "__proto__")).toBe(pair);
    expect(isMarker("sender")).toBe(true);
    expect(isMarker("unknown")).toBe(false);
    expect(isMapRoom("toString")).toBe(false);
    for (const room of MAP_ROOMS) {
      expect(canPlaceMarker(pair, "you", room)).toBe(true);
    }
    expect(placeMarker(emptyMarkers(), "you", null)).toEqual(emptyMarkers());
  });
});

it("preserves the researched outer loop and all eight links to Main", () => {
  function neighbors(room: string): string[] {
    return DOOR_LINKS.filter((edge) =>
      edge.includes(room as (typeof MAP_ROOMS)[number]),
    )
      .flatMap((edge) => edge.filter((end) => end !== room))
      .sort((a, b) => a.localeCompare(b));
  }
  expect(neighbors("banner")).toEqual(["bones", "main", "pillar"]);
  expect(neighbors("bones")).toEqual(["banner", "halo", "main"]);
  expect(neighbors("halo")).toEqual(["basement", "bones", "main"]);
  expect(neighbors("basement")).toEqual(["halo", "main", "vase"]);
  expect(neighbors("vase")).toEqual(["basement", "glyph", "main"]);
  expect(neighbors("glyph")).toEqual(["main", "shell", "vase"]);
  expect(neighbors("shell")).toEqual(["glyph", "main", "pillar"]);
  expect(neighbors("pillar")).toEqual(["banner", "main", "shell"]);
  expect(neighbors("main")).toEqual([
    "banner",
    "basement",
    "bones",
    "glyph",
    "halo",
    "pillar",
    "shell",
    "vase",
  ]);
});
