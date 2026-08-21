export type FlightScoreInput = {
  price: number;
  durationMinutes: number;
  stops: number;
  baggageIncluded: boolean;
  carbonKg: number;
};

/** A transparent 0–100 score: price 45%, duration 25%, stops 15%, baggage 10%, carbon 5%. */
export function calculateBestValueScore(input: FlightScoreInput): number {
  const pricePenalty = Math.min(45, Math.max(0, (input.price - 350) / 10));
  const durationPenalty = Math.min(25, Math.max(0, (input.durationMinutes - 420) / 30));
  const stopPenalty = Math.min(15, input.stops * 7.5);
  const baggagePenalty = input.baggageIncluded ? 0 : 10;
  const carbonPenalty = Math.min(5, Math.max(0, (input.carbonKg - 220) / 20));

  return Math.max(0, Math.round(100 - pricePenalty - durationPenalty - stopPenalty - baggagePenalty - carbonPenalty));
}

export function isPriceWatchTriggered(currentPrice: number, targetPrice: number): boolean {
  return currentPrice <= targetPrice;
}

export function findCheapestFlexibleDate<T extends { fare: number }>(dates: T[]): T | undefined {
  return dates.reduce<T | undefined>((cheapest, date) => {
    if (!cheapest || date.fare < cheapest.fare) return date;
    return cheapest;
  }, undefined);
}

export function sortByArrivalTime<T extends { arrive: string }>(flights: T[]): T[] {
  return [...flights].sort((left, right) => left.arrive.localeCompare(right.arrive));
}
