export const LEGAL_TERMS_VERSION = "2026-11-06-global-v1";
export const LEGAL_TERMS_EFFECTIVE_DATE = "6 November 2026";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type RegionalAddendum = {
  id: string;
  title: string;
  summary: string;
  sections: LegalSection[];
  sources: Array<{ label: string; href: string }>;
};

export const globalTerms: LegalSection[] = [
  {
    title: "Important notice",
    paragraphs: [
      "These Terms of Service are a user-friendly product draft for SkyRoute. They are not legal advice, a compliance certification, or a promise that disputes cannot be brought against SkyRoute. Mandatory consumer, passenger, privacy, accessibility, payment and regulator rights always apply where they cannot lawfully be excluded.",
      "Before publication, SkyRoute must replace the bracketed placeholders, identify its legal entity and role in each booking, appoint local counsel for each launch market, and publish a matching privacy notice. If the final contracting party or a carrier's conditions conflict with this draft, the mandatory law and booking-specific supplier terms control."
    ]
  },
  {
    title: "1. Parties and SkyRoute's role",
    paragraphs: [
      "SkyRoute [LEGAL ENTITY NAME], registered in [COUNTRY / STATE], with contact address [ADDRESS] and support contact [SUPPORT EMAIL], operates the SkyRoute website and app. For each booking, SkyRoute will clearly state whether it is the airline, merchant of record, disclosed agent, marketplace, ticketing intermediary, payment intermediary, package organiser, or technology provider.",
      "The operating airline, ticket issuer, hotel, activity provider, insurer, airport-transfer provider and other supplier are identified in the relevant booking. Their own conditions may govern carriage, baggage, seats, schedule changes, refunds, accessibility assistance and ancillary services. SkyRoute will not describe a supplier's obligation as SkyRoute's obligation unless that is accurate for the transaction."
    ]
  },
  {
    title: "2. Information shown before booking",
    paragraphs: [
      "Before payment, SkyRoute will show the itinerary, operating carrier, ticket issuer or supplier, total price and currency, taxes, mandatory charges, SkyRoute fees, baggage and seat charges, fare restrictions, availability qualifiers, payment recipient, cancellation and refund conditions, and any material foreign-exchange assumptions.",
      "You will have an opportunity to review and correct booking details before submitting payment. A booking is confirmed only when the supplier or ticket issuer confirms it and SkyRoute provides a confirmation or ticket reference. A search result, price watch or availability preview is not itself a confirmed booking."
    ]
  },
  {
    title: "3. Payments, changes, cancellations and refunds",
    paragraphs: [
      "Payment authorization, ticket issuance and supplier confirmation may occur at different times. If a supplier cannot confirm a booking, SkyRoute will explain the status and route any applicable refund through the responsible merchant of record or supplier.",
      "Your rights depend on the carrier, fare, route, booking role, disruption, ancillary service and applicable law. SkyRoute does not promise one global cooling-off, cancellation, refund or compensation rule. Consumer-initiated cancellations and no-shows may be subject to the fare rules, while carrier cancellations or significant changes may trigger mandatory rebooking, care, refund or compensation rights.",
      "Baggage, seat selection, Wi-Fi, lounge access, insurance and other add-ons are separate services. Their supplier, price, availability and refund treatment will be shown where available. Chargeback and statutory complaint rights are not waived by these Terms."
    ]
  },
  {
    title: "4. Disruptions and support",
    paragraphs: [
      "When a flight is delayed, cancelled, rerouted, overbooked or changed, SkyRoute will identify what it can do and what must be handled by the operating carrier or merchant of record. We may transmit a request, provide available rebooking options, or direct you to the carrier's required support channel.",
      "Contact SkyRoute first at [SUPPORT EMAIL / SUPPORT URL] with your booking reference. You may also contact the applicable airline, aviation regulator, consumer authority, privacy authority, tribunal or court. SkyRoute's internal complaint process is not an exclusive remedy unless local law expressly permits that result."
    ]
  },
  {
    title: "5. Accounts, interactions and acceptable use",
    paragraphs: [
      "You must provide accurate booking and account details and keep credentials secure. Do not impersonate another person, interfere with the service, misuse price or availability data, submit unlawful content, or use automated access except through an explicitly authorized SkyRoute API key and scope.",
      "SkyRoute may suspend access to protect users, suppliers or the service, investigate abuse, comply with law, or prevent fraud. Suspension does not remove rights that cannot lawfully be excluded."
    ]
  },
  {
    title: "6. Privacy, messages and accessibility",
    paragraphs: [
      "Our separate Privacy Notice explains how booking, passport, payment, assistance, account, device and support data is collected, used, shared with airlines and service providers, retained, secured and transferred. Use of optional marketing, personalization and analytics is separate from the information needed to complete a booking.",
      "Transactional messages may include booking confirmations, schedule changes, disruption notices, security notices and check-in reminders. Promotional messages require the consent or other lawful basis required in your market and include an easy opt-out. SkyRoute will provide an accessible support path and accurate carrier information for disability or reduced-mobility assistance."
    ]
  },
  {
    title: "7. Intellectual property and service availability",
    paragraphs: [
      "SkyRoute and its licensors own the service's branding, software and content. You receive a limited, revocable right to use the service for lawful personal or business travel planning. Supplier names, airline marks, schedules and fare data belong to their respective owners.",
      "The service and supplier data may change or be temporarily unavailable. We will not use this clause to excuse misleading prices, conceal mandatory charges, or remove a statutory remedy."
    ]
  },
  {
    title: "8. Disputes and legally required rights",
    paragraphs: [
      "[COUNSEL REVIEW REQUIRED] SkyRoute must insert governing-law, venue, arbitration, representative-action, limitation, liability and notice clauses only after reviewing the user's country, booking location, route, supplier role and mandatory consumer law. No clause may prevent access to a regulator, mandatory tribunal, statutory complaint process, chargeback right, or non-waivable passenger or privacy remedy.",
      "If any provision is unenforceable, it will be narrowed or removed only to the extent required, and the rest will continue where lawful. These Terms do not create a waiver of rights that applicable law says cannot be waived."
    ]
  },
  {
    title: "9. Changes and records",
    paragraphs: [
      "We may update these Terms for new features, suppliers, legal requirements or security reasons. Material changes will be presented before they apply to a new booking. The version, effective date and acceptance time will be recorded for the clickwrap acceptance flow. The terms accepted for an existing booking will not be changed retroactively in a way that removes a right without lawful notice and consent.",
      "For legal notices, contact [LEGAL EMAIL] and [POSTAL ADDRESS]. This draft was prepared for product implementation on 6 November 2026 and must be reviewed before reliance."
    ]
  }
];

