// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getMessages } from "../i18n/messages";
import Calculator from "./Calculator";

afterEach(cleanup);

function choose(group: string, shape: string): void {
  fireEvent.click(
    within(screen.getByRole("group", { name: group })).getByRole("radio", {
      name: shape,
    }),
  );
}

function chooseInside(): void {
  choose("Left · Inside statues", "Circle");
  choose("Middle · Inside statues", "Triangle");
}

describe("calculator controls", () => {
  it.each(["en", "zh"] as const)(
    "%s: marks complete swaps in order, ignores repeated marks, and undoes without changing the plan",
    (locale) => {
      const messages = getMessages(locale);
      const { container } = render(<Calculator locale={locale} />);
      choose(
        messages.positions[0] + " · " + messages.inside,
        messages.shapes.circle,
      );
      choose(
        messages.positions[1] + " · " + messages.inside,
        messages.shapes.triangle,
      );
      choose(
        messages.positions[0] + " · " + messages.outside,
        messages.solids.sphere,
      );
      choose(
        messages.positions[1] + " · " + messages.outside,
        messages.solids.pyramid,
      );
      function mark(step: number): HTMLElement {
        return screen.getByRole("button", {
          name: messages.markSwapDone.replace("{step}", String(step)),
        });
      }
      function progress(done: number): string {
        return messages.swapProgress
          .replace("{done}", String(done))
          .replace("{total}", "3");
      }
      const instructions = Array.from(
        container.querySelectorAll(".swap-instruction, .after-swap"),
        (element) => element.outerHTML,
      );
      expect(mark(2)).toHaveProperty("disabled", true);
      fireEvent.click(mark(2));
      expect(screen.getByText(progress(0))).toBeDefined();
      fireEvent.click(mark(1));
      fireEvent.click(mark(1));
      expect(screen.getByText(progress(1))).toBeDefined();
      expect(
        container.querySelector('[aria-current="step"] h3')?.textContent,
      ).toBe(messages.swap + " 2");
      fireEvent.click(
        screen.getByRole("button", { name: messages.undoSwapMark }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: messages.undoSwapMark }),
      );
      expect(screen.getByText(progress(0))).toBeDefined();
      for (const step of [1, 2, 3]) {
        fireEvent.click(mark(step));
      }
      expect(screen.getByText(messages.allSwapsMarked)).toBeDefined();
      expect(container.querySelector('[aria-current="step"]')).toBeNull();
      expect(
        Array.from(
          container.querySelectorAll(".swap-instruction, .after-swap"),
          (element) => element.outerHTML,
        ),
      ).toEqual(instructions);
      fireEvent.click(
        screen.getByRole("button", { name: messages.undoSwapMark }),
      );
      expect(screen.queryByText(messages.allSwapsMarked)).toBeNull();
      expect(mark(3)).toHaveProperty("disabled", false);
    },
  );

  it("clears stale progress on valid corrections, invalid input, and resets", () => {
    const messages = getMessages("en");
    render(<Calculator locale="en" />);
    chooseInside();
    choose("Left · Outside solids", "Sphere");
    choose("Middle · Outside solids", "Pyramid");
    function mark(): void {
      fireEvent.click(screen.getByRole("button", { name: "Mark swap 1 done" }));
    }
    function expectFresh(): void {
      expect(
        screen.getByRole("button", { name: "Mark swap 1 done" }),
      ).toHaveProperty("disabled", false);
      expect(
        screen.getByRole("button", { name: messages.undoSwapMark }),
      ).toHaveProperty("disabled", true);
    }
    mark();
    choose("Left · Outside solids", "Sphere");
    expect(screen.getByText("Marked 1 of 3 swaps")).toBeDefined();
    choose("Left · Outside solids", "Cube");
    expectFresh();
    mark();
    choose("Left · Inside statues", "Square");
    expectFresh();
    mark();
    choose("Left · Outside solids", "Pyramid");
    expect(screen.getByRole("alert")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: messages.undoSwapMark }),
    ).toBeNull();
    choose("Left · Outside solids", "Sphere");
    expectFresh();
    for (const reset of [
      messages.resetOutside,
      messages.resetInside,
      messages.reset,
    ]) {
      mark();
      fireEvent.click(screen.getByRole("button", { name: reset }));
      expect(
        screen.queryByRole("button", { name: messages.undoSwapMark }),
      ).toBeNull();
      chooseInside();
      choose("Left · Outside solids", "Sphere");
      choose("Middle · Outside solids", "Pyramid");
      expectFresh();
    }
  });

  it("calculates and resets a three-swap room", () => {
    render(<Calculator locale="en" />);
    chooseInside();
    choose("Left · Outside solids", "Sphere");
    choose("Middle · Outside solids", "Pyramid");
    expect(screen.getByText("3 swaps")).toBeDefined();
    expect(screen.getAllByRole("heading", { name: /^Swap \d$/ })).toHaveLength(
      3,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset selections" }));
    expect(
      screen.getByText("Choose the Left and Middle inside symbols."),
    ).toBeDefined();
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
  });

  it("reports impossible solids separately from an already solved room", () => {
    render(<Calculator locale="en" />);
    chooseInside();
    choose("Left · Outside solids", "Sphere");
    choose("Middle · Outside solids", "Sphere");
    expect(
      within(screen.getByRole("alert")).getByRole("img", {
        name: "Exactly two circles, two triangles, and two squares.",
      }),
    ).toBeDefined();
    choose("Left · Outside solids", "Prism");
    choose("Middle · Outside solids", "Cylinder");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Already aligned.")).toBeDefined();
  });

  it("selects identical solids independently and prevents duplicate inside symbols", () => {
    render(<Calculator locale="en" />);
    chooseInside();
    expect(
      within(
        screen.getByRole("group", { name: "Middle · Inside statues" }),
      ).getByRole("radio", { name: "Circle" }),
    ).toHaveProperty("disabled", true);
    choose("Left · Outside solids", "Cone");
    choose("Middle · Outside solids", "Cone");
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("2 swaps")).toBeDefined();
    for (const position of ["Left", "Middle"]) {
      expect(
        within(
          screen.getByRole("group", { name: position + " · Outside solids" }),
        ).getByRole("radio", { name: "Cone", checked: true }),
      ).toBeDefined();
    }
    choose("Left · Outside solids", "Prism");
    expect(
      within(
        screen.getByRole("group", { name: "Middle · Outside solids" }),
      ).getByRole("radio", { name: "Cone", checked: true }),
    ).toBeDefined();
    choose("Middle · Outside solids", "Cylinder");
    expect(
      within(
        screen.getByRole("group", { name: "Left · Outside solids" }),
      ).getByRole("radio", { name: "Prism", checked: true }),
    ).toBeDefined();
    expect(screen.getByText("Already aligned.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Reset outside" }));
    for (const position of ["Left", "Middle"]) {
      expect(
        within(
          screen.getByRole("group", { name: position + " · Outside solids" }),
        ).queryAllByRole("radio", { checked: true }),
      ).toHaveLength(0);
    }
    expect(
      within(
        screen.getByRole("group", { name: "Left · Inside statues" }),
      ).getByRole("radio", { name: "Circle", checked: true }),
    ).toBeDefined();
  });

  it("renders controls, errors, and results in Simplified Chinese", () => {
    render(<Calculator locale="zh" />);
    choose("左侧 · 内场雕像", "圆形");
    choose("中间 · 内场雕像", "三角形");
    choose("左侧 · 外场立体图形", "球体");
    choose("中间 · 外场立体图形", "球体");
    expect(screen.getByRole("alert").textContent).toContain("图形组合无效");
    choose("中间 · 外场立体图形", "三角锥");
    expect(screen.getByText("3 次交换")).toBeDefined();
    expect(
      screen.getAllByRole("img", { name: /从左侧雕像剖切圆形/ }),
    ).toHaveLength(2);
  });
});
