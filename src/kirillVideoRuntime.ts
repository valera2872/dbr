import { INTERROGATION_STORAGE_KEY } from './build';
import { findKirillScriptByText } from './kirillVideoContract';

export {};

type TranscriptEntry = {
  speaker?: 'detective' | 'kirill' | 'system';
  text?: string;
};

type InterrogationState = {
  transcript?: TranscriptEntry[];
};

type VideoClip = {
  src: string;
  loop?: boolean;
  hasAudio?: boolean;
};

type VideoManifestV2 = {
  version?: number;
  idle?: VideoClip;
  lines?: Record<string, VideoClip>;
};

const MANIFEST_URL = `${import.meta.env.BASE_URL}media/kirill/manifest.json`;
let manifestPromise: Promise<VideoManifestV2> | null = null;
let playbackToken = 0;
let lastPlayedText = '';

function readState(): InterrogationState {
  try {
    return JSON.parse(localStorage.getItem(INTERROGATION_STORAGE_KEY) ?? '{}') as InterrogationState;
  } catch {
    return {};
  }
}

function latestKirillText(): string {
  const transcript = readState().transcript ?? [];
  return [...transcript].reverse().find((entry) => entry.speaker === 'kirill' && entry.text)?.text?.trim() ?? '';
}

function loadManifest(): Promise<VideoManifestV2> {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<VideoManifestV2> : {})
      .catch(() => ({}));
  }
  return manifestPromise;
}

function resolveUrl(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  return `${import.meta.env.BASE_URL}media/kirill/${src}`;
}

function stageElements(): {
  stage: HTMLElement;
  video: HTMLVideoElement;
  still: HTMLImageElement;
  status: HTMLElement | null;
} | null {
  const stage = document.querySelector<HTMLElement>('.living-suspect-stage');
  const video = stage?.querySelector<HTMLVideoElement>('.living-suspect-video');
  const still = stage?.querySelector<HTMLImageElement>('.living-suspect-still');
  if (!stage || !video || !still) return null;
  return {
    stage,
    video,
    still,
    status: stage.querySelector<HTMLElement>('.living-media-status')
  };
}

function stopVideo(): void {
  const elements = stageElements();
  if (!elements) return;
  elements.video.pause();
  elements.video.oncanplay = null;
  elements.video.onerror = null;
  elements.video.onended = null;
  elements.video.removeAttribute('src');
  elements.video.load();
  elements.video.hidden = true;
  elements.still.hidden = false;
  elements.stage.dataset.media = 'still';
}

async function playClip(clip: VideoClip, returnToIdle: boolean): Promise<boolean> {
  const token = ++playbackToken;
  const elements = stageElements();
  if (!elements) return false;

  return new Promise((resolve) => {
    let resolved = false;
    const settle = (value: boolean): void => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };
    const fallback = (): void => {
      if (token !== playbackToken) return settle(false);
      elements.video.hidden = true;
      elements.still.hidden = false;
      elements.stage.dataset.media = 'still';
      if (elements.status) elements.status.textContent = 'ФОТОРЕФЕРЕНС · ВИДЕОФАЙЛ НЕ ЗАГРУЖЕН';
      settle(false);
    };

    elements.video.pause();
    elements.video.oncanplay = () => {
      if (token !== playbackToken) return settle(false);
      elements.video.hidden = false;
      elements.still.hidden = true;
      elements.stage.dataset.media = 'video';
      elements.video.loop = clip.loop === true;
      elements.video.muted = clip.hasAudio !== true;
      if (elements.status) {
        elements.status.textContent = clip.hasAudio
          ? 'РЕАЛЬНЫЙ ВИДЕОДУБЛЬ · ОРИГИНАЛЬНЫЙ ГОЛОС'
          : 'РЕАЛЬНЫЙ ВИДЕОДУБЛЬ · БЕЗ ЗВУКА';
      }
      void elements.video.play().then(() => settle(true)).catch(fallback);
    };
    elements.video.onerror = fallback;
    elements.video.onended = () => {
      if (token !== playbackToken || elements.video.loop) return;
      if (returnToIdle) void playIdle();
      else fallback();
    };
    elements.video.src = resolveUrl(clip.src);
    elements.video.load();
  });
}

async function playIdle(): Promise<void> {
  const manifest = await loadManifest();
  if (!manifest.idle?.src) return;
  await playClip({ ...manifest.idle, loop: true }, false);
}

async function playLatestLine(): Promise<void> {
  const text = latestKirillText();
  if (!text || text === lastPlayedText) return;
  lastPlayedText = text;

  const script = findKirillScriptByText(text);
  if (!script) return;
  const manifest = await loadManifest();
  const clip = manifest.lines?.[script.id];
  if (!clip?.src) return;

  await playClip(clip, true);
}

function activateWhenStageReady(mode: 'idle' | 'line'): void {
  const token = ++playbackToken;
  let attempts = 0;
  const probe = (): void => {
    if (token !== playbackToken) return;
    if (stageElements()) {
      if (mode === 'idle') void playIdle();
      else window.setTimeout(() => void playLatestLine(), 540);
      return;
    }
    attempts += 1;
    if (attempts < 50) requestAnimationFrame(probe);
  };
  requestAnimationFrame(probe);
}

window.addEventListener('dbr:interrogation-updated', () => activateWhenStageReady('line'));
window.addEventListener('pageshow', () => {
  if (document.querySelector('.interrogation-shell')) activateWhenStageReady('idle');
});

document.addEventListener('pointerdown', (event) => {
  const path = event.composedPath();
  const opensKirill = path.some((node) => node instanceof Element && node.closest('.premium-person-card')?.textContent?.includes('Кирилл Бессонов'));
  if (opensKirill) {
    lastPlayedText = latestKirillText();
    activateWhenStageReady('idle');
  }
  if (event.target instanceof Element && event.target.closest('.interrogation-close')) {
    playbackToken += 1;
    stopVideo();
  }
}, true);

window.addEventListener('pagehide', () => {
  playbackToken += 1;
  stopVideo();
});
