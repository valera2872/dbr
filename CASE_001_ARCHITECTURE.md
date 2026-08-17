# CASE 001 ARCHITECTURE — «Номер 314»

Version: **2.0 architecture target**  
Status: **canonical redesign specification; production implementation not yet applied**  
Methodology: `DETECTIVE_DESIGN_BIBLE.md`  
Case: ДБР №001 «Номер 314»

---

## 0. Purpose

This document redesigns the investigative architecture of Case 001 without discarding its strongest premise, characters, evidence classes or technical foundation.

The goal is not to make the plot longer. The goal is to make the player do more of the detective work.

Governing rule:

> **Интерфейс должен быть очевидным. Расследование — нет.**

The case must move by:

> **факт → противоречие → версия → выбранная игроком проверка → результат → пересмотр версии → доказательная связка**

not by:

> **E001 → E002 → E003 → следующий экран → следующий правильный документ**.

The current v0.10.2 build remains the stable implementation baseline until this architecture is translated into code and tested.

---

# PART I. WHAT MUST BE PRESERVED

The redesign keeps the core identity of the case.

## 1. Premise

Journalist **Илья Соколов** disappears overnight from hotel room 314.

- the main door remains locked;
- the window is closed from inside;
- the corridor camera records no normal exit;
- Ilya's belongings remain in the room;
- shortly before the incident he tells four people that he has understood who is lying and will reveal evidence in the morning.

The mystery is still a rational locked-room disappearance.

## 2. Historical layer

Eleven years earlier **Антон Белов** died during an event at the same hotel.

The old case is relevant because an original media item, **B-17 / 314-17**, preserves evidence of an unsafe operational decision and subsequent concealment.

The old case must remain a case of **proven negligence / concealment**, not a retroactive premeditated murder.

## 3. Current-night culprit

**Кирилл Бессонов remains the person who attacks Ilya.**

He does not enter room 314 through the guest corridor. He exploits the old service architecture, confronts Ilya over B-17, injures him during the struggle, moves him into an old service room, provides only minimal aid and leaves him isolated rather than calling for help.

## 4. Victim outcome

Ilya is found **alive**.

The emotional climax remains rescue plus proof, not discovery of a corpse.

## 5. Core cast

Keep the four current participants:

- Кирилл Бессонов;
- Марина Орлова;
- Денис Ракитин;
- Елена Ветрова / Вера Белова.

But each must now have a real secret capable of sustaining suspicion.

## 6. Evidence identity

Keep E001–E011 as the principal evidence IDs where practical. The content and acquisition logic may change, but preserving IDs reduces unnecessary implementation churn and allows the existing visual/media structure to be reused.

---

# PART II. AUDIT OF THE CURRENT ARCHITECTURE

## 7. What already works

The current build has several strong elements that should survive the rewrite:

- room 314 is a clear, memorable central impossibility;
- the first scene contains multiple independent physical details;
- lock log + camera + window create a legitimate spatial contradiction;
- the old plan is now player-earned rather than automatically delivered;
- E006 establishes historical possibility and E007 establishes present usability;
- E008 and E009 already demonstrate that people can lie for reasons other than the current assault;
- Kirill's interrogation allows player-selected evidence and meaningful objections;
- the final accusation is assembled from separate proof components rather than chosen as one polished paragraph;
- the current finale correctly distinguishes current assault from 2015 responsibility.

These are structural assets, not temporary prototype work.

## 8. Critical defect: the culprit becomes too obvious too early

At present, once the player proves a usable passage directly between 312 and 314, room 312 belongs to Kirill and his corridor-camera alibi collapses.

That produces an unintended inference:

> **проход из 312 → Кирилл**.

E008 and E009 then mostly explain why Denis and Vera lied, but the player is no longer seriously choosing between competing perpetrators.

### v2 requirement

The old architecture must be a **service network**, not an exclusive private tunnel whose only meaningful access is Kirill's room.

Room 312 remains one access point, but the network must also connect to a maintenance/service branch reachable by hotel staff. Therefore:

- Kirill has opportunity;
- Marina also has opportunity;
- knowledge of the route is suspicious but is not proof of identity;
- physical presence in 314 still has to be proven separately.

## 9. Critical defect: the archive envelope in room 312 is a script bridge

The current E007 places an old festival archive envelope in Kirill's desk with Denis's note pointing to A.B.

