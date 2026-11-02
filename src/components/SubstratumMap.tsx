import * as RadioGroup from "@radix-ui/react-radio-group";
import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  canPlaceMarker,
  DOOR_LINKS,
  emptyMarkers,
  isMarker,
  MAP_ROOMS,
  MARKERS,
  placeMarker,
  ROOM_LAYOUT,
  type MapRoom,
  type Marker,
} from "../lib/substratum";
import { CONTROL_PROPS } from "./controlProps";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

// Small, original landmark symbols; room names are community callouts.
const LANDMARKS: Record<MapRoom, string> = {
  vase: "M9 3h14M10 3l2 8c-9 7-8 18 4 18s13-11 4-18l2-8M11 25h10",
  glyph: "M16 2 29 16 16 30 3 16ZM16 9v14M9 16h14",
  shell:
    "M4 27C-2 8 10 1 16 3s19 7 12 24ZM16 4v23M7 8l5 19M25 8l-5 19M3 17l7 10M29 17l-7 10",
  pillar: "M8 3h16v5H8ZM11 8v16M21 8v16M8 24h16v5H8Z",
  banner: "M6 30V3h20v18l-10-5-10 5",
  bones:
    "M7 8C-2 4 1-3 8 3l17 20c9-1 8 10 2 7L7 8ZM7 24 23 8M4 22c-7 2 0 12 5 5M22 5c0-7 12-3 6 3",
  halo: "M28 16a12 7 0 1 1-24 0 12 7 0 1 1 24 0M16 23v7",
  basement: "M3 4h26v25H3ZM3 11h8v6h8v6h10",
  main: "M4 12h24v16H4ZM4 12l5-7h14l5 7M4 18h24M14 16h4v6h-4Z",
};

function Landmark({ room }: Readonly<{ room: MapRoom }>): ReactElement {
  return (
    <svg viewBox="0 0 32 32" className="map-landmark" aria-hidden="true">
      <path d={LANDMARKS[room]} />
    </svg>
  );
}

export default function SubstratumMap({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const text = getMessages(locale).substratumTool;
  const hydrated = useHydrated();
  const [selected, setSelected] = useState<Marker>("you");
  const [markers, setMarkers] = useState(emptyMarkers);
  const hasMarkers = MARKERS.some((marker) => markers[marker] !== null);
  const summary = MARKERS.map(
    (marker) =>
      `${text.markers[marker]}: ${markers[marker] === null ? text.unset : text.rooms[markers[marker]]}`,
  ).join(". ");

  return (
    <section className="substratum-map" aria-label={text.title}>
      <p className="helper-note">{text.instruction}</p>
      <RadioGroup.Root
        className="map-marker-picker"
        aria-label={text.markerPicker}
        value={selected}
        disabled={!hydrated}
        onValueChange={(value) => {
          if (isMarker(value)) {
            setSelected(value);
          }
        }}
      >
        {MARKERS.map((marker) => (
          <RadioGroup.Item
            {...CONTROL_PROPS}
            className="map-marker-choice"
            key={marker}
            value={marker}
            data-marker={marker}
            aria-label={text.markers[marker]}
            aria-describedby={`marker-${marker}`}
          >
            <span className="map-marker-heading">
              <span
                className="map-badge"
                data-marker={marker}
                aria-hidden="true"
              >
                {text.symbols[marker]}
              </span>
              {text.markers[marker]}
            </span>
            <span id={`marker-${marker}`} className="map-assignment">
              {markers[marker] === null
                ? text.unset
                : text.rooms[markers[marker]]}
            </span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      <figure className="map-figure">
        <div className="map-board">
          <svg
            className="map-floor"
            viewBox="0 0 720 820"
            role="img"
            aria-label={text.mapDescription}
          >
            <g className="map-door-links">
              {DOOR_LINKS.map(([from, to]) => (
                <line
                  key={`${from}-${to}`}
                  x1={ROOM_LAYOUT[from].x}
                  y1={ROOM_LAYOUT[from].y}
                  x2={ROOM_LAYOUT[to].x}
                  y2={ROOM_LAYOUT[to].y}
                />
              ))}
            </g>
            {MAP_ROOMS.map((room) => (
              <polygon
                key={room}
                points={ROOM_LAYOUT[room].outline}
                data-room={room}
                data-marked={MARKERS.some((marker) => markers[marker] === room)}
              />
            ))}
            <path className="map-entry" d="M370 798V758m-10 10 10-10 10 10" />
          </svg>
          <RadioGroup.Root
            aria-label={text.roomPicker.replace(
              "{marker}",
              text.markers[selected],
            )}
            aria-describedby="map-orientation map-scope"
            value={markers[selected] ?? ""}
            disabled={!hydrated}
            onValueChange={(room) => {
              setMarkers((previous) => placeMarker(previous, selected, room));
            }}
          >
            {MAP_ROOMS.map((room) => {
              const occupants = MARKERS.filter(
                (marker) => markers[marker] === room,
              );
              return (
                <RadioGroup.Item
                  {...CONTROL_PROPS}
                  key={room}
                  value={room}
                  className="map-room"
                  style={{
                    left: `${String(ROOM_LAYOUT[room].x / 7.2)}%`,
                    top: `${String(ROOM_LAYOUT[room].y / 8.2)}%`,
                  }}
                  disabled={
                    !hydrated || !canPlaceMarker(markers, selected, room)
                  }
                  aria-label={text.rooms[room]}
                  aria-describedby={`occupants-${room}`}
                >
                  <Landmark room={room} />
                  <span>{text.rooms[room]}</span>
                  <span className="map-occupants" aria-hidden="true">
                    {occupants.map((marker) => (
                      <span
                        className="map-badge"
                        key={marker}
                        data-marker={marker}
                      >
                        {text.symbols[marker]}
                      </span>
                    ))}
                  </span>
                  <span id={`occupants-${room}`} className="sr-only">
                    {occupants
                      .map((marker) => text.markers[marker])
                      .join(", ") || text.empty}
                  </span>
                </RadioGroup.Item>
              );
            })}
          </RadioGroup.Root>
        </div>
        <figcaption id="map-orientation">{text.orientation}</figcaption>
      </figure>
      <div className="map-toolbar">
        <span className="map-link-legend">{text.doors}</span>
        <div className="map-actions">
          <button
            {...CONTROL_PROPS}
            type="button"
            className="button"
            disabled={!hydrated || markers[selected] === null}
            onClick={() => {
              setMarkers((previous) => placeMarker(previous, selected, null));
            }}
          >
            {text.clear}
          </button>
          <button
            {...CONTROL_PROPS}
            type="button"
            className="button"
            disabled={!hydrated || !hasMarkers}
            onClick={() => {
              setMarkers(emptyMarkers());
              setSelected("you");
            }}
          >
            {text.reset}
          </button>
        </div>
      </div>
      <p className="helper-note" id="map-scope">
        {text.manual}
      </p>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {summary}
      </p>
      <ToolReadiness locale={locale} />
      <details className="map-reference">
        <summary>{text.reference}</summary>
        <p className="helper-note">{text.sourceNote}</p>
        <nav className="reference-links" aria-label={text.reference}>
          <a href="https://www.reddit.com/r/raidsecrets/comments/1dnz91q/salvations_edge_map/">
            {text.mapSource}
          </a>
          <a href="https://www.reddit.com/r/raidsecrets/comments/1dbehjs/substratum_map_cleaned_up_for_salvations_edge/">
            {text.topologySource}
          </a>
          <a href="https://professionalism.gg/raid-guides/salvations-edge">
            {text.circuitsSource}
          </a>
        </nav>
      </details>
    </section>
  );
}
