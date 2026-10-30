// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { compareByEase, getParents, pals } from "../lib/breeding";
import ReverseCalculator from "./ReverseCalculator";

afterEach(cleanup);

async function pick(user: ReturnType<typeof userEvent.setup>, label: string, name: string) {
  const input = screen.getByRole("combobox", { name: label });
  await user.click(input);
  await user.type(input, name);
  await user.click(within(screen.getByRole("listbox", { name: label })).getByText(name, { exact: true }));
}

function setup() {
  const user = userEvent.setup();
  render(<ReverseCalculator />);
  return user;
}

const pal = (name: string) => pals.find((p) => p.name === name)!;
const rows = () => within(screen.getByTestId("pair-list")).getAllByRole("listitem");
const count = () => screen.getByTestId("pair-count").textContent;

describe("ReverseCalculator", () => {
  it("lists the unique combo and self-breeding for Relaxaurus Lux", async () => {
    const user = setup();
    await pick(user, "Pal you want", "Relaxaurus Lux");
    const text = rows().map((r) => r.textContent);
    expect(text).toHaveLength(2);
    expect(text.some((t) => t?.includes("Relaxaurus") && t.includes("Sparkit"))).toBe(true);
  });

  it("shows every pair for Anubis across pages of 20", async () => {
    const total = getParents(pal("Anubis")).length;
    const user = setup();
    await pick(user, "Pal you want", "Anubis");
    expect(count()).toBe(`Showing 1–20 of ${total} parent pairs for Anubis`);
    expect(rows()).toHaveLength(20);
    expect(screen.getByText(`Page 1 of ${Math.ceil(total / 20)}`)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(count()).toBe(`Showing 21–40 of ${total} parent pairs for Anubis`);
  });

  it("only shows pairs with the owned Pal, listed first", async () => {
    const owned = "Univolt Cryst";
    const expected = getParents(pal("Anubis")).filter((p) => p.parentA.name === owned || p.parentB.name === owned);
    const user = setup();
    await pick(user, "Pal you want", "Anubis");
    await pick(user, "Only show pairs that include this Pal", owned);
    expect(count()).toContain(`of ${expected.length} parent pairs`);
    for (const row of rows()) expect(row.textContent?.startsWith(owned)).toBe(true);

    await user.click(screen.getByRole("button", { name: "Clear filter" }));
    expect(count()).toContain(`of ${getParents(pal("Anubis")).length} parent pairs`);
  });

  it("filters by parent name", async () => {
    const user = setup();
    await pick(user, "Pal you want", "Anubis");
    await user.type(screen.getByRole("searchbox"), "jetragon");
    for (const row of rows()) expect(row.textContent).toContain("Jetragon");
  });

  it("sorts rarest parents first", async () => {
    const user = setup();
    await pick(user, "Pal you want", "Anubis");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "rare");
    const pairs = [...getParents(pal("Anubis"))].sort((a, b) => compareByEase(b, a));
    const rarest = Math.max(pairs[0].parentA.rarity, pairs[0].parentB.rarity);
    expect(rarest).toBe(Math.max(...pairs.map((p) => Math.max(p.parentA.rarity, p.parentB.rarity))));
    const firstRow = rows()[0].textContent!;
    const rowPair = pairs.find((p) => firstRow.includes(p.parentA.name) && firstRow.includes(p.parentB.name))!;
    expect(Math.max(rowPair.parentA.rarity, rowPair.parentB.rarity)).toBe(rarest);
  });

  it("explains when a Pal can't be bred", async () => {
    const user = setup();
    await pick(user, "Pal you want", "Panthalus");
    expect(screen.getByText("Panthalus can't be bred in the Breeding Farm.")).toBeTruthy();
  });
});
