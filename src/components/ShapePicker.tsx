import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import ShapeIcon, { type IconShape } from "./ShapeIcon";
import { useHydrated } from "./useHydrated";

interface Props<T extends IconShape> {
  legend: string;
  label?: string;
  solids?: boolean;
  choices: readonly T[];
  value: T | null;
  unavailable?: T | null;
  locale: Locale;
  onChange: (shape: T) => void;
}

export default function ShapePicker<T extends IconShape>({
  legend,
  label,
  solids = false,
  choices,
  value,
  unavailable,
  locale,
  onChange,
}: Readonly<Props<T>>): ReactElement {
  const hydrated = useHydrated();
  const messages = getMessages(locale);
  const names = { ...messages.shapes, ...messages.solids };
  return (
    <fieldset className="shape-picker" aria-label={legend}>
      <legend>{label ?? legend}</legend>
      <RadioGroup.Root
        disabled={!hydrated}
        aria-label={legend}
        value={value ?? ""}
        onValueChange={(next) => {
          const choice = choices.find((shape) => shape === next);
          if (choice !== undefined) {
            onChange(choice);
          }
        }}
        className={
          solids ? "shape-options shape-options--solids" : "shape-options"
        }
      >
        {choices.map((shape) => (
          <RadioGroup.Item
            key={shape}
            value={shape}
            className="shape-choice"
            disabled={shape === unavailable}
          >
            <ShapeIcon shape={shape} />
            <span>{names[shape]}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </fieldset>
  );
}
