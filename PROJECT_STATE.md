# PROJECT STATE — ДБР

## Current branch

`agent/v0-5-act2-hidden-route`

## Current version

`0.5.0`

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
- separate persistence for Act II progress;
- GitHub Pages deployment.

## Current playable path

1. Complete Act I and prove that Ilya did not leave through the door or window.
2. Submit the correct intermediate conclusion.
3. Open the archive plan and inspect all three construction marks.
4. Discover the hidden passage between rooms 312 and 314.
5. Inspect all four zones in room 312.
6. Return to Kirill and Marina with the newly unlocked questions.

## Next stage

`v0.6 — archive and identity branches`

- Denis archive branch;
- original festival materials and missing memory card;
- reveal Elena Vetrova's real connection to the old case;
- second logical checkpoint;
- transition from the hidden-route question to motive and responsibility.

## Known limitations

- E004 camera presentation is temporary and should later be replaced by consistent generated CCTV stills;
- Act II is currently implemented as an isolated runtime layer over the generic Act I shell;
- no final media assets;
- no AI dialogue;
- progress remains localStorage-only.
