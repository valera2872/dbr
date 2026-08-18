# COMPETITIVE QUALITY GATE — ДБР / Mystery Logic

Version: **1.0**  
Status: **canonical companion to `DETECTIVE_DESIGN_BIBLE.md`**  
Research snapshot: **2026-08-18**

## 0. Purpose

Competitive analysis is now a permanent quality gate for every existing and future DBR case.

The purpose is **not** to copy mechanics. The purpose is to ask what player feeling a competitor creates, identify the cheapest reliable way to create the same or stronger feeling, and reject expensive features that do not materially improve the investigation.

Core question for every proposed mechanic:

> **What will the player feel because of this mechanic, and can we create that feeling more simply?**

Target product formula:

> **psychologically convincing story + authentic investigation feeling + freedom of action + bounded AI characters + high-quality digital evidence + minimal technical friction**

The desired post-game reaction is:

> **“I spent several hours investigating a real case.”**

not:

> “I finished a quiz / visual novel.”

---

# 1. Reference set and what DBR should extract

## True Crime Games / Last Ascent

Reference: `https://true-crime.games/ru/` and `https://true-crime.games/ru/games/last-ascent`

Current public positioning of Last Ascent emphasizes:
- 3–5 hours of deductive play;
- interactive suspect interrogation;
- realistic websites and evidence;
- suspect social profiles;
- real-world geo locations;
- solo or team play;
- fast digital access after purchase.

**Player feeling to extract:** this is a large premium investigation extending beyond one game screen.

**DBR response:** create a smaller but denser case world. A few convincing documents, portals, profiles, recordings and locations should cross-reference each other so that the case feels larger than its raw asset count.

Do **not** respond by building dozens of empty sites or locations.

## Profile Detective

Reference: `https://profiledetective.ru/`

Public materials emphasize case files, physical-looking evidence, protocols, examinations, witness interviews, photographs, audio, websites, archives, social networks and CCTV; the site explicitly frames play as an independent investigation rather than merely reading materials.

**Player feeling to extract:** the evidence existed before the player arrived and was not written as a puzzle prompt.

**DBR response:** evidence should look and read like evidence first. Explanatory game text must be outside the artifact. A police log, maintenance record, chat export, CCTV clip, audio file or archive sheet should not contain authorial interpretation.

## Saint Twins Detective

Reference: `https://home-detective.online/`

Public product structure includes a large case archive, difficulty ratings, team play and a four-hour investigation format. Its public launch flow also includes contacting an organizer, registering a captain, waiting for confirmation and organizer-controlled start.

**Player feeling to extract:** a real catalogue of cases and a shared evening investigation.

**DBR response:** keep the catalogue / difficulty / team identity, but explicitly beat the launch friction. The ideal DBR flow is: open case → start immediately → investigate; purchase should continue the same session instead of forcing a restart.

## Online Investigations / AI detectives

Reference: `https://rassledovanie.online/`

Public positioning emphasizes free-text AI suspect interrogation, social networks, digital traces, a city map, websites, evidence and choice of whom to question / where to go.

**Player feeling to extract:** suspects are people you can investigate, not dialogue trees waiting to distribute the next clue.

**DBR response:** use **bounded author-truth AI**. Every AI character must be constrained by a canonical character truth model and may never invent case facts.

Each AI character requires an author-only schema:
- identity;
- known facts;
- unknown facts;
- public story;
- secrets;
- lies / omissions;
- emotional triggers;
- alibi;
- evidence they recognize;
- evidence that changes their answer;
- facts they may infer;
- facts they are forbidden to invent;
- disclosure conditions;
- contradiction responses;
- final admission boundary.

The model may improvise wording, emotion and conversational strategy. It may **not** improvise truth.

## Code of the City

Reference: `https://kodgoroda.games/`

Public positioning emphasizes a navigable city, many locations, deciding where to go next, character secrets and group investigation.

**Player feeling to extract:** there is a world around the crime and the player chooses where to investigate.

**DBR response:** do not build a thousand-location world. Build a **small dense map** of perhaps 5–12 meaningful nodes per case. Most locations must either:
- contain evidence;
- test a hypothesis;
- reveal a character secret;
- rule out a route;
- change the timeline;
- or create a new justified line of enquiry.

A location that does none of those is probably unnecessary.

## Dramtezi / Detective Online

Reference: `https://dramtezi.ru/game/detective/`

Public product emphasizes immediate browser play, free cases, multiple cases, scene branching, evidence combinations, suspect questioning, ranks/achievements, PWA/offline support and SEO-friendly browser entry.

**Player feeling to extract:** extremely low barrier to trying the product and visible game systems.

**DBR response:** preserve browser-first launch, PWA/offline capability and free entry. Use branching to change what the player knows, proves and earns — **not** to create several incompatible truths about what happened.

---

# 2. Non-negotiable DBR differentiators

DBR should combine the strongest competitor effects while remaining structurally distinct.

1. **One objective truth.** Different routes and outcomes may change proof quality, rescue timing, suspect cooperation, discovered secrets and final grade, but not the canonical crime truth.
2. **Player-owned deduction.** Interface help explains controls and available actions, not the theory to believe.
3. **Psychological causality.** Every important lie has a human reason. Innocent suspects may have damaging secrets.
4. **Evidence provenance.** Every important artifact has a plausible source and a reason the investigator obtained it.
5. **Bounded AI.** AI characters operate inside fixed author truth.
6. **Dense world, not huge world.** A small number of cross-linked locations and artifacts is preferred over breadth without meaning.
7. **Fast start.** Registration, payment and team setup must not become the hardest puzzle.
8. **Strong debrief.** The ending reconstructs the real chronology, motives, hidden relationships, missed evidence and weak links in the player's accusation.
9. **Reusable platform mechanics.** New cases should mostly reuse investigation systems rather than require bespoke engineering.
10. **Premium evidence over content volume.** Ten convincing artifacts are better than forty obvious game cards.

