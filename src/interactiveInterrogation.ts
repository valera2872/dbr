import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';

export {};

type Stage = 'calm' | 'guarded' | 'cornered' | 'broken';
type Speaker = 'detective' | 'kirill' | 'system';

type TranscriptEntry = {
  id: string;
  speaker: Speaker;
  text: string;
};

type InterrogationState = {
  stage: Stage;
  asked: string[];
  presented: string[];
  transcript: TranscriptEntry[];
  wrongConclusions: string[];
  complete: boolean;
};

type Act2State = {
  plan?: string[];
  room?: string[];
};

type Act3State = {
  archive?: string[];
  identity?: string[];
};

type EvidenceDefinition = {
  id: string;
  code: string;
  title: string;
  note: string;
  isUnlocked: (act2: Act2State, act3: Act3State) => boolean;
};

const STAGE_LABELS: Record<Stage, string> = {
  calm: 'Спокоен',
  guarded: 'Защищается',
  cornered: 'Версия рушится',
  broken: 'Противоречие доказано'
};

const STAGE_INDEX: Record<Stage, number> = {
  calm: 0,
  guarded: 1,
  cornered: 2,
  broken: 3
};

const EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'plan',
    code: 'E006',
    title: 'Архивный план этажа',
    note: 'Проход между 312 и 314 существовал и не был окончательно заделан.',
    isUnlocked: (act2) => ['wall', 'stamp', 'width'].every((id) => act2.plan?.includes(id))
  },
  {
    id: 'panel',
    code: 'E007-A',
    title: 'Свежие винты панели',
    note: 'Внутреннюю стенку шкафа номера 312 открывали недавно.',
    isUnlocked: (act2) => Boolean(act2.room?.includes('panel'))
  },
  {
    id: 'tracks',
    code: 'E007-B',
    title: 'Совпадающие следы на ковре',
    note: 'Полосы в номерах 312 и 314 образуют единый маршрут.',
    isUnlocked: (act2) => Boolean(act2.room?.includes('tracks'))
  },
  {
    id: 'fibres',
    code: 'E007-C',
    title: 'Волокна у скрытого проёма',
    note: 'Тёмная ткань зацепилась за решётку при недавнем проходе.',
    isUnlocked: (act2) => Boolean(act2.room?.includes('fibres'))
  },
  {
    id: 'audio',
    code: 'E008-C',
    title: 'Запись разговора Антона',
    note: 'Перед гибелью Антон спорил с Кириллом о незакрытом служебном проходе.',
    isUnlocked: (_act2, act3) => Boolean(act3.archive?.includes('audio'))
  },
  {
    id: 'card',
    code: 'E008-D',
    title: 'Цепочка карты 314-17',
    note: 'На носителе находился оригинальный материал старого дела.',
    isUnlocked: (_act2, act3) => ['catalog', 'contact', 'audio', 'custody'].every((id) => act3.archive?.includes(id))
  }
];

const initialTranscript: TranscriptEntry[] = [
  {
    id: 'intro',
    speaker: 'system',
    text: 'Допрос фиксируется. Кирилл уверен, что журнал замка и камера подтверждают его алиби.'
  }
];

let state = loadState();
let modal: HTMLElement | null = null;

function loadJson<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
  } catch {
    return {} as T;
  }
}

function loadState(): InterrogationState {
  try {
    const parsed = JSON.parse(localStorage.getItem(INTERROGATION_STORAGE_KEY) ?? '{}') as Partial<InterrogationState>;
    return {
      stage: parsed.stage && parsed.stage in STAGE_LABELS ? parsed.stage : 'calm',
      asked: Array.isArray(parsed.asked) ? parsed.asked : [],
      presented: Array.isArray(parsed.presented) ? parsed.presented : [],
      transcript: Array.isArray(parsed.transcript) && parsed.transcript.length ? parsed.transcript : initialTranscript,
      wrongConclusions: Array.isArray(parsed.wrongConclusions) ? parsed.wrongConclusions : [],
      complete: parsed.complete === true
    };
  } catch {
    return {
      stage: 'calm',
      asked: [],
      presented: [],
      transcript: initialTranscript,
      wrongConclusions: [],
      complete: false
    };
  }
}

function saveState(): void {
  localStorage.setItem(INTERROGATION_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('dbr:interrogation-updated', { detail: { complete: state.complete } }));
}

function unique(list: string[], value: string): string[] {
  return list.includes(value) ? list : [...list, value];
}

function entry(speaker: Speaker, text: string): TranscriptEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    speaker,
    text
  };
}

function addExchange(question: string, answer: string): void {
  state.transcript = [
    ...state.transcript,
    entry('detective', question),
    entry('kirill', answer)
  ];
}

