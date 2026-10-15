// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "../lib/theme";
import ThemeSelect from "./ThemeSelect";

let media: EventTarget & { matches: boolean };
beforeEach(() => {
  media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
  localStorage.clear();
  document.head.innerHTML = '<meta name="theme-color" content="#f6f7fb">';
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
});

it("restores a saved theme and updates the document and browser color", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "dark");
  render(<ThemeSelect locale="en" />);
  expect(screen.getByRole("combobox", { name: "Theme" })).toHaveProperty(
    "value",
    "dark",
  );
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(document.documentElement.style.colorScheme).toBe("dark");
  expect(
    document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  ).toBe("#151624");
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "light" },
  });
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  expect(document.documentElement.dataset.theme).toBe("light");
});

it("follows device changes only when System is selected", () => {
  render(<ThemeSelect locale="en" />);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "light" },
  });
  media.dispatchEvent(new Event("change"));
  expect(document.documentElement.dataset.theme).toBe("light");
});

it("synchronizes preferences changed in another tab", () => {
  render(<ThemeSelect locale="en" />);
  localStorage.setItem(THEME_STORAGE_KEY, "dark");
  fireEvent(
    window,
    new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "dark" }),
  );
  expect(screen.getByRole("combobox")).toHaveProperty("value", "dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  localStorage.clear();
  fireEvent(window, new StorageEvent("storage", { key: null }));
  expect(screen.getByRole("combobox")).toHaveProperty("value", "system");
});

it("uses System for invalid preferences and translates the control", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "invalid");
  render(<ThemeSelect locale="zh" />);
  expect(screen.getByRole("combobox", { name: "\u4e3b\u9898" })).toHaveProperty(
    "value",
    "system",
  );
  expect(screen.getByRole("option", { name: "\u6df1\u8272" })).toBeDefined();
});

it("keeps manual selection working when storage is denied", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Denied", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Denied", "SecurityError");
  });
  render(<ThemeSelect locale="en" />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "dark" } });
  expect(document.documentElement.dataset.theme).toBe("dark");
  media.dispatchEvent(new Event("change"));
  expect(document.documentElement.dataset.theme).toBe("dark");
});
