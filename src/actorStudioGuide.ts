import { KIRILL_VIDEO_SCRIPTS } from './kirillVideoContract';

const STUDIO_PARAM = 'actorStudio';
const GUIDE_KEY = 'dbr:actor-studio:kirill:onboarding:v1';
const TEST_SCRIPT_INDEX = KIRILL_VIDEO_SCRIPTS.findIndex((script) => script.id === 'alibi-initial');

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isActorStudio(): boolean {
  return new URLSearchParams(window.location.search).get(STUDIO_PARAM) === 'kirill';
}

function selectTestScript(root: HTMLElement): void {
  const index = TEST_SCRIPT_INDEX >= 0 ? TEST_SCRIPT_INDEX : 1;
  root.querySelector<HTMLButtonElement>(`[data-script-index="${index}"]`)?.click();
}

function refreshActionLabels(root: HTMLElement): void {
  const camera = root.querySelector<HTMLButtonElement>('[data-camera]');
  const record = root.querySelector<HTMLButtonElement>('[data-record]');
  const stop = root.querySelector<HTMLButtonElement>('[data-stop]');
  const download = root.querySelector<HTMLButtonElement>('[data-download-current]');

  if (camera && !camera.textContent?.startsWith('1.')) {
    camera.textContent = camera.textContent?.includes('Перезапустить')
      ? '1. Перезапустить камеру'
      : '1. Включить камеру и подготовить кадр';
  }
  if (record && !record.hidden) {
    record.textContent = record.textContent?.includes('Перезаписать')
      ? '3. Перезаписать дубль'
      : '2. Начать отсчёт и записать реплику';
  }
  if (stop) stop.textContent = '3. Закончить дубль';
  if (download) download.textContent = '4. Принять и скачать этот дубль';
}

function guidePanelMarkup(): string {
  const test = KIRILL_VIDEO_SCRIPTS[TEST_SCRIPT_INDEX >= 0 ? TEST_SCRIPT_INDEX : 1];
  return `
    <section class="actor-guided-task" aria-label="Что делать сейчас">
      <div class="actor-guided-task-head">
        <span>ТЕСТОВЫЙ ДУБЛЬ · СНАЧАЛА ПОПРОБУЙТЕ ОДНУ СЦЕНУ</span>
        <button type="button" data-show-studio-help>Что это за студия?</button>
      </div>
      <h2>Сейчас вы на несколько секунд играете Кирилла Бессонова</h2>
      <p>После нажатия кнопки записи дождитесь отсчёта и произнесите в камеру ровно эту реплику:</p>
      <blockquote>${escapeHtml(test.text)}</blockquote>
      <ol>
        <li><strong>Включите камеру.</strong> Лицо должно быть хорошо видно, глаза — возле пунктирной линии.</li>
        <li><strong>Нажмите «Начать отсчёт».</strong> После цифры 1 оставьте секунду тишины.</li>
        <li><strong>Произнесите реплику как Кирилл:</strong> спокойно и уверенно, не как ведущий и не как диктор.</li>
        <li><strong>Остановите запись.</strong> Просмотрите дубль; плохой — перезапишите, хороший — примите.</li>
      </ol>
      <p class="actor-guided-result"><strong>Зачем:</strong> этот ролик затем появится в игре в момент, когда следователь спрашивает Кирилла об алиби.</p>
    </section>`;
}

function onboardingMarkup(): string {
  return `
    <div class="actor-onboarding-backdrop" role="dialog" aria-modal="true" aria-label="Назначение Actor Studio">
      <section class="actor-onboarding-card">
        <small>ПРЕЖДЕ ЧЕМ ВКЛЮЧАТЬ КАМЕРУ</small>
        <h1>Это не функция игры и не тест веб-камеры</h1>
        <p class="actor-onboarding-lead">Actor Studio — съёмочная площадка. Камера записывает человека, который будет играть Кирилла Бессонова в допросе.</p>

        <div class="actor-onboarding-flow">
          <article><span>1</span><div><strong>Актёр садится перед камерой</strong><p>Это можете быть вы, знакомый человек или приглашённый актёр.</p></div></article>
          <article><span>2</span><div><strong>Студия показывает реплику</strong><p>На экране написано, что именно сказать и как отреагировать.</p></div></article>
          <article><span>3</span><div><strong>Записывается короткий дубль</strong><p>Например, ответ про алиби, реакция на улику или признание.</p></div></article>
          <article><span>4</span><div><strong>Дубль подключается к игре</strong><p>Игрок задаёт вопрос — вместо фотографии запускается снятое видео.</p></div></article>
        </div>

        <div class="actor-onboarding-warning">
          <strong>Важно</strong>
          <p>Студия сама не превращает фотографию в живого человека. Без съёмки актёра или отдельно созданных AI-видеороликов ей нечего подключать к допросу.</p>
        </div>

        <div class="actor-onboarding-actions">
          <button type="button" class="primary" data-start-guided-take>Понятно — попробовать один тестовый дубль</button>
          <a href="${import.meta.env.BASE_URL}">Вернуться в игру, сейчас не снимать</a>
        </div>
      </section>
    </div>`;
}

function showOnboarding(root: HTMLElement): void {
  root.querySelector('.actor-onboarding-backdrop')?.remove();
  root.insertAdjacentHTML('beforeend', onboardingMarkup());
  const modal = root.querySelector<HTMLElement>('.actor-onboarding-backdrop');
  modal?.querySelector<HTMLButtonElement>('[data-start-guided-take]')?.addEventListener('click', () => {
    localStorage.setItem(GUIDE_KEY, '1');
    modal.remove();
    selectTestScript(root);
    root.querySelector('.actor-guided-task')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    refreshActionLabels(root);
  });
}

export function mountActorStudioGuide(root: HTMLElement): void {
  if (!isActorStudio()) return;

  const recordingStage = root.querySelector<HTMLElement>('.actor-recording-stage');
  if (!recordingStage) return;

  if (!root.querySelector('.actor-guided-task')) {
    recordingStage.insertAdjacentHTML('afterbegin', guidePanelMarkup());
  }

  root.querySelector<HTMLButtonElement>('[data-show-studio-help]')?.addEventListener('click', () => showOnboarding(root));

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('[data-camera], [data-record], [data-stop], [data-download-current]')) return;
    window.requestAnimationFrame(() => refreshActionLabels(root));
    window.setTimeout(() => refreshActionLabels(root), 900);
  });

  selectTestScript(root);
  refreshActionLabels(root);

  if (localStorage.getItem(GUIDE_KEY) !== '1') {
    showOnboarding(root);
  }
}
