import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  CORE_STORAGE_KEY,
  PREMIUM_STORAGE_PREFIX
} from './build';

export {};

type CoreProgress = {
  phase?: string;
  seenEvidenceIds?: string[];
  act1Complete?: boolean;
};

type Act2Progress = {
  plan?: string[];
  room?: string[];
  questions?: string[];
};

type Act3Progress = {
  archive?: string[];
  identity?: string[];
  questions?: string[];
  complete?: boolean;
};

type TargetTab = 'Дело' | 'Материалы' | 'Люди';

type NextStep = {
  eyebrow: string;
  title: string;
  description: string;
  tab: TargetTab;
  focusSelector?: string;
};

type InvestigationSnapshot = {
  inHeadquarters: boolean;
  act1Complete: boolean;
  act2Complete: boolean;
  act3Complete: boolean;
  planCount: number;
  roomCount: number;
  archiveCount: number;
  identityCount: number;
  act3QuestionCount: number;
  coreEvidenceCount: number;
  percent: number;
  next: NextStep;
};

const CORE_EVIDENCE_IDS = ['E001', 'E002', 'E003', 'E004', 'E005'];
const PLAN_IDS = ['wall', 'stamp', 'width'];
const ROOM_IDS = ['panel', 'tracks', 'envelope', 'fibres'];
const ARCHIVE_IDS = ['catalog', 'contact', 'audio', 'custody'];
const IDENTITY_IDS = ['registration', 'festival', 'message'];
const ACT3_QUESTION_IDS = ['d-original', 'v-name'];

let scheduled = false;
let announcementOpen = false;

function safeRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function countCompleted(source: string[] | undefined, required: string[]): number {
  const values = Array.isArray(source) ? source : [];
  return required.filter((id) => values.includes(id)).length;
}

function snapshot(): InvestigationSnapshot {
  const core = safeRead<CoreProgress>(CORE_STORAGE_KEY, {});
  const act2 = safeRead<Act2Progress>(ACT2_STORAGE_KEY, {});
  const act3 = safeRead<Act3Progress>(ACT3_STORAGE_KEY, {});

  const coreEvidenceCount = countCompleted(core.seenEvidenceIds, CORE_EVIDENCE_IDS);
  const planCount = countCompleted(act2.plan, PLAN_IDS);
  const roomCount = countCompleted(act2.room, ROOM_IDS);
  const archiveCount = countCompleted(act3.archive, ARCHIVE_IDS);
  const identityCount = countCompleted(act3.identity, IDENTITY_IDS);
  const act3QuestionCount = countCompleted(act3.questions, ACT3_QUESTION_IDS);

  const act1Complete = core.act1Complete === true;
  const act2Complete = roomCount === ROOM_IDS.length;
  const act3Complete = act3.complete === true;

  const completedUnits = coreEvidenceCount
    + (act1Complete ? 1 : 0)
    + planCount
    + roomCount
    + archiveCount
    + identityCount
    + act3QuestionCount
    + (act3Complete ? 1 : 0);
  const totalUnits = CORE_EVIDENCE_IDS.length + 1 + PLAN_IDS.length + ROOM_IDS.length
    + ARCHIVE_IDS.length + IDENTITY_IDS.length + ACT3_QUESTION_IDS.length + 1;
  const percent = Math.round((completedUnits / totalUnits) * 100);

  let next: NextStep;
  if (coreEvidenceCount < CORE_EVIDENCE_IDS.length) {
    next = {
      eyebrow: 'Акт I · следующий обязательный шаг',
      title: 'Завершить первичный сбор материалов',
      description: `Изучено ${coreEvidenceCount} из ${CORE_EVIDENCE_IDS.length} основных улик.`,
      tab: 'Материалы',
      focusSelector: '.premium-evidence-grid'
    };
  } else if (!act1Complete) {
    next = {
      eyebrow: 'Логический узел',
      title: 'Сдать промежуточный отчёт №1',
      description: 'Зафиксируйте способ проникновения, который объясняет дверь, окно, камеру и телефон.',
      tab: 'Дело',
      focusSelector: '.checkpoint-panel'
    };
  } else if (planCount < PLAN_IDS.length) {
    next = {
      eyebrow: 'Акт II · скрытый маршрут',
      title: 'Исследовать E006 — архивный план',
      description: `Найдено ${planCount} из ${PLAN_IDS.length} конструктивных несоответствий.`,
      tab: 'Материалы',
      focusSelector: '[data-evidence-id="E006"]'
    };
  } else if (!act2Complete) {
    next = {
      eyebrow: 'Акт II · скрытый маршрут',
      title: 'Завершить осмотр номера 312',
      description: `Проверено ${roomCount} из ${ROOM_IDS.length} зон E007.`,
      tab: 'Материалы',
      focusSelector: '[data-evidence-id="E007"]'
    };
  } else if (archiveCount < ARCHIVE_IDS.length) {
    next = {
      eyebrow: 'Акт III · происхождение доказательства',
      title: 'Восстановить цепочку карты 314-17',
      description: `Сопоставлено ${archiveCount} из ${ARCHIVE_IDS.length} документов E008.`,
      tab: 'Материалы',
      focusSelector: '[data-evidence-id="E008"]'
    };
  } else if (identityCount < IDENTITY_IDS.length) {
    next = {
      eyebrow: 'Акт III · проверка личности',
      title: 'Установить настоящее имя Елены',
      description: `Подтверждено ${identityCount} из ${IDENTITY_IDS.length} совпадений E009.`,
      tab: 'Материалы',
      focusSelector: '[data-evidence-id="E009"]'
    };
  } else if (act3QuestionCount < ACT3_QUESTION_IDS.length) {
    next = {
      eyebrow: 'Акт III · сверка показаний',
      title: 'Повторно допросить Дениса и Веру',
      description: 'Новые материалы открыли два вопроса, без которых нельзя отделить мотив от способа.',
      tab: 'Люди',
      focusSelector: '.premium-people-grid'
    };
  } else if (!act3Complete) {
    next = {
      eyebrow: 'Логический узел',
      title: 'Сдать промежуточный отчёт №2',
      description: 'Определите, чья ложь объясняет прошлое, а кто физически мог использовать проход через 312.',
      tab: 'Дело',
      focusSelector: '.act3-checkpoint'
    };
  } else {
    next = {
      eyebrow: 'Доступный фрагмент завершён',
      title: 'Все материалы актов I–III исследованы',
      description: 'Прогресс зафиксирован. Следующий содержательный этап — финальная операция и развязка дела.',
      tab: 'Дело',
      focusSelector: '.premium-dashboard'
    };
  }

  return {
    inHeadquarters: Boolean(document.querySelector('.premium-app .premium-workspace')),
    act1Complete,
    act2Complete,
    act3Complete,
    planCount,
    roomCount,
    archiveCount,
    identityCount,
    act3QuestionCount,
    coreEvidenceCount,
    percent,
    next
  };
}

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
    if (target instanceof HTMLButtonElement && !target.disabled) target.focus({ preventScroll: true });
  }, 180);
}

