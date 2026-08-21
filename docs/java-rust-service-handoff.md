# Java and Rust Service Handoff

SkyRoute’s hosted web application is a React client with the provided server gateway. For a production airline integration, the gateway should remain the only internet-facing boundary and delegate sensitive domain work to independently deployed services. This document defines the requested Java and Rust handoff without putting credentials, payment data, or provider tokens into the browser.

| Service | Technology | Owns | Public contract from the gateway |
| --- | --- | --- | --- |
| Booking service | Java / Spring Boot | Flight inventory normalization, fare holds, booking creation, passenger profiles, payment-provider tokens, changes, bags, seats, check-in records | `POST /v1/search`, `POST /v1/fare-holds`, `POST /v1/bookings`, `PATCH /v1/bookings/{id}` |
| Reminder service | Rust / Axum + Tokio | Encrypted calendar consent records, iCalendar delivery, provider callbacks, pre-flight notification dispatch, idempotency keys | `POST /v1/reminders`, `POST /v1/calendar/callback`, `POST /v1/reminders/{id}/send` |
| Web gateway | Existing server edge | OAuth session validation, rate limiting, ownership checks, request validation, response shaping, audit correlation IDs | Typed, authenticated procedures only; never direct client access to either service |

## Security boundary

All provider credentials, payment tokens, and calendar refresh tokens belong in managed server-side secrets or an encrypted credential store. The browser should receive only immutable booking references, short-lived URLs, and values that are safe to display. Every booking change must be authorized against the signed-in user and use an idempotency key so that network retries cannot duplicate a charge or a reminder.

## Calendar notification flow

The browser-first flow exports an iCalendar event with a three-hour `VALARM`, allowing a traveller’s chosen calendar application to notify them without sharing an account. An account-connected flow can be added later: the Java service creates the booking record, the Rust service stores consent and a calendar event reference, and a scheduled callback dispatches a pre-flight notification based on the flight’s UTC departure time. Scheduled work must use a platform-managed callback, be idempotent, and authenticate the scheduler before acting on a reminder record.

## Deployment note

This managed web project is optimized for a React and TypeScript gateway. Java and Rust services should be deployed as separately managed services behind private networking before live airline, payment, or calendar credentials are enabled. The frontend in this project is ready to connect to those contracts; it does not make real airline reservations or collect payment credentials.
