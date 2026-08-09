# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-10`

Branch: `main`

Current release: **`v0.9.0 — Player Guidance`**

Production:
- base URL: `https://valera2872.github.io/dbr/`
- test URL: `https://valera2872.github.io/dbr/?release=0.9.0-player-guidance-31337988987`
- merged PR: `#47 — v0.9.0 Player Guidance`
- PR head: `341567f0e6962d54c1299983bbb304de052c2a49`
- merge commit: `85aa1e33f0fcacfe9a920b1d89655a91f98d55ae`
- final validate run: `31337798438` — success
- final Browser Playthrough run: `31337798462` — success
- production Pages deploy run: `31337988987` — build success, deploy success

## Product

Web/PWA of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

Complete story route is implemented:
- Act I: E001–E005 + intermediate report No. 1;
- Act II: E006 archive plan + E007 room 312;
- Act III: E008 archive provenance + E009 identity check + intermediate report No. 2;
- evidence-driven interrogation of Kirill;
- Act IV: E010 rescue, E011 card verification, final accusation and epilogue.

## Current strategic priority

**First-time-player comprehension is now the top priority. Do not add new story scope while a new player can still get lost in the interface.**

Manual testing by the user and a completely new player showed that the game was technically playable but not self-explanatory. Newcomers spent cognitive effort working out what to click, where to go and why nothing happened instead of solving the detective mystery.

Established UX rule:

> The player may be uncertain about the mystery, but must not be uncertain about how to operate the game.

At every stage the product should communicate:
1. where the player is;
2. the current investigative objective;
3. what has already been completed;
4. the next operational action available.

Navigation help and detective hints are separate. Navigation help may explain what interaction is required or where to go, but must not reveal the correct theory.

## v0.9.0 — Player Guidance

### Interactive onboarding

A completely new player entering HQ sees a short onboarding explaining:
- `Материалы` — inspect scenes/documents/digital traces; findings save automatically;
- `Люди` — compare statements with discovered facts; new questions appear as the case advances;
- `Дело` — formulate intermediate conclusions that unlock the next stage.

It explicitly explains `Что делать дальше?` as navigation help, not a solution hint.

Primary onboarding action:

`Начать: осмотреть номер 314 →`

This opens the first real E001 interaction directly.

Onboarding-only key:

`dbr:player-guidance:onboarding:v1`

It is separate from all canonical case save keys.

### Persistent guidance

A compact Player Guidance control remains available while playing and shows:
- investigation phase;
- current objective;
- immediate progress;
- `Что делать дальше?`.

The floating container does not block gameplay underneath; only its help button receives pointer input. It is hidden while the commercial launch cover is open.

### “Что делать дальше?” panel

Shows:
- `Текущая цель`;
- exact operational instruction;
- progress;
- `Зачем это сейчас` to connect the operation to the investigation;
- direct button to the correct material/person/report;
- explicit no-spoiler notice.

### State-aware route

`PlayerGuidance` is React-owned and derives its guidance from the existing unified `InvestigationSnapshot`, not from a second independent progress model.

Act I is granular:
- E001 — four room hotspots, live count `0/4…4/4`;
- E002 — Ilya's last message;
- E003 — lock journal;
- E004 — camera reconstruction, with actual answer state (`23:50` is the correct answer); wrong answer remains a retry state;
- E005 — phone;
- then report No. 1.

Acts II–IV guidance:
- archive plan `0/3`;
- room 312 `0/4`;
- archive `0/4`, explicitly says there are no hidden hotspots in the image;
- identity `0/3`;
- Denis/Vera follow-up questions `0/2`;
- report No. 2;
- Kirill interrogation;
- rescue room `0/4`;
- card verification `0/4`;
- final accusation;
- completed-case report.

Copy is written as human investigative goals; players should not need to understand internal E-codes to know what to do.

### State synchronization

Uses:
- `getInvestigationState`
- `subscribeInvestigationState`
- `scheduleInvestigationRefresh`

Bounded post-click refreshes keep counters current after React/localStorage effects. No new `MutationObserver`; no continuous `setInterval` polling.

## Retained manual-playthrough fixes

### E001
- right-side text now follows the most recently selected hotspot instead of remaining stuck on the carpet;
- selected hotspot is visibly current;
- “mark as key” is explained as an optional investigator bookmark and appears in `Дело`.

### E005
- explicit route to the next required interaction.

