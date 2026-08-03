import { KIRILL_VIDEO_SCRIPTS, type KirillVideoScript } from './kirillVideoContract';

export type ActorStudioResult = {
  mounted: boolean;
};

type Capture = {
  blob: Blob;
  url: string;
  mimeType: string;
};

const STUDIO_PARAM = 'actorStudio';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function chooseMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function scriptListMarkup(captures: Map<string, Capture>): string {
  return KIRILL_VIDEO_SCRIPTS.map((script, index) => `
    <button type="button" class="actor-script-item ${captures.has(script.id) ? 'complete' : ''}" data-script-index="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div>
        <strong>${escapeHtml(script.title)}</strong>
        <small>${script.hasAudio ? 'реплика с голосом' : 'немая петля'} · ${script.recommendedSeconds} сек.</small>
      </div>
      <i>${captures.has(script.id) ? 'ГОТОВО' : 'НЕ ЗАПИСАНО'}</i>
    </button>`).join('');
}

function manifestFromCaptures(captures: Map<string, Capture>): Record<string, unknown> {
  const idle = captures.has('idle')
    ? { src: 'idle.webm', loop: true, hasAudio: false }
    : undefined;

  const lines: Record<string, { src: string; loop: boolean; hasAudio: boolean }> = {};
  KIRILL_VIDEO_SCRIPTS
    .filter((script) => script.id !== 'idle' && captures.has(script.id))
    .forEach((script) => {
      lines[script.id] = {
        src: script.filename,
        loop: false,
        hasAudio: script.hasAudio
      };
    });

  return {
    version: 2,
    actor: 'Кирилл Бессонов',
    generatedAt: new Date().toISOString(),
    idle,
    lines
  };
}

