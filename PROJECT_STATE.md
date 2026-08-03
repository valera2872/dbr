# PROJECT STATE — ДБР

## Current branch

`main`

## Current version

`0.6.0`

## Product

Web/PWA prototype of the interactive investigation series **ДБР**.

First case: **«Номер 314»**.

## Implemented

- premium prologue and investigation headquarters;
- persistent local progress;
- five first-act evidence items;
- interactive room 314 inspection;
- corridor-camera reconstruction;
- scripted interrogations and evidence-gated questions;
- first checkpoint: ordinary exits do not explain the disappearance;
- Act II gate after the correct checkpoint conclusion;
- E006: interactive archive plan of the third floor;
- three plan discrepancies revealing the old passage between 312 and 314;
- E007: interactive inspection of room 312;
- four room findings confirming that the hidden route was recently used;
- new Act II questions for Kirill and Marina;
- E008: interactive provenance check of the 2015 festival archive;
- four archive documents revealing missing original B-17 and card 314-17;
- E009: identity comparison proving that Elena Vetrova is Vera Belova;
- new Act III questions for Denis and Vera;
- second logical checkpoint separating archive/identity lies from the person who used the route through room 312;
- separate persistence for Act II and Act III progress;
- GitHub Pages deployment.

## Current playable path

1. Complete Act I and prove that Ilya did not leave through the door or window.
2. Submit the correct intermediate conclusion.
3. Open E006 and inspect all three construction marks.
4. Discover the hidden passage between rooms 312 and 314.
5. Inspect all four zones in E007.
6. Return to Kirill and Marina with the newly unlocked questions.
7. Open E008 and restore the chain of the missing original card 314-17.
8. Open E009 and establish Elena Vetrova's real identity.
9. Ask Denis and Vera the new evidence-gated questions.
10. Submit intermediate report No. 2: their lies explain the card and old case, but not the person who used the route from room 312.

## Next stage

`v0.7 — final responsibility and Ilya's location`

- confront Kirill with the route, archive audio and contradictions;
- establish who moved Ilya and where he was taken;
- final search scene in the service zone;
- recovery of Ilya and the missing memory card;
- final accusation and case resolution;
- end-of-case report and replay summary.

## Known limitations

- E004 camera presentation is temporary and should later be replaced by consistent generated CCTV stills;
- Acts II and III are currently implemented as runtime layers over the generic Act I shell;
- no final media assets;
- no AI dialogue;
- progress remains localStorage-only.
