// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { describeExcise, getMessages } from "../i18n/messages";
import { PREVIEW_PUZZLE, ROUND_SECONDS } from "../lib/practice";
import * as verity from "../lib/verity";
import Exercise from "./Exercise";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1000);
  vi.spyOn(verity, "generatePuzzle").mockReturnValue(PREVIEW_PUZZLE);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function choose(shape: verity.Shape): void {
  fireEvent.click(
    within(screen.getByRole("group", { name: "Current shape" })).getByRole(
      "radio",
      { name: getMessages("en").shapes[shape] },
    ),
  );
}

describe("exercise controls", () => {
  it.each(["en", "zh"] as const)(
    "%s: retries the original layout with the selected mode without generating another puzzle",
    (locale) => {
      const messages = getMessages(locale);
      const other: verity.Puzzle = {
        inside: ["square", "circle", "triangle"],
        outside: [
          ["square", "square"],
          ["circle", "circle"],
          ["triangle", "triangle"],
        ],
      };
      vi.mocked(verity.generatePuzzle)
        .mockReturnValueOnce(PREVIEW_PUZZLE)
        .mockReturnValueOnce(other);
      render(<Exercise locale={locale} />);
      expect(
        screen.queryByRole("button", { name: messages.retryExercise }),
      ).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: messages.start }));
      const original = screen
        .getAllByRole("img")
        .map((image) => image.getAttribute("aria-label"));
      function excise(selection: verity.Excise): void {
        fireEvent.click(
          within(
            screen.getByRole("group", { name: messages.currentShape }),
          ).getByRole("radio", { name: messages.shapes[selection.shape] }),
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: describeExcise(locale, selection),
          }),
        );
      }
      excise({ statue: 0, shape: "circle" });
      excise({ statue: 1, shape: "triangle" });
      excise({ statue: 2, shape: "square" });
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.untimed }),
      );
      expect(screen.getByRole("timer")).toBeDefined();
      expect(
        screen.getByRole("button", { name: messages.cancel }),
      ).toBeDefined();
      fireEvent.click(
        screen.getByRole("button", { name: messages.retryExercise }),
      );
      expect(
        screen
          .getAllByRole("img")
          .map((image) => image.getAttribute("aria-label")),
      ).toEqual(original);
      expect(screen.queryByRole("timer")).toBeNull();
      expect(
        screen.queryByRole("button", { name: messages.cancel }),
      ).toBeNull();
      expect(
        screen.getByText(messages.completedSwaps).nextElementSibling
          ?.textContent,
      ).toBe("00");
      expect(
        within(
          screen.getByRole("group", { name: messages.currentShape }),
        ).getByRole("radio", { name: messages.shapes.circle, checked: true }),
      ).toBeDefined();
      act(() => {
        vi.advanceTimersByTime(600000);
      });
      expect(
        screen.getByRole("heading", { name: messages.running }),
      ).toBeDefined();
      fireEvent.click(
        screen.getByRole("button", { name: messages.retryExercise }),
      );
      expect(verity.generatePuzzle).toHaveBeenCalledTimes(1);
      for (const swap of verity.solve(PREVIEW_PUZZLE) ?? []) {
        for (const selection of swap) {
          excise(selection);
        }
      }
      expect(screen.getByRole("heading", { name: messages.won })).toBeDefined();
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.timed }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: messages.retryExercise }),
      );
      expect(screen.getByRole("timer").textContent).toBe("3:30");
      expect(
        screen
          .getAllByRole("img")
          .map((image) => image.getAttribute("aria-label")),
      ).toEqual(original);
      fireEvent.click(
        screen.getByRole("button", { name: messages.newExercise }),
      );
      const next = screen
        .getAllByRole("img")
        .map((image) => image.getAttribute("aria-label"));
      expect(next).not.toEqual(original);
      act(() => {
        vi.advanceTimersByTime(210000);
      });
      expect(
        screen.getByRole("heading", { name: messages.expired }),
      ).toBeDefined();
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.untimed }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: messages.retryExercise }),
      );
      expect(
        screen
          .getAllByRole("img")
          .map((image) => image.getAttribute("aria-label")),
      ).toEqual(next);
      expect(screen.queryByRole("timer")).toBeNull();
      expect(verity.generatePuzzle).toHaveBeenCalledTimes(2);
    },
  );

  it.each(["en", "zh"] as const)(
    "%s: untimed practice survives elapsed time and applies mode changes only on restart",
    (locale) => {
      const messages = getMessages(locale);
      render(<Exercise locale={locale} />);
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.untimed }),
      );
      fireEvent.click(screen.getByRole("button", { name: messages.start }));
      expect(screen.queryByRole("timer")).toBeNull();
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByText(messages.noTimeLimit)).toBeDefined();
      const cut = describeExcise(locale, { statue: 0, shape: "circle" });
      fireEvent.click(screen.getByRole("button", { name: cut }));
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.timed }),
      );
      expect(
        screen.getByRole("button", { name: cut, pressed: true }),
      ).toBeDefined();
      act(() => {
        vi.advanceTimersByTime(600000);
      });
      expect(
        screen.getByRole("heading", { name: messages.running }),
      ).toBeDefined();
      expect(screen.queryByRole("timer")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: messages.cancel }));
      fireEvent.click(
        screen.getByRole("button", { name: messages.newExercise }),
      );
      expect(screen.getByRole("timer").textContent).toBe("3:30");
      expect(
        screen.queryByRole("button", { name: messages.cancel }),
      ).toBeNull();
      fireEvent.click(
        screen.getByRole("radio", { name: messages.practiceModes.untimed }),
      );
      act(() => {
        vi.advanceTimersByTime(210000);
      });
      expect(
        screen.getByRole("heading", { name: messages.expired }),
      ).toBeDefined();
      fireEvent.click(
        screen.getByRole("button", { name: messages.newExercise }),
      );
      expect(screen.queryByRole("timer")).toBeNull();
    },
  );
  it("requires starting a round and supports selecting and cancelling an excision", () => {
    render(<Exercise locale="en" />);
    expect(screen.getByRole("timer").textContent).toBe("3:30");
    expect(
      screen.getByRole("button", { name: "Excise Circle from Left" }),
    ).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "Start exercise" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Excise Circle from Left" }),
    );
    expect(screen.getByText("Selected · Left · Circle")).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: "Excise Circle from Left",
        pressed: true,
      }),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancel selection" }));
    expect(screen.queryByText("Selected · Left · Circle")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Cancel selection" }),
    ).toBeNull();
  });

  it("completes a round through the actual shape and statue controls", () => {
    render(<Exercise locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Start exercise" }));
    const swaps = verity.solve(PREVIEW_PUZZLE);
    if (swaps === null) {
      throw new Error("Preview puzzle must be solvable.");
    }
    for (const swap of swaps) {
      for (const selection of swap) {
        choose(selection.shape);
        fireEvent.click(
          screen.getByRole("button", { name: describeExcise("en", selection) }),
        );
      }
    }
    expect(
      screen.getByRole("heading", { name: "Room aligned. Well played." }),
    ).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(screen.getByRole("timer").textContent).toBe("3:30");
  });

  it("expires, disables dissection, and starts a fresh timer on reset", () => {
    render(<Exercise locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Start exercise" }));
    act(() => {
      vi.advanceTimersByTime(ROUND_SECONDS * 1000);
    });
    expect(screen.getByRole("heading", { name: "Time’s up." })).toBeDefined();
    expect(screen.getByRole("timer").textContent).toBe("0:00");
    expect(
      screen.getByRole("button", { name: "Excise Circle from Left" }),
    ).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "New exercise" }));
    expect(screen.getByRole("timer").textContent).toBe("3:30");
    expect(
      screen.getByRole("button", { name: "Excise Circle from Left" }),
    ).toHaveProperty("disabled", false);
  });

  it("uses only the given symbols and solids as clues throughout a round", () => {
    render(<Exercise locale="en" />);
    const givenSymbols = ["Left: Circle", "Middle: Triangle", "Right: Square"];
    for (const name of [...givenSymbols, "Sphere", "Pyramid", "Cube"]) {
      expect(screen.getByRole("img", { name })).toBeDefined();
    }
    expect(screen.getAllByRole("img")).toHaveLength(6);
    expect(screen.queryByRole("button", { name: "Show next swap" })).toBeNull();
    expect(screen.queryByRole("img", { name: /Target:/ })).toBeNull();
    expect(screen.queryByRole("img", { name: /Circle \+ Circle/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Start exercise" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Excise Circle from Left" }),
    );
    choose("square");
    fireEvent.click(
      screen.getByRole("button", { name: "Excise Square from Right" }),
    );
    expect(
      screen.getByText("Completed swaps").nextElementSibling?.textContent,
    ).toBe("01");
    expect(screen.getAllByRole("img", { name: "Cylinder" })).toHaveLength(2);
    for (const name of givenSymbols) {
      expect(screen.getByRole("img", { name })).toBeDefined();
    }
    expect(screen.getAllByRole("img")).toHaveLength(6);
    expect(screen.queryByRole("img", { name: /^Excise / })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Your swaps" })).toBeNull();
  });

  it("provides a fully translated Chinese practice flow", () => {
    render(<Exercise locale="zh" />);
    fireEvent.click(screen.getByRole("button", { name: "开始练习" }));
    expect(screen.getByRole("timer", { name: "剩余时间" }).textContent).toBe(
      "3:30",
    );
    fireEvent.click(screen.getByRole("button", { name: "从左侧雕像剖切圆形" }));
    expect(screen.getByRole("button", { name: "取消选择" })).toBeDefined();
    expect(screen.getByText("已选择 · 左侧 · 圆形")).toBeDefined();
  });
});
