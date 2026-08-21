import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("inventory.search", () => {
  it("exposes deterministic mock airline availability through the public API contract", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.inventory.search({ refresh: 2 });

    expect(result.quoteVersion).toBe(3);
    expect(result.flights[0]).toMatchObject({
      airline: "SkyRoute Air",
      flightNumber: "SK 218",
    });
  });
});
