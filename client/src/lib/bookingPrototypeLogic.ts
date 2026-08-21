export type Currency = "USD" | "EUR" | "GBP" | "AED";

const currencyLocales: Record<Currency, string> = {
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  AED: "en-AE",
};

export function formatBookingPrice(amountInUsd: number, currency: Currency): string {
  const conversion: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67 };
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInUsd * conversion[currency]);
}

export function bookingStepFor(page: string): number {
  const steps = ["Passenger Details", "Seats & Add-ons", "Payment", "Booking Confirmation"];
  const index = steps.indexOf(page);
  return index === -1 ? 0 : index + 1;
}
