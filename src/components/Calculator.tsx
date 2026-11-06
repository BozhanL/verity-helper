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
import InsideInputs from "./InsideInputs";
import PanelHeading from "./PanelHeading";
import ResetButton from "./ResetButton";
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
      <Sequence
        key={JSON.stringify([inside, outside])}
        swaps={swaps}
        board={outside}
        locale={locale}
      />
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
  const inside = inferInside(leftShape, middleShape);
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
          <PanelHeading number="01" title={messages.inside}>
            <ResetButton
              locale={locale}
              label={messages.resetInside}
              disabled={!hydrated}
              onClick={resetInside}
            />
          </PanelHeading>
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
          <PanelHeading number="02" title={messages.outside}>
            <ResetButton
              locale={locale}
              label={messages.resetOutside}
              disabled={!hydrated}
              onClick={resetOutside}
            />
          </PanelHeading>
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
        <PanelHeading
          number="03"
          title={messages.solution}
          titleId="dissection-heading"
        >
          <div className="result-actions">
            <a className="text-button" href="#dissection-inputs">
              {messages.editInputs}
            </a>
            <ResetButton
              locale={locale}
              disabled={!hydrated}
              onClick={() => {
                resetInside();
                resetOutside();
              }}
            />
          </div>
        </PanelHeading>
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
