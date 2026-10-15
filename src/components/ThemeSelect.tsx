import { useEffect, useRef, useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  applyTheme,
  isThemePreference,
  readThemePreference,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "../lib/theme";

export default function ThemeSelect({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);
  const currentPreference = useRef<ThemePreference>("system");

  useEffect(() => {
    function synchronize(): void {
      const stored = readThemePreference();
      currentPreference.current = stored;
      setPreference(stored);
      applyTheme(stored);
    }
    function handleSystemChange(): void {
      applyTheme(currentPreference.current);
    }
    function handleStorage(event: StorageEvent): void {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        synchronize();
      }
    }
    synchronize();
    setReady(true);
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorage);
    return (): void => {
      media.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <label className="theme-select">
      <span>{messages.theme}</span>
      <select
        disabled={!ready}
        value={preference}
        onChange={(event) => {
          const next = event.currentTarget.value;
          if (!isThemePreference(next)) {
            return;
          }
          currentPreference.current = next;
          setPreference(next);
          applyTheme(next);
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // Theme selection still works when browser storage is unavailable.
          }
        }}
      >
        {THEME_PREFERENCES.map((theme) => (
          <option key={theme} value={theme}>
            {messages.themes[theme]}
          </option>
        ))}
      </select>
    </label>
  );
}