It exists mainly to push the player from the passage to BOX 15-B.

This violates the causal standard because its presence in Kirill's current hotel room is harder to justify than the plot transition it creates.

### v2 requirement

Remove the archive envelope from E007.

The archive branch must arise naturally from facts already established:

- Ilya came to investigate Anton's 2015 death;
- an empty memory-card case is in Ilya's bag;
- Ilya threatened to reveal evidence;
- Denis handled the old archive.

That is already enough to justify auditing the provenance of the missing media.

## 10. Critical defect: the rescue is confession-gated

The current interrogation breaks Kirill's alibi and he then tells the detective where Ilya was moved. The game opens the old service room from his statement.

This makes the culprit's confession a required source of the victim's location.

### v2 requirement

The **player must earn the search area before Kirill confesses**.

The search direction comes from:

- E005 — Ilya's phone intentionally placed near the service lift;
- E006 — old service network and branch toward the service zone;
- E007 — fresh proof that the route was used that night.

The player should be able to order a search of the old service branch / S-3 on the basis of those facts.

The confession may confirm the reconstruction later, but it must not create the rescue route.

## 11. Critical defect: the historical audio identifies Kirill too early

The current E008 audio directly addresses Kirill by name and discusses the unsafe passage.

It supplies too much of the old-case solution before the original B-17 is recovered.

### v2 requirement

E008 may establish that:

- a serious safety dispute occurred;
- an original item was withheld from digitization;
- someone with event authority was involved;

but it should **not fully prove Kirill's historical responsibility**.

E011 — the recovered, verified original B-17 — is where the final historical attribution becomes provable.

## 12. Major defect: the investigation remains too sequential

Even after agency fixes, the route still tends toward:

> E007 → archive → E008 → identity → E009 → Kirill interrogation → E010 → E011.

### v2 requirement

After the service route is established, the case must open into several justified branches that can be investigated in different orders:

1. **Archive / B-17 / Denis**;
2. **Hotel renovation / access / Marina**;
3. **Identity / source / Vera**;
4. **Targeted forensic follow-up of room 314**;
5. **Search of the service zone for Ilya**.

The branches converge into a proof graph rather than a content queue.

---

# PART III. THE TRUE STORY — 2015

## 13. Canonical historical event

The exact minute-level chronology will be fixed before implementation, but the causal truth is:

1. The hotel hosts the 2015 event/festival.
2. A service route / technical stair area on the third-floor service network is not safely closed during operations.
3. Anton Belov documents the unsafe condition and a dispute about it.
4. Kirill, responsible for event operations, knows the route is unsafe but insists that the event continue rather than stop the area immediately.
5. Anton later dies in an accident connected to the unsafe service area.
6. The death is not a planned killing by Kirill.
7. B-17 records enough context to prove that Kirill knew of the danger and chose continuation / concealment over shutdown.
8. Denis later participates in handling/digitizing the archive and deliberately omits B-17 from the common digital set because of professional and legal fallout.
9. The original survives outside the normal digital archive and ultimately remains with Anton's family, specifically Vera.
10. After the incident the hotel renovates the third floor. The visible guest-side opening is cosmetically closed, but the old service cavity/network is not completely structurally eliminated.
11. Closure documentation is incomplete. Marina later knows that the hotel's official simplified story — “there is no other route” — is not fully true and has an institutional reason to keep that fact quiet.

The old case therefore creates **three different secrets**:

- Kirill — unsafe operational decision and concealment;
- Denis — archive manipulation;
- Marina — incomplete/cosmetic closure and suppressed liability.

Vera's secret is preserving and transporting the original evidence.

---

# PART IV. THE TRUE STORY — CURRENT NIGHT

## 14. Canonical current-night event

Target chronology; exact timestamps must be verified during implementation:

### Before 22:48

- Ilya has arranged the meeting around the unresolved Anton Belov case.
- Vera arrives under the surname Vetrova at Ilya's request or with his agreement, to prevent the source being obvious before the evidence is copied.
- She brings original media 314-17 / B-17.
- Denis knows enough about the archive to understand what the missing original could expose.
- Marina knows that renewed attention to the 2015 service-route paperwork could expose the hotel's own concealment.
- Kirill knows publication could establish his personal responsibility for the unsafe decision.

### 22:48–23:04

- Vera visits or approaches 314.
- She has a real argument with Ilya about control/publication of the family evidence: she wants confirmation that the original will be protected and not sensationalized.
- She returns to 307.
- This is a genuine reason to lie or minimize the visit later.