export function mountActorStudio(root: HTMLElement): ActorStudioResult {
  const params = new URLSearchParams(window.location.search);
  if (params.get(STUDIO_PARAM) !== 'kirill') return { mounted: false };

  document.body.classList.add('actor-studio-open');

  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let selectedIndex = 0;
  let recordingStartedAt = 0;
  let timerFrame = 0;
  const captures = new Map<string, Capture>();

  root.innerHTML = `
    <main class="actor-studio">
      <header class="actor-studio-header">
        <div>
          <small>ДБР · VIDEO PRODUCTION</small>
          <h1>Actor Studio: Кирилл Бессонов</h1>
          <p>Запишите реальные реплики и реакции. Студия создаёт WebM-файлы с именами, которые видеодвижок подключит автоматически.</p>
        </div>
        <a href="${import.meta.env.BASE_URL}" class="actor-studio-exit">Вернуться в дело</a>
      </header>

      <section class="actor-studio-layout">
        <aside class="actor-script-list" aria-label="Список сцен">
          <div class="actor-list-head">
            <span>СЦЕНЫ</span>
            <strong data-progress>0 / ${KIRILL_VIDEO_SCRIPTS.length}</strong>
          </div>
          <div data-script-list>${scriptListMarkup(captures)}</div>
        </aside>

        <section class="actor-recording-stage">
          <div class="actor-camera-shell">
            <video class="actor-camera-preview" autoplay playsinline muted></video>
            <video class="actor-take-preview" playsinline controls hidden></video>
            <div class="actor-camera-placeholder">
              <strong>Камера ещё не включена</strong>
              <p>Разрешите доступ к камере и микрофону. Запись остаётся только в браузере и скачивается на ваш компьютер.</p>
            </div>
            <div class="actor-framing-guide" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
              <i>ГЛАЗА НА ЭТОЙ ЛИНИИ</i>
            </div>
            <div class="actor-recording-badge" hidden><i></i> REC <span data-timer>00:00</span></div>
          </div>

          <article class="actor-script-card" data-script-card></article>

          <div class="actor-studio-actions">
            <button type="button" class="secondary" data-camera>Включить камеру</button>
            <button type="button" class="record" data-record disabled>Записать сцену</button>
            <button type="button" class="secondary" data-stop hidden>Остановить</button>
            <button type="button" class="secondary" data-download-current disabled>Скачать текущий клип</button>
          </div>
          <p class="actor-studio-status" data-status>Подготовьте нейтральный фон, мягкий фронтальный свет и тихое помещение.</p>
        </section>

        <aside class="actor-production-panel">
          <section>
            <small>КАДР</small>
            <h2>Как снимать</h2>
            <p>Камера на уровне глаз. Кадр от середины груди до макушки. Актёр сидит, не раскачивается и не смотрит постоянно в объектив — взгляд направлен на следователя рядом с камерой.</p>
          </section>
          <section>
            <small>ЗВУК</small>
            <h2>Одна манера речи</h2>
            <p>Не меняйте расстояние до микрофона. Оставляйте одну секунду тишины до реплики и после неё. Не добавляйте музыку и обработку.</p>
          </section>
          <section class="actor-export-panel">
            <small>ЭКСПОРТ</small>
            <h2>Готовый комплект</h2>
            <button type="button" data-download-all disabled>Скачать все записанные клипы</button>
            <button type="button" data-manifest disabled>Скачать manifest.json</button>
            <p>Файлы нужно положить в <code>public/media/kirill/</code> рядом с manifest.json.</p>
          </section>
        </aside>
      </section>
    </main>`;

  const cameraPreview = root.querySelector<HTMLVideoElement>('.actor-camera-preview')!;
  const takePreview = root.querySelector<HTMLVideoElement>('.actor-take-preview')!;
  const placeholder = root.querySelector<HTMLElement>('.actor-camera-placeholder')!;
  const framingGuide = root.querySelector<HTMLElement>('.actor-framing-guide')!;
  const recordingBadge = root.querySelector<HTMLElement>('.actor-recording-badge')!;
  const timer = root.querySelector<HTMLElement>('[data-timer]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const scriptCard = root.querySelector<HTMLElement>('[data-script-card]')!;
  const scriptList = root.querySelector<HTMLElement>('[data-script-list]')!;
  const progress = root.querySelector<HTMLElement>('[data-progress]')!;
  const cameraButton = root.querySelector<HTMLButtonElement>('[data-camera]')!;
  const recordButton = root.querySelector<HTMLButtonElement>('[data-record]')!;
  const stopButton = root.querySelector<HTMLButtonElement>('[data-stop]')!;
  const downloadCurrentButton = root.querySelector<HTMLButtonElement>('[data-download-current]')!;
  const downloadAllButton = root.querySelector<HTMLButtonElement>('[data-download-all]')!;
  const manifestButton = root.querySelector<HTMLButtonElement>('[data-manifest]')!;

  const currentScript = (): KirillVideoScript => KIRILL_VIDEO_SCRIPTS[selectedIndex];

  const updateProgress = (): void => {
    progress.textContent = `${captures.size} / ${KIRILL_VIDEO_SCRIPTS.length}`;
    downloadAllButton.disabled = captures.size === 0;
    manifestButton.disabled = captures.size === 0;
  };

  const refreshList = (): void => {
    scriptList.innerHTML = scriptListMarkup(captures);
    scriptList.querySelectorAll<HTMLButtonElement>('[data-script-index]').forEach((button) => {
      const index = Number(button.dataset.scriptIndex);
      button.classList.toggle('selected', index === selectedIndex);
      button.addEventListener('click', () => {
        if (recorder?.state === 'recording') return;
        selectedIndex = index;
        showSelectedScript();
        refreshList();
      });
    });
    updateProgress();
  };

  const showSelectedScript = (): void => {
    const script = currentScript();
    scriptCard.innerHTML = `
      <div class="actor-script-meta">
        <span>${String(selectedIndex + 1).padStart(2, '0')} / ${String(KIRILL_VIDEO_SCRIPTS.length).padStart(2, '0')}</span>
        <i>${script.hasAudio ? 'С ГОЛОСОМ' : 'БЕЗ ГОЛОСА'} · ${script.filename}</i>
      </div>
      <h2>${escapeHtml(script.title)}</h2>
      ${script.text ? `<blockquote>${escapeHtml(script.text)}</blockquote>` : '<blockquote>Молчание. Только естественное ожидание вопроса.</blockquote>'}
      <div class="actor-direction"><small>РЕЖИССЁРСКАЯ ЗАДАЧА</small><p>${escapeHtml(script.direction)}</p></div>
      <p class="actor-duration">Рекомендуемая длительность: <strong>${script.recommendedSeconds} секунд</strong></p>`;

    const capture = captures.get(script.id);
    downloadCurrentButton.disabled = !capture;
    if (capture) {
      takePreview.src = capture.url;
      takePreview.hidden = false;
      cameraPreview.hidden = true;
      framingGuide.hidden = true;
      status.textContent = 'Дубль записан. Просмотрите его, скачайте или запишите заново.';
      recordButton.textContent = 'Перезаписать сцену';
    } else {
      takePreview.pause();
      takePreview.removeAttribute('src');
      takePreview.hidden = true;
      cameraPreview.hidden = !stream;
      framingGuide.hidden = !stream;
      recordButton.textContent = 'Записать сцену';
      status.textContent = stream
        ? 'Кадр готов. Нажмите «Записать сцену» — начнётся трёхсекундный отсчёт.'
        : 'Подготовьте нейтральный фон, мягкий фронтальный свет и тихое помещение.';
    }
  };

  const updateTimer = (): void => {
    if (!recorder || recorder.state !== 'recording') return;
    const elapsed = Math.floor((performance.now() - recordingStartedAt) / 1000);
    timer.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
    timerFrame = requestAnimationFrame(updateTimer);
  };

  const stopRecording = (): void => {
    if (recorder?.state === 'recording') recorder.stop();
  };

  const startRecording = async (): Promise<void> => {
    if (!stream) return;
    const script = currentScript();

    takePreview.pause();
    takePreview.hidden = true;
    cameraPreview.hidden = false;
    framingGuide.hidden = false;
    recordButton.disabled = true;
    cameraButton.disabled = true;
    status.textContent = 'Запись начнётся через 3…';

    for (let count = 3; count > 0; count -= 1) {
      status.textContent = `Запись начнётся через ${count}…`;
      await new Promise((resolve) => window.setTimeout(resolve, 850));
    }

    const captureStream = script.hasAudio
      ? stream
      : new MediaStream(stream.getVideoTracks());
    const mimeType = chooseMimeType();
    chunks = [];
    recorder = mimeType
      ? new MediaRecorder(captureStream, { mimeType, videoBitsPerSecond: 4_500_000, audioBitsPerSecond: 128_000 })
      : new MediaRecorder(captureStream);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(timerFrame);
      const actualMime = recorder?.mimeType || mimeType || 'video/webm';
      const blob = new Blob(chunks, { type: actualMime });
      const previous = captures.get(script.id);
      if (previous) URL.revokeObjectURL(previous.url);
      const capture: Capture = { blob, url: URL.createObjectURL(blob), mimeType: actualMime };
      captures.set(script.id, capture);

      recordingBadge.hidden = true;
      stopButton.hidden = true;
      recordButton.hidden = false;
      recordButton.disabled = false;
      cameraButton.disabled = false;
      cameraPreview.hidden = true;
      framingGuide.hidden = true;
      takePreview.src = capture.url;
      takePreview.hidden = false;
      takePreview.currentTime = 0;
      status.textContent = 'Дубль готов. Проверьте начало, окончание, взгляд и качество голоса.';
      refreshList();
      showSelectedScript();
    };

    recorder.start(250);
    recordingStartedAt = performance.now();
    timer.textContent = '00:00';
    recordingBadge.hidden = false;
    recordButton.hidden = true;
    stopButton.hidden = false;
    status.textContent = script.hasAudio ? 'ИДЁТ ЗАПИСЬ · произнесите реплику' : 'ИДЁТ ЗАПИСЬ · сохраняйте естественное молчание';
    updateTimer();
  };

  cameraButton.addEventListener('click', async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia unavailable');
      stream?.getTracks().forEach((track) => track.stop());
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      cameraPreview.srcObject = stream;
      cameraPreview.hidden = false;
      takePreview.hidden = true;
      placeholder.hidden = true;
      framingGuide.hidden = false;
      cameraButton.textContent = 'Перезапустить камеру';
      recordButton.disabled = false;
      status.textContent = 'Камера включена. Проверьте кадр и выберите первую сцену.';
      showSelectedScript();
    } catch {
      status.textContent = 'Не удалось включить камеру или микрофон. Проверьте разрешения сайта в браузере.';
    }
  });

  recordButton.addEventListener('click', () => void startRecording());
  stopButton.addEventListener('click', stopRecording);

  downloadCurrentButton.addEventListener('click', () => {
    const script = currentScript();
    const capture = captures.get(script.id);
    if (capture) downloadBlob(capture.blob, script.filename);
  });

  downloadAllButton.addEventListener('click', () => {
    const recorded = KIRILL_VIDEO_SCRIPTS.filter((script) => captures.has(script.id));
    recorded.forEach((script, index) => {
      const capture = captures.get(script.id)!;
      window.setTimeout(() => downloadBlob(capture.blob, script.filename), index * 280);
    });
  });

  manifestButton.addEventListener('click', () => {
    const json = JSON.stringify(manifestFromCaptures(captures), null, 2);
    downloadBlob(new Blob([`${json}\n`], { type: 'application/json' }), 'manifest.json');
  });

  window.addEventListener('beforeunload', () => {
    stream?.getTracks().forEach((track) => track.stop());
    captures.forEach((capture) => URL.revokeObjectURL(capture.url));
  });

  refreshList();
  showSelectedScript();
  return { mounted: true };
}
