import { describe, expect, it } from "vitest";
import { createApiKey, hashApiKey, verifyApiKey } from "./apiKeyService";

describe("secure API key service", () => {
  it("generates a high-entropy SkyRoute key and stores only a hashable representation", () => {
    const first = createApiKey();
    const second = createApiKey();

    expect(first.plainText).toMatch(/^skyr_live_[A-Za-z0-9_-]{40,}$/);
    expect(first.plainText).not.toBe(second.plainText);
    expect(first.keyHash).toHaveLength(64);
    expect(first.keyPrefix).not.toContain(first.plainText.slice(16));
  });

  it("verifies a correct API key in constant time and rejects a different key", () => {
    const apiKey = createApiKey();

    expect(verifyApiKey(apiKey.plainText, apiKey.keyHash)).toBe(true);
    expect(verifyApiKey("skyr_live_not-the-same-key", apiKey.keyHash)).toBe(false);
    expect(hashApiKey(apiKey.plainText)).toBe(apiKey.keyHash);
  });
});
