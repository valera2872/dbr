# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-1-commercial-shell` → target `main`

## Current version

`0.8.1 — Commercial Shell / product-facing launch`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## v0.8 Stability foundation

- one typed investigation snapshot covers the core case, Acts II–IV and Kirill's interrogation;
- old localStorage keys remain canonical, so existing progress is preserved;
- arrays, booleans and nullable fields are normalized when read;
- route stage is derived deterministically from evidence and report state;
- four-act Premium Pass uses the unified snapshot instead of independently parsing storage;
- exact next-step navigation continues through interrogation, E010, E011 and the final report;
- contradictory saves are detected;
- QA fixtures provide deterministic entry points;
- new state modules add no MutationObserver and no polling.

## v0.8.1 Commercial shell

- customer-facing launch cover explains the product before the investigation starts;
- existing progress is shown as a real percentage and named route stage;
- the player can continue, open the completed report or start a new investigation;
- restart uses a two-step confirmation and clears only the current DBR case;
- inconsistent old saves receive a customer-facing repair path instead of a technical diagnostic panel;
- React failures show a recovery screen and preserve the last saved step;
- Actor Studio, QA fixtures, diagnostics and build markers are hidden from commercial mode;
- internal tools require explicit `internal=1` mode;
- the headquarters has a Menu entry and a customer-friendly New Case action;
- missing remote images receive a branded fallback instead of a broken-image icon;
- mobile safe areas, compact topbar, full-height modals and reduced-motion are covered;
- index metadata, PWA manifest and DBR icon are product-ready;
- production builds run final-story, stability and commercial release contracts.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics:

`?internal=1&diagnostics=1`

Actor Studio:

`?internal=1&actorStudio=kirill`

## Remaining work before paid release

- migrate Acts II–IV from DOM enhancers into typed React case components;
- remove legacy version setters and residual DOM scans;
- perform real browser playthroughs on desktop and Android against every route stage;
- replace temporary E004 and remaining externally hosted visual assets with an owned local media pack;
- conduct external usability and difficulty testing;
- finalize sound design, legal wording, age rating, payment and delivery flow;
- decide on filmed, generated-video or premium-static presentation for suspect interrogations.
