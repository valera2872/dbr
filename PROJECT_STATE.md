# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-17`

Branch: `main`

Current release: **`v0.9.8 — Investigative agency`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest release:
- merged PR: `#55 — v0.9.8 Investigative agency`
- PR head: `3345fb1406d4b0b73820f5bc289ce2f64ff1ba45`
- merge commit: `cb51c9b120fa3130353c2566b80eb368f5a17a58`
- Validate DBR prototype run: `31974665107` — success
- Browser Playthrough run: `31974665129` — success

## Product

Web/PWA interactive detective series **ДБР**.

First case: **«Номер 314»**.

Canonical parameters:
- 14+;
- about 90 minutes;
- 1–4 players.

Complete route remains implemented and browser-tested end-to-end:
- Act I: E001–E005 + intermediate report No. 1;
- player-owned investigation of the unexplained route;
- Act II: earned E006 old floor plan + E007 room 312;
- Act III: E008 archive provenance + E009 identity + follow-up questions + report No. 2;
- evidence-grounded interrogation of Kirill;
- Act IV: E010 rescue + E011 card verification + final accusation + epilogue.

## Current product principle

Two human tests exposed two opposite failure modes:

1. A newcomer did not understand how to operate the game.
2. After guidance was strengthened, the user's son completed the case and described it as boring because he did not need to think — he mostly followed explicit instructions.

The resulting rule is now:

> **The interface must be obvious. The investigation must not be obvious.**

The game may explain **how to operate a mechanic**, but must not perform the detective's reasoning for the player.

For every major discovery ask:
1. **What factual contradiction made the investigator suspect this direction?**
2. **What player action obtained the new information?**

If the first answer is “the game told the player” and the second is “clicked Next step”, treat that segment as a design defect.

A related narrative rule remains:

> The detective may ask only questions for which the investigation has already produced a factual premise.

## UX history retained

### v0.9.0 — Player Guidance
Introduced systemic navigation guidance: current objective, progress, next action and no-spoiler navigation help.

### v0.9.1 — Evidence-grounded interrogation
Removed premature Kirill questions that revealed the hidden passage / Anton conflict before the player had evidence.

### v0.9.6 — Focused first action
A fresh player is no longer dropped directly into the full HQ. After the prologue the first concrete interaction is `Осмотреть номер 314`.

### v0.9.7 — Progressive HQ disclosure
Guided newcomers initially see only `Дело` and `Материалы`; other HQ sections appear as they gain context. Experienced/repeat players may skip guided disclosure.

## v0.9.8 — Investigative agency

This release corrects the first major place where the game was doing the deduction for the player: **the discovery of the old floor plan / hidden route**.

Before v0.9.8, report No. 1 explicitly told the player to check the old hotel plan and possible hidden passage. E006 then appeared as the scripted next material. This gave away one of the central deductions of the case.

### New causal chain

After Act I the player knows:
- the main door was not used after Ilya returned;
- the window does not explain the disappearance;
- camera coverage is incomplete;
- physical traces in room 314 run toward the wardrobe/common wall;
- the phone was deliberately moved;
- the known routes do not explain the event.

The game then **stops choosing the theory for the player**.

The investigator may select plausible checks:
- re-check the window from outside — dead end;
- request the extended lock/controller log — dead end;
- re-inspect the wardrobe and common wall — useful clue: tracks end at the wardrobe and the decorative panel looks newer;
- ask Marina about renovation history — useful clue: the third floor was rebuilt after the 2015 festival and the current plan is post-renovation.

Only after the player independently obtains both useful clues does the action become justified:

`Запросить обмерный план до реконструкции`

Only that explicit player action unlocks E006.

### E006 meaning corrected

E006 no longer immediately declares that the hidden passage survived.

The old plan establishes only:
- a service opening existed between 312 and 314 before reconstruction;
- archive documentation does not conclusively prove its complete sealing.

The player must still inspect room 312 in E007 to prove that the route physically remains and was used recently.

Thus:

**contradiction → player hypothesis/checks → renovation clue → request old documentation → historical opening → physical verification in 312**

replaces:

**report → “next step: old plan” → hidden passage**.

### Guidance during this deduction

During the player-owned hidden-route deduction:
- the React `Следующий шаг` card is hidden;
- E006 is hidden until earned;
- Player Guidance becomes neutral and says the player must choose a check independently;
- its direct next-step button is disabled;
- `Объяснить` is hidden during this deduction so it cannot leak the answer;
- future evidence hints inside Kirill's interrogation are also hidden until the old plan has actually been earned.

### Implementation

New files:
- `src/investigationAgency.ts`
- `src/investigationAgency.css`
- `src/investigationAgencyInterrogation.ts`
- `tests/e2e/investigative-agency.spec.ts`
- `scripts/investigation-agency-smoke.mjs`

Agency progress uses the existing Act II `questions` array with markers:
- `agency:window`
- `agency:lock`
- `agency:wall`
- `agency:renovation`
- `agency:plan-requested`

No canonical save key was renamed.

No new `MutationObserver` or continuous `setInterval` polling was introduced.

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

## Verification

v0.9.8 passed both required workflows:
- Validate DBR prototype `31974665107` — success;
- Browser Playthrough `31974665129` — success.

The browser suite now explicitly verifies that:
- E006 is unavailable before the investigative chain;
- dead-end window/lock checks do not unlock it;
- wall inspection alone is insufficient;
- renovation history plus wall clue creates the basis for requesting old documentation;
- the player explicitly requests the old plan;
- only then is E006 available;
- E006 proves a historical opening, while E007 still proves recent use;
- the clean E001–E011 playthrough completes with this new causal path;
- desktop/mobile and previous regression coverage remain green.

## Media / visual truth boundary

The user has separately flagged the evidence imagery as too primitive, especially the later-case cards/scenes shown on the Materials screen.

Current state:
- some primary scenes/cards/portraits use temporary realistic Unsplash photography;
- E006, E008, E010, E011 and final report use owned local SVG visuals;
- E006 archive-plan visual remains below final premium quality;
- later evidence cards are too visually uniform and several images read as placeholders/icons rather than physical evidence.

This remains an important next pass, but **investigative agency / causal logic takes priority over cosmetic polish**.

## Next investigation-design work

Do not merely remove all guidance. Preserve usability while transferring deductions to the player.

Audit the remaining route E007–E011 using the same two questions:
1. Why would a real investigator think to check this?
2. What action by the player causes the information to enter the case?

Likely next targets:
- why E008 / the 2015 archive becomes relevant after E007;
- why identity verification of Elena/Vera is initiated;
- how follow-up questions to witnesses arise from contradictions rather than scripted sequencing;
- how the Kirill confrontation becomes justified;
- why the old service room becomes a search target;
- why/how the memory card is located and examined.

The objective is a repeated gameplay loop:

**observe → notice contradiction → choose investigative action → receive evidence → form hypothesis → test it**.

Not:

**read → Next step → read → Next step**.

## Immediate next work

1. Continue causal-logic audit from E007 onward before adding new story scope.
2. Keep operational help available where the interface itself could confuse a newcomer.
3. Remove or neutralize any guidance that tells the player what conclusion to draw or which investigative theory to pursue.
4. After the causal route is strong, perform the evidence-visual upgrade, especially E006–E011.
5. Re-test with the user's son and another fresh player with zero verbal coaching.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.9.8 — Investigative agency** on `main`.

Current priority: **make the player behave like an investigator: the interface should be easy to operate, but important deductions must be earned by the player's reasoning and actions.**

If an important discovery appears because the interface says “next step”, treat it as a design defect and reconstruct the causal path.
