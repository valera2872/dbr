# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-18`

Branch: `main`

Current numbered release: **`v0.11.0 — Room 314 v2 parallel investigation`**

Latest gameplay checkpoint: **`E009 v2 — identity, opportunity and early-rescue state`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest gameplay merge:
- merged PR: `#67 — E009 v2 — identity, opportunity and early-rescue state`
- PR head: `fbc6466303981175f2344532d294201fea5fc7b6`
- merge commit: `9813e3cccffebc742a2ac559b9b18f624a233d2c`
- Validate DBR prototype run `32119467431` — success
- Browser Playthrough run `32119467480` — success (`52 passed`, `2 skipped`, no failures/retries/flakes)
- dedicated early-rescue interrogation regression passes on desktop and mobile
- clean full route reaches the epilogue on the first run

Previous gameplay slice:
- PR `#66 — E008 v2 — diegetic archive workspace`
- merge commit `8ac18901fe69243958708345ef561ba116971749`

## Canonical methodology

Project-wide standards already merged:
- `DETECTIVE_DESIGN_BIBLE.md` — investigation / fair-play design standard;
- `COMPETITIVE_QUALITY_GATE.md` — permanent competitor-quality gate;
- `CASE_001_COMPETITIVE_AUDIT.md` — competitive audit of «Номер 314»;
- `CASE_001_ARCHITECTURE.md` — Case 001 v2 investigation architecture;
- `CASE_001_TRUE_TIMELINE.md` — author-only true chronology;
- `CASE_001_SPATIAL_CANON.md` — author-only geometry / access model.

Governing principle:

> **The interface must be obvious. The investigation must not be obvious.**

For every major discovery ask:
1. What factual contradiction gave the investigator a reason to check this direction?
2. What player action caused the new information to enter the case?

If the answer is “the game told the player” / “clicked Next”, treat the segment as defective.

Target loop:

**fact → contradiction → hypothesis → chosen investigative action → evidence → revised hypothesis → verification**

Operational help may explain controls and navigation. It must not choose the suspect, theory, evidence order, deduction or conclusion.

Permanent competitor question:

> **What will the player feel because of this mechanic, and can we create that feeling more simply?**

Upgrade classes:
- **A** — cheap/reusable, high impact: do;
- **B** — meaningful gain with real cost: select highest leverage;
- **C** — expensive spectacle / low leverage: defer or simulate more cheaply.

## Product

Web/PWA interactive detective series **ДБР**.

First case: **«Номер 314»**.

Canonical parameters:
- 14+;
- about 90 minutes;
- 1–4 players.

Target player reaction:

> **«Я несколько часов расследовал настоящее дело».**

Not: «я прошёл викторину / визуальную новеллу».

## Canonical v2 truth

- Ilya disappears from locked room 314 and is found alive.
- Kirill is the current-night attacker.
- The 2015 material proves Kirill knew of an unsafe operational condition and chose continuation / concealment; it does **not** prove premeditated murder of Anton.
- Denis really hid B-17 from the common digital archive but did not attack Ilya.
- Vera / Elena really hid her identity, preserved the original and had a real conflict about publication but did not attack Ilya.
- Marina really concealed the incomplete/cosmetic closure of the old service network but did not attack Ilya.

Canonical topology:

**312 → A312 → V314 → A314 → 314**

and:

**V314 → P3 → M3 / SL3 / S-3 / ST3**

`M3` is an independent staff-side access point. Finding the route proves topology/opportunity, not actor identity.

## Implemented v2 investigation structure

### E006 — topology, not culprit

The player earns E006 by checking the wall / renovation history and explicitly requesting the pre-renovation plan.

E006 establishes V314 and the service-network branches. It does not prove Kirill used them.

### E007 — current usability, not culprit

E007 establishes that the network physically survives and was used recently/current night. It does not identify the user.

### Parallel investigation after E007

The player can pursue several questions rather than one evidence queue:
1. **Where is Ilya?** — search P3 / S-3 from E005 + E006 + E007.
2. **What was the target?** — audit B-17 provenance.
3. **Could Marina/staff have used the route?** — closure records + M3 controller.
4. **Who was physically inside 314?** — preserve the wiped desk microtrace.

### Early rescue before confession

Ilya can be found in S-3 before Kirill confesses and before the other parallel branches are complete.

The rescue deliberately does not identify the attacker. Saving Ilya and proving the attacker are separate problems.

The canonical Act IV `search` state may therefore contain valid progress before the Kirill interrogation is complete.

### Parallel-state runtime invariant

The old state engine assumed all Act IV progress happened after interrogation. v2 invalidated that assumption.

As of PR #67:
- early S-3 rescue is a valid state, not save corruption;
- reopening the game after early rescue preserves the search progress instead of offering destructive recovery;
- route stage does not jump past unresolved Act III/interrogation proof gates merely because the rescue branch is complete;
- digital E011/final closure still require the later proof gates;
- the key Kirill interrogation is recognized by the factual gate `act3.complete && !interrogation.complete`, not by the obsolete linear `derived.stage` assumption.

### Marina / M3 productive false lead

Marina remains a serious hypothesis because her building lie and institutional motive are real. The M3 controller shows no M3 opening during the critical window, weakening the current-night actor hypothesis through evidence rather than narration.

### Desk microtrace

The wiped trace first seen in E001 can be deliberately sampled after several plausible actor hypotheses exist.

Current state:
- microtrace preserved;
- owner not yet named.

This is the next actor-proof line to complete.