function renderRail(state: InvestigationSnapshot): void {
  let rail = document.querySelector<HTMLElement>('.premium-pass-rail');

  if (!state.inHeadquarters) {
    rail?.remove();
    return;
  }

  const topbar = document.querySelector<HTMLElement>('.premium-topbar');
  if (!topbar) return;

  if (!rail) {
    rail = document.createElement('section');
    rail.className = 'premium-pass-rail';
    rail.setAttribute('aria-label', 'Прогресс расследования');
    topbar.insertAdjacentElement('afterend', rail);
  }

  const act1Current = !state.act1Complete;
  const act2Current = state.act1Complete && !state.act2Complete;
  const act3Current = state.act2Complete && !state.act3Complete;
  const signature = [
    state.percent,
    state.act1Complete,
    state.act2Complete,
    state.act3Complete,
    state.next.title,
    state.next.description
  ].join('|');

  if (rail.dataset.signature === signature) return;
  rail.dataset.signature = signature;
  rail.innerHTML = `
    <div class="premium-pass-progress">
      <div class="premium-pass-progress-copy">
        <span>Ход расследования</span>
        <strong>${state.percent}%</strong>
      </div>
      <div class="premium-pass-progress-track" aria-hidden="true"><i style="width:${state.percent}%"></i></div>
    </div>
    <ol class="premium-pass-acts">
      <li class="${stageClass(state.act1Complete, act1Current)}"><span>${stageIcon(state.act1Complete, 1)}</span><div><small>Акт I</small><strong>Запертый номер</strong></div></li>
      <li class="${stageClass(state.act2Complete, act2Current)}"><span>${stageIcon(state.act2Complete, 2)}</span><div><small>Акт II</small><strong>Скрытый маршрут</strong></div></li>
      <li class="${stageClass(state.act3Complete, act3Current)}"><span>${stageIcon(state.act3Complete, 3)}</span><div><small>Акт III</small><strong>Архив и личность</strong></div></li>
    </ol>
    <button type="button" class="premium-pass-next" ${state.act3Complete ? 'data-complete="true"' : ''}>
      <span>${state.next.eyebrow}</span>
      <strong>${state.next.title}</strong>
      <small>${state.next.description}</small>
      <b aria-hidden="true">→</b>
    </button>`;

  rail.querySelector<HTMLButtonElement>('.premium-pass-next')?.addEventListener('click', () => goToStep(state.next));
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

function closeAnnouncement(): void {
  const overlay = document.querySelector<HTMLElement>('.premium-pass-announcement');
  if (!overlay) return;
  overlay.classList.add('leaving');
  window.setTimeout(() => {
    overlay.remove();
    announcementOpen = false;
  }, 260);
}

function showAnnouncement(act: 2 | 3): void {
  if (announcementOpen || document.querySelector('.premium-modal-backdrop')) return;
  announcementOpen = true;

  const data = act === 2
    ? {
        eyebrow: 'Новая глава расследования',
        title: 'Акт II открыт',
        subtitle: 'Скрытый маршрут',
        body: 'Обычные выходы исключены. Теперь дело переходит от цифровых журналов к архитектуре третьего этажа.',
        action: 'Перейти к архивному плану',
        step: {
          eyebrow: 'Акт II',
          title: 'Исследовать E006 — архивный план',
          description: 'Найдите скрытую связь между номерами 312 и 314.',
          tab: 'Материалы' as TargetTab,
          focusSelector: '[data-evidence-id="E006"]'
        }
      }
    : {
        eyebrow: 'Новая глава расследования',
        title: 'Акт III открыт',
        subtitle: 'Архив и личность',
        body: 'Маршрут подтверждён. Следующий вопрос — какое доказательство искали и почему участники скрывают прошлое.',
        action: 'Открыть архив фестиваля',
        step: {
          eyebrow: 'Акт III',
          title: 'Исследовать E008 — оригиналы фестиваля',
          description: 'Восстановите происхождение карты 314-17.',
          tab: 'Материалы' as TargetTab,
          focusSelector: '[data-evidence-id="E008"]'
        }
      };

  const overlay = document.createElement('div');
  overlay.className = 'premium-pass-announcement';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'premium-pass-announcement-title');
  overlay.innerHTML = `
    <div class="premium-pass-announcement-grid"></div>
    <section>
      <button type="button" class="premium-pass-announcement-close" aria-label="Закрыть">×</button>
      <div class="premium-pass-act-number">0${act}</div>
      <p>${data.eyebrow}</p>
      <h1 id="premium-pass-announcement-title">${data.title}</h1>
      <h2>${data.subtitle}</h2>
      <div class="premium-pass-announcement-line"></div>
      <span>${data.body}</span>
      <button type="button" class="premium-pass-announcement-action">${data.action} <b>→</b></button>
    </section>`;

  overlay.addEventListener('mousedown', (event) => {
    if (event.target === overlay) closeAnnouncement();
  });
  overlay.querySelector('.premium-pass-announcement-close')?.addEventListener('click', closeAnnouncement);
  overlay.querySelector('.premium-pass-announcement-action')?.addEventListener('click', () => {
    closeAnnouncement();
    goToStep(data.step);
  });
  document.body.append(overlay);
  overlay.querySelector<HTMLButtonElement>('.premium-pass-announcement-action')?.focus();
}

function maybeAnnounce(state: InvestigationSnapshot): void {
  if (!state.inHeadquarters || announcementOpen) return;

  const act2Key = `${PREMIUM_STORAGE_PREFIX}announced-act2`;
  const act3Key = `${PREMIUM_STORAGE_PREFIX}announced-act3`;

  if (state.act2Complete && localStorage.getItem(act3Key) !== '1') {
    localStorage.setItem(act2Key, '1');
    localStorage.setItem(act3Key, '1');
    window.setTimeout(() => showAnnouncement(3), 420);
    return;
  }

  if (state.act1Complete && localStorage.getItem(act2Key) !== '1') {
    localStorage.setItem(act2Key, '1');
    window.setTimeout(() => showAnnouncement(2), 420);
  }
}

function render(): void {
  const state = snapshot();
  renderRail(state);
  enhanceEvidenceCards();
  maybeAnnounce(state);
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    render();
  });
}

const observer = new MutationObserver(schedule);
observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('click', () => {
  window.setTimeout(schedule, 80);
  window.setTimeout(schedule, 360);
}, true);
window.addEventListener('storage', schedule);
window.addEventListener('pageshow', schedule);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && announcementOpen) closeAnnouncement();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
} else {
  schedule();
}
