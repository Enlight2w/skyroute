import { describe, expect, it } from "vitest";
import { notificationPreview, unreadNotificationCount } from "../client/src/lib/notificationLogic";

describe("custom notification logic", () => {
  it("builds a clear delivery preview from the traveller’s selected rule", () => {
    expect(notificationPreview("gate", "At gate assignment", ["In-app", "SMS"])).toBe(
      "Gate update alert · At gate assignment · In-app, SMS"
    );
  });

  it("counts only unread alerts in the notification center", () => {
    expect(unreadNotificationCount([{ read: false }, { read: true }, { read: false }])).toBe(2);
  });
});