### 23:41

- Kirill enters room 312.
- At first this looks like an alibi because the corridor camera never shows him leaving again.
- In reality, 312 contains one access point into the old service network.

### 23:50

- Ilya returns to 314. The main door closes and does not open again before morning.

### 23:56

- Ilya creates a verification copy / checksum record from 314-17.
- The original remains physically present.

### 00:17

Ilya sends:

> «Я понял, кто из вас лжёт. Утром я передам доказательства.»

The message is deliberately ambiguous. Different recipients reasonably believe it may refer to their own secret.

### 00:18 onward

- Kirill reads the message first and believes B-17 will expose his 2015 decision.
- He enters the old service network from 312.
- He reaches 314 without using the guest corridor or main lock.
- He demands the original and pressures Ilya to suppress publication.
- A physical struggle occurs near the desk.
- Ilya suffers a head injury.
- Kirill also receives a small superficial cut. He later offers an innocent explanation for it.
- Kirill attempts to wipe the small secondary trace on/under the desk, but not perfectly.

### Approximately 00:28 onward

- Ilya is no longer moving normally.
- Kirill moves him through the service network toward the old service room S-3.
- This movement creates the carpet/route traces later observed.

### 00:43–00:48

- Kirill relocates Ilya's phone near the service lift to create a misleading endpoint and separate the device from the victim.
- Sound is disabled at 00:43.
- Airplane mode is enabled at 00:48.
- The phone does not show normal owner movement, making the placement detectable as staged.

### In S-3

- Kirill gives only minimal first aid after realizing Ilya is alive.
- He locks/isolates the room rather than call medical help.
- He continues searching for the original media.
- Ilya retains the microSD/adapter during transfer.
- At some point after partial recovery, Ilya separates or conceals the tiny microSD in the service-room technical niche while the more visible adapter remains discoverable.
- Do **not** use the contradictory version in which Ilya hid the card before losing consciousness in 314 but the hiding place is physically in S-3.

### Before morning

- Kirill returns through the service network, never appearing in the guest corridor.
- Denis remains physically accounted for by his bar alibi during the critical window.
- Vera remains in 307 during the critical window.
- Marina does not attack Ilya, but in the morning her knowledge of the old route causes her to understate/deny the possibility of service access.

### 07:12–07:14

- Marina opens 314 by master key.
- Ilya is gone; his belongings remain.
- The locked-room mystery begins.

---

# PART V. CANONICAL SPATIAL MODEL

## 15. Author-only map required

Before implementation, create one canonical plan showing at minimum:

- room 307;
- room 312;
- room 314;
- guest corridor;
- corridor camera field;
- camera blind zones;
- current guest walls;
- old service cavity behind/along 312–314;
- access panel from 312;
- historical/maintenance-side access point available to hotel staff;
- service lift;
- service corridor/vertical branch;
- S-3 old service room;
- route from 314 to S-3;
- route from 312 to 314;
- travel times between nodes;
- which accesses require a tool, key, knowledge or no credential.

## 16. Spatial design law

E006 must establish **possibility and topology**, not guilt.

E007 must establish **recent use**, not culprit identity.

The final identity proof must come from a separate evidence family.

## 17. Required ambiguity

At the moment the player understands the old service network, at least two serious current-night access hypotheses must remain physically possible:

- Kirill from room 312;
- Marina / hotel staff from the maintenance branch.

This prevents the map itself from solving the suspect question.

---

# PART VI. SUSPECT ARCHITECTURE

## 18. Кирилл Бессонов

**Public story:** entered 312 at 23:41 and stayed there all night; corridor camera proves it. Old route was closed years ago.

**Private secret:** he knew the old service system and his 2015 operational decision created serious liability.

**Current-crime relevance:** actual attacker.

**Why he is suspicious early:** first to read Ilya's message; room 312 sits on the old network; historical role.

**Why he is not yet proven:** the service network has another access; historical motive is not physical presence; fibres/toolmarks alone are non-individualizing.

**Late proof change:** his “I never left 312” alibi becomes opportunity rather than protection, but only the individualized room-314 trace plus motive/timing closes the actor link.

## 19. Марина Орлова

**Public story:** modern plan has no second entrance; hotel systems show no anomaly.

