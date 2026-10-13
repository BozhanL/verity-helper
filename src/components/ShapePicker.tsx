import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import ShapeIcon, { type IconShape } from "./ShapeIcon";

interface Props<T extends IconShape> {
  legend: string;
  label?: string;
  choices: readonly T[];
  value: T | null;
  unavailable?: T | null;
  locale: Locale;
  onChange: (shape: T) => void;
}

export default function ShapePicker<T extends IconShape>({
  legend,
  label,
  choices,
  value,
  unavailable,
  locale,
  onChange,
}: Readonly<Props<T>>): ReactElement {
  const messages = getMessages(locale);
  const names = { ...messages.shapes, ...messages.solids };
  return (
    <fieldset className="shape-picker" aria-label={legend}>
      <legend>{label ?? legend}</legend>
      <div
        className={
          choices.length > 3
            ? "shape-options shape-options--solids"
            : "shape-options"
        }
      >
        {choices.map((shape) => (
          <button
            key={shape}
            type="button"
            className="shape-choice"
            aria-pressed={value === shape}
            disabled={shape === unavailable}
            onClick={() => {
              onChange(shape);
            }}
          >
            <ShapeIcon shape={shape} />
            <span>{names[shape]}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
