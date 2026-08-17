# PROJECT STATE — ДБР

## Checkpoint

Date: `2026-08-17`

Branch: `main`

Current release: **`v0.11.0 — Room 314 v2 parallel investigation`**

Production base URL:
- `https://valera2872.github.io/dbr/`

Latest release:
- merged PR: `#63 — v0.11.0 Room 314 v2 parallel investigation`
- PR head: `1c71e4184bc31eecc00a43995dedf036c19beee6`
- merge commit: `416e4588435fd5dc22042087d82e1e96dd1cb4e1`
- Validate DBR prototype run `32061313949` — success
- Browser Playthrough run `32061313881` — success (`50 passed`, `2 skipped`, no failures/flakes)
- Pages deploy run `32061840528` — build success, deploy success

Canonical methodology / author documents already merged:
- `DETECTIVE_DESIGN_BIBLE.md` — project-wide investigation design standard;
- `CASE_001_ARCHITECTURE.md` — Case 001 v2 investigation architecture;
- `CASE_001_TRUE_TIMELINE.md` — author-only true chronology;
- `CASE_001_SPATIAL_CANON.md` — author-only geometry / access model.

## Product

Web/PWA interactive detective series **ДБР**.

First case: **«Номер 314»**.

Canonical parameters:
- 14+;
- about 90 minutes;
- 1–4 players.

## Governing product principle

> **The interface must be obvious. The investigation must not be obvious.**

Operational help may explain controls, navigation and how a mechanic works. It must not choose the investigative theory, suspect, evidence order, deduction or conclusion for the player.

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

The old route is no longer a private “Kirill tunnel”. Canonical topology:

**312 → A312 → V314 → A314 → 314**

and:

**V314 → P3 → M3 / SL3 / S-3 / ST3**

where `M3` is an independent staff-side access point. Therefore finding the route proves opportunity/topology, not actor identity.

## v0.11.0 — first functional v2 slice

### E006 — topology, not culprit

The player still earns E006 by independently checking the wall / renovation history and explicitly requesting the pre-renovation plan.

E006 now visibly establishes:
- `V314` between 312 and 314;
- continuation into `P3`;
- staff/service branch toward `M3 / SL3 / S-3`.

Canonical proof limit:
- E006 proves a historical route/topology;
- it does **not** prove Kirill used it.

### E007 — current usability, not culprit

The old player-facing archive-envelope bridge in room 312 has been removed from the v2 logic. The third investigation point is now the physical service branch itself.

E007 establishes:
- the route still physically exists;
- the network was used recently/current night;
- V314 is connected to P3 and therefore is not exclusive to room 312.

Canonical proof limit:
- E007 proves current usability/recent use;
- it does **not** identify the user.

### Parallel investigation after E007

After route discovery, the game no longer presents one canonical content queue. A v2 investigation board opens four independent questions:

1. **Where is Ilya?** — search P3 / S-3 from E005 + E006 + E007.
2. **What was the target?** — audit B-17 provenance from the empty media case, Ilya's purpose and Denis's archive role.
3. **Could staff / Marina have used the route?** — check renovation closure and then the M3 access log.
4. **Who was physically inside 314?** — preserve the wiped desk microtrace for later comparison.

These lines can be worked in different orders.

### Early rescue before confession

Ilya can now be found **before Kirill confesses**.

The player earns the S-3 search from:
- E005 — the phone was deliberately placed near the service lift;
- E006 — the old network reaches the service zone;
- E007 — the route was physically usable and recently used.

The S-3 search writes into the existing canonical Act IV search state; no save-key migration was introduced.

The rescue deliberately does **not** identify the attacker:
- Ilya is alive but initially unable to provide a reliable face identification;
- the room shows isolation and minimal first aid;
- adapter `314-17` is present but the microSD remains unresolved.

This separates **saving the victim** from **proving the offender**.

### Marina / M3 productive false lead

The player can now seriously test Marina as a current-night actor:
- she lied about the building;
- incomplete closure documentation is real;
- she has a plausible institutional motive and staff access.

The subsequent M3 controller check establishes that no M3 opening occurred during the critical window. Her lie remains meaningful, but the current-night actor hypothesis weakens through evidence rather than authorial explanation.

### Desk microtrace

The wiped trace first seen in E001 can now be deliberately sampled after the route has created several plausible actors.

Current v0.11.0 stops at:
- microtrace preserved;
- owner not yet named.

The next implementation slice must plant Kirill's fresh hand injury and create a justified comparison that independently proves his physical presence in 314.

