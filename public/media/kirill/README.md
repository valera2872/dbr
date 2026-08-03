# Kirill interrogation video contract

DBR v0.6.6 uses line-level video clips. A clip is tied to a specific canonical Kirill reply, so mouth movement and original audio can match the text instead of playing a generic reaction.

Open Actor Studio in the deployed application:

```text
/dbr/?actorStudio=kirill
```

The studio records the required scenes, downloads correctly named WebM files and generates `manifest.json`.

Manifest schema:

```json
{
  "version": 2,
  "actor": "Кирилл Бессонов",
  "idle": {
    "src": "idle.webm",
    "loop": true,
    "hasAudio": false
  },
  "lines": {
    "alibi-initial": {
      "src": "alibi-initial.webm",
      "loop": false,
      "hasAudio": true
    },
    "confession": {
      "src": "confession.webm",
      "loop": false,
      "hasAudio": true
    }
  }
}
```

Place downloaded files and the generated manifest in:

```text
public/media/kirill/
```

The runtime first looks for the exact line clip. When it ends, it returns to `idle.webm`. Missing clips fall back to the deliberately static photo reference. A still image must never be translated, rotated, blinked or presented as live video.
