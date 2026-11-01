// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { getMessages } from "../i18n/messages";
import { CHECKPOINTS } from "../lib/substratum";
import SubstratumChecklist from "./SubstratumChecklist";

afterEach(cleanup);

it.each(["en", "zh"] as const)(
  "%s: records interruptions, undoes banking, finishes, and resets",
  (locale) => {
    const text = getMessages(locale).substratumTool;
    render(<SubstratumChecklist locale={locale} />);
    function press(name: string): void {
      fireEvent.click(screen.getByRole("button", { name }));
    }
    press(text.marks.tormentor1);
    expect(
      screen
        .getByRole("button", { name: text.marks.tormentor1 })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    press(text.undo);
    expect(
      screen
        .getByRole("button", { name: text.marks.tormentor1 })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    for (const key of CHECKPOINTS) {
      press(text.marks[key]);
    }
    press(text.bank);
    expect(
      screen.getByRole("heading", { name: text.cycle.replace("{cycle}", "2") }),
    ).toBeTruthy();
    press(text.undo);
    expect(
      screen.getByRole("heading", { name: text.cycle.replace("{cycle}", "1") }),
    ).toBeTruthy();
    for (const key of CHECKPOINTS) {
      expect(
        screen
          .getByRole("button", { name: text.marks[key] })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    }
    press(text.bank);
    for (let cycle = 1; cycle < 3; cycle++) {
      for (const key of CHECKPOINTS) {
        press(text.marks[key]);
      }
      press(text.bank);
    }
    expect(screen.getByRole("heading", { name: text.complete })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: text.bank }).hasAttribute("disabled"),
    ).toBe(true);
    press(text.reset);
    expect(
      screen.getByRole("heading", { name: text.cycle.replace("{cycle}", "1") }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: text.undo }).hasAttribute("disabled"),
    ).toBe(true);
    for (const key of CHECKPOINTS) {
      expect(
        screen
          .getByRole("button", { name: text.marks[key] })
          .getAttribute("aria-pressed"),
      ).toBe("false");
    }
  },
);
