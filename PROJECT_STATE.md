# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-11`

Branch: `main`

Current release: **`v0.9.7 — Progressive HQ disclosure`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest UX release:
- merged PR: `#54 — v0.9.7 Progressive HQ disclosure`
- PR head: `885b259abcc83c53a6b99999f0fb68663de4a3e7`
- merge commit: `5db6680b301426dadc3d8df878504c4bc229eeef`
- Validate DBR prototype run: `31521664311` — success
- Browser Playthrough run: `31521664361` — success

Previous comprehension release:
- PR `#53 — v0.9.6 Focused first action`
- merge commit `785a5899d7a156899afd07e687303e12470b4c69`

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

Complete story route is implemented and browser-tested end-to-end:
- Act I: E001–E005 + intermediate report No. 1;
- Act II: E006 archive plan + E007 room 312;
- Act III: E008 archive provenance + E009 identity + follow-up questions + report No. 2;
- evidence-grounded interrogation of Kirill;
- Act IV: E010 rescue + E011 card verification + final accusation + epilogue.

## Current strategic priority

**Fresh-player comprehension is the top priority. Do not add new story scope while a new player can still get lost in the interface.**

Established UX rule:

> The player may be uncertain about the mystery, but must never be uncertain about how to operate the game.

At every stage the interface must communicate:
1. where the player is;
2. what is being investigated now;
3. what has already been completed;
4. what operational action can be taken next.

Navigation help and detective hints are separate systems. Navigation help may explain where to click and why an operation matters, but must not reveal the correct theory.

Narrative rule:

> The detective may ask only questions for which the investigation has already produced a factual premise.

## Human-test finding that triggered v0.9.x guidance work

A completely new player was sent to the game without verbal help and did not understand how to proceed. The problem was not the detective mystery itself. The player had to work out the interface before being able to investigate.

A user-supplied HQ screenshot made the overload visible:
- five navigation sections appeared immediately;
- current objective, progress, report and system controls competed for attention;
- even with a visible next-step card the screen looked like something that had to be understood all at once.

Treat such confusion as a product defect, not user error.

## UX releases completed

### v0.9.0 — Player Guidance

Systemic navigation help across the whole investigation:
- persistent current objective;
- visible `Следующий шаг`;
- live progress;
- `Что делать дальше?` / `Объяснить` navigation help;
- direct routing to the correct material/person/report;
- no-spoiler explanation;
- state-aware route from E001 through the completed case.

### v0.9.1 — Evidence-grounded interrogation

Removed premature Kirill questions that leaked future discoveries.

Correct causal chain:
1. base alibi;
2. E006 introduces the possibility of the old passage;
3. E007 proves recent physical use;
4. E008 introduces the old conflict;
5. only then can evidence dismantle Kirill's alibi.

### v0.9.2 — Guided first run / regression repair

Kept the new onboarding route stable and repaired browser tests that were coupled to obsolete onboarding copy.

### v0.9.3 — Commercial metadata consistency

Commercial launch now follows the canonical case manifest.

Canonical case parameters:
- `14+`;
- approximately `90 minutes`;
- `1–4 players`.

### v0.9.4 — Stage-aware HQ header

The HQ header follows the real investigation stage rather than remaining on Act I:
- Act I;
- Act II;
- Act III;
- key interrogation;
- Act IV;
- completed.

### v0.9.5 — Stage-aware case dashboard

The main `Текущая задача` now follows the actual RouteStage.

After Act I:
- Act I facts remain available as history rather than looking current;
- report No. 1 is shown as accepted history;
- the Act I-only meter is hidden;
- current task copy follows the active stage.

### v0.9.6 — Focused first action

Direct response to the overloaded-HQ newcomer feedback.

For a fresh player:
- final prologue CTA changed from `Открыть штаб` to `Перейти к первому действию`;
- the first onboarding screen no longer teaches `Материалы / Люди / Дело` at once;
- old three-section onboarding grid is hidden;
- one concrete task is shown: **`Осмотреть номер 314`**;
- only the interaction needed now is explained: four marked zones, click them, findings save automatically;
- primary action opens real E001 directly;
- low-emphasis `Открыть весь штаб без обучения` remains for repeat/experienced users;
- existing Player Guidance continues after E001.

Files:
- `src/focusedFirstAction.ts`
- `src/focusedFirstAction.css`

### v0.9.7 — Progressive HQ disclosure

