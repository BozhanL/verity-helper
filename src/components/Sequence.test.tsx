// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { describeExcise, getMessages } from "../i18n/messages";
import { STATUES, type Swap } from "../lib/verity";
import { SwapInstruction } from "./Sequence";

afterEach(cleanup);

describe("spatial swap diagrams", () => {
  it.each([
    [0, 1],
    [1, 0],
    [0, 2],
    [2, 0],
    [1, 2],
    [2, 1],
  ] as const)(
    "places cuts from statues %i and %i in fixed left-to-right slots",
    (first, second) => {
      const swap: Swap = [
        { statue: first, shape: "circle" },
        { statue: second, shape: "triangle" },
      ];
      render(<SwapInstruction swap={swap} locale="en" />);
      const diagram = screen.getByRole("img", {
        name:
          describeExcise("en", swap[0]) + "; " + describeExcise("en", swap[1]),
      });
      expect(
        Array.from(
          diagram.querySelectorAll(".position-label"),
          (label) => label.textContent,
        ),
      ).toEqual(["Left", "Middle", "Right"]);

      for (const statue of STATUES) {
        const box = screen.getByText(
          getMessages("en").positions[statue],
        ).nextElementSibling;
        if (statue === first) {
          expect(box?.getAttribute("title")).toBe(
            describeExcise("en", swap[0]),
          );
          expect(box?.querySelector("svg circle")).toBeTruthy();
          expect(box?.textContent).toBe("1");
        } else if (statue === second) {
          expect(box?.getAttribute("title")).toBe(
            describeExcise("en", swap[1]),
          );
          expect(box?.querySelector("svg path")).toBeTruthy();
          expect(box?.textContent).toBe("2");
        } else {
          expect(box?.childElementCount).toBe(0);
          expect(box?.textContent).toBe("");
        }
      }
    },
  );

  it("localizes the fixed positions and cut descriptions in Chinese", () => {
    render(
      <SwapInstruction
        swap={[
          { statue: 2, shape: "triangle" },
          { statue: 1, shape: "square" },
        ]}
        locale="zh"
      />,
    );
    const diagram = screen.getByRole("img", {
      name: "从右侧雕像剖切三角形; 从中间雕像剖切正方形",
    });
    expect(
      Array.from(
        diagram.querySelectorAll(".position-label"),
        (label) => label.textContent,
      ),
    ).toEqual(["左侧", "中间", "右侧"]);
    expect(
      screen.getByText("右侧").nextElementSibling?.getAttribute("title"),
    ).toBe("从右侧雕像剖切三角形");
    expect(screen.getByText("中间").nextElementSibling?.textContent).toBe("2");
    expect(screen.getByText("左侧").nextElementSibling?.childElementCount).toBe(
      0,
    );
  });
});
