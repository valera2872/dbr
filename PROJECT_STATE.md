# PROJECT STATE — ДБР

## Current branch

`main`

## Current version

`0.6.3 — Premium Pass / Living Suspect`

## Product

Web/PWA prototype of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Implemented story route

- premium prologue and investigation headquarters;
- persistent local progress;
- five first-act evidence items;
- interactive room 314 inspection;
- corridor-camera reconstruction;
- first checkpoint: ordinary exits do not explain the disappearance;
- E006: interactive archive plan of the third floor;
- E007: interactive inspection of room 312;
- E008: interactive provenance check of the 2015 festival archive;
- E009: identity comparison proving that Elena Vetrova is Vera Belova;
- evidence-gated questions for all current suspects;
- second logical checkpoint separating archive/identity lies from the person who used the route through room 312.

## Premium Pass implemented

- one canonical application version and storage-key registry;
- protected build marker that legacy runtime modules cannot overwrite;
- persistent investigation progress rail for Acts I–III;
- one explicit next mandatory step at every playable state;
- direct navigation to the relevant report, evidence or interview section;
- cinematic one-time transitions when Acts II and III open;
- clear visual treatment for new, completed and locked evidence;
- reduced-motion and keyboard support;
- automated `premium-smoke` contract after every production build;
- coalesced runtime observer and throttled legacy polling.

## Interactive interrogation implemented

- Kirill has a dedicated interrogation protocol instead of a static answer list;
- three question lines and evidence presentation;
- evidence only advances the interrogation in a valid logical sequence;
- Kirill changes his version as the route is proven;
- the player must formulate the final contradiction;
- successful interrogation opens the old service room as a search direction;
- interrogation progress persists locally and remains compatible with v0.6.2.

## Living Suspect implemented

- full-size cinematic portrait of Kirill inside the interrogation scene;
- continuous idle micro-motion, breathing and blinking;
- pause before answering;
- evidence-specific reactions: deflection, scepticism, gaze aversion, tension and flinch;
- separate confession/broken-alibi reaction;
- Russian browser speech synthesis with subtitles and mute control;
- voice waveform and live interview camera presentation;
- no additional MutationObserver and no polling;
- performance layer is structured so the animated portrait can later be replaced with authored WebM/MP4 reaction clips without changing interrogation logic.

## Current playable path

1. Complete Act I and submit intermediate report No. 1.
2. Open E006 and prove the hidden passage existed.
3. Inspect all four zones in E007.
4. Open E008 and restore the chain of card 314-17.
5. Open E009 and establish Elena Vetrova's identity.
6. Open `Люди → Кирилл Бессонов`.
7. Fix his corridor alibi.
8. Present the plan, fresh panel, physical route trace and Anton's audio in a valid sequence.
9. Formulate the contradiction that Kirill used the hidden route.
10. Continue toward the old service room.

## Next story stage

`v0.7 — final responsibility and Ilya's location`

- search the old service room and technical corridor;
- recover Ilya and the missing memory card;
- separate assault, concealment and the old-case motive;
- final accusation and case resolution;
- end-of-case report and replay summary.

## Remaining Premium Pass stages

- replace the CSS/photo Living Suspect previs with consistent authored video reactions and recorded actor voice;
- migrate Acts II–III from DOM runtime layers into the typed case engine;
- remove remaining legacy version setters and runtime scans;
- introduce progress migration and deterministic end-to-end fixtures;
- replace temporary E004 presentation with coherent final assets;
- perform external usability and performance testing.

## Known limitations

- Living Suspect currently uses a reactive still portrait and browser TTS, not filmed/generated reaction video;
- E004 camera presentation remains temporary;
- Acts II and III are still runtime layers over the generic Act I shell;
- the final story act is not implemented yet;
- progress remains localStorage-only.
