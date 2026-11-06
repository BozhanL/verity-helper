import * as RadioGroup from "@radix-ui/react-radio-group";
import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  inferInside,
  planSoloAfterTrades,
  planSoloTransfers,
  SHAPES,
  SOLO_PHASES,
  STATUES,
  type Shape,
  type SoloPhase,
  type SoloPlan,
  type Statue,
  type Triple,
} from "../lib/verity";
import { SolidDisplay } from "./Board";
import { CONTROL_PROPS } from "./controlProps";
import InsideInputs from "./InsideInputs";
import PanelHeading from "./PanelHeading";
import ResetButton from "./ResetButton";
import ShapeIcon from "./ShapeIcon";
import ShapePicker from "./ShapePicker";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

function selfLabel(
  locale: Locale,
  statue: Statue,
  inside: Triple<Shape> | null,
): string {
  const messages = getMessages(locale);
  return (
    messages.soloStatue +
    ": " +
    messages.positions[statue] +
    (inside === null ? "" : " (" + messages.shapes[inside[statue]] + ")")
  );
}

function distributionLabel(
  locale: Locale,
  inside: Triple<Shape>,
  self: Statue,
  statue: Statue,
  shape: Shape | undefined,
): string {
  const messages = getMessages(locale);
  if (statue === self) {
    let action = messages.soloNothingToKeep;
    if (shape !== undefined) {
      action = messages.soloKeep + " " + messages.shapes[shape];
    }
    return (
      messages.soloYou +
      "; " +
      messages.positions[statue] +
      ": " +
      messages.shapes[inside[statue]] +
      "; " +
      action
    );
  }
  let instruction = messages.soloNothingToGive;
  if (shape !== undefined) {
    instruction = messages.soloGiveInstruction.replace(
      "{shape}",
      messages.shapes[shape],
    );
  }
  return instruction
    .replace("{position}", messages.positions[statue])
    .replace("{symbol}", messages.shapes[inside[statue]]);
}

function Distribution({
  locale,
  inside,
  self,
  plan,
}: Readonly<{
  locale: Locale;
  inside: Triple<Shape>;
  self: Statue;
  plan: SoloPlan;
}>): ReactElement {
  const messages = getMessages(locale);
  return (
    <div className="statue-grid">
      {STATUES.map((statue) => {
        const own = statue === self;
        const shape = own
          ? plan.keep[0]
          : plan.give.find((transfer) => transfer.statue === statue)?.shape;
        const label = distributionLabel(locale, inside, self, statue, shape);
        const action = own ? messages.soloKeep : messages.soloGive;
        const emptyAction = own
          ? messages.soloNothingToKeep
          : messages.soloNothingToSend;
        return (
          <figure
            key={statue}
            className={"solo-recipient" + (own ? " solo-recipient--you" : "")}
            role="img"
            aria-label={label}
          >
            <figcaption className="solo-recipient-heading">
              <span className="position-label">
                {messages.positions[statue]}
              </span>
              {own && <span className="solo-you">{messages.soloYou}</span>}
            </figcaption>
            <div className="solo-statue-symbol" aria-hidden="true">
              <ShapeIcon shape={inside[statue]} />
              <span>{messages.shapes[inside[statue]]}</span>
            </div>
            <span className="solo-action-label">
              {shape === undefined ? emptyAction : action}
            </span>
            <span
              className={
                "solo-gift" + (shape === undefined ? " solo-gift--empty" : "")
              }
              aria-hidden="true"
            >
              {shape === undefined ? "—" : <ShapeIcon shape={shape} />}
            </span>
          </figure>
        );
      })}
    </div>
  );
}

function SoloResult({
  locale,
  inside,
  self,
  first,
  second,
  phase,
}: Readonly<{
  locale: Locale;
  inside: Triple<Shape> | null;
  self: Statue | null;
  first: Shape | null;
  second: Shape | null;
  phase: SoloPhase;
}>): ReactElement {
  const messages = getMessages(locale);
  let incomplete = messages.soloChooseRoom;
  if (inside === null) {
    incomplete = messages.soloChooseStatues;
  } else if (self === null) {
    incomplete = messages.soloChooseSelf;
  }
  if (inside === null || self === null || first === null || second === null) {
    return (
      <div className="empty-state">
        <ShapeIcon shape="circle" />
        <h3>{incomplete}</h3>
      </div>
    );
  }
  const plan =
    phase === "opening"
      ? planSoloTransfers(inside, self, [first, second])
      : planSoloAfterTrades(inside, self, [first, second]);
  if (plan === null) {
    return (
      <div className="feedback feedback--error" role="alert">
        <h3>
          {phase === "opening" ? messages.invalid : messages.soloAfterTitle}
        </h3>
        <p>
          {phase === "opening"
            ? messages.soloInvalid
            : messages.soloAfterInvalid}
        </p>
      </div>
    );
  }
  if (plan.keep.length === 2) {
    return (
      <div className="feedback feedback--success">
        <h3>{messages.soloKeyReady}</h3>
        <SolidDisplay pair={[first, second]} locale={locale} />
        <p>{messages.soloKeyHint}</p>
      </div>
    );
  }
  return (
    <>
      <Distribution locale={locale} inside={inside} self={self} plan={plan} />
      {phase === "after" && (
        <p className="input-hint">{messages.soloTradeHint}</p>
      )}
    </>
  );
}

