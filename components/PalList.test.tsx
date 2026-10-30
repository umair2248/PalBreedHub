// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { pals } from "../lib/breeding";
import PalList from "./PalList";

afterEach(cleanup);

const cards = () => within(screen.getByTestId("pal-grid")).getAllByRole("link");

describe("PalList", () => {
  it("shows every Pal with a link to its page", () => {
    render(<PalList />);
    expect(cards()).toHaveLength(pals.length);
    const lamball = cards().find((c) => c.textContent?.includes("Lamball"))!;
    expect(lamball.getAttribute("href")).toMatch(/^\/pals\/lamball\/?$/);
  });

  it("searches by name", async () => {
    const user = userEvent.setup();
    render(<PalList />);
    await user.type(screen.getByRole("searchbox"), "frostallion");
    expect(cards().map((c) => c.textContent)).toEqual([
      expect.stringContaining("Frostallion"),
      expect.stringContaining("Frostallion Noct"),
    ]);
  });

  it("filters by element and work suitability together", async () => {
    const user = userEvent.setup();
    render(<PalList />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Element" }), "ice");
    await user.selectOptions(screen.getByRole("combobox", { name: "Work suitability" }), "mining");
    const expected = pals.filter((p) => p.elements.includes("ice") && "mining" in p.workSuitability);
    expect(cards()).toHaveLength(expected.length);
    expect(screen.getByTestId("pal-count").textContent).toBe(`${expected.length} of ${pals.length} Pals`);

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(cards()).toHaveLength(pals.length);
  });

  it("says when nothing matches", async () => {
    const user = userEvent.setup();
    render(<PalList />);
    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText("No Pals match these filters.")).toBeTruthy();
  });
});
