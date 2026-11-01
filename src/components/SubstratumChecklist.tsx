import { useState, type ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  canMark,
  createSubstratumProgress,
  markCheckpoint,
  type Checkpoint,
} from "../lib/substratum";
import { CONTROL_PROPS } from "./controlProps";
import ToolReadiness from "./ToolReadiness";
import { useHydrated } from "./useHydrated";

const GROUPS = [
  { name: "route", keys: ["tormentor1", "tormentor2"] },
  { name: "circuit", keys: ["conductorA", "conductorB"] },
] as const;

export default function SubstratumChecklist({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const text = getMessages(locale).substratumTool;
  const hydrated = useHydrated();
  const [history, setHistory] = useState([createSubstratumProgress()]);
  const progress = history[history.length - 1] ?? createSubstratumProgress();
  const complete = progress.completedCycles === 3;
  const canBank = canMark(progress, "bank");
  let next = text.nextRoute;
  if (progress.marks.tormentor1 && progress.marks.tormentor2) {
    next = text.nextCircuit;
  }
  if (canBank) {
    next = text.nextBank;
  }
  if (complete) {
    next = text.done;
  }

  function mark(checkpoint: Checkpoint | "bank"): void {
    setHistory((previous) => {
      const current =
        previous[previous.length - 1] ?? createSubstratumProgress();
      const updated = markCheckpoint(current, checkpoint);
      return updated === current ? previous : [...previous, updated];
    });
  }

  return (
    <div className="substratum-checklist">
      <p className="helper-note">{text.manual}</p>
      <section className="panel" aria-label={text.progress}>
        <div className="substratum-progress" aria-hidden="true">
          {[0, 1, 2].map((cycle) => (
            <span
              key={cycle}
              data-complete={cycle < progress.completedCycles}
              data-active={!complete && cycle === progress.completedCycles}
            >
              {cycle < progress.completedCycles ? "✓" : cycle + 1}
            </span>
          ))}
        </div>
        <div
          className="substratum-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2>
            {complete
              ? text.complete
              : text.cycle.replace(
                  "{cycle}",
                  String(progress.completedCycles + 1),
                )}
          </h2>
          <p className="helper-note">{next}</p>
        </div>
        {GROUPS.map((group) => (
          <fieldset className="substratum-checks" key={group.name}>
            <legend>{text[group.name]}</legend>
            <div>
              {group.keys.map((key) => (
                <button
                  {...CONTROL_PROPS}
                  key={key}
                  type="button"
                  className="button substratum-mark"
                  aria-pressed={progress.marks[key]}
                  disabled={!hydrated || !canMark(progress, key)}
                  onClick={() => {
                    mark(key);
                  }}
                >
                  <span aria-hidden="true">
                    {progress.marks[key] ? "✓" : "○"}
                  </span>
                  {text.marks[key]}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="substratum-bank">
          <button
            {...CONTROL_PROPS}
            type="button"
            className="button button--primary"
            disabled={!hydrated || !canBank}
            onClick={() => {
              mark("bank");
            }}
          >
            {text.bank}
          </button>
          <p className="helper-note">{text.bankHint}</p>
        </div>
        <div className="substratum-actions">
          <button
            {...CONTROL_PROPS}
            type="button"
            className="button"
            disabled={!hydrated || history.length === 1}
            onClick={() => {
              setHistory((previous) =>
                previous.length > 1 ? previous.slice(0, -1) : previous,
              );
            }}
          >
            {text.undo}
          </button>
          <button
            {...CONTROL_PROPS}
            type="button"
            className="button"
            disabled={!hydrated || history.length === 1}
            onClick={() => {
              setHistory([createSubstratumProgress()]);
            }}
          >
            {text.reset}
          </button>
        </div>
      </section>
      <p className="helper-note">{text.resetNote}</p>
      <ToolReadiness locale={locale} />
    </div>
  );
}
