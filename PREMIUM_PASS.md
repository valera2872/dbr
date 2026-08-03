# Premium Pass — DBR «Номер 314»

Premium Pass is a separate quality stage. It does not add another branch merely to increase content volume. Its purpose is to make the existing investigation feel coherent, directed, reliable and commercially presentable.

## Pass 1 — foundation and player guidance (`v0.6.1`)

Implemented:

- one canonical application build version;
- protected build marker that legacy runtime modules cannot overwrite;
- persistent investigation progress rail for Acts I–III;
- one explicit next required action at every point of the playable path;
- direct navigation to the relevant report, evidence grid or people section;
- cinematic Act II and Act III unlock transitions shown once per save;
- clear visual treatment for new, completed and locked evidence;
- reduced-motion support and keyboard dismissal for transitions;
- automated premium smoke contract executed after every production build.

Acceptance criteria:

1. A returning player can immediately understand where they are and what must be done next.
2. E006–E009 cannot appear to be missing merely because a gate is incomplete.
3. Build/version information cannot fall back to an older feature-module number.
4. Unlock transitions do not repeat after reload.
5. Production build fails when the evidence chain, imports, build version or PWA cache contract is broken.

## Pass 2 — architecture and reliability

Planned after the final story route exists:

- migrate Acts II–III from DOM runtime layers into the typed case engine;
- introduce a single progress schema and migration layer;
- remove legacy polling and duplicated MutationObservers;
- add route-level recovery for incomplete or old saves;
- add deterministic end-to-end test fixtures for a clean save and a returning save;
- verify desktop, narrow desktop and mobile layouts.

## Pass 3 — audiovisual direction

- replace temporary E004 presentation with a coherent final asset set;
- standardize all evidence documents, photographs and scene grades;
- add restrained transition, discovery and success sound cues;
- add act title cards, final confrontation direction and epilogue pacing;
- audit typography, spacing, contrast, focus states and reduced-motion behavior.

## Pass 4 — release validation

- ten complete clean-save playthroughs without dead ends;
- save/resume test after every mandatory gate;
- external usability test with 10–20 players;
- record every hesitation, misunderstood lock and abandoned screen;
- fix all critical and high-severity issues before commercial positioning.