**Private secret:** she knows the post-2015 closure was incomplete/cosmetic or that the final closure certification is missing, and has protected the hotel from reopening liability.

**Current-crime relevance:** innocent of Ilya's assault, but genuinely deceptive about the building.

**Why she is suspicious:** access to service areas, master systems, maintenance records; phone found by service lift; false statement about route; institutional motive to suppress 2015 exposure.

**Productive payoff:** investigating Marina reveals the real reason the old route survived and proves that her lie is serious — but current-night physical evidence fails to place her in 314.

## 20. Денис Ракитин

**Public story:** ordinary archive; no unique evidence; he spent the critical period in the bar.

**Private secret:** deliberately omitted B-17 from the common digitization / mishandled the original chain because disclosure threatened his work and exposed past suppression.

**Current-crime relevance:** innocent of the assault.

**Why he is suspicious:** expertise in the archive, direct knowledge of missing media, motive to stop publication, false statement about uniqueness.

**Productive payoff:** his lie explains why B-17 disappeared from the digital archive and gives the player provenance data. Independent bar evidence weakens the current-attack hypothesis without erasing his wrongdoing.

## 21. Вера Белова / Елена Ветрова

**Public story:** Elena Vetrova, little or no prior personal relationship with Ilya, brief visit to 314.

**Private secret:** Anton's sister; secret source; brought the original under another surname; argued with Ilya about publication/control of family evidence.

**Current-crime relevance:** innocent of the assault.

**Why she is suspicious:** hidden identity, possession of the key original, visit to 314, real emotional conflict over the evidence.

**Productive payoff:** E009 proves identity and source relationship but should not instantly say “therefore she is innocent”. Her innocence comes from timeline/opportunity checks combined with the later actor proof.

---

# PART VII. HYPOTHESIS NETWORK

## 22. Initial hypotheses

After E001–E005, the player should reasonably be able to hold several explanations:

- **H1 — voluntary staging:** Ilya staged the disappearance to provoke confessions.
- **H2 — manipulated records:** door/camera/system records are incomplete or were bypassed.
- **H3 — unrecognized physical route:** the known geometry is wrong/incomplete.
- **H4 — victim was moved into a service area:** the phone near the lift may point to movement outside the guest corridor.

No suspect must be assigned yet.

## 23. After the old network is established

New competing actor hypotheses become viable:

- **H-K — Kirill:** access from 312 + historical exposure motive.
- **H-M — Marina:** hotel/service access + false building statement + institutional motive + phone near staff route.
- **H-D — Denis:** archive manipulation + motive to suppress B-17.
- **H-V — Vera:** hidden identity + ownership/family stake + conflict with Ilya.
- **H-S — staging:** Ilya deliberately used the network himself.

The player should have reason to test all of them, not merely click through four portraits.

## 24. Hypothesis elimination must be evidentiary

Examples:

- finding Ilya injured and isolated strongly damages H-S;
- verified critical-window bar evidence weakens H-D as actor but leaves Denis's archive offense true;
- Vera's room/timeline evidence weakens H-V as actor but leaves her identity deception true;
- Marina's service-access secret sustains suspicion until targeted current-night evidence fails to place her in 314;
- Kirill is not proven until route opportunity, timing/motive and individualized physical presence converge.

---

# PART VIII. EVIDENCE ARCHITECTURE E001–E011

## 25. E001 — Осмотр номера 314

**Keep:** locked window; belongings; empty memory-card case; carpet movement; desk scratch/wiped mark.

**Upgrade:** the wiped desk mark becomes a layered clue.

### First meaning

A struggle or hurried cleaning occurred near the desk.

### Later meaning

Targeted forensic follow-up recovers a tiny secondary blood trace or equivalent individualized biological trace consistent with Kirill's fresh cut.

### Fair-play planting

Kirill's small cut/bandage must be visible or mentioned early enough to be noticed without announcing its significance. He gives a plausible innocent explanation.

### Final function

This is the independent proof that Kirill was physically inside 314. It must not be replaced by confession.

## 26. E002 — Последнее сообщение Ильи

**Keep:** 00:17 threat and read times.

**Meaning:** everyone has a reason to fear that “кто из вас лжёт” may refer to them.

Do not tell the player which lie Ilya meant.

The ambiguity is a suspect engine.

## 27. E003 — Журнал замка 314

**Keep.**

Function:

- excludes normal main-door movement;
- creates locked-room contradiction;
- does not prove that nobody entered.

