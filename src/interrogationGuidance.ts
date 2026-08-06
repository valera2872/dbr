import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  CORE_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';

export {};

type CoreState = {
  act1Complete?: boolean;
};

type Act2State = {
  plan?: string[];
  room?: string[];
};

type Act3State = {
  archive?: string[];
};

type InterrogationState = {
  asked?: string[];
  presented?: string[];
  complete?: boolean;
};

type GuideRoute = 'case' | 'materials' | 'evidence' | 'contradiction';

const QUESTION_IDS = ['alibi', 'passage', 'anton'];
const SOURCE_BY_EVIDENCE: Record<string, string> = {
  plan: 'E006',
  panel: 'E007',
  tracks: 'E007',
  fibres: 'E007',
  audio: 'E008',
  card: 'E008'
};

let scheduled = false;

function readJson<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
  } catch {
    return {} as T;
  }
}

function afterReact(callback: () => void): void {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

function visibleTab(label: string): HTMLButtonElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button')
  ).find((button) => button.textContent?.includes(label) && button.getClientRects().length > 0);
}

function evidenceProgress(act2: Act2State, act3: Act3State) {
  const plan = ['wall', 'stamp', 'width'].every((id) => act2.plan?.includes(id));
  const panel = Boolean(act2.room?.includes('panel'));
  const routeTrace = Boolean(act2.room?.includes('tracks') || act2.room?.includes('fibres'));
  const audio = Boolean(act3.archive?.includes('audio'));

  return {
    plan,
    panel,
    routeTrace,
    audio,
    found: [plan, panel, routeTrace, audio].filter(Boolean).length
  };
}

function nextMissingEvidence(progress: ReturnType<typeof evidenceProgress>): string {
  if (!progress.plan) return 'E006 — архивный план этажа';
  if (!progress.panel || !progress.routeTrace) return 'E007 — осмотр номера 312';
  if (!progress.audio) return 'E008 — архивная запись Антона';
  return 'материалы собраны';
}

function nextPresentation(presented: string[]): { id: string; label: string } | null {
  if (!presented.includes('plan')) return { id: 'plan', label: 'E006 — архивный план' };
  if (!presented.includes('panel')) return { id: 'panel', label: 'E007-A — свежие винты панели' };
  if (!presented.includes('tracks') && !presented.includes('fibres')) {
    return { id: 'tracks', label: 'E007-B или E007-C — физический след маршрута' };
  }
  if (!presented.includes('audio')) return { id: 'audio', label: 'E008-C — запись разговора Антона' };
  return null;
}

function phaseMarkup(
  questionsDone: number,
  foundEvidence: number,
  ready: boolean,
  complete: boolean
): string {
  const questionState = questionsDone === 3 ? 'done' : 'active';
  const evidenceState = complete || ready ? 'done' : questionsDone === 3 ? 'active' : 'locked';
  const contradictionState = complete ? 'done' : ready ? 'active' : 'locked';

  return `
    <ol class="interrogation-guide-steps" aria-label="Путь допроса">
      <li class="${questionState}"><span>1</span><div><small>Сначала</small><strong>Зафиксировать версию</strong><em>${questionsDone}/3 вопроса</em></div></li>
      <li class="${evidenceState}"><span>2</span><div><small>Затем</small><strong>Собрать и предъявить улики</strong><em>${foundEvidence}/4 опорных факта</em></div></li>
      <li class="${contradictionState}"><span>3</span><div><small>Финал допроса</small><strong>Разрушить алиби</strong><em>${complete ? 'выполнено' : ready ? 'доступно' : 'заблокировано'}</em></div></li>
    </ol>`;
}

