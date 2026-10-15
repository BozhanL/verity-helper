import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import { inferInside, SHAPES, type Shape } from "../lib/verity";
import ShapeIcon from "./ShapeIcon";
import ShapePicker from "./ShapePicker";

export default function InsideInputs({
  locale,
  left,
  middle,
  onLeftChange,
  onMiddleChange,
}: Readonly<{
  locale: Locale;
  left: Shape | null;
  middle: Shape | null;
  onLeftChange: (shape: Shape) => void;
  onMiddleChange: (shape: Shape) => void;
}>): ReactElement {
  const messages = getMessages(locale);
  const inside =
    left !== null && middle !== null ? inferInside(left, middle) : null;
  return (
    <div className="statue-grid statue-grid--inputs">
      <ShapePicker
        legend={messages.positions[0] + " · " + messages.inside}
        label={messages.positions[0]}
        choices={SHAPES}
        value={left}
        unavailable={middle}
        locale={locale}
        onChange={onLeftChange}
      />
      <ShapePicker
        legend={messages.positions[1] + " · " + messages.inside}
        label={messages.positions[1]}
        choices={SHAPES}
        value={middle}
        unavailable={left}
        locale={locale}
        onChange={onMiddleChange}
      />
      <div className="inferred-statue">
        <span className="position-label">{messages.positions[2]}</span>
        <span className="inferred-label">{messages.inferred}</span>
        {inside === null ? (
          <span
            className="diagram-placeholder"
            role="img"
            aria-label={messages.chooseTwo}
          >
            ?
          </span>
        ) : (
          <div className="inferred-shape">
            <ShapeIcon shape={inside[2]} />
            <strong>{messages.shapes[inside[2]]}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
