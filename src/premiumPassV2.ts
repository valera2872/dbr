import {
  getInvestigationState,
  scheduleInvestigationRefresh,
  subscribeInvestigationState,
  type InvestigationSnapshot,
  type RouteStage
} from './investigationState';

export {};

type TargetTab = 'Дело' | 'Материалы' | 'Люди';

type NextStep = {
  eyebrow: string;
  title: string;
  description: string;
  tab: TargetTab;
  focusSelector?: string;
};

const NEXT_STEPS: Record<RouteStage, (state: InvestigationSnapshot) => NextStep> = {
  'act1-evidence': (state) => ({
    eyebrow: 'Акт I · следующий обязательный шаг',
    title: 'Завершить первичный сбор материалов',
    description: `Изучено ${state.derived.coreEvidenceCount} из 5 основных улик.`,
    tab: 'Материалы',
    focusSelector: '.premium-evidence-grid'
  }),
  'act1-report': () => ({
    eyebrow: 'Логический узел',
    title: 'Сдать промежуточный отчёт №1',
    description: 'Объясните, почему дверь, окно и коридорная камера не показывают путь исчезновения.',
    tab: 'Дело',
    focusSelector: '.checkpoint-panel'
  }),
  'act2-plan': (state) => ({
    eyebrow: 'Акт II · скрытый маршрут',
    title: 'Исследовать E006 — архивный план',
    description: `Найдено ${state.derived.planCount} из 3 конструктивных несоответствий.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E006"]'
  }),
  'act2-room': (state) => ({
    eyebrow: 'Акт II · номер 312',
    title: 'Завершить осмотр E007',
    description: `Проверено ${state.derived.roomCount} из 4 зон соседнего номера.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E007"]'
  }),
  'act3-archive': (state) => ({
    eyebrow: 'Акт III · происхождение доказательства',
    title: 'Восстановить цепочку карты 314-17',
    description: `Сопоставлено ${state.derived.archiveCount} из 4 архивных документов.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E008"]'
  }),
  'act3-identity': (state) => ({
    eyebrow: 'Акт III · проверка личности',
    title: 'Установить настоящее имя Елены',
    description: `Подтверждено ${state.derived.identityCount} из 3 совпадений.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E009"]'
  }),
  'act3-interviews': (state) => ({
    eyebrow: 'Акт III · сверка показаний',
    title: 'Повторно допросить Дениса и Веру',
    description: `Получено ${state.derived.act3QuestionCount} из 2 обязательных объяснений.`,
    tab: 'Люди',
    focusSelector: '.premium-people-grid'
  }),
  'act3-report': () => ({
    eyebrow: 'Логический узел',
    title: 'Сдать промежуточный отчёт №2',
    description: 'Отделите ложь о прошлом от человека, использовавшего проход через 312.',
    tab: 'Дело',
    focusSelector: '.act3-checkpoint-panel'
  }),
  'kirill-interrogation': () => ({
    eyebrow: 'Ключевой допрос',
    title: 'Разрушить коридорное алиби Кирилла',
    description: 'Зафиксируйте алиби, предъявите маршрут и сформулируйте точное противоречие.',
    tab: 'Люди',
    focusSelector: '.premium-people-grid'
  }),
  'act4-search': (state) => ({
    eyebrow: 'Акт IV · спасательная операция',
    title: 'Осмотреть E010 — служебную комнату',
    description: `Проверено ${state.derived.searchCount} из 4 зон поиска Ильи.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E010"]'
  }),
  'act4-card': (state) => ({
    eyebrow: 'Акт IV · решающее доказательство',
    title: 'Проверить E011 — карту 314-17',
    description: `Завершено ${state.derived.cardCount} из 4 проверок оригинала.`,
    tab: 'Материалы',
    focusSelector: '[data-evidence-id="E011"]'
  }),
  'act4-report': () => ({
    eyebrow: 'Финальный логический узел',
    title: 'Сдать окончательный отчёт',
    description: 'Разделите нападение, сокрытие пострадавшего и старый мотив.',
    tab: 'Дело',
    focusSelector: '.act4-final-panel'
  }),
  complete: () => ({
    eyebrow: 'Дело №001 закрыто',
    title: 'Открыть итог расследования',
    description: 'Все E001–E011 изучены, ответственность установлена.',
    tab: 'Дело',
    focusSelector: '.act4-final-panel'
  })
};

let scheduled = false;
let latestState = getInvestigationState();

function stageClass(complete: boolean, current: boolean): string {
  if (complete) return 'complete';
  if (current) return 'current';
  return 'locked';
}

function stageIcon(complete: boolean, index: number): string {
  return complete ? '✓' : String(index).padStart(2, '0');
}

function goToStep(step: NextStep): void {
  const navigation = Array.from(document.querySelectorAll<HTMLButtonElement>(
    '.premium-sidebar button, .premium-mobile-nav button'
  ));
  navigation.find((button) => button.textContent?.includes(step.tab))?.click();

  window.setTimeout(() => {
    const target = step.focusSelector ? document.querySelector<HTMLElement>(step.focusSelector) : null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target instanceof HTMLButtonElement && !target.disabled) {
      target.focus({ preventScroll: true });
    }
  }, 180);
}

function enhanceEvidenceCards(): void {
  document.querySelectorAll<HTMLButtonElement>('.premium-evidence-card').forEach((card) => {
    const status = card.querySelector('.premium-pill')?.textContent ?? '';
    card.classList.toggle('premium-pass-new', !card.disabled && status.includes('Новое'));
    card.classList.toggle('premium-pass-complete', status.includes('Изучено'));
    if (card.disabled) {
      card.setAttribute('aria-disabled', 'true');
      if (!card.title) card.title = 'Сначала завершите предыдущий обязательный шаг расследования';
    } else {
      card.removeAttribute('aria-disabled');
    }
  });
}

function renderRail(state: InvestigationSnapshot): void {
  let rail = document.querySelector<HTMLElement>('.premium-pass-rail');
  const topbar = document.querySelector<HTMLElement>('.premium-topbar');
  const inHeadquarters = Boolean(document.querySelector('.premium-app .premium-workspace'));

  if (!inHeadquarters || !topbar) {
    rail?.remove();
    return;
  }

  if (!rail) {
    rail = document.createElement('section');
    rail.className = 'premium-pass-rail premium-pass-v2';
    rail.setAttribute('aria-label', 'Прогресс расследования');
    topbar.insertAdjacentElement('afterend', rail);
  }

  const next = NEXT_STEPS[state.derived.stage](state);
  const currentAct = state.derived.stage.startsWith('act1') ? 1
    : state.derived.stage.startsWith('act2') ? 2
      : state.derived.stage.startsWith('act3') || state.derived.stage === 'kirill-interrogation' ? 3
        : 4;
  const act1Complete = state.derived.act1Complete;
  const act2Complete = state.derived.act2Complete;
  const act3Complete = state.derived.interrogationComplete;
  const act4Complete = state.derived.act4Complete;
  const issueCount = state.derived.issues.length;

  const signature = [
    state.derived.percent,
    state.derived.stage,
    act1Complete,
    act2Complete,
    act3Complete,
    act4Complete,
    issueCount,
    next.title,
    next.description
  ].join('|');
  if (rail.dataset.signature === signature) return;
  rail.dataset.signature = signature;

  rail.innerHTML = `
    <div class="premium-pass-progress">
      <div class="premium-pass-progress-copy">
        <span>Ход расследования${issueCount ? ` · проверка: ${issueCount}` : ''}</span>
        <strong>${state.derived.percent}%</strong>
      </div>
      <div class="premium-pass-progress-track" aria-hidden="true"><i style="width:${state.derived.percent}%"></i></div>
    </div>
    <ol class="premium-pass-acts has-act4">
      <li class="${stageClass(act1Complete, currentAct === 1)}"><span>${stageIcon(act1Complete, 1)}</span><div><small>Акт I</small><strong>Запертый номер</strong></div></li>
      <li class="${stageClass(act2Complete, currentAct === 2)}"><span>${stageIcon(act2Complete, 2)}</span><div><small>Акт II</small><strong>Скрытый маршрут</strong></div></li>
      <li class="${stageClass(act3Complete, currentAct === 3)}"><span>${stageIcon(act3Complete, 3)}</span><div><small>Акт III</small><strong>Архив и допрос</strong></div></li>
      <li class="${stageClass(act4Complete, currentAct === 4)}"><span>${stageIcon(act4Complete, 4)}</span><div><small>Акт IV</small><strong>Финальная операция</strong></div></li>
    </ol>
    <button type="button" class="premium-pass-next" ${act4Complete ? 'data-complete="true"' : ''}>
      <span>${next.eyebrow}</span>
      <strong>${next.title}</strong>
      <small>${next.description}</small>
      <b aria-hidden="true">→</b>
    </button>`;

  rail.querySelector<HTMLButtonElement>('.premium-pass-next')?.addEventListener('click', () => goToStep(next));
}

function render(): void {
  scheduled = false;
  renderRail(latestState);
  enhanceEvidenceCards();
}

function scheduleRender(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(render);
}

subscribeInvestigationState((state) => {
  latestState = state;
  scheduleRender();
});

window.addEventListener('dbr:runtime-settled', scheduleRender);
window.addEventListener('pageshow', () => {
  scheduleInvestigationRefresh('premium-pass-pageshow');
  scheduleRender();
});
document.addEventListener('click', () => window.setTimeout(scheduleRender, 0), true);

scheduleRender();
