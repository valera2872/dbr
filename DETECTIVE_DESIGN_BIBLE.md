# DETECTIVE DESIGN BIBLE — ДБР / Mystery Logic

Version: **1.0**  
Status: **canonical project methodology**  
Scope: interactive detective cases for ДБР / Mystery Logic

---

## 0. Why this document exists

This is not a summary of detective literature and not a collection of writing tips.

It is the working standard for designing, reviewing and testing every detective case in the project.

The governing product law is:

> **The interface must be obvious. The investigation must not be obvious.**

The player may receive help with controls, navigation and the meaning of a mechanic. The game must not choose the investigative theory, the next deduction, the suspect, the evidence order or the final conclusion for the player.

Every major discovery must answer two questions:

1. **What factual contradiction gave the investigator a reason to suspect this direction?**
2. **What player action caused the new information to enter the case?**

If the answers are “the game told the player” and “clicked Next step”, the segment is defective.

Target loop:

> **observe → notice contradiction → form a provisional explanation → choose an investigative action → receive evidence → revise the hypothesis → test it**

Not:

> **read → Next step → read → Next step**

---

# PART I. THE THREE LAYERS OF EVERY CASE

A case must be designed in three separate layers. Never collapse them into one outline.

## 1. The true story

This is what actually happened, independent of what the player knows.

Before writing the investigation, define:

- exact chronology;
- who was where and when;
- what each person wanted;
- what each person knew at each moment;
- what each person did;
- what physical traces each action left;
- what digital traces each action left;
- what witnesses could honestly observe;
- what witnesses misinterpreted;
- what each suspect lies about;
- what each suspect tells the truth about;
- what was accidental;
- what was planned;
- what the offender expected investigators to believe.

The author must be able to reconstruct the event minute by minute before designing the mystery.

## 2. The investigation story

This is the order in which facts *can* become available to an investigator.

For every discoverable fact specify:

- source;
- prerequisite;
- investigative action required;
- whether the action is obvious operationally or requires a deduction;
- whether the result confirms, weakens or destroys a hypothesis;
- what new questions the result creates.

The investigation story must not equal the true chronology.

A detective story is largely the reconstruction of a hidden past from incomplete present evidence.

## 3. The player inference story

This is what the player is reasonably capable of concluding at each stage.

For every major deduction write:

- facts already available;
- plausible interpretations of those facts;
- intended deduction;
- at least one credible wrong interpretation;
- action by which the player can test each interpretation;
- what happens if the player is wrong.

The player inference story is the most important layer for an interactive mystery.

A literary detective may say “Poirot understood”. A game cannot use that shortcut for a core deduction.

---

# PART II. FAIR PLAY CONTRACT

## 4. The player must be able to solve the case before the game explains it

A fair-play mystery gives the player access to every fact required for the final solution before the final accusation.

The finale may:

- force synthesis;
- test causal links;
- require selection between competing explanations;
- expose weaknesses in a theory.

The finale must not introduce the decisive fact that makes the solution possible for the first time.

## 5. Hide significance, not existence

The strongest clue is often visible early but understood late.

Preferred pattern:

> player sees fact A → interprets it as X → later fact B makes interpretation X impossible → player realizes A always meant Y

Weak pattern:

> decisive fact Y was completely hidden → final scene reveals it → mystery ends

The goal is retrospective inevitability:

> “It was there the whole time. I just read it wrong.”

## 6. No unsupported intuition

A deduction must be reconstructible.

Never use:

- unexplained detective intuition;
- a sudden memory of an unseen fact;
- a technical fact that was never available to the player;
- a secret passage with no prior basis;
- an unknown twin / identity / device / poison introduced only to solve the plot;
- coincidence as the only bridge between two critical clues.

Surprise is welcome. Arbitrary surprise is not.

## 7. Separate proof from suspicion

A clue can justify suspicion without proving the conclusion.

Use explicit proof levels internally:

- **Observation** — something is present.
- **Anomaly** — it does not fit the current model.
- **Lead** — it justifies a new investigative action.
- **Corroboration** — an independent fact supports the same hypothesis.
- **Contradiction** — a competing hypothesis loses support.
- **Proof link** — evidence directly supports a specific causal claim.
- **Synthesis** — multiple proof links form the accusation.

