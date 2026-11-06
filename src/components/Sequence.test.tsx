// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { describeExcise, getMessages } from "../i18n/messages";
import { STATUES, type Swap } from "../lib/verity";
import { SwapInstruction } from "./Sequence";

afterEach(cleanup);

const ORDERED_STATUE_PAIRS = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 2],
  [2, 1],
] as const;

describe("spatial swap diagrams", () => {
  it.each(ORDERED_STATUE_PAIRS)(
    "keeps statues %i and %i directly markable with accessible names and checkmarks",
    (first, second) => {
      const swap: Swap = [
        { statue: first, shape: "circle" },
        { statue: second, shape: "triangle" },
      ];
      const onMark = vi.fn();
      const messages = getMessages("en");
      const { rerender } = render(
        <SwapInstruction
          swap={swap}
          locale="en"
          controls={{ step: 2, disabled: false, marks: [false, false], onMark }}
        />,
      );
      const diagram = screen.getByRole("group", { name: "Swap 2" });
      expect(within(diagram).getAllByRole("button")).toHaveLength(2);
      function button(index: 0 | 1): HTMLElement {
        return within(diagram).getByRole("button", {
          name: messages.markSelectionDone
            .replace("{step}", "2")
            .replace("{selection}", String(index + 1))
            .replace("{cut}", describeExcise("en", swap[index])),
        });
      }
      for (const index of [0, 1] as const) {
        const tile = button(index);
        expect(tile.previousElementSibling?.textContent).toBe(
          messages.positions[swap[index].statue],
        );
        fireEvent.click(tile);
        expect(onMark).toHaveBeenLastCalledWith(index);
      }
      rerender(
        <SwapInstruction
          swap={swap}
          locale="en"
          controls={{ step: 2, disabled: true, marks: [true, false], onMark }}
        />,
      );
      expect(button(0).querySelector(".cut-number")?.textContent).toBe("✓");
      expect(button(1).querySelector(".cut-number")?.textContent).toBe("2");
      expect(button(0).getAttribute("aria-pressed")).toBe("true");
      for (const index of [0, 1] as const) {
        expect(button(index)).toHaveProperty("disabled", true);
        expect(button(index).querySelector("svg")).not.toBeNull();
      }
    },
  );

  it.each(ORDERED_STATUE_PAIRS)(
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
