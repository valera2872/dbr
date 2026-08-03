# PROJECT STATE — ДБР

## Current branch

`main`

## Current version

`0.6.1 — Premium Pass 1`

## Product

Web/PWA prototype of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Implemented story route

- premium prologue and investigation headquarters;
- persistent local progress;
- five first-act evidence items;
- interactive room 314 inspection;
- corridor-camera reconstruction;
- scripted interrogations and evidence-gated questions;
- first checkpoint: ordinary exits do not explain the disappearance;
- E006: interactive archive plan of the third floor;
- E007: interactive inspection of room 312;
- new Act II questions for Kirill and Marina;
- E008: interactive provenance check of the 2015 festival archive;
- E009: identity comparison proving that Elena Vetrova is Vera Belova;
- new Act III questions for Denis and Vera;
- second logical checkpoint separating archive/identity lies from the person who used the route through room 312.

## Premium Pass 1 implemented

- one canonical application version and storage-key registry;
- protected build marker that legacy runtime modules cannot overwrite;
- persistent investigation progress rail for Acts I–III;
- one explicit next mandatory step at every playable state;
- direct navigation to the relevant report, evidence or interview section;
- cinematic one-time transitions when Acts II and III open;
- clear visual treatment for new, completed and locked evidence;
- reduced-motion and keyboard support for act transitions;
- automated `premium-smoke` contract after every production build;
- documented Premium Pass acceptance criteria in `PREMIUM_PASS.md`.

## Current playable path

1. Complete Act I and prove that Ilya did not leave through the door or window.
2. Submit intermediate report No. 1.
3. Open E006 and inspect all three construction marks.
4. Discover the hidden passage between rooms 312 and 314.
5. Inspect all four zones in E007.
6. Return to Kirill and Marina with the newly unlocked questions.
7. Open E008 and restore the chain of the missing original card 314-17.
8. Open E009 and establish Elena Vetrova's real identity.
9. Ask Denis and Vera the new evidence-gated questions.
10. Submit intermediate report No. 2.

## Next story stage

`v0.7 — final responsibility and Ilya's location`

- confront Kirill with the route, archive audio and contradictions;
- establish who moved Ilya and where he was taken;
- final search scene in the service zone;
- recovery of Ilya and the missing memory card;
- final accusation and case resolution;
- end-of-case report and replay summary.

## Remaining Premium Pass stages

- migrate Acts II–III from DOM runtime layers into the typed case engine;
- remove legacy polling and duplicated MutationObservers;
- introduce progress migration and deterministic end-to-end fixtures;
- replace temporary E004 presentation with coherent final assets;
- complete audiovisual direction and external usability testing.

## Known limitations

- E004 camera presentation remains temporary;
- Acts II and III are still runtime layers over the generic Act I shell;
- the final story act is not implemented yet;
- no final media asset package;
- progress remains localStorage-only.
