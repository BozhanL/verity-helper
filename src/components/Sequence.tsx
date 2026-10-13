import type { ReactElement } from "react";
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
import ShapeIcon from "./ShapeIcon";

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
  let current = board;
  return (
    <ol className="sequence">
      {swaps.map((swap, index) => {
        current = applySwap(current, swap);
        return (
          <li key={JSON.stringify([current, swap])}>
            <div className="sequence-heading">
              <span className="step-number">{index + 1}</span>
              <h3>
                {messages.swap} {index + 1}
              </h3>
            </div>
            <SwapInstruction swap={swap} locale={locale} />
            <div className="after-swap">
              <span>{messages.afterSwap}</span>
              <MiniBoard board={current} locale={locale} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
