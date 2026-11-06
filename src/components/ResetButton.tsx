import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import { CONTROL_PROPS } from "./controlProps";

export default function ResetButton({
  locale,
  label,
  disabled,
  onClick,
}: Readonly<{
  locale: Locale;
  label?: string;
  disabled: boolean;
  onClick: () => void;
}>): ReactElement {
  const messages = getMessages(locale);
  return (
    <button
      {...CONTROL_PROPS}
      className="text-button"
      type="button"
      aria-label={label ?? messages.reset}
      disabled={disabled}
      onClick={onClick}
    >
      {messages.resetShort}
    </button>
  );
}
