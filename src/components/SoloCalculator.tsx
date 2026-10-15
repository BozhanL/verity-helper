import * as RadioGroup from "@radix-ui/react-radio-group";
import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  inferInside,
  planSoloTransfers,
  SHAPES,
  STATUES,
  type Shape,
  type SoloPlan,
  type Statue,
  type Triple,
} from "../lib/verity";
import InsideInputs from "./InsideInputs";
import ShapeIcon from "./ShapeIcon";
import ShapePicker from "./ShapePicker";

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
              {own ? messages.soloKeep : messages.soloGive}
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
}: Readonly<{
  locale: Locale;
  inside: Triple<Shape> | null;
  self: Statue | null;
  first: Shape | null;
  second: Shape | null;
}>): ReactElement {
  const messages = getMessages(locale);
  if (inside === null || self === null || first === null || second === null) {
    return (
      <div className="empty-state">
        <ShapeIcon shape="circle" />
        <h3>{messages.soloIncomplete}</h3>
      </div>
    );
  }
  const plan = planSoloTransfers(inside, self, [first, second]);
  if (plan === null) {
    return (
      <div className="feedback feedback--error" role="alert">
        <h3>{messages.invalid}</h3>
      </div>
    );
  }
  return (
    <Distribution locale={locale} inside={inside} self={self} plan={plan} />
  );
}

export default function SoloCalculator({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const [left, setLeft] = useState<Shape | null>(null);
  const [middle, setMiddle] = useState<Shape | null>(null);
  const [self, setSelf] = useState<Statue | null>(null);
  const [first, setFirst] = useState<Shape | null>(null);
  const [second, setSecond] = useState<Shape | null>(null);
  const inside =
    left !== null && middle !== null ? inferInside(left, middle) : null;
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
  }

  return (
    <div className="tool">
      <div className="calculator-inputs">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-number">01</span>
              <h2>{messages.inside}</h2>
            </div>
            <button
              className="text-button"
              type="button"
              aria-label={messages.resetInside}
              onClick={resetInside}
            >
              {messages.resetShort}
            </button>
          </div>
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
              disabled={inside === null}
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
          <div className="panel-heading">
            <div>
              <span className="panel-number">02</span>
              <h2>{messages.soloRoomShapes}</h2>
            </div>
            <button
              className="text-button"
              type="button"
              aria-label={messages.soloResetRoom}
              onClick={resetRoom}
            >
              {messages.resetShort}
            </button>
          </div>
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
      <section
        className="panel solution-panel"
        aria-live="polite"
        aria-atomic="false"
        aria-labelledby="solo-distribution-heading"
      >
        <div className="panel-heading">
          <div>
            <span className="panel-number">03</span>
            <h2 id="solo-distribution-heading">{messages.soloDistribution}</h2>
          </div>
          <button
            className="text-button"
            type="button"
            aria-label={messages.reset}
            onClick={resetAll}
          >
            {messages.resetShort}
          </button>
        </div>
        <SoloResult
          locale={locale}
          inside={inside}
          self={self}
          first={first}
          second={second}
        />
      </section>
    </div>
  );
}