function readAct2(): Act2State {
  return loadJson<Act2State>(ACT2_STORAGE_KEY);
}

function readAct3(): Act3State {
  return loadJson<Act3State>(ACT3_STORAGE_KEY);
}

function evidenceUnlocked(definition: EvidenceDefinition): boolean {
  return definition.isUnlocked(readAct2(), readAct3());
}

function has(id: string): boolean {
  return state.presented.includes(id);
}

function routePhysicallyProven(): boolean {
  return has('panel') && (has('tracks') || has('fibres'));
}

function canFixContradiction(): boolean {
  return state.asked.includes('alibi') && has('plan') && routePhysicallyProven() && has('audio');
}

function ask(id: string): void {
  if (state.complete) return;

  if (id === 'alibi') {
    state.asked = unique(state.asked, id);
    addExchange(
      'После 23:41 вы покидали номер 312?',
      has('plan')
        ? 'Через коридор — нет. Я уже сказал: камера не зафиксировала моего выхода.'
        : 'Нет. Я вошёл в 312-й и оставался там до утра. Камера это подтверждает.'
    );
  }

  if (id === 'passage') {
    state.asked = unique(state.asked, id);
    addExchange(
      'Вы знали о старом проходе между номерами?',
      has('plan')
        ? 'Я видел старые схемы при реконструкции. Но проём должны были закрыть — пользоваться им было невозможно.'
        : 'Никакого прохода нет. Современная планировка это подтверждает.'
    );
  }

  if (id === 'anton') {
    state.asked = unique(state.asked, id);
    addExchange(
      'О чём вы спорили с Антоном Беловым в 2015 году?',
      has('audio')
        ? 'Он обвинял меня в нарушении регламента. Это был рабочий конфликт, а не причина его гибели.'
        : 'Мы почти не общались. Денис и Вера пытаются связать обычный несчастный случай с этой ночью.'
    );
  }

  saveState();
  renderModal();
}

function presentEvidence(id: string): void {
  if (state.complete) return;
  const definition = EVIDENCE.find((item) => item.id === id);
  if (!definition || !evidenceUnlocked(definition) || has(id)) return;

  if (id === 'panel' && !has('plan')) {
    addExchange(
      `Предъявляю ${definition.code}: ${definition.title}.`,
      'Старая панель могла быть плохо закреплена годами. Сначала докажите, что за ней вообще существовал проход.'
    );
    state.wrongConclusions = unique(state.wrongConclusions, 'panel-before-plan');
    saveState();
    renderModal();
    return;
  }

  if ((id === 'tracks' || id === 'fibres') && !has('panel')) {
    addExchange(
      `Предъявляю ${definition.code}: ${definition.title}.`,
      'Вы показываете отдельный след, но не связываете его с доступом из моего номера.'
    );
    state.wrongConclusions = unique(state.wrongConclusions, `${id}-before-panel`);
    saveState();
    renderModal();
    return;
  }

  if (id === 'audio' && !routePhysicallyProven()) {
    addExchange(
      `Предъявляю ${definition.code}: ${definition.title}.`,
      'Старая запись не доказывает, что я куда-либо ходил этой ночью.'
    );
    state.wrongConclusions = unique(state.wrongConclusions, 'audio-before-route');
    saveState();
    renderModal();
    return;
  }

  state.presented = unique(state.presented, id);

  if (id === 'plan') {
    state.stage = 'guarded';
    addExchange(
      `На архивном плане есть проход между 312 и 314. Вы знали о нём?`,
      'Да, видел схему во время реконструкции. Но по акту проём закрыли. Моё алиби от этого не меняется.'
    );
  }

  if (id === 'panel') {
    state.stage = 'guarded';
    addExchange(
      'Панель в вашем шкафу держится на свежих винтах.',
      'Я заметил, что она отходит, уже утром. Возможно, персонал проверял коммуникации.'
    );
  }

  if (id === 'tracks') {
    state.stage = 'cornered';
    addExchange(
      'Следы от шкафа в 312 совпадают со следами в номере Ильи.',
      'Совпадающая ширина ещё не устанавливает время. Эти вещи могли передвигать раньше.'
    );
  }

  if (id === 'fibres') {
    state.stage = 'cornered';
    addExchange(
      'У проёма найдены свежие волокна тёмной ткани.',
      'В отеле десятки тёмных курток. Вы не доказали, что волокна принадлежат мне.'
    );
  }

  if (id === 'audio') {
    state.stage = 'cornered';
    addExchange(
      'На записи Антон обращается к вам по имени и требует закрыть проход.',
      'Хорошо. Я отвечал за площадку и знал об этом маршруте. Но это не означает, что я причастен к его гибели или исчезновению Ильи.'
    );
  }

  if (id === 'card') {
    addExchange(
      'Карта 314-17 содержала оригинальный материал старого дела.',
      'Именно за этим Илья всех собрал. Но карту искал не только я — Денис скрывал её существование, а Вера приехала под чужой фамилией.'
    );
  }

  saveState();
  renderModal();
}