const source = (label: string, href: string) => ({ label, href });

export const regionalAddenda: RegionalAddendum[] = [
  {
    id: "us-ca",
    title: "United States and Canada",
    summary: "Price transparency, airline refund allocation, APPR rights, state/provincial privacy and marketing controls.",
    sections: [
      { title: "Localized booking and refund rules", paragraphs: ["SkyRoute will identify whether it is the merchant of record or an agent. For covered U.S. flights, qualifying airline cancellations or significant changes may require an airfare refund through the merchant of record when the passenger does not travel or accept an alternative. Canada’s APPR may require rebooking or a passenger choice of refund in qualifying disruption situations. Carrier-specific and mandatory rules control." ] },
      { title: "Privacy, marketing and complaints", paragraphs: ["U.S. privacy obligations vary by state and data category. Canadian users may have PIPEDA or substantially similar provincial privacy rights. Commercial messages must follow applicable U.S. CAN-SPAM and Canadian CASL consent and unsubscribe requirements. You may contact SkyRoute, the airline, DOT/OACP, CTA, Competition Bureau or a privacy regulator as applicable."] }
    ],
    sources: [source("U.S. DOT Air Consumer Protection", "https://www.transportation.gov/airconsumer"), source("U.S. DOT Refunds", "https://www.transportation.gov/individuals/aviation-consumer-protection/refunds"), source("Canada APPR", "https://otc-cta.gc.ca/eng/air-passenger-protection-regulations"), source("Canadian Competition Bureau", "https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/false-or-misleading-representations-and-deceptive-marketing-practices"), source("PIPEDA overview", "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/")]
  },
  {
    id: "uk-eea",
    title: "United Kingdom and EEA",
    summary: "UK and EEA rules are separate. Package, linked-travel, passenger-rights, privacy, cookie and insolvency-protection analysis may apply.",
    sections: [
      { title: "Localized checkout", paragraphs: ["SkyRoute will disclose trader identity, total price, charges, performance and complaint information before payment. We will not promise a blanket 14-day cancellation right for passenger transport. If a booking is a package or linked travel arrangement, required pre-contract information, organiser identity, insolvency protection and standard notices will be supplied where applicable. UK ATOL requirements must be checked for flight-inclusive sales."] },
      { title: "Passenger rights, privacy and disputes", paragraphs: ["Mandatory UK and EU/EEA air-passenger rights, including applicable reimbursement, rerouting, care and compensation rights, are preserved. UK GDPR or EU GDPR rights, cookie consent, international-transfer safeguards and accessible rights-request channels apply according to the user and processing context. Complaints may be escalated to the carrier, relevant national enforcement body or qualified ADR route."] }
    ],
    sources: [source("UK Consumer Contracts Regulations", "https://www.legislation.gov.uk/uksi/2013/3134"), source("UK Package Travel Regulations", "https://www.legislation.gov.uk/uksi/2018/634"), source("EU Package Travel Directive", "https://eur-lex.europa.eu/eli/dir/2015/2302/oj"), source("EU air passenger rights", "https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm"), source("EU GDPR", "https://eur-lex.europa.eu/eli/reg/2016/679/oj")]
  },
  {
    id: "au-nz",
    title: "Australia and New Zealand",
    summary: "Consumer guarantees, fair trading, fare transparency, privacy, marketing consent and local complaint routes.",
    sections: [
      { title: "Consumer guarantees and fare terms", paragraphs: ["Applicable Australian Consumer Law, New Zealand Fair Trading Act and Consumer Guarantees Act rights are preserved. We will distinguish change-of-mind or no-show requests from carrier disruption and will identify the airline, intermediary and refund decision-maker. We will not exclude non-excludable guarantees or use hidden mandatory charges."] },
      { title: "Privacy and communications", paragraphs: ["Australian APP privacy obligations and New Zealand information privacy principles may apply to booking, assistance, identity and overseas processing. Promotional messages must follow Australia’s Spam Act and New Zealand’s Unsolicited Electronic Messages Act, with sender identification and a functional opt-out. Users may escalate through SkyRoute, the supplier, relevant consumer agency, OAIC or New Zealand Privacy Commissioner."] }
    ],
    sources: [source("ACCC travel delays and cancellations", "https://www.accc.gov.au/consumers/specific-products-and-activities/travel-delays-and-cancellations"), source("Australia Privacy Act", "https://www.legislation.gov.au/C2004A03712/latest/text"), source("New Zealand cancellations and delays", "https://www.consumerprotection.govt.nz/help-product-service/travel-and-events/cancellations-delays"), source("New Zealand Privacy Act", "https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23312.html")]
  },
  {
    id: "india",
    title: "India",
    summary: "E-commerce disclosures, aviation passenger rights, grievance handling, DPDP privacy and telecom marketing controls.",
    sections: [
      { title: "Booking and grievances", paragraphs: ["SkyRoute will identify the provider, airline, intermediary role, total price, taxes, cancellation/refund terms, payment method, booking record and support route before purchase. The applicable Passenger Charter, carrier rules and Consumer Protection framework control. We will provide an India-facing grievance path and will not prevent access to consumer forums, the National Consumer Helpline or AirSewa."] },
      { title: "Privacy and marketing", paragraphs: ["The Digital Personal Data Protection Act and rules in force may require notices, consent or another lawful basis, withdrawal, rights, security, retention and grievance handling. Promotional SMS or calls are separate from transactional messages and must follow applicable TRAI preference and consent requirements. Hindi, English or other required language and accessibility support must be confirmed for the final service."] }
    ],
    sources: [source("India Consumer Protection", "https://consumeraffairs.gov.in/pages/consumer-protection-acts"), source("India Passenger Charter", "https://www.civilaviation.gov.in/ministry-documents/passenger-charter-of-rights"), source("AirSewa", "https://airsewa.gov.in/"), source("DPDP Act", "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4fef35e82c42aa5.pdf")]
  },
  {
    id: "sg-my",
    title: "Singapore and Malaysia",
    summary: "Travel-agent licensing, price transparency, electronic-trade disclosures, aviation protections and privacy rights.",
    sections: [
      { title: "Licensing and price presentation", paragraphs: ["SkyRoute will confirm whether arranging or reselling travel requires a Singapore Travel Agent Licence or Malaysian travel-agency licensing. Mandatory charges will be shown in the headline total, add-ons will not be silently preselected, and discount or scarcity claims will be substantiated. Malaysia’s currently effective electronic-trade rules and aviation code will be checked before launch."] },
      { title: "Complaints and privacy", paragraphs: ["Singapore PDPA and Do Not Call requirements, and Malaysian privacy and direct-marketing rules, may apply. Supplier and carrier identity, fare restrictions and refund responsibility will be shown. Users retain access to eligible Singapore Small Claims Tribunal, Malaysian consumer tribunal, aviation-regulator and privacy-regulator routes where applicable."] }
    ],
    sources: [source("Singapore Travel Agent Licence", "https://www.stb.gov.sg/licensing-support/licenses/travel-agent-licence/"), source("Singapore CPFTA", "https://sso.agc.gov.sg/act/cpfta2003"), source("Singapore PDPA obligations", "https://www.pdpc.gov.sg/data-protection-obligations"), source("Malaysia electronic trade rules", "https://repositori.kpdn.gov.my/bitstream/123456789/5299/1/PERATURAN%20URUSNIAGA%20PERDAGANGAN%20DALAM%20ELEKTRONIK%202024.pdf"), source("Malaysia consumer tribunal", "https://ttpm.kpdn.gov.my/")]
  },
  {
    id: "uae-saudi",
    title: "United Arab Emirates and Saudi Arabia",
    summary: "Arabic-law review, e-commerce disclosures, aviation passenger protections, privacy and marketing consent.",
    sections: [
      { title: "Localized disclosures", paragraphs: ["SkyRoute will identify the provider, address, contact details, registration information, service characteristics, total price including taxes and fees, payment and performance terms, invoice and complaint route. Saudi transport services may be excluded from a general e-commerce cooling-off rule; flight refund and cancellation rights must be mapped to the carrier and current GACA rules. UAE federal, emirate, DIFC or ADGM rules may differ."] },
      { title: "Arabic, privacy and complaints", paragraphs: ["The final UAE/Saudi text must be reviewed against controlling Arabic legislation and translated accurately. UAE PDPL and Saudi PDPL rights, marketing consent, withdrawal, security and cross-border transfer requirements may apply. Users retain applicable consumer, GACA, GCAA, Ministry of Commerce, privacy and court routes."] }
    ],
    sources: [source("UAE consumer and privacy laws", "https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws"), source("Saudi E-Commerce Law", "https://laws.boe.gov.sa/Files/Download/?attId=be4eef55-50be-44e3-b94d-adbb011b5736"), source("Saudi GACA passenger rights", "https://gaca.gov.sa/en/passenger-rights"), source("Saudi consumer guide", "https://mc.gov.sa/en/guides/Documents/CustomerGuide.pdf")]
  },
  {
    id: "za",
    title: "South Africa",
    summary: "CPA and ECTA plain-language disclosures, POPIA rights, direct-marketing consent and complaint escalation.",
    sections: [
      { title: "Booking and cancellations", paragraphs: ["SkyRoute will identify the supplier, carrier, platform role, total price, taxes and fees, performance timing, terms, cancellation/refund policy, complaint method and secure payment process. South African Consumer Protection Act advance-booking cancellation rules, reasonable charges and exceptions may apply. We will not display unavailable inventory or use a blanket no-refund statement."] },
      { title: "POPIA and complaints", paragraphs: ["POPIA notice, access, correction/deletion, security, Information Officer and cross-border transfer controls will be provided. Electronic marketing requires the applicable consent or existing-customer basis, sender identification and a simple objection route. Users may use SkyRoute, an ombud, the National Consumer Commission, a court or the Information Regulator as applicable."] }
    ],
    sources: [source("South Africa Consumer Protection Act", "https://www.gov.za/sites/default/files/32186_467.pdf"), source("ECTA", "https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf"), source("POPIA", "https://www.cogta.gov.za/cgta_2016/wp-content/uploads/2025/06/POPI-Act-4-of-2013.pdf"), source("National Consumer Commission", "https://thencc.org.za/complaints/")]
  },
  {
    id: "br-mx",
    title: "Brazil and Mexico",
    summary: "Distance-contract information, withdrawal and refund workflows, aviation rights, privacy and PROFECO/ANAC/AFAC routes.",
    sections: [
      { title: "Brazil", paragraphs: ["Brazilian distance-contract information, supplier identity, total price, ancillary charges, durable contract copy, error correction and withdrawal flow will be provided where applicable. The Consumer Defense Code and current ANAC rules may create remedies that cannot be waived. The final product must confirm the treatment of airfares and ancillary services with Brazilian counsel."] },
      { title: "Mexico", paragraphs: ["Mexico-facing checkout will show the all-in total, taxes, commissions, restrictions, supplier identity, security information and complaint route. The carrier's Aviation Law duties for itinerary changes, delays, cancellations, accessibility and compensation will be preserved. Users may use SkyRoute, the carrier, PROFECO, Concilianet, AFAC or a court as applicable."] },
      { title: "Privacy", paragraphs: ["Brazil LGPD and Mexico private-sector data rules may require notices, lawful bases, access/correction/deletion or ARCO rights, marketing opt-out, international-transfer disclosures and incident controls."] }
    ],
    sources: [source("Brazil e-commerce decree", "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm"), source("Brazil Consumer Defense Code", "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"), source("Brazil LGPD", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"), source("Mexico Consumer Protection Law", "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf"), source("Mexico Aviation Law", "https://www.diputados.gob.mx/LeyesBiblio/pdf/LAC.pdf"), source("PROFECO", "https://www.gob.mx/profeco")]
  },
  {
    id: "ng-ke",
    title: "Nigeria and Kenya",
    summary: "Plain-language consumer contracts, aviation passenger notices, accessible communications, privacy and regulator escalation.",
    sections: [
      { title: "Booking and aviation", paragraphs: ["Nigeria-facing terms will identify the undertaking, address, service, taxes and total price, and distinguish FCCPC booking-cancellation rules from NCAA Part 19 airline duties. Kenya-facing checkout will provide pre-contract disclosures, an express accept/decline and correction step, accessible retainable information and a durable copy. Operating-carrier rights for delay, cancellation, denied boarding, care and refund remain applicable."] },
      { title: "Privacy, accessibility and complaints", paragraphs: ["Nigeria NDP Act and Kenya Data Protection Act requirements for notice, lawful basis, access, correction, deletion, marketing opt-out, security and transfers may apply. Support will offer accessible communications for users with disabilities. Users retain applicable FCCPC, NCAA, KCAA, ODPC, consumer tribunal and court routes."] }
    ],
    sources: [source("Nigeria FCCPA", "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf"), source("Nigeria aviation Part 19", "https://ncaa.gov.ng/media/2zphwuvq/aviation-part-19.pdf"), source("Nigeria Data Protection Act", "https://ndpc.gov.ng/download/nigeria-data-protection-act-2023/"), source("Kenya Consumer Protection Act", "https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31"), source("Kenya Data Protection Act", "https://kenyalaw.org/akn/ke/act/2019/24/eng@2022-12-31"), source("KCAA consumer protection", "https://www.kcaa.or.ke/about-us/consumer-protection")]
  }
];
