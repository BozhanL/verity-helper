// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { afterEach, expect, it } from "vitest";
import { SHAPES, type Shape } from "../lib/verity";
import ShapePicker from "./ShapePicker";

afterEach(cleanup);
function Picker(): ReactElement {
  const [value, setValue] = useState<Shape | null>(null);
  return (
    <ShapePicker
      legend="Shapes"
      choices={SHAPES}
      value={value}
      unavailable="triangle"
      locale="en"
      onChange={setValue}
    />
  );
}

it("uses radio semantics and skips unavailable shapes during keyboard navigation", async () => {
  render(<Picker />);
  const circle = screen.getByRole("radio", { name: "Circle" });
  expect(circle.getAttribute("aria-checked")).toBe("false");
  act(() => {
    circle.focus();
  });
  fireEvent.keyDown(circle, { key: "ArrowRight" });
  await waitFor(() => {
    expect(
      screen
        .getByRole("radio", { name: "Square" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
  expect(screen.getByRole("radio", { name: "Triangle" })).toHaveProperty(
    "disabled",
    true,
  );
});