Do not let one weak clue magically perform all seven functions.

---

# PART III. CLUE ENGINEERING

## 8. Every clue needs a job

For each clue create an internal card with:

- ID;
- visible object / statement;
- literal fact;
- true significance;
- first likely interpretation;
- alternative interpretation;
- hypothesis supported;
- hypothesis weakened;
- prerequisite for discovering it;
- player action that obtains it;
- later clue that changes its meaning;
- whether it is required for final proof.

A clue with no effect on player reasoning is decoration.

Decoration is allowed, but must not be mistaken for investigative content.

## 9. Major deductions should rarely rely on one fragile clue

For a critical conclusion, prefer two or more independent supports.

Example structure:

- physical trace;
- timeline conflict;
- witness inconsistency;

Together they justify a strong deduction.

This prevents a single missed detail from becoming a hard chokepoint.

## 10. One clue can serve multiple stages

High-value clues often have layered meaning.

Example:

At stage 1 a receipt proves presence.

At stage 2 its timestamp breaks an alibi.

At stage 3 its product code connects the suspect to a location.

This is stronger than constantly introducing new one-use evidence.

## 11. Prefer clue constellations over clue arrows

Weak design:

> E003 directly tells player to open E004.

Stronger design:

> E001 + E003 create a contradiction → player chooses which source to verify → one or more actions lead toward E004.

The next material should usually appear because the player earned a reason to request or search for it.

---

# PART IV. HYPOTHESES, NOT CONTENT ORDER

## 12. Design a hypothesis network

At important stages, write the active competing explanations.

Example:

- H1: victim left voluntarily;
- H2: victim was removed through the main door;
- H3: another route existed;
- H4: timeline is wrong;
- H5: witness or digital record is unreliable.

Then map each clue and action to the hypotheses it affects.

A good investigation changes the relative credibility of hypotheses over time.

## 13. Intermediate solutions are valuable

A good mystery can allow the player to form a convincing but incomplete solution.

The player should sometimes be able to say:

> “I think I have it.”

Then a new contradiction forces revision.

This is better than keeping the player ignorant until one final revelation.

## 14. Wrong hypotheses must be productive

A wrong investigative action should ideally do one of four useful things:

- rule out a possibility;
- reveal a secondary secret;
- clarify a timeline;
- teach the player what kind of evidence is still missing.

Avoid meaningless dead ends whose only output is “nothing here”.

A dead end can be realistic, but it should usually change the knowledge state.

---

# PART V. RED HERRINGS

## 15. A red herring should be true about something

The best false lead is not fabricated nonsense.

It points toward a real concealed fact that is *not the central crime*.

Examples:

- suspect lies because of an affair, not murder;
- missing money is real but unrelated to disappearance;
- falsified timestamp conceals embarrassment, not the attack;
- hidden identity is real but not proof of execution.

This rewards investigation even when suspicion is misplaced.

## 16. Every major suspect should have three layers

For each suspect define:

1. **Public story** — what they want investigators to believe.
2. **Private secret** — what they are actually hiding.
3. **Crime relevance** — how much that secret truly connects to the central offense.

This prevents suspects from becoming binary “guilty / innocent” props.

## 17. Suspicion must have a reason

Do not make a person suspicious only because the interface highlights them.

Suspicion should come from some combination of:

- motive;
- opportunity;
- contradiction;
- concealed relationship;
- unexplained physical access;
- false statement;
- anomalous behavior;
- trace evidence.

And at least one of those should later prove misleading for some innocent suspect.

---

# PART VI. INVESTIGATIVE ACTIONS

## 18. Distinguish deduction from operation

A player-owned deduction is something the player must infer.

An operational step is something obvious once the inference exists.

Example:

Deduction:
> The known exits do not explain the disappearance; there may have been an older service route.

Operational step:
> Request pre-renovation plans.

It is acceptable for the interface to help the player perform the operational step *after* the player has earned the deduction.

It is not acceptable for the interface to supply the deduction itself.

