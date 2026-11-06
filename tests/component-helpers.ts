import { fireEvent, screen, within } from "@testing-library/react";

export function choose(group: string, name: string): void {
  fireEvent.click(
    within(screen.getByRole("group", { name: group })).getByRole("radio", {
      name,
    }),
  );
}
