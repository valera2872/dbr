# CASE 001 COMPETITIVE AUDIT — «Номер 314»

Audit date: **2026-08-18**  
Implementation baseline: **v0.11.0 — Room 314 v2 parallel investigation**  
Companion standards: `DETECTIVE_DESIGN_BIBLE.md`, `COMPETITIVE_QUALITY_GATE.md`

## Executive conclusion

«Номер 314» already has a **stronger logical skeleton than its current presentation suggests**.

The correct strategy is **not** to restart the case. Preserve the locked-room premise, the “everyone lies about something different” theme, the 2015 layer, the service-network redesign, the early rescue, the player-led proof structure and the current browser-first platform.

The main competitive gap is now **presentation of investigation** rather than absence of plot.

Compared with the strongest references, the current case still too often exposes evidence as game UI / checklist content instead of letting the player work inside a believable digital dossier. It also lacks two high-value premium effects: a dense navigable case world and truly free suspect interrogation under fixed canon.

The most efficient route is therefore:

> **preserve story → finish v2 proof logic → turn key exposition into diegetic evidence → add a compact case map → add one bounded-AI interrogation → build a strong evidence-aware debrief.**

Do not add a huge city, full cast AI, live-action video or multiple crime truths.

---

# 1. What is already good and must not be lost

## 1.1 The central hook

Ilya disappears from room 314 while the ordinary exits appear impossible:
- door log does not show a normal exit;
- window is closed;
- corridor camera does not show a normal departure;
- personal belongings remain.

This is a saleable one-sentence mystery and gives the player a concrete reconstruction problem immediately.

**Preserve unchanged at concept level.**

## 1.2 “Everyone lies, but about different things”

The strongest thematic asset is not merely Kirill as culprit. It is that:
- Kirill hides historical responsibility and the current assault;
- Marina hides hotel liability / incomplete closure;
- Denis hides archive manipulation;
- Vera hides identity / source status / conflict over publication.

This allows real red herrings without fake evidence and should become even more visible in the debrief.

## 1.3 The old case / B-17 layer

The 2015 event gives the current disappearance emotional and causal depth. It prevents the case from feeling like a one-room logic puzzle.

Preserve the narrow truth boundary:
- Anton's death was not a secret premeditated murder;
- B-17 proves knowingly unsafe continuation / concealment and therefore a powerful current motive.

## 1.4 Service-network v2

v0.11.0 fixed a major structural weakness: E006/E007 no longer equal “private tunnel from Kirill's room = Kirill”.

The second access through M3 keeps Marina physically plausible and separates:
- route possibility;
- route use;
- actor identity.

This is exactly the kind of evidentiary separation DBR should preserve in future cases.

## 1.5 Rescue independent of confession

Allowing the player to find Ilya in S-3 from E005 + E006 + E007 is a major strength.

It creates a better emotional rhythm:

> solve immediate human emergency first → continue proving who did it and why.

Do not return to confession-gated rescue.

## 1.6 Player-built proof

Keep:
- player-earned E006 request;
- player-selected evidence in Kirill confrontation;
- valid objections to weak proof;
- multi-part final accusation rather than one polished “correct answer”.

These systems already differentiate DBR from a visual novel.

## 1.7 Low technical friction

The browser-first/PWA platform and progressive first-run UI are an asset. The case can be started without organizer-controlled launch or a physical kit.

Future commercial access should preserve the same session and progress when payment occurs.

---

# 2. What currently looks weaker than the best references

## 2.1 Evidence still looks too much like game content

The late evidence set has improved visual differentiation, but much of the interaction still follows:

> open evidence card → click numbered points/list rows → receive author-written interpretation.

This is functional, but beside premium dossier products it can still feel like a puzzle interface rather than a file an investigator obtained.

**Gap:** evidence authenticity / materiality.

## 2.2 The digital world is too compactly contained inside one HQ

The new branch board improves agency, but the player does not yet strongly feel that the hotel, archive, service network, guest registry and 2015 event are separate information systems.

The case can feel larger without adding much content if several existing materials are reframed as distinct in-world sources.

**Gap:** world scale / immersion.

## 2.3 Interrogation is strategically good but not conversationally alive

The Kirill confrontation already lets the player choose evidence and receive proof-specific objections. That is good investigative design.

But it remains a structured interaction, not a free questioning experience.

**Gap:** character presence / conversational agency.

