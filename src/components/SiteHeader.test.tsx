// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SiteHeader from "./SiteHeader";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () =>
    Object.assign(new EventTarget(), { matches: false }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("keeps page and language navigation on the matching localized routes", () => {
  render(
    <SiteHeader
      locale="zh"
      page="exercise"
      links={{
        home: "/preview/zh/",
        repository: "/preview/zh/repository/",
        calculator: "/preview/zh/verity/",
        solo: "/preview/zh/verity/solo/",
        exercise: "/preview/zh/verity/exercise/",
        en: "/preview/verity/exercise/",
        zh: "/preview/zh/verity/exercise/",
      }}
    />,
  );
  const pages = within(screen.getByRole("navigation", { name: "真理工具" }));
  expect(
    pages.getByRole("link", { name: "练习" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(pages.getByRole("link", { name: "剖切" }).getAttribute("href")).toBe(
    "/preview/zh/verity/",
  );
  const languages = within(screen.getByRole("navigation", { name: "语言" }));
  expect(
    languages.getByRole("link", { name: "English" }).getAttribute("href"),
  ).toBe("/preview/verity/exercise/");
  expect(
    languages.getByRole("link", { name: "简体中文" }).getAttribute("href"),
  ).toBe("/preview/zh/verity/exercise/");
});

it.each([
  {
    locale: "en",
    navigation: "Verity tools",
    language: "Language",
    solo: "Solo room",
    prefix: "",
  },
  {
    locale: "zh",
    navigation: "真理工具",
    language: "语言",
    solo: "单人房",
    prefix: "zh/",
  },
] as const)(
  "keeps solo navigation and language links for $locale",
  ({ locale, navigation, language, solo, prefix }) => {
    render(
      <SiteHeader
        locale={locale}
        page="solo"
        links={{
          home: "/preview/" + prefix,
          repository: "/preview/" + prefix + "repository/",
          calculator: "/preview/" + prefix + "verity/",
          solo: "/preview/" + prefix + "verity/solo/",
          exercise: "/preview/" + prefix + "verity/exercise/",
          en: "/preview/verity/solo/",
          zh: "/preview/zh/verity/solo/",
        }}
      />,
    );
    const pages = within(screen.getByRole("navigation", { name: navigation }));
    const link = pages.getByRole("link", { name: solo });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("href")).toBe(
      "/preview/" + prefix + "verity/solo/",
    );
    const languages = within(
      screen.getByRole("navigation", { name: language }),
    );
    expect(
      languages.getByRole("link", { name: "English" }).getAttribute("href"),
    ).toBe("/preview/verity/solo/");
    expect(
      languages.getByRole("link", { name: "简体中文" }).getAttribute("href"),
    ).toBe("/preview/zh/verity/solo/");
  },
);
