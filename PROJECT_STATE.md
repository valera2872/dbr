# PROJECT STATE — ДБР

## Current branch

`agent/v0-8-8-interrogation-guidance` → target `main`

## Current version

`0.8.8 — state-aware interrogation guidance`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## Defect found in the user's manual walkthrough

The specialized Kirill interrogation was available before report No. 1 and before Acts II–III evidence existed. The player could ask all three visible questions, but the screen then showed six disabled `Не найдено` evidence cards and no explanation of what to do next. The technically valid route existed elsewhere in the application, but the interrogation interface did not communicate it.

## v0.8.8 interrogation route

The interrogation now exposes one explicit three-stage route:

1. `Зафиксировать версию` — ask Kirill's three preliminary questions;
2. `Собрать и предъявить улики` — complete report No. 1, then investigate E006–E009 and present the logical chain;
3. `Разрушить алиби` — fix the contradiction once the chain is sufficient.

State-aware guidance changes its instruction according to the saved case:

- before all three questions: it states how many questions remain and explains that this is only preliminary version-fixing;
- after all three questions but before Act I completion: it says the interrogation must be paused and provides `Закрыть допрос и открыть отчёт №1`;
- after report No. 1 but before evidence is found: it routes to Materials and names the exact next target (`E006`, `E007` or `E008`);
- once evidence exists: it states the presentation order `план → панель → физический след → запись Антона` and highlights the next evidence button;
- once the chain is ready: it routes directly to the contradiction panel;
- after the confession: it routes to Materials and E010.

Disabled evidence no longer ends with an unexplained `Не найдено`:

- before Act I completion: `После отчёта №1`;
- after Act I completion: `Найти в E006`, `Найти в E007` or `Найти в E008`.

Existing interrogation answers and every canonical save key remain unchanged.

## v0.8.7 first-player fixes retained

- E001 displays the most recently selected hotspot and highlights it;
- key-material marking is explained as a personal bookmark and appears on the Case tab;
- E005 contains a prominent route to People;
- primary scenes and portraits use temporary realistic Unsplash references;
- E006, E008, E010, E011 and the final report remain owned local visuals.

## React Core

- evidence cards and interactive modals E006–E011 are rendered by React portals;
- intermediate report No. 2, next-required-step navigation, final accusation and closed-case report are React-owned;
- canonical core, Act II, Act III, interrogation and Act IV localStorage keys remain unchanged;
- existing saves continue without a reset;
- legacy Act II–IV runtime imports are absent from the production entry point;
- the specialized Kirill interrogation remains a separate compatible module;
- the new guidance layer uses bounded `requestAnimationFrame` synchronization and no MutationObserver or polling.

## Browser verification target

- a new Playwright regression starts from an empty commercial browser state;
- it opens People, enters Kirill's early interrogation, verifies the three-stage route and the `После отчёта №1` evidence statuses;
- it asks all three questions and verifies the direct transition to report No. 1;
- the existing clean E001–E011 browser route remains mandatory;
- desktop Chromium and Pixel 7 profiles remain active.

## Media policy

- primary room scenes, evidence cards and character portraits currently use realistic Unsplash photography;
- E006, E008, E010, E011 and the final report retain owned local SVG visuals;
- the active media marker is `case-001-hybrid-realistic-v1`;
- remote photography remains a temporary visual reference and must be replaced with owned local realistic media before fully offline paid distribution.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Remaining work before paid release

- continue the user's manual walkthrough and remove each ambiguous transition;
- conduct external usability, pacing and difficulty testing with 5–10 independent players;
- replace temporary remote realistic photographs with owned local realistic media;
- finalize sound design, legal wording, privacy notice and age-rating wording;
- choose and implement payment, access delivery and purchase recovery;
- later create the 3D/video suspect layer while keeping deterministic interrogation logic;
- after one stable release cycle, archive retired compatibility sources.