### Kirill early interrogation
- explicit route: `Зафиксировать версию → Собрать и предъявить улики → Разрушить алиби`;
- after preliminary questions, tells player to pause the interrogation and open report No. 1;
- disabled evidence says where it must be found instead of only `Не найдено`.

### E006
- stabilized the three inspection locations;
- explicit task and progress;
- direct transition to E007.
- visual warning: current archive-plan SVG remains weak/temporary and is not final premium art.

### E007
- inspection controls no longer appear as arbitrary floating checkmarks;
- stable scene/control composition;
- direct transition to E008.

### E008
- explicitly states there are no hidden hotspots;
- instructs player to inspect four archive sources;
- progress and direct transition to E009.

### E009
- explicit three-stage task structure;
- after report No. 2, modal itself exposes `Закрыть E009 и перейти к Кириллу` rather than hiding the next route behind the modal.

## Canonical save contract

Do not rename these keys casually. The user's ongoing save must survive UX releases:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

v0.9.0 preserves all of them.

## Browser verification

Final PR head passed both required workflows:
- Validate DBR prototype run `31337798438` — success;
- Browser Playthrough run `31337798462` — success.

Final Playwright result: **26 passed, 2 intentionally skipped**.

Coverage includes:
- commercial launch, continue, restart and save recovery;
- new-player onboarding;
- onboarding primary action into E001;
- E001 live progress update `0/4 → 1/4`;
- `Что делать дальше?` and no-spoiler explanation;
- Act II archive guidance;
- first-player regressions;
- early Kirill guidance;
- media regression;
- performance marker regression;
- React Core checks;
- full clean desktop E001–E011 route through epilogue and completed-case return;
- desktop Chromium and Pixel 7 mobile profile where applicable.

A green automated route is not proof that a human newcomer understands the game. v0.9.0 must now be tested by a person who has never seen ДБР and receives no verbal navigation help.

## Media / visual truth boundary

- primary scenes/cards/portraits currently use temporary realistic Unsplash photography where configured;
- E006, E008, E010, E011 and final report use owned local SVG visuals;
- media marker: `case-001-hybrid-realistic-v1`;
- remote realistic references must be replaced by owned local realistic media before fully offline paid distribution;
- E006 archive-plan SVG is explicitly not final quality.

## Kirill truth boundary

- no real living/3D Kirill video exists in the player build;
- runtime falls back to static portrait without actual WebM clips;
- Actor Studio is an internal human-recording utility, not an AI avatar generator;
- later 3D/video suspect is planned through Kling;
- never claim lip-sync, natural microreactions or generated actor video until actual media exists.

## Internal QA

Internal tools require `internal=1`.

Fixtures:
`?internal=1&qa=1&fixture=<name>`

Available: `clean`, `act2`, `act3`, `interrogation`, `act4`, `card`, `report`, `complete`.

Diagnostics: `?internal=1&diagnostics=1`

Actor Studio: `?internal=1&actorStudio=kirill`

## Known debt

- some compatibility/runtime bridge layers remain outside React-owned Acts II–IV;
- temporary Unsplash dependencies remain;
- E006 visual is weak;
- final visual quality is not uniform;
- sound/atmosphere unfinished;
- npm audit currently reports 2 unresolved vulnerabilities: 1 moderate, 1 high;
- GitHub Actions still declares Node 20 while hosted actions are being forced toward Node 24;
- no payment/access/purchase-recovery system;
- no independent usability dataset yet;
- no genuine Kirill video clips.

## Immediate next work

1. Open the deployed v0.9.0 from a **fresh case** and manually judge the onboarding and first 10 minutes as a newcomer.
2. Give the same build to at least one person who has never seen the interface and provide **zero verbal help**.
3. Record every moment where the person asks what to click, what a control means, where to go, or why nothing happened.
4. Treat each such moment as a product defect, not user error.
5. Fix remaining comprehension defects before new story features.
6. Then do visual/premium pass, especially E006/final-operation art.
7. Test 5–10 independent players for comprehension, pacing and difficulty.
8. Replace remote media, finish sound/legal, then implement payment/access/recovery.
9. Add genuine 3D/video Kirill later without changing deterministic investigation logic.

## Instruction for next chat

When the user opens a new chat and says to continue ДБР, begin from this checkpoint.

Current production test URL:

`https://valera2872.github.io/dbr/?release=0.9.0-player-guidance-31337988987`

Current priority: **fresh-player comprehension and zero-assistance usability testing**, not feature expansion.

If a player cannot determine the next operational action, do not merely explain the hidden route in chat. Change the visible interface.
