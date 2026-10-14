import type { ReactElement } from "react";
import { getMessages, PAGES, type Locale, type Page } from "../i18n/messages";
import ShapeIcon from "./ShapeIcon";

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
  return (
    <header className="site-header">
      <a href={links.calculator} className="brand">
        <span className="brand-icon">
          <ShapeIcon shape="prism" />
        </span>
        <span>
          <strong>{messages.brand}</strong>
          <small>{messages.subtitle}</small>
        </span>
      </a>
      <nav className="page-navigation" aria-label={messages.navigation}>
        {PAGES.map((tool) => (
          <a
            key={tool}
            href={links[tool]}
            aria-current={page === tool ? "page" : undefined}
          >
            {messages[tool]}
          </a>
        ))}
      </nav>
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
    </header>
  );
}