Second response to the same HQ-overload problem. The first action alone was not enough if the player returned from E001 to a five-section control panel.

A **guided newcomer** now gets progressive disclosure during Act I:
- initially visible: `Дело`, `Материалы`;
- `Люди` appears after two primary materials have been encountered, when statements have context;
- `Хронология` appears after the corridor-camera reconstruction is solved;
- `Версии` appears after all five primary Act I materials have been collected;
- after report No. 1 / Act I completion, the restriction is removed and the full HQ remains available.

Important behavior:
- progressive mode activates only when the fresh player chooses the primary guided action `Осмотреть номер 314`;
- choosing `Открыть весь штаб без обучения` leaves all five sections visible immediately;
- existing/returning users are not forced into the reduced navigation;
- guided state is stored only in UX key `dbr:player-guidance:guided-first-run:v1`;
- canonical case saves are unchanged.

Implementation:
- `src/progressiveNavigation.ts`
- subscribes to unified investigation state;
- re-reads state after React settles so newly earned sections appear promptly;
- no `MutationObserver`;
- no continuous polling.

## Canonical save contract

Do not rename these keys casually. UX releases must preserve existing progress:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

UX-only keys:
- onboarding: `dbr:player-guidance:onboarding:v1`
- progressive guided run: `dbr:player-guidance:guided-first-run:v1`

v0.9.7 changes none of the canonical case save keys.

## Browser verification

v0.9.7 passed both required workflows:
- Validate DBR prototype `31521664311` — success;
- Browser Playthrough `31521664361` — success.

Coverage includes desktop/mobile where applicable and verifies:
- commercial launch/continue/restart/recovery;
- focused first onboarding action;
- direct entry into E001;
- E001 live guidance;
- progressive HQ starts with only `Дело / Материалы` for guided newcomers;
- `Люди` appears after the next relevant primary material;
- full HQ remains available when guided onboarding is skipped;
- persistent no-spoiler navigation help;
- stage-aware header/dashboard;
- evidence-grounded Kirill interrogation;
- complete E001–E011 playthrough and epilogue;
- completed-case return;
- media and performance regressions.

Automated success is not proof of human comprehension. Zero-assistance human testing remains mandatory.

## Media / visual truth boundary

- primary scenes/cards/portraits still use temporary realistic Unsplash photography where configured;
- E006, E008, E010, E011 and final report use owned local SVG visuals;
- media marker: `case-001-hybrid-realistic-v1`;
- remote media must be replaced before fully offline paid distribution;
- E006 archive-plan visual remains below final premium quality.

## Kirill truth boundary

- no genuine living/3D Kirill video exists in the player build;
- player runtime falls back to a static portrait without real WebM clips;
- Actor Studio is an internal recording utility, not an AI avatar generator;
- future 3D/video Kirill can be produced separately but must not alter deterministic investigation logic.

## Known debt

- v0.9.7 reduces first-HQ cognitive load, but only a fresh human tester can prove that it is enough;
- temporary Unsplash dependencies remain;
- E006 visual is weak;
- final visual quality is not uniform;
- sound/atmosphere unfinished;
- npm audit still reports unresolved vulnerabilities;
- GitHub Actions still declares Node 20 while hosted actions are moving toward Node 24;
- no payment/access/purchase-recovery system;
- no independent usability dataset yet;
- no genuine Kirill video clips.

## Immediate next work

1. Verify the deployed `main` build from a genuinely fresh browser state.
2. Run the first 10 minutes yourself from a clean case and judge **comprehension**, not puzzle difficulty.
3. Give the same build to a person who has never seen ДБР and provide **zero verbal help**.
4. Record every pause/question: what do I click, what does this mean, where do I go, why did nothing happen?
5. Pay special attention to the moment after E001 and to the first appearance of `Люди`.
6. If any newly revealed section appears without explaining why it became relevant, fix the visible transition rather than adding a generic instruction page.
7. Only after zero-assistance comprehension improves, return to premium visual/media polish and broader external testing.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.9.7 — Progressive HQ disclosure** on `main`.

Current priority: **fresh-player comprehension, progressive disclosure and zero-assistance human testing — not feature expansion**.

If a player cannot determine the next operational action, change the visible interface rather than explaining the hidden route in chat.

If the detective appears to know something before the player has found its evidentiary source, treat it as a narrative logic defect.
