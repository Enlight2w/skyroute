import { describe, expect, it } from "vitest";
import {
  calculateBestValueScore,
  findCheapestFlexibleDate,
  isPriceWatchTriggered,
  sortByArrivalTime,
} from "../client/src/lib/flightLogic";

describe("flight decision logic", () => {
  it("rewards lower-cost, nonstop flights with baggage included", () => {
    const score = calculateBestValueScore({
      price: 362,
      durationMinutes: 390,
      stops: 0,
      baggageIncluded: true,
      carbonKg: 208,
    });

    expect(score).toBeGreaterThanOrEqual(95);
  });

  it("only triggers a Price Watch when the flight reaches the selected target", () => {
    expect(isPriceWatchTriggered(459, 470)).toBe(true);
    expect(isPriceWatchTriggered(471, 470)).toBe(false);
  });

  it("identifies the cheapest date in a flexible-date range", () => {
    const cheapest = findCheapestFlexibleDate([
      { date: "Aug 28", fare: 446 },
      { date: "Aug 29", fare: 418 },
      { date: "Aug 30", fare: 431 },
    ]);

    expect(cheapest).toEqual({ date: "Aug 29", fare: 418 });
  });

  it("sorts flights by their local arrival time for the Arrival time filter", () => {
    const sorted = sortByArrivalTime([
      { arrive: "20:30" },
      { arrive: "10:10" },
    ]);

    expect(sorted.map(flight => flight.arrive)).toEqual(["10:10", "20:30"]);
  });
});
