import { describe, expect, it } from "vitest";
import { bookingStepFor, formatBookingPrice } from "../client/src/lib/bookingPrototypeLogic";

describe("booking prototype logic", () => {
  it("formats the same transparent total in the selected currency", () => {
    expect(formatBookingPrice(462, "USD")).toBe("$462");
    expect(formatBookingPrice(462, "EUR")).toContain("425");
    expect(formatBookingPrice(462, "AED")).toContain("1,696");
  });

  it("maps the checkout pages to a clear four-step progress state", () => {
    expect(bookingStepFor("Passenger Details")).toBe(1);
    expect(bookingStepFor("Seats & Add-ons")).toBe(2);
    expect(bookingStepFor("Payment")).toBe(3);
    expect(bookingStepFor("Booking Confirmation")).toBe(4);
  });
});
