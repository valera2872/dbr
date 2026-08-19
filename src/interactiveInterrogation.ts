import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  CORE_STORAGE_KEY,
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

type CoreState = {
  seenEvidenceIds?: string[];
};

type Act2State = {
  plan?: string[];
  room?: string[];
  questions?: string[];
};

type Act3State = {
  archive?: string[];
  identity?: string[];
  questions?: string[];
};

type EvidenceDefinition = {
  id: string;
  code: string;
  title: string;
  note: string;
  isUnlocked: (core: CoreState, act2: Act2State, act3: Act3State) => boolean;
};

const M3_LOG = 'v2:m3-log';
const PRESENCE_PROVEN = 'actor:k:presence-proven';

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
    id: 'opportunity',
    code: 'E004',
    title: 'Камера C3 · номер 312',
    note: 'В 23:41 Кирилл входит в 312 и не появляется в гостевом коридоре в критическое окно.',
    isUnlocked: (core) => Boolean(core.seenEvidenceIds?.includes('E004'))
  },
  {
    id: 'plan',
    code: 'E006',
    title: 'Старая служебная сеть',
    note: 'V314 связывал 312/314 с технической веткой P3. План доказывает возможность маршрута, не пользователя.',
    isUnlocked: (_core, act2) => ['wall', 'stamp', 'width'].every((id) => act2.plan?.includes(id))
  },
  {
    id: 'panel',
    code: 'E007-A',
    title: 'Свежие следы на панели 312',
    note: 'Доступ из 312 открывали недавно. Сам по себе след не устанавливает человека.',
    isUnlocked: (_core, act2) => Boolean(act2.room?.includes('panel'))
  },
  {
    id: 'tracks',
    code: 'E007-B',
    title: 'Следы движения по V314',
    note: 'Физические следы связывают 312, V314 и 314 и подтверждают недавнее использование маршрута.',
    isUnlocked: (_core, act2) => Boolean(act2.room?.includes('tracks'))
  },
  {
    id: 'fibres',
    code: 'E007-C',
    title: 'Свежий контакт у проёма',
    note: 'Волокна подтверждают недавний проход, но не индивидуализируют пользователя.',
    isUnlocked: (_core, act2) => Boolean(act2.room?.includes('fibres'))
  },
  {
    id: 'm3',
    code: 'M3',
    title: 'Журнал служебного входа M3',
    note: 'В критическое окно M3 не открывался. Версия входа через staff-ветку ослабевает отдельной проверкой.',
    isUnlocked: (_core, act2) => Boolean(act2.questions?.includes(M3_LOG))
  },
  {
    id: 'presence',
    code: 'K-02',
    title: 'STR-профиль микроследа из 314',
    note: '16/16 локусов связывают Кирилла с биологическим микроследом со стола в 314. Это присутствие, не нападение.',
    isUnlocked: (_core, _act2, act3) => Boolean(act3.questions?.includes(PRESENCE_PROVEN))
  },
  {
    id: 'threat',
    code: 'E002',
    title: 'Сообщение Ильи · 00:17',
    note: 'После сообщения о доказательствах возникает непосредственный триггер, но сообщение получили несколько участников.',
    isUnlocked: (core) => Boolean(core.seenEvidenceIds?.includes('E002'))
  },
  {
    id: 'card',
    code: 'E008',
    title: 'Происхождение B-17 / 314-17',
    note: 'Архив подтверждает существование скрытого оригинала и реальные ставки публикации. Мотив не равен личности нападавшего.',
    isUnlocked: (_core, _act2, act3) => ['catalog', 'contact', 'audio', 'custody'].every((id) => act3.archive?.includes(id))
  },
  {
    id: 'audio',
    code: 'E008-C',
    title: 'Фрагмент разговора 2015 года',
    note: 'Сохранился спор о безопасности и продолжении работ, но в фрагменте нет имён. Это контекст, а не атрибуция Кириллу.',
    isUnlocked: (_core, _act2, act3) => Boolean(act3.archive?.includes('audio'))
  }
];

