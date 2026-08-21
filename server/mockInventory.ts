export type MockInventoryFlight = {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  baggage: string;
  refund: string;
  carbonKg: number;
  seatsRemaining: number;
  totalPrice: number;
};

const baseFlights: Omit<MockInventoryFlight, "totalPrice" | "seatsRemaining">[] = [
  {
    id: "sk-218",
    airline: "SkyRoute Air",
    flightNumber: "SK 218",
    departureTime: "09:15 JFK",
    arrivalTime: "20:30 LIS",
    duration: "07h 15m nonstop",
    stops: 0,
    baggage: "1 checked bag",
    refund: "Credit or refund",
    carbonKg: 211,
  },
  {
    id: "ac-302",
    airline: "Atlantic Connect",
    flightNumber: "AC 302",
    departureTime: "17:40 JFK",
    arrivalTime: "10:10 LIS",
    duration: "08h 30m · 1 stop",
    stops: 1,
    baggage: "Personal item",
    refund: "Not refundable",
    carbonKg: 236,
  },
];

/**
 * A deterministic inventory simulator. Refreshing the client query changes the quote and
 * availability without implying a real airline connection or collecting provider credentials.
 */
export function getMockInventory(refresh: number) {
  const priceMoves = [0, -14, 9, -22, 17];
  const normalizedRefresh = Math.max(0, Math.floor(refresh));

  const flights: MockInventoryFlight[] = baseFlights.map((flight, index) => {
    const move = priceMoves[(normalizedRefresh + index) % priceMoves.length] ?? 0;
    const basePrice = index === 0 ? 462 : 418;
    const baseSeats = index === 0 ? 7 : 4;
    return {
      ...flight,
      totalPrice: basePrice + move,
      seatsRemaining: Math.max(1, baseSeats - ((normalizedRefresh + index) % 4)),
    };
  });

  return {
    provider: "SkyRoute mock airline inventory",
    quoteVersion: normalizedRefresh + 1,
    refreshedLabel: `Quote refresh ${normalizedRefresh + 1}`,
    flights,
  };
}
