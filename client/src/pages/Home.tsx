import { useMemo, useState } from "react";
import {
  Armchair,
  ArrowRight,
  BellRing,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Download,
  Hotel,
  Leaf,
  LogIn,
  LogOut,
  Luggage,
  MapPin,
  Menu,
  Palmtree,
  Plane,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import BookingWorkbench from "@/components/BookingWorkbench";
import { calculateBestValueScore, sortByArrivalTime, type FlightScoreInput } from "@/lib/flightLogic";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const flexibleDates = [
  { day: "Thu", date: "28", fare: 446 },
  { day: "Fri", date: "29", fare: 418 },
  { day: "Sat", date: "30", fare: 431 },
  { day: "Sun", date: "31", fare: 469 },
  { day: "Mon", date: "1", fare: 423 },
  { day: "Tue", date: "2", fare: 405 },
  { day: "Wed", date: "3", fare: 438 },
];

const fareOptions = [
  { name: "Economy Basic", price: 418, baggage: "Personal item only", seat: "For a fee", changes: "Not allowed", refunds: "Not refundable" },
  { name: "Economy", price: 462, baggage: "1 checked bag", seat: "Included", changes: "Allowed, fee applies", refunds: "Credit only" },
  { name: "Premium", price: 598, baggage: "2 checked bags", seat: "Extra-legroom included", changes: "Allowed", refunds: "Credit or refund" },
  { name: "Business", price: 986, baggage: "2 checked bags", seat: "Lie-flat selection", changes: "Flexible", refunds: "Fully refundable" },
];

const flights: Array<{
  id: string;
  airline: string;
  flight: string;
  depart: string;
  arrive: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  layover: string;
  price: number;
  baggageIncluded: boolean;
  carbonKg: number;
  aircraft: string;
  pitch: string;
  wifi: string;
  meals: string;
  refund: string;
  layoverQuality: string;
}> = [
  { id: "sky-218", airline: "SkyRoute Air", flight: "SK 218", depart: "09:15", arrive: "20:30", departureAirport: "JFK", arrivalAirport: "LIS", duration: "7h 15m", durationMinutes: 435, stops: 0, layover: "Nonstop", price: 462, baggageIncluded: true, carbonKg: 211, aircraft: "Airbus A330neo", pitch: "31 in", wifi: "Streaming Wi‑Fi", meals: "Hot meal + snack", refund: "Credit or refund", layoverQuality: "No connection" },
  { id: "sky-302", airline: "Atlantic Connect", flight: "AC 302", depart: "17:40", arrive: "10:10", departureAirport: "JFK", arrivalAirport: "LIS", duration: "8h 30m", durationMinutes: 510, stops: 1, layover: "1h 20m in BOS", price: 418, baggageIncluded: false, carbonKg: 236, aircraft: "Boeing 787-9", pitch: "30 in", wifi: "Messaging Wi‑Fi", meals: "Meal service", refund: "Not refundable", layoverQuality: "Good — 1h 20m" },
];

const filters = ["Cheapest", "Fastest", "Best Value", "Fewest stops", "Arrival time", "Baggage included", "Greener flight"];

function exportCalendarEvent() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkyRoute//Flight reminder//EN",
    "BEGIN:VEVENT",
    "UID:skyroute-sk218-20260828@example.com",
    "DTSTAMP:20260821T000000Z",
    "DTSTART:20260828T131500Z",
    "DTEND:20260828T203000Z",
    "SUMMARY:SkyRoute flight SK 218 — JFK to LIS",
    "LOCATION:John F. Kennedy International Airport",
    "DESCRIPTION:Flight booking reminder from SkyRoute.",
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Your SkyRoute flight departs in three hours.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "skyroute-flight-reminder.ics";
  document.body.appendChild(anchor);
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  anchor.remove();
  toast.success("Your calendar reminder is ready", { description: "It includes a notification three hours before departure." });
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState("2");
  const [selectedFare, setSelectedFare] = useState("Economy");
  const [activeFilter, setActiveFilter] = useState("Best Value");
  const [detailsOpen, setDetailsOpen] = useState<string | null>("sky-218");
  const [priceWatchActive, setPriceWatchActive] = useState(false);
  const [activeMapDestination, setActiveMapDestination] = useState("Lisbon");
  const [paymentMethod, setPaymentMethod] = useState("Apple Pay");
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  const visibleFlights = useMemo(() => {
    const enriched = flights.map(flight => ({
      ...flight,
      score: calculateBestValueScore({
        price: flight.price,
        durationMinutes: flight.durationMinutes,
        stops: flight.stops,
        baggageIncluded: flight.baggageIncluded,
        carbonKg: flight.carbonKg,
      } satisfies FlightScoreInput),
    }));
    if (activeFilter === "Cheapest") return [...enriched].sort((a, b) => a.price - b.price);
    if (activeFilter === "Fastest") return [...enriched].sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (activeFilter === "Fewest stops") return [...enriched].sort((a, b) => a.stops - b.stops);
    if (activeFilter === "Arrival time") return sortByArrivalTime(enriched);
    if (activeFilter === "Baggage included") return [...enriched].sort((a, b) => Number(b.baggageIncluded) - Number(a.baggageIncluded));
    if (activeFilter === "Greener flight") return [...enriched].sort((a, b) => a.carbonKg - b.carbonKg);
    return [...enriched].sort((a, b) => b.score - a.score);
  }, [activeFilter]);

  const handleSearch = () => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.success("Flight options updated", { description: "Showing transparent total prices for JFK to Lisbon." });
  };

  const handlePriceWatch = () => {
    setPriceWatchActive(current => !current);
    toast.success(priceWatchActive ? "Price Watch paused" : "Price Watch enabled", {
      description: priceWatchActive ? "You can restart this alert any time." : "We will alert you when the route reaches $450 or less.",
    });
  };

  return (
    <div className="sky-app">
      <header className="site-shell topbar">
        <div className="brand" aria-label="SkyRoute home"><span className="brand-mark"><Plane /></span>skyroute.</div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#results">Flight search</a>
          <a href="#inspiration">Trip Inspiration</a>
          <a href="#journey">Manage booking</a>
        </nav>
        <div className="header-account">
          {authLoading ? <span className="account-loading">Checking account</span> : isAuthenticated ? <>
            <button className="account-button" onClick={() => document.getElementById("prototype-title")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="Open your SkyRoute account"><span className="account-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? "T"}</span><span>{user?.name?.split(" ")[0] ?? "Traveller"}</span><UserRound size={15} /></button>
            <button className="sign-out-button" onClick={() => { void logout(); toast.message("Signed out of SkyRoute"); }} aria-label="Sign out"><LogOut size={15} /></button>
          </> : <button className="sign-in-button" onClick={startLogin}><LogIn size={16} />Sign in</button>}
          <button className="menu-button" aria-label="Open menu"><Menu size={20} /></button>
        </div>
      </header>

      <main>
        <section className="hero site-shell" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />Book smarter, not harder</span>
              <h1 id="hero-title">Travel should feel <em>easy.</em></h1>
              <p className="hero-copy">Transparent fares, flexible dates, and the details that make a journey work — all in one colorful, calm place.</p>
              <div className="hero-stats" aria-label="Flight booking benefits">
                <div className="hero-stat"><strong>Total price, early</strong><span>Taxes shown upfront</span></div>
                <div className="hero-stat"><strong>Flexible choices</strong><span>Compare every fare rule</span></div>
              </div>
            </div>
            <div className="hero-visual" aria-label="A SkyRoute aircraft banking through a soft dawn sky">
              <div className="hero-sky-glow" />
              <div className="hero-flight-path" aria-hidden="true" />
              <img className="hero-plane" src="/manus-storage/skyroute-3d-aircraft_e445272e.png" alt="3D-rendered SkyRoute airplane in flight" />
              <div className="visual-caption"><span>Next escape</span><h2>Salt air, tiled streets, late sunsets.</h2></div>
              <Plane className="orbit-plane" size={28} />
              <div className="route-chip"><small>JFK → LIS</small><strong>07h 15m nonstop</strong></div>
              <div className="traveller-snippet traveller-snippet-one"><img src="/manus-storage/travellers-together_93c4608f.jpg" alt="Friends travelling together outdoors" /></div>
              <div className="traveller-snippet traveller-snippet-two"><img src="/manus-storage/travellers-at-airport_409b1558.jpg" alt="Travellers walking through an airport" /></div>
            </div>
          </div>
        </section>

        <section className="site-shell search-panel" aria-label="Flight search">
          <div className="search-topline">
            <button className="trip-choice">Round trip <ChevronDown size={14} /></button>
            <span className="search-hint">All prices include taxes</span>
          </div>
          <div className="search-form">
            <button className="search-field" aria-label="From airport">
              <span className="search-field-icon"><Plane size={18} /></span>
              <span className="search-field-content"><span>From</span><strong>New York, JFK</strong></span>
            </button>
            <button className="search-field" aria-label="To airport">
              <span className="search-field-icon"><MapPin size={18} /></span>
              <span className="search-field-content"><span>To</span><strong>Lisbon, LIS</strong></span>
            </button>
            <button className="search-field" aria-label="Travel dates">
              <span className="search-field-icon"><CalendarDays size={18} /></span>
              <span className="search-field-content"><span>Travel dates</span><strong>Aug 28 — Sep 1</strong></span>
            </button>
            <button className="search-field" aria-label="Passengers and cabin class">
              <span className="search-field-icon"><UsersRound size={18} /></span>
              <span className="search-field-content"><span>Travellers</span><strong>1 adult · Economy</strong></span>
            </button>
            <button className="search-submit" onClick={handleSearch}>Search flights <ArrowRight size={17} /></button>
          </div>
          <label className="promo-row">Promo code <input placeholder="Add code" aria-label="Promo code" /></label>
        </section>

        <section className="section site-shell" aria-labelledby="flexible-title">
          <div className="section-heading">
            <div><span className="section-kicker">Choose with confidence</span><h2 id="flexible-title">Flexible date pricing</h2></div>
            <p className="section-description">Pick the day that feels right after seeing the price across your full travel window.</p>
          </div>
          <div className="calendar-card">
            <div className="calendar-header"><h3>August / September</h3><span>JFK → LIS · Economy</span></div>
            <div className="calendar-grid">
              {flexibleDates.map(option => <button key={option.date} className={`date-tile ${selectedDate === option.date ? "is-selected" : ""}`} onClick={() => setSelectedDate(option.date)} aria-pressed={selectedDate === option.date}>
                <span className="day">{option.day}</span><span className="date">{option.date}</span><span className="fare">${option.fare}</span>
              </button>)}
            </div>
            <p className="calendar-note"><Sparkles size={15} /><span><strong>Lowest fare:</strong> Tuesday, Sep 2 — save $64 compared with Sunday.</span></p>
          </div>
        </section>

        <section className="section site-shell" aria-labelledby="fares-title">
          <div className="section-heading">
            <div><span className="section-kicker">No hidden trade-offs</span><h2 id="fares-title">Clear fare comparison</h2></div>
            <p className="section-description">Bags, seats, changes, and refunds are shown before you choose. Your total is always easy to find.</p>
          </div>
          <div className="fare-grid">
            {fareOptions.map((fare, index) => <article className={`fare-card ${selectedFare === fare.name ? "is-chosen" : ""}`} key={fare.name}>
              {index === 1 && <span className="fare-tag">Balanced choice</span>}
              <h3>{fare.name}</h3><div className="fare-price">${fare.price} <small>total, inc. taxes</small></div>
              <ul className="fare-list">
                <li><Check />{fare.baggage}</li><li><Check />Seat selection: {fare.seat}</li><li><Check />Changes: {fare.changes}</li><li><Check />Refunds: {fare.refunds}</li>
              </ul>
              <button className={`fare-button ${selectedFare === fare.name ? "is-chosen" : ""}`} onClick={() => setSelectedFare(fare.name)}>{selectedFare === fare.name ? "Selected" : "Choose fare"}</button>
            </article>)}
          </div>
        </section>

        <section className="section site-shell" id="results" aria-labelledby="results-title">
          <div className="section-heading">
            <div><span className="section-kicker">Compare what matters</span><h2 id="results-title">Smart flight results</h2></div>
            <p className="section-description">Best Value considers total price, journey time, connections, baggage, and carbon — so the fastest answer is not always the cheapest one.</p>
          </div>
          <div className="result-toolbar" aria-label="Flight filters">
            <span className="filter-label"><SlidersHorizontal size={14} /> Filters</span>
            {filters.map(filter => <button key={filter} className={`filter-chip ${activeFilter === filter ? "is-active" : ""}`} onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter}>{filter}</button>)}
          </div>
          <div className="result-layout">
            <div className="flight-list">
              {visibleFlights.map(flight => <article className="flight-card" key={flight.id}>
                <div className="flight-card-top">
                  <div className="airline-mark"><span className="airline-logo"><Plane size={15} /></span><span>{flight.airline}<br />{flight.flight}</span></div>
                  <div className="flight-route">
                    <div><div className="time">{flight.depart}</div><div className="airport">{flight.departureAirport}</div></div>
                    <div className="flight-line"><span>{flight.duration} · {flight.layover}</span></div>
                    <div style={{ textAlign: "right" }}><div className="time">{flight.arrive}</div><div className="airport">{flight.arrivalAirport}</div></div>
                  </div>
                  <div className="flight-price"><div><strong>${flight.price}</strong><small> total, inc. taxes</small></div><span className="value-badge"><Sparkles size={12} />Best Value {flight.score}</span></div>
                </div>
                <button className="details-toggle" onClick={() => setDetailsOpen(detailsOpen === flight.id ? null : flight.id)} aria-expanded={detailsOpen === flight.id}><span>Flight details</span><ChevronDown size={15} style={{ transform: detailsOpen === flight.id ? "rotate(180deg)" : "none" }} /></button>
                {detailsOpen === flight.id && <div className="details-grid">
                  <div className="detail-pill"><span>Aircraft</span><strong>{flight.aircraft}</strong></div><div className="detail-pill"><span>Seat pitch</span><strong>{flight.pitch}</strong></div><div className="detail-pill"><span>Wi‑Fi</span><strong>{flight.wifi}</strong></div><div className="detail-pill"><span>Meals</span><strong>{flight.meals}</strong></div><div className="detail-pill"><span>Baggage</span><strong>{flight.baggageIncluded ? "1 checked bag" : "Personal item"}</strong></div><div className="detail-pill"><span>Refund rules</span><strong>{flight.refund}</strong></div><div className="detail-pill"><span>Layover quality</span><strong>{flight.layoverQuality}</strong></div><div className="detail-pill"><span>Carbon estimate</span><strong>{flight.carbonKg} kg CO₂e</strong></div><div className="detail-pill"><span>Greener flight</span><strong>{flight.carbonKg <= 220 ? "Lower estimate" : "Compare available"}</strong></div>
                </div>}
              </article>)}
            </div>
            <aside className="result-aside">
              <div className="watch-card"><BellRing size={21} /><h3>Price Watch</h3><p>Track JFK to Lisbon and get an alert if the total drops below your target.</p><button className="watch-button" onClick={handlePriceWatch}>{priceWatchActive ? "Pause Price Watch" : "Set Price Watch"}</button>{priceWatchActive && <span className="watch-active"><CircleCheck size={13} />Watching for $450 or less</span>}</div>
              <div className="transparency-card"><h3>What your total includes</h3><div className="transparency-row"><span>Fare</span><strong>$397</strong></div><div className="transparency-row"><span>Taxes & fees</span><strong>$65</strong></div><div className="transparency-row"><span>Expected baggage</span><strong>Included</strong></div><div className="transparency-row"><span>Total</span><strong>$462</strong></div></div>
            </aside>
          </div>
        </section>

        <section className="section site-shell" id="inspiration" aria-labelledby="inspiration-title">
          <div className="section-heading"><div><span className="section-kicker">Where next?</span><h2 id="inspiration-title">Trip Inspiration</h2></div><p className="section-description">Explore a few routes worth taking now. Select a marker to shift the destination preview.</p></div>
          <div className="inspiration-layout">
            <div className="map-board" aria-label="Interactive destination map showing Lisbon, Barcelona, and Marrakech">
              <span className="map-label">Interactive destination map</span>
              <svg viewBox="0 0 600 350" aria-hidden="true"><path d="M66 74c48-42 101-31 133 2 30 31 73 6 109 27 39 23 70 7 111 42 29 25 38 64 15 93-33 42-97 23-136 45-42 24-86 44-125 20-39-24-96-21-118-63-24-46-38-103 11-164Z" fill="rgba(73,167,154,.19)" /><path d="M308 117c55-35 134-7 163 41 26 44 2 88-45 102-40 12-45 57-101 39-55-19-79-69-60-117 8-21 23-44 43-64Z" fill="rgba(73,167,154,.16)" /><path d="M174 123 C254 87 307 110 370 164 S442 223 478 164" fill="none" stroke="#5a5bb4" strokeWidth="2" strokeDasharray="6 7" opacity=".65" /></svg>
              <button className={`destination-dot ${activeMapDestination === "Lisbon" ? "is-map-active" : ""}`} style={{ left: "38%", top: "42%" }} onClick={() => setActiveMapDestination("Lisbon")} aria-label="Show Lisbon"><MapPin size={16} /></button>
              <button className={`destination-dot ${activeMapDestination === "Barcelona" ? "is-map-active" : ""}`} style={{ left: "53%", top: "51%" }} onClick={() => setActiveMapDestination("Barcelona")} aria-label="Show Barcelona"><MapPin size={16} /></button>
              <button className={`destination-dot ${activeMapDestination === "Marrakech" ? "is-map-active" : ""}`} style={{ left: "63%", top: "72%" }} onClick={() => setActiveMapDestination("Marrakech")} aria-label="Show Marrakech"><MapPin size={16} /></button>
              <div className="destination-tooltip" style={{ left: "calc(38% + 30px)", top: "calc(42% - 7px)" }}>{activeMapDestination}<small>{activeMapDestination === "Lisbon" ? "Nonstop from New York" : activeMapDestination === "Barcelona" ? "Beach city pick" : "Market-city weekend"}</small></div>
            </div>
            <div className="inspiration-cards">
              <button className="destination-card" onClick={() => setActiveMapDestination("Lisbon")}><img src="/manus-storage/lisbon_4e2f7117.jpg" alt="Lisbon cityscape" /><span className="destination-copy"><span>Weekend escapes</span><strong>Lisbon</strong><small>Nonstop from $462</small></span></button>
              <button className="destination-card" onClick={() => setActiveMapDestination("Barcelona")}><img src="/manus-storage/barcelona_3782031b.jpg" alt="Barcelona beach" /><span className="destination-copy"><span>Beach trips under $300</span><strong>Barcelona</strong><small>Watch from $286</small></span></button>
              <button className="destination-card" onClick={() => setActiveMapDestination("Marrakech")}><img src="/manus-storage/marrakech_8ec8a246.jpg" alt="Marrakech landmark" /><span className="destination-copy"><span>Nonstop from your city</span><strong>Marrakech</strong><small>Warm nights, from $518</small></span></button>
              <button className="destination-card" onClick={() => setActiveMapDestination("Lisbon")} style={{ background: "#2f3067" }}><span className="destination-copy"><span>Find your route</span><strong>Follow the good weather.</strong><small>Use the map to explore.</small></span></button>
            </div>
          </div>
        </section>

        <section className="section site-shell" aria-labelledby="recommendations-title">
          <div className="section-heading"><div><span className="section-kicker">Stay a little longer</span><h2 id="recommendations-title">Hotel and recreational area recommendations</h2></div><p className="section-description">Thoughtful places near your booked destination, grouped so you can decide while your travel details are still fresh.</p></div>
          <div className="recommendations">
            <article className="recommend-card"><div className="recommend-top"><div className="recommend-title"><span className="recommend-icon"><Hotel size={18} /></span><div><h3>Near your arrival</h3><p>Lisbon · 25–35 min from LIS</p></div></div><MapPin size={18} color="#ff8566" /></div><div className="recommendation-item"><div><strong>Baixa / Chiado</strong><span>Walkable streets, restaurants, and river access</span></div><button onClick={() => toast.message("Baixa / Chiado saved for your stay")}>Save</button></div><div className="recommendation-item"><div><strong>Alfama</strong><span>Historic lanes and sunset viewpoints</span></div><button onClick={() => toast.message("Alfama saved for your stay")}>Save</button></div></article>
            <article className="recommend-card"><div className="recommend-top"><div className="recommend-title"><span className="recommend-icon"><Palmtree size={18} /></span><div><h3>Recreational areas</h3><p>Lisbon · easy day plans</p></div></div><Leaf size={18} color="#55bfae" /></div><div className="recommendation-item"><div><strong>Belém waterfront</strong><span>Riverside paths, monuments, and pastries</span></div><button onClick={() => toast.message("Belém waterfront saved for your trip")}>Save</button></div><div className="recommendation-item"><div><strong>Costa da Caparica</strong><span>Beach escape across the Tagus</span></div><button onClick={() => toast.message("Costa da Caparica saved for your trip")}>Save</button></div></article>
          </div>
        </section>

        <section className="section site-shell" id="journey" aria-label="Checkout and post-booking management">
          <div className="journey-grid">
            <article className="checkout-card"><div className="journey-card-top"><div><span className="section-kicker" style={{ color: "#8be3d3" }}>One clear path</span><h2>Mobile-first checkout</h2><p>One flight, one traveller, and a full total before payment.</p></div><Ticket size={23} color="#ffc275" /></div><div className="progress-steps"><span className="progress-step is-complete">1. Flight</span><span className="progress-step is-complete">2. Traveller</span><span className="progress-step">3. Pay</span></div><div className="passenger-profile"><span className="passenger-avatar">AM</span><div style={{ flex: 1 }}><strong>Alex Morgan</strong><span>Saved passenger profile · Passport on file</span></div><CircleCheck size={17} color="#8be3d3" /></div><div className="payment-options"><button className={`payment-option ${paymentMethod === "Apple Pay" ? "is-picked" : ""}`} onClick={() => setPaymentMethod("Apple Pay")}>Apple Pay</button><button className={`payment-option ${paymentMethod === "Google Pay" ? "is-picked" : ""}`} onClick={() => setPaymentMethod("Google Pay")}>Google Pay</button></div><button className="primary-action" onClick={() => toast.success(`${paymentMethod} selected`, { description: "The booking total remains $462, including taxes." })}>Continue with {paymentMethod} <ArrowRight size={16} /></button></article>
            <article className="manage-card"><div className="journey-card-top"><div><span className="section-kicker">After you book</span><h2>Post-booking management hub</h2><p>SK 218 · New York to Lisbon · Aug 28</p></div><Plane size={23} color="#ff8566" /></div><div className="manage-actions"><button className="manage-action" onClick={() => toast.message("Flight-change options opened")}><CalendarDays />Change flight</button><button className="manage-action" onClick={() => toast.message("Seat selection opened")}><Armchair />Select seats</button><button className="manage-action" onClick={() => toast.message("Baggage options opened")}><Luggage />Add bags</button><button className="manage-action" onClick={() => toast.message("Check-in will be available 24 hours before departure")}><CircleCheck />Check in</button><button className="manage-action" onClick={() => toast.message("Boarding pass download will be available after check-in")}><Download />Download boarding pass</button><button className="manage-action" onClick={() => toast.message("Wi‑Fi and meal details are included in your trip") }><Wifi />Trip details</button></div><div className="calendar-box"><strong>Calendar integration with pre-flight notifications</strong><span>Add the itinerary to your preferred calendar. The attached event includes a reminder three hours before your flight.</span><button className="calendar-button" onClick={exportCalendarEvent}><CalendarPlus size={14} />Add to calendar</button></div></article>
          </div>
        </section>
        <BookingWorkbench />
      </main>
      <footer className="site-shell footer">SkyRoute · Transparent fares, flexible dates, and stress-free trip management.</footer>
    </div>
  );
}
