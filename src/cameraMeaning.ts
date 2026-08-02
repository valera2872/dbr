export {};

const BUILD = 'v0.3.7';

const ANSWER_LABELS = [
  'Илья вышел через коридор после 23:50',
  'Кирилл вошёл в номер 314 через главную дверь',
  'После 23:50 Илья не выходил через главный коридор',
  'Камера перестала записывать в 00:17'
];

function updateBuildMarker(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;
  document.documentElement.dataset.dbrBuild = BUILD;
  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;
}

function enhanceCameraMeaning(root: HTMLElement): void {
  if (root.dataset.meaningEnhanced === BUILD) return;

  const taskbar = root.querySelector<HTMLElement>('.camera-taskbar');
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const events = root.querySelector<HTMLElement>('.camera-events');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  const question = root.querySelector<HTMLElement>('.camera-question');
  const questionTitle = question?.querySelector<HTMLElement>('h2');
  const answerButtons = Array.from(question?.querySelectorAll<HTMLButtonElement>(':scope > div > button') ?? []);

  if (!taskbar || !consoleElement || !events || eventButtons.length !== 6 || !question || !questionTitle || answerButtons.length !== 4) return;

  root.dataset.meaningEnhanced = BUILD;

  const modal = root.closest('.premium-modal');
  const headerDescription = modal?.querySelector<HTMLElement>('.premium-modal-header > div > p:last-child');
  if (headerDescription) headerDescription.textContent = 'Сравните ключевой вход Ильи в номер с тем, что камера показывает после него.';

  const taskTitle = taskbar.querySelector<HTMLElement>('strong');
  const taskHint = taskbar.querySelector<HTMLElement>('small');
  if (taskTitle) taskTitle.textContent = 'Главный вопрос: вернулся ли Илья в 314 и выходил ли потом через коридор?';
  if (taskHint) taskHint.textContent = 'Справа нажмите 23:50, затем 00:17';

  root.querySelectorAll('.camera-objective-strip, .camera-objective-side').forEach((node) => node.remove());

  const guide = document.createElement('section');
  guide.className = 'camera-objective-side';
  guide.innerHTML = `
    <div class="camera-side-title">
      <span>ЧТО НУЖНО УСТАНОВИТЬ</span>
      <strong>Сначала вход. Затем — был ли выход.</strong>
    </div>
    <button type="button" data-jump="23:50">
      <i>1</i><div><small>КЛЮЧЕВОЙ КАДР</small><strong>23:50 — Илья входит в 314</strong></div><b>открыть</b>
    </button>
    <button type="button" data-jump="00:17">
      <i>2</i><div><small>КОНТРОЛЬ ПОСЛЕ ВХОДА</small><strong>00:17 — проверить коридор</strong></div><b>открыть</b>
    </button>`;
  consoleElement.insertBefore(guide, events);

  const viewed = new Set<string>();
  const jumpButtons = Array.from(guide.querySelectorAll<HTMLButtonElement>('button[data-jump]'));

  eventButtons.forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    button.dataset.eventRole = time === '23:50' ? 'last-entry' : time === '00:17' ? 'after-entry' : 'context';
    button.addEventListener('click', () => {
      viewed.add(time);
      jumpButtons.forEach((jump) => {
        const jumpTime = jump.dataset.jump ?? '';
        const checked = viewed.has(jumpTime);
        jump.classList.toggle('confirmed', checked);
        const status = jump.querySelector<HTMLElement>('b');
        if (status) status.textContent = checked ? (jumpTime === '23:50' ? 'вход подтверждён' : 'выхода нет') : 'открыть';
      });
      root.classList.toggle('camera-ready-for-conclusion', viewed.has('23:50') && viewed.has('00:17'));
      if (viewed.has('23:50') && viewed.has('00:17') && taskHint) taskHint.textContent = 'Последовательность установлена — выберите вывод справа';
    });
  });

  jumpButtons.forEach((jump) => {
    jump.addEventListener('click', () => {
      const targetTime = jump.dataset.jump;
      eventButtons.find((button) => button.querySelector('time')?.textContent?.trim() === targetTime)?.click();
    });
  });

  const kicker = question.querySelector<HTMLElement>('.premium-kicker');
  if (kicker) kicker.textContent = 'ВЫВОД ПО КАМЕРЕ';
  questionTitle.textContent = 'Что доказала камера?';
  answerButtons.forEach((button, index) => { button.textContent = ANSWER_LABELS[index]; });

  question.querySelectorAll('.camera-question-helper').forEach((node) => node.remove());
  const helper = document.createElement('p');
  helper.className = 'camera-question-helper';
  helper.textContent = 'Камера видит главный коридор, но не служебную зону.';
  question.insertBefore(helper, question.querySelector(':scope > div'));
}

function scan(): void {
  updateBuildMarker();
  document.querySelectorAll<HTMLElement>('.camera-evidence').forEach(enhanceCameraMeaning);
}

let scheduled = false;
const scheduleScan = (): void => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
};

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(scan, 80), true);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
else scan();

const poll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(poll), 12000);
