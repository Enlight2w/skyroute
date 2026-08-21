import { describe, expect, it } from "vitest";
import { getMockInventory } from "./mockInventory";

describe("mock airline inventory", () => {
  it("returns transparent inventory metadata and multiple flight options", () => {
    const inventory = getMockInventory(0);

    expect(inventory.provider).toContain("mock airline inventory");
    expect(inventory.quoteVersion).toBe(1);
    expect(inventory.flights).toHaveLength(2);
    expect(inventory.flights[0]?.seatsRemaining).toBeGreaterThan(0);
  });

  it("changes deterministic prices and availability between refreshes", () => {
    const first = getMockInventory(0).flights[0];
    const refreshed = getMockInventory(1).flights[0];

    expect(refreshed?.totalPrice).not.toBe(first?.totalPrice);
    expect(refreshed?.seatsRemaining).not.toBe(first?.seatsRemaining);
  });
});
