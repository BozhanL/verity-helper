// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import SiteHeader from "./SiteHeader";

afterEach(cleanup);

it("keeps page and language navigation on the matching localized routes", () => {
  render(
    <SiteHeader
      locale="zh"
      page="exercise"
      links={{
        calculator: "/preview/zh/",
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
