# Kirill interrogation video contract

`manifest.json` maps interrogation reactions to real WebM/MP4 clips.

Example:

```json
{
  "idle": { "src": "idle.webm", "loop": true, "hasAudio": false },
  "answer": { "src": "answer-01.webm", "hasAudio": true },
  "deflect": { "src": "deflect.webm", "hasAudio": true },
  "skeptical": { "src": "skeptical.webm", "hasAudio": true },
  "look-away": { "src": "look-away.webm", "hasAudio": true },
  "tense": { "src": "tense.webm", "hasAudio": true },
  "flinch": { "src": "flinch.webm", "hasAudio": true },
  "confess": { "src": "confess.webm", "hasAudio": true }
}
```

Until real clips are present, the application deliberately shows a static photo reference. It must not simulate human motion by translating or rotating the still image.