## E008 v2 — diegetic archive workspace

E008 is a React-owned source-comparison workspace using the existing Act III save key and the same archive IDs (`catalog`, `contact`, `audio`, `custody`).

Sources:
1. **Digitization inventory** — 48 physical positions vs 47 exported files; B-17 excluded from common export; Denis handled digitization.
2. **B-series contact sheet** — B-17 demonstrably existed and carries the 314-17 marking.
3. **Partial recorder transcript** — a real safety dispute, but the surviving fragment contains no names.
4. **Media custody ledger** — 314-17 leaves common digitization and goes to `В. Белова / семья потерпевшего`; serial matches the empty case from Ilya's bag.

E008 can prove provenance, deliberate archive incompleteness and a historical safety conflict. It does **not** establish Kirill's exact historical responsibility or the current-night attacker.

## E009 v2 — identity and opportunity proof

E009 no longer reveals and clears Vera in one author-written step.

### Identity acquisition

The player first earns the right to investigate the missing Belov-family custodian through the B-17 custody chain, then chooses whom to check. E009 itself compares three independent in-world sources using the existing canonical identity IDs:
- `registration` — room 307 registration for Elena Vetrova;
- `festival` — Belov family archive identifying Vera Belova, Anton's younger sister;
- `message` — Ilya's draft asking `В.` to arrive under her mother's surname until the original is copied.

Only after comparing all three may the player establish:

**«Елена Ветрова» = Вера Белова.**

### Vera's admission

When confronted with the comparison, Vera admits:
- her real identity;
- Anton was her brother;
- she brought Ilya the original 314-17;
- she had a real dispute with Ilya about publication and did not want Anton's death turned into spectacle again.

This establishes a real secret, source relationship and motive for conflict. It does **not** establish innocence.

### Opportunity check

The player must separately test whether Vera could physically explain the attack around 00:22.

Three earned checks are stored inside the existing Act III questions array:
- `e009:vera-corridor` — C3 records her return to 307 at 23:04 and no guest-corridor exit during the critical 00:18–00:31 window;
- `e009:vera-device` — Ilya's message is opened on Vera's device at 00:19 while it remains on the room-307 sector access point; useful corroboration, explicitly not an absolute alibi alone;
- `e009:vera-route` — E006 topology contains 312/314/staff branches but no connection from room 307.

Only after these checks may the player accept checkpoint `separate_lies`: Vera is the real B-17 source and a real conflict participant, but the current-night attack hypothesis fails on opportunity/topology.

### E009 proof boundary

E009 proves:
- Elena/Vera identity;
- family link to Anton;
- B-17 source relationship;
- real publication conflict;
- evidence-based elimination of Vera as the current-night actor.

E009 does **not** prove:
- Kirill's physical presence in 314;
- Kirill's full 2015 historical responsibility;
- that eliminating Vera automatically proves another suspect.

## Canonical save contract

Do not rename casually:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`
- living suspect: `dbr:dbr_001_room_314:living-suspect:kirill:v0.6.3`

UX-only keys:
- onboarding: `dbr:player-guidance:onboarding:v1`
- progressive guided run: `dbr:player-guidance:guided-first-run:v1`

New v2 milestones continue to live inside the existing Act II/III/IV state instead of adding a parallel save system.

## Verification

PR #67 final head passed:
- Validate DBR prototype `32119467431` — success;
- Browser Playthrough `32119467480` — success;
- Playwright: `54` collected, `52 passed`, `2 skipped`, no failures, retries or flakes;
- early-rescue → restart → Kirill interrogation regression passes on desktop and mobile;
- the clean full route passes on its first execution and reaches the epilogue;
- canonical saved state remains compatible.

Automated success proves route/state integrity, not optimal mystery difficulty. A zero-coaching human playtest remains mandatory after the v2 proof graph is coherent enough to test as a whole.

## Immediate next work

1. **Forensic actor proof** — visibly plant Kirill's fresh hand cut/bandage and let the player notice it before a comparison is offered.
2. Let the player earn a comparison between that fresh injury and the already sampled E001 desk microtrace; this should independently prove Kirill's physical presence in 314.
3. Upgrade **Kirill interrogation v2** so it tests an already assembled constellation: route + M3 elimination + physical-presence proof + motive.
4. Upgrade **E011 v2 / final synthesis** so serial, integrity/checksum and B-17 content are distinct proof sources and the final graph uses the new actor-proof family.
5. Build **Debrief v2** with chronology, route reconstruction, each person's lie, proof links used/missed and unsupported claims.
6. Then run a fresh **zero-coaching human playtest** and change only observed agency/usability defects.

Do not reintroduce a linear evidence queue or UI copy that names the deduction before the player earns it.

## Known technical debt

- npm install reports 2 vulnerabilities (1 moderate, 1 high); investigate rather than blindly force-upgrading.
- GitHub Actions Node 20 deprecation warning remains; update workflows separately.
- some external/Unsplash media still need replacement before a fully offline paid release.
- no genuine Kirill video exists; do not imply otherwise.
- payment/access/purchase-recovery remains outside this gameplay checkpoint.
- the global state model still exposes a legacy single `RouteStage`; PR #67 makes it parallel-safe for early rescue, but a future cleanup may replace more stage-based assumptions with proof-gate capabilities.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.11.0 + E008 v2 + E009 v2** on `main`.

Current priority: **forensic actor proof — Kirill fresh hand injury → player-earned comparison with E001 microtrace → independent proof of physical presence in 314.**
