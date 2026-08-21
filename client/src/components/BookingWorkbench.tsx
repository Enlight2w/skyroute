import { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  BellRing,
  Bookmark,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Globe2,
  HeartHandshake,
  Luggage,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { bookingStepFor, formatBookingPrice, type Currency } from "@/lib/bookingPrototypeLogic";
import {
  notificationEventLabels,
  notificationPreview,
  unreadNotificationCount,
  type DeliveryChannel,
  type NotificationEventKey,
} from "@/lib/notificationLogic";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type PrototypePage =
  | "Home / Flight Search"
  | "Search Results"
  | "Flight Details"
  | "Fare Comparison"
  | "Passenger Details"
  | "Seats & Add-ons"
  | "Payment"
  | "Booking Confirmation"
  | "Manage Trip"
  | "Notification Center";

const pages: PrototypePage[] = [
  "Home / Flight Search",
  "Search Results",
  "Flight Details",
  "Fare Comparison",
  "Passenger Details",
  "Seats & Add-ons",
  "Payment",
  "Booking Confirmation",
  "Manage Trip",
  "Notification Center",
];

const prototypePageByHash: Record<string, PrototypePage> = {
  "#home-flight-search": "Home / Flight Search",
  "#search-results": "Search Results",
  "#flight-details": "Flight Details",
  "#fare-comparison": "Fare Comparison",
  "#passenger-details": "Passenger Details",
  "#seats-add-ons": "Seats & Add-ons",
  "#payment": "Payment",
  "#booking-confirmation": "Booking Confirmation",
  "#manage-trip": "Manage Trip",
  "#notification-center": "Notification Center",
};

function getPrototypePageFromHash(): PrototypePage {
  if (typeof window === "undefined") return "Home / Flight Search";
  return prototypePageByHash[window.location.hash] ?? "Home / Flight Search";
}

const localFlight = {
  depart: "Fri, Aug 28 · 09:15",
  arrive: "Fri, Aug 28 · 20:30",
  route: "New York (JFK) → Lisbon (LIS)",
  aircraft: "Airbus A330neo",
};

const currencyOptions: Currency[] = ["USD", "EUR", "GBP", "AED"];
const addOns = ["Extra baggage", "Plant-forward meal", "Travel insurance", "Airport transfer", "Lounge access"];
type SeatKind = "available" | "occupied" | "preferred" | "extra";

const cabinRows: { row: number; seats: { code: string; kind: SeatKind }[] }[] = [
  { row: 1, seats: [{ code: "1A", kind: "extra" }, { code: "1B", kind: "preferred" }, { code: "1C", kind: "preferred" }, { code: "1D", kind: "extra" }] },
  { row: 2, seats: [{ code: "2A", kind: "preferred" }, { code: "2B", kind: "occupied" }, { code: "2C", kind: "available" }, { code: "2D", kind: "preferred" }] },
  { row: 3, seats: [{ code: "3A", kind: "available" }, { code: "3B", kind: "available" }, { code: "3C", kind: "available" }, { code: "3D", kind: "occupied" }] },
  { row: 4, seats: [{ code: "4A", kind: "available" }, { code: "4B", kind: "occupied" }, { code: "4C", kind: "available" }, { code: "4D", kind: "available" }] },
  { row: 5, seats: [{ code: "5A", kind: "available" }, { code: "5B", kind: "available" }, { code: "5C", kind: "occupied" }, { code: "5D", kind: "available" }] },
];
const seatSurcharges: Record<SeatKind, number> = { available: 0, occupied: 0, preferred: 12, extra: 26 };

function ActionButton({ children, onClick, secondary = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean }) {
  return <button className={`workbench-action ${secondary ? "is-secondary" : ""}`} onClick={onClick}>{children}<ChevronRight size={15} /></button>;
}

export default function BookingWorkbench() {
  const [page, setPage] = useState<PrototypePage>(getPrototypePageFromHash);
  const [tripType, setTripType] = useState("Round-trip");
  const [flexibleDates, setFlexibleDates] = useState(true);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [language, setLanguage] = useState("English");
  const [filters, setFilters] = useState<string[]>(["Best Value"]);
  const [selectedFare, setSelectedFare] = useState("Standard");
  const [selectedSeat, setSelectedSeat] = useState("3A");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(["Plant-forward meal"]);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [confirmationChannels, setConfirmationChannels] = useState<string[]>(["Email"]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [inventoryRefresh, setInventoryRefresh] = useState(0);
  const [routeSaved, setRouteSaved] = useState(false);
  const [priceTarget, setPriceTarget] = useState(450);
  const [notificationEvents, setNotificationEvents] = useState<Record<NotificationEventKey, boolean>>({
    priceDrop: true,
    flightStatus: true,
    checkIn: true,
    gate: true,
    calendar: true,
  });
  const [notificationChannels, setNotificationChannels] = useState<DeliveryChannel[]>(["In-app", "Email"]);
  const [notificationTiming, setNotificationTiming] = useState("Instant");
  const [notificationFocus, setNotificationFocus] = useState<NotificationEventKey>("priceDrop");
  const [notificationRead, setNotificationRead] = useState<Record<string, boolean>>({ price: false, checkin: false, calendar: true });
  const [notificationHydrated, setNotificationHydrated] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: inventory, isFetching: inventoryLoading } = trpc.inventory.search.useQuery({ refresh: inventoryRefresh });
  const notificationQuery = trpc.notification.get.useQuery(undefined, { enabled: isAuthenticated });
  const trpcUtils = trpc.useUtils();
  const saveNotificationPreferences = trpc.notification.savePreferences.useMutation({
    onSuccess: result => {
      setNotificationHydrated(true);
      toast.success(result.persisted ? "Notification settings saved" : "Notification settings saved for this prototype session");
      trpcUtils.notification.get.invalidate();
    },
    onError: () => toast.error("Sign in to save notification settings across sessions"),
  });
  const sendMockNotification = trpc.notification.sendMock.useMutation({
    onSuccess: result => {
      toast.success(`${result.delivery.channel.toUpperCase()} notification simulated`, { description: result.delivery.recipientMasked });
      trpcUtils.notification.get.invalidate();
    },
    onError: () => toast.error("Sign in to send a mock Email or SMS notification"),
  });

  useEffect(() => {
    const preferences = notificationQuery.data?.preferences;
    if (!preferences || notificationHydrated) return;
    setNotificationEvents({
      priceDrop: preferences.priceDropEnabled,
      flightStatus: preferences.flightStatusEnabled,
      checkIn: preferences.checkInEnabled,
      gate: preferences.gateEnabled,
      calendar: preferences.calendarEnabled,
    });
    setNotificationChannels(([
      preferences.inAppEnabled && "In-app",
      preferences.emailEnabled && "Email",
      preferences.smsEnabled && "SMS",
      preferences.whatsappEnabled && "WhatsApp",
    ].filter(Boolean)) as DeliveryChannel[]);
    setNotificationTiming(preferences.timing);
    setPriceTarget(preferences.priceTarget);
    setNotificationHydrated(true);
  }, [notificationHydrated, notificationQuery.data?.preferences]);

  const selectedSeatData = cabinRows.flatMap(row => row.seats).find(seat => seat.code === selectedSeat);
  const seatSurcharge = selectedSeatData ? seatSurcharges[selectedSeatData.kind] : 0;
  const total = useMemo(() => 462 + selectedAddOns.length * 18 + seatSurcharge + (selectedFare === "Flex" ? 136 : selectedFare === "Business" ? 524 : 0), [selectedAddOns, selectedFare, seatSurcharge]);
  const primaryQuote = inventory?.flights[0];
  const priceDropReached = Boolean(routeSaved && primaryQuote && primaryQuote.totalPrice <= priceTarget);
  const alertItems = [
    { id: "price", event: "priceDrop" as const, context: "JFK → LIS", title: priceDropReached ? `Price moved to ${formatBookingPrice(primaryQuote?.totalPrice ?? 0, currency)}` : `Price Watch is set below ${formatBookingPrice(priceTarget, currency)}`, detail: priceDropReached ? "Your target has been met." : "Refresh the mock quote to simulate a change." },
    { id: "checkin", event: "checkIn" as const, context: "SK 218 · JFK → LIS", title: "Check-in opens in 24 hours", detail: "We will notify you when online check-in is available." },
    { id: "calendar", event: "calendar" as const, context: "Aug 28 · 09:15", title: "Calendar reminder is ready", detail: "A three-hour pre-flight reminder is attached to your itinerary." },
  ].filter(alert => notificationEvents[alert.event]).map(alert => ({ ...alert, read: notificationRead[alert.id] }));
  const unreadAlerts = unreadNotificationCount(alertItems);
  const toggleNotificationEvent = (event: NotificationEventKey) => setNotificationEvents(active => ({ ...active, [event]: !active[event] }));
  const toggleNotificationChannel = (channel: DeliveryChannel) => setNotificationChannels(active => active.includes(channel) ? active.filter(item => item !== channel) : [...active, channel]);
  const persistNotificationPreferences = () => {
    saveNotificationPreferences.mutate({
      priceDropEnabled: notificationEvents.priceDrop,
      flightStatusEnabled: notificationEvents.flightStatus,
      checkInEnabled: notificationEvents.checkIn,
      gateEnabled: notificationEvents.gate,
      calendarEnabled: notificationEvents.calendar,
      inAppEnabled: notificationChannels.includes("In-app"),
      emailEnabled: notificationChannels.includes("Email"),
      smsEnabled: notificationChannels.includes("SMS"),
      whatsappEnabled: notificationChannels.includes("WhatsApp"),
      timing: notificationTiming,
      priceTarget,
    });
  };
  const sendMockDelivery = (channel: "email" | "sms") => {
    sendMockNotification.mutate({
      channel,
      eventType: notificationEventLabels[notificationFocus],
      message: `${notificationPreview(notificationFocus, notificationTiming, notificationChannels)} · JFK → LIS`,
    });
  };
  const deliveryHistory = notificationQuery.data?.deliveryHistory ?? [];
  const toggleFilter = (value: string) => setFilters(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const toggleAddOn = (value: string) => setSelectedAddOns(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const toggleChannel = (value: string) => setConfirmationChannels(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const advance = (next: PrototypePage) => {
    setPage(next);
    const nextHash = Object.entries(prototypePageByHash).find(([, pageName]) => pageName === next)?.[0];
    if (nextHash) window.history.replaceState(null, "", nextHash);
  };

  return (
    <section className="workbench-section" aria-labelledby="prototype-title" dir={language === "Arabic" ? "rtl" : "ltr"}>
      <div className="site-shell">
        <div className="workbench-heading">
          <div><span className="section-kicker">Working prototype</span><h2 id="prototype-title">Book, prepare, and manage — in one flow.</h2></div>
          <p>The screens below complete the requested first version. Search Results now reads from a safe mock airline-inventory contract, with dynamic quotes and availability for prototype testing.</p>
        </div>

        <div className="workbench-settings" aria-label="Global booking settings">
          <span><Globe2 size={15} />Global settings</span>
          <label>Currency<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}>{currencyOptions.map(option => <option key={option}>{option}</option>)}</select></label>
          <label>Language<select value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Français</option><option>Español</option><option>Arabic</option></select></label>
          <span className="rtl-chip">{language === "Arabic" ? "RTL preview active" : "RTL-ready"}</span>
        </div>

        <div className="prototype-nav" role="tablist" aria-label="SkyRoute core pages">
          {pages.map(item => <button key={item} role="tab" aria-selected={page === item} className={page === item ? "is-active" : ""} onClick={() => setPage(item)}>{item}</button>)}
        </div>

        {page === "Home / Flight Search" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Home / Flight Search</span><h3>Start with the journey you mean to take.</h3></div><Plane size={26} /></div>
          <div className="trip-type-switch">{["One-way", "Round-trip", "Multi-city"].map(option => <button key={option} className={tripType === option ? "is-active" : ""} onClick={() => setTripType(option)}>{option}</button>)}</div>
          <div className="prototype-search-grid"><label>From<input defaultValue="New York, JFK" /></label><label>To<input defaultValue="Lisbon, LIS" /></label><label>Travel dates<input defaultValue="Aug 28 — Sep 1" /></label><label>Passengers<input defaultValue="1 adult" /></label><label>Cabin class<select defaultValue="Economy"><option>Economy</option><option>Premium Economy</option><option>Business</option></select></label></div>
          <div className="search-lower-row"><button className={`control-toggle ${flexibleDates ? "is-active" : ""}`} onClick={() => setFlexibleDates(value => !value)}><CalendarDays size={15} />Flexible dates <span>{flexibleDates ? "On" : "Off"}</span></button><label className="inline-field">Promo code <input placeholder="SKY15" /></label><ActionButton onClick={() => advance("Search Results")}>Search flights</ActionButton></div>
          <div className="route-discovery"><div><strong>Recent searches</strong><button onClick={() => toast.message("JFK to Lisbon restored")}>JFK → LIS · 28 Aug</button><button onClick={() => toast.message("LHR to DXB restored")}>LHR → DXB · 04 Sep</button></div><div><strong>Popular routes</strong><button onClick={() => toast.message("Barcelona route selected")}>New York → Barcelona</button><button onClick={() => toast.message("Marrakech route selected")}>London → Marrakech</button></div></div>
        </div>}

        {page === "Search Results" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Search Results</span><h3>Compare the trade-offs before you commit.</h3></div><span className="prototype-total">From {formatBookingPrice(primaryQuote?.totalPrice ?? 418, currency)}</span></div>
          <div className="inventory-status"><span><span className="live-dot" />{inventory?.provider ?? "Loading mock airline inventory"} · {inventory?.refreshedLabel ?? "Fetching quote"}</span><button onClick={() => setInventoryRefresh(value => value + 1)} disabled={inventoryLoading}><RefreshCw size={14} className={inventoryLoading ? "is-spinning" : ""} />Refresh quote</button></div>
          <div className="nearby-strip"><span>Cheaper nearby dates</span>{["Thu 28 · $446", "Fri 29 · $418", "Sat 30 · $431", "Tue 2 · $405"].map((date, index) => <button key={date} className={index === 3 ? "is-cheapest" : ""}>{date}</button>)}</div>
          <div className="full-filter-row">{["Price", "Stops", "Departure time", "Arrival time", "Airline", "Baggage", "Carbon estimate"].map(filter => <button key={filter} className={filters.includes(filter) ? "is-active" : ""} onClick={() => toggleFilter(filter)}>{filter}</button>)}</div>
          <div className="sort-row"><span>Sort by</span>{["Cheapest", "Fastest", "Best Value"].map(sort => <button key={sort} className={filters.includes(sort) ? "is-active" : ""} onClick={() => setFilters(active => [...active.filter(item => !["Cheapest", "Fastest", "Best Value"].includes(item)), sort])}>{sort}</button>)}</div>
          {(inventory?.flights ?? []).map(flight => <article className="result-summary-card" key={flight.id}><div><span>{flight.airline} · {flight.flightNumber}</span><strong>{flight.departureTime} <i>{flight.duration}</i> {flight.arrivalTime}</strong><small>{flight.baggage} · {flight.refund} · {flight.carbonKg} kg CO₂e · {flight.seatsRemaining} seats left</small></div><div><b>{formatBookingPrice(flight.totalPrice, currency)}</b><small>Total including taxes</small><ActionButton onClick={() => advance("Flight Details")}>Details</ActionButton></div></article>)}
          <div className="route-watch-card"><div><Bookmark size={19} /><div><strong>Save favorite route</strong><span>JFK → LIS · receive a visible alert when the live mock quote meets your target.</span></div></div><div className="route-watch-controls"><label>Alert me below <input type="number" value={priceTarget} onChange={event => setPriceTarget(Number(event.target.value) || 0)} /></label><button className={routeSaved ? "is-saved" : ""} onClick={() => { setRouteSaved(value => !value); toast.success(routeSaved ? "Favorite route removed" : "Favorite route saved"); }}><Bookmark size={14} />{routeSaved ? "Saved" : "Save route"}</button></div>{priceDropReached && <div className="price-drop-alert"><BellRing size={16} /><span>Price drop alert: the current quote of {formatBookingPrice(primaryQuote?.totalPrice ?? 0, currency)} meets your target of {formatBookingPrice(priceTarget, currency)}.</span></div>}</div>
        </div>}

        {page === "Flight Details" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Flight Details</span><h3>Everything you need, in plain language.</h3></div><Ticket size={25} /></div>
          <div className="itinerary-band"><span>{localFlight.depart}</span><strong>{localFlight.route}</strong><span>{localFlight.arrive}</span></div>
          <div className="detail-grid"><div><span>Layover details</span><strong>Nonstop — no connection risk</strong></div><div><span>Aircraft</span><strong>{localFlight.aircraft}</strong></div><div><span>Seat pitch</span><strong>31 in</strong></div><div><span>Wi‑Fi & meals</span><strong>Streaming Wi‑Fi · hot meal</strong></div></div>
          <div className="plain-language"><ShieldCheck size={19} /><div><strong>Fare conditions in plain language</strong><p>You can change this fare once before departure. A refund returns to your original payment method when the airline cancels, or is available as trip credit when you choose to cancel.</p></div></div>
          <div className="two-actions"><ActionButton onClick={() => advance("Fare Comparison")}>Compare fares</ActionButton><ActionButton secondary onClick={() => advance("Seats & Add-ons")}>Add baggage or upgrade</ActionButton></div>
        </div>}

        {page === "Fare Comparison" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Fare Comparison</span><h3>Basic, Standard, Flex, Business.</h3></div><ReceiptText size={25} /></div>
          <div className="mini-fare-grid">{[
            ["Basic", 418, "Personal item", "Pay to choose", "No changes", "No refund", "220 mi"],
            ["Standard", 462, "1 checked bag", "Seat included", "Fee applies", "Trip credit", "480 mi"],
            ["Flex", 598, "2 checked bags", "Extra legroom", "Flexible", "Refundable", "650 mi"],
            ["Business", 986, "2 checked bags", "Lie-flat choice", "Flexible", "Fully refundable", "1,200 mi"],
          ].map(([name, price, bags, seat, changes, refunds, miles]) => <button key={String(name)} className={`mini-fare ${selectedFare === name ? "is-selected" : ""}`} onClick={() => setSelectedFare(String(name))}><strong>{name}</strong><b>{formatBookingPrice(Number(price), currency)}</b><span>{bags}</span><span>{seat}</span><span>{changes}</span><span>{refunds}</span><span>{miles}</span></button>)}</div>
          <div className="total-callout"><span>Total price shown upfront</span><strong>{formatBookingPrice(total, currency)}</strong><ActionButton onClick={() => advance("Passenger Details")}>Continue with {selectedFare}</ActionButton></div>
        </div>}

        {page === "Passenger Details" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Passenger Details</span><h3>International details, handled clearly.</h3></div><UsersRound size={25} /></div>
          <div className="saved-traveller"><UserRoundCheck size={20} /><div><strong>Alex Morgan</strong><span>Saved traveller · Passport information securely stored for this prototype</span></div><button onClick={() => toast.message("Saved traveller applied")}>Use traveller</button></div>
          <div className="form-grid"><label>Full legal name<input defaultValue="Alex Morgan" /></label><label>Date of birth<input defaultValue="12 Jun 1992" /></label><label>Nationality<select defaultValue="United States"><option>United States</option><option>Portugal</option><option>United Kingdom</option><option>United Arab Emirates</option></select></label><label>Passport / ID<input placeholder="Passport number" /></label><label>International phone<input placeholder="+1 212 555 0142" /></label><label>Address format<input placeholder="Street, city, postal code, country" /></label></div>
          <div className="assistance-row"><HeartHandshake size={19} /><div><strong>Accessibility and special assistance</strong><span>Wheelchair assistance, mobility support, service animal, or another need.</span></div><button onClick={() => toast.message("Special assistance request recorded")}>Add request</button></div>
          <div className="visa-reminder"><Globe2 size={17} /><span>Country-specific passport and visa reminder: confirm entry requirements for Portugal before travel.</span></div>
          <ActionButton onClick={() => advance("Seats & Add-ons")}>Continue to seats</ActionButton>
        </div>}

        {page === "Seats & Add-ons" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Seats & Add-ons</span><h3>Shape the flight around you.</h3></div><Armchair size={25} /></div>
          <div className="seat-and-addon-grid"><div><span className="sub-label">Visual seat selection</span><div className="seat-legend"><span className="is-available">Available</span><span className="is-preferred">Preferred</span><span className="is-extra">Extra legroom</span><span className="is-occupied">Occupied</span></div><div className="cabin-shell" aria-label="SkyRoute Air seat map"><div className="cabin-nose"><Plane size={19} /></div><div className="seat-column-head"><span>A</span><span>B</span><i>Aisle</i><span>C</span><span>D</span></div>{cabinRows.map(cabinRow => <div className="cabin-row" key={cabinRow.row}><span className="row-number">{cabinRow.row}</span>{cabinRow.seats.map(seat => <button key={seat.code} className={`cabin-seat is-${seat.kind} ${selectedSeat === seat.code ? "is-selected" : ""}`} onClick={() => seat.kind !== "occupied" && setSelectedSeat(seat.code)} disabled={seat.kind === "occupied"} aria-label={`${seat.code}, ${seat.kind === "extra" ? "extra legroom" : seat.kind}`}><Armchair size={15} /><small>{seat.code}</small></button>)}</div>)}<div className="cabin-tail" /></div><p>Selected: <strong>{selectedSeat}</strong> · {selectedSeatData?.kind === "extra" ? `${formatBookingPrice(seatSurcharge, currency)} extra legroom` : selectedSeatData?.kind === "preferred" ? `${formatBookingPrice(seatSurcharge, currency)} preferred seat` : "Standard seat included"}</p></div><div><span className="sub-label">Add-ons</span>{addOns.map(addOn => <button className={`addon-choice ${selectedAddOns.includes(addOn) ? "is-selected" : ""}`} key={addOn} onClick={() => toggleAddOn(addOn)}><span>{addOn}</span><Check size={15} /></button>)}</div></div>
          <div className="total-callout"><span>Updated total including taxes</span><strong>{formatBookingPrice(total, currency)}</strong><ActionButton onClick={() => advance("Payment")}>Continue to payment</ActionButton></div>
        </div>}

        {page === "Payment" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Payment</span><h3>Choose a payment method with a clear total.</h3></div><CreditCard size={25} /></div>
          <div className="payment-methods">{["Card", "Apple Pay", "Google Pay", "PayPal", "Local payment"].map(method => <button key={method} className={paymentMethod === method ? "is-selected" : ""} onClick={() => setPaymentMethod(method)}>{method}</button>)}</div>
          <div className="payment-grid"><div className="form-grid"><label>Promo code<input placeholder="Enter code" /></label><label>Voucher<input placeholder="Voucher number" /></label><label>Loyalty points<input defaultValue="0 points" /></label><label>Billing address<input placeholder="Address in local format" /></label></div><div className="payment-summary"><strong>Clear taxes and fees</strong><span>Fare <b>{formatBookingPrice(397, currency)}</b></span><span>Taxes & fees <b>{formatBookingPrice(65, currency)}</b></span><span>Add-ons <b>{formatBookingPrice(selectedAddOns.length * 18, currency)}</b></span><div><span>Total in {currency}</span><b>{formatBookingPrice(total, currency)}</b></div></div></div>
          <div className="legal-note"><FileText size={16} />By continuing, you agree to the airline fare rules, refund policy, taxes, and local payment terms displayed above.</div>
          <ActionButton onClick={() => advance("Booking Confirmation")}>Pay with {paymentMethod}</ActionButton>
        </div>}

        {page === "Booking Confirmation" && <div className="prototype-panel confirmation-panel">
          <CircleCheck size={35} /><div><span className="panel-eyebrow">Booking Confirmation</span><h3>Your route is reserved.</h3><p>Booking reference <strong>SR-8F42L</strong> · New York to Lisbon · Aug 28</p></div>
          <div className="confirmation-actions"><button onClick={() => toast.success("Itinerary download prepared")}><Download size={16} />Download itinerary</button><button onClick={() => toast.success("Calendar event prepared")}><CalendarPlus size={16} />Add to calendar</button></div>
          <div className="channel-choices"><span>Send confirmation by</span>{[{ channel: "Email", Icon: Mail }, { channel: "SMS", Icon: Phone }, { channel: "WhatsApp", Icon: MessageCircle }].map(({ channel, Icon }) => <button key={channel} className={confirmationChannels.includes(channel) ? "is-selected" : ""} onClick={() => toggleChannel(channel)}><Icon size={15} />{channel}</button>)}</div>
          <ActionButton onClick={() => { toast.success("Confirmation preferences saved"); advance("Manage Trip"); }}>Open Manage Trip</ActionButton>
        </div>}

        {page === "Manage Trip" && <div className="prototype-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Manage Trip</span><h3>Your journey stays flexible after booking.</h3></div><Ticket size={25} /></div>
          <div className="manage-grid"><button onClick={() => toast.message("Change-flight options opened")}><CalendarDays />Change flight</button><button onClick={() => toast.message("Cancellation and refund policy opened")}><ReceiptText />Cancel / refund</button><button onClick={() => advance("Seats & Add-ons")}><Armchair />Choose seats</button><button onClick={() => advance("Seats & Add-ons")}><Luggage />Add baggage</button><button onClick={() => toast.message("Check-in becomes available 24 hours before departure")}><CircleCheck />Check in</button><button onClick={() => toast.message("Boarding pass becomes available after check-in")}><Download />Download boarding pass</button><button onClick={() => advance("Notification Center")}><BellRing />Custom notifications <span className="manage-notification-count">{unreadAlerts}</span></button></div>
          <div className="alert-control"><BellRing size={20} /><div><strong>Flight status alerts</strong><span>Arrival, gate, and schedule changes shown in the traveller’s local time zone.</span></div><button className={alertsEnabled ? "is-on" : ""} onClick={() => setAlertsEnabled(value => !value)}>{alertsEnabled ? "On" : "Off"}</button></div>
        </div>}

        {page === "Notification Center" && <div className="prototype-panel notification-center-panel">
          <div className="panel-intro"><div><span className="panel-eyebrow">Custom notifications</span><h3>Choose what matters. Hear it your way.</h3></div><div className="notification-count"><BellRing size={18} />{unreadAlerts} unread</div></div>
          <div className={`notification-persistence-banner ${isAuthenticated ? "is-connected" : ""}`}><ShieldCheck size={16} /><span>{isAuthenticated ? (notificationQuery.isLoading ? "Loading your saved notification settings…" : "Signed in — preferences and delivery history are connected to your account.") : "Prototype mode — sign in to save preferences and delivery history across sessions."}</span></div>
          <div className="notification-layout">
            <div className="notification-settings-block"><span className="sub-label">Alert types</span><div className="notification-event-list">{(Object.keys(notificationEventLabels) as NotificationEventKey[]).map(event => <button key={event} className={`${notificationEvents[event] ? "is-enabled" : ""} ${notificationFocus === event ? "is-focused" : ""}`} onClick={() => { setNotificationFocus(event); toggleNotificationEvent(event); }}><span><strong>{notificationEventLabels[event]}</strong><small>{event === "priceDrop" ? "Route target reached" : event === "flightStatus" ? "Delays, gates, cancellations" : event === "checkIn" ? "When check-in becomes available" : event === "gate" ? "At gate assignment" : "Pre-flight itinerary reminder"}</small></span><i>{notificationEvents[event] ? "On" : "Off"}</i></button>)}</div></div>
            <div className="notification-settings-block"><span className="sub-label">Delivery and timing</span><div className="notification-channel-list">{(["In-app", "Email", "SMS", "WhatsApp"] as DeliveryChannel[]).map(channel => <button key={channel} className={notificationChannels.includes(channel) ? "is-selected" : ""} onClick={() => toggleNotificationChannel(channel)}>{channel}<Check size={14} /></button>)}</div><label className="notification-timing">Timing<select value={notificationTiming} onChange={event => setNotificationTiming(event.target.value)}><option>Instant</option><option>At gate assignment</option><option>24 hours before departure</option><option>3 hours before departure</option></select></label><div className="delivery-preview"><span>Delivery preview</span><strong>{notificationPreview(notificationFocus, notificationTiming, notificationChannels)}</strong><p>{notificationFocus === "priceDrop" ? "JFK → LIS is now ready for a price-watch update." : "SK 218 · New York to Lisbon · Aug 28"}</p><div className="mock-delivery-actions"><button onClick={() => sendMockDelivery("email")} disabled={sendMockNotification.isPending}>Send mock Email</button><button onClick={() => sendMockDelivery("sms")} disabled={sendMockNotification.isPending}>Send mock SMS</button></div></div></div>
          </div>
          <button className="save-notification-settings" onClick={persistNotificationPreferences} disabled={saveNotificationPreferences.isPending}>{saveNotificationPreferences.isPending ? "Saving notification settings…" : "Save notification settings"}</button>
          <div className="alert-center"><div className="alert-center-heading"><div><span className="sub-label">In-app alert center</span><strong>Flight and route updates</strong></div><button onClick={() => setNotificationRead({ price: true, checkin: true, calendar: true })}>Mark all read</button></div>{alertItems.map(alert => <article className={`in-app-alert ${alert.read ? "is-read" : ""}`} key={alert.id}><span className="alert-context">{alert.context}</span><div><strong>{alert.title}</strong><p>{alert.detail}</p></div><button onClick={() => setNotificationRead(active => ({ ...active, [alert.id]: true }))}>{alert.read ? "Read" : "Mark read"}</button></article>)}</div>
          <div className="delivery-history"><div className="alert-center-heading"><div><span className="sub-label">Mock provider activity</span><strong>Delivery history</strong></div><span>{deliveryHistory.length} logged</span></div>{deliveryHistory.length > 0 ? deliveryHistory.map(delivery => <article key={delivery.id} className="delivery-history-item"><span>{delivery.channel.toUpperCase()}</span><div><strong>{delivery.subject}</strong><p>{delivery.provider} · {delivery.recipientMasked} · {delivery.status}</p></div></article>) : <p>No mock Email or SMS sends yet. Send one from the delivery preview to create a history record.</p>}</div>
        </div>}

        <div className="prototype-stepper" aria-label="Booking workflow status">{["Passenger Details", "Seats & Add-ons", "Payment", "Booking Confirmation"].map((step, index) => <span key={step} className={bookingStepFor(page) > index ? "is-complete" : ""}>{index + 1}. {step}</span>)}</div>
      </div>
    </section>
  );
}
