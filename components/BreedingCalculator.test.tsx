// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import BreedingCalculator from "./BreedingCalculator";

afterEach(cleanup);

async function pick(user: ReturnType<typeof userEvent.setup>, label: string, name: string) {
  const input = screen.getByRole("combobox", { name: label });
  await user.click(input);
  await user.type(input, name);
  const list = screen.getByRole("listbox", { name: label });
  await user.click(within(list).getByText(name, { exact: true }));
}

function setup() {
  const user = userEvent.setup();
  render(<BreedingCalculator />);
  return user;
}

describe("BreedingCalculator", () => {
  it.each([
    ["Lamball", "Cattiva", "Daedream"],
    ["Penking", "Bushi", "Sibelyx"],
    ["Mossanda", "Rushoar", "Kelpsea Ignis"],
    ["Relaxaurus", "Sparkit", "Relaxaurus Lux"],
    ["Frostallion", "Helzephyr", "Frostallion Noct"],
  ])("%s + %s shows %s", async (a, b, expected) => {
    const user = setup();
    await pick(user, "Parent 1", a);
    await pick(user, "Parent 2", b);
    expect(screen.getByTestId("child-name").textContent).toBe(expected);
    const link = screen.getByRole("link", { name: `View ${expected}` });
    // The trailing slash is added by next.config, which isn't loaded in tests
    expect(link.getAttribute("href")).toMatch(/^\/pals\/[a-z0-9-]+\/?$/);
  });

  it("asks for two parents before showing a result", () => {
    setup();
    expect(screen.getByText("Pick two parents to see their child.")).toBeTruthy();
  });

  it("filters the list while typing", async () => {
    const user = setup();
    const input = screen.getByRole("combobox", { name: "Parent 1" });
    await user.click(input);
    await user.type(input, "frostal");
    const names = within(screen.getByRole("listbox")).getAllByRole("option").map((o) => o.textContent);
    expect(names).toHaveLength(2);
    expect(names.every((n) => n?.includes("Frostallion"))).toBe(true);
  });

  it("picks with the keyboard", async () => {
    const user = setup();
    const input = screen.getByRole("combobox", { name: "Parent 1" });
    await user.click(input);
    await user.type(input, "jetragon{Enter}");
    expect((input as HTMLInputElement).value).toBe("Jetragon");
  });

  it("swaps the parents", async () => {
    const user = setup();
    await pick(user, "Parent 1", "Lamball");
    await pick(user, "Parent 2", "Cattiva");
    await user.click(screen.getByRole("button", { name: "Swap parents" }));
    expect((screen.getByRole("combobox", { name: "Parent 1" }) as HTMLInputElement).value).toBe("Cattiva");
    expect((screen.getByRole("combobox", { name: "Parent 2" }) as HTMLInputElement).value).toBe("Lamball");
    expect(screen.getByTestId("child-name").textContent).toBe("Daedream");
  });

  it("resets both parents", async () => {
    const user = setup();
    await pick(user, "Parent 1", "Lamball");
    await pick(user, "Parent 2", "Cattiva");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect((screen.getByRole("combobox", { name: "Parent 1" }) as HTMLInputElement).value).toBe("");
    expect(screen.getByText("Pick two parents to see their child.")).toBeTruthy();
  });

  it("shows every gender outcome for Katress + Wixen", async () => {
    const user = setup();
    await pick(user, "Parent 1", "Katress");
    await pick(user, "Parent 2", "Wixen");
    const children = screen.getAllByTestId("child-name").map((el) => el.textContent);
    expect(children).toContain("Katress Ignis");
    expect(children).toContain("Wixen Noct");
  });

  it("does not offer Pals that can't be bred", async () => {
    const user = setup();
    const input = screen.getByRole("combobox", { name: "Parent 1" });
    await user.click(input);
    await user.type(input, "Panthalus");
    expect(screen.getByText("No Pal found")).toBeTruthy();
  });
});
