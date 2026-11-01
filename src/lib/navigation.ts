import type { Page } from "../i18n/messages";

export const PAGE_PATHS: Record<Page, string> = {
  home: "",
  substratum: "substratum",
  substratumChecklist: "substratum/checklist",
  repository: "repository",
  calculator: "verity",
  solo: "verity/solo",
  exercise: "verity/exercise",
};

export const VERITY_PAGES = ["calculator", "solo", "exercise"] as const;

export const SUBSTRATUM_PAGES = ["substratum", "substratumChecklist"] as const;

export function getEncounter(
  page: Page,
): "substratum" | "repository" | "verity" | null {
  if (page === "substratum" || page === "substratumChecklist") {
    return "substratum";
  }
  if (page === "home") {
    return null;
  }
  return page === "repository" ? "repository" : "verity";
}