## 2.4 E008/E009 still carry legacy explanatory semantics

Current v0.11.0 itself marks these as transitional:
- E008 names Kirill too strongly in the historical material;
- E009 tends to turn identity discovery into authorial exoneration.

This reduces ambiguity precisely where the case should be psychologically richest.

**Gap:** fair-play uncertainty / suspect depth.

## 2.5 The final report is not yet a premium debrief

A solved case should not end primarily with “correct / rank / summary”.

The player should see:
- true chronology;
- exact route;
- what each person lied about;
- which evidence proved which link;
- which clues were missed;
- which wrong hypotheses were reasonable;
- what the player failed to prove, if anything.

**Gap:** retrospective payoff.

## 2.6 The current sense of duration is smaller than the logical case

The target case length is about 90 minutes. That does not need to become 3–5 hours simply because a competitor advertises that duration.

But the case should **feel broader than 90 minutes of screens**. Cross-linked evidence, character conversations and a compact map can create that scale without multiplying content.

---

# 3. Where the player is still reading a script instead of investigating

## E006 / E007 interaction pattern

The underlying deduction is now good, but the evidence UI still uses explicit completion counts and numbered inspection points. Operational clarity is useful, yet the player can experience the material as “click every marker to finish”.

**Modernization:** keep obvious controls, but make the task “compare / inspect” rather than “complete 3/3”. Allow the player to finish when the relevant factual observations are found, and keep optional details optional.

## E008

The archive should be an archive, not four prose buttons that summarize what the archive says.

**Modernization:** provide a small archive workspace with:
- digitization inventory;
- B-series contact sheet/index;
- chain-of-custody line;
- short partial audio/transcript;
- search/filter or side-by-side comparison.

The player should discover the missing 48th item by comparing source counts, not by clicking a button titled “В цифровой папке нет одного оригинала”.

## E009

Identity should be discovered through document discrepancy.

**Modernization:** show actual registration data / old family-event document / protected-source message and let the player choose what identifiers to compare. Do not label the intended conclusion before the comparison.

## E011

The final microSD should feel like forensic verification.

**Modernization:** serial/provenance, checksum/integrity and B-17 playback should be separate visible data sources. The player should connect them instead of receiving one summary that “the card is authentic and proves the old motive”.

## Final accusation/debrief

The final synthesis is already better than a multiple-choice verdict, but it can still become more investigative if the game shows which proof links were actually established rather than only whether the final combination was accepted.

---

# 4. Where to give the player real choice

v0.11.0 already opens the correct foundation after E007. Expand this rather than create another branching system.

## Choice set A — location / route

After the service network is known, let the player choose among meaningful nodes such as:
- 314;
- 312;
- M3 staff access;
- service lift SL3;
- S-3;
- hotel administration / maintenance records;
- archive access.

Not every node needs a bespoke scene. Some can open a document source or investigative action.

## Choice set B — suspect work

Once multiple current-night hypotheses exist, let the player choose which person to pressure first:
- Marina about building closure and M3;
- Denis about B-17 provenance;
- Vera about identity/source relationship;
- Kirill about 312 / 2015 / current injury.

Questions become available from factual premises, not act numbers.

## Choice set C — forensic comparison

After the wiped microtrace is preserved, the player should choose what comparison is justified next instead of receiving “compare with Kirill”.

The final implementation must use a **plausible sample source already in the case**. Do not magically obtain DNA merely because a forensic button exists.

## Choice set D — digital source

Give the player a choice between checking:
- access controller;
- maintenance acceptance record;
- archive inventory;
- guest registration/source history;
- phone telemetry.

Each should answer a different investigative question.

---

# 5. Materials that should become real game evidence

The existing story already contains almost everything needed. The gain comes from changing presentation, not adding subplots.

| Evidence / branch | Current concept | Premium form |
|---|---|---|
| E002 | last-message summary | messenger export with timestamps/read receipts |
| E003 | lock-log conclusion | controller event table / CSV-like log |
| E004 | corridor camera | short playable CCTV timeline with scrubber/key moments |
| E005 | phone near lift | phone forensic screen: location, sound-off, airplane mode, movement gap |
| E006 | old plan | keep scanned/photographed survey plan; improve legibility/material texture |
| E007 | 312 inspection | scene photo + closeups; observations separated from interpretation |
| Marina branch | closure history | maintenance/acceptance portal + missing final closure record + M3 controller log |
| E008 | archive checklist | archive inventory, contact sheet, custody record, partial audio |
| E009 | identity checklist | guest card + old family/event record + protected-source correspondence |
| E010 | service-room search | grounded location scene with adapter/first-aid/door state |
| E011 | final card | forensic reader + serial/checksum + B-17 media playback |
| finale | rank/report | interactive chronology + proof graph + missed-evidence review |

