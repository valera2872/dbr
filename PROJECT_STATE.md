# PROJECT STATE — ДБР

## Checkpoint date

2026-08-10

## Current branch

`main`

## Current version

`0.9.0 — Player Guidance`

## Production status

- Production base URL: `https://valera2872.github.io/dbr/`
- Latest merged PR: `#47 — v0.9.0 Player Guidance`
- PR head validated before merge: `341567f0e6962d54c1299983bbb304de052c2a49`
- merge commit: `85aa1e33f0fcacfe9a920b1d89655a91f98d55ae`
- final pre-merge validate run: `31337798438` — success
- final pre-merge Browser Playthrough run: `31337798462` — success
- production deployment for v0.9.0 must be confirmed separately by the `/deploy-dbr` workflow before claiming it live.

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

Complete playable route:

- Act I: E001–E005 and intermediate report No. 1;
- Act II: E006 archive plan and E007 room 312;
- Act III: E008 archive provenance, E009 identity check and intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue operation, E011 card verification, final accusation and epilogue.

## Why v0.9.0 exists

Manual testing by the user and a completely new player exposed the main product problem: the case was technically playable but not self-explanatory. A newcomer spent cognitive effort figuring out the interface instead of solving the detective problem. Several valid routes existed but were invisible or ambiguous.

Established UX rule:

> A player may be uncertain about the mystery, but must not be uncertain about how to operate the game. At every moment the interface should communicate where they are, what the current investigative objective is, what has already been completed, and what operational action can be taken next.

Navigation guidance and detective hints are separate concepts. Navigation help may say where to go and what interaction is required, but must not reveal the correct theory.

## v0.9.0 — Player Guidance

### First-run interactive onboarding

A new player entering HQ for the first time now sees a short interactive onboarding instead of being dropped into the full interface without explanation.

It explains three core spaces in human language:

1. `Материалы` — inspect scenes, documents and digital traces; findings save automatically.
2. `Люди` — compare statements with discovered facts; new questions appear as the case advances.
3. `Дело` — formulate intermediate conclusions at key checkpoints to unlock the next stage.

It explicitly explains that `Что делать дальше?` is navigation help rather than a puzzle-solution hint.

Primary onboarding action:

`Начать: осмотреть номер 314 →`

This routes directly to the first real interaction E001.

Onboarding completion key:

`dbr:player-guidance:onboarding:v1`

This is separate from all canonical case save keys.

### Persistent current objective

A compact floating Player Guidance control is available throughout HQ play. It exposes:

- current investigation phase;
- current objective;
- immediate progress;
- `Что делать дальше?`.

The floating container does not intercept clicks on the game underneath; only the help button is interactive.

It is hidden behind the commercial launch cover.

### “Что делать дальше?”

The help panel shows:

- `Текущая цель`;
- the exact operation required now;
- current progress;
- `Зачем это сейчас` so the task has narrative meaning;
- a direct action button that navigates to the correct tab/material/person/report;
- explicit notice that navigation help does not reveal the correct detective theory.

### State-aware route across the whole case

The guide reads the unified `InvestigationSnapshot` and derives guidance from actual saved state, rather than maintaining a second independent progression model.

Act I is granular:

- E001 — counts four room hotspots;
- E002 — routes to Ilya's last message;
- E003 — routes to the lock journal;
- E004 — requires the actual correct camera answer `23:50`; wrong answers remain a retry state;
- E005 — routes to the phone;
- then routes to intermediate report No. 1.

Acts II–IV:

- archive plan — `0/3` checks;
- room 312 — `0/4` checks;
- archive — `0/4` sources and explicit statement that there are no hidden hotspots in the picture;
- identity — `0/3` comparisons;
- Denis/Vera follow-up interviews — `0/2` required explanations;
- intermediate report No. 2;
- Kirill interrogation;
- service-room rescue — `0/4`;
- card verification — `0/4`;
- final accusation;
- completed-case report.

The guidance copy uses human investigative objectives rather than requiring a newcomer to understand E-codes.

### Synchronization

`PlayerGuidance` is React-owned and subscribes to the shared investigation-state API:

- `getInvestigationState`
- `subscribeInvestigationState`
- `scheduleInvestigationRefresh`

A bounded post-interaction sync refreshes guidance shortly after UI actions so counters such as `1/4` do not lag React/localStorage effects.

There is no new `MutationObserver` and no continuous `setInterval` polling.

## v0.8.9 fixes retained

### E006

- stabilized three inspection locations;
- explicit task wording and progress;
- direct transition to E007.

The underlying archive-plan SVG is still visually temporary and should be replaced later.