function submitContradiction(id: string): void {
  if (!canFixContradiction() || state.complete) return;

  if (id !== 'route') {
    state.wrongConclusions = unique(state.wrongConclusions, id);
    state.transcript = [
      ...state.transcript,
      entry('detective', id === 'denis'
        ? 'Денис передал вам карту и попросил спрятать Илью.'
        : 'Вера вошла через проход и подставила вас.'),
      entry('kirill', 'Это предположение. Ни один из предъявленных материалов не подтверждает такую связь.'),
      entry('system', 'Вывод не связывает алиби Кирилла с физическими следами маршрута.')
    ];
    saveState();
    renderModal();
    return;
  }

  state.complete = true;
  state.stage = 'broken';
  state.transcript = [
    ...state.transcript,
    entry('detective', 'Вы не выходили в коридор — потому что использовали проход. Свежая панель, совпадающие следы и ваша осведомлённость о маршруте опровергают алиби.'),
    entry('kirill', 'Я вошёл в 314-й после сообщения. Хотел забрать карту и заставить Илью отказаться от публикации. Он ударился во время борьбы. Я перенёс его через проход в старую служебную комнату. Он был жив.'),
    entry('system', 'ПРОТИВОРЕЧИЕ ДОКАЗАНО: Кирилл использовал скрытый маршрут после 00:17. Открыто направление поиска — старая служебная комната.')
  ];
  saveState();
  renderModal();
  decorateInterface();
}

function speakerLabel(speaker: Speaker): string {
  if (speaker === 'detective') return 'Следователь';
  if (speaker === 'kirill') return 'Кирилл';
  return 'Система дела';
}

function renderTranscript(): string {
  return state.transcript.map((item) => `
    <article class="interrogation-line ${item.speaker}">
      <span>${speakerLabel(item.speaker)}</span>
      <p>${item.text}</p>
    </article>
  `).join('');
}

function evidenceMarkup(): string {
  return EVIDENCE.map((definition) => {
    const unlocked = evidenceUnlocked(definition);
    const presented = has(definition.id);
    const orderBlocked =
      (definition.id === 'panel' && !has('plan')) ||
      ((definition.id === 'tracks' || definition.id === 'fibres') && !has('panel')) ||
      (definition.id === 'audio' && !routePhysicallyProven());
    const status = presented ? 'Предъявлено' : unlocked ? (orderBlocked ? 'Нужна связка' : 'Доступно') : 'Не найдено';
    return `
      <button class="interrogation-evidence ${presented ? 'presented' : ''} ${!unlocked ? 'locked' : ''}" data-present="${definition.id}" ${!unlocked || presented ? 'disabled' : ''}>
        <span>${definition.code}</span>
        <div><strong>${definition.title}</strong><small>${definition.note}</small></div>
        <i>${status}</i>
      </button>`;
  }).join('');
}