## 28. E004 — Коридорная камера

**Keep core timestamps.**

Important retrospective reversal:

> “Кирилл вошёл в 312 и не вышел” initially protects him; after the old service network is known, it gives him continuous private access to the route.

Do not overstate the blind-zone interpretation before the player earns the spatial hypothesis.

## 29. E005 — Телефон у служебного лифта

**Keep.**

This becomes one of the strongest double-meaning clues.

### Initial interpretation

Maybe Ilya reached the service lift or tried to leave through staff areas.

### Later interpretation

The phone was carried independently of Ilya and staged as a false endpoint.

### Investigative function

Combined with E006/E007 it gives the player a concrete reason to order a search along the service branch toward S-3.

## 30. E006 — Старый обмерный план / service network

**Modify.**

The plan should show:

- old connection around 312/314;
- a narrow service cavity/route;
- a maintenance/service branch continuing toward the service lift/S-3 system;
- post-2015 closure notation;
- no reliable final proof of complete structural closure.

### What it proves

A non-guest route historically existed and may have survived.

### What it does not prove

- that Kirill used it;
- that only Kirill could use it;
- that it remained passable this night.

## 31. E007 — Physical inspection of 312 / network access

**Modify.**

Keep:

- fresh panel/tool signs;
- physical continuity with movement traces;
- recent fibres or contact trace if useful.

Remove:

- archive envelope / “оригинал — у А.Б.” from Kirill's desk.

Prefer an additional spatial finding that confirms the route joins the maintenance branch, reinforcing multiple possible access points.

### What it proves

The old route is physically usable and was used recently/current night.

### What it does not prove

The identity of the user.

## 32. E008 — Archive provenance / B-17

**Modify acquisition:** player requests/archive-audits it because of the empty media case + Ilya's 2015 investigation + Denis's archive role.

No contrived envelope bridge.

E008 should establish:

- the digital archive contains 47 of 48 expected items;
- B-17 existed as an original;
- Denis intentionally omitted or separated it;
- chain-of-custody points toward Anton's family / Vera;
- a dispute about safety/operations existed in the old material.

### Important limit

The early audio/transcript must not fully identify Kirill and prove his entire 2015 role. It can indicate an organizer/authority dispute or incomplete fragment.

E008 creates motive hypotheses; E011 closes the historical proof.

## 33. E009 — Identity / source verification

**Modify.**

E009 establishes:

- Elena Vetrova is Vera Belova;
- she is Anton's sister;
- she brought or preserved the original;
- she had a real disagreement with Ilya over publication/control;
- Ilya knew or suspected her true identity before the meeting.

### Important limit

E009 must not automatically exonerate Vera.

The player should still need timeline/opportunity evidence to separate “real secret” from “current attack”.

## 34. E010 — Search of the old service zone

**Modify acquisition completely.**

E010 is unlocked by an earned search decision based on:

> E005 service-lift phone + E006 network topology + E007 proof of recent use.

It must not require Kirill's confession.

E010 finds:

- Ilya alive but unable to provide a reliable attacker identification at that moment;
- room isolated/locked in a way incompatible with voluntary staging;
- evidence of minimal first aid;
- the visible adapter / sign that a tiny microSD is still missing;
- physical context supporting movement through the service route.

The rescue can occur before the full culprit proof is complete.

This is desirable: **saving the victim and proving the attacker are separate investigative problems.**

## 35. E011 — Recovered microSD / verified original B-17

**Modify acquisition.**

Do not have Ilya simply point to the exact hiding place as the main discovery mechanism.

The reason for targeted recovery is earned from:

- E001 empty media case;
- E008 provenance/serial data;
- E010 adapter without microSD;
- knowledge that the original is still unaccounted for.

A targeted forensic re-search of S-3 / technical niche recovers the microSD.

E011 establishes:

- serial/provenance match;
- copy/checksum/integrity;
- original B-17 content;
- Kirill's identifiable historical operational decision;
- the exact scope of his 2015 responsibility without converting negligence into planned murder.

---

# PART IX. PARALLEL INVESTIGATION GRAPH

## 36. Transition out of Act II

Once E006/E007 establish the usable service network, the game must not display a single canonical “next evidence”.

Offer operational categories justified by current facts.

### Branch A — Where is Ilya?

Premise:
- phone was staged near service lift;
- old network reaches service areas;
- route was used recently.

