import { ACT2_STORAGE_KEY } from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const CHECK_WINDOW = 'agency:window';
const CHECK_LOCK = 'agency:lock';
const CHECK_WALL = 'agency:wall';
const CHECK_RENOVATION = 'agency:renovation';
const PLAN_REQUESTED = 'agency:plan-requested';

let installed = false;
let scheduled = false;
let latestState: InvestigationSnapshot | null = null;

function has(state: InvestigationSnapshot, marker: string): boolean {
  return state.act2.questions.includes(marker);
}

function planRequested(state: InvestigationSnapshot): boolean {
  return has(state, PLAN_REQUESTED) || state.derived.planCount > 0;
}

function leadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.core.act1Complete
    && state.derived.planCount === 0
    && !has(state, PLAN_REQUESTED);
}

function planReceived(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.core.act1Complete
    && state.derived.planCount === 0
    && has(state, PLAN_REQUESTED);
}

function unique(values: string[], marker: string): string[] {
  return values.includes(marker) ? values : [...values, marker];
}

function readAct2(): { plan: string[]; room: string[]; questions: string[] } {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT2_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    return {
      plan: Array.isArray(raw.plan) ? raw.plan.filter((item): item is string => typeof item === 'string') : [],
      room: Array.isArray(raw.room) ? raw.room.filter((item): item is string => typeof item === 'string') : [],
      questions: Array.isArray(raw.questions) ? raw.questions.filter((item): item is string => typeof item === 'string') : []
    };
  } catch {
    return { plan: [], room: [], questions: [] };
  }
}

