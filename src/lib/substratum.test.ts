import { describe, expect, it } from "vitest";
import {
  canPlaceMarker,
  DOOR_LINKS,
  emptyMarkers,
  ENDPOINTS,
  isMapRoom,
  isMarker,
  MAP_ROOMS,
  placeMarker,
} from "./substratum";

describe("Substratum room markers", () => {
  it("keeps both pairs independent and lets You share any role's room", () => {
    const start = emptyMarkers();
    const senderA = placeMarker(start, "senderA", "vase");
    const pairA = placeMarker(senderA, "closerA", "glyph");
    const senderB = placeMarker(pairA, "senderB", "bones");
    const pairs = placeMarker(senderB, "closerB", "halo");
    expect(pairs).toEqual({
      you: null,
      senderA: "vase",
      closerA: "glyph",
      senderB: "bones",
      closerB: "halo",
    });
    for (const role of ENDPOINTS) {
      const shared = placeMarker(pairs, "you", pairs[role]);
      expect(shared).toEqual({ ...pairs, you: pairs[role] });
      expect(placeMarker(shared, "you", pairs[role])).toBe(shared);
    }
    const moved = placeMarker(pairs, "senderB", "banner");
    expect(moved).toEqual({ ...pairs, senderB: "banner" });
    expect(placeMarker(moved, "closerA", "shell")).toEqual({
      ...moved,
      closerA: "shell",
    });
    expect(start).toEqual(emptyMarkers());
    const cleared = placeMarker(moved, "closerB", null);
    expect(cleared).toEqual({
      ...moved,
      closerB: null,
    });
    expect(placeMarker(cleared, "closerB", null)).toBe(cleared);
    expect(placeMarker(cleared, "senderA", "halo")).toEqual({
      ...cleared,
      senderA: "halo",
    });
  });

  it("rejects invalid rooms, hub endpoints, and overlapping endpoints without deleting prior markers", () => {
    const pairs = {
      you: "main",
      senderA: "vase",
      closerA: "glyph",
      senderB: "bones",
      closerB: "halo",
    } as const;
    for (const role of ENDPOINTS) {
      expect(canPlaceMarker(pairs, role, "main")).toBe(false);
      expect(placeMarker(pairs, role, "main")).toBe(pairs);
      expect(placeMarker(pairs, role, "unknown")).toBe(pairs);
      expect(placeMarker(pairs, role, pairs[role])).toBe(pairs);
      for (const other of ENDPOINTS.filter((endpoint) => endpoint !== role)) {
        expect(canPlaceMarker(pairs, role, pairs[other])).toBe(false);
        expect(placeMarker(pairs, role, pairs[other])).toBe(pairs);
      }
    }
    expect(placeMarker(pairs, "you", "__proto__")).toBe(pairs);
    expect(isMarker("senderB")).toBe(true);
    expect(isMarker("unknown")).toBe(false);
    expect(isMapRoom("toString")).toBe(false);
    for (const room of MAP_ROOMS) {
      expect(canPlaceMarker(pairs, "you", room)).toBe(true);
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