This should be implemented through reusable templates rather than one-off mini-apps.

---

# 6. Where free AI interrogation is justified

## Kirill — **yes, high value (B)**

He is the best first AI character because:
- his alibi changes meaning during the case;
- he has both historical and current secrets;
- different evidence families support different claims;
- he can legitimately object to weak accusations;
- the player benefits from asking the same fact in different ways.

Recommended boundary:
- structured evidence system remains the source of truth;
- free-text conversation becomes another way to probe him;
- he never volunteers undiscovered canon just because the player guesses correctly;
- evidence / premise flags control what he may acknowledge;
- if asked about an unknown or nonexistent fact, he denies knowledge rather than inventing.

## Marina — **potentially yes, second priority (B)**

Her institutional lie is psychologically useful and supports a real false hypothesis. AI could make the distinction between defensive hotel language and direct falsehood feel natural.

Do this only after Kirill's truth model proves reusable.

## Vera — **potentially yes, later (B)**

The publication/source conflict could benefit from emotionally nuanced questioning. However, E009 must first work as fair evidence without relying on AI confession.

## Denis — **structured interrogation may be enough (A / low B)**

His core function is provenance and archive manipulation. A strong document trail plus a small set of evidence-responsive answers may create most of the needed effect more cheaply.

## Full four-character free AI from the beginning — **C, do not do now**

It increases cost, testing surface and canon-drift risk without proving that all four need it.

---

# 7. One objective truth / multiple outcomes

The case already has one canonical truth and must keep it.

Different player results can still be meaningful without changing who attacked Ilya.

Recommended outcome dimensions:
- Ilya found quickly / late;
- B-17 recovered / not recovered before accusation;
- Marina's hotel concealment proven / missed;
- Denis's archive manipulation proven / missed;
- Vera's identity/source conflict understood / misread;
- Kirill correctly accused with complete proof / correct actor but weak proof / wrong accusation;
- historical responsibility correctly characterized / overstated as murder / missed.

The debrief can grade **quality of investigation**, not generate alternate realities.

---

# 8. Puzzle legitimacy audit

## Keep

- spatial reconstruction of the locked-room contradiction;
- comparing old/current plans;
- timeline contradictions;
- access-log interpretation;
- evidence provenance;
- identity/document comparison;
- CCTV / phone trace interpretation;
- proof selection during confrontation;
- causal final synthesis.

These are investigative tasks.

## Avoid / remove

- arbitrary ciphers whose existence is not motivated by the people or evidence;
- passwords that are solvable only because the game wants a password puzzle;
- hidden-object clicking with no investigative inference;
- “combine two cards because the system allows combinations” without a real-world reason;
- extra locks/minigames that only extend playtime.

If a code/password exists, the person who created it must have a believable reason to choose it and the player must have a believable reason to try to access the protected source.

---

# 9. Competitive scorecard — current v0.11.0

Internal subjective review, 0–5. This is a production tool, not a public claim.

| Dimension | Current | Comment |
|---|---:|---|
| Premise / hook | **4.7** | Locked-room disappearance + old case is strong |
| Evidence authenticity | **3.2** | distinct visuals, but too many game-card/list interactions |
| Player agency | **4.0** | v0.11.0 parallel board materially improves this |
| Deduction quality | **4.2** | strong proof separation; E008/E009/E011 still transitional |
| Character psychology | **3.8** | four real secrets are strong; presentation still needs depth |
| World density | **3.1** | good spatial canon, weak player-facing world map/source separation |
| Interrogation quality | **3.3** | strong evidence objections, not yet free conversational investigation |
| Technical friction | **4.6** | browser-first, progressive guidance, no organizer start |
| Premium presentation | **3.4** | solid shell; decisive evidence still below flagship reference feel |
| Debrief payoff | **2.9** | current report is too compact for the story's complexity |

Current average: **3.72 / 5**.

The case is not weak. Its logical foundation is ahead of its premium material/debrief layer.

---