function record(marker: string): void {
  const current = readAct2();
  const next = { ...current, questions: unique(current.questions, marker) };
  localStorage.setItem(ACT2_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act2-updated', { detail: { agency: marker } }));
  refreshInvestigationState(`investigation-agency:${marker}`);
  scheduleApply(`investigation-agency:${marker}`);
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  const target = buttons.find((button) => button.textContent?.includes(label) && window.getComputedStyle(button).display !== 'none');
  target?.click();
}

function rewriteTextNode(button: HTMLButtonElement, value: string): void {
  const textNode = Array.from(button.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.textContent = value;
}

function softenCheckpoint(): void {
  const panel = document.querySelector<HTMLElement>('.checkpoint-panel');
  if (!panel) return;

  const correct = Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.includes('Другой человек проник в номер и вывел Илью')
      || button.dataset.agencyCheckpoint === '1'
  );
  if (correct) {
    correct.dataset.agencyCheckpoint = '1';
    rewriteTextNode(correct, ' Известные пути выхода не объясняют исчезновение: в картине событий отсутствует ещё один способ перемещения.');
  }

  const success = panel.querySelector<HTMLElement>('.premium-feedback.success p');
  if (success) {
    success.textContent = 'Дверь и окно исключены, а физические и цифровые следы противоречат версии добровольного ухода. Теперь следствию нужно самостоятельно проверить, чего не хватает в известной картине событий.';
  }
}

function neutralizeDashboard(state: InvestigationSnapshot): void {
  if (!leadActive(state)) return;
  const hero = document.querySelector<HTMLElement>('.premium-dashboard .dashboard-hero');
  if (hero) {
    const kicker = hero.querySelector<HTMLElement>('.premium-kicker');
    const title = hero.querySelector<HTMLElement>('h1');
    const body = hero.querySelector<HTMLElement>('p:not(.premium-kicker)');
    if (kicker) kicker.textContent = 'Рабочая задача';
    if (title) title.textContent = 'Чего не хватает в картине исчезновения?';
    if (body) body.textContent = 'Дверь и окно исключены. Камера не показывает выхода. Выберите, какие следственные проверки помогут проверить оставшиеся версии.';
  }

  const next = document.querySelector<HTMLElement>('.react-next-action');
  if (next) next.style.display = 'none';
}

function neutralizeGuidance(state: InvestigationSnapshot): void {
  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  if (!guide) return;

  const active = leadActive(state);
  guide.dataset.investigationAgency = active ? 'lead' : planReceived(state) ? 'received' : 'off';
  if (!active) return;

  const small = guide.querySelector<HTMLElement>('.player-guide-floating-copy > small');
  const strong = guide.querySelector<HTMLElement>('.player-guide-floating-copy > strong');
  const paragraph = guide.querySelector<HTMLElement>('.player-guide-floating-copy > p');
  const progress = guide.querySelector<HTMLElement>('.player-guide-floating-copy > span');
  const next = guide.querySelector<HTMLButtonElement>('.player-guide-next');
  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');

  const checks = [CHECK_WINDOW, CHECK_LOCK, CHECK_WALL, CHECK_RENOVATION].filter((marker) => has(state, marker)).length;
  if (small) small.textContent = 'Рабочая гипотеза';
  if (strong) strong.textContent = 'Известные пути не объясняют исчезновение';
  if (paragraph) paragraph.textContent = 'Игра не указывает правильное направление. Решите сами, что разумно проверить.';
  if (progress) progress.textContent = `Проверок выполнено: ${checks}/4`;
  if (next) {
    next.disabled = true;
    next.setAttribute('aria-label', 'Следующее действие выбирает следователь');
    const nextSmall = next.querySelector<HTMLElement>('small');
    const nextStrong = next.querySelector<HTMLElement>('strong');
    const arrow = next.querySelector<HTMLElement>('b');
    if (nextSmall) nextSmall.textContent = 'Ваш ход';
    if (nextStrong) nextStrong.textContent = 'Выберите проверку самостоятельно';
    if (arrow) arrow.textContent = '·';
  }
  if (explain) explain.style.display = 'none';
}

function restoreGuidance(state: InvestigationSnapshot): void {
  if (leadActive(state)) return;
  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  if (!guide) return;
  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');
  if (explain) explain.style.display = '';
  const next = guide.querySelector<HTMLButtonElement>('.player-guide-next');
  if (next) next.disabled = false;
}

function gatePlanCard(state: InvestigationSnapshot): void {
  const card = document.querySelector<HTMLButtonElement>('[data-evidence-id="E006"]');
  if (!card) return;

  const available = planRequested(state);
  card.dataset.agencyPlanAvailable = available ? '1' : '0';
  card.hidden = !available;
  card.style.display = available ? '' : 'none';
  card.disabled = !available;

  if (available) {
    const summary = card.querySelector<HTMLElement>('.evidence-card-copy p');
    if (summary) summary.textContent = 'Обмерный план третьего этажа до реконструкции. Сопоставьте его с современной схемой.';
  }
}

function softenPlanModal(): void {
  const modal = document.querySelector<HTMLElement>('.react-case-modal.evidence-e006');
  if (!modal) return;
  const summary = modal.querySelector<HTMLElement>('.premium-modal-header > div > p:last-of-type');
  if (summary) summary.textContent = 'Архивный лист до реконструкции. Сопоставьте его с нынешней схемой и отметьте значимые расхождения.';

  const finding = modal.querySelector<HTMLElement>('.react-finding.success');
  if (finding) {
    const title = finding.querySelector<HTMLElement>('h3');
    const body = finding.querySelector<HTMLElement>('p:last-child');
    if (title) title.textContent = 'До реконструкции здесь был служебный проём';
    if (body) body.textContent = 'Между 312 и 314 существовал технический проём. В архиве нет окончательного акта его полной заделки — теперь это нужно проверить на месте.';
  }
}

function resultCopy(marker: string): string {
  switch (marker) {
    case CHECK_WINDOW:
      return 'Снег под окном и наружный подоконник нетронуты. Версия выхода через окно окончательно исключена; нового маршрута эта проверка не дала.';
    case CHECK_LOCK:
      return 'Расширенный журнал контроллера и мастер-карт непрерывен. Служебных открытий двери 314 после 23:50 нет.';
    case CHECK_WALL:
      return 'Полосы на ковре заканчиваются у шкафа. Декоративная панель у общей стены выглядит новее основной отделки, но видимого проёма из 314 нет.';
    case CHECK_RENOVATION:
      return 'Марина: «Третий этаж перестраивали после фестиваля 2015 года. Нынешняя схема — уже после реконструкции». Старые обмеры хранятся отдельно.';
    default:
      return '';
  }
}

function actionCard(state: InvestigationSnapshot, marker: string, title: string, subtitle: string): string {
  const done = has(state, marker);
  return `<button type="button" class="agency-action ${done ? 'done' : ''}" data-agency-action="${marker}" ${done ? 'disabled' : ''}>
    <span>${done ? '✓' : '○'}</span><div><strong>${title}</strong><small>${done ? resultCopy(marker) : subtitle}</small></div>
  </button>`;
}

function leadMarkup(state: InvestigationSnapshot): string {
  const breakthrough = has(state, CHECK_WALL) && has(state, CHECK_RENOVATION);
  return `<section class="investigation-agency-panel" data-agency-mode="lead" aria-label="Самостоятельное следственное решение">
    <header><div><p>Следственное решение</p><h2>Известные пути не объясняют исчезновение</h2></div><span>Ваш ход</span></header>
    <p class="agency-lead">Дверь не открывалась, окно не использовалось, камера не показывает выхода. В номере есть следы перемещения к шкафу. Выберите проверки, которые считаете разумными. <strong>Не каждая обязана дать новую улику.</strong></p>
    <div class="agency-actions">
      ${actionCard(state, CHECK_WINDOW, 'Перепроверить окно снаружи', 'Проверить снег, подоконник и возможность спуска.')}
      ${actionCard(state, CHECK_LOCK, 'Запросить расширенный журнал замка', 'Проверить мастер-карты и служебные события контроллера.')}
      ${actionCard(state, CHECK_WALL, 'Повторно осмотреть шкаф и общую стену', 'Проверить, куда именно заканчиваются следы на ковре.')}
      ${actionCard(state, CHECK_RENOVATION, 'Уточнить историю ремонтов этажа', 'Спросить управляющую, менялась ли конструкция третьего этажа.')}
    </div>
    ${breakthrough ? `<div class="agency-breakthrough"><p>Новая зацепка</p><h3>Следы упираются в стену, которая пережила реконструкцию</h3><span>Современная схема может не отражать прежнюю конструкцию. Теперь есть основание проверить старую документацию — это вывод из найденных фактов, а не подсказка игры.</span><button type="button" data-agency-action="${PLAN_REQUESTED}">Запросить обмерный план до реконструкции →</button></div>` : '<div class="agency-waiting">Сопоставляйте результаты проверок. Новое действие появится только когда факты дадут для него основание.</div>'}
  </section>`;
}

function receivedMarkup(): string {
  return `<section class="investigation-agency-panel" data-agency-mode="received" aria-label="Получен новый материал">
    <header><div><p>Ответ на запрос</p><h2>Архив прислал обмерный план 2004 года</h2></div><span>Новый материал</span></header>
    <p class="agency-lead">Вы сами вышли на старую документацию через две зацепки: следы у общей стены и подтверждённую реконструкцию этажа. План добавлен в раздел «Материалы».</p>
    <button type="button" class="agency-open-materials" data-agency-action="open-materials">Перейти к полученному материалу →</button>
  </section>`;
}

function renderPanel(state: InvestigationSnapshot): void {
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  const existing = document.querySelector<HTMLElement>('.investigation-agency-panel');

  if (!dashboard || (!leadActive(state) && !planReceived(state))) {
    existing?.remove();
    return;
  }

  const mode = leadActive(state) ? 'lead' : 'received';
  const signature = `${mode}:${state.act2.questions.join('|')}`;
  if (existing?.dataset.signature === signature) return;

  existing?.remove();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = leadActive(state) ? leadMarkup(state) : receivedMarkup();
  const panel = wrapper.firstElementChild as HTMLElement | null;
  if (!panel) return;
  panel.dataset.signature = signature;

  const hero = dashboard.querySelector('.dashboard-hero');
  if (hero?.parentElement) hero.insertAdjacentElement('afterend', panel);
  else dashboard.prepend(panel);
}

function apply(state = latestState ?? refreshInvestigationState('investigation-agency:apply')): void {
  latestState = state;
  softenCheckpoint();
  neutralizeDashboard(state);
  neutralizeGuidance(state);
  restoreGuidance(state);
  gatePlanCard(state);
  renderPanel(state);
  softenPlanModal();
  document.documentElement.dataset.dbrInvestigationAgency = leadActive(state) ? 'lead' : planReceived(state) ? 'received' : 'off';
}

function scheduleApply(reason = 'investigation-agency:scheduled'): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    const state = refreshInvestigationState(reason);
    apply(state);
    window.requestAnimationFrame(() => apply(refreshInvestigationState(`${reason}:settled`)));
  });
}

function handleAction(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-agency-action]') : null;
  if (!target) return;
  const action = target.dataset.agencyAction;
  if (!action) return;

  if (action === 'open-materials') {
    clickTab('Материалы');
    scheduleApply('investigation-agency:open-materials');
    return;
  }

  const state = refreshInvestigationState('investigation-agency:before-action');
  if (action === PLAN_REQUESTED && !(has(state, CHECK_WALL) && has(state, CHECK_RENOVATION))) return;
  if ([CHECK_WINDOW, CHECK_LOCK, CHECK_WALL, CHECK_RENOVATION, PLAN_REQUESTED].includes(action)) record(action);
}

export function installInvestigationAgency(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => {
    latestState = state;
    scheduleApply('investigation-agency:state');
  });

  document.addEventListener('click', handleAction);
  document.addEventListener('click', () => scheduleApply('investigation-agency:click'), true);
  window.addEventListener('pageshow', () => scheduleApply('investigation-agency:pageshow'));
  window.addEventListener('dbr:runtime-settled', () => scheduleApply('investigation-agency:runtime'));
  window.addEventListener('dbr:act2-updated', () => scheduleApply('investigation-agency:act2'));

  scheduleApply('investigation-agency:install');
}
