# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-18`

Branch: `main`

Current numbered release: **`v0.11.0 — Room 314 v2 parallel investigation`**

Latest gameplay checkpoint: **`E008 v2 — diegetic archive workspace`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest gameplay merge:
- merged PR: `#66 — E008 v2 — diegetic archive workspace`
- PR head: `cb1b4134514b8dda4e9d500cae11c365ae8d05cf`
- merge commit: `8ac18901fe69243958708345ef561ba116971749`
- Validate DBR prototype run `32109066710` — success
- Browser Playthrough run `32109066701` — success (`50 passed`, `2 skipped`, no failures/flakes)

Previous numbered release:
- PR `#63 — v0.11.0 Room 314 v2 parallel investigation`
- merge commit `416e4588435fd5dc22042087d82e1e96dd1cb4e1`
- final PR browser suite: `50 passed`, `2 skipped`, no failures/flakes
- Pages deployment succeeded.

## Canonical methodology

Project-wide standards already merged:
- `DETECTIVE_DESIGN_BIBLE.md` — investigation / fair-play design standard;
- `COMPETITIVE_QUALITY_GATE.md` — permanent competitor-quality gate;
- `CASE_001_COMPETITIVE_AUDIT.md` — point-by-point competitive audit of «Номер 314»;
- `CASE_001_ARCHITECTURE.md` — Case 001 v2 investigation architecture;
- `CASE_001_TRUE_TIMELINE.md` — author-only true chronology;
- `CASE_001_SPATIAL_CANON.md` — author-only geometry / access model.

Permanent product question for competitor-inspired mechanics:

> **What will the player feel because of this mechanic, and can we create that feeling more simply?**

Every proposed upgrade must be classified:
- **A** — cheap/reusable, high impact: do;
- **B** — meaningful gain with real cost: select highest leverage;
- **C** — expensive spectacle / low leverage: defer or simulate more cheaply.

Target product formula:

> **psychologically convincing story + authentic investigation feeling + freedom of action + bounded-author-truth AI + high-quality digital evidence + minimal technical friction**

Desired post-game reaction:

> **«Я несколько часов расследовал настоящее дело».**

Not: «я прошёл викторину / визуальную новеллу».

## Product

Web/PWA interactive detective series **ДБР**.

First case: **«Номер 314»**.

Canonical parameters:
- 14+;
- about 90 minutes;
- 1–4 players.

## Governing investigation principle

> **The interface must be obvious. The investigation must not be obvious.**

Operational help may explain controls, navigation and how a mechanic works. It must not choose the theory, suspect, evidence order, deduction or conclusion for the player.

For every major discovery ask:
1. **What factual contradiction gave the investigator a reason to check this direction?**
2. **What player action caused the new information to enter the case?**

If the answer is “the game told the player” / “clicked Next”, treat the segment as defective.

Target loop:

**fact → contradiction → hypothesis → chosen investigative action → evidence → revised hypothesis → verification**

Not:

**read → Next → read → Next**.

## Canonical v2 truth

The redesign preserves the identity of the case:
- Ilya disappears from locked room 314 and is ultimately found alive;
- Kirill is the current-night attacker;
- the 2015 case proves Kirill knew of an unsafe operational condition and chose continuation / concealment; it does **not** prove a premeditated murder of Anton;
- Denis really hid B-17 from the common digital archive but did not attack Ilya;
- Vera / Elena really hid her identity, preserved the original and had a real conflict about publication but did not attack Ilya;
- Marina really concealed the incomplete/cosmetic closure of the old service network but did not attack Ilya.

Canonical topology:

**312 → A312 → V314 → A314 → 314**

and:

**V314 → P3 → M3 / SL3 / S-3 / ST3**

`M3` is an independent staff-side access point. Therefore finding the route proves topology/opportunity, not actor identity.

## Implemented v2 investigation structure

### E006 — topology, not culprit

The player earns E006 by independently checking wall / renovation history and explicitly requesting the pre-renovation plan.

E006 establishes:
- `V314` between 312 and 314;
- continuation into `P3`;
- service branch toward `M3 / SL3 / S-3`.

