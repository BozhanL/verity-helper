// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { getMessages } from "../i18n/messages";
import { MARKERS, type Marker } from "../lib/substratum";
import SubstratumMap from "./SubstratumMap";

afterEach(cleanup);

it("places a marker selected in the same batch using the latest selection", () => {
  const text = getMessages("en").substratumTool;
  render(<SubstratumMap locale="en" />);
  act(() => {
    fireEvent.click(screen.getByRole("radio", { name: text.markers.senderA }));
    fireEvent.click(screen.getByRole("radio", { name: text.rooms.vase }));
  });
  expect(
    within(screen.getByRole("radio", { name: text.markers.senderA })).getByText(
      text.rooms.vase,
    ),
  ).toBeDefined();
  expect(
    within(screen.getByRole("radio", { name: text.markers.you })).getByText(
      text.unset,
    ),
  ).toBeDefined();
});

it.each(["en", "zh"] as const)(
  "%s: places, moves and clears roles without losing other markers",
  (locale) => {
    const text = getMessages(locale).substratumTool;
    const view = render(<SubstratumMap locale={locale} />);
    function choose(name: string): void {
      fireEvent.click(screen.getByRole("radio", { name }));
    }
    function assigned(marker: Marker, room: string): void {
      expect(
        within(
          screen.getByRole("radio", {
            name: text.markers[marker],
          }),
        ).getByText(room),
      ).toBeTruthy();
    }
    choose(text.rooms.main);
    choose(text.markers.senderA);
    expect(
      screen
        .getByRole("radio", { name: text.rooms.main })
        .hasAttribute("disabled"),
    ).toBe(true);
    choose(text.rooms.vase);
    choose(text.markers.closerA);
    expect(
      screen
        .getByRole("radio", { name: text.rooms.vase })
        .hasAttribute("disabled"),
    ).toBe(true);
    choose(text.rooms.glyph);
    choose(text.markers.senderB);
    for (const room of [text.rooms.main, text.rooms.vase, text.rooms.glyph]) {
      const occupied = screen.getByRole("radio", { name: room });
      expect(occupied.hasAttribute("disabled")).toBe(true);
      fireEvent.click(occupied);
    }
    assigned("senderB", text.unset);
    choose(text.rooms.bones);
    choose(text.markers.closerB);
    choose(text.rooms.halo);
    choose(text.markers.you);
    choose(text.rooms.vase);
    choose(text.rooms.vase);
    assigned("you", text.rooms.vase);
    assigned("senderA", text.rooms.vase);
    assigned("closerA", text.rooms.glyph);
    assigned("senderB", text.rooms.bones);
    assigned("closerB", text.rooms.halo);
    view.rerender(<SubstratumMap locale={locale} />);
    assigned("you", text.rooms.vase);
    choose(text.markers.closerB);
    choose(text.rooms.basement);
    assigned("closerB", text.rooms.basement);
    assigned("closerA", text.rooms.glyph);
    choose(text.markers.you);
    choose(text.rooms.glyph);
    fireEvent.click(screen.getByRole("button", { name: text.clear }));
    assigned("you", text.unset);
    assigned("senderA", text.rooms.vase);
    choose(text.markers.closerA);
    fireEvent.click(screen.getByRole("button", { name: text.clear }));
    choose(text.markers.senderB);
    choose(text.rooms.glyph);
    assigned("senderB", text.rooms.glyph);
    assigned("senderA", text.rooms.vase);
    assigned("closerB", text.rooms.basement);
    fireEvent.click(screen.getByRole("button", { name: text.reset }));
    for (const marker of MARKERS) {
      assigned(marker, text.unset);
    }
    expect(
      screen
        .getByRole("radio", { name: text.markers.you })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: text.reset }).hasAttribute("disabled"),
    ).toBe(true);
  },
);