## 19. Every new document needs a causal acquisition path

Before adding any evidence file, answer:

> Why did the investigator decide to request exactly this document?

Good answers:

- a witness references a 2015 archive box;
- a wall finish conflicts with renovation history;
- a serial number points to a procurement record;
- a surname mismatch justifies registry verification.

Bad answer:

- “Because this is the next evidence card.”

## 20. The interface may expose available actions, not the correct theory

Good UI:

- “Request building records”;
- “Re-check exterior window”;
- “Compare guest registration”;
- “Ask for complete lock log”.

Over-guided UI:

- “Find the hidden passage”;
- “Prove Elena is Vera”;
- “Destroy Kirill’s alibi”.

Action labels should describe what the investigator does, not the conclusion the player is supposed to reach.

---

# PART VII. TIME, SPACE AND PHYSICAL POSSIBILITY

## 21. Build the canonical timeline before scenes

Maintain an author-only table with at least:

- timestamp;
- person;
- location;
- action;
- witness visibility;
- digital trace;
- physical trace;
- later statement about the event;
- whether that statement is true, mistaken or deceptive.

No major scene should be written before this table is internally consistent.

## 22. Motive and opportunity are separate dimensions

A person can have a motive without physical opportunity.

A person can have opportunity without motive.

Do not allow motive to substitute for proof of access, or access to substitute for motive.

## 23. Draw the space

For location-based mysteries create an author map before player art.

Include:

- dimensions where relevant;
- doors;
- windows;
- cameras;
- blind zones;
- service areas;
- routes;
- sound transmission;
- sightlines;
- access controls;
- old vs current layouts;
- travel times.

The author map may contain far more detail than the player ever sees.

If the physical geometry is wrong, the mystery is wrong.

---

# PART VIII. INTERROGATION DESIGN

## 24. A detective may ask only questions the investigation has earned

Questions should unlock from factual premises, not from act numbers.

The player should not be able to ask:

> “Why did you use the hidden passage?”

before discovering a reason to believe such a passage existed.

## 25. Evidence presentation should be strategic

During a key interrogation, avoid highlighting the “correct next evidence”.

Let the player choose.

A weak presentation should produce a meaningful rebuttal:

> “That proves X, but it does not prove Y.”

This teaches evidentiary reasoning without revealing the complete solution.

## 26. Statements have epistemic status

Internally classify each important statement as:

- verified fact;
- sincere memory;
- mistaken memory;
- omission;
- partial truth;
- strategic lie;
- direct lie;
- inference;
- rumor.

The UI should not necessarily display these labels, but the author must know them.

---

# PART IX. DIFFICULTY AND GUIDANCE

## 27. Difficulty should come from interpretation, not interface friction

Bad difficulty:

- player cannot find the button;
- player does not understand where evidence lives;
- terminology is unexplained;
- navigation hides required functionality.

Good difficulty:

- two explanations fit the same facts;
- a clue has an innocent interpretation;
- several suspects have motives;
- one timeline gap can be explained in multiple ways;
- evidence proves only part of a causal chain.

## 28. Use progressive help, not GPS

On-demand help should have levels.

Recommended ladder:

### Level 1 — Restate the problem

> “The known exits do not explain the disappearance.”

### Level 2 — Identify the category of missing information

> “You may need to verify whether the current floor layout always looked this way.”

### Level 3 — Suggest an investigative action

> “Check renovation or building records.”

### Level 4 — Direct rescue hint

> “Request the pre-renovation floor plan.”

The default game should not jump directly to Level 4.

## 29. Never confuse guidance with proof

A hint can help a stuck player continue.

It should not become part of the canonical evidentiary chain.

The final accusation must still be based on discovered evidence, not on what a guidance panel said.

---

# PART X. FINAL ACCUSATION

## 30. The finale should require reconstruction

A strong final accusation asks the player to connect:

- actor;
- means / route;
- motive;
- opportunity;
- key causal sequence;
- proof links;
- responsibility for related events where relevant.

The player should assemble the case, not select one polished paragraph from a list.

## 31. Challenge weak links, not just wrong names

When the accusation is wrong, feedback should identify the unsupported link.