Action:
- search old service branch / S-3.

Output:
- E010 rescue.

### Branch B — What evidence was being suppressed?

Premise:
- empty card case;
- Ilya investigated Anton;
- Denis handled archive;
- 00:17 threat referenced evidence.

Action:
- audit old archive / missing originals / digitization.

Output:
- E008.

### Branch C — Who is the hidden source?

Premise can be reached by more than one path:
- E008 custody gap points to Vera Belova;
- guest identity/profile contains a mismatch;
- Ilya's contact history indicates a protected source connected to Anton's family.

Action:
- compare registration/history.

Output:
- E009.

### Branch D — Was the route really closed, and who knew?

Premise:
- E006 missing final closure confirmation;
- Marina stated there was no route;
- service access still physically exists.

Action:
- request renovation acceptance records / maintenance history / question Marina.

Output:
- Marina's real secret and staff-access model.

### Branch E — Who was physically in 314?

Premise:
- wiped trace in E001;
- several suspects now have motive;
- route alone does not identify user.

Action:
- targeted forensic examination of wiped desk trace and comparison after a legitimate reason exists.

Output:
- personalized Kirill presence proof.

## 37. No mandatory single order

Implementation may impose technical prerequisites where reality requires them, but there must be no narrative requirement that the player completes A → B → C → D in one fixed sequence.

At least two major branches should be open at the same time after the service route is established.

---

# PART X. MARINA'S PRODUCTIVE RED HERRING

## 38. Why Marina matters

Marina must stop being mostly a source of building information.

Her lie should be strong enough that a careful player can temporarily believe:

> **Marina used staff access, moved Ilya and staged the phone to protect the hotel.**

This hypothesis is reasonable because she:

- controls the hotel;
- knows service areas;
- has access to maintenance records;
- initially denies the route;
- faces exposure from 2015 documentation;
- could plausibly place the phone near a staff lift.

## 39. How the hypothesis fails productively

The investigation reveals:

- Marina really did conceal/incompletely disclose old closure problems;
- her institutional motive is real;
- however, current-night individualized traces / timing do not place her in 314;
- the fresh route use remains consistent with Kirill's private access from 312.

The player was not “wasting time” on Marina. They uncovered a genuine layer of the case.

---

# PART XI. INTERROGATION V2

## 40. Purpose

The Kirill interrogation is not where the player first learns the solution. It is where the player tests a nearly complete evidence constellation against a resistant suspect.

## 41. Evidence families

The player may confront Kirill with evidence from distinct categories:

### Route possibility
- E006 old network.

### Route used this night
- E007 panel / movement / fresh contact.

### Opportunity
- E004 Kirill inside 312 during the critical period.

### Physical presence
- E001 targeted secondary trace linked to Kirill.

### Immediate motive
- E002 threat + E008 provenance / B-17 stakes.

### Historical stake
- E011 original / integrity, if already recovered.

## 42. Weak evidence must receive valid objections

Examples:

**Plan alone:**
> “That proves an old route existed. It does not prove I used it.”

**Fresh panel alone:**
> “Staff use that service space. Who says it was me?”

**B-17 motive alone:**
> “Several people had reasons to fear that recording.”

**312 camera alone:**
> “You are using my alibi as an accusation. Show that I entered 314.”

These objections teach proof structure without revealing the correct recipe.

## 43. Breaking the alibi

The strongest contradiction is no longer merely:

> “You stayed in 312, therefore you used the passage.”

It becomes:

> **You were continuously in the one guest room with private access to the route; that route was used; and an individualized trace places you inside 314 during the same event.**

Motive evidence then explains **why** he went there.

## 44. Confession boundary

Kirill may admit details after the player proves the core contradiction.

But his admission must not be the only source of:

- Ilya's location;
- the existence of B-17;
- the route;
- his physical presence in 314;
- the historical motive.

The investigation must already be able to prove those independently or be actively proving them through separate branches.

---

# PART XII. FINAL PROOF GRAPH

## 45. Locked-room mechanism

**E003 + E001(window) + E004**  
→ normal guest exits do not explain disappearance.

**wall/renovation anomaly + E006**  
→ old service network existed.

**E007**  
→ network remained usable and was used recently.

## 46. Victim movement / rescue

**E005 + E006 + E007**  
→ service branch toward lift/S-3 is a justified search area.

