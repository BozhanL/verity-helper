// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { getMessages } from "../i18n/messages";
import SubstratumMap from "./SubstratumMap";

afterEach(cleanup);

it.each(["en", "zh"] as const)(
  "%s: places, moves and clears roles without losing other markers",
  (locale) => {
    const text = getMessages(locale).substratumTool;
    const view = render(<SubstratumMap locale={locale} />);
    function choose(name: string): void {
      fireEvent.click(screen.getByRole("radio", { name }));
    }
    function assigned(marker: "you" | "sender" | "closer", room: string): void {
      expect(
        within(
          screen.getByRole("radio", {
            name: text.markers[marker],
          }),
        ).getByText(room),
      ).toBeTruthy();
    }
    choose(text.rooms.main);
    choose(text.markers.sender);
    expect(
      screen
        .getByRole("radio", { name: text.rooms.main })
        .hasAttribute("disabled"),
    ).toBe(true);
    choose(text.rooms.vase);
    choose(text.markers.closer);
    expect(
      screen
        .getByRole("radio", { name: text.rooms.vase })
        .hasAttribute("disabled"),
    ).toBe(true);
    choose(text.rooms.glyph);
    choose(text.markers.you);
    choose(text.rooms.vase);
    choose(text.rooms.vase);
    assigned("you", text.rooms.vase);
    assigned("sender", text.rooms.vase);
    assigned("closer", text.rooms.glyph);
    view.rerender(<SubstratumMap locale={locale} />);
    assigned("you", text.rooms.vase);
    choose(text.rooms.glyph);
    fireEvent.click(screen.getByRole("button", { name: text.clear }));
    assigned("you", text.unset);
    assigned("sender", text.rooms.vase);
    choose(text.markers.closer);
    fireEvent.click(screen.getByRole("button", { name: text.clear }));
    choose(text.markers.sender);
    choose(text.rooms.glyph);
    assigned("sender", text.rooms.glyph);
    fireEvent.click(screen.getByRole("button", { name: text.reset }));
    for (const marker of ["you", "sender", "closer"] as const) {
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
