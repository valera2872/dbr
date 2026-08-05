# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-6-full-playthrough` → target `main`

## Current version

`0.8.6 — full clean-browser playthrough and completed-case return`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## React Core

- evidence cards and interactive modals E006–E011 are rendered by React portals;
- intermediate report No. 2, next-required-step navigation, final accusation and closed-case report are React-owned;
- canonical core, Act II, Act III, interrogation and Act IV localStorage keys remain unchanged;
- existing saves continue without a reset;
- legacy Act II–IV runtime imports are absent from the production entry point;
- retired source files remain temporarily as rollback material but are not bundled or executed;
- React Core does not use `document.createElement`, `innerHTML`, `MutationObserver` or polling;
- the specialized Kirill interrogation and Living Suspect/video adapter remain separate compatible modules.

## v0.8.6 full browser route

- one Playwright test begins from an empty commercial browser state with no QA fixture or storage pre-seeding;
- it clicks through the cover and all four prologue screens;
- it completes E001–E005, the current E004 frame reconstruction and intermediate report No. 1;
- it completes every control point in E006–E009 and intermediate report No. 2;
- it asks all three Kirill question lines, presents six evidence items and fixes the route contradiction;
- it completes E010, E011, the final accusation and the closed-case report;
- it verifies the exact persisted values in all five canonical save sections;
- it closes the original page, opens a fresh browser tab with shared localStorage and confirms that `Открыть итог дела` opens the React report;
- the route contains no `addInitScript` and does not write progress before gameplay.

## Defects found by the full route

- the initial test still targeted the retired E004 question instead of the current six-frame reconstruction; the route now tests the actual player interface;
- the completed-case cover displayed `Открыть итог дела`, but clicking it only removed the cover and did not open the report;
- `completedCaseReturn.ts` now bridges the commercial cover to the React report, returns to the Case tab when needed and uses a bounded 90-frame wait with no observer or polling.

## Browser verification

- production build and all static contracts pass;
- Playwright result: **18 passed, 2 skipped**;
- desktop Chromium performs the entire E001–E011 route;
- Pixel 7 regression checks remain active for launch, recovery, local media, performance and React Core;
- failures retain screenshot, video and trace artifacts;
- the production JavaScript bundle is about 311 KB / 102.7 KB gzip.

## Stability and commercial shell

- one typed investigation snapshot covers the core case, Acts II–IV and Kirill's interrogation;
- the customer cover supports start, resume, completed-report entry, restart and save repair;
- internal QA, diagnostics, Actor Studio and build markers remain hidden from commercial mode;
- React failures show a recovery screen instead of a blank page;
- the PWA has product metadata, an icon, offline shell and mobile safe-area support.

## Owned media pack

- room 314 and the third-floor corridor are owned local SVG scenes;
- Kirill, Marina, Denis, Vera, Ilya and Elena have a consistent owned portrait set;
- E006, E008, E010, E011 and the epilogue have owned local visuals;
- one typed media catalog provides all scene, portrait and evidence URLs;
- all owned visuals are precached for offline use;
- browser tests verify local production loading without Unsplash requests.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Remaining work before paid release

- conduct external usability, pacing and difficulty testing with 5–10 independent players;
- add structured tester feedback and measure where players stop or hesitate;
- finalize sound design, legal wording, privacy notice and age-rating wording;
- choose and implement payment, access delivery and purchase recovery;
- later create the 3D/video suspect layer with Kling while keeping deterministic interrogation logic;
- after one stable release cycle, archive retired Act II–IV source files and continue reducing the compatibility runtime.