**E010**  
→ Ilya was moved and isolated; staging hypothesis collapses.

## 47. Object of the attack

**E001 empty case + E002 threat + E008 provenance**  
→ B-17 is the likely object of suppression.

**E010 adapter + E011 recovered microSD**  
→ the original survives and matches the chain.

## 48. Actor

**E004 Kirill in 312**  
→ opportunity through a private access point, not proof.

**E001 individualized wiped trace**  
→ physical presence in 314.

**E002 read time + B-17 stake**  
→ immediate trigger/motive.

**E007 current route use**  
→ mechanism consistent with his movement.

Together:

> **Kirill is the only hypothesis that fits opportunity + physical presence + route use + immediate motive without requiring an unsupported extra actor.**

## 49. 2015 responsibility

**E008 provenance / partial historical context**  
→ B-17 is authentic, relevant and deliberately suppressed.

**E011 original + integrity + role records**  
→ Kirill knew of the unsafe condition and chose continuation/concealment.

The final wording must remain narrower than murder:

> Kirill bears proven responsibility for knowingly continuing unsafe operations and concealing the condition connected to Anton's fatal accident.

---

# PART XIII. RETROSPECTIVE “AHA” PAYOFFS

## 50. Required reinterpretations

The ending should make at least these early facts change meaning:

### “Кирилл вошёл в 312 и больше не выходил”
First reading: alibi.  
Final reading: he had uninterrupted private access to the hidden network.

### Wiped trace on Ilya's desk
First reading: generic sign of struggle/cleaning.  
Final reading: the attacker tried to erase the trace that places Kirill inside 314.

### Phone near the service lift
First reading: maybe Ilya went that way.  
Final reading: the phone was separated from Ilya and staged along the attacker's service route.

### Marina's denial
First reading: she may be the attacker or know nothing.  
Final reading: she was lying about a real hotel liability, not the assault.

### Denis's “ordinary archive”
First reading: possible ignorance.  
Final reading: deliberate suppression of B-17, but not current-night execution.

### Elena's identity
First reading: perhaps an impostor/attacker protecting family evidence.  
Final reading: a genuine secret source whose lie is real but belongs to a different layer of the case.

The player should finish with the feeling:

> **«Все действительно лгали. Но они лгали о разном — и только одна совокупность следов доказывает нападение».**

That is the thematic payoff of the original subtitle.

---

# PART XIV. FINAL PLAYER SYNTHESIS

## 51. Keep the player-built accusation

The current six-part final synthesis is structurally strong and should remain the basis:

- actor;
- route;
- immediate motive;
- 2015 responsibility;
- route proof;
- motive proof.

## 52. Add payoff for the innocent lies

Consider extending the final caseboard with a short secondary classification after the main accusation:

- Why did Marina lie?
- Why did Denis lie?
- Why did Vera lie?

This should not be required to identify the attacker, but it would make the red herrings narratively pay off and reinforce the theme “all participants lie, but not about the same crime”.

Do not add this if it turns the finale into administrative form filling. Test for emotional value first.

---

# PART XV. CANONICAL TIMELINE WORK REQUIRED BEFORE CODE

## 53. Author timeline table

Before implementation, freeze a minute-by-minute table for at least 22:30–01:00 containing:

| Time | Person | Location | Action | Visible to whom | Digital trace | Physical trace | Later statement | Truth status |
|---|---|---|---|---|---|---|---|---|

At minimum verify:

- Vera visit and return;
- Kirill entry to 312;
- Ilya 23:50 return;
- copy at 23:56;
- message 00:17;
- read times;
- attack window;
- loss of normal phone movement after 00:28;
- sound off 00:43;
- airplane mode 00:48;
- movement to S-3;
- Kirill return route;
- morning discovery.

Any contradiction between phone telemetry, travel time and physical movement must be resolved before coding.

---

# PART XVI. IMPLEMENTATION CONSTRAINTS

## 54. Do not break technical contracts casually

The architecture rewrite should preserve canonical save keys unless a migration is explicitly designed:

- core: `dbr:dbr_001_room_314:0.2.0`
- Act II: `dbr:dbr_001_room_314:act2:v0.5.0`
- Act III: `dbr:dbr_001_room_314:act3:v0.6.0`
- interrogation: `dbr:dbr_001_room_314:interrogation:kirill:v0.6.2`
- Act IV: `dbr:dbr_001_room_314:act4:v0.7.0`
- living suspect: `dbr:dbr_001_room_314:living-suspect:kirill:v0.6.3`
- onboarding: `dbr:player-guidance:onboarding:v1`
- guided first run: `dbr:player-guidance:guided-first-run:v1`

