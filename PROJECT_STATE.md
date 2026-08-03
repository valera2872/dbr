# PROJECT STATE — ДБР

## Current branch

`agent/v0-7-final-operation` → target `main`

## Current version

`0.7.0 — Final Operation / complete case route`

## Product

Web/PWA prototype of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Complete playable story route

- premium prologue and investigation headquarters;
- persistent local progress;
- Act I: E001–E005, room 314, corridor camera and intermediate report No. 1;
- Act II: E006 archive plan, E007 room 312 and proof of the hidden route;
- Act III: E008 archive provenance, E009 Vera Belova's identity and intermediate report No. 2;
- interactive interrogation of Kirill with evidence presentation and contradiction fixing;
- Act IV: E010 search of the old service room;
- Ilya is found alive and the post-assault concealment is reconstructed;
- E011 recovery and forensic verification of memory card 314-17;
- final responsibility checkpoint separating assault, concealment and the 2015 motive;
- end-of-case report, participant responsibility, epilogue and investigation rank.

## Final operation

The final act unlocks only when:

1. Act III report is complete;
2. Kirill's corridor alibi is broken in the interactive interrogation.

Then the player:

1. inspects four zones in E010;
2. finds Ilya alive and establishes that the service room was locked from outside;
3. recovers the hidden microSD card;
4. verifies serial number, copy log, B-17 clip and file integrity in E011;
5. submits the final accusation without overstating the evidence;
6. receives the case report and performance rank.

## Canonical resolution

- Kirill entered 314 through the hidden route to take card 314-17;
- Ilya was injured during the struggle;
- Kirill moved him into the old service room, provided minimal aid, locked the room and did not call medical services;
- B-17 proves Kirill concealed the unsafe use of the service route in 2015 after Anton's death;
- Denis concealed the archive original but did not perform the night assault;
- Vera concealed her identity and acted as Ilya's source, not as the attacker;
- Ilya survives and provides a statement after hospitalization.

## Premium and performance safeguards

- one canonical version and storage-key registry;
- protected version marker;
- Acts I–IV investigation rail and explicit next action;
- no new MutationObserver or polling in Act IV;
- Act IV synchronizes through the shared performance kernel;
- local progress remains compatible with previous act and interrogation keys;
- `final-smoke.mjs` verifies E001–E011, rescue, card verification, accusation and epilogue after every production build;
- v0.7.0 uses a new PWA cache key.

## Current limitations before commercial release

- Acts II–IV remain runtime layers over the typed Act I shell;
- the real video performances for Kirill are not produced yet; Actor Studio is only an internal recording pipeline;
- E004 camera presentation still uses temporary assets;
- external usability, mobile-layout and long-session performance testing have not been completed;
- progress remains localStorage-only;
- final legal wording and age-rating review are still required before a paid release.

## Next Premium Pass stage

`v0.7.x — stabilization and commercial polish`

- deterministic clean-save and migrated-save test fixtures;
- full playthrough testing from fresh start to epilogue;
- remove legacy version setters and remaining DOM scans;
- improve E004 visual assets;
- mobile and low-power performance pass;
- external tester feedback and difficulty balancing;
- decide whether the release uses filmed actors, generated video, or a premium static interrogation presentation.
