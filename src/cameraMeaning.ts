export {};

const BUILD = 'v0.3.6';

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
  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  const question = root.querySelector<HTMLElement>('.camera-question');
  const questionTitle = question?.querySelector<HTMLElement>('h2');
  const answerButtons = Array.from(question?.querySelectorAll<HTMLButtonElement>(':scope > div > button') ?? []);

  if (!taskbar || !frame || eventButtons.length !== 6 || !question || !questionTitle || answerButtons.length !== 4) return;

  root.dataset.meaningEnhanced = BUILD;

  const headerDescription = root.closest('.premium-modal')?.querySelector<HTMLElement>('.premium-modal-header > div > p:last-child');
  if (headerDescription) {
    headerDescription.textContent = 'Сопоставьте возвращение Ильи в номер с тем, что камера показывает после этого.';
  }

  const taskTitle = taskbar.querySelector<HTMLElement>('strong');
  const taskHint = taskbar.querySelector<HTMLElement>('small');
  if (taskTitle) taskTitle.textContent = 'Установите: когда Илья вернулся в 314 и выходил ли он после этого';
  if (taskHint) taskHint.textContent = 'Сначала откройте 23:50, затем сравните с 00:17';

  root.querySelectorAll(':scope > .camera-objective-strip').forEach((node) => node.remove());
  const guide = document.createElement('section');
  guide.className = 'camera-objective-strip';
  guide.innerHTML = `
    <div class="camera-objective-title">
      <span>ЧТО НУЖНО УВИДЕТЬ</span>
      <strong>Не ищите мелкую деталь — восстановите последовательность</strong>
    </div>
    <div class="camera-objective-step" data-step="return">
      <i>1</i><div><small>ПОСЛЕДНИЙ ВХОД ИЛЬИ</small><strong>Откройте кадр 23:50</strong></div><b>не проверено</b>
    </div>
    <div class="camera-objective-arrow">→</div>
    <div class="camera-objective-step" data-step="after">
      <i>2</i><div><small>ЧТО БЫЛО ПОСЛЕ</small><strong>Сравните с кадром 00:17</strong></div><b>не проверено</b>
    </div>
  `;
  taskbar.insertAdjacentElement('afterend', guide);

  const returnStep = guide.querySelector<HTMLElement>('[data-step="return"]');
  const afterStep = guide.querySelector<HTMLElement>('[data-step="after"]');
  const viewed = new Set<string>();

  const updateSteps = (): void => {
    const returned = viewed.has('23:50');
    const checkedAfter = viewed.has('00:17');

    returnStep?.classList.toggle('confirmed', returned);
    afterStep?.classList.toggle('confirmed', checkedAfter);

    const returnStatus = returnStep?.querySelector<HTMLElement>('b');
    const afterStatus = afterStep?.querySelector<HTMLElement>('b');
    if (returnStatus) returnStatus.textContent = returned ? 'Илья вошёл в 314' : 'не проверено';
    if (afterStatus) afterStatus.textContent = checkedAfter ? 'коридор пуст' : 'не проверено';

    root.classList.toggle('camera-ready-for-conclusion', returned && checkedAfter);
    if (returned && checkedAfter && taskHint) taskHint.textContent = 'Последовательность установлена — сформулируйте вывод справа';
  };

  eventButtons.forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    button.dataset.eventRole =
      time === '23:50' ? 'last-entry' :
      time === '00:17' ? 'after-entry' :
      time === '23:47' ? 'departure-before-return' :
      'context';

    if (button.dataset.meaningListener !== BUILD) {
      button.dataset.meaningListener = BUILD;
      button.addEventListener('click', () => {
        viewed.add(time);
        updateSteps();
      });
    }
  });

  const lastEntryButton = eventButtons.find((button) => button.querySelector('time')?.textContent?.trim() === '23:50');
  const afterEntryButton = eventButtons.find((button) => button.querySelector('time')?.textContent?.trim() === '00:17');
  lastEntryButton?.setAttribute('aria-label', 'Ключевой кадр 23:50: Илья возвращается в номер 314');
  afterEntryButton?.setAttribute('aria-label', 'Контрольный кадр 00:17: после возвращения Ильи коридор пуст');

  const kicker = question.querySelector<HTMLElement>('.premium-kicker');
  if (kicker) kicker.textContent = 'ВЫВОД ПО КАМЕРЕ';
  questionTitle.textContent = 'Какой вывод подтверждает последовательность 23:50 → 00:17?';

  answerButtons.forEach((button, index) => {
    button.textContent = ANSWER_LABELS[index];
  });

  const helper = document.createElement('p');
  helper.className = 'camera-question-helper';
  helper.textContent = 'Камера показывает главный коридор. Служебная зона остаётся вне полного обзора.';
  question.insertBefore(helper, question.querySelector(':scope > div'));

  updateSteps();
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