### Archive acquisition

E008 can now be requested directly from the v2 branch using already established facts:
- empty media case;
- Ilya came to investigate Anton's death;
- Denis handled the archive;
- Ilya threatened to reveal evidence.

The former `archive envelope in 312 → ask Denis → BOX 15-B` script bridge is no longer required by the v2 route.

## Transitional elements still to rewrite

v0.11.0 is the **first** production slice of the full v2 architecture. These areas still carry substantial v0.10.x semantics and must be changed next rather than treated as final:

1. **E008 content** — the early archive/audio material currently identifies Kirill too strongly. It must establish the missing original / safety dispute / authority involvement without fully proving Kirill's historical responsibility before E011.
2. **E009 content** — identity/source must establish Vera's real secret and conflict without immediately author-exonerating her; innocence should emerge from timing/opportunity evidence.
3. **Forensic actor proof** — visibly plant Kirill's fresh cut/bandage and let the player earn a comparison with the E001 microtrace.
4. **Kirill interrogation v2** — interrogation should test an already assembled evidence constellation, not become the source of rescue or the first proof of the solution.
5. **E011 / final synthesis** — E011 must close the historical B-17 attribution and the final proof graph must reflect the new actor-proof family and independent staff-route elimination.
6. **Legacy copy / runtime bridges** — continue moving v2 semantics into React-owned sources rather than accumulating permanent overlay patches.

## Retained earlier investigation work

### v0.9.6 — Focused first action
A fresh player starts with one concrete action instead of the full HQ.

### v0.9.7 — Progressive HQ disclosure
Guided newcomers see only the sections they need; experienced/repeat players can skip the guided reveal.

### v0.9.8 — Investigative agency
The hidden-route idea became player-owned; old plans are requested only after factual premises exist.

### v0.9.9 — Evidence-led chain
Archive and identity materials became causally acquired rather than automatically sequenced.

### v0.10.0 — Player-led interrogation
No prescribed evidence recipe; weak evidence receives meaningful objections.

### v0.10.1 — Player-built final accusation
The player assembles actor, route, motive, old-case responsibility and evidence links instead of selecting a prewritten answer.

### v0.10.2 — Evidence realism
E006–E011 use distinct local/owned stylized-realism visual compositions rather than one repeated prototype visual.

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

v0.11.0 stores new v2 milestones inside the existing Act II/III/IV state rather than adding a parallel save system.

## Verification

v0.11.0 final PR head passed:
- Validate DBR prototype `32061313949` — success;
- Browser Playthrough `32061313881` — success;
- Playwright summary: `50 passed`, `2 skipped`, no failures and no flaky tests;
- full clean browser route reaches the epilogue and verifies canonical saved state;
- desktop and mobile v2 agency/evidence-chain checks pass.

Merged main deployment:
- Pages run `32061840528` — build success, deploy success.

Automated success proves route/state integrity, not that the mystery is optimally difficult. A zero-coaching human playtest remains mandatory after the v2 logic is completed enough to test as a coherent case.

## Immediate next work

1. Rewrite **E008 semantics** so it proves provenance / missing original / old safety conflict without prematurely naming Kirill as the complete historical answer.
2. Rewrite **E009 semantics** so Vera remains a legitimate suspect until opportunity/timing eliminates her.
3. Add visible **Kirill hand injury** and a player-earned forensic comparison with the sampled E001 trace.
4. Upgrade **Kirill interrogation** to use route + M3 elimination + physical-presence proof + motive as separate proof links.
5. Upgrade **E011 / final synthesis** to the v2 proof graph.
6. Then run a fresh **zero-coaching human playtest** and fix only observed agency/usability defects.

## Known technical debt

- npm install reports 2 vulnerabilities (1 moderate, 1 high); investigate rather than blindly force-upgrading.
- GitHub Actions requests Node 20 while hosted actions are forcing Node 24; update workflow separately.
- some temporary external/Unsplash primary media still need replacement before a fully offline paid release.
- no genuine Kirill video exists; do not imply otherwise.
- payment/access/purchase-recovery remains outside this gameplay checkpoint.

## Instruction for next chat

When the user says `продолжаем ДБР с последней контрольной точки`, start from **v0.11.0 — Room 314 v2 parallel investigation** on `main`.

Current priority: **complete v2 evidence semantics and actor-proof graph before the next zero-coaching human test.**

Do not reintroduce a linear evidence queue or UI text that names the deduction before the player earns it.