Proof limit: historical route/topology only; not proof that Kirill used it.

### E007 — current usability, not culprit

The old archive-envelope bridge in room 312 is removed from the v2 route.

E007 establishes:
- the route physically survives;
- it was used recently/current night;
- V314 continues into P3 and is not exclusive to 312.

Proof limit: current usability/recent use; not user identity.

### Parallel investigation after E007

The game opens concurrent questions rather than one content queue:
1. **Where is Ilya?** — search P3 / S-3 from E005 + E006 + E007.
2. **What was the target?** — audit B-17 provenance.
3. **Could Marina/staff have used the route?** — closure records + M3 controller.
4. **Who was physically inside 314?** — preserve the wiped desk microtrace.

These lines can be worked in different orders.

### Early rescue before confession

Ilya can be found in S-3 before Kirill confesses.

The search premise comes from:
- E005 staged phone near service lift;
- E006 network topology;
- E007 recent use.

The rescue deliberately does not identify the attacker. Saving Ilya and proving the attacker are separate problems.

### Marina / M3 productive false lead

Marina is a serious current-night hypothesis because her building lie is real, her institutional motive is real and she has staff access.

The M3 controller log later shows no M3 opening during the critical window. Her lie remains meaningful while the attack hypothesis weakens through evidence.

### Desk microtrace

The wiped trace first seen in E001 can be deliberately sampled after multiple actor hypotheses exist.

Current state:
- microtrace preserved;
- owner not yet named.

Next actor-proof slice must plant Kirill's fresh hand injury and create a justified comparison that independently proves his physical presence in 314.

## E008 v2 — diegetic archive workspace

E008 is no longer primarily a four-button prose explanation.

It is now a separate React-owned archive workspace using the existing canonical Act III save key and the same archive progress IDs (`catalog`, `contact`, `audio`, `custody`).

Four source families are presented as raw in-world records:

1. **Digitization inventory**
   - paper inventory: 48 physical positions;
   - digital export: 47 files;
   - B-17 marked `ORIGINAL OUT / в общий экспорт не включать`;
   - Denis is the digitization operator.

2. **B-series contact sheet**
   - B-16 → B-17 → B-18 sequence;
   - B-17 definitely existed;
   - it carries the 314-17 marking;
   - the sheet itself does not identify the person responsible for the historical decision.

3. **Partial recorder transcript**
   - one voice warns that the technical branch is unsafe and must be closed;
   - another insists the program will not stop;
   - the surviving fragment contains **no names**.

4. **Media custody ledger**
   - 314-17 is removed from common digitization;
   - Denis handles the removal;
   - it is transferred to `В. Белова / семья потерпевшего`;
   - no return into the digital archive is registered;
   - its serial matches the empty media case from Ilya's bag.

### E008 proof boundary

After all four source families are compared, the player may establish:
- B-17 existed;
- the digital set is deliberately incomplete;
- Denis manipulated the archive chain;
- 314-17 moved to the Belov family;
- a real historical safety dispute existed;
- B-17 is a plausible object of current suppression.

E008 **does not** establish:
- the exact historical responsibility of Kirill;
- the identity of the current-night attacker;
- that motive alone proves execution.

Full historical attribution remains reserved for E011 / verified original.

The E008 card now describes source comparison rather than announcing the intended conclusion.

## Competitive quality gate — current Case 001 priorities

The audit conclusion remains: do **not** restart the plot. The logical skeleton is stronger than the current presentation.

Preserve:
- locked-room hook;
- “everyone lies, but about different things”;
- B-17 historical layer;
- service-network ambiguity;
- rescue independent of confession;
- player-built proof;
- low-friction browser/PWA start.

Highest-value gaps still remaining:
- E009 still feels too much like a game checklist and author-exonerates Vera too quickly;
- actor identity still lacks the finalized individualized current-night presence proof;
- E011 still compresses provenance/integrity/content into a scripted conclusion;
- final report is still too small for the complexity of the case;
- free conversational interrogation is not yet implemented;
- player-facing case world/map is still compactly contained inside the HQ.

Do not jump to AI/map spectacle before proof semantics are finished.

## Transitional elements still to rewrite

