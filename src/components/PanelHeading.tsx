import type { ReactElement, ReactNode } from "react";

export default function PanelHeading({
  number,
  title,
  titleId,
  children,
}: Readonly<{
  number: string;
  title: string;
  titleId?: string;
  children?: ReactNode;
}>): ReactElement {
  return (
    <div className="panel-heading">
      <div>
        <span className="panel-number">{number}</span>
        <h2 id={titleId}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
