import { useState, type ReactElement } from "react";
import { describeExcise, getMessages, type Locale } from "../i18n/messages";
import {
  applySwap,
  STATUES,
  type Board,
  type Excise,
  type Statue,
  type Swap,
} from "../lib/verity";
import { MiniBoard } from "./Board";
import { CONTROL_PROPS } from "./controlProps";
import ShapeIcon from "./ShapeIcon";
import { useHydrated } from "./useHydrated";

interface Progress {
  readonly completed: number;
  readonly selections: readonly [boolean, boolean];
}

const EMPTY_PROGRESS: Progress = { completed: 0, selections: [false, false] };

function SwapPosition({
  statue,
  cuts,
  locale,
}: Readonly<{
  statue: Statue;
  cuts: readonly Excise[];
  locale: Locale;
}>): ReactElement {
  const messages = getMessages(locale);
  const cutIndex = cuts.findIndex((cut) => cut.statue === statue);
  const selection = cuts[cutIndex] ?? null;
  return (
    <div className="swap-node" aria-hidden="true">
      <span className="position-label">{messages.positions[statue]}</span>
      <span
        className="swap-shape"
        title={
          selection === null ? undefined : describeExcise(locale, selection)
        }
      >
        {selection !== null && (
          <>
            <ShapeIcon shape={selection.shape} />
            <span className="cut-number">{cutIndex + 1}</span>
          </>
        )}
      </span>
    </div>
  );
}

function SwapConnector({
  first,
  second,
}: Readonly<{ first: Statue; second: Statue }>): ReactElement {
  const start = Math.min(first, second);
  const end = Math.max(first, second);
  return (
    <div
      className={["swap-arrows", end - start === 2 && "swap-arrows--wide"]
        .filter(Boolean)
        .join(" ")}
      style={{ gridColumn: [start + 1, end + 2].join(" / ") }}
      aria-hidden="true"
    >
      {[start, end].map((statue) => (
        <svg
          key={statue}
          className="swap-arrow"
          viewBox="0 0 12 24"
          focusable="false"
        >
          <path d="M6 18V3m-4 4 4-4 4 4" />
        </svg>
      ))}
    </div>
  );
}

export function SwapInstruction({
  swap,
  locale,
}: Readonly<{ swap: Swap; locale: Locale }>): ReactElement {
  return (
    <figure
      className="swap-instruction"
      role="img"
      aria-label={
        describeExcise(locale, swap[0]) + "; " + describeExcise(locale, swap[1])
      }
    >
      {STATUES.map((statue) => (
        <SwapPosition
          key={statue}
          statue={statue}
          cuts={swap}
          locale={locale}
        />
      ))}
      <SwapConnector first={swap[0].statue} second={swap[1].statue} />
    </figure>
  );
}

export default function Sequence({
  swaps,
  board,
  locale,
}: Readonly<{
  swaps: readonly Swap[];
  board: Board;
  locale: Locale;
}>): ReactElement {
  const messages = getMessages(locale);
  const hydrated = useHydrated();
  const [history, setHistory] = useState<readonly Progress[]>([EMPTY_PROGRESS]);
  const { completed, selections } = history.at(-1) ?? EMPTY_PROGRESS;

  function mark(swapIndex: number, selection: 0 | 1 | "both"): void {
    setHistory((previous) => {
      const latest = previous.at(-1) ?? EMPTY_PROGRESS;
      if (
        swapIndex !== latest.completed ||
        (selection !== "both" && latest.selections[selection])
      ) {
        return previous;
      }
      const next: Progress["selections"] = [
        selection === "both" || selection === 0 || latest.selections[0],
        selection === "both" || selection === 1 || latest.selections[1],
      ];
      return [
        ...previous,
        next.every(Boolean)
          ? { completed: latest.completed + 1, selections: [false, false] }
          : { completed: latest.completed, selections: next },
      ];
    });
  }

  let current = board;
  return (
    <>
      <div className="sequence-progress">
        <p role="status">
          {messages.swapProgress
            .replace("{done}", String(completed))
            .replace("{total}", String(swaps.length))}
        </p>
        <button
          {...CONTROL_PROPS}
          type="button"
          className="text-button"
          disabled={!hydrated || history.length === 1}
          onClick={() => {
            setHistory((previous) =>
              previous.length > 1 ? previous.slice(0, -1) : previous,
            );
          }}
        >
          {messages.undoSwapMark}
        </button>
      </div>
      <p className="input-hint" id="swap-progress-hint">
        {messages.swapProgressHint}
      </p>
      {completed === swaps.length && (
        <p className="feedback feedback--success" role="status">
          {messages.allSwapsMarked}
        </p>
      )}
      <ol className="sequence">
        {swaps.map((swap, index) => {
          current = applySwap(current, swap);
          let marks: Progress["selections"] =
            index === completed ? selections : [false, false];
          if (index < completed) {
            marks = [true, true];
          }
          return (
            <li
              key={JSON.stringify([current, swap])}
              aria-current={index === completed ? "step" : undefined}
              className={index < completed ? "sequence-completed" : undefined}
            >
              <div className="sequence-heading">
                <span className="step-number">{index + 1}</span>
                <h3>
                  {messages.swap} {index + 1}
                </h3>
              </div>
              <SwapInstruction swap={swap} locale={locale} />
              <div className="selection-marks">
                {([0, 1] as const).map((selection) => {
                  const cut = swap[selection];
                  return (
                    <button
                      {...CONTROL_PROPS}
                      key={selection}
                      type="button"
                      className="button button--secondary selection-mark"
                      aria-label={messages.markSelectionDone
                        .replace("{step}", String(index + 1))
                        .replace("{selection}", String(selection + 1))
                        .replace("{cut}", describeExcise(locale, cut))}
                      aria-pressed={marks[selection]}
                      aria-describedby="swap-progress-hint"
                      disabled={
                        !hydrated || index !== completed || marks[selection]
                      }
                      onClick={() => {
                        mark(index, selection);
                      }}
                    >
                      <span>
                        {selection + 1}. {messages.shapes[cut.shape]} ·{" "}
                        {messages.positions[cut.statue]}
                      </span>
                      <span>
                        {marks[selection]
                          ? messages.selectionMarked
                          : messages.markSelection}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="selection-progress" role="status">
                {messages.selectionProgress.replace(
                  "{done}",
                  String(marks.filter(Boolean).length),
                )}
              </p>
              <div className="after-swap">
                <span>{messages.afterSwap}</span>
                <MiniBoard board={current} locale={locale} />
              </div>
              <button
                {...CONTROL_PROPS}
                type="button"
                className="button button--secondary sequence-mark"
                aria-label={messages.markSwapDone.replace(
                  "{step}",
                  String(index + 1),
                )}
                aria-describedby="swap-progress-hint"
                disabled={!hydrated || index !== completed}
                onClick={() => {
                  mark(index, "both");
                }}
              >
                {index < completed
                  ? messages.swapMarked
                  : messages.markSwapDone.replace("{step}", String(index + 1))}
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
