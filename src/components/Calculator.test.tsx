// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
    expect(screen.getByText("Select your room")).toBeDefined();
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
