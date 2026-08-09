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

// Only the alibi question is justified by the information the detective has before E006/E008.
// The old passage/Anton question ids remain in storage for compatibility, but are not offered to new players.
const QUESTION_IDS = ['alibi'];
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
  if (!progress.plan) return 'архивный план этажа';
  if (!progress.panel || !progress.routeTrace) return 'осмотр номера 312';
  if (!progress.audio) return 'архивная запись Антона';
  return 'материалы собраны';
}

function nextPresentation(presented: string[]): { id: string; label: string } | null {
  if (!presented.includes('plan')) return { id: 'plan', label: 'архивный план' };
  if (!presented.includes('panel')) return { id: 'panel', label: 'свежие винты панели' };
  if (!presented.includes('tracks') && !presented.includes('fibres')) {
    return { id: 'tracks', label: 'физический след маршрута' };
  }
  if (!presented.includes('audio')) return { id: 'audio', label: 'запись разговора Антона' };
  return null;
}

function phaseMarkup(
  questionsDone: number,
  foundEvidence: number,
  ready: boolean,
  complete: boolean
): string {
  const questionState = questionsDone === 1 ? 'done' : 'active';
  const evidenceState = complete || ready ? 'done' : questionsDone === 1 ? 'active' : 'locked';
  const contradictionState = complete ? 'done' : ready ? 'active' : 'locked';

  return `
    <ol class="interrogation-guide-steps" aria-label="Путь допроса">
      <li class="${questionState}"><span>1</span><div><small>Сначала</small><strong>Зафиксировать алиби</strong><em>${questionsDone}/1 базовый вопрос</em></div></li>
      <li class="${evidenceState}"><span>2</span><div><small>Затем</small><strong>Найти и предъявить основания</strong><em>${foundEvidence}/4 опорных факта</em></div></li>
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
      body: 'Закройте протокол и переходите к материалам: теперь открывается спасательная операция.',
      route: 'materials',
      button: 'Перейти к спасательной операции →'
    };
  }

  if (questionsDone < 1) {
    return {
      kicker: 'Этап 1 из 3',
      title: 'Зафиксируйте только то, что уже известно',
      body: 'Сейчас у следователя есть основание проверить лишь заявленное алиби Кирилла: покидал ли он номер после 23:41. Вопросы о неизвестном проходе или конкретном споре не появляются, пока такие факты не найдены в материалах.'
    };
  }

  if (!core.act1Complete) {
    return {
      kicker: 'Базовое алиби зафиксировано',
      title: 'Дальше нужны факты, а не догадки',
      body: 'На этом этапе следователь ещё не знает ни о старом проходе, ни о содержании архивной записи. Закройте допрос и сформулируйте промежуточный отчёт №1. Новые линии допроса возникнут только из найденных доказательств.',
      route: 'case',
      button: 'Закрыть допрос и открыть отчёт №1 →'
    };
  }

  if (evidence.found < 4) {
    return {
      kicker: 'Этап 2 из 3',
      title: 'Сначала найдите основание для нового вопроса',
      body: `Вернитесь в материалы. Следующая цель: ${nextMissingEvidence(evidence)}. Уже найдено опорных фактов: ${evidence.found}/4. Идея скрытого маршрута должна возникнуть из плана и следов, а не из готовой реплики следователя.`,
      route: 'materials',
      button: 'Закрыть допрос и перейти к материалам →'
    };
  }

  if (!ready) {
    const next = nextPresentation(presented);
    return {
      kicker: 'Основания собраны',
      title: 'Теперь вопросы рождаются из доказательств',
      body: next
        ? `Следующее предъявление: ${next.label}. Порядок важен: план раскрывает существование прохода → панель и следы доказывают его использование → запись связывает Кирилла со знанием маршрута.`
        : 'Основная цепочка предъявлена. Перейдите к фиксации противоречия.',
      route: next ? 'evidence' : 'contradiction',
      button: next ? 'Показать следующее доказательство →' : 'Перейти к противоречию →',
      targetEvidence: next?.id
    };
  }

  return {
    kicker: 'Этап 3 из 3',
    title: 'Логическая цепочка собрана',
    body: 'Теперь выберите вывод, который связывает заявленное алиби Кирилла с уже доказанным скрытым маршрутом и физическими следами этой ночи.',
    route: 'contradiction',
    button: 'Зафиксировать противоречие →'
  };
}

function constrainPrematureQuestions(): void {
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  const questions = shell?.querySelector<HTMLElement>('.interrogation-questions');
  if (!questions) return;

  // These legacy buttons used to reveal discoveries before the player had evidence for them.
  ['passage', 'anton'].forEach((id) => {
    const button = questions.querySelector<HTMLButtonElement>(`[data-ask="${id}"]`);
    if (!button) return;
    button.hidden = true;
    button.disabled = true;
    button.setAttribute('aria-hidden', 'true');
  });

  let note = questions.querySelector<HTMLElement>('.interrogation-premise-note');
  if (!note) {
    note = document.createElement('div');
    note.className = 'interrogation-premise-note';
    questions.querySelector('p')?.after(note);
  }
  note.innerHTML = '<strong>Правило допроса</strong><span>Следователь спрашивает только о том, для чего уже есть основание. Неизвестные факты не подсказываются заранее.</span>';
}

function annotateEvidence(core: CoreState): void {
  const title = document.querySelector<HTMLElement>('.interrogation-control-title small');
  if (title) {
    title.textContent = core.act1Complete
      ? 'Недоступные доказательства показывают, где получить основание для следующего шага'
      : 'Доказательства откроются после промежуточного отчёта №1';
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

  constrainPrematureQuestions();
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
