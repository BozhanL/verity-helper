import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import { useHydrated } from "./useHydrated";

export default function ToolReadiness({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  return (
    <p className="readiness" role="status">
      {hydrated ? messages.controlsReady : messages.controlsLoading}
    </p>
  );
}