1. **E009 v2** — identity/source must establish Vera's real secret and publication conflict without automatically clearing her; innocence should emerge from timing/opportunity evidence.
2. **Forensic actor proof** — visibly plant Kirill's fresh cut/bandage and let the player earn a comparison with the E001 microtrace.
3. **Kirill interrogation v2** — confrontation should test an already assembled constellation: route + staff-route elimination + physical presence + motive.
4. **E011 v2 / final synthesis** — card serial, checksum/integrity and B-17 content must become distinct proof sources; final graph must reflect actor proof and M3 elimination.
5. **Debrief v2** — true chronology, route reconstruction, each person's lie, proof links used/missed and unsupported claims.
6. **Legacy source cleanup** — once each v2 replacement is stable, remove obsolete duplicate semantics rather than accumulating permanent compatibility layers.

## Retained earlier releases

### v0.9.6 — Focused first action
Fresh player starts with one concrete action instead of the full HQ.

### v0.9.7 — Progressive HQ disclosure
Guided newcomers see only needed sections; repeat players can skip guided reveal.

### v0.9.8 — Investigative agency
The old-plan idea became player-owned.

### v0.9.9 — Evidence-led chain
Archive and identity materials became causally acquired.

### v0.10.0 — Player-led interrogation
No prescribed evidence recipe; weak evidence receives meaningful objections.

### v0.10.1 — Player-built final accusation
The player assembles proof links instead of selecting a ready-made answer.

### v0.10.2 — Evidence realism
E006–E011 use distinct local/owned stylized-realism visual compositions.

### v0.11.0 — Room 314 v2 parallel investigation
Service network, Marina/M3 competing hypothesis, post-E007 parallel branches, early rescue and microtrace branch entered production.

## Canonical save contract

Do not rename casually:
- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`
- living suspect: `dbr:dbr_001_room_314:living-suspect:kirill:v0.6.3`

UX keys:
- onboarding: `dbr:player-guidance:onboarding:v1`
- guided first run: `dbr:player-guidance:guided-first-run:v1`

No E008 v2 save-key migration was introduced.

## Verification

Latest E008 v2 PR head:
- Validate DBR prototype `32109066710` — success;
- Browser Playthrough `32109066701` — success;
- Playwright summary: `50 passed`, `2 skipped`, no failures/flakes;
- desktop + mobile specifically verify E008 as an archive rather than a ready answer;
- clean full route still reaches E001–E011 and epilogue;
- canonical Act III markers remain compatible.

Automated success proves route/state integrity. It does not prove mystery quality; zero-coaching human testing remains mandatory after the v2 proof graph is coherent enough to test as a whole.

## Immediate next work

1. Rewrite **E009 v2** into a document/source comparison that reveals Vera's identity and real conflict without auto-exoneration.
2. Add visible **Kirill hand injury** and player-earned comparison with the sampled E001 microtrace.
3. Upgrade **Kirill interrogation** around separate proof families.
4. Rewrite **E011** as provenance + integrity + content verification and update final synthesis.
5. Build **debrief v2**.
6. Then run a fresh **zero-coaching human playtest** and fix observed agency/usability defects.
7. After proof semantics are stable, consider B-class upgrades: compact case map/notebook and bounded-AI Kirill pilot.

## Known technical debt

- npm install reports 2 vulnerabilities (1 moderate, 1 high); investigate rather than blindly force-upgrading.
- GitHub Actions requests Node 20 while hosted actions force Node 24; update workflow separately.
- some temporary external/Unsplash primary media must be replaced before fully offline paid release.
- no genuine Kirill video exists; do not imply otherwise.
- payment/access/purchase-recovery remains outside this gameplay checkpoint.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.11.0 + merged E008 v2 archive workspace** on `main`.

Current priority: **E009 v2 → individualized actor proof → interrogation/E011/final proof graph → debrief, then zero-coaching human test.**

Always apply `DETECTIVE_DESIGN_BIBLE.md` and `COMPETITIVE_QUALITY_GATE.md` before proposing new mechanics.

Do not reintroduce a linear evidence queue, detective-GPS wording, or competitor mechanics whose player effect can be achieved more cheaply.
