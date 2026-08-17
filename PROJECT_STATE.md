# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-17`

Branch: `main`

Current release: **`v0.10.1 — Player-built final accusation`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest release:
- merged PR: `#58 — v0.10.1 Player-built final accusation`
- merge commit: `7d845c79fa467e58d5120c537c3ccf9994d38e03`
- Validate DBR prototype run `32012500511` — success
- Browser Playthrough run `32012500515` — success

Previous causal releases:
- `#56 — v0.9.9 Evidence-led investigation chain` — merged
- `#57 — v0.10.0 Player-led Kirill interrogation` — merged
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

## Current product principle

Two human tests exposed opposite failure modes:

1. A fresh player did not understand how to operate the interface.
2. After guidance was strengthened, the user's son described the game as boring because the interface was doing the detective thinking for him.

The governing rule is:

> **The interface must be obvious. The investigation must not be obvious.**

Operational help may explain how a mechanic works or where a player can perform an action. It must not choose the investigative theory, next deduction, suspect, evidence order or conclusion.

For every major discovery ask:
1. **What factual contradiction made the investigator suspect this direction?**
2. **What player action caused the new information to enter the case?**

If the first answer is “the game told the player” and the second is “clicked Next step”, treat the segment as a design defect.

Narrative rule:

> The detective may ask only questions for which the investigation has already produced a factual premise.

Target gameplay loop:

**observe → notice contradiction → choose investigative action → receive evidence → form hypothesis → test it**

Not:

**read → Next step → read → Next step**.

## UX / investigation releases

### v0.9.6 — Focused first action
A fresh player is not dropped directly into the full HQ. After the prologue the first concrete action is `Осмотреть номер 314`.

### v0.9.7 — Progressive HQ disclosure
Guided newcomers initially see only `Дело` and `Материалы`; other HQ sections appear as they gain context. Experienced/repeat players can skip guided disclosure.

### v0.9.8 — Investigative agency
The hidden-route deduction became player-owned.

After report No. 1 the game no longer says “check the old plan”. The player can run plausible checks. Window / extended lock checks are dead ends; common-wall inspection and Marina's renovation history create the factual basis to request a pre-renovation plan. Only the explicit request unlocks E006.

E006 proves only that a service opening existed historically. E007 must still prove the route survived and was used recently.

### v0.9.9 — Evidence-led investigation chain
E007 → E008 → E009 no longer advances by scripted material order.

After E007:
- fibres and toolmarks can be legitimate dead-end checks;
- the old archive envelope plus Denis's explanation creates the factual basis for requesting BOX 15-B;
- E008 appears only after the player explicitly requests that archive material.

After E008:
- the player traces B-17 custody to Vera Belova;
- establishes that Vera was expected at the meeting;
- notices no participant uses that name;
- chooses whose identity to verify;
- wrong identity checks simply exclude candidates;
- checking Elena creates the premise for a deeper document comparison;
- E009 appears only after the player explicitly requests those documents.

### v0.10.0 — Player-led Kirill interrogation
The key interrogation no longer shows a correct evidence recipe or highlights a “next” evidence card.

- all already earned evidence is presented as equal player choices;
- weak evidence can be presented first;
- Kirill's rebuttal explains what that evidence fails to prove;
- future / unearned evidence remains hidden;
- premature questions remain blocked until factual premises exist.

### v0.10.1 — Player-built final accusation
The last obvious multiple-choice solution was removed from the player-facing finale.

The player now independently constructs six parts of the accusation:
1. actor;
2. route;
3. immediate motive;
4. proven responsibility in the 2015 event;
5. evidence pair proving the route;
6. evidence pair proving the motive.

All six parts must be selected before checking the chain.

A weak combination receives a focused objection explaining the unsupported link without revealing the correct full solution. Wrong attempts are kept in the existing Act IV `wrongAnswers` and affect the final rank.

A correct six-part chain writes the existing canonical `kirill_responsibility` result and reuses the existing report/epilogue.

Final Player Guidance is navigational only: it may open the accusation workspace but `Объяснить` is hidden while the player assembles the conclusion.

## Stability fix made before v0.10.1 merge

The first PR58 browser run exposed a new cross-stage race:
- the final-synthesis guidance refreshed global investigation state on every click, even before the final stage;
- that extra churn destabilized E009 opening and interrogation evidence buttons;
- the old guided `СЛЕДУЮЩАЯ` pseudo-badge could also be repeatedly added/removed during agency interrogation, changing button geometry.

Fix:
- final-synthesis guidance now refreshes only when the final synthesis actually owns the UI;
- the final `Объяснить` button is force-hidden by final-stage CSS;
- agency interrogation suppresses both motion and the legacy `next-guided-evidence::after` badge.

After the fix both required workflows passed.

## Canonical save contract

Do not rename casually:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`

UX-only keys retained:
- onboarding: `dbr:player-guidance:onboarding:v1`
- progressive guided run: `dbr:player-guidance:guided-first-run:v1`

v0.9.8–v0.10.1 did not rename canonical save keys. Agency markers remain within compatible existing state arrays.

## Verification

v0.10.1 passed:
- Validate DBR prototype `32012500511` — success;
- Browser Playthrough `32012500515` — success.

Coverage includes desktop/mobile where applicable and a full clean E001–E011 route.

Human testing remains mandatory: automated success proves route integrity, not whether the mystery is interesting or appropriately difficult.

## Media / visual truth boundary

The user explicitly flagged the later evidence imagery as too primitive.

Current issues:
- E006, E008, E010, E011 and several supporting cards use local SVG art that reads as prototype illustration rather than a believable piece of evidence;
- later evidence cards are visually too uniform;
- documents, physical locations, portraits and digital evidence do not yet have sufficiently distinct materiality;
- E009 portrait / identity presentation is especially synthetic-looking;
- primary photographic media still includes temporary external Unsplash assets.

This is now the next major product pass because the causal investigation route has been substantially rebuilt through the final accusation.

## Immediate next work

1. **Visual evidence pass:** upgrade E006–E011 from prototype-looking art to premium, believable evidence/media while keeping clues legible and fair.
2. Give each evidence class its own visual language: architectural document, photographed room, archive worktable, identity/document comparison, service-room search, digital-card forensics.
3. Avoid images that directly reveal a deduction before the player earns it.
4. Re-run a clean human test with the user's son and another fresh player with zero verbal coaching after the visual pass.
5. Continue causal audit only if human testing finds another point where the game still thinks for the player.

## Known technical debt

- npm install still reports 2 vulnerabilities (1 moderate, 1 high); investigate rather than blindly force-upgrading.
- GitHub Actions still requests Node 20 while hosted actions are forcing Node 24; update workflow separately.
- some external media must be replaced before a fully offline paid release.
- sound / atmosphere remains unfinished.
- payment/access/purchase-recovery system is not part of this gameplay checkpoint.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.10.1 — Player-built final accusation** on `main`.

Current priority: **premium visual evidence pass E006–E011, while preserving the player-owned causal investigation.**

Do not reintroduce a scripted `Следующий шаг` that gives away investigative reasoning.