---

# 3. Mandatory audit for every existing case

Before rewriting code, answer these ten questions.

## 3.1 Preserve

What already works emotionally, logically or visually and must not be lost?

## 3.2 Competitive weakness

What looks materially weaker beside the strongest current references, especially Last Ascent?

## 3.3 Script-reading risk

Where is the player mainly consuming a predetermined sequence rather than investigating?

## 3.4 Real choices

Where can the player reasonably choose:
- whom to question;
- what evidence to test;
- where to go;
- what record to request;
- what hypothesis to challenge?

A choice is real only if the alternatives are plausible from known facts.

## 3.5 Evidence conversion

Which exposition can become an actual artifact:
- photo;
- message thread;
- audio;
- video;
- document;
- CCTV;
- social profile;
- call record;
- map;
- access log;
- digital trace?

## 3.6 AI interrogation fit

Would free questioning materially improve the feeling of investigating a person? If yes, is the character truth model sufficiently complete to prevent invention?

## 3.7 Objective truth / fair play

Can an attentive player deduce the one canonical truth from available evidence before the debrief?

## 3.8 Puzzle legitimacy

Does every puzzle represent a plausible investigative task? Remove puzzles whose only purpose is “there should be a puzzle here”.

## 3.9 Premium comparison

If screenshots / clips from this case were shown beside Last Ascent or Profile Detective with branding removed, which materials would visibly look cheaper or more game-like?

## 3.10 Leverage

Which changes produce the greatest perceived quality increase for the least one-off engineering and content cost?

---

# 4. Change classification

Every proposed upgrade receives one of three labels.

## A — mandatory leverage

Cheap or reusable implementation with large effect on investigation quality. Do unless it conflicts with a stronger product rule.

Typical A work:
- rewrite game-explaining copy into diegetic evidence;
- remove detective-GPS wording;
- add a justified alternate investigative action;
- add a timeline/access-log cross-check;
- add a reusable debrief timeline;
- expose already-existing branches on a case board;
- preserve purchase/session continuity;
- improve evidence labels and provenance;
- make wrong hypotheses produce information.

## B — selected investment

Meaningful quality gain with real design / engineering / media cost. Pick the highest-value items.

Typical B work:
- bounded AI interrogation for one or two central characters;
- a reusable dense location map;
- realistic generated/raster evidence for decisive materials;
- interactive CCTV/audio analysis;
- social profile / archive / maintenance portal templates;
- multiplayer team notes / shared board;
- evidence-aware final grading.

## C — expensive spectacle

High cost, significant complexity or low reuse. Avoid for now or imitate the desired feeling more cheaply.

Typical C work:
- dozens or hundreds of explorable locations;
- live-action video for every character;
- unique bespoke apps/websites for every clue;
- full AI simulation of all NPCs from minute one;
- complex synchronous multiplayer infrastructure;
- large 3D environments;
- multiple incompatible crime truths.

---

# 5. Competitive scorecard

Each case is scored 0–5 before and after a major revision.

1. **Premise / hook** — would the central mystery sell the case in one sentence?
2. **Authenticity of evidence** — do materials look like artifacts rather than puzzle cards?
3. **Player agency** — does the player choose meaningful lines of enquiry?
4. **Deduction quality** — can the solution be reconstructed from evidence?
5. **Character psychology** — do lies and secrets have believable motives?
6. **World density** — do locations / systems create a coherent investigative space?
7. **Interrogation quality** — do characters resist, lie, react to evidence and remain truthful to canon?
8. **Technical friction** — how quickly can a new player begin useful detective work?
9. **Premium presentation** — would the product look credible at paid-case pricing?
10. **Debrief payoff** — does the ending explain chronology, motives, missed clues and player errors?

Target before calling a paid flagship case complete:
- no category below **3.5**;
- overall average at least **4.2**;
- premise, deduction, evidence authenticity and technical friction at least **4.5**.

The score is a review tool, not a marketing claim.

---

# 6. Reuse-first production rule

Every B/C idea must be evaluated for reuse.

Preferred order:

1. Can existing HTML/CSS/React components create the effect?
2. Can one reusable platform component serve every future case?
3. Can AI generate or transform the content asset while the author controls truth?
4. Can one convincing artifact replace several weaker scenes?
5. Can the player infer the same world scale from cross-links rather than additional locations?

Do not spend a week building something that produces the same player feeling as one strong document and one meaningful choice.

---

# 7. Release gate

Before a case revision is merged as a quality milestone, verify:

- canonical truth unchanged unless explicitly approved;
- strongest existing scenes preserved;
- no new mechanic exists only because a competitor has it;
- no decisive clue is author-explained before the player can infer it;
- every major new evidence item has provenance and acquisition logic;
- branching changes knowledge/proof, not the underlying truth;
- AI, if used, cannot invent canon;
- technical start remains simple;
- final debrief can explain not only who did it, but why the player was reasonably misled;
- zero-coaching human test remains mandatory after the logic is coherent.

This gate is permanent and applies alongside `DETECTIVE_DESIGN_BIBLE.md`.