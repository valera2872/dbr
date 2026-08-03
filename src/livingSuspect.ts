import {
  INTERROGATION_STORAGE_KEY,
  LIVING_SUSPECT_STORAGE_KEY
} from './build';

export {};

type Reaction =
  | 'idle'
  | 'answer'
  | 'deflect'
  | 'skeptical'
  | 'look-away'
  | 'tense'
  | 'flinch'
  | 'confess';

type TranscriptEntry = {
  id?: string;
  speaker?: 'detective' | 'kirill' | 'system';
  text?: string;
};

type InterrogationState = {
  stage?: 'calm' | 'guarded' | 'cornered' | 'broken';
  transcript?: TranscriptEntry[];
  complete?: boolean;
};

type LivingSettings = {
  voice: boolean;
};

type VideoClip = {
  src: string;
  loop?: boolean;
  hasAudio?: boolean;
};

type VideoManifest = Partial<Record<Reaction, VideoClip>>;

const PORTRAIT = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=90';
const MANIFEST_URL = `${import.meta.env.BASE_URL}media/kirill/manifest.json`;
const VOICE_RATE = 0.91;
const VOICE_PITCH = 0.88;
const VERIFIED_MALE_VOICE = /\b(pavel|maxim|maksim|yuri|yury|alexander|aleksandr|mikhail|dmitry|nikolai|anatoly|igor|vladimir|sergey|artem|male|муж)\b/i;

let settings = loadSettings();
let lastSeenKirillEntryId: string | null = null;
let speechTimer = 0;
let simulatedSpeechTimer = 0;
let activationToken = 0;
let videoManifest: VideoManifest = {};
let manifestLoaded = false;

function loadJson<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
  } catch {
    return {} as T;
  }
}

function loadSettings(): LivingSettings {
  const stored = loadJson<Partial<LivingSettings>>(LIVING_SUSPECT_STORAGE_KEY);
  // Озвучка выключена по умолчанию. Она доступна только при найденном
  // русскоязычном голосе, явно распознанном как мужской.
  return { voice: stored.voice === true };
}

function saveSettings(): void {
  localStorage.setItem(LIVING_SUSPECT_STORAGE_KEY, JSON.stringify(settings));
}

function readInterrogation(): InterrogationState {
  return loadJson<InterrogationState>(INTERROGATION_STORAGE_KEY);
}

function latestKirillEntry(state: InterrogationState): TranscriptEntry | null {
  const entries = Array.isArray(state.transcript) ? state.transcript : [];
  return [...entries].reverse().find((item) => item.speaker === 'kirill' && item.text) ?? null;
}

function inferReaction(text: string, state: InterrogationState): Reaction {
  if (state.complete || state.stage === 'broken' || text.includes('Я вошёл в 314')) return 'confess';
  if (text.includes('десятки тёмных курток') || text.includes('не доказали, что волокна')) return 'flinch';
  if (text.includes('Совпадающая ширина') || text.includes('могли передвигать раньше')) return 'look-away';
  if (text.includes('Хорошо.') || text.includes('знал об этом маршруте')) return 'tense';
  if (text.includes('Это предположение') || text.includes('Старая запись не доказывает')) return 'skeptical';
  if (text.includes('Возможно') || text.includes('Но карту искал не только я')) return 'deflect';
  if (state.stage === 'cornered') return 'tense';
  if (state.stage === 'guarded') return 'deflect';
  return 'answer';
}

function reactionLabel(reaction: Reaction): string {
  const labels: Record<Reaction, string> = {
    idle: 'ожидает вопроса',
    answer: 'отвечает спокойно',
    deflect: 'уходит от прямого ответа',
    skeptical: 'оспаривает доказательство',
    'look-away': 'избегает ответа',
    tense: 'напряжён',
    flinch: 'реакция на улику',
    confess: 'версия разрушена'
  };
  return labels[reaction];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selectVerifiedMaleRussianVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  return window.speechSynthesis
    .getVoices()
    .filter((voice) => /^ru([-_]|$)/i.test(voice.lang))
    .find((voice) => VERIFIED_MALE_VOICE.test(voice.name))
    ?? null;
}

function voiceControlMarkup(): string {
  const voice = selectVerifiedMaleRussianVoice();
  if (!voice) {
    return `
      <button type="button" class="living-voice-toggle unavailable" disabled>
        <span>○</span> Мужской голос недоступен
      </button>`;
  }

  return `
    <button type="button" class="living-voice-toggle" aria-pressed="${settings.voice}" title="${escapeHtml(voice.name)}">
      <span>${settings.voice ? '◉' : '○'}</span>
      ${settings.voice ? 'Мужской голос включён' : 'Включить мужской голос'}
    </button>`;
}

