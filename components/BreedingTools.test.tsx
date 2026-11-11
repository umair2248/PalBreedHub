// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import BreedingChart from "./BreedingChart";
import BreedingPathFinder from "./BreedingPathFinder";

afterEach(cleanup);

async function pick(user: ReturnType<typeof userEvent.setup>, label: string, name: string) {
  const input = screen.getByRole("combobox", { name: label });
  await user.click(input);
  await user.type(input, name);
  await user.click(within(screen.getByRole("listbox", { name: label })).getByText(name, { exact: true }));
}

describe("BreedingChart", () => {
  it("renders only the cells in view, each with a parent + parent = child title", () => {
    render(<BreedingChart />);
    const links = within(screen.getByTestId("breeding-chart")).getAllByRole("link");
    // Far fewer than the ~83,000 cells of the full grid
    expect(links.length).toBeGreaterThan(20);
    expect(links.length).toBeLessThan(2000);
    expect(screen.getByTitle("Lamball + Lamball = Lamball")).toBeTruthy();
  });

  it("filters both axes by element", async () => {
    const user = userEvent.setup();
    render(<BreedingChart />);
    await user.click(screen.getByRole("button", { name: "Fire" }));
    const chart = screen.getByTestId("breeding-chart");
    expect(within(chart).queryByTitle("Lamball + Lamball = Lamball")).toBeNull();
    expect(within(chart).getByTitle("Foxparks + Foxparks = Foxparks")).toBeTruthy();
  });
});

describe("BreedingPathFinder", () => {
  beforeEach(() => localStorage.clear());

  it("finds a path from owned Pals and remembers them", async () => {
    const user = userEvent.setup();
    render(<BreedingPathFinder />);
    await pick(user, "Pals you own", "Frostallion");
    await pick(user, "Pals you own", "Helzephyr");
    await pick(user, "Target Pal", "Frostallion Noct");

    const path = screen.getByTestId("breeding-path");
    expect(path.textContent).toContain("Frostallion Noct in 1 generation(s)");
    expect(JSON.parse(localStorage.getItem("pbh-owned-pals")!)).toHaveLength(2);
  });

  it("says when the target can't be reached", async () => {
    const user = userEvent.setup();
    render(<BreedingPathFinder />);
    await pick(user, "Pals you own", "Lamball");
    await pick(user, "Pals you own", "Cattiva");
    await pick(user, "Target Pal", "Grizzbolt");
    expect(screen.getByText(/Grizzbolt can't be bred from these Pals/)).toBeTruthy();
  });
});