Example:

> “This pair of materials shows motive, but does not prove access to room 314.”

This is better than:

> “Incorrect. Try again.”

## 32. Final revelation should increase understanding of old evidence

After the solution, earlier scenes should become clearer.

A good ending creates retrospective compression:

Many scattered facts suddenly become one coherent causal model.

If the ending depends mostly on new information, the investigation was not doing enough work.

---

# PART XI. CASE DESIGN WORKFLOW

Use this order for every new case.

## Stage A — Premise

Write one sentence each for:

- apparent mystery;
- true event;
- central contradiction;
- emotional stake;
- final “aha”.

Do not build UI yet.

## Stage B — True event reconstruction

Create:

- canonical chronology;
- spatial map;
- actor knowledge states;
- motive chain;
- physical trace ledger;
- digital trace ledger.

## Stage C — Suspect architecture

For every major suspect define:

- apparent motive;
- actual motive;
- public story;
- private secret;
- lie;
- truth;
- opportunity;
- reason for suspicion;
- reason they may be innocent;
- clue that changes the player’s view of them.

## Stage D — Hypothesis network

List the major explanations available at each act.

For every transition ask:

> What contradiction makes one hypothesis weaker and another worth testing?

## Stage E — Evidence map

Create all evidence IDs before prose polish.

Each must have:

- acquisition cause;
- source;
- literal fact;
- possible interpretation;
- true significance;
- downstream effect.

## Stage F — Investigative actions

For each major discovery, create at least one player action that earns it.

Where practical create multiple plausible checks, including some that rule things out rather than advance directly.

## Stage G — Interrogation map

For every question define its premise.

No premise → no question.

## Stage H — Final proof graph

Before writing the ending, draw the final accusation as causal links.

Example:

> E006 + E007 → route possible and currently usable  
> E008 + testimony → historical motive  
> E009 + message → identity / meeting link  
> route + timing + interrogation contradiction → actor  

If a final claim has no evidence edge, it is not proven.

## Stage I — Guidance ladder

Only after the investigation works unaided, add help for stuck players.

Never design the mystery around the hints.

## Stage J — Visual production

Only after logic stabilizes, make premium media.

Visuals must not reveal deductions the player has not earned.

---

# PART XII. PRE-DEVELOPMENT AUDIT

Before coding a case, answer all of these.

## Mystery integrity

- What exactly happened?
- Can the author reconstruct it minute by minute?
- Is the physical route possible?
- Are all timestamps compatible?
- Does every important action leave plausible traces?

## Fair play

- Can the player know every fact needed for the final solution before the finale?
- Is the decisive mechanism introduced early enough?
- Are hidden spaces / identities / devices fairly prepared?
- Does the solution depend on coincidence?
- Does the detective know anything the player could not know?

## Player agency

- Why does the investigator perform each major search/request/check?
- Did the player form the reason, or did the game announce it?
- Can the player test more than one plausible hypothesis?
- Can wrong actions still produce knowledge?
- Are any evidence items unlocked only because the previous card was completed?

## Clue quality

- Does every major clue support or weaken a hypothesis?
- Does at least one clue change meaning later?
- Are there clues that are visible but initially misinterpreted?
- Is any central deduction dependent on a single fragile detail?

## Suspects

- Does every serious suspect have a believable reason to conceal something?
- Are innocent suspects allowed real secrets?
- Is suspicion based on evidence rather than interface emphasis?
- Are motive and opportunity independently tested?

## Finale

- Does the player assemble the causal chain?
- Are weak links challenged specifically?
- Does the final explanation reinterpret earlier evidence?
- Could an attentive player have solved the case before pressing the final button?

If several answers are “no”, do not move to production.

---

# PART XIII. HUMAN TEST PROTOCOL

Automated tests prove route integrity. They do not prove that the mystery is good.

For a fresh human test:

1. Give no verbal help.
2. Do not explain where the designer expects the player to go.
3. Record every moment the player asks:
   - “What do I press?”
   - “What am I supposed to do?”
   - “Why would I check that?”
   - “How was I supposed to know?”
   - “The game already told me the answer.”
