import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createApiKeyRecord: vi.fn(),
  findValidApiKeyRecord: vi.fn(),
  listApiKeyRecords: vi.fn(),
  markApiKeyUsed: vi.fn(),
  revokeApiKeyRecord: vi.fn(),
  createNotificationDeliveryLog: vi.fn(),
  defaultNotificationPreferences: {},
  getNotificationPreferences: vi.fn(),
  listNotificationDeliveryLogs: vi.fn(),
  saveNotificationPreferences: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter, verifySkyRouteApiKey } from "./routers";
import { hashApiKey } from "./apiKeyService";

function createAuthenticatedContext(): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 71,
      openId: "api-key-test-user",
      name: "API Key Test",
      email: "api-key@example.test",
      loginMethod: "manus",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("apiKeys router", () => {
  it("returns the generated secret once while persisting only its hash", async () => {
    dbMocks.createApiKeyRecord.mockImplementation(async (input: Record<string, unknown>) => ({
      id: 16,
      ...input,
      createdAt: new Date("2026-08-21T00:00:00Z"),
    }));
    const caller = appRouter.createCaller(createAuthenticatedContext());

    const result = await caller.apiKeys.create({ name: "Personal integration", scopes: ["inventory:read"] });

    expect(result.secret).toMatch(/^skyr_live_/);
    expect(result.apiKey).not.toHaveProperty("keyHash");
    expect(dbMocks.createApiKeyRecord).toHaveBeenCalledWith(expect.objectContaining({
      userId: 71,
      keyHash: hashApiKey(result.secret),
    }));
  });

  it("verifies active keys and marks them used without accepting a mismatched secret", async () => {
    const candidate = "skyr_live_example_candidate";
    dbMocks.findValidApiKeyRecord.mockResolvedValue({ id: 4, userId: 71, keyHash: hashApiKey(candidate), scopes: '["inventory:read"]' });

    await expect(verifySkyRouteApiKey(candidate)).resolves.toEqual({ userId: 71, scopes: ["inventory:read"] });
    await expect(verifySkyRouteApiKey("skyr_live_wrong_value")).resolves.toBeUndefined();
    expect(dbMocks.markApiKeyUsed).toHaveBeenCalledWith(4);
  });

  it("revokes a key only through the authenticated owner context", async () => {
    dbMocks.revokeApiKeyRecord.mockResolvedValue(true);
    const result = await appRouter.createCaller(createAuthenticatedContext()).apiKeys.revoke({ id: 16 });

    expect(result).toEqual({ revoked: true });
    expect(dbMocks.revokeApiKeyRecord).toHaveBeenCalledWith(71, 16);
  });
});
