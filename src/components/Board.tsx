import type { ReactElement } from "react";
import { getMessages, type Locale } from "../i18n/messages";
import {
  getSolid,
  SHAPES,
  STATUES,
  targetBoard,
  type Board as OutsideBoard,
  type Pair,
  type Shape,
  type Triple,
} from "../lib/verity";
import ShapeIcon from "./ShapeIcon";

export function SolidDisplay({
  pair,
  locale,
  showDetails = true,
}: Readonly<{
  pair: Pair;
  locale: Locale;
  showDetails?: boolean;
}>): ReactElement {
  const messages = getMessages(locale);
  const solid = getSolid(pair);
  return (
    <div
      className="solid-display"
      role={showDetails ? undefined : "img"}
      aria-label={showDetails ? undefined : messages.solids[solid]}
    >
      <ShapeIcon shape={solid} className="solid-icon" />
      {showDetails && (
        <>
          <strong>{messages.solids[solid]}</strong>
          <span
            className="shape-composition"
            role="img"
            aria-label={
              messages.shapes[pair[0]] + " + " + messages.shapes[pair[1]]
            }
          >
            <ShapeIcon shape={pair[0]} />
            <span aria-hidden="true">+</span>
            <ShapeIcon shape={pair[1]} />
          </span>
        </>
      )}
    </div>
  );
}

export function InsideBoard({
  inside,
  locale,
}: Readonly<{ inside: Triple<Shape>; locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  return (
    <div className="statue-grid inside-board">
      {STATUES.map((statue) => (
        <figure
          key={statue}
          className="inside-statue"
          role="img"
          aria-label={
            messages.positions[statue] + ": " + messages.shapes[inside[statue]]
          }
        >
          <span className="position-label" aria-hidden="true">
            {messages.positions[statue]}
          </span>
          <ShapeIcon shape={inside[statue]} />
        </figure>
      ))}
    </div>
  );
}

export function ShapeBudget({
  locale,
}: Readonly<{ locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  return (
    <div className="shape-budget" role="img" aria-label={messages.shapeBudget}>
      {SHAPES.map((shape) => (
        <span key={shape} aria-hidden="true">
          <ShapeIcon shape={shape} />
          <span>×2</span>
        </span>
      ))}
    </div>
  );
}

export function MiniBoard({
  board,
  locale,
}: Readonly<{ board: OutsideBoard; locale: Locale }>): ReactElement {
  const messages = getMessages(locale);
  return (
    <div className="mini-board">
      {STATUES.map((statue) => {
        const solid = getSolid(board[statue]);
        return (
          <span
            key={statue}
            role="img"
            aria-label={
              messages.positions[statue] + ": " + messages.solids[solid]
            }
          >
            <ShapeIcon shape={solid} />
            <span aria-hidden="true">{messages.positions[statue]}</span>
          </span>
        );
      })}
    </div>
  );
}

export function GoalBoard({
  inside,
  locale,
  showPositions = true,
}: Readonly<{
  inside: Triple<Shape>;
  locale: Locale;
  showPositions?: boolean;
}>): ReactElement {
  const messages = getMessages(locale);
  const board = targetBoard(inside);
  return (
    <div className="goal-board">
      {STATUES.map((statue) => {
        const shape = inside[statue];
        const solid = getSolid(board[statue]);
        const label =
          messages.inside +
          ": " +
          messages.shapes[shape] +
          "; " +
          messages.target +
          ": " +
          messages.solids[solid];
        return (
          <figure
            key={statue}
            className="goal-pair"
            role="img"
            aria-label={
              showPositions ? messages.positions[statue] + ". " + label : label
            }
          >
            {showPositions && (
              <span className="position-label" aria-hidden="true">
                {messages.positions[statue]}
              </span>
            )}
            <div className="goal-diagram" aria-hidden="true">
              <ShapeIcon shape={shape} />
              <span className="diagram-arrow">→</span>
              <ShapeIcon shape={solid} />
            </div>
          </figure>
        );
      })}
    </div>
  );
}
