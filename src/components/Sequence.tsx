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

interface SelectionControls {
  readonly step: number;
  readonly disabled: boolean;
  readonly marks: Progress["selections"];
  readonly onMark: (selection: 0 | 1) => void;
}

function SwapPosition({
  statue,
  cuts,
  locale,
  controls,
}: Readonly<{
  statue: Statue;
  cuts: readonly Excise[];
  locale: Locale;
  controls: SelectionControls | undefined;
}>): ReactElement {
  const messages = getMessages(locale);
  const cutIndex = cuts.findIndex((cut) => cut.statue === statue);
  const selection = cuts[cutIndex] ?? null;
  const selectionIndex = cutIndex === 0 || cutIndex === 1 ? cutIndex : null;
  const marked = controls?.marks[cutIndex] ?? false;
  const content = selection !== null && (
    <>
      <ShapeIcon shape={selection.shape} />
      <span className="cut-number" aria-hidden="true">
        {marked ? "✓" : cutIndex + 1}
      </span>
    </>
  );
  return (
    <div className="swap-node" aria-hidden={controls === undefined}>
      <span className="position-label">{messages.positions[statue]}</span>
      {controls !== undefined &&
      selection !== null &&
      selectionIndex !== null ? (
        <button
          {...CONTROL_PROPS}
          type="button"
          className="swap-shape selection-mark"
          aria-label={messages.markSelectionDone
            .replace("{step}", String(controls.step))
            .replace("{selection}", String(selectionIndex + 1))
            .replace("{cut}", describeExcise(locale, selection))}
          aria-pressed={marked}
          aria-describedby="swap-progress-hint"
          disabled={controls.disabled || marked}
          onClick={() => {
            controls.onMark(selectionIndex);
          }}
        >
          {content}
        </button>
      ) : (
        <span
          className="swap-shape"
          title={
            selection === null ? undefined : describeExcise(locale, selection)
          }
        >
          {content}
        </span>
      )}
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
  controls,
}: Readonly<{
  swap: Swap;
  locale: Locale;
  controls?: SelectionControls;
}>): ReactElement {
  const messages = getMessages(locale);
  return (
    <figure
      className="swap-instruction"
      role={controls === undefined ? "img" : "group"}
      aria-label={
        controls === undefined
          ? describeExcise(locale, swap[0]) +
            "; " +
            describeExcise(locale, swap[1])
          : messages.swap + " " + String(controls.step)
      }
    >
      {STATUES.map((statue) => (
        <SwapPosition
          key={statue}
          statue={statue}
          cuts={swap}
          locale={locale}
          controls={controls}
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
          aria-label={messages.undoSwapMark}
          disabled={!hydrated || history.length === 1}
          onClick={() => {
            setHistory((previous) =>
              previous.length > 1 ? previous.slice(0, -1) : previous,
            );
          }}
        >
          <span aria-hidden="true">↶ </span>
          {messages.undoShort}
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
                <h3>
                  {messages.swap} {index + 1}
                </h3>
                <button
                  {...CONTROL_PROPS}
                  type="button"
                  className="text-button sequence-mark"
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
                  {index < completed && <span aria-hidden="true">✓ </span>}
                  {index < completed
                    ? messages.swapMarked
                    : messages.markWholeSwap}
                </button>
              </div>
              <SwapInstruction
                swap={swap}
                locale={locale}
                controls={{
                  step: index + 1,
                  disabled: !hydrated || index !== completed,
                  marks,
                  onMark: (selection) => {
                    mark(index, selection);
                  },
                }}
              />
              <p className="sr-only" role="status">
                {messages.selectionProgress
                  .replace("{step}", String(index + 1))
                  .replace("{done}", String(marks.filter(Boolean).length))}
              </p>
              <div className="after-swap">
                <span aria-label={messages.afterSwap}>
                  {messages.swapResult}
                </span>
                <MiniBoard board={current} locale={locale} />
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