4. Separate failures into:
   - interface confusion;
   - missing factual premise;
   - unfair clue;
   - over-guidance;
   - weak motivation;
   - boring linearity;
   - accidental chokepoint.
5. Fix the category, not just the exact symptom.

Success criterion:

> The player understands what actions are available but owns the reasoning about which action matters.

---

# PART XIV. ANTI-PATTERNS

Reject these during review.

### “Next evidence card”
A material appears because the previous material was completed.

### “Detective GPS”
The UI names the theory the player should discover.

### “Magic document”
A document proves more than its contents logically allow.

### “Single-clue bridge”
One easily missed clue is the sole route to a mandatory deduction.

### “Decorative suspect”
A suspect exists only to fill the roster and has no coherent private life or false appearance.

### “Red herring as garbage”
A false lead consumes time but reveals nothing true.

### “Final evidence dump”
The ending introduces the facts that actually solve the crime.

### “Wrong = red button”
A failed hypothesis teaches nothing.

### “Hidden mechanism without preparation”
Secret passage, twin, device, poison or identity switch appears only when needed by the solution.

### “Motive equals guilt”
Strong motive is treated as proof of execution.

### “UI difficulty”
Challenge comes from finding controls instead of interpreting evidence.

---

# PART XV. CURRENT SOURCE BASE

This Bible synthesizes project lessons and principles drawn from the current study corpus, without reproducing source texts.

## Detective theory / literary design

- A. Vulis — *Poetics of the Detective Story* / materials published by Detective Method.
- Ronald Knox — fair-play rules and anti-cheating constraints.
- S. S. Van Dine — reader access to the same essential evidence as the detective.
- John Dickson Carr tradition — impossible crime, spatial logic, rational reconstruction.
- Agatha Christie tradition — misdirection through significance rather than concealment.
- Ellery Queen tradition — multiple plausible intermediate solutions and reader challenge.
- Dorothy L. Sayers tradition — false trails that reveal genuine secondary secrets.
- Freeman Wills Crofts tradition — chronology, alibi engineering and physical possibility.
- Leslie Grant-Adamson — clue placement, red herrings, endings, plotting, maps and spatial planning.

## Project-derived lessons

Case 001 “Room 314” established several canonical rules through human testing:

- interface confusion and investigative difficulty are different problems;
- stronger guidance can accidentally remove the detective work;
- evidence must be causally acquired;
- historical possibility is not proof of present usability;
- identity investigation requires a factual trigger;
- interrogation should not reveal the correct evidence order;
- the final accusation should be assembled from proof links rather than selected as a ready-made answer.

These lessons are part of the methodology, not one-off fixes.

---

# PART XVI. NEXT EXPANSION OF THIS BIBLE

Version 1.0 is already sufficient to design the next case.

The next research layer should extend it with:

1. **Interactive deduction design** — especially investigative games where the player constructs knowledge rather than follows a scripted detective.
2. **Node-based investigation design** — multiple routes, redundancy and anti-chokepoint structures.
3. **Real investigative practice** — how investigators generate reasonable lines of enquiry, handle interviews, timelines and evidence provenance.
4. **Difficulty calibration** — how to tune ambiguity without making the route arbitrary.

When these layers are studied, update this document rather than creating competing methodologies.

---

# ONE-PAGE RULE FOR EVERY NEW CASE

Before approving a new case concept, the designer must be able to state:

**Mystery:** What appears impossible or contradictory?  
**Truth:** What actually happened?  
**Player question:** What is the player trying to reconstruct?  
**First contradiction:** What prevents the obvious explanation?  
**Competing hypotheses:** What 2–4 explanations initially fit?  
**Player-owned deductions:** Which major ideas must the player generate rather than receive?  
**Acquisition logic:** Why does each key material enter the case?  
**Red herrings:** What real secrets create false suspicion?  
**Proof graph:** What evidence proves actor, means, motive and opportunity?  
**Final aha:** Which earlier facts suddenly change meaning at the solution?  
**Fair-play test:** Could a careful player solve it before the reveal?

If these answers are strong, the case is ready for detailed design.

If they are weak, more screens, art and dialogue will not fix it.
