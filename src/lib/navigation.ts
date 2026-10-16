import type { Page } from "../i18n/messages";

export const PAGE_PATHS: Record<Page, string> = {
  home: "",
  repository: "repository",
  calculator: "verity",
  solo: "verity/solo",
  exercise: "verity/exercise",
};

export const VERITY_PAGES = ["calculator", "solo", "exercise"] as const;

export function getEncounter(page: Page): "repository" | "verity" | null {
  if (page === "home") {
    return null;
  }
  return page === "repository" ? "repository" : "verity";
}