# 10. Point modernization plan by A / B / C

## A — do obligatorily

### A1. Finish the already-approved v2 semantics

- E008: provenance/safety dispute without early full Kirill attribution;
- E009: real identity/source conflict without automatic exoneration;
- E011: final historical attribution only after card integrity/provenance is established;
- actor proof: independent current-night presence evidence.

This is already required by the canonical architecture.

### A2. Stop writing conclusions into evidence labels

Evidence artifacts show raw facts. Investigator notebook / finding panel may record the player's discovered observation, but the artifact itself must not say the conclusion the player is meant to infer.

### A3. Convert E002/E003 and Marina's M3 line to convincing raw digital records

These are cheap, text/table-driven assets with high authenticity value and can become reusable templates.

### A4. Replace completion-checklist guidance with operational help only

Keep “how to inspect / how to compare”. Remove guidance that effectively says “click all three, then E007 opens”.

### A5. Make the investigation board a persistent case notebook

Show open questions, discovered facts and player-generated/selected hypotheses. Do not show the correct next answer.

Reuse this component in every future case.

### A6. Build debrief v2

After accusation show:
- 2015 chronology;
- current-night chronology;
- route reconstruction;
- each person's lie and motive;
- proof links used by the player;
- relevant evidence the player missed;
- unsupported claims in the player's accusation.

Most of the data already exists in author documents/state, so this is high leverage.

### A7. Grade investigation quality, not alternate truth

Correct actor with incomplete proof should differ from complete reconstruction. Wrong accusation should be allowed to produce a meaningful debrief/result rather than only “try again forever”, if commercial UX supports it.

## B — select the highest-value investments

### B1. Compact player-facing case map

Create a reusable map component with roughly 6–8 meaningful Case 001 nodes. The map should unlock knowledge, not physically simulate walking.

Expected feeling: “I choose where to investigate.”

### B2. Premium evidence template pack

Create reusable visual components for:
- messenger export;
- access/event log;
- archive inventory;
- maintenance portal;
- registration/profile record;
- forensic media reader;
- CCTV player.

Use AI-generated/owned raster imagery where realism matters, but keep text/data deterministic and legible.

### B3. Bounded-AI Kirill interrogation

One canonical AI character first. Reuse the schema/runtime later.

### B4. Playable CCTV + B-17 media

Two short media experiences can create more premium value than many static images because they make the player perform temporal observation.

### B5. Two in-world digital portals, not ten fake websites

Recommended:
- hotel maintenance/access system;
- 2015 archive/media system.

They create the feeling of multiple external systems while remaining inside the same app and codebase.

## C — do not do now

- full free AI for every character from minute one;
- live-action video for the whole cast;
- huge open city / hundreds of locations;
- complex synchronous multiplayer;
- duel system before the core single-team case is premium;
- separate real external domains/services for each clue;
- multiple incompatible truths / randomized culprit;
- large 3D hotel exploration.

If later evidence shows one of these materially increases conversion/retention, reassess it then.

---

# 11. Highest-leverage implementation order

Do **not** jump directly to AI or a map while legacy evidence semantics are still leaking answers.

Recommended next sequence:

1. **E008 v2** — turn it into provenance/archive investigation and remove premature Kirill solution.
2. **E009 v2** — make Vera's secret suspicious but not self-exonerating.
3. **actor microtrace comparison** — add Kirill's visible injury and a plausible evidence comparison path.
4. **E011 v2** — make the recovered original a genuine forensic/media object and final historical proof.
5. **debrief v2** — chronology + lies + missed clues + proof quality.
6. **compact map / case notebook polish** — make existing branches feel like a world.
7. **bounded-AI Kirill pilot** — only after the canon/proof graph is stable.
8. **premium media pass** — replace the weakest game-like artifacts using reusable templates.
9. **zero-coaching human test**.

This order preserves sunk work, fixes logic before spectacle and produces reusable platform assets.

---

# 12. Target state after modernization

The player should be able to describe the experience approximately like this:

> “I opened a real-looking case, inspected room 314, checked the lock and camera, discovered that the hotel geometry did not fit the records, chose whether to chase the missing person, the archive or the staff access, questioned people who were hiding different things, compared digital and physical traces, found Ilya before I had fully proved the attacker, recovered the original recording and then built the accusation from what I had actually established.”

If the finished case creates that memory, it will feel substantially larger than the amount of bespoke content required to build it.