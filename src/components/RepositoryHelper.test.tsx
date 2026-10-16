// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import { getMessages, type Locale } from "../i18n/messages";
import { PLATES } from "../lib/repository";
import RepositoryHelper from "./RepositoryHelper";

afterEach(cleanup);

function select(group: string, name: string): void {
  fireEvent.click(
    within(screen.getByRole("radiogroup", { name: group })).getByRole("radio", {
      name,
    }),
  );
}

function setup(locale: Locale = "en"): void {
  const messages = getMessages(locale);
  select(messages.repositoryTool.startPlate, messages.positions[0]);
  select(messages.repositoryTool.room, messages.repositoryTool.rooms[3]);
}

function callout(
  plate: 0 | 1 | 2,
  shape: "circle" | "triangle" | "square",
  locale: Locale = "en",
): void {
  const messages = getMessages(locale);
  select(
    messages.positions[plate] + " · " + messages.repositoryTool.conductor,
    messages.repositoryTool.resonances[shape],
  );
}

it("server-renders disabled inputs and exposes visible readiness after hydration", () => {
  const html = renderToString(<RepositoryHelper locale="en" />);
  expect(html).toContain("Loading controls…");
  expect(html).toMatch(/role="radio"[^>]*disabled=""/u);
  render(<RepositoryHelper locale="en" />);
  expect(screen.getByRole("status").textContent).toBe("Controls ready.");
  expect(screen.getAllByRole("radio")[0]).toHaveProperty("disabled", false);
});

it.each(["en", "zh"] as const)(
  "guides receiving and closing with the correct senders in %s",
  (locale) => {
    const messages = getMessages(locale);
    const text = messages.repositoryTool;
    render(<RepositoryHelper locale={locale} />);
    expect(
      within(screen.getByRole("radiogroup", { name: text.held })).getAllByRole(
        "radio",
      )[0],
    ).toHaveProperty("disabled", true);
    setup(locale);
    const receiving = within(
      screen.getByRole("region", { name: text.receive }),
    );
    expect(
      receiving.getByRole("heading", {
        name: text.receiveAt.replace("{position}", messages.positions[1]),
      }),
    ).toBeDefined();
    expect(receiving.getByRole("paragraph").textContent).toBe(
      text.askSender.replace("{position}", messages.positions[0]),
    );
    callout(0, "square", locale);
    callout(1, "circle", locale);
    expect(
      screen.getByRole("img", {
        name:
          messages.positions[2] +
          " · " +
          text.conductor +
          ": " +
          text.resonances.triangle +
          " (" +
          messages.inferred +
          ")",
      }),
    ).toBeDefined();
    select(text.held, text.resonances.triangle);
    const closing = within(screen.getByRole("region", { name: text.closing }));
    expect(
      closing.getByRole("heading", {
        name: text.closeAt.replace("{position}", messages.positions[2]),
      }),
    ).toBeDefined();
    expect(closing.getByRole("paragraph").textContent).toBe(
      text.askSender.replace("{position}", messages.positions[1]),
    );
  },
);

it.each(PLATES)(
  "lets conductor %i be inferred and changes which callout is inferred",
  (missing) => {
    const messages = getMessages("en");
    const text = messages.repositoryTool;
    const shapes = ["square", "circle", "triangle"] as const;
    render(<RepositoryHelper locale="en" />);
    setup();
    const explicit = PLATES.filter((plate) => plate !== missing);
    for (const plate of explicit) {
      callout(plate, shapes[plate]);
    }
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(
      screen.queryByRole("radiogroup", {
        name: messages.positions[missing] + " · " + text.conductor,
      }),
    ).toBeNull();
    const cleared = explicit[0];
    if (cleared === undefined) {
      throw new Error("Two explicit callouts are required.");
    }
    fireEvent.click(
      screen.getByRole("button", {
        name: text.clearConductor.replace(
          "{position}",
          messages.positions[cleared],
        ),
      }),
    );
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    callout(missing, shapes[missing]);
    expect(
      screen.queryByRole("radiogroup", {
        name: messages.positions[cleared] + " · " + text.conductor,
      }),
    ).toBeNull();
  },
);

it("blocks duplicate callouts, recalculates corrections, and preserves inputs when changing assignments", () => {
  const text = getMessages("en").repositoryTool;
  render(<RepositoryHelper locale="en" />);
  setup();
  callout(0, "square");
  const middle = within(
    screen.getByRole("radiogroup", { name: "Middle · " + text.conductor }),
  );
  expect(
    middle.getByRole("radio", { name: text.resonances.square }),
  ).toHaveProperty("disabled", true);
  callout(1, "circle");
  select(text.held, text.resonances.circle);
  expect(
    screen.getByRole("heading", {
      name: "Stay at the Middle end plate to close",
    }),
  ).toBeDefined();
  callout(0, "triangle");
  expect(screen.getByRole("img").textContent).toContain(text.resonances.square);
  select(text.startPlate, "Middle");
  expect(
    screen.getByRole("heading", { name: "Receive at the Right end plate" }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Close at the Middle end plate" }),
  ).toBeDefined();
  expect(
    middle
      .getByRole("radio", { name: text.resonances.circle })
      .getAttribute("data-state"),
  ).toBe("checked");
});

it("preserves the start plate across room changes and fully resets all selections", () => {
  const text = getMessages("en").repositoryTool;
  render(<RepositoryHelper locale="en" />);
  setup();
  callout(0, "square");
  callout(1, "circle");
  select(text.held, text.resonances.triangle);
  select(text.room, text.rooms[2]);
  expect(
    within(screen.getByRole("radiogroup", { name: text.startPlate })).getByRole(
      "radio",
      { checked: true },
    ).textContent,
  ).toBe("Left");
  expect(
    within(screen.getByRole("radiogroup", { name: text.held })).queryAllByRole(
      "radio",
      { checked: true },
    ),
  ).toHaveLength(0);
  expect(screen.queryAllByRole("img")).toHaveLength(0);
  expect(
    screen.getByRole("region", { name: text.closing }).textContent,
  ).toContain(text.chooseClosing);
  fireEvent.click(screen.getByRole("button", { name: "Reset selections" }));
  expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
  expect(
    screen.getByRole("region", { name: text.receive }).textContent,
  ).toContain(text.chooseRoute);
});
