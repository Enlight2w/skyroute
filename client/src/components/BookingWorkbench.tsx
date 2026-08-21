import { useMemo, useState } from "react";
import {
  Armchair,
  BellRing,
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
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { bookingStepFor, formatBookingPrice, type Currency } from "@/lib/bookingPrototypeLogic";

type PrototypePage =
  | "Home / Flight Search"
  | "Search Results"
  | "Flight Details"
  | "Fare Comparison"
  | "Passenger Details"
  | "Seats & Add-ons"
  | "Payment"
  | "Booking Confirmation"
  | "Manage Trip";

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
];

const localFlight = {
  depart: "Fri, Aug 28 · 09:15",
  arrive: "Fri, Aug 28 · 20:30",
  route: "New York (JFK) → Lisbon (LIS)",
  aircraft: "Airbus A330neo",
};

const currencyOptions: Currency[] = ["USD", "EUR", "GBP", "AED"];
const addOns = ["Extra baggage", "Plant-forward meal", "Travel insurance", "Airport transfer", "Lounge access"];

function ActionButton({ children, onClick, secondary = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean }) {
  return <button className={`workbench-action ${secondary ? "is-secondary" : ""}`} onClick={onClick}>{children}<ChevronRight size={15} /></button>;
}

export default function BookingWorkbench() {
  const [page, setPage] = useState<PrototypePage>("Home / Flight Search");
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

  const total = useMemo(() => 462 + selectedAddOns.length * 18 + (selectedFare === "Flex" ? 136 : selectedFare === "Business" ? 524 : 0), [selectedAddOns, selectedFare]);
  const toggleFilter = (value: string) => setFilters(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const toggleAddOn = (value: string) => setSelectedAddOns(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const toggleChannel = (value: string) => setConfirmationChannels(active => active.includes(value) ? active.filter(item => item !== value) : [...active, value]);
  const advance = (next: PrototypePage) => setPage(next);

  return (
    <section className="workbench-section" aria-labelledby="prototype-title" dir={language === "Arabic" ? "rtl" : "ltr"}>
      <div className="site-shell">
        <div className="workbench-heading">
          <div><span className="section-kicker">Working prototype</span><h2 id="prototype-title">Book, prepare, and manage — in one flow.</h2></div>
          <p>The screens below complete the requested first version. Every control is interactive, using local prototype data rather than live airline inventory or payment credentials.</p>
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
          <div className="panel-intro"><div><span className="panel-eyebrow">Search Results</span><h3>Compare the trade-offs before you commit.</h3></div><span className="prototype-total">From {formatBookingPrice(418, currency)}</span></div>
          <div className="nearby-strip"><span>Cheaper nearby dates</span>{["Thu 28 · $446", "Fri 29 · $418", "Sat 30 · $431", "Tue 2 · $405"].map((date, index) => <button key={date} className={index === 3 ? "is-cheapest" : ""}>{date}</button>)}</div>
          <div className="full-filter-row">{["Price", "Stops", "Departure time", "Arrival time", "Airline", "Baggage", "Carbon estimate"].map(filter => <button key={filter} className={filters.includes(filter) ? "is-active" : ""} onClick={() => toggleFilter(filter)}>{filter}</button>)}</div>
          <div className="sort-row"><span>Sort by</span>{["Cheapest", "Fastest", "Best Value"].map(sort => <button key={sort} className={filters.includes(sort) ? "is-active" : ""} onClick={() => setFilters(active => [...active.filter(item => !["Cheapest", "Fastest", "Best Value"].includes(item)), sort])}>{sort}</button>)}</div>
          <article className="result-summary-card"><div><span>SkyRoute Air · SK 218</span><strong>09:15 JFK <i>07h 15m nonstop</i> 20:30 LIS</strong><small>1 checked bag · Credit or refund · 211 kg CO₂e</small></div><div><b>{formatBookingPrice(462, currency)}</b><small>Total including taxes</small><ActionButton onClick={() => advance("Flight Details")}>Details</ActionButton></div></article>
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
          <div className="seat-and-addon-grid"><div><span className="sub-label">Seat map</span><div className="seat-map">{["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"].map(seat => <button key={seat} className={selectedSeat === seat ? "is-selected" : seat === "2B" || seat === "3D" ? "is-unavailable" : ""} onClick={() => seat !== "2B" && seat !== "3D" && setSelectedSeat(seat)} disabled={seat === "2B" || seat === "3D"}>{seat}</button>)}</div><p>Selected: <strong>{selectedSeat}</strong> · Standard seat included</p></div><div><span className="sub-label">Add-ons</span>{addOns.map(addOn => <button className={`addon-choice ${selectedAddOns.includes(addOn) ? "is-selected" : ""}`} key={addOn} onClick={() => toggleAddOn(addOn)}><span>{addOn}</span><Check size={15} /></button>)}</div></div>
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
          <div className="manage-grid"><button onClick={() => toast.message("Change-flight options opened")}><CalendarDays />Change flight</button><button onClick={() => toast.message("Cancellation and refund policy opened")}><ReceiptText />Cancel / refund</button><button onClick={() => advance("Seats & Add-ons")}><Armchair />Choose seats</button><button onClick={() => advance("Seats & Add-ons")}><Luggage />Add baggage</button><button onClick={() => toast.message("Check-in becomes available 24 hours before departure")}><CircleCheck />Check in</button><button onClick={() => toast.message("Boarding pass becomes available after check-in")}><Download />Download boarding pass</button></div>
          <div className="alert-control"><BellRing size={20} /><div><strong>Flight status alerts</strong><span>Arrival, gate, and schedule changes shown in the traveller’s local time zone.</span></div><button className={alertsEnabled ? "is-on" : ""} onClick={() => setAlertsEnabled(value => !value)}>{alertsEnabled ? "On" : "Off"}</button></div>
        </div>}

        <div className="prototype-stepper" aria-label="Booking workflow status">{["Passenger Details", "Seats & Add-ons", "Payment", "Booking Confirmation"].map((step, index) => <span key={step} className={bookingStepFor(page) > index ? "is-complete" : ""}>{index + 1}. {step}</span>)}</div>
      </div>
    </section>
  );
}