Prefer adding markers/derived state inside existing structures over renaming stores.

## 55. Do not degrade current strengths

Implementation must retain:

- progressive operational guidance without detective GPS;
- player-earned E006 request;
- no prescribed evidence order in Kirill interrogation;
- specific objections to weak evidence;
- player-built final accusation;
- current media realism improvements unless a stronger asset replaces them.

## 56. Explicit removals / prohibitions

Do not reintroduce:

- “следующий правильный документ” navigation;
- the archive envelope in current room 312 as the mandatory route to E008;
- a unique tunnel that mechanically identifies Kirill the moment E006 opens;
- early E008 audio that already says “Kirill” and proves the entire old case;
- E009 wording that automatically clears Vera;
- Kirill confession as the trigger for locating Ilya;
- Ilya pointing directly to the microSD as the only reason it is found;
- final guilt based merely on motive + room number;
- a single fixed E008 → E009 → interrogation → E010 → E011 chain.

---

# PART XVII. ACCEPTANCE CRITERIA FOR V2 IMPLEMENTATION

The architecture is implemented successfully only if a fresh player can reach these states through evidence rather than interface instructions:

1. **“The known exits are impossible; I need to question the geometry.”**
2. **“There is an old service network, but more than one person could access it.”**
3. **“The phone probably marks a staged service-route endpoint, so I should search that branch for Ilya.”**
4. **“Denis is genuinely lying, but his lie concerns B-17 provenance.”**
5. **“Marina is genuinely lying, but her lie concerns hotel liability / closure.”**
6. **“Vera is genuinely lying, but her lie concerns identity and source protection.”**
7. **“Kirill's 312 alibi is not an alibi anymore — but I still need proof he was inside 314.”**
8. **“The wiped trace is that proof.”**
9. **“B-17 explains motive and 2015 responsibility, but not by itself the current assault.”**
10. **“I can assemble the final accusation without the game telling me the answer.”**

## 57. Human-test success condition

A zero-coaching player should be able to say after the reveal:

> **«Теперь понятно, почему я подозревал каждого. Все следы были передо мной, но я сначала неправильно понимал, что именно они доказывают».**

If the player instead says:

- “Кирилл был очевиден сразу после 312”;
- “я пошёл туда, потому что игра сказала”;
- “без признания я никак не мог найти Илью”;
- “Марина/Денис/Вера были просто мусорными подозреваемыми”;
- “решающая улика появилась только в конце”;

then the redesign has failed even if the automated route tests are green.

---

# PART XVIII. IMPLEMENTATION ORDER

Do not rewrite everything in one blind pass.

Recommended sequence:

### Step 1 — Freeze truth

Create canonical timeline and author map. Resolve all travel/access/timestamp physics.

### Step 2 — Rewrite evidence semantics

Update the internal meaning/acquisition contract of E001–E011 before changing UI copy.

### Step 3 — Build parallel state graph

Replace the post-E007 single route with branch prerequisites and convergence markers.

### Step 4 — Rescue independence

Make E010 player-earned from E005+E006+E007, independent of interrogation completion.

### Step 5 — Individualized actor proof

Add the E001 wiped-trace forensic follow-up and Kirill comparison.

### Step 6 — Productive suspect secrets

Implement Marina, Denis and Vera branches so each reveals a real truth and affects hypothesis weights.

### Step 7 — Interrogation rewrite

Require proof families rather than a scripted evidence recipe; keep meaningful weak-link objections.

### Step 8 — E011 historical closure

Move full 2015 attribution into the verified original rather than early archive material.

### Step 9 — Final synthesis update

Preserve current player-built accusation and test whether secondary lie-classification improves the ending.

### Step 10 — Regression + zero-coaching human test

Automated tests verify reachability and state integrity. Human test verifies detective ownership.

---

# ONE-SENTENCE V2 DESIGN TARGET

> **«Номер 314» должен начинаться как невозможное исчезновение, раскрыться в сеть правдивых чужих тайн и закончиться не тем, что игрок нашёл единственного человека с доступом, а тем, что он сам отделил возможность, мотив и ложь от индивидуального доказательства присутствия Кирилла в комнате.**
