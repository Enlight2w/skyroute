export type NotificationEventKey = "priceDrop" | "flightStatus" | "checkIn" | "gate" | "calendar";
export type DeliveryChannel = "In-app" | "Email" | "SMS" | "WhatsApp";

export const notificationEventLabels: Record<NotificationEventKey, string> = {
  priceDrop: "Price drop",
  flightStatus: "Flight status",
  checkIn: "Check-in opens",
  gate: "Gate update",
  calendar: "Calendar reminder",
};

export function notificationPreview(event: NotificationEventKey, timing: string, channels: DeliveryChannel[]): string {
  const label = notificationEventLabels[event];
  const channelCopy = channels.length > 0 ? channels.join(", ") : "no selected channel";
  return `${label} alert · ${timing} · ${channelCopy}`;
}

export function unreadNotificationCount(alerts: { read: boolean }[]): number {
  return alerts.filter(alert => !alert.read).length;
}