function stageMarkup(state: InterrogationState, latest: TranscriptEntry | null): string {
  const text = latest?.text ?? 'Кирилл молча ждёт первого вопроса.';
  const reaction = latest ? inferReaction(text, state) : 'idle';

  return `
    <section class="living-suspect-stage" data-reaction="${reaction}" data-speaking="false" data-media="still" aria-label="Сцена допроса Кирилла">
      <div class="living-camera-bar">
        <span><i></i> СЦЕНА ДОПРОСА</span>
        <small>КОМНАТА 03 · К.Б.</small>
      </div>
      <div class="living-suspect-frame">
        <video class="living-suspect-video" playsinline preload="metadata" hidden></video>
        <img class="living-suspect-still" src="${PORTRAIT}" alt="Кирилл Бессонов во время допроса" />
        <div class="living-face-light"></div>
        <div class="living-subject-readout">
          <span>КИРИЛЛ / 312</span>
          <strong>${reactionLabel(reaction)}</strong>
        </div>
        <div class="living-voice-wave" aria-hidden="true">
          ${Array.from({ length: 18 }, (_, index) => `<i style="--wave:${index}"></i>`).join('')}
        </div>
      </div>
      <div class="living-suspect-subtitle" aria-live="polite">
        <small>КИРИЛЛ</small>
        <p>${escapeHtml(text)}</p>
      </div>
      <footer class="living-suspect-controls">
        ${voiceControlMarkup()}
        <span class="living-media-status">ФОТОРЕФЕРЕНС · ВИДЕОКЛИПЫ НЕ УСТАНОВЛЕНЫ</span>
      </footer>
    </section>`;
}

function getStage(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.living-suspect-stage');
}

function stopMedia(): void {
  window.clearTimeout(speechTimer);
  window.clearTimeout(simulatedSpeechTimer);
  speechTimer = 0;
  simulatedSpeechTimer = 0;

  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const stage = getStage();
  const video = stage?.querySelector<HTMLVideoElement>('.living-suspect-video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.hidden = true;
  }

  const still = stage?.querySelector<HTMLImageElement>('.living-suspect-still');
  if (still) still.hidden = false;

  if (stage) {
    stage.dataset.speaking = 'false';
    stage.dataset.media = 'still';
    stage.classList.remove('is-thinking', 'is-speaking');
    stage.setAttribute('aria-busy', 'false');
  }
}

async function loadVideoManifest(): Promise<void> {
  if (manifestLoaded) return;
  manifestLoaded = true;

  try {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) return;
    videoManifest = await response.json() as VideoManifest;
  } catch {
    videoManifest = {};
  }
}

function resolveClipUrl(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  return `${import.meta.env.BASE_URL}media/kirill/${src}`;
}

async function playVideoReaction(reaction: Reaction): Promise<VideoClip | null> {
  await loadVideoManifest();
  const clip = videoManifest[reaction];
  const stage = getStage();
  const video = stage?.querySelector<HTMLVideoElement>('.living-suspect-video');
  const still = stage?.querySelector<HTMLImageElement>('.living-suspect-still');
  if (!clip || !stage || !video || !still) return null;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: VideoClip | null): void => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    video.onerror = () => {
      video.hidden = true;
      still.hidden = false;
      stage.dataset.media = 'still';
      finish(null);
    };
    video.oncanplay = () => {
      video.hidden = false;
      still.hidden = true;
      stage.dataset.media = 'video';
      video.loop = clip.loop === true;
      video.muted = clip.hasAudio !== true;
      void video.play().then(() => finish(clip)).catch(() => finish(null));
    };
    video.onended = () => {
      if (!video.loop) {
        video.hidden = true;
        still.hidden = false;
        stage.dataset.media = 'still';
      }
    };

    video.src = resolveClipUrl(clip.src);
    video.load();
  });
}

function finishPerformance(reaction: Reaction): void {
  const stage = getStage();
  if (!stage) return;

  stage.dataset.speaking = 'false';
  stage.classList.remove('is-thinking', 'is-speaking');
  stage.classList.add('is-after-reaction');
  stage.setAttribute('aria-busy', 'false');

  window.setTimeout(
    () => stage.classList.remove('is-after-reaction'),
    reaction === 'confess' ? 1800 : 700
  );
}