const initialTranscript: TranscriptEntry[] = [
  {
    id: 'intro',
    speaker: 'system',
    text: 'Допрос фиксируется. Кирилл опирается на камеру и журнал замка: через гостевой коридор он после 23:41 не выходил.'
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

function readCore(): CoreState {
  return loadJson<CoreState>(CORE_STORAGE_KEY);
}

function readAct2(): Act2State {
  return loadJson<Act2State>(ACT2_STORAGE_KEY);
}

function readAct3(): Act3State {
  return loadJson<Act3State>(ACT3_STORAGE_KEY);
}

function evidenceUnlocked(definition: EvidenceDefinition): boolean {
  return definition.isUnlocked(readCore(), readAct2(), readAct3());
}

function has(id: string): boolean {
  return state.presented.includes(id);
}

function routeUsedProven(): boolean {
  return has('plan') && has('panel') && (has('tracks') || has('fibres'));
}

function motiveShown(): boolean {
  return has('threat') && has('card');
}

function canFixContradiction(): boolean {
  return state.asked.includes('alibi')
    && has('opportunity')
    && routeUsedProven()
    && has('m3')
    && has('presence')
    && motiveShown();
}

function updatePressure(): void {
  if (state.complete) {
    state.stage = 'broken';
    return;
  }
  if (has('presence') && routeUsedProven() && has('opportunity')) {
    state.stage = 'cornered';
    return;
  }
  state.stage = state.presented.length > 0 ? 'guarded' : 'calm';
}

function ask(id: string): void {
  if (state.complete) return;

  if (id === 'alibi') {
    state.asked = unique(state.asked, id);
    addExchange(
      'После 23:41 вы покидали номер 312?',
      'Через гостевой коридор — нет. Я вошёл в 312-й и оставался там. Камера это подтверждает.'
    );
  }

  if (id === 'passage') {
    state.asked = unique(state.asked, id);
    addExchange(
      'Вы знали о старой служебной сети за 312?',
      has('plan')
        ? 'Старые схемы я видел. Но существование схемы ещё не означает, что я пользовался этим маршрутом.'
        : 'Я не понимаю, о какой сети вы говорите. Покажите основание для такого вопроса.'
    );
  }

  if (id === 'anton') {
    state.asked = unique(state.asked, id);
    addExchange(
      'Почему материалы B-17 могли быть для вас опасны?',
      has('card')
        ? 'Опасны были не только для меня. Денис скрывал оригинал, Вера приехала под другой фамилией, отель не хотел нового скандала.'
        : 'Вы сначала установите, что именно было на этом носителе и кому оно угрожало.'
    );
  }

  saveState();
  renderModal();
}

function responseForEvidence(id: string): { question: string; answer: string } {
  switch (id) {
    case 'opportunity':
      return {
        question: 'Камера фиксирует: в 23:41 вы вошли в 312 и через гостевой коридор больше не выходили.',
        answer: 'Именно. Это моё алиби. Камера показывает, где я был, а не то, что я заходил в 314-й.'
      };
    case 'plan':
      return {
        question: 'Старый план показывает связь 312 → V314 → 314 и продолжение к P3.',
        answer: 'Он показывает старую топологию. Не показывает, что этим путём пользовался я.'
      };
    case 'panel':
      return {
        question: 'Панель доступа из 312 открывали недавно.',
        answer: 'Служебная сеть не принадлежит мне. У отеля есть персонал и технический доступ. Кто сказал, что панель открывал я?'
      };
    case 'tracks':
      return {
        question: 'Следы движения связывают 312, V314 и номер 314.',
        answer: 'Тогда вы доказали, что маршрутом пользовались. Но пока не доказали, кто именно.'
      };
    case 'fibres':
      return {
        question: 'У проёма сохранился свежий контактный след.',
        answer: 'Массовое волокно не имеет имени. Это подтверждает проход, но не связывает его со мной.'
      };
    case 'm3':
      return {
        question: 'Контроллер M3 не фиксирует ни одного открытия служебного входа в критическое окно.',
        answer: 'Вы исключили один вход персонала. Это всё ещё не доказывает, что из 312 вышел именно я.'
      };
    case 'presence':
      return {
        question: 'STR-профиль микроследа со стола в 314 совпал с вашим: 16 из 16 локусов.',
        answer: 'Это доказывает контакт со столом. Но экспертиза не говорит, когда я там был, как вошёл и что произошло с Ильёй.'
      };
    case 'threat':
      return {
        question: 'В 00:17 Илья написал, что утром передаст доказательства. Вы получили это сообщение.',
        answer: 'Получили все. У каждого в этой компании были причины нервничать после такого сообщения.'
      };
    case 'card':
      return {
        question: 'B-17 существовал, был скрыт из общей оцифровки и находился в центре встречи Ильи.',
        answer: 'Да. Но происхождение B-17 объясняет ставки, а не делает меня единственным человеком с мотивом.'
      };
    case 'audio':
      return {
        question: 'В архиве сохранился фрагмент спора о небезопасной зоне и требовании продолжить работы.',
        answer: 'В этом фрагменте нет имён. Вы можете доказать сам спор, но не приписать реплики мне только потому, что вам подходит версия.'
      };
    default:
      return { question: 'Предъявляю материал.', answer: 'Поясните, что именно он доказывает.' };
  }
}

function presentEvidence(id: string): void {
  if (state.complete) return;
  const definition = EVIDENCE.find((item) => item.id === id);
  if (!definition || !evidenceUnlocked(definition) || has(id)) return;

  state.presented = unique(state.presented, id);
  const exchange = responseForEvidence(id);
  addExchange(exchange.question, exchange.answer);
  updatePressure();
  saveState();
  renderModal();
}

function submitContradiction(id: string): void {
  if (!canFixContradiction() || state.complete) return;

  if (id !== 'route') {
    state.wrongConclusions = unique(state.wrongConclusions, id);
    const copy: Record<string, { detective: string; kirill: string; system: string }> = {
      presence: {
        detective: 'Ваш STR-профиль в 314 доказывает, что вы напали на Илью.',
        kirill: 'Нет. Он доказывает контакт и присутствие. Действие против Ильи из одного микроследа не следует.',
        system: 'Слишком сильный вывод: физическое присутствие нельзя автоматически превращать в доказательство нападения.'
      },
      motive: {
        detective: 'Вы боялись B-17, значит именно вы напали на Илью.',
        kirill: 'Мотив был не только у меня. Вы уже нашли реальные секреты других участников.',
        system: 'Мотив объясняет возможное действие, но не индивидуализирует исполнителя.'
      },
      marina: {
        detective: 'M3 не открывался, значит Марина помогла вам через другой вход.',
        kirill: 'Вы только что исключили один маршрут. Никакого доказательства сговора с Мариной у вас нет.',
        system: 'Вывод добавляет неподтверждённого сообщника и не нужен для объяснения доказанных фактов.'
      }
    };
    const selected = copy[id] ?? copy.presence;
    state.transcript = [
      ...state.transcript,
      entry('detective', selected.detective),
      entry('kirill', selected.kirill),
      entry('system', selected.system)
    ];
    saveState();
    renderModal();
    return;
  }

  state.complete = true;
  state.stage = 'broken';
  state.transcript = [
    ...state.transcript,
    entry('detective', 'Камера фиксирует вас в 312. Старая сеть из 312 была проходима и использовалась этой ночью. M3 в критическое окно не открывался. Ваш STR-профиль найден на столе в 314. А сразу после сообщения Ильи B-17 давал вам конкретную причину попасть туда. То, что вы не вышли в коридор, больше не алиби — это объяснение маршрута.'),
    entry('kirill', 'Да. После сообщения я прошёл из 312-го в 314-й. Я хотел забрать B-17 и остановить публикацию. Мы сцепились, Илья ударился. Я запаниковал и попытался убрать следы. Дальше — только в присутствии адвоката.'),
    entry('system', 'КЛЮЧЕВОЕ ПРОТИВОРЕЧИЕ ДОКАЗАНО: Кирилл признал вход в 314 и конфликт после 00:17. Местонахождение Ильи, маршрут поиска S-3 и полная ответственность за события 2015 года не создаются этим признанием и проверяются отдельными ветками.')
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
    const status = presented ? 'Предъявлено' : unlocked ? 'Доступно' : 'Не найдено';
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
  updatePressure();
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
          <div class="interrogation-dialogue-head"><span>ПРОТОКОЛ ДОПРОСА / LIVE</span><small>${Math.max(0, state.transcript.length - 1)} реплик зафиксировано</small></div>
          <div class="interrogation-transcript">${renderTranscript()}</div>
          <div class="interrogation-questions">
            <p>Линия вопросов</p>
            <button data-ask="alibi" class="${state.asked.includes('alibi') ? 'used' : ''}">После 23:41 вы покидали 312?</button>
            <button data-ask="passage" class="${state.asked.includes('passage') ? 'used' : ''}">Вы знали о старой служебной сети?</button>
            <button data-ask="anton" class="${state.asked.includes('anton') ? 'used' : ''}">Почему B-17 мог быть опасен для вас?</button>
          </div>
        </section>

        <aside class="interrogation-control">
          <div class="interrogation-control-title"><span>Материалы для предъявления</span><small>Сильная версия должна пережить возражения по каждой доказательной семье</small></div>
          <div class="interrogation-evidence-list">${evidenceMarkup()}</div>
          <section class="interrogation-contradiction ${ready ? 'ready' : ''} ${state.complete ? 'complete' : ''}">
            <small>ФИКСАЦИЯ ПРОТИВОРЕЧИЯ</small>
            <h2>${state.complete ? 'Версия Кирилла разрушена' : ready ? 'Связка замкнулась' : 'Проверяйте версию, а не одну улику'}</h2>
            <p>${state.complete
              ? 'Вход Кирилла в 314 и конфликт после 00:17 подтверждены. Признание не заменяет отдельные доказательства маршрута, спасения Ильи или событий 2015 года.'
              : ready
                ? 'Теперь выберите только тот вывод, который одновременно выдерживает проверку возможности, маршрута, альтернативного доступа, физического присутствия и мотива.'
                : 'Одного маршрута, мотива или микроследа недостаточно. Предъявляйте уже добытые материалы в любом порядке и проверяйте, какие возражения остаются.'}</p>
            ${ready && !state.complete ? `
              <div class="interrogation-conclusions">
                <button data-conclusion="route">Кирилл вошёл в 314 через сеть из 312; его «не выходил в коридор» объясняет механизм, а не алиби</button>
                <button data-conclusion="presence">STR-профиль сам по себе доказывает нападение Кирилла</button>
                <button data-conclusion="motive">Мотив вокруг B-17 сам по себе доказывает, что напал Кирилл</button>
                <button data-conclusion="marina">Журнал M3 доказывает, что Марина помогала Кириллу</button>
              </div>` : ''}
            ${state.complete ? '<div class="interrogation-unlocked"><span>✓</span><div><strong>Граница доказательства сохранена</strong><p>Допрос подтверждает вход Кирилла в 314 и конфликт. Поиск Ильи и историческая ответственность закрываются собственными доказательными ветками.</p></div></div>' : ''}
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
  state = loadState();
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
      item.innerHTML = '<span>K-01</span><p>После замкнутой доказательной связки Кирилл признал вход из 312 в номер 314 после 00:17 и конфликт с Ильёй. Его присутствие уже было независимо установлено STR-сравнением.</p>';
      list.append(item);
    }
  }
}

function rerenderForEvidenceUpdate(): void {
  state = loadState();
  if (modal) renderModal();
  decorateInterface();
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
window.addEventListener('dbr:act2-updated', rerenderForEvidenceUpdate);
window.addEventListener('dbr:act3-updated', rerenderForEvidenceUpdate);
document.addEventListener('click', () => window.setTimeout(decorateInterface, 60));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', decorateInterface, { once: true });
} else {
  decorateInterface();
}
