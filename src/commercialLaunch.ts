import {
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY,
  CASE_ID,
  CORE_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';
import { INTERNAL_MODE } from './internalMode';
import {
  getInvestigationState,
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot,
  type RouteStage
} from './investigationState';

export {};

const GATE_SEEN_KEY = `dbr:${CASE_ID}:commercial:gate-seen`;
const AUTO_START_KEY = `dbr:${CASE_ID}:commercial:auto-start`;
const CASE_PREFIX = `dbr:${CASE_ID}`;

let overlay: HTMLElement | null = null;
let latest = getInvestigationState();
let confirmingRestart = false;

const STAGE_COPY: Record<RouteStage, { eyebrow: string; title: string }> = {
  'act1-evidence': { eyebrow: 'Акт I · первичный осмотр', title: 'Соберите материалы номера 314' },
  'act1-report': { eyebrow: 'Акт I · логический узел', title: 'Сформулируйте первый вывод' },
  'act2-plan': { eyebrow: 'Акт II · скрытый маршрут', title: 'Изучите архивный план этажа' },
  'act2-room': { eyebrow: 'Акт II · номер 312', title: 'Докажите существование прохода' },
  'act3-archive': { eyebrow: 'Акт III · архив', title: 'Восстановите происхождение карты' },
  'act3-identity': { eyebrow: 'Акт III · личность', title: 'Установите настоящее имя Елены' },
  'act3-interviews': { eyebrow: 'Акт III · показания', title: 'Повторно допросите Дениса и Веру' },
  'act3-report': { eyebrow: 'Акт III · логический узел', title: 'Разделите мотив и способ' },
  'kirill-interrogation': { eyebrow: 'Ключевой допрос', title: 'Разрушьте алиби Кирилла' },
  'act4-search': { eyebrow: 'Акт IV · операция', title: 'Найдите Илью в служебной зоне' },
  'act4-card': { eyebrow: 'Акт IV · экспертиза', title: 'Проверьте карту 314-17' },
  'act4-report': { eyebrow: 'Финальный вывод', title: 'Определите ответственность участников' },
  complete: { eyebrow: 'Расследование завершено', title: 'Итоговый отчёт готов' }
};

function safeSessionGet(key: string): string | null {
  try { return sessionStorage.getItem(key); }
  catch { return null; }
}

function safeSessionSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); }
  catch { /* Session storage is optional. */ }
}

function safeSessionRemove(key: string): void {
  try { sessionStorage.removeItem(key); }
  catch { /* Session storage is optional. */ }
}

function readObject(key: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function clearCaseStorage(): void {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(CASE_PREFIX)) localStorage.removeItem(key);
  }
}

function hasProgress(state: InvestigationSnapshot): boolean {
  return state.core.phase !== 'home'
    || Boolean(state.core.startedAt)
    || state.derived.percent > 0;
}

function removeOverlay(): void {
  overlay?.remove();
  overlay = null;
  confirmingRestart = false;
  document.documentElement.classList.remove('commercial-launch-open');
}

function markGateSeen(): void {
  safeSessionSet(GATE_SEEN_KEY, '1');
}

function waitForStartButton(attempt = 0): void {
  const button = document.querySelector<HTMLButtonElement>('.premium-home .premium-cta');
  if (button) {
    button.click();
    return;
  }
  if (attempt >= 90) return;
  window.requestAnimationFrame(() => waitForStartButton(attempt + 1));
}

function beginCleanCase(): void {
  markGateSeen();
  removeOverlay();
  waitForStartButton();
}

function restartCase(autoStart = true): void {
  clearCaseStorage();
  if (autoStart) safeSessionSet(AUTO_START_KEY, '1');
  else safeSessionRemove(AUTO_START_KEY);

  const url = new URL(window.location.href);
  url.searchParams.set('fresh', '1');
  ['actorStudio', 'diagnostics', 'qa', 'fixture', 'debug'].forEach((key) => url.searchParams.delete(key));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function resetInterrogation(): void {
  localStorage.setItem(INTERROGATION_STORAGE_KEY, JSON.stringify({
    stage: 'calm',
    asked: [],
    presented: [],
    transcript: [],
    wrongConclusions: [],
    complete: false
  }));
}

function resetAct4(): void {
  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify({
    search: [],
    card: [],
    finalAnswer: null,
    wrongAnswers: [],
    complete: false,
    startedAt: null,
    completedAt: null
  }));
}

