# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-11`

Branch: `main`

Current release: **`v0.9.6 — Focused first action`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest UX release:
- merged PR: `#53 — v0.9.6 Focused first action`
- PR head: `9d284f86f23c6413b433b11a0d17c14ab3ea8c7d`
- merge commit: `785a5899d7a156899afd07e687303e12470b4c69`
- Validate DBR prototype run: `31520687511` — success
- Browser Playthrough run: `31520687581` — success

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

The complete route exists and is automated end-to-end:
- Act I: E001–E005 + intermediate report No. 1;
- Act II: E006 archive plan + E007 room 312;
- Act III: E008 archive provenance + E009 identity + follow-up questions + report No. 2;
- evidence-grounded interrogation of Kirill;
- Act IV: E010 rescue + E011 card verification + final accusation + epilogue.

## Current strategic priority

**Fresh-player comprehension remains the top priority. Do not add new story scope while a person who has never seen ДБР can still become confused by the interface.**

Established UX rule:

> The player may be uncertain about the mystery, but must never be uncertain about how to operate the game.

At every stage the interface should make four things clear:
1. where the player is;
2. what is being investigated now;
3. what has already been completed;
4. what operational action can be taken next.

Navigation help and detective hints are different systems. Navigation help may say where to click and why the operation matters, but must not reveal the correct theory.

Narrative rule:

> The detective may ask only questions for which the investigation has already produced a factual premise.

## Human-test finding that triggered the current work

A completely new player was sent to the game without verbal help and did not understand how to proceed. The problem was not the detective mystery itself: the interface required the newcomer to work out what tabs, cards, codes and actions meant before they could start investigating.

The user later supplied a screenshot of the HQ screen showing the core overload clearly:
- five navigation sections visible immediately;
- current objective, progress, report and several system controls competing for attention;
- a visible next-step card was not enough to remove the feeling that the whole screen had to be understood first.

Treat this as a product defect, not user error.

## UX releases completed

### v0.9.0 — Player Guidance

Introduced the systemic navigation layer instead of local one-off instructions:
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
5. only then can the evidence dismantle Kirill's alibi.

### v0.9.2 — Guided first run / regression repair

Kept the new onboarding path stable and repaired browser tests that were still coupled to obsolete onboarding copy.

### v0.9.3 — Commercial metadata consistency

Commercial launch now follows the canonical case manifest rather than maintaining conflicting duplicate values.

Canonical case parameters:
- `14+`;
- approximately `90 minutes`;
- `1–4 players`.

### v0.9.4 — Stage-aware HQ header

The HQ header no longer stays on `Act I` after the first report. It follows the real investigation stage:
- Act I;
- Act II;
- Act III;
- key interrogation;
- Act IV;
- completed.

### v0.9.5 — Stage-aware case dashboard

The main `Текущая задача` no longer freezes on the start of Act II.

After Act I:
- the old Act I fact list is clearly historical rather than current;
- report No. 1 is shown as accepted history;
- the Act I-only progress meter is hidden;
- current task copy follows the actual RouteStage.

### v0.9.6 — Focused first action

This release directly addresses the overloaded HQ screenshot and newcomer feedback.

For a fresh player:
- the last prologue CTA is reframed from `Открыть штаб` to `Перейти к первому действию`;
- the first onboarding screen no longer teaches `Материалы / Люди / Дело` all at once;
- the old three-section onboarding lecture is hidden;
- the player sees one concrete task: **`Осмотреть номер 314`**;
- the screen explains only the interaction needed now: four marked zones, click them, findings save automatically;
- the primary action opens the real E001 interaction directly;
- a low-emphasis `Открыть весь штаб без обучения` escape hatch remains for repeat/experienced users;
- after E001 the existing Player Guidance continues to supply the next operational action.

Implementation is deliberately layered over the existing Player Guidance rather than replacing its route logic.

Files:
- `src/focusedFirstAction.ts`
- `src/focusedFirstAction.css`

No `MutationObserver`, no continuous `setInterval` polling.

## Canonical save contract

Do not rename these keys casually. UX releases must preserve existing progress:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

Onboarding-only key:
- `dbr:player-guidance:onboarding:v1`

v0.9.6 changes none of the canonical case save keys.

## Browser verification

v0.9.6 passed both required workflows:
- Validate DBR prototype `31520687511` — success;
- Browser Playthrough `31520687581` — success.

Coverage includes desktop and mobile where applicable and verifies:
- commercial launch/continue/restart/recovery;
- final prologue transition to the first action;
- focused first onboarding screen;
- old onboarding grid is actually hidden;
- direct entry into E001;
- E001 guidance `0/4 → 1/4`;
- persistent no-spoiler navigation help;
- Acts II–IV route;
- grounded Kirill interrogation;
- stage-aware header/dashboard;
- complete E001–E011 playthrough and epilogue;
- completed-case return;
- media and performance regressions.

Automated success is not proof of human comprehension. Zero-assistance human testing remains mandatory.

## Media / visual truth boundary

- primary scenes/cards/portraits still use temporary realistic Unsplash photography where configured;
- E006, E008, E010, E011 and final report use owned local SVG visuals;
- media marker: `case-001-hybrid-realistic-v1`;
- remote media must be replaced before fully offline paid distribution;
- E006 archive-plan visual is still below final premium quality.

## Kirill truth boundary

- no genuine living/3D Kirill video exists in the player build;
- player runtime falls back to a static portrait without real WebM clips;
- Actor Studio is an internal recording utility, not an AI avatar generator;
- future 3D/video Kirill may be produced separately, but must not change deterministic investigation logic.

## Known debt

- the HQ may still feel visually dense after the first guided action; this must be judged by a new human tester, not assumed solved;
- some compatibility/runtime bridge layers remain outside React-owned Acts II–IV;
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

1. Verify the deployed `main` build from a fresh browser state.
2. Run the first 10 minutes yourself from a clean case and judge only comprehension, not puzzle difficulty.
3. Give the same build to a person who has never seen ДБР and provide **zero verbal help**.
4. Record every pause/question of the form: what do I click, what does this mean, where do I go, why did nothing happen?
5. If the HQ still overwhelms the player after E001, implement the next progressive-disclosure pass rather than adding more explanatory paragraphs.
6. Only after zero-assistance comprehension improves, return to premium visual/media polish and broader external testing.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.9.6 — Focused first action** on `main`.

Current priority: **fresh-player comprehension and progressive disclosure, not feature expansion**.

If a player cannot determine the next operational action, change the visible interface rather than explaining the hidden route in chat.

If the detective appears to know something before the player has found the source, treat it as a narrative logic defect.
