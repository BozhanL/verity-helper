import { useEffect, useReducer, useState, type ReactElement } from "react";
import { describeExcise, getMessages, type Locale } from "../i18n/messages";
import {
  canExcise,
  createPracticeState,
  formatTime,
  practiceReducer,
  ROUND_SECONDS,
  type PracticeState,
} from "../lib/practice";
import { generatePuzzle, SHAPES, STATUES, type Shape } from "../lib/verity";
import { InsideBoard, SolidDisplay } from "./Board";
import ShapePicker from "./ShapePicker";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

function RoundStatus({
  state,
  locale,
}: Readonly<{ state: PracticeState; locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const titles = {
    ready: messages.ready,
    running: messages.running,
    won: messages.won,
    expired: messages.expired,
  };
  const classes = {
    ready: "round-status",
    running: "round-status",
    won: "round-status round-status--won",
    expired: "round-status round-status--expired",
  };
  return (
    <div className={classes[state.phase]} role="status">
      <span className="status-dot" />
      <div>
        <h2>{titles[state.phase]}</h2>
      </div>
    </div>
  );
}

export default function Exercise({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  const [state, dispatch] = useReducer(
    practiceReducer,
    undefined,
    createPracticeState,
  );
  const [selectedShape, setSelectedShape] = useState<Shape>("circle");
  const running = state.phase === "running";

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const timer = globalThis.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 250);
    return (): void => {
      globalThis.clearInterval(timer);
    };
  }, [running]);

  function startRound(): void {
    setSelectedShape("circle");
    dispatch({ type: "start", puzzle: generatePuzzle(), now: Date.now() });
  }

  return (
    <div className="tool">
      <ToolReadiness locale={locale} />
      <section className="panel">
        <div className="round-toolbar">
          <div
            className={
              "timer " + (state.remaining <= 30 ? "timer--urgent" : "")
            }
          >
            <span>{messages.remaining}</span>
            <strong role="timer" aria-label={messages.remaining}>
              {formatTime(state.remaining)}
            </strong>
          </div>
          <div className="round-metric">
            <span>{messages.completedSwaps}</span>
            <strong>{state.swaps.length.toString().padStart(2, "0")}</strong>
          </div>
          <button
            type="button"
            className={
              "button " + (running ? "button--secondary" : "button--primary")
            }
            disabled={!hydrated}
            onClick={startRound}
          >
            {state.phase === "ready" ? messages.start : messages.newExercise}
          </button>
        </div>
        <progress
          className="round-progress"
          max={ROUND_SECONDS}
          value={state.remaining}
          aria-label={messages.remaining}
        />
        <RoundStatus state={state} locale={locale} />
      </section>
      <div className="exercise-layout">
        <aside className="panel exercise-controls">
          <ShapePicker
            legend={messages.currentShape}
            choices={SHAPES}
            value={selectedShape}
            locale={locale}
            onChange={setSelectedShape}
          />
          {state.pending !== null && (
            <div className="selection-feedback" role="status">
              <p>
                {messages.selected} · {messages.positions[state.pending.statue]}{" "}
                · {messages.shapes[state.pending.shape]}
              </p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  dispatch({ type: "cancel" });
                }}
              >
                {messages.cancel}
              </button>
            </div>
          )}
        </aside>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-number">01</span>
              <h2>{messages.outside}</h2>
            </div>
          </div>
          <div className="statue-grid outside-board">
            {STATUES.map((statue) => {
              const pending = state.pending?.statue === statue;
              const selection = { statue, shape: selectedShape };
              const labelSelection = pending ? state.pending : selection;
              return (
                <div
                  className={
                    "practice-statue " +
                    (pending ? "practice-statue--selected" : "")
                  }
                  key={statue}
                >
                  <span className="position-label">
                    {messages.positions[statue]}
                  </span>
                  <SolidDisplay
                    pair={state.puzzle.outside[statue]}
                    locale={locale}
                    showDetails={false}
                  />
                  <button
                    type="button"
                    className="button button--excise"
                    aria-label={describeExcise(locale, labelSelection)}
                    aria-pressed={pending}
                    disabled={!canExcise(state, selection)}
                    onClick={() => {
                      dispatch({ type: "excise", selection, now: Date.now() });
                    }}
                  >
                    {pending ? messages.selected : messages.excise}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="inside-section">
            <h3>{messages.inside}</h3>
            <InsideBoard inside={state.puzzle.inside} locale={locale} />
          </div>
        </section>
      </div>
    </div>
  );
}