function repairSave(state: InvestigationSnapshot): void {
  const codes = new Set(state.derived.issues.map((issue) => issue.code));

  if (codes.has('ACT1_WITHOUT_EVIDENCE')) {
    const core = readObject(CORE_STORAGE_KEY);
    core.act1Complete = false;
    core.checkpointAnswerId = null;
    localStorage.setItem(CORE_STORAGE_KEY, JSON.stringify(core));
  }

  if (codes.has('ACT3_PREREQUISITES')) {
    const act3 = readObject(ACT3_STORAGE_KEY);
    act3.complete = false;
    act3.checkpointAnswer = null;
    localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(act3));
    resetInterrogation();
    resetAct4();
  } else if (codes.has('INTERROGATION_PREREQUISITES')) {
    resetInterrogation();
    resetAct4();
  } else if (codes.has('ACT4_PREREQUISITES')) {
    resetAct4();
  }

  if (codes.has('ACT4_INCOMPLETE_EVIDENCE')) {
    const act4 = readObject(ACT4_STORAGE_KEY);
    act4.complete = false;
    act4.finalAnswer = null;
    act4.completedAt = null;
    localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify(act4));
  }

  refreshInvestigationState('commercial-repair');
  window.location.reload();
}

function stageDescription(state: InvestigationSnapshot): string {
  if (state.derived.stage === 'complete') {
    return 'Дело раскрыто. Можно вернуться к итоговому отчёту или пройти расследование заново.';
  }
  if (state.core.phase === 'prologue') {
    return 'Вводная часть начата. Продолжите с последнего просмотренного эпизода.';
  }
  return 'Сохранение находится только на этом устройстве и обновляется после каждого действия.';
}

function renderOverlay(state: InvestigationSnapshot, force = false): void {
  if (INTERNAL_MODE) return;
  latest = state;

  const corrupt = state.derived.issues.length > 0;
  const progressed = hasProgress(state);
  const stage = STAGE_COPY[state.derived.stage];
  const complete = state.derived.stage === 'complete';
  const primaryLabel = corrupt
    ? 'Восстановить сохранение'
    : progressed
      ? complete ? 'Открыть итог дела' : 'Продолжить расследование'
      : 'Начать расследование';

  removeOverlay();
  overlay = document.createElement('div');
  overlay.className = `commercial-launch ${corrupt ? 'has-recovery' : ''}`;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Запуск дела Номер 314');
  overlay.innerHTML = `
    <div class="commercial-launch-backdrop"></div>
    <main class="commercial-launch-shell">
      <header class="commercial-launch-brand">
        <div class="commercial-launch-logo"><span>Д</span><span>Б</span><span>Р</span></div>
        <div><strong>Детективное бюро расследований</strong><small>Интерактивное дело №001</small></div>
        <span class="commercial-launch-rating">16+</span>
      </header>

      <section class="commercial-launch-copy">
        <p class="commercial-launch-kicker">НОМЕР 314 · ЗАКРЫТАЯ ЛОКАЦИЯ</p>
        <h1>Все лгут.<br><em>Но следы — нет.</em></h1>
        <p class="commercial-launch-lead">Журналист исчез из запертого гостиничного номера. Проверяйте улики, сопоставляйте показания и докажите версию, которая объясняет всё.</p>

        <div class="commercial-launch-features" aria-label="Особенности дела">
          <span><b>80–110</b> минут</span>
          <span><b>1–2</b> игрока</span>
          <span><b>11</b> материалов</span>
          <span><b>Без</b> регистрации</span>
        </div>

        <div class="commercial-launch-progress ${progressed ? 'visible' : ''}">
          <div class="commercial-launch-progress-copy">
            <div><small>${corrupt ? 'ТРЕБУЕТСЯ ВОССТАНОВЛЕНИЕ' : stage.eyebrow}</small><strong>${corrupt ? 'Найдена несогласованная контрольная точка' : stage.title}</strong></div>
            <b>${state.derived.percent}%</b>
          </div>
          <div class="commercial-launch-progress-track"><i style="width:${state.derived.percent}%"></i></div>
          <p>${corrupt ? 'Такое бывает после старых тестовых сборок. Восстановление откатит только противоречивый этап и сохранит корректно пройденную часть.' : stageDescription(state)}</p>
        </div>

        <div class="commercial-launch-actions">
          <button type="button" class="commercial-launch-primary" data-primary>${primaryLabel}<span>→</span></button>
          ${progressed ? '<button type="button" class="commercial-launch-secondary" data-restart>Начать заново</button>' : ''}
        </div>

        <div class="commercial-launch-confirm ${confirmingRestart ? 'visible' : ''}" aria-hidden="${confirmingRestart ? 'false' : 'true'}">
          <strong>Начать дело заново?</strong>
          <p>Текущий прогресс «Номера 314» будет удалён с этого устройства.</p>
          <div><button type="button" data-confirm-restart>Да, начать заново</button><button type="button" data-cancel-restart>Отмена</button></div>
        </div>
      </section>

      <aside class="commercial-launch-casecard">
        <div class="commercial-launch-casecode"><span>ДЕЛО</span><strong>001</strong><small>DBR / ROOM 314</small></div>
        <div class="commercial-launch-scene" aria-hidden="true">
          <div class="commercial-launch-door"><span>314</span><i></i></div>
          <div class="commercial-launch-corridor"></div>
          <div class="commercial-launch-tape">МЕСТО ИСЧЕЗНОВЕНИЯ · НЕ ВХОДИТЬ</div>
        </div>
        <dl>
          <div><dt>Последний контакт</dt><dd>00:17</dd></div>
          <div><dt>Обнаружено</dt><dd>07:14</dd></div>
          <div><dt>Главный вопрос</dt><dd>Как выйти, не открывая дверь?</dd></div>
        </dl>
      </aside>

      <footer class="commercial-launch-footer">
        <span>Прогресс сохраняется автоматически</span>
        <span>После первой загрузки дело доступно офлайн</span>
      </footer>
    </main>`;

  document.body.append(overlay);
  document.documentElement.classList.add('commercial-launch-open');

  overlay.querySelector<HTMLButtonElement>('[data-primary]')?.addEventListener('click', () => {
    if (corrupt) {
      repairSave(state);
      return;
    }
    markGateSeen();
    if (progressed) removeOverlay();
    else beginCleanCase();
  });

  overlay.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
    confirmingRestart = true;
    overlay?.querySelector('.commercial-launch-confirm')?.classList.add('visible');
    overlay?.querySelector('.commercial-launch-confirm')?.setAttribute('aria-hidden', 'false');
    overlay?.querySelector<HTMLButtonElement>('[data-confirm-restart]')?.focus();
  });

  overlay.querySelector<HTMLButtonElement>('[data-confirm-restart]')?.addEventListener('click', () => restartCase(true));
  overlay.querySelector<HTMLButtonElement>('[data-cancel-restart]')?.addEventListener('click', () => {
    confirmingRestart = false;
    overlay?.querySelector('.commercial-launch-confirm')?.classList.remove('visible');
    overlay?.querySelector('.commercial-launch-confirm')?.setAttribute('aria-hidden', 'true');
    overlay?.querySelector<HTMLButtonElement>('[data-restart]')?.focus();
  });

  window.requestAnimationFrame(() => overlay?.querySelector<HTMLButtonElement>('[data-primary]')?.focus());
}