function renderModal(): void {
  if (!modal) return;
  const stageIndex = STAGE_INDEX[state.stage];
  const ready = canFixContradiction();

  modal.innerHTML = `
    <section class="interrogation-shell" role="dialog" aria-modal="true" aria-label="Интерактивный допрос Кирилла Бессонова">
      <header class="interrogation-header">
        <div class="interrogation-person">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=84" alt="" />
          <div><small>ПОДОЗРЕВАЕМЫЙ · НОМЕР 312</small><h1>Кирилл Бессонов</h1><p>Организатор мероприятий · знал старую планировку</p></div>
        </div>
        <div class="interrogation-state">
          <small>Состояние</small>
          <strong>${STAGE_LABELS[state.stage]}</strong>
          <div>${[0, 1, 2, 3].map((index) => `<span class="${index <= stageIndex ? 'active' : ''}"></span>`).join('')}</div>
        </div>
        <button class="interrogation-close" aria-label="Закрыть допрос">×</button>
      </header>

      <div class="interrogation-workspace">
        <section class="interrogation-dialogue">
          <div class="interrogation-dialogue-head"><span>ПРОТОКОЛ ДОПРОСА / LIVE</span><small>${state.transcript.length - 1} реплик зафиксировано</small></div>
          <div class="interrogation-transcript">${renderTranscript()}</div>
          <div class="interrogation-questions">
            <p>Линия вопросов</p>
            <button data-ask="alibi" class="${state.asked.includes('alibi') ? 'used' : ''}">После 23:41 вы покидали 312?</button>
            <button data-ask="passage" class="${state.asked.includes('passage') ? 'used' : ''}">Вы знали о старом проходе?</button>
            <button data-ask="anton" class="${state.asked.includes('anton') ? 'used' : ''}">О чём вы спорили с Антоном?</button>
          </div>
        </section>

        <aside class="interrogation-control">
          <div class="interrogation-control-title"><span>Материалы для предъявления</span><small>Улика работает только в логической связке</small></div>
          <div class="interrogation-evidence-list">${evidenceMarkup()}</div>
          <section class="interrogation-contradiction ${ready ? 'ready' : ''} ${state.complete ? 'complete' : ''}">
            <small>ФИКСАЦИЯ ПРОТИВОРЕЧИЯ</small>
            <h2>${state.complete ? 'Алиби разрушено' : ready ? 'Данных достаточно' : 'Соберите логическую цепочку'}</h2>
            <p>${state.complete
              ? 'Кирилл признал использование скрытого маршрута и указал место, куда перенёс Илью.'
              : ready
                ? 'Выберите вывод, который одновременно объясняет камеру, следы и знания Кирилла.'
                : 'Сначала зафиксируйте алиби, докажите существование маршрута, его недавнее использование и связь Кирилла со старым проходом.'}</p>
            ${ready && !state.complete ? `
              <div class="interrogation-conclusions">
                <button data-conclusion="route">Кирилл использовал проход и поэтому не появился в коридоре</button>
                <button data-conclusion="denis">Денис поручил Кириллу спрятать Илью</button>
                <button data-conclusion="vera">Вера прошла через 312 и подставила Кирилла</button>
              </div>` : ''}
            ${state.complete ? '<div class="interrogation-unlocked"><span>✓</span><div><strong>Новое направление</strong><p>Старая служебная комната за техническим коридором.</p></div></div>' : ''}
          </section>
        </aside>
      </div>
    </section>`;

  modal.querySelector('.interrogation-close')?.addEventListener('click', closeModal);
  modal.querySelectorAll<HTMLElement>('[data-ask]').forEach((button) => {
    button.addEventListener('click', () => ask(button.dataset.ask!));
  });
  modal.querySelectorAll<HTMLElement>('[data-present]').forEach((button) => {
    button.addEventListener('click', () => presentEvidence(button.dataset.present!));
  });
  modal.querySelectorAll<HTMLElement>('[data-conclusion]').forEach((button) => {
    button.addEventListener('click', () => submitContradiction(button.dataset.conclusion!));
  });

  const transcript = modal.querySelector<HTMLElement>('.interrogation-transcript');
  if (transcript) transcript.scrollTop = transcript.scrollHeight;
}

function openModal(): void {
  if (modal) return;
  modal = document.createElement('div');
  modal.className = 'interrogation-backdrop';
  modal.addEventListener('mousedown', (event) => {
    if (event.target === modal) closeModal();
  });
  document.body.append(modal);
  document.body.classList.add('interrogation-open');
  renderModal();
}

function closeModal(): void {
  modal?.remove();
  modal = null;
  document.body.classList.remove('interrogation-open');
  decorateInterface();
}

function findKirillCard(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>('.premium-person-card'))
    .find((card) => card.textContent?.includes('Кирилл Бессонов'));
}

function decorateInterface(): void {
  const card = findKirillCard();
  if (card) {
    card.classList.add('interactive-interrogation-card');
    card.classList.toggle('interrogation-complete', state.complete);
    let badge = card.querySelector<HTMLElement>('.interactive-interrogation-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'interactive-interrogation-badge';
      card.append(badge);
    }
    badge.textContent = state.complete ? '✓ Версия разрушена' : 'Интерактивный допрос';
  }

  if (state.complete) {
    const list = document.querySelector<HTMLElement>('.premium-fact-list');
    if (list && !list.querySelector('.kirill-interrogation-fact')) {
      const item = document.createElement('li');
      item.className = 'kirill-interrogation-fact';
      item.innerHTML = '<span>K-01</span><p>Кирилл использовал скрытый проход после 00:17 и перенёс Илью в старую служебную комнату.</p>';
      list.append(item);
    }
  }
}

function interceptKirillCard(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.premium-person-card') : null;
  if (!target || !target.textContent?.includes('Кирилл Бессонов')) return;
  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
  openModal();
}

document.addEventListener('click', interceptKirillCard, true);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal) closeModal();
});
window.addEventListener('dbr:runtime-settled', decorateInterface);
window.addEventListener('dbr:interrogation-updated', decorateInterface);
document.addEventListener('click', () => window.setTimeout(decorateInterface, 60));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', decorateInterface, { once: true });
} else {
  decorateInterface();
}
