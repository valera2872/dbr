# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-stability-state` → target `main`

## Current version

`0.8.0 — Stability & UX Pass 1`

## Product

Web/PWA prototype of the interactive investigation series **ДБР**.

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
- exact next-step navigation now continues through interrogation, E010, E011 and the final report;
- contradictory saves are detected: premature Act IV, incomplete final evidence, or reports completed without prerequisites;
- diagnostics can export a technical state snapshot;
- QA fixtures provide deterministic entry points: clean, act2, act3, interrogation, act4, card, report and complete;
- new modules add no MutationObserver and no polling;
- production build runs both the final-story contract and the v0.8 stability contract.

## QA fixture contract

Fixtures only run with both parameters present:

`?qa=1&fixture=<name>`

Available names:

- `clean` — empty case;
- `act2` — Act I complete;
- `act3` — Acts I–II complete;
- `interrogation` — Act III complete, Kirill not yet broken;
- `act4` — final operation unlocked;
- `card` — E010 complete;
- `report` — E010–E011 complete;
- `complete` — full epilogue state.

## Remaining stabilization work

- migrate Acts II–IV themselves from DOM enhancers into React/typed case components;
- remove legacy version setters and residual DOM scans;
- run actual browser playthroughs against every deterministic fixture;
- improve E004 assets and mobile layout;
- conduct external usability and difficulty testing;
- produce final sound, media and interrogation presentation.
