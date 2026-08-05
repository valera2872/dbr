# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-3-local-media-pack` → target `main`

## Current version

`0.8.3 — Owned local media pack / offline visual foundation`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## Stability and commercial shell

- one typed investigation snapshot covers the core case, Acts II–IV and Kirill's interrogation;
- existing localStorage keys remain canonical, so upgrades preserve progress;
- the customer cover supports start, resume, completed-report entry, restart and save repair;
- internal QA, diagnostics, Actor Studio and build markers remain hidden from commercial mode;
- React failures show a recovery screen instead of a blank page;
- the PWA has product metadata, an icon, offline shell and mobile safe-area support.

## v0.8.2 real browser contract

- Playwright runs the production bundle in desktop Chromium and a Pixel 7 profile;
- the suite verifies clean start, all four prologue screens and entry into headquarters;
- saved progress resumes on the previous section;
- restart uses explicit confirmation, clears the case and opens a clean prologue;
- inconsistent legacy saves are repaired without a blank page or loss of valid progress;
- horizontal overflow is checked on the launch cover and prologue;
- the mobile headquarters keeps an accessible Menu button;
- failures retain screenshot, video and Playwright trace artifacts;
- superseded browser runs are cancelled automatically.

## v0.8.3 owned media pack

- room 314 and the third-floor corridor are owned local SVG scenes;
- Kirill, Marina, Denis, Vera, Ilya and Elena have a consistent owned portrait set;
- one typed media catalog provides all scene and portrait URLs;
- a synchronous compatibility layer rewrites legacy Unsplash image assignments before the browser requests them;
- the home and prologue background are overridden before React renders;
- existing DOM enhancers and the Living Suspect fallback receive the same local assets without changing save keys;
- the media runtime adds no MutationObserver and no polling;
- the service worker precaches all owned scene and portrait files for offline use;
- the production smoke contract checks both public sources and copied dist assets;
- a Playwright test records any Unsplash request and verifies that evidence and character images resolve to the local pack.

## Performance defects removed

- the legacy build marker no longer creates hundreds of hidden duplicates;
- premium enhancements use the canonical APP_BUILD instead of a hard-coded v0.3.5;
- the enhancement module no longer creates its own MutationObserver;
- the 12-second 250 ms startup polling loop was removed;
- enhancement refreshes now use the shared runtime-settled event and one animation frame.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Remaining work before paid release

- extend the owned media pack to E006, E008, E010, E011 and final report visuals;
- migrate Acts II–IV from DOM enhancers into typed React case components;
- extend browser playthroughs from the commercial shell to every E001–E011 interaction;
- conduct external usability and difficulty testing;
- finalize sound design, legal wording, age rating, payment and delivery flow;
- create the 3D/video suspect layer later with Kling while keeping the deterministic interrogation logic.
