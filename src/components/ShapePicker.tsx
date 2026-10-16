import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import { CONTROL_PROPS } from "./controlProps";
import ShapeIcon, { type IconShape } from "./ShapeIcon";
import { useHydrated } from "./useHydrated";

interface Props<T extends IconShape> {
  legend: string;
  label?: string;
  solids?: boolean;
  choices: readonly T[];
  value: T | null;
  unavailable?: T | null;
  disabled?: boolean;
  names?: Partial<Record<IconShape, string>>;
  accessibleNames?: Partial<Record<IconShape, string>>;
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
  disabled = false,
  names,
  accessibleNames,
  locale,
  onChange,
}: Readonly<Props<T>>): ReactElement {
  const hydrated = useHydrated();
  const messages = getMessages(locale);
  const labels = { ...messages.shapes, ...messages.solids, ...names };
  return (
    <fieldset className="shape-picker" aria-label={legend}>
      <legend>{label ?? legend}</legend>
      <RadioGroup.Root
        disabled={!hydrated || disabled}
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
            {...CONTROL_PROPS}
            key={shape}
            value={shape}
            className="shape-choice"
            aria-label={accessibleNames?.[shape]}
            disabled={shape === unavailable}
          >
            <ShapeIcon shape={shape} />
            <span>{labels[shape]}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </fieldset>
  );
}
