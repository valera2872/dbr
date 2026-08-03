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

const PORTRAIT = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=90';
const VOICE_RATE = 0.91;
const VOICE_PITCH = 0.84;

let settings = loadSettings();
let lastSeenKirillEntryId: string | null = null;
let speechTimer = 0;
let simulatedSpeechTimer = 0;
let activationToken = 0;

function loadJson<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
  } catch {
    return {} as T;
  }
}

function loadSettings(): LivingSettings {
  const stored = loadJson<Partial<LivingSettings>>(LIVING_SUSPECT_STORAGE_KEY);
  return { voice: stored.voice !== false };
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
    idle: 'наблюдает за следователем',
    answer: 'отвечает спокойно',
    deflect: 'уходит от прямого ответа',
    skeptical: 'оценивает доказательство',
    'look-away': 'отводит взгляд',
    tense: 'напряжён',
    flinch: 'непроизвольная реакция',
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

function stageMarkup(state: InterrogationState, latest: TranscriptEntry | null): string {
  const text = latest?.text ?? 'Кирилл молча ждёт первого вопроса.';
  const reaction = latest ? inferReaction(text, state) : 'idle';

  return `
    <section class="living-suspect-stage" data-reaction="${reaction}" data-speaking="false" aria-label="Живая сцена допроса Кирилла">
      <div class="living-camera-bar">
        <span><i></i> INTERVIEW CAM / LIVE</span>
        <small>ROOM 03 · SUBJECT K.B.</small>
      </div>
      <div class="living-suspect-frame">
        <div class="living-suspect-portrait">
          <img src="${PORTRAIT}" alt="Кирилл Бессонов во время допроса" />
          <div class="living-face-light"></div>
          <span class="living-eyelid left"></span>
          <span class="living-eyelid right"></span>
          <div class="living-breath-indicator"><span></span><i></i></div>
        </div>
        <div class="living-subject-readout">
          <span>KIRILL / 312</span>
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
        <button type="button" class="living-voice-toggle" aria-pressed="${settings.voice}">
          <span>${settings.voice ? '◉' : '○'}</span>
          ${settings.voice ? 'Голос включён' : 'Голос выключен'}
        </button>
        <span class="living-media-status">REALTIME PORTRAIT · VIDEO-READY</span>
      </footer>
    </section>`;
}

function getStage(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.living-suspect-stage');
}

function stopSpeech(): void {
  window.clearTimeout(speechTimer);
  window.clearTimeout(simulatedSpeechTimer);
  speechTimer = 0;
  simulatedSpeechTimer = 0;

  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const stage = getStage();
  if (stage) {
    stage.dataset.speaking = 'false';
    stage.classList.remove('is-thinking', 'is-speaking');
    stage.setAttribute('aria-busy', 'false');
  }
}

function selectRussianVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const russian = voices.filter((voice) => /^ru([-_]|$)/i.test(voice.lang));

  return russian.find((voice) => /maxim|male|муж|yuri|alex/i.test(voice.name))
    ?? russian.find((voice) => voice.localService)
    ?? russian[0]
    ?? null;
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
    reaction === 'confess' ? 2400 : 900
  );
}

function speak(text: string, reaction: Reaction): void {
  const stage = getStage();
  if (!stage) return;

  stopSpeech();
  stage.dataset.reaction = reaction;
  stage.dataset.speaking = 'false';
  stage.classList.add('is-thinking');
  stage.setAttribute('aria-busy', 'true');

  const readout = stage.querySelector<HTMLElement>('.living-subject-readout strong');
  const subtitle = stage.querySelector<HTMLElement>('.living-suspect-subtitle p');
  if (readout) readout.textContent = reactionLabel(reaction);
  if (subtitle) subtitle.textContent = text;

  const pause = reaction === 'confess' ? 1150 : reaction === 'flinch' ? 780 : 560;

  speechTimer = window.setTimeout(() => {
    const currentStage = getStage();
    if (!currentStage) return;

    currentStage.classList.remove('is-thinking');
    currentStage.classList.add('is-speaking');
    currentStage.dataset.speaking = 'true';

    if (!settings.voice || !('speechSynthesis' in window)) {
      const duration = Math.max(1800, Math.min(9000, text.length * 58));
      simulatedSpeechTimer = window.setTimeout(() => finishPerformance(reaction), duration);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = VOICE_RATE;
    utterance.pitch = VOICE_PITCH;
    utterance.volume = 0.92;
    const voice = selectRussianVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => finishPerformance(reaction);
    utterance.onerror = () => finishPerformance(reaction);
    window.speechSynthesis.speak(utterance);
  }, pause);
}

function bindControls(stage: HTMLElement): void {
  stage.querySelector<HTMLButtonElement>('.living-voice-toggle')?.addEventListener('click', () => {
    settings.voice = !settings.voice;
    saveSettings();
    stopSpeech();

    const button = stage.querySelector<HTMLButtonElement>('.living-voice-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(settings.voice));
      button.innerHTML = `<span>${settings.voice ? '◉' : '○'}</span>${settings.voice ? 'Голос включён' : 'Голос выключен'}`;
    }
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
    if (stage) bindControls(stage);
  }

  shell.classList.add('living-suspect-enabled');
  const latestId = latest?.id ?? null;

  if (!performLatest) {
    lastSeenKirillEntryId = latestId;
    return true;
  }

  if (latest && latestId && latestId !== lastSeenKirillEntryId) {
    lastSeenKirillEntryId = latestId;
    speak(latest.text ?? '', inferReaction(latest.text ?? '', state));
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
    if (attempts < 45) {
      window.requestAnimationFrame(probe);
    }
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

// Карточка Кирилла открывает модальное окно на click. Запуск через setTimeout +
// несколько animation-frame проверок гарантирует, что сцена подключится уже после
// фактического появления окна и не зависит от скорости конкретного браузера.
document.addEventListener('pointerdown', (event) => {
  if (eventTargetsKirillCard(event)) activateWhenReady(false);

  if (event.target instanceof Element && event.target.closest('.interrogation-close')) {
    stopSpeech();
  }
}, true);

document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && eventTargetsKirillCard(event)) {
    activateWhenReady(false);
  }
  if (event.key === 'Escape') stopSpeech();
});

// Основной модуль сначала сохраняет ответ и синхронно перерисовывает всё окно.
// Отложенная активация выполняется после этой перерисовки, поэтому живая сцена
// больше не исчезает при каждом новом вопросе или предъявлении улики.
window.addEventListener('dbr:interrogation-updated', () => activateWhenReady(true));
window.addEventListener('pagehide', stopSpeech);

// Страховка для уже открытого окна при восстановлении вкладки браузером.
window.addEventListener('pageshow', () => {
  if (document.querySelector('.interrogation-shell')) activateWhenReady(false);
});
