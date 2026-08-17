# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-17`

Branch: `main`

Current release: **`v0.10.2 — Evidence realism pass`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest release:
- merged PR: `#59 — v0.10.2 Evidence realism pass`
- PR head: `cc2f1077655a945f7139f80bc898fa759b00a8aa`
- merge commit: `d758131d1db210cf3e88c309910335ca2d55142a`
- Validate DBR prototype run `32016085104` — success
- Browser Playthrough run `32016084904` — success
- Pages deploy run `32016620397` — success

Previous causal releases:
- `#58 — v0.10.1 Player-built final accusation` — merged
- `#57 — v0.10.0 Player-led Kirill interrogation` — merged
- `#56 — v0.9.9 Evidence-led investigation chain` — merged
- `#55 — v0.9.8 Investigative agency` — merged

## Product

Web/PWA interactive detective series **ДБР**.

First case: **«Номер 314»**.

Canonical parameters:
- 14+;
- about 90 minutes;
- 1–4 players.

Complete route is implemented and browser-tested end-to-end:
- Act I: E001–E005 + report No. 1;
- player-earned deduction of an unexplained route;
- E006 old plan only after the player requests pre-renovation documentation;
- E007 physical verification in room 312;
- E008 archive BOX 15-B only after the player earns the archive lead;
- E009 identity comparison only after the player traces Vera Belova and chooses a candidate to verify;
- player-led Kirill interrogation with no prescribed evidence order;
- E010 rescue after Kirill's broken alibi reveals the service room;
- E011 card verification after Ilya / adapter creates the recovery premise;
- player-built final accusation + epilogue.

## Governing product principle

Human testing exposed two opposite failure modes:

1. A fresh player did not understand how to operate the interface.
2. After guidance was strengthened, the user's son found the game boring because the interface was doing the detective thinking for him.

The governing rule is:

> **The interface must be obvious. The investigation must not be obvious.**

Operational help may explain how a mechanic works or where an action can be performed. It must not choose the investigative theory, next deduction, suspect, evidence order or conclusion.

For every major discovery ask:
1. **What factual contradiction made the investigator suspect this direction?**
2. **What player action caused the new information to enter the case?**

If the first answer is “the game told the player” and the second is “clicked Next step”, treat that segment as a design defect.

Narrative rule:

> The detective may ask only questions for which the investigation has already produced a factual premise.

Target gameplay loop:

**observe → notice contradiction → choose investigative action → receive evidence → form hypothesis → test it**

Not:

**read → Next step → read → Next step**.

## UX / investigation releases retained

### v0.9.6 — Focused first action
A fresh player is not dropped directly into the full HQ. After the prologue the first concrete action is `Осмотреть номер 314`.

### v0.9.7 — Progressive HQ disclosure
Guided newcomers initially see only `Дело` and `Материалы`; other HQ sections appear as they gain context. Experienced/repeat players can skip guided disclosure.

### v0.9.8 — Investigative agency
The hidden-route deduction became player-owned. The game no longer tells the player to check an old plan; wall/renovation clues create the premise, then the player explicitly requests the pre-renovation plan.

### v0.9.9 — Evidence-led investigation chain
E007 → E008 → E009 became a causal investigation rather than a scripted material sequence. Archive and identity materials appear only after the player earns and explicitly requests them.

### v0.10.0 — Player-led Kirill interrogation
The key interrogation no longer shows the correct evidence recipe or highlights a prescribed next evidence card. Weak evidence can be tried first and Kirill's objection explains what it does not prove.

### v0.10.1 — Player-built final accusation
The final prewritten correct answer was removed from the player-facing finale. The player independently builds six parts: actor, route, immediate motive, proven 2015 responsibility, route-evidence pair and motive-evidence pair.

## v0.10.2 — Evidence realism pass

The later evidence set E006–E011 no longer shares one repeated neon/infographic prototype language.

### New evidence visual classes

Each late material now has its own owned/local visual source:
- `E006` — photographed/scanned-style pre-renovation survey plan;
- `E007` — dedicated room 312 scene rather than reused room 314 art;
- `E008` — archive/worktable composition with BOX 15-B materials;
- `E009` — identity/document-verification desk;
- `E010` — grounded service-room search scene;
- `E011` — forensic microSD examination scene.