function speakWithVerifiedMaleVoice(text: string, reaction: Reaction): void {
  const voice = selectVerifiedMaleRussianVoice();
  if (!settings.voice || !voice || !('speechSynthesis' in window)) {
    const duration = Math.max(1500, Math.min(7000, text.length * 48));
    simulatedSpeechTimer = window.setTimeout(() => finishPerformance(reaction), duration);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.voice = voice;
  utterance.rate = VOICE_RATE;
  utterance.pitch = VOICE_PITCH;
  utterance.volume = 0.92;
  utterance.onend = () => finishPerformance(reaction);
  utterance.onerror = () => finishPerformance(reaction);
  window.speechSynthesis.speak(utterance);
}

function presentReaction(text: string, reaction: Reaction): void {
  const stage = getStage();
  if (!stage) return;

  stopMedia();
  stage.dataset.reaction = reaction;
  stage.classList.add('is-thinking');
  stage.setAttribute('aria-busy', 'true');

  const readout = stage.querySelector<HTMLElement>('.living-subject-readout strong');
  const subtitle = stage.querySelector<HTMLElement>('.living-suspect-subtitle p');
  if (readout) readout.textContent = reactionLabel(reaction);
  if (subtitle) subtitle.textContent = text;

  const pause = reaction === 'confess' ? 950 : reaction === 'flinch' ? 650 : 430;
  speechTimer = window.setTimeout(() => {
    void playVideoReaction(reaction).then((clip) => {
      const currentStage = getStage();
      if (!currentStage) return;

      currentStage.classList.remove('is-thinking');
      currentStage.classList.add('is-speaking');
      currentStage.dataset.speaking = 'true';

      if (clip?.hasAudio) {
        const video = currentStage.querySelector<HTMLVideoElement>('.living-suspect-video');
        if (video) video.onended = () => finishPerformance(reaction);
        return;
      }

      speakWithVerifiedMaleVoice(text, reaction);
    });
  }, pause);
}

function refreshVoiceControl(stage: HTMLElement): void {
  const current = stage.querySelector<HTMLButtonElement>('.living-voice-toggle');
  if (!current) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = voiceControlMarkup().trim();
  const replacement = wrapper.firstElementChild as HTMLButtonElement | null;
  if (!replacement) return;
  current.replaceWith(replacement);
  bindVoiceControl(stage);
}

function bindVoiceControl(stage: HTMLElement): void {
  const button = stage.querySelector<HTMLButtonElement>('.living-voice-toggle');
  if (!button || button.disabled || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';

  button.addEventListener('click', () => {
    settings.voice = !settings.voice;
    saveSettings();
    stopMedia();
    refreshVoiceControl(stage);
  });
}

function decorate(performLatest: boolean): boolean {
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  const workspace = shell?.querySelector<HTMLElement>('.interrogation-workspace');
  if (!shell || !workspace) return false;

  const state = readInterrogation();
  const latest = latestKirillEntry(state);
  let stage = workspace.querySelector<HTMLElement>('.living-suspect-stage');

  if (!stage) {
    workspace.insertAdjacentHTML('afterbegin', stageMarkup(state, latest));
    stage = workspace.querySelector<HTMLElement>('.living-suspect-stage');
    if (stage) bindVoiceControl(stage);
  }

  shell.classList.add('living-suspect-enabled');
  const latestId = latest?.id ?? null;

  if (!performLatest) {
    lastSeenKirillEntryId = latestId;
    return true;
  }

  if (latest && latestId && latestId !== lastSeenKirillEntryId) {
    lastSeenKirillEntryId = latestId;
    presentReaction(latest.text ?? '', inferReaction(latest.text ?? '', state));
  }

  return true;
}

function activateWhenReady(performLatest: boolean): void {
  const token = ++activationToken;
  let attempts = 0;

  const probe = (): void => {
    if (token !== activationToken) return;
    if (decorate(performLatest)) return;

    attempts += 1;
    if (attempts < 45) window.requestAnimationFrame(probe);
  };

  window.setTimeout(probe, 0);
}

function eventTargetsKirillCard(event: Event): boolean {
  return event.composedPath().some((node) => {
    if (!(node instanceof Element)) return false;
    const card = node.matches('.premium-person-card')
      ? node
      : node.closest('.premium-person-card');
    return Boolean(card?.textContent?.includes('Кирилл Бессонов'));
  });
}

document.addEventListener('pointerdown', (event) => {
  if (eventTargetsKirillCard(event)) activateWhenReady(false);

  if (event.target instanceof Element && event.target.closest('.interrogation-close')) {
    stopMedia();
  }
}, true);

document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && eventTargetsKirillCard(event)) {
    activateWhenReady(false);
  }
  if (event.key === 'Escape') stopMedia();
});

window.addEventListener('dbr:interrogation-updated', () => activateWhenReady(true));
window.addEventListener('pagehide', stopMedia);
window.addEventListener('pageshow', () => {
  if (document.querySelector('.interrogation-shell')) activateWhenReady(false);
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    const stage = getStage();
    if (stage) refreshVoiceControl(stage);
  });
}
