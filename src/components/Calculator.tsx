import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  inferInside,
  inferOutside,
  SOLIDS,
  solve,
  type Board,
  type Shape,
  type Solid,
  type Triple,
} from "../lib/verity";
import { MiniBoard, ShapeBudget, SolidDisplay } from "./Board";
import { CONTROL_PROPS } from "./controlProps";
import InsideInputs from "./InsideInputs";
import Sequence from "./Sequence";
import ShapeIcon from "./ShapeIcon";
import ShapePicker from "./ShapePicker";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

interface ResultProps {
  locale: Locale;
  inside: Triple<Shape> | null;
  left: Solid | null;
  middle: Solid | null;
  outside: Board | null;
}

function Result({
  locale,
  inside,
  left,
  middle,
  outside,
}: Readonly<ResultProps>): ReactElement {
  const messages = getMessages(locale);
  if (inside === null || left === null || middle === null) {
    return (
      <div className="empty-state">
        <ShapeIcon shape="prism" />
        <h3>
          {inside === null ? messages.incomplete : messages.outsideIncomplete}
        </h3>
      </div>
    );
  }
  const swaps = outside === null ? null : solve({ inside, outside });
  if (outside === null || swaps === null) {
    return (
      <div className="feedback feedback--error" role="alert">
        <h3>{messages.invalid}</h3>
        <p id="outside-error">{messages.outsideInvalid}</p>
        <ShapeBudget locale={locale} />
      </div>
    );
  }
  if (swaps.length === 0) {
    return (
      <div className="feedback feedback--success">
        <h3>{messages.solved}</h3>
        <MiniBoard board={outside} locale={locale} />
      </div>
    );
  }
  return (
    <>
      <div className="solution-summary">
        <span className="status-dot" />
        <strong>
          {swaps.length} {messages.swaps}
        </strong>
        <span>·</span>
        <span>
          {swaps.length * 2} {messages.excisions}
        </span>
      </div>
      <Sequence swaps={swaps} board={outside} locale={locale} />
    </>
  );
}

export default function Calculator({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  const [leftShape, setLeftShape] = useState<Shape | null>(null);
  const [middleShape, setMiddleShape] = useState<Shape | null>(null);
  const [leftSolid, setLeftSolid] = useState<Solid | null>(null);
  const [middleSolid, setMiddleSolid] = useState<Solid | null>(null);
  const inside =
    leftShape !== null && middleShape !== null
      ? inferInside(leftShape, middleShape)
      : null;
  const outside =
    leftSolid !== null && middleSolid !== null
      ? inferOutside(leftSolid, middleSolid)
      : null;

  const outsidePlaceholder =
    leftSolid !== null && middleSolid !== null
      ? messages.inferenceError
      : messages.chooseTwo;

  function resetInside(): void {
    setLeftShape(null);
    setMiddleShape(null);
  }

  function resetOutside(): void {
    setLeftSolid(null);
    setMiddleSolid(null);
  }

  return (
    <div className="tool">
      <ToolReadiness locale={locale} />
      <div className="calculator-inputs" id="dissection-inputs" tabIndex={-1}>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-number">01</span>
              <h2>{messages.inside}</h2>
            </div>
            <button
              {...CONTROL_PROPS}
              className="text-button"
              type="button"
              aria-label={messages.resetInside}
              disabled={!hydrated}
              onClick={resetInside}
            >
              {messages.resetShort}
            </button>
          </div>
          <InsideInputs
            locale={locale}
            left={leftShape}
            middle={middleShape}
            onLeftChange={setLeftShape}
            onMiddleChange={setMiddleShape}
          />
        </section>
        <section
          className="panel"
          aria-describedby={
            inside !== null &&
            leftSolid !== null &&
            middleSolid !== null &&
            outside === null
              ? "outside-error"
              : undefined
          }
        >
          <div className="panel-heading">
            <div>
              <span className="panel-number">02</span>
              <h2>{messages.outside}</h2>
            </div>
            <button
              {...CONTROL_PROPS}
              className="text-button"
              type="button"
              aria-label={messages.resetOutside}
              disabled={!hydrated}
              onClick={resetOutside}
            >
              {messages.resetShort}
            </button>
          </div>
          <ShapeBudget locale={locale} />
          <div className="statue-grid statue-grid--inputs">
            <ShapePicker
              legend={messages.positions[0] + " · " + messages.outside}
              label={messages.positions[0]}
              choices={SOLIDS}
              solids
              value={leftSolid}
              locale={locale}
              onChange={setLeftSolid}
            />
            <ShapePicker
              legend={messages.positions[1] + " · " + messages.outside}
              label={messages.positions[1]}
              choices={SOLIDS}
              solids
              value={middleSolid}
              locale={locale}
              onChange={setMiddleSolid}
            />
            <div className="inferred-statue">
              <span className="position-label">{messages.positions[2]}</span>
              <span className="inferred-label">{messages.inferred}</span>
              {outside === null ? (
                <span
                  className="diagram-placeholder"
                  role="img"
                  aria-label={outsidePlaceholder}
                >
                  {leftSolid !== null && middleSolid !== null ? "!" : "?"}
                </span>
              ) : (
                <SolidDisplay pair={outside[2]} locale={locale} />
              )}
            </div>
          </div>
        </section>
      </div>
      {inside !== null && leftSolid !== null && middleSolid !== null && (
        <div className="result-links">
          <a href="#dissection-result">{messages.viewResult} ↓</a>
        </div>
      )}
      <section
        className="panel solution-panel"
        id="dissection-result"
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="false"
        aria-labelledby="dissection-heading"
      >
        <div className="panel-heading">
          <div>
            <span className="panel-number">03</span>
            <h2 id="dissection-heading">{messages.solution}</h2>
          </div>
          <div className="result-actions">
            <a className="text-button" href="#dissection-inputs">
              {messages.editInputs}
            </a>
            <button
              {...CONTROL_PROPS}
              className="text-button"
              type="button"
              aria-label={messages.reset}
              disabled={!hydrated}
              onClick={() => {
                resetInside();
                resetOutside();
              }}
            >
              {messages.resetShort}
            </button>
          </div>
        </div>
        <Result
          locale={locale}
          inside={inside}
          left={leftSolid}
          middle={middleSolid}
          outside={outside}
        />
      </section>
    </div>
  );
}
