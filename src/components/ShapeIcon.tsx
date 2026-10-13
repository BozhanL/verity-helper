import type { ReactElement, ReactNode } from "react";
import type { Shape, Solid } from "../lib/verity";

export type IconShape = Shape | Solid;

const drawings: Record<IconShape, ReactNode> = {
  circle: <circle cx="32" cy="32" r="19" fill="currentColor" stroke="none" />,
  triangle: <path d="M32 10 55 51H9Z" fill="currentColor" stroke="none" />,
  square: (
    <rect
      x="13"
      y="13"
      width="38"
      height="38"
      rx="2"
      fill="currentColor"
      stroke="none"
    />
  ),
  sphere: (
    <>
      <circle cx="32" cy="32" r="23" />
      <ellipse cx="32" cy="32" rx="23" ry="8" />
      <path d="M32 9c-14 12-14 34 0 46M32 9c14 12 14 34 0 46" />
    </>
  ),
  pyramid: (
    <>
      <path d="M32 8 8 48l24 9 24-9ZM32 8v49" />
      <path d="M8 48h48" strokeDasharray="3 3" />
    </>
  ),
  cube: (
    <>
      <path d="m12 19 18-9 23 10v30l-18 9-23-10Z" />
      <path d="m12 19 23 10 18-9M35 29v30M30 10v29l-18 10M30 39l23 11" />
    </>
  ),
  cone: (
    <>
      <path d="M10 48 32 8l22 40" />
      <ellipse cx="32" cy="48" rx="22" ry="8" />
    </>
  ),
  cylinder: (
    <>
      <path d="M12 16v32c0 11 40 11 40 0V16" />
      <ellipse cx="32" cy="16" rx="20" ry="8" />
      <path d="M12 48c0-11 40-11 40 0" />
    </>
  ),
  prism: (
    <>
      <path d="M12 12h40L32 30ZM12 12v32l20 16 20-16V12M32 30v30M12 44h40" />
    </>
  ),
};

export default function ShapeIcon({
  shape,
  className = "",
}: Readonly<{ shape: IconShape; className?: string }>): ReactElement {
  return (
    <svg
      className={["shape-icon", className].filter(Boolean).join(" ")}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[shape]}
    </svg>
  );
}