function guidanceCopy(
  core: CoreState,
  questionsDone: number,
  evidence: ReturnType<typeof evidenceProgress>,
  interrogation: InterrogationState
): { kicker: string; title: string; body: string; route?: GuideRoute; button?: string; targetEvidence?: string } {
  const presented = interrogation.presented ?? [];
  const ready = (interrogation.asked ?? []).includes('alibi')
    && presented.includes('plan')
    && presented.includes('panel')
    && (presented.includes('tracks') || presented.includes('fibres'))
    && presented.includes('audio');

  if (interrogation.complete) {
    return {
      kicker: 'Допрос завершён',
      title: 'Кирилл указал новое место поиска',
      body: 'Закройте протокол и переходите к материалам: теперь открывается спасательная операция E010.',
      route: 'materials',
      button: 'Перейти к спасательной операции E010 →'
    };
  }

  if (questionsDone < 3) {
    return {
      kicker: 'Этап 1 из 3',
      title: 'Сначала зафиксируйте версию Кирилла',
      body: `Задайте оставшиеся вопросы: ${3 - questionsDone}. Сейчас вы только закрепляете его алиби; доказательства понадобятся позже.`
    };
  }

  if (!core.act1Complete) {
    return {
      kicker: 'Вопросы закончены',
      title: 'Сейчас допрос нужно приостановить',
      body: 'Ответы Кирилла сохранены. Следующий шаг — закрыть допрос и сформулировать промежуточный отчёт №1. После правильного вывода откроются материалы о скрытом маршруте.',
      route: 'case',
      button: 'Закрыть допрос и открыть отчёт №1 →'
    };
  }

  if (evidence.found < 4) {
    return {
      kicker: 'Этап 2 из 3',
      title: 'Одних ответов недостаточно',
      body: `Вернитесь в материалы и продолжите расследование. Следующая цель: ${nextMissingEvidence(evidence)}. Уже найдено опорных фактов: ${evidence.found}/4.`,
      route: 'materials',
      button: 'Закрыть допрос и перейти к материалам →'
    };
  }

  if (!ready) {
    const next = nextPresentation(presented);
    return {
      kicker: 'Материалы найдены',
      title: 'Теперь предъявляйте их как логическую цепочку',
      body: next
        ? `Следующая улика: ${next.label}. Порядок важен: план → панель → физический след → запись Антона.`
        : 'Основная цепочка предъявлена. Перейдите к фиксации противоречия.',
      route: next ? 'evidence' : 'contradiction',
      button: next ? 'Показать следующую улику →' : 'Перейти к противоречию →',
      targetEvidence: next?.id
    };
  }

  return {
    kicker: 'Этап 3 из 3',
    title: 'Логическая цепочка собрана',
    body: 'Теперь выберите вывод, который связывает алиби, скрытый маршрут и физические следы этой ночи.',
    route: 'contradiction',
    button: 'Зафиксировать противоречие →'
  };
}

function annotateEvidence(core: CoreState): void {
  const title = document.querySelector<HTMLElement>('.interrogation-control-title small');
  if (title) {
    title.textContent = core.act1Complete
      ? 'Недоступные улики показывают, в каком материале их найти'
      : 'Улики откроются после промежуточного отчёта №1';
  }

  document.querySelectorAll<HTMLButtonElement>('.interrogation-evidence').forEach((button) => {
    const id = button.dataset.present;
    const status = button.querySelector<HTMLElement>('i');
    if (!id || !status || !button.disabled || button.classList.contains('presented')) return;

    if (!core.act1Complete) {
      status.textContent = 'После отчёта №1';
      button.title = 'Сначала завершите промежуточный отчёт №1.';
      return;
    }

    const source = SOURCE_BY_EVIDENCE[id];
    if (source) {
      status.textContent = `Найти в ${source}`;
      button.title = `Сначала исследуйте материал ${source}.`;
    }
  });
}