### E007

- inspection controls no longer appear as arbitrary floating checkmarks;
- stable scene/control layout;
- explicit task and direct transition to E008.

### E008

- explicitly states there are no hidden hotspots;
- asks the player to inspect four archive sources;
- visible progress and direct transition to E009.

### E009

- explicit three-stage task structure;
- after report No. 2, direct `Закрыть E009 и перейти к Кириллу` action inside the modal.

## Earlier first-player fixes retained

- E001 shows the most recently selected hotspot rather than leaving stale carpet text visible;
- key-material marking is explained as an optional investigator bookmark and appears on the Case tab;
- E005 has a prominent next-step route;
- Kirill interrogation has explicit `Зафиксировать версию → Собрать и предъявить улики → Разрушить алиби` guidance;
- disabled interrogation evidence says where it is found instead of only `Не найдено`.

## Canonical storage contract

Do not rename these keys casually. Existing user saves must continue across UX releases:

- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

v0.9.0 intentionally preserves all of them.

## Browser verification

Final v0.9.0 PR head `341567f0e6962d54c1299983bbb304de052c2a49` passed both required workflows:

- Validate DBR prototype: run `31337798438` — success;
- Browser playthrough: run `31337798462` — success.

Browser coverage includes:

- commercial launch/recovery/restart;
- new-player onboarding;
- onboarding primary action into E001;
- live E001 progress update from `0/4` to `1/4`;
- `Что делать дальше?` panel and no-spoiler explanation;
- Act II archive guidance;
- first-player regressions;
- early Kirill guidance;
- media regression;
- performance marker regression;
- React Core checks;
- complete clean desktop E001–E011 route through epilogue and completed-case return;
- desktop Chromium and Pixel 7 mobile profile where applicable.

Do not equate green Playwright with proven usability. v0.9.0 provides the systemic guidance mechanism; a fresh human who has never seen ДБР must still be observed without verbal assistance.

## Media / visual truth boundary

- primary scenes/cards/portraits currently use temporary realistic Unsplash photography where configured;
- E006, E008, E010, E011 and the final report retain owned local SVG visuals;
- media marker remains `case-001-hybrid-realistic-v1`;
- remote photography must be replaced with owned local realistic media before fully offline paid distribution;
- E006 archive-plan SVG is explicitly not final-quality art.

### Kirill truth boundary

- there is no real living/3D Kirill video in the player build;
- runtime falls back to a static portrait without real WebM clips;
- Actor Studio is an internal human-recording tool, not an AI-avatar generator;
- 3D/video suspect is planned later through Kling;
- do not claim lip-sync, natural microreactions or generated actor video until real assets exist.

## Internal QA contract

Internal tools require `internal=1`.

Fixtures:

`?internal=1&qa=1&fixture=<name>`

Available fixtures: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Known technical / release debt

- some compatibility/runtime bridge layers remain outside the React-owned Acts II–IV core;
- temporary Unsplash dependencies remain;
- E006 visual is weak;
- final media quality is not yet uniform;
- sound/atmosphere unfinished;
- npm audit currently reports 2 unresolved dependency vulnerabilities: 1 moderate, 1 high;
- GitHub Actions still declares Node 20 even though hosted actions are being forced toward Node 24; cleanup needed;
- no payment/access/recovery system implemented;
- no external independent usability dataset yet;
- no genuine Kirill video clips yet.

## Remaining work before paid release

1. Deploy v0.9.0 and manually retest it from a genuinely fresh-player perspective.
2. Give the build to at least one person who has never seen the interface and provide **zero verbal navigation help**.
3. Record every point where the player still asks what to click, what a control means, or why nothing happened.
4. Fix those systemic/scene-level usability defects before adding new story scope.
5. After navigation is clean, perform a visual/premium pass, especially E006 and final-operation visuals.
6. Test 5–10 independent players for comprehension, pacing and difficulty.
7. Replace remote photos with owned realistic media.
8. Finish sound, legal/privacy/age wording.
9. Implement payment, access delivery and purchase recovery.
10. Add genuine 3D/video Kirill later without changing deterministic investigation logic.

## Instruction for the next chat

When the user starts a new chat and asks to continue ДБР, begin from this checkpoint.

The current strategic priority is **first-time-player comprehension**, not new story features.

Do not answer a reported navigation problem by merely explaining where the hidden route already exists. Treat inability to understand what to do next as a product defect and change the visible interface.

After v0.9.0 is deployed, the immediate next activity is a fresh manual walkthrough of the Player Guidance experience, followed by another zero-assistance test with a new person.
