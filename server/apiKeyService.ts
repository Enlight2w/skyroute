import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const API_KEY_SCOPES = ["inventory:read", "notifications:read", "notifications:write"] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function createApiKey() {
  const secret = randomBytes(32).toString("base64url");
  const plainText = `skyr_live_${secret}`;
  return {
    plainText,
    keyHash: hashApiKey(plainText),
    keyPrefix: `${plainText.slice(0, 15)}…`,
  };
}

export function verifyApiKey(candidate: string, expectedHash: string): boolean {
  const candidateHash = Buffer.from(hashApiKey(candidate), "hex");
  const storedHash = Buffer.from(expectedHash, "hex");
  return candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);
}
