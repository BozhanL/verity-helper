import type { ReactElement } from "react";
import { getMessages, type Locale, type Page } from "../i18n/messages";
import { getEncounter, VERITY_PAGES } from "../lib/navigation";
import ShapeIcon from "./ShapeIcon";
import ThemeSelect from "./ThemeSelect";

interface Props {
  locale: Locale;
  page: Page;
  links: Record<Page | Locale, string>;
}

export default function SiteHeader({
  locale,
  page,
  links,
}: Readonly<Props>): ReactElement {
  const messages = getMessages(locale);
  const encounter = getEncounter(page);
  return (
    <header className="site-header">
      <a href={links.home} className="brand" aria-label={messages.brand}>
        <span className="brand-icon">
          <ShapeIcon shape="prism" />
        </span>
        <span>
          <strong>{messages.brand}</strong>
          <small>{messages.subtitle}</small>
        </span>
      </a>
      <div className="site-navigation">
        <nav className="page-navigation" aria-label={messages.navigation}>
          <a
            href={links.repository}
            aria-current={encounter === "repository" ? "page" : undefined}
          >
            {messages.repositoryEncounter}
          </a>
          <a
            href={links.calculator}
            aria-current={encounter === "verity" ? "location" : undefined}
          >
            {messages.verityEncounter}
          </a>
        </nav>
        {encounter === "verity" && (
          <nav
            className="page-navigation tool-navigation"
            aria-label={messages.toolNavigation}
          >
            {VERITY_PAGES.map((tool) => (
              <a
                key={tool}
                href={links[tool]}
                aria-current={page === tool ? "page" : undefined}
              >
                {messages[tool]}
              </a>
            ))}
          </nav>
        )}
      </div>
      <div className="header-controls">
        <nav className="language-navigation" aria-label={messages.language}>
          <a
            href={links.en}
            lang="en"
            hrefLang="en"
            aria-label="English"
            aria-current={locale === "en" ? "page" : undefined}
          >
            EN
          </a>
          <span aria-hidden="true">/</span>
          <a
            href={links.zh}
            lang="zh-Hans"
            hrefLang="zh-Hans"
            aria-current={locale === "zh" ? "page" : undefined}
          >
            简体中文
          </a>
        </nav>
        <ThemeSelect locale={locale} />
      </div>
    </header>
  );
}
