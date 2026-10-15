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
        calculator: "/preview/zh/",
        solo: "/preview/zh/solo/",
        exercise: "/preview/zh/exercise/",
        en: "/preview/exercise/",
        zh: "/preview/zh/exercise/",
      }}
    />,
  );
  const pages = within(screen.getByRole("navigation", { name: "主导航" }));
  expect(
    pages.getByRole("link", { name: "练习" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(pages.getByRole("link", { name: "计算器" }).getAttribute("href")).toBe(
    "/preview/zh/",
  );
  const languages = within(screen.getByRole("navigation", { name: "语言" }));
  expect(
    languages.getByRole("link", { name: "English" }).getAttribute("href"),
  ).toBe("/preview/exercise/");
  expect(
    languages.getByRole("link", { name: "简体中文" }).getAttribute("href"),
  ).toBe("/preview/zh/exercise/");
});

it.each([
  {
    locale: "en",
    navigation: "Main navigation",
    language: "Language",
    solo: "Solo room",
    prefix: "",
  },
  {
    locale: "zh",
    navigation: "主导航",
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
          calculator: "/preview/" + prefix,
          solo: "/preview/" + prefix + "solo/",
          exercise: "/preview/" + prefix + "exercise/",
          en: "/preview/solo/",
          zh: "/preview/zh/solo/",
        }}
      />,
    );
    const pages = within(screen.getByRole("navigation", { name: navigation }));
    const link = pages.getByRole("link", { name: solo });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("href")).toBe("/preview/" + prefix + "solo/");
    const languages = within(
      screen.getByRole("navigation", { name: language }),
    );
    expect(
      languages.getByRole("link", { name: "English" }).getAttribute("href"),
    ).toBe("/preview/solo/");
    expect(
      languages.getByRole("link", { name: "简体中文" }).getAttribute("href"),
    ).toBe("/preview/zh/solo/");
  },
);