function attachMediaFallbacks(): void {
  document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    if (image.dataset.dbrMediaGuard === 'true') return;
    image.dataset.dbrMediaGuard = 'true';

    const fail = () => {
      image.dataset.mediaFailed = 'true';
      image.parentElement?.setAttribute('data-media-fallback', 'true');
    };
    image.addEventListener('error', fail, { once: true });
    if (image.complete && image.naturalWidth === 0) fail();
  });
}

function enhanceCustomerUi(): void {
  if (INTERNAL_MODE) return;

  document.querySelectorAll<HTMLElement>('.premium-home-footer span').forEach((item) => {
    if (item.textContent?.includes('prototype')) item.textContent = 'Дело №001 · Номер 314';
  });

  const homeCta = document.querySelector<HTMLButtonElement>('.premium-home .premium-cta');
  if (homeCta && !homeCta.dataset.commercialLabel) {
    homeCta.dataset.commercialLabel = 'true';
    const svg = homeCta.querySelector('svg')?.outerHTML ?? '';
    homeCta.innerHTML = `Начать расследование ${svg}`;
  }

  const actionBar = document.querySelector<HTMLElement>('.premium-topbar .topbar-actions');
  if (actionBar && !actionBar.querySelector('[data-commercial-menu]')) {
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'premium-text-button commercial-menu-button';
    menu.dataset.commercialMenu = 'true';
    menu.textContent = 'Меню';
    menu.addEventListener('click', () => renderOverlay(getInvestigationState(), true));
    actionBar.prepend(menu);
  }

  const reset = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-topbar .premium-text-button'))
    .find((button) => button.textContent?.trim() === 'Сбросить' || button.textContent?.trim() === 'Новое дело');
  if (reset && !reset.dataset.commercialReset) {
    reset.dataset.commercialReset = 'true';
    reset.textContent = 'Новое дело';
    reset.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      renderOverlay(getInvestigationState(), true);
      confirmingRestart = true;
      overlay?.querySelector('.commercial-launch-confirm')?.classList.add('visible');
      overlay?.querySelector('.commercial-launch-confirm')?.setAttribute('aria-hidden', 'false');
      overlay?.querySelector<HTMLButtonElement>('[data-confirm-restart]')?.focus();
    }, true);
  }

  attachMediaFallbacks();
}

function autoStartAfterFresh(): boolean {
  if (safeSessionGet(AUTO_START_KEY) !== '1') return false;
  safeSessionRemove(AUTO_START_KEY);
  markGateSeen();
  waitForStartButton();
  return true;
}

export function mountCommercialLaunch(): void {
  if (INTERNAL_MODE) return;

  latest = getInvestigationState();
  enhanceCustomerUi();

  if (!autoStartAfterFresh() && safeSessionGet(GATE_SEEN_KEY) !== '1') {
    renderOverlay(latest);
  }

  subscribeInvestigationState((state) => {
    latest = state;
    if (overlay && !confirmingRestart) renderOverlay(state, true);
    enhanceCustomerUi();
  });

  window.addEventListener('dbr:runtime-settled', enhanceCustomerUi);
  window.addEventListener('pageshow', enhanceCustomerUi);
}
