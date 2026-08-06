# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-7-first-player-fixes` → target `main`

## Current version

`0.8.7 — first-player fixes, explicit Act I routing and hybrid realistic media`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## v0.8.7 findings from a real first-player review

The user's meticulous manual playthrough exposed four defects that previous end-to-end automation did not identify as usability problems:

- E001 displayed the last item in static hotspot order instead of the point most recently selected by the player;
- `Отметить как ключевое` stored a flag but gave no useful explanation or visible destination;
- after E005 the game did not visibly tell the player that interviews were the next required step;
- the owned local SVG room and portraits were technically stable but visibly weaker than the realistic photography used in early builds.

## v0.8.7 fixes

- E001 now keeps an explicit current visual selection independent of the set of already inspected points;
- clicking carpet and then window changes the right panel from `Следы перемещения` to `Закрытое окно` and highlights the current hotspot;
- key-material marking is explicitly described as a personal bookmark that does not affect the plot or score;
- bookmark actions show immediate feedback and marked evidence appears in a dedicated `Закладки следователя` panel on the Case tab;
- E005 contains a prominent next-required-step card and a direct `Перейти к людям` action;
- interview modals show how many required answers remain and expose `Открыть отчёт №1` when the interview threshold is met;
- route controls update only when their semantic state changes, so buttons are not recreated during a click;
- desktop and mobile navigation select the currently visible tab control.

## Media policy after v0.8.7

- primary room scenes, evidence cards and character portraits again use the realistic Unsplash photography that appeared in early builds;
- E006, E008, E010, E011 and the final report retain owned local SVG visuals;
- the active media marker is `case-001-hybrid-realistic-v1`;
- this restores visual quality immediately but reintroduces an external-network dependency for primary photographs;
- therefore the realistic photographs are a temporary production reference, not the final owned commercial media pack;
- a later release must replace them with owned local realistic images of comparable quality before fully offline paid distribution.

## React Core

- evidence cards and interactive modals E006–E011 are rendered by React portals;
- intermediate report No. 2, next-required-step navigation, final accusation and closed-case report are React-owned;
- canonical core, Act II, Act III, interrogation and Act IV localStorage keys remain unchanged;
- existing saves continue without a reset;
- legacy Act II–IV runtime imports are absent from the production entry point;
- retired source files remain temporarily as rollback material but are not bundled or executed;
- React Core does not use `document.createElement`, `innerHTML`, `MutationObserver` or polling;
- the specialized Kirill interrogation and Living Suspect/video adapter remain separate compatible modules.

## Full browser route

- one Playwright test begins from an empty commercial browser state with no QA fixture or storage pre-seeding;
- it clicks through the cover and all four prologue screens;
- it completes E001–E005, the current E004 frame reconstruction and intermediate report No. 1;
- it completes every control point in E006–E009 and intermediate report No. 2;
- it asks all three Kirill question lines, presents six evidence items and fixes the route contradiction;
- it completes E010, E011, the final accusation and the closed-case report;
- it verifies the exact persisted values in all five canonical save sections;
- it closes the original page, opens a fresh browser tab with shared localStorage and confirms that `Открыть итог дела` opens the React report;
- the route contains no `addInitScript` and does not write progress before gameplay.

## Browser verification

- production build and all static contracts pass;
- Playwright result: **20 passed, 2 skipped**;
- the new first-player regression repeats carpet → window → bookmark → E005 → People on desktop Chromium and Pixel 7;
- desktop Chromium still performs the entire E001–E011 route;
- Pixel 7 checks remain active for launch, recovery, first-player flow, hybrid media, performance and React Core;
- failures retain screenshot, video and trace artifacts;
- the production JavaScript bundle is about 318 KB / 105.1 KB gzip.

## Stability and commercial shell

- one typed investigation snapshot covers the core case, Acts II–IV and Kirill's interrogation;
- the customer cover supports start, resume, completed-report entry, restart and save repair;
- internal QA, diagnostics, Actor Studio and build markers remain hidden from commercial mode;
- React failures show a recovery screen instead of a blank page;
- the PWA has product metadata, an icon, offline shell and mobile safe-area support;
- the shell and owned final evidence remain available offline, while temporary realistic remote photographs require network access on first load.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Remaining work before paid release

- continue the user's meticulous manual walkthrough and fix each ambiguity before recruiting external testers;
- conduct external usability, pacing and difficulty testing with 5–10 independent players;
- add structured tester feedback and measure where players stop or hesitate;
- replace temporary remote realistic photographs with owned local realistic media;
- finalize sound design, legal wording, privacy notice and age-rating wording;
- choose and implement payment, access delivery and purchase recovery;
- later create the 3D/video suspect layer with Kling while keeping deterministic interrogation logic;
- after one stable release cycle, archive retired Act II–IV source files and continue reducing the compatibility runtime.