Files:
- `public/media/case-001/evidence/e006-plan-photo.svg`
- `public/media/case-001/evidence/e007-room-312.svg`
- `public/media/case-001/evidence/e008-archive-photo.svg`
- `public/media/case-001/evidence/e009-identity-desk.svg`
- `public/media/case-001/evidence/e010-service-photo.svg`
- `public/media/case-001/evidence/e011-forensic-photo.svg`

The six evidence cards are explicitly mapped one-to-one to those sources through `src/mediaCatalog.ts` and `src/evidenceRealism.ts`.

Realism runtime marks late evidence with `data-evidence-realism="v2"`; the document root is marked `data-dbr-evidence-media="realism-v2"`.

### Scene-level fix

The first browser run exposed an important cascade conflict: React Core still had old evidence backgrounds declared with `!important`, so E007 was marked realism-v2 but visually reverted to room 314.

Fix:
- `src/reactCaseExtension.css` now uses the v0.10.2 assets as the canonical E006/E007/E008/E010/E011 scene sources;
- E010 legacy procedural `::before` / `::after` room geometry is suppressed in realism-v2 mode;
- E011 uses the forensic background while keeping its interactive reader/terminal UI.

This removed the old media layer from inside the modals, not just from the Materials thumbnails.

### Visual verification

`tests/e2e/evidence-realism.spec.ts` verifies that E006–E011 use six distinct mapped sources and that E007 opens with the room-312 scene.

The final green Playwright artifact was inspected manually. The Materials grid visibly separates:
- document;
- photographed room;
- archive;
- identity paperwork;
- search location;
- digital forensics.

The visual pass is materially better than the previous uniform prototype cards.

Truth boundary:
- these are owned/local **stylized realism SVG compositions**, not genuine crime-scene photographs;
- primary media elsewhere still includes temporary Unsplash photography;
- do not describe the new evidence images as real photographs.

## Canonical save contract

Do not rename casually:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`
- living suspect: `dbr:dbr_001_room_314:living-suspect:kirill:v0.6.3`

UX-only keys retained:
- onboarding: `dbr:player-guidance:onboarding:v1`
- progressive guided run: `dbr:player-guidance:guided-first-run:v1`

v0.9.8–v0.10.2 did not rename canonical save keys.

## Verification

v0.10.2 passed on the final PR head:
- Validate DBR prototype `32016085104` — success;
- Browser Playthrough `32016084904` — success;
- Pages deployment of merge commit `32016620397` — success.

Coverage includes desktop/mobile where applicable, the full clean E001–E011 route, causal-agency tests, interrogation/final-synthesis tests and the new evidence-realism regression test.

Automated success proves route integrity and media wiring, not mystery quality. Human testing remains mandatory.

## Immediate next work

1. **Human zero-coaching test** of v0.10.2 with the user's son and, preferably, one person who has never seen DBR.
2. Record moments of:
   - “что нажимать?” → interface defect;
   - “я не понимаю, что произошло” → exposition/feedback defect;
   - “я знаю, что делать, потому что игра сказала” → investigation-design defect;
   - “вижу решение сразу / скучно” → difficulty/choice-space defect.
3. Patch only demonstrated usability/investigation defects before expanding story scope.
4. Continue premium media work later by replacing temporary external Unsplash assets and, where valuable, moving from stylized SVG realism to stronger generated/owned raster evidence.
5. Sound/atmosphere and commercial payment/access remain separate later passes.

## Known technical debt

- npm install reports 2 vulnerabilities (1 moderate, 1 high); investigate rather than blindly force-upgrading.
- GitHub Actions still requests Node 20 while hosted actions are forcing Node 24; update workflow separately.
- some primary external media must be replaced before a fully offline paid release.
- no genuine Kirill video exists; current visual truth boundary must remain explicit.
- payment/access/purchase-recovery is outside this gameplay checkpoint.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.10.2 — Evidence realism pass** on `main`.

Current priority: **human zero-coaching playtest of the now player-led and visually differentiated case, then fix only concrete points where usability or investigative agency still fails.**

Do not reintroduce scripted guidance that gives away investigative reasoning.