export default function SoloCalculator({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  const [left, setLeft] = useState<Shape | null>(null);
  const [middle, setMiddle] = useState<Shape | null>(null);
  const [self, setSelf] = useState<Statue | null>(null);
  const [first, setFirst] = useState<Shape | null>(null);
  const [second, setSecond] = useState<Shape | null>(null);
  const [phase, setPhase] = useState<SoloPhase>("opening");
  const inside = inferInside(left, middle);
  function resetInside(): void {
    setLeft(null);
    setMiddle(null);
    setSelf(null);
  }

  function resetRoom(): void {
    setFirst(null);
    setSecond(null);
  }

  function resetAll(): void {
    resetInside();
    resetRoom();
    setPhase("opening");
  }

  return (
    <div className="tool">
      <ToolReadiness locale={locale} />
      <div className="calculator-inputs" id="solo-inputs" tabIndex={-1}>
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
            left={left}
            middle={middle}
            onLeftChange={setLeft}
            onMiddleChange={setMiddle}
          />
          <fieldset
            className="shape-picker solo-identity"
            aria-label={messages.soloStatue}
          >
            <legend>{messages.soloStatue}</legend>
            <RadioGroup.Root
              className="solo-positions"
              aria-label={messages.soloStatue}
              value={self === null ? "" : String(self)}
              disabled={!hydrated || inside === null}
              onValueChange={(value) => {
                const statue = STATUES.find(
                  (candidate) => String(candidate) === value,
                );
                if (statue !== undefined) {
                  setSelf(statue);
                }
              }}
            >
              {STATUES.map((statue) => (
                <RadioGroup.Item
                  {...CONTROL_PROPS}
                  key={statue}
                  value={String(statue)}
                  className="solo-position"
                  aria-label={selfLabel(locale, statue, inside)}
                >
                  <span>{messages.positions[statue]}</span>
                  {inside === null ? (
                    <span aria-hidden="true">?</span>
                  ) : (
                    <ShapeIcon shape={inside[statue]} />
                  )}
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
          </fieldset>
        </section>
        <section className="panel">
          <PanelHeading number="02" title={messages.soloRoomShapes}>
            <ResetButton
              locale={locale}
              label={messages.soloResetRoom}
              disabled={!hydrated}
              onClick={resetRoom}
            />
          </PanelHeading>
          <fieldset
            className="shape-picker solo-phase"
            aria-label={messages.soloPhase}
          >
            <legend>{messages.soloPhase}</legend>
            <RadioGroup.Root
              className="solo-shape-inputs"
              aria-label={messages.soloPhase}
              aria-describedby="solo-phase-hint"
              value={phase}
              disabled={!hydrated}
              onValueChange={(value) => {
                const next = SOLO_PHASES.find(
                  (candidate) => candidate === value,
                );
                if (next !== undefined) {
                  setPhase(next);
                  resetRoom();
                }
              }}
            >
              {SOLO_PHASES.map((option) => (
                <RadioGroup.Item
                  {...CONTROL_PROPS}
                  key={option}
                  value={option}
                  className="solo-position"
                >
                  {messages.soloPhases[option]}
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
            <p className="input-hint" id="solo-phase-hint">
              {phase === "opening"
                ? messages.soloOpeningHint
                : messages.soloAfterHint}
            </p>
            <p className="input-hint">
              {messages.soloStrategy}{" "}
              <a href="https://sites.google.com/view/travelerschosen/guides/salvations-edge/verity">
                {messages.soloReference}
              </a>
            </p>
          </fieldset>
          <div className="solo-shape-inputs">
            <ShapePicker
              legend={messages.soloFirstShape}
              choices={SHAPES}
              value={first}
              locale={locale}
              onChange={setFirst}
            />
            <ShapePicker
              legend={messages.soloSecondShape}
              choices={SHAPES}
              value={second}
              locale={locale}
              onChange={setSecond}
            />
          </div>
        </section>
      </div>
      {inside !== null &&
        self !== null &&
        first !== null &&
        second !== null && (
          <div className="result-links">
            <a href="#solo-result">{messages.viewResult} ↓</a>
          </div>
        )}
      <section
        className="panel solution-panel"
        id="solo-result"
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="false"
        aria-labelledby="solo-distribution-heading"
      >
        <PanelHeading
          number="03"
          title={messages.soloDistribution}
          titleId="solo-distribution-heading"
        >
          <div className="result-actions">
            <a className="text-button" href="#solo-inputs">
              {messages.editInputs}
            </a>
            <ResetButton
              locale={locale}
              disabled={!hydrated}
              onClick={resetAll}
            />
          </div>
        </PanelHeading>
        <SoloResult
          locale={locale}
          inside={inside}
          self={self}
          first={first}
          second={second}
          phase={phase}
        />
      </section>
    </div>
  );
}
