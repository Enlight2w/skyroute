import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hashApiKey } from "./apiKeyService";

const dbMocks = vi.hoisted(() => ({
  findValidApiKeyRecord: vi.fn(),
  markApiKeyUsed: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

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

  it("rejects the keyed external search without an API key", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.inventory.searchExternal({ refresh: 0 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a keyed external search when the key lacks inventory:read", async () => {
    const candidate = "skyr_live_notifications";
    dbMocks.findValidApiKeyRecord.mockResolvedValue({ id: 9, keyHash: hashApiKey(candidate), scopes: '["notifications:read"]' });
    const context = createPublicContext();
    context.req = { headers: { "x-api-key": candidate } } as TrpcContext["req"];

    await expect(appRouter.createCaller(context).inventory.searchExternal({ refresh: 0 }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("serves keyed inventory data when the key grants inventory:read", async () => {
    const candidate = "skyr_live_inventory";
    dbMocks.findValidApiKeyRecord.mockResolvedValue({ id: 10, keyHash: hashApiKey(candidate), scopes: '["inventory:read"]' });
    const context = createPublicContext();
    context.req = { headers: { "x-api-key": candidate } } as TrpcContext["req"];

    const result = await appRouter.createCaller(context).inventory.searchExternal({ refresh: 1 });

    expect(result.provider).toContain("mock airline inventory");
    expect(dbMocks.markApiKeyUsed).toHaveBeenCalledWith(10);
  });
});
