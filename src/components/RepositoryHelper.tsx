import * as RadioGroup from "@radix-ui/react-radio-group";
import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  getClosureTarget,
  getEndPlate,
  inferConductors,
  PLATES,
  ROOMS,
  type ConductorCallouts,
  type Plate,
  type Room,
} from "../lib/repository";
import { SHAPES, type Shape } from "../lib/verity";
import { CONTROL_PROPS } from "./controlProps";
import ShapeIcon from "./ShapeIcon";
import ShapePicker from "./ShapePicker";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

function positionText(template: string, plate: Plate, locale: Locale): string {
  return template.replace("{position}", getMessages(locale).positions[plate]);
}

function positionInstruction(
  template: string,
  plate: Plate,
  locale: Locale,
): ReactElement {
  const [before, after] = template.split("{position}");
  return (
    <>
      {before}
      <strong className="plate-location">
        {getMessages(locale).positions[plate]}
      </strong>
      {after}
    </>
  );
}

function NumberPicker<T extends number>({
  legend,
  choices,
  value,
  disabled,
  onChange,
}: Readonly<{
  legend: string;
  choices: readonly { value: T; label: string }[];
  value: T | null;
  disabled: boolean;
  onChange: (value: T) => void;
}>): ReactElement {
  return (
    <fieldset className="shape-picker" aria-label={legend}>
      <legend>{legend}</legend>
      <RadioGroup.Root
        className="plate-options"
        aria-label={legend}
        value={value === null ? "" : String(value)}
        disabled={disabled}
        onValueChange={(next) => {
          const choice = choices.find((item) => String(item.value) === next);
          if (choice !== undefined) {
            onChange(choice.value);
          }
        }}
      >
        {choices.map((choice) => (
          <RadioGroup.Item
            {...CONTROL_PROPS}
            key={choice.value}
            value={String(choice.value)}
            className="solo-position"
          >
            {choice.label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </fieldset>
  );
}

function ConductorInputs({
  locale,
  callouts,
  disabled,
  onChange,
}: Readonly<{
  locale: Locale;
  callouts: ConductorCallouts;
  disabled: boolean;
  onChange: (plate: Plate, shape: Shape | null) => void;
}>): ReactElement {
  const messages = getMessages(locale);
  const text = messages.repositoryTool;
  const conductors = inferConductors(callouts);
  return (
    <div className="conductor-grid">
      {PLATES.map((plate) => {
        const inferred =
          callouts[plate] === null ? conductors?.[plate] : undefined;
        return (
          <div className="conductor-card" key={plate}>
            <div className="conductor-heading">
              <h3>{messages.positions[plate]}</h3>
              {inferred === undefined ? (
                <button
                  {...CONTROL_PROPS}
                  className="text-button"
                  type="button"
                  disabled={disabled || callouts[plate] === null}
                  aria-label={positionText(text.clearConductor, plate, locale)}
                  onClick={() => {
                    onChange(plate, null);
                  }}
                >
                  {text.clear}
                </button>
              ) : (
                <span className="inferred-label">{messages.inferred}</span>
              )}
            </div>
            {inferred === undefined ? (
              <ShapePicker<Shape>
                legend={messages.positions[plate] + " · " + text.conductor}
                label={text.conductor}
                choices={SHAPES}
                value={callouts[plate]}
                locale={locale}
                accessibleNames={text.resonances}
                disabled={disabled}
                unavailable={
                  callouts.find(
                    (shape, index) => index !== plate && shape !== null,
                  ) ?? null
                }
                onChange={(shape) => {
                  onChange(plate, shape);
                }}
              />
            ) : (
              <figure
                className="inferred-resonance"
                role="img"
                aria-label={
                  messages.positions[plate] +
                  " · " +
                  text.conductor +
                  ": " +
                  text.resonances[inferred] +
                  " (" +
                  messages.inferred +
                  ")"
                }
              >
                <ShapeIcon shape={inferred} />
                <figcaption>{messages.shapes[inferred]}</figcaption>
              </figure>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClosingGuidance({
  locale,
  start,
  room,
  callouts,
  held,
}: Readonly<{
  locale: Locale;
  start: Plate | null;
  room: Room | null;
  callouts: ConductorCallouts;
  held: Shape | null;
}>): ReactElement {
  const text = getMessages(locale).repositoryTool;
  const conductors = inferConductors(callouts);
  if (room === null || start === null) {
    return <p className="helper-note">{text.chooseRoute}</p>;
  }
  const target =
    conductors !== null && held !== null
      ? getClosureTarget(room, conductors, held)
      : null;
  if (target === null) {
    return <p className="helper-note">{text.chooseClosing}</p>;
  }
  return (
    <div className="plate-guidance plate-guidance--closing">
      {held !== null && <ShapeIcon shape={held} />}
      <h3>
        {positionInstruction(
          target.end === getEndPlate(room, start) ? text.stayAt : text.closeAt,
          target.end,
          locale,
        )}
      </h3>
      <p>{positionInstruction(text.askSender, target.start, locale)}</p>
    </div>
  );
}

export default function RepositoryHelper({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const text = getMessages(locale).repositoryTool;
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  const [start, setStart] = useState<Plate | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [callouts, setCallouts] = useState<ConductorCallouts>([
    null,
    null,
    null,
  ]);
  const [held, setHeld] = useState<Shape | null>(null);
  const setupReady = start !== null && room !== null;
  const end = setupReady ? getEndPlate(room, start) : null;

  function changeRoom(next: Room): void {
    if (next !== room) {
      setRoom(next);
      setCallouts([null, null, null]);
      setHeld(null);
    }
  }

  function changeCallout(plate: Plate, shape: Shape | null): void {
    setCallouts((previous) => [
      plate === 0 ? shape : previous[0],
      plate === 1 ? shape : previous[1],
      plate === 2 ? shape : previous[2],
    ]);
  }

  function reset(): void {
    setStart(null);
    setRoom(null);
    setCallouts([null, null, null]);
    setHeld(null);
  }

  return (
    <div className="tool repository-tool">
      <div className="repository-intro">
        <p className="helper-note">{text.orientation}</p>
        <ToolReadiness locale={locale} />
      </div>
      <section className="panel" aria-labelledby="repository-setup-heading">
        <div className="panel-heading">
          <div>
            <span className="panel-number">01</span>
            <h2 id="repository-setup-heading">{text.setup}</h2>
          </div>
          <button
            {...CONTROL_PROPS}
            className="text-button"
            type="button"
            disabled={!hydrated}
            onClick={reset}
            aria-label={messages.reset}
          >
            {messages.resetShort}
          </button>
        </div>
        <div className="calculator-inputs">
          <NumberPicker
            legend={text.startPlate}
            value={start}
            disabled={!hydrated}
            choices={PLATES.map((plate) => ({
              value: plate,
              label: messages.positions[plate],
            }))}
            onChange={setStart}
          />
          <NumberPicker
            legend={text.room}
            value={room}
            disabled={!hydrated}
            choices={ROOMS.map((number) => ({
              value: number,
              label: text.rooms[number],
            }))}
            onChange={changeRoom}
          />
        </div>
        <section
          className="receive-guidance"
          aria-labelledby="receive-heading"
          aria-live="polite"
        >
          <h2 id="receive-heading">{text.receive}</h2>
          {end === null || start === null ? (
            <p className="helper-note">{text.chooseRoute}</p>
          ) : (
            <div className="plate-guidance">
              <h3>{positionInstruction(text.receiveAt, end, locale)}</h3>
              <p>{positionInstruction(text.askSender, start, locale)}</p>
            </div>
          )}
        </section>
      </section>
      <section
        className="panel"
        id="repository-callouts"
        aria-labelledby="conductors-heading"
      >
        <div className="panel-heading">
          <div>
            <span className="panel-number">02</span>
            <h2 id="conductors-heading">{text.conductors}</h2>
          </div>
        </div>
        <p className="helper-note">{text.calloutsHint}</p>
        <ConductorInputs
          locale={locale}
          callouts={callouts}
          disabled={!hydrated || !setupReady}
          onChange={changeCallout}
        />
        <details className="resonance-key">
          <summary>{text.resonanceNames}</summary>
          <ul>
            {SHAPES.map((shape) => (
              <li key={shape}>
                <ShapeIcon shape={shape} />
                {text.resonances[shape]}
              </li>
            ))}
          </ul>
        </details>
      </section>
      <div className="repository-closing">
        <section className="panel" aria-labelledby="held-heading">
          <div className="panel-heading">
            <div>
              <span className="panel-number">03</span>
              <h2 id="held-heading">{text.held}</h2>
            </div>
          </div>
          <ShapePicker
            legend={text.held}
            choices={SHAPES}
            value={held}
            locale={locale}
            accessibleNames={text.resonances}
            disabled={!setupReady}
            onChange={setHeld}
          />
          <p className="helper-note">{text.heldHint}</p>
        </section>
        <section
          className="panel solution-panel"
          aria-labelledby="closing-heading"
          aria-live="polite"
        >
          <div className="panel-heading">
            <div>
              <span className="panel-number">04</span>
              <h2 id="closing-heading">{text.closing}</h2>
            </div>
          </div>
          <ClosingGuidance
            locale={locale}
            start={start}
            room={room}
            callouts={callouts}
            held={held}
          />
        </section>
      </div>
    </div>
  );
}
