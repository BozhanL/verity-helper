// Rally is below Banner. Order follows the outer rooms from the top, clockwise.
// Original schematic of the room topology, not a floor plan or plate wiring.
// References: aequorde (https://www.kity.cc/images/substratum-map.jpg),
// Sumanji (https://www.reddit.com/r/raidsecrets/comments/1dbehjs/).
export const OUTER_ROOMS = [
  "vase",
  "glyph",
  "shell",
  "pillar",
  "banner",
  "bones",
  "halo",
  "basement",
] as const;
export const MAP_ROOMS = [...OUTER_ROOMS, "main"] as const;
export type MapRoom = (typeof MAP_ROOMS)[number];
export const MARKERS = ["you", "sender", "closer"] as const;
export type Marker = (typeof MARKERS)[number];
export type MapMarkers = Readonly<Record<Marker, MapRoom | null>>;

export function emptyMarkers(): MapMarkers {
  return { you: null, sender: null, closer: null };
}

export function isMapRoom(value: string): value is MapRoom {
  return MAP_ROOMS.some((room) => room === value);
}

export function isMarker(value: string): value is Marker {
  return MARKERS.some((marker) => marker === value);
}

export function canPlaceMarker(
  markers: MapMarkers,
  marker: Marker,
  room: MapRoom,
): boolean {
  if (marker === "you") {
    return true;
  }
  // The hub has no paired plate; the two ends of one pair occupy different rooms.
  return (
    room !== "main" &&
    room !== markers[marker === "sender" ? "closer" : "sender"]
  );
}

export function placeMarker(
  markers: MapMarkers,
  marker: Marker,
  room: string | null,
): MapMarkers {
  if (room === markers[marker]) {
    return markers;
  }
  if (
    room !== null &&
    (!isMapRoom(room) || !canPlaceMarker(markers, marker, room))
  ) {
    return markers;
  }
  return { ...markers, [marker]: room };
}

export const ROOM_LAYOUT: Record<
  MapRoom,
  { x: number; y: number; outline: string }
> = {
  vase: { x: 365, y: 115, outline: "270,26 456,26 456,196 398,210 270,210" },
  glyph: {
    x: 577,
    y: 194,
    outline: "486,102 642,102 642,164 676,184 676,284 540,284 486,252",
  },
  shell: {
    x: 610,
    y: 417,
    outline: "554,310 696,310 696,540 614,540 548,494 524,494 524,354",
  },
  pillar: {
    x: 556,
    y: 631,
    outline: "504,546 586,546 660,622 546,736 498,736 490,678",
  },
  banner: {
    x: 370,
    y: 650,
    outline: "278,542 434,542 462,568 462,742 278,742",
  },
  bones: { x: 155, y: 625, outline: "66,552 244,552 244,704 66,704" },
  halo: {
    x: 115,
    y: 417,
    outline: "24,310 162,310 214,354 214,472 162,518 24,518",
  },
  basement: {
    x: 148,
    y: 192,
    outline: "66,105 238,105 238,262 188,282 66,282",
  },
  main: {
    x: 374,
    y: 405,
    outline: "266,292 458,292 458,344 490,344 490,490 266,490",
  },
};

// Connectivity only: lines do not describe exact corridors, door height or state.
export const DOOR_LINKS: readonly (readonly [MapRoom, MapRoom])[] =
  OUTER_ROOMS.flatMap((room, index) => [
    [room, OUTER_ROOMS[(index + 1) % OUTER_ROOMS.length] ?? "vase"],
    [room, "main"],
  ]);
