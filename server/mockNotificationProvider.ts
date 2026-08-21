export type MockDeliveryChannel = "email" | "sms";

export type MockNotificationDelivery = {
  provider: "SkyRoute Mock Mail" | "SkyRoute Mock SMS";
  channel: MockDeliveryChannel;
  recipientMasked: string;
  subject: string;
  message: string;
  status: "simulated";
};

export function createMockNotificationDelivery(input: {
  channel: MockDeliveryChannel;
  eventType: string;
  message: string;
}): MockNotificationDelivery {
  const isEmail = input.channel === "email";
  return {
    provider: isEmail ? "SkyRoute Mock Mail" : "SkyRoute Mock SMS",
    channel: input.channel,
    recipientMasked: isEmail ? "a***@skyroute.test" : "+1 ••• ••• 0142",
    subject: `${input.eventType} notification`,
    message: input.message,
    status: "simulated",
  };
}
