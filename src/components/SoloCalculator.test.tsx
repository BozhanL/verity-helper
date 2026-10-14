// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getMessages, type Locale } from "../i18n/messages";
import type { Shape } from "../lib/verity";
import SoloCalculator from "./SoloCalculator";

afterEach(cleanup);

function choose(group: string, name: string): void {
  fireEvent.click(
    within(screen.getByRole("group", { name: group })).getByRole("radio", {
      name,
    }),
  );
}

function chooseStatues(locale: Locale = "en"): void {
  const messages = getMessages(locale);
  choose(
    messages.positions[0] + " · " + messages.inside,
    messages.shapes.circle,
  );
  choose(
    messages.positions[1] + " · " + messages.inside,
    messages.shapes.triangle,
  );
}

function chooseRoom(first: Shape, second: Shape, locale: Locale = "en"): void {
  const messages = getMessages(locale);
  choose(messages.soloFirstShape, messages.shapes[first]);
  choose(messages.soloSecondShape, messages.shapes[second]);
}

function selectSelf(): void {
  fireEvent.click(
    screen.getByRole("radio", { name: "Your statue: Right (Square)" }),
  );
}

describe("solo-room calculator", () => {
  it("requires an explicit player position as well as the statue and room shapes", () => {
    render(<SoloCalculator locale="en" />);
    expect(
      screen.getByRole("radio", { name: "Your statue: Right" }),
    ).toHaveProperty("disabled", true);
    chooseStatues();
    chooseRoom("triangle", "square");
    const result = within(
      screen.getByRole("region", { name: "Shape distribution" }),
    );
    expect(result.queryByRole("img", { name: /^Give / })).toBeNull();
    selectSelf();
    expect(
      result.getByRole("img", { name: "Give Triangle to Left (Circle)" }),
    ).toBeDefined();
  });

  it.each([
    {
      first: "triangle",
      second: "square",
      give: [
        "Give Triangle to Left (Circle)",
        "Give Square to Middle (Triangle)",
      ],
      keep: "Nothing to keep",
    },
    {
      first: "square",
      second: "square",
      give: [
        "Give Square to Left (Circle)",
        "Give Square to Middle (Triangle)",
      ],
      keep: "Nothing to keep",
    },
    {
      first: "circle",
      second: "circle",
      give: ["Give Circle to Middle (Triangle)"],
      keep: "Keep Circle",
    },
  ] as const)(
    "shows correct gifts and retention for $first / $second",
    ({ first, second, give, keep }) => {
      render(<SoloCalculator locale="en" />);
      chooseStatues();
      selectSelf();
      chooseRoom(first, second);
      const result = within(
        screen.getByRole("region", { name: "Shape distribution" }),
      );
      for (const name of give) {
        expect(result.getByRole("img", { name })).toBeDefined();
      }
      expect(
        result.getByRole("img", { name: "You; Right: Square; " + keep }),
      ).toBeDefined();
      expect(result.getAllByRole("img")).toHaveLength(3);
    },
  );

  it("recalculates recipients when the statue order changes", () => {
    render(<SoloCalculator locale="en" />);
    chooseStatues();
    selectSelf();
    chooseRoom("circle", "circle");
    choose("Middle · Inside statues", "Square");
    choose("Left · Inside statues", "Triangle");
    const result = within(
      screen.getByRole("region", { name: "Shape distribution" }),
    );
    expect(
      result.getByRole("img", { name: "Give Circle to Left (Triangle)" }),
    ).toBeDefined();
    expect(
      result.getByRole("img", { name: "Give Circle to Middle (Square)" }),
    ).toBeDefined();
    expect(
      result.getByRole("img", { name: "You; Right: Circle; Nothing to keep" }),
    ).toBeDefined();
  });

  it("resets room inputs independently and clears identity when resetting statues", () => {
    render(<SoloCalculator locale="en" />);
    chooseStatues();
    selectSelf();
    chooseRoom("circle", "circle");
    fireEvent.click(screen.getByRole("button", { name: "Reset room shapes" }));
    expect(
      screen.getByRole("radio", {
        name: "Your statue: Right (Square)",
        checked: true,
      }),
    ).toBeDefined();
    expect(
      within(
        screen.getByRole("group", { name: "First room shape" }),
      ).queryAllByRole("radio", { checked: true }),
    ).toHaveLength(0);
    chooseRoom("square", "square");
    fireEvent.click(screen.getByRole("button", { name: "Reset inside" }));
    expect(
      screen.getByRole("radio", { name: "Your statue: Right" }),
    ).toHaveProperty("disabled", true);
    chooseStatues();
    expect(
      within(screen.getByRole("group", { name: "Your statue" })).queryAllByRole(
        "radio",
        { checked: true },
      ),
    ).toHaveLength(0);
    selectSelf();
    expect(
      screen.getByRole("img", { name: "Give Square to Middle (Triangle)" }),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Reset selections" }));
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
  });

  it("provides the same distribution and controls in Simplified Chinese", () => {
    render(<SoloCalculator locale="zh" />);
    chooseStatues("zh");
    fireEvent.click(
      screen.getByRole("radio", { name: "你的雕像: 右侧 (正方形)" }),
    );
    chooseRoom("triangle", "square", "zh");
    const result = within(screen.getByRole("region", { name: "图形分配" }));
    expect(
      result.getByRole("img", { name: "把三角形给左侧雕像（圆形）" }),
    ).toBeDefined();
    expect(
      result.getByRole("img", { name: "把正方形给中间雕像（三角形）" }),
    ).toBeDefined();
    expect(
      result.getByRole("img", { name: "你; 右侧: 正方形; 无需保留图形" }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "重置房间图形" })).toBeDefined();
  });
});
