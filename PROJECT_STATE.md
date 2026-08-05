# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-5-react-core-migration` → target `main`

## Current version

`0.8.5 — React-owned Acts II–IV / storage-compatible core migration`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## v0.8.5 React Core migration

- evidence cards and interactive modals E006–E011 are rendered by React portals;
- intermediate report No. 2, next-required-step navigation, final accusation and closed-case report are React-owned;
- the canonical Act II, Act III, Act IV and Kirill interrogation localStorage keys remain unchanged;
- existing v0.8.4 and earlier saves continue without a reset;
- runtime imports for `act2HiddenRouteV2`, `act2GatePreview`, `act3ArchiveIdentity` and `act4FinalOperation` were removed from the production entry point;
- the legacy source files remain temporarily in the repository as rollback material but are not bundled or executed;
- React Core does not use `document.createElement`, `innerHTML`, `MutationObserver` or polling;
- the specialized Kirill interrogation and Living Suspect/video adapter remain separate compatible modules for now;
- the production JavaScript bundle fell to about 310 KB / 102.5 KB gzip after retiring three legacy runtime modules.

## Stability and commercial shell

- one typed investigation snapshot covers the core case, Acts II–IV and Kirill's interrogation;
- existing localStorage keys remain canonical, so upgrades preserve progress;
- the customer cover supports start, resume, completed-report entry, restart and save repair;
- internal QA, diagnostics, Actor Studio and build markers remain hidden from commercial mode;
- React failures show a recovery screen instead of a blank page;
- the PWA has product metadata, an icon, offline shell and mobile safe-area support.

## Real browser contract

- Playwright runs the production bundle in desktop Chromium and a Pixel 7 mobile profile;
- the suite verifies clean start, all four prologue screens and entry into headquarters;
- saved progress resumes on the previous section;
- restart uses explicit confirmation, clears the case and opens a clean prologue;
- inconsistent legacy saves are repaired without a blank page or loss of valid progress;
- horizontal overflow is checked on the launch cover and prologue;
- the mobile headquarters keeps an accessible Menu button;
- E006 is completed through the React modal, writes to the old Act II key and unlocks E007;
- the final accusation writes to the old Act IV key and opens the React closed-case report without the legacy Act IV runtime;
- the v0.8.5 browser run passed 17 tests, with one technically inapplicable mobile-only check skipped;
- failures retain screenshot, video and Playwright trace artifacts;
- superseded browser runs are cancelled automatically.

## Owned media pack

- room 314 and the third-floor corridor are owned local SVG scenes;
- Kirill, Marina, Denis, Vera, Ilya and Elena have a consistent owned portrait set;
- E006 has an owned engineering archive plan;
- E008 has an owned archive worktable with catalog, contact sheet, recorder and chain-of-custody card;
- E010 has an owned service-room rescue scene with Ilya, the external latch, medical cabinet and emergency light;
- E011 has an owned forensic card-reader and B-17 verification scene;
- the epilogue has an owned closed-case dossier visual;
- one typed media catalog provides all scene, portrait and evidence URLs;
- all owned visuals are precached for offline use;
- production smoke verifies public sources, copied dist assets and service-worker entries;
- Playwright verifies computed CSS backgrounds and direct production loading for all five final evidence assets.

## Performance defects removed

- the legacy build marker no longer creates hundreds of hidden duplicates;
- premium enhancements use the canonical APP_BUILD instead of a hard-coded v0.3.5;
- the enhancement module no longer creates its own MutationObserver;
- the 12-second 250 ms startup polling loop was removed;
- enhancement refreshes now use the shared runtime-settled event and one animation frame;
- Act II–IV DOM construction and their runtime observers/listeners are no longer loaded.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Remaining work before paid release

- extend Playwright from the current React migration checks to one literal click-by-click E001–E011 commercial playthrough;
- move the specialized Kirill interrogation and remaining Premium Pass/runtime integration to explicit React state/events, then remove the shared compatibility observer where possible;
- remove or archive the retired legacy Act II–IV source files after one stable release cycle;
- conduct external usability, pacing and difficulty testing;
- finalize sound design, legal wording, age rating, payment and delivery flow;
- create the 3D/video suspect layer later with Kling while keeping the deterministic interrogation logic.
