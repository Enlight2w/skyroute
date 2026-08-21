import { describe, expect, it } from "vitest";
import { createMockNotificationDelivery } from "./mockNotificationProvider";

describe("mock notification providers", () => {
  it("masks the simulated Email recipient while retaining delivery metadata", () => {
    const result = createMockNotificationDelivery({ channel: "email", eventType: "Price drop", message: "JFK → LIS reached your target." });

    expect(result).toMatchObject({
      provider: "SkyRoute Mock Mail",
      recipientMasked: "a***@skyroute.test",
      status: "simulated",
    });
  });

  it("masks the simulated SMS recipient", () => {
    const result = createMockNotificationDelivery({ channel: "sms", eventType: "Gate update", message: "Gate B14 is assigned." });

    expect(result.provider).toBe("SkyRoute Mock SMS");
    expect(result.recipientMasked).toContain("•••");
  });
});
