# PROJECT STATE — ДБР

## Checkpoint date

2026-08-09

## Current branch

`main`

## Current version

`0.8.9 — Act II–III usability and routing fixes`

## Production

- URL: `https://valera2872.github.io/dbr/`
- cache-busted test URL: `https://valera2872.github.io/dbr/?release=0.8.9-act23-usability-31285986839`
- latest merged PR: `#46 — v0.8.9: fix Act II–III usability and routing`
- merge commit: `abb8d00decefbe25efd76027abb200e5f32d691e`
- successful production deploy run: `31285986839`
- successful final browser playthrough run before merge: `31285877386`
- successful validate/build run before merge: `31285877391`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## Current manual-playthrough status

The user is actively playing the production build manually and reporting every point where a first-time player becomes confused or the visual presentation looks weak.

The most recent user findings were:

1. In the room-inspection scene, checkmarks/hotspots appeared in arbitrary places.
2. The E006 plan itself looked schematic and visually weak.
3. E008 did not explain what the player was supposed to do.
4. E009 could be completed, but the next step did not visibly open, so the player appeared stuck.

These issues were addressed in v0.8.9. The user has not yet confirmed the new UX by replaying those screens after the v0.8.9 deployment.

## v0.8.9 changes

### E006 — archive plan

- removed formula-driven marker placement as the effective layout mechanism;
- stabilized the three inspection points around meaningful plan areas;
- added an explicit instruction banner describing what to inspect;
- added a visible progress counter;
- after completion, added a direct transition to E007;
- the underlying archive-plan SVG is still a temporary stylized asset and is **not** considered final-quality visual media.

### E007 — room 312 inspection

- removed the impression that four checkmarks are floating randomly over the scene;
- reorganized inspection controls into a stable scene/control composition;
- added explicit task wording;
- added a direct transition to E008 after all four checks.

### E008 — festival archive originals

- now explicitly tells the player that there are no hidden hotspots to find in the picture;
- tells the player to open four sources in the right-side panel:
  1. digitization catalogue;
  2. contact sheet B;
  3. recorder transcript;
  4. media custody log;
- added a visible progress counter;
- after all four are reviewed, added a direct transition to E009.

### E009 — identity check

- now explains the three phases of the task:
  1. compare identity records;
  2. obtain Denis and Vera explanations;
  3. submit intermediate report No. 2;
- after report No. 2 is accepted, the modal itself displays a clear action to close E009 and go to Kirill;
- this fixes the former UX defect where the valid next step existed only behind the still-open modal.

## Important UX principle established by this pass

Do not rely on a global `Следующий шаг` card hidden behind a modal as the only continuation path. Whenever a modal completes a required investigation step, the modal itself should clearly expose the next required action.

Likewise, do not create investigative scenes where markers are positioned by generic formulas that are visually disconnected from real objects. Hotspots must be attached to meaningful visual targets or replaced with an explicit control/list interaction.

## v0.8.8 interrogation guidance retained

The specialized Kirill interrogation exposes one explicit three-stage route:

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
- guidance layers use bounded `requestAnimationFrame` synchronization and no MutationObserver or polling where already migrated.

## Canonical storage contract

Do not change these save keys casually, because the user is testing an existing save through multiple releases:

- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

The v0.8.9 pass intentionally preserved all canonical localStorage keys.

## Browser verification

Current CI contains both static/smoke validation and Playwright browser tests.

For v0.8.9:

- production build/validation passed;
- full clean E001–E011 browser route passed;
- desktop and mobile Chromium suites passed after version assertions were updated from v0.8.8 to v0.8.9;
- there was an intermediate red CI caused only by stale test expectations that still required `v0.8.8`; this was corrected before merge.

Do not claim a visual design is good merely because Playwright passes. Browser tests confirm route/functionality, not artistic quality.

## Media policy / visual truth boundary

- primary room scenes, evidence cards and character portraits currently use temporary realistic Unsplash photography where configured;
- E006, E008, E010, E011 and the final report retain owned local SVG visuals;
- the active media marker remains `case-001-hybrid-realistic-v1`;
- remote photography remains a temporary visual reference and must be replaced with owned local realistic media before fully offline paid distribution;
- E006 archive-plan SVG is explicitly considered visually weak and should be redesigned later as a convincing architectural/archive plan.

### Kirill video truth boundary

- there is **no real living Kirill video in the player build**;
- runtime falls back to a static portrait unless real WebM clips are supplied;
- Actor Studio is an internal human-recording tool, not an AI-avatar generator;
- do not claim generated lip-sync, natural microreactions or real actor video unless actual clips exist.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures additionally require:

`?internal=1&qa=1&fixture=<name>`

Available names: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Current technical debt

- Acts II–IV are now React-owned, but parts of the overall application still preserve compatibility/runtime bridge layers;
- final visual media are not yet consistently premium-quality;
- E006 is especially temporary visually;
- sound/atmosphere remain unfinished;
- remote Unsplash dependencies remain;
- no commercial payment/access system is implemented yet;
- Actor Studio still exists as an internal route;
- real suspect video clips are not present.

## Remaining work before paid release

1. Continue the user's manual walkthrough from the current saved state and remove every remaining ambiguous transition or ugly/broken scene through the final epilogue.
2. Treat the user's manual experience as the primary usability signal; do not add new story scope while the current case still contains confusing screens.
3. After the full route is manually clean, perform a dedicated visual/premium pass:
   - replace the E006 plan;
   - strengthen E010/final-operation visuals;
   - normalize scene quality and typography;
   - verify mobile layouts.
4. Finalize sound design and atmosphere without fake AI-avatar effects.
5. Conduct usability/pacing/difficulty testing with 5–10 independent players.
6. Replace temporary remote realistic photos with owned local realistic media.
7. Finalize legal wording, privacy notice and age-rating wording.
8. Choose and implement payment, access delivery and purchase recovery.
9. Later create a genuine 3D/video suspect layer while keeping deterministic interrogation logic.
10. After one stable release cycle, archive retired compatibility sources.

## Instruction for the next chat

When the user opens a new chat and asks to continue ДБР, start from this checkpoint rather than reconstructing from memory.

The immediate task is **not** to invent new features. The immediate task is to continue the user's manual playthrough of v0.8.9 and fix the next real problem they encounter.

If the user says that E006/E007 markers still look wrong, inspect the live layout/CSS rather than explaining the intended behavior. If E008 is still unclear, improve the actual interaction, not just the wording. If E009 still does not lead forward, trace the saved state and visible navigation all the way to Kirill.

Current user-facing test URL:

`https://valera2872.github.io/dbr/?release=0.8.9-act23-usability-31285986839`