function renderGuidance(): void {
  scheduled = false;
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  if (!shell) return;

  const core = readJson<CoreState>(CORE_STORAGE_KEY);
  const act2 = readJson<Act2State>(ACT2_STORAGE_KEY);
  const act3 = readJson<Act3State>(ACT3_STORAGE_KEY);
  const interrogation = readJson<InterrogationState>(INTERROGATION_STORAGE_KEY);
  const questionsDone = QUESTION_IDS.filter((id) => interrogation.asked?.includes(id)).length;
  const evidence = evidenceProgress(act2, act3);
  const presented = interrogation.presented ?? [];
  const ready = (interrogation.asked ?? []).includes('alibi')
    && presented.includes('plan')
    && presented.includes('panel')
    && (presented.includes('tracks') || presented.includes('fibres'))
    && presented.includes('audio');
  const copy = guidanceCopy(core, questionsDone, evidence, interrogation);

  let guide = shell.querySelector<HTMLElement>('.interrogation-guide');
  if (!guide) {
    guide = document.createElement('section');
    guide.className = 'interrogation-guide';
    shell.querySelector('.interrogation-header')?.after(guide);
  }

  shell.classList.add('has-interrogation-guide');
  const signature = JSON.stringify({
    act1Complete: core.act1Complete === true,
    questionsDone,
    foundEvidence: evidence.found,
    presented: [...presented].sort(),
    ready,
    complete: interrogation.complete === true,
    kicker: copy.kicker,
    title: copy.title,
    body: copy.body,
    route: copy.route ?? '',
    button: copy.button ?? '',
    targetEvidence: copy.targetEvidence ?? ''
  });

  if (guide.dataset.guideSignature !== signature) {
    guide.innerHTML = `
      ${phaseMarkup(questionsDone, evidence.found, ready, interrogation.complete === true)}
      <div class="interrogation-guide-action">
        <div><small>${copy.kicker}</small><strong>${copy.title}</strong><p>${copy.body}</p></div>
        ${copy.route && copy.button ? `<button type="button" data-interrogation-guide-route="${copy.route}" ${copy.targetEvidence ? `data-target-evidence="${copy.targetEvidence}"` : ''}>${copy.button}</button>` : ''}
      </div>`;
    guide.dataset.guideSignature = signature;
  }

  annotateEvidence(core);

  document.querySelectorAll('.interrogation-evidence.next-guided-evidence').forEach((element) => {
    element.classList.remove('next-guided-evidence');
  });
  if (copy.targetEvidence) {
    shell.querySelector<HTMLElement>(`[data-present="${copy.targetEvidence}"]`)?.classList.add('next-guided-evidence');
  }
}

function scheduleGuidance(): void {
  if (scheduled) return;
  scheduled = true;
  afterReact(renderGuidance);
}

function focusWithinModal(selector: string): void {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add('interrogation-guide-focus');
  window.setTimeout(() => target.classList.remove('interrogation-guide-focus'), 1800);
}

function closeAndRoute(tab: 'Дело' | 'Материалы'): void {
  document.querySelector<HTMLButtonElement>('.interrogation-close')?.click();
  afterReact(() => {
    visibleTab(tab)?.click();
    if (tab === 'Дело') afterReact(() => focusWithinModal('.checkpoint-panel'));
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button');
  if (!button) return;

  const route = button.dataset.interrogationGuideRoute as GuideRoute | undefined;
  if (route === 'case') {
    event.preventDefault();
    closeAndRoute('Дело');
    return;
  }
  if (route === 'materials') {
    event.preventDefault();
    closeAndRoute('Материалы');
    return;
  }
  if (route === 'evidence') {
    event.preventDefault();
    const target = button.dataset.targetEvidence;
    focusWithinModal(target ? `[data-present="${target}"]` : '.interrogation-evidence-list');
    return;
  }
  if (route === 'contradiction') {
    event.preventDefault();
    focusWithinModal('.interrogation-contradiction');
    return;
  }

  if (button.closest('.interrogation-shell') || button.closest('.premium-person-card')) {
    scheduleGuidance();
  }
}, true);

window.addEventListener('dbr:interrogation-updated', scheduleGuidance);
window.addEventListener('dbr:runtime-settled', scheduleGuidance);
window.addEventListener('pageshow', scheduleGuidance);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleGuidance, { once: true });
} else {
  scheduleGuidance();
}
