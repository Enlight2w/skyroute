import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const backendMocks = vi.hoisted(() => ({
  getNotificationPreferences: vi.fn(),
  listNotificationDeliveryLogs: vi.fn(),
  saveNotificationPreferences: vi.fn(),
  createNotificationDeliveryLog: vi.fn(),
  createMockNotificationDelivery: vi.fn(),
}));

vi.mock("./db", () => ({
  defaultNotificationPreferences: {
    priceDropEnabled: true,
    flightStatusEnabled: true,
    checkInEnabled: true,
    gateEnabled: true,
    calendarEnabled: true,
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    timing: "Instant",
    priceTarget: 450,
  },
  getNotificationPreferences: backendMocks.getNotificationPreferences,
  listNotificationDeliveryLogs: backendMocks.listNotificationDeliveryLogs,
  saveNotificationPreferences: backendMocks.saveNotificationPreferences,
  createNotificationDeliveryLog: backendMocks.createNotificationDeliveryLog,
}));

vi.mock("./mockNotificationProvider", () => ({
  createMockNotificationDelivery: backendMocks.createMockNotificationDelivery,
}));

import { appRouter } from "./routers";

const settings = {
  priceDropEnabled: true,
  flightStatusEnabled: true,
  checkInEnabled: false,
  gateEnabled: true,
  calendarEnabled: true,
  inAppEnabled: true,
  emailEnabled: true,
  smsEnabled: true,
  whatsappEnabled: false,
  timing: "3 hours before departure",
  priceTarget: 430,
};

function createAuthenticatedContext(): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 42,
      openId: "notification-test-user",
      name: "Notification Test",
      email: "notify@example.test",
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

describe("notification persistence API", () => {
  it("loads a saved preference record and its delivery history for the signed-in traveller", async () => {
    backendMocks.getNotificationPreferences.mockResolvedValue({ id: 1, userId: 42, ...settings });
    backendMocks.listNotificationDeliveryLogs.mockResolvedValue([{ id: 9, channel: "email", status: "simulated" }]);

    const result = await appRouter.createCaller(createAuthenticatedContext()).notification.get();

    expect(backendMocks.getNotificationPreferences).toHaveBeenCalledWith(42);
    expect(result.preferences.priceTarget).toBe(430);
    expect(result.deliveryHistory).toHaveLength(1);
  });

  it("saves a traveller’s preferences and records a mock Email delivery with masked metadata", async () => {
    backendMocks.saveNotificationPreferences.mockResolvedValue({ id: 1, userId: 42, ...settings });
    backendMocks.createMockNotificationDelivery.mockReturnValue({
      provider: "SkyRoute Mock Mail",
      channel: "email",
      recipientMasked: "a***@skyroute.test",
      subject: "Price drop notification",
      message: "JFK → LIS reached your target.",
      status: "simulated",
    });
    backendMocks.createNotificationDeliveryLog.mockResolvedValue({ id: 12, status: "simulated" });
    const caller = appRouter.createCaller(createAuthenticatedContext());

    await caller.notification.savePreferences(settings);
    const sent = await caller.notification.sendMock({ channel: "email", eventType: "Price drop", message: "JFK → LIS reached your target." });

    expect(backendMocks.saveNotificationPreferences).toHaveBeenCalledWith(42, settings);
    expect(backendMocks.createNotificationDeliveryLog).toHaveBeenCalledWith(expect.objectContaining({
      userId: 42,
      eventType: "Price drop",
      recipientMasked: "a***@skyroute.test",
    }));
    expect(sent.persisted).toBe(true);
  });
});
