// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GoalBoard, InsideBoard, SolidDisplay } from "./Board";

afterEach(cleanup);

describe("target diagrams", () => {
  it("maps each inside symbol to its complement in statue order", () => {
    render(<GoalBoard inside={["square", "circle", "triangle"]} locale="en" />);
    for (const name of [
      "Left. Inside statues: Square; Target: Cone",
      "Middle. Inside statues: Circle; Target: Prism",
      "Right. Inside statues: Triangle; Target: Cylinder",
    ]) {
      expect(screen.getByRole("img", { name })).toBeDefined();
    }
  });

  it("provides Chinese descriptions for the visual rule guide", () => {
    render(
      <GoalBoard
        inside={["circle", "triangle", "square"]}
        locale="zh"
        showPositions={false}
      />,
    );
    for (const name of [
      "内场雕像: 圆形; 目标图形: 三棱柱",
      "内场雕像: 三角形; 目标图形: 圆柱",
      "内场雕像: 正方形; 目标图形: 圆锥",
    ]) {
      expect(screen.getByRole("img", { name })).toBeDefined();
    }
  });
});

describe("practice board displays", () => {
  it.each([
    {
      locale: "en",
      labels: ["Left: Square", "Middle: Circle", "Right: Triangle"],
    },
    { locale: "zh", labels: ["左侧: 正方形", "中间: 圆形", "右侧: 三角形"] },
  ] as const)(
    "shows only the given inside symbols in $locale",
    ({ locale, labels }) => {
      render(
        <InsideBoard
          inside={["square", "circle", "triangle"]}
          locale={locale}
        />,
      );
      for (const name of labels) {
        expect(screen.getByRole("img", { name })).toBeDefined();
      }
      expect(screen.getAllByRole("img")).toHaveLength(3);
    },
  );

  it("names a practice solid accessibly without revealing its components", () => {
    render(
      <SolidDisplay
        pair={["circle", "triangle"]}
        locale="en"
        showDetails={false}
      />,
    );
    expect(screen.getByRole("img", { name: "Cone" })).toBeDefined();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByText("Cone")).toBeNull();
    expect(screen.queryByRole("img", { name: "Circle + Triangle" })).toBeNull();
  });
});
