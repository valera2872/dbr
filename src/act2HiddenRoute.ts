export {};

type PlanFindingId = 'wall-gap' | 'renovation-stamp' | 'service-width';
type RoomFindingId = 'wardrobe-panel' | 'carpet-tracks' | 'archive-envelope' | 'vent-fibres';

type Act2Progress = {
  planFindings: PlanFindingId[];
  roomFindings: RoomFindingId[];
  askedQuestions: string[];
};

const BUILD = 'v0.5.0';
const ACT2_STORAGE_KEY = 'dbr:dbr_001_room_314:act2:v0.5.0';
const CASE_KEY_PREFIX = 'dbr:dbr_001_room_314:';
const ROOM_312_IMAGE = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1900&q=86';

const DEFAULT_PROGRESS: Act2Progress = {
  planFindings: [],
  roomFindings: [],
  askedQuestions: []
};

const PLAN_FINDINGS: Record<PlanFindingId, { index: string; label: string; title: string; description: string }> = {
  'wall-gap': {
    index: '01',
    label: 'Стык 312 / 314',
    title: 'Разрыв в капитальной стене',
    description: 'На архивном листе между номерами 312 и 314 обозначена дверная коробка шириной 82 см. На современной схеме на её месте показана сплошная стена.'
  },
  'renovation-stamp': {
    index: '02',
    label: 'Штамп реконструкции',
    title: 'Изменение проекта в 2015 году',
    description: 'Красная пометка предписывает закрыть технический проём декоративными панелями, но акт окончательной заделки в архивной папке отсутствует.'
  },
  'service-width': {
    index: '03',
    label: 'Размер стены',
    title: 'Полость шире обычной перегородки',
    description: 'Расстояние между внутренними стенами номеров превышает толщину стандартной перегородки на 96 см — достаточно для узкого служебного прохода.'
  }
};

const ROOM_FINDINGS: Record<RoomFindingId, { index: string; label: string; title: string; description: string }> = {
  'wardrobe-panel': {
    index: '01',
    label: 'Шкаф у общей стены',
    title: 'Панель открывали недавно',
    description: 'Внутренняя стенка шкафа держится на новых винтах. На кромке свежие царапины, а за панелью видна старая металлическая дверная коробка.'
  },
  'carpet-tracks': {
    index: '02',
    label: 'Ковёр',
    title: 'Следы совпадают с номером 314',
    description: 'На ковре две параллельные полосы такой же ширины, как следы возле шкафа в номере Ильи. Они ведут от скрытой панели вглубь комнаты.'
  },
  'archive-envelope': {
    index: '03',
    label: 'Письменный стол',
    title: 'Конверт из старого архива',
    description: 'В ящике лежит пустой конверт с маркировкой фестиваля 2015 года. На обороте рукой Дениса записано: «оригинал — у А.Б.».'
  },
  'vent-fibres': {
    index: '04',
    label: 'Вентиляционная решётка',
    title: 'Волокна тёмной ткани',
    description: 'На выступе рядом со скрытой панелью зацепились свежие волокна тёмной куртки. Проём использовали не как старую нишу, а как реальный маршрут.'
  }
};

const EXTRA_QUESTIONS: Record<string, Array<{ id: string; question: string; answer: string; unlocked: () => boolean }>> = {
  'Кирилл Бессонов': [
    {
      id: 'kirill-old-passage',
      question: 'Почему архивный план показывает проход из вашего номера в 314?',
      answer: 'Это старая техническая дверь. Насколько мне известно, её заделали много лет назад. Я не проверял стену и не знал, что панель сохранилась.',
      unlocked: () => passageFound()
    },
    {
      id: 'kirill-fresh-screws',
      question: 'Кто недавно снимал внутреннюю панель вашего шкафа?',
      answer: 'Не знаю. Возможно, техническая служба. Я заселился вечером и шкафом почти не пользовался. Вы же не считаете несколько винтов доказательством?',
      unlocked: () => state.roomFindings.includes('wardrobe-panel')
    }
  ],
  'Марина Орлова': [
    {
      id: 'marina-plan-change',
      question: 'Почему проход исчез из современной планировки отеля?',
      answer: 'Во время реконструкции его должны были закрыть. Я работаю здесь только семь лет и видела лишь современный комплект документов. Архивные листы хранились отдельно.',
      unlocked: () => passageFound()
    },
    {
      id: 'marina-panel-access',
      question: 'У кого был доступ к технической панели между 312 и 314?',
      answer: 'Формально — у управляющей и старшего техника. Но декоративная панель открывается обычным инструментом. Если Кирилл знал старую планировку, мастер-ключ ему не требовался.',
      unlocked: () => roomComplete()
    }
  ]
};

let state = loadAct2Progress();
let scanScheduled = false;

function loadAct2Progress(): Act2Progress {
  try {
    const raw = localStorage.getItem(ACT2_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Act2Progress>;
    return {
      planFindings: Array.isArray(parsed.planFindings) ? parsed.planFindings as PlanFindingId[] : [],
      roomFindings: Array.isArray(parsed.roomFindings) ? parsed.roomFindings as RoomFindingId[] : [],
      askedQuestions: Array.isArray(parsed.askedQuestions) ? parsed.askedQuestions : []
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveAct2Progress(): void {
  localStorage.setItem(ACT2_STORAGE_KEY, JSON.stringify(state));
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function passageFound(): boolean {
  return state.planFindings.length >= Object.keys(PLAN_FINDINGS).length;
}

function roomComplete(): boolean {
  return state.roomFindings.length >= Object.keys(ROOM_FINDINGS).length;
}

function act1Complete(): boolean {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(CASE_KEY_PREFIX) || key.includes(':act2:')) continue;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as { act1Complete?: boolean };
      if (saved.act1Complete) return true;
    } catch {
      // Ignore malformed or obsolete saves.
    }
  }
  return false;
}

function setVersion(): void {
  document.title = /v\d+\.\d+\.\d+/.test(document.title)
    ? document.title.replace(/v\d+\.\d+\.\d+/, BUILD)
    : `${document.title} · ${BUILD}`;
  const marker = document.querySelector<HTMLElement>('.build-marker');
  if (marker) marker.textContent = BUILD;
}

function findButtonByText(selector: string, text: string): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(selector))
    .find((button) => button.textContent?.includes(text));
}

function switchToEvidence(): void {
  findButtonByText('.premium-sidebar button', 'Материалы')?.click();
  findButtonByText('.premium-mobile-nav button', 'Материалы')?.click();
}

function enhanceTopbar(): void {
  if (!act1Complete()) return;
  const actLabel = document.querySelector<HTMLElement>('.topbar-case small');
  if (actLabel) actLabel.textContent = 'Дело №001 · акт II';
  const status = document.querySelector<HTMLElement>('.topbar-actions .premium-pill');
  if (status) status.textContent = roomComplete() ? 'Маршрут подтверждён' : 'Акт II открыт';

  const reset = findButtonByText('.premium-text-button', 'Сбросить');
  if (reset && !reset.dataset.act2ResetHook) {
    reset.dataset.act2ResetHook = 'true';
    reset.addEventListener('click', () => {
      window.setTimeout(() => {
        if (!act1Complete()) {
          localStorage.removeItem(ACT2_STORAGE_KEY);
          state = { ...DEFAULT_PROGRESS };
        }
      }, 120);
    });
  }
}

function enhanceDashboard(): void {
  if (!act1Complete()) return;
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  const hero = dashboard?.querySelector<HTMLElement>('.dashboard-hero');
  if (!dashboard || !hero) return;

  const heading = hero.querySelector<HTMLElement>('h1');
  const description = hero.querySelector<HTMLElement>('p:last-child');
  if (heading) heading.textContent = roomComplete() ? 'Скрытый маршрут подтверждён' : 'Куда ведёт стена между 312 и 314?';
  if (description) {
    description.textContent = roomComplete()
      ? 'Осмотр номера 312 подтвердил: старый технический проход не был заделан и использовался в ночь исчезновения.'
      : passageFound()
        ? 'Архивный план открыл проход между номерами. Теперь необходимо проверить, сохранился ли он со стороны 312.'
        : 'Обычные пути исключены. Найдите архивный план этажа и сравните его с современной планировкой.';
  }

  let action = dashboard.querySelector<HTMLButtonElement>('.act2-next-action');
  if (!action) {
    action = document.createElement('button');
    action.type = 'button';
    action.className = 'next-action-card act2-next-action';
    hero.insertAdjacentElement('afterend', action);
  }
  action.innerHTML = `
    <div class="action-index">Акт II · следующий шаг</div>
    <div><strong>${passageFound() ? (roomComplete() ? 'Сверить новые показания' : 'Осмотреть номер 312') : 'Изучить архивный план'}</strong>
    <span>${passageFound() ? (roomComplete() ? 'Кирилл и Марина должны объяснить найденный маршрут.' : 'Проверьте общую стену и следы внутри соседнего номера.') : 'Сопоставьте старую и современную планировку третьего этажа.'}</span></div>
    <span class="act2-action-arrow">→</span>
  `;
  action.onclick = () => switchToEvidence();

  injectAct2Facts();
}

function injectAct2Facts(): void {
  const list = document.querySelector<HTMLUListElement>('.premium-fact-list');
  if (!list) return;
  list.querySelectorAll('.act2-fact').forEach((item) => item.remove());

  const facts: string[] = [];
  if (passageFound()) facts.push('Архивный план подтверждает скрытый технический проход между номерами 312 и 314.');
  if (state.roomFindings.includes('wardrobe-panel')) facts.push('Панель в шкафу номера 312 открывали недавно; за ней сохранилась старая дверная коробка.');
  if (roomComplete()) facts.push('Следы в номерах 312 и 314 совпадают: скрытый маршрут использовали в ночь исчезновения.');

  facts.forEach((fact, index) => {
    const item = document.createElement('li');
    item.className = 'act2-fact';
    item.innerHTML = `<span>A2-${String(index + 1).padStart(2, '0')}</span><p>${fact}</p>`;
    list.append(item);
  });
}

function evidenceCard(id: 'E006' | 'E007', unlocked: boolean): HTMLButtonElement {
  const plan = id === 'E006';
  const seen = plan ? state.planFindings.length > 0 : state.roomFindings.length > 0;
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `premium-evidence-card ${plan ? 'amber' : 'cyan'} ${seen ? 'seen' : ''} ${unlocked ? '' : 'locked'} act2-evidence-card`;
  card.dataset.evidenceId = id;
  card.disabled = !unlocked;
  card.innerHTML = `
    ${plan ? '<div class="act2-card-blueprint"></div>' : `<img src="${ROOM_312_IMAGE}" alt=""/>`}
    <div class="evidence-card-shade"></div>
    <div class="evidence-card-top"><span>${id}</span><span class="premium-pill ${seen ? 'secure' : unlocked ? 'live' : 'neutral'}">${seen ? 'Изучено' : unlocked ? 'Новое' : 'Закрыто'}</span></div>
    <div class="evidence-card-icon">${plan ? '⌗' : '⌖'}</div>
    <div class="evidence-card-copy"><small>${plan ? 'Архивный документ' : 'Интерактивная сцена'}</small><h2>${plan ? 'Архивный план третьего этажа' : 'Осмотр номера 312'}</h2><p>${unlocked ? (plan ? 'Сравните стены 312 и 314 и найдите отличие от современной схемы.' : 'Проверьте общую стену, мебель и следы внутри номера Кирилла.') : 'Доступ откроется после обнаружения скрытого прохода.'}</p></div>
    <span class="evidence-number">0${plan ? '6' : '7'}</span>
  `;
  card.onclick = () => plan ? openPlanModal() : openRoomModal();
  return card;
}

function enhanceEvidenceGrid(): void {
  if (!act1Complete()) return;
  const grid = document.querySelector<HTMLElement>('.premium-evidence-grid');
  if (!grid) return;

  const existingPlan = grid.querySelector<HTMLElement>('[data-evidence-id="E006"]');
  const existingRoom = grid.querySelector<HTMLElement>('[data-evidence-id="E007"]');
  existingPlan?.remove();
  existingRoom?.remove();
  grid.append(evidenceCard('E006', true), evidenceCard('E007', passageFound()));

  const sectionStat = grid.closest('.premium-section')?.querySelector<HTMLElement>('.section-stat span');
  if (sectionStat) sectionStat.innerHTML = `из ${7}<br/>изучено`;
}

function closeAct2Modal(): void {
  document.querySelector('.act2-modal-backdrop')?.remove();
}

function modalShell(id: string, category: string, title: string, summary: string): { backdrop: HTMLDivElement; modal: HTMLElement; body: HTMLElement } {
  closeAct2Modal();
  const backdrop = document.createElement('div');
  backdrop.className = 'premium-modal-backdrop act2-modal-backdrop';
  backdrop.innerHTML = `
    <section class="premium-modal evidence-modal-premium act2-modal evidence-${id.toLowerCase()}">
      <header class="premium-modal-header"><div><p class="premium-kicker">${category} · ${id}</p><h1>${title}</h1><p>${summary}</p></div><button class="premium-icon-button close act2-close" aria-label="Закрыть">×</button></header>
      <div class="premium-modal-body act2-modal-body"></div>
      <footer class="premium-modal-footer"><span class="act2-save-note">Прогресс второго акта сохранён</span><button class="premium-cta compact act2-return">Вернуться в штаб <span>→</span></button></footer>
    </section>
  `;
  const modal = backdrop.querySelector<HTMLElement>('.act2-modal')!;
  const body = backdrop.querySelector<HTMLElement>('.act2-modal-body')!;
  backdrop.addEventListener('mousedown', (event) => {
    if (event.target === backdrop) closeAct2Modal();
  });
  backdrop.querySelector('.act2-close')?.addEventListener('click', closeAct2Modal);
  backdrop.querySelector('.act2-return')?.addEventListener('click', closeAct2Modal);
  document.body.append(backdrop);
  return { backdrop, modal, body };
}

function openPlanModal(): void {
  if (!act1Complete()) return;
  const { body } = modalShell(
    'E006',
    'Архивный документ',
    'Архивный план третьего этажа',
    'Сравните конструктивные линии и найдите, что исчезло из современной планировки.'
  );

  body.innerHTML = `
    <div class="act2-plan-layout">
      <div class="archive-plan-sheet">
        <div class="plan-paper-grid"></div>
        <div class="plan-heading"><span>ОТЕЛЬ «СЕВЕРНЫЙ СКЛОН»</span><strong>ЭТАЖ 3 · ОБМЕРНЫЙ ПЛАН 2004</strong><small>Архивный экземпляр / лист 3-А</small></div>
        <div class="plan-corridor"><span>ГОСТЕВОЙ КОРИДОР</span></div>
        <div class="plan-room plan-310"><b>310</b><small>18.4 м²</small></div>
        <div class="plan-room plan-312"><b>312</b><small>19.1 м²</small><i>ТЕХ. НИША</i></div>
        <div class="plan-room plan-314"><b>314</b><small>20.0 м²</small></div>
        <div class="plan-hidden-door ${passageFound() ? 'revealed' : ''}"><span></span><em>старый проём 820 мм</em></div>
        <div class="plan-service-void"><span>960</span></div>
        <div class="plan-renovation-stamp">РЕКОНСТРУКЦИЯ 2015<br/><b>ЗАКРЫТЬ ПАНЕЛЯМИ</b></div>
        ${Object.entries(PLAN_FINDINGS).map(([id, finding]) => `<button class="plan-hotspot ${state.planFindings.includes(id as PlanFindingId) ? 'inspected' : ''}" data-finding="${id}"><span>${state.planFindings.includes(id as PlanFindingId) ? '✓' : finding.index}</span><i>${finding.label}</i></button>`).join('')}
        <div class="plan-scale">0&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;3 м</div>
      </div>
      <aside class="act2-investigation-panel">
        <div class="act2-progress"><span>${state.planFindings.length}/3</span><div><strong>Сопоставление плана</strong><small>${passageFound() ? 'Скрытый маршрут найден' : 'Проверьте три несоответствия'}</small></div></div>
        <div class="act2-finding-list">${Object.entries(PLAN_FINDINGS).map(([id, finding]) => `<button data-finding="${id}" class="${state.planFindings.includes(id as PlanFindingId) ? 'done' : ''}"><span>${state.planFindings.includes(id as PlanFindingId) ? '✓' : finding.index}</span><div><strong>${finding.label}</strong><small>${state.planFindings.includes(id as PlanFindingId) ? finding.title : 'Проверить отметку'}</small></div></button>`).join('')}</div>
        <div class="act2-result ${passageFound() ? 'success' : ''}">${passageFound()
          ? '<p class="premium-kicker">Новый факт</p><h3>Между 312 и 314 сохранился технический проход</h3><p>Современная отделка скрывает старую дверь. Проверить маршрут можно только со стороны номера Кирилла.</p><button class="act2-open-room">Открыть осмотр номера 312 →</button>'
          : '<span>⌗</span><strong>Найдите три несоответствия</strong><p>Изучайте не подписи комнат, а толщину стен, строительные отметки и следы реконструкции.</p>'}</div>
      </aside>
    </div>
  `;

  body.querySelectorAll<HTMLElement>('[data-finding]').forEach((element) => {
    element.addEventListener('click', () => {
      const id = element.dataset.finding as PlanFindingId;
      if (!PLAN_FINDINGS[id]) return;
      state.planFindings = unique([...state.planFindings, id]);
      saveAct2Progress();
      openPlanModal();
      scheduleScan();
    });
  });
  body.querySelector('.act2-open-room')?.addEventListener('click', openRoomModal);
}

function openRoomModal(): void {
  if (!passageFound()) return;
  const { body } = modalShell(
    'E007',
    'Интерактивная сцена',
    'Осмотр номера 312',
    'Проверьте комнату Кирилла и найдите физическое продолжение маршрута из номера 314.'
  );

  const latest = state.roomFindings.at(-1);
  const latestFinding = latest ? ROOM_FINDINGS[latest] : null;
  body.innerHTML = `
    <div class="act2-room-layout">
      <div class="act2-room-photo">
        <img src="${ROOM_312_IMAGE}" alt="Номер 312"/>
        <div class="act2-room-grade"></div>
        <div class="act2-scene-label"><span>SCENE 312</span><small>08:46 · повторный осмотр</small></div>
        ${Object.entries(ROOM_FINDINGS).map(([id, finding]) => `<button class="act2-room-marker marker-${id} ${state.roomFindings.includes(id as RoomFindingId) ? 'inspected' : ''}" data-room-finding="${id}"><span>${state.roomFindings.includes(id as RoomFindingId) ? '✓' : finding.index}</span><i>${finding.label}</i></button>`).join('')}
      </div>
      <aside class="act2-investigation-panel">
        <div class="act2-progress"><span>${state.roomFindings.length}/4</span><div><strong>Зоны осмотра</strong><small>${roomComplete() ? 'Маршрут подтверждён' : 'Проверьте номер целиком'}</small></div></div>
        <div class="act2-finding-list">${Object.entries(ROOM_FINDINGS).map(([id, finding]) => `<button data-room-finding="${id}" class="${state.roomFindings.includes(id as RoomFindingId) ? 'done' : ''}"><span>${state.roomFindings.includes(id as RoomFindingId) ? '✓' : finding.index}</span><div><strong>${finding.label}</strong><small>${state.roomFindings.includes(id as RoomFindingId) ? finding.title : 'Осмотреть зону'}</small></div></button>`).join('')}</div>
        <div class="act2-result ${roomComplete() ? 'success' : ''}">${latestFinding
          ? `<p class="premium-kicker">Обнаружено</p><h3>${latestFinding.title}</h3><p>${latestFinding.description}</p>${roomComplete() ? '<div class="act2-final-conclusion"><strong>Маршрут доказан</strong><span>312 → скрытая панель → 314</span></div>' : ''}`
          : '<span>⌖</span><strong>Начните с общей стены</strong><p>Сопоставьте комнату с архивным планом и следами, найденными в номере Ильи.</p>'}</div>
      </aside>
    </div>
  `;

  body.querySelectorAll<HTMLElement>('[data-room-finding]').forEach((element) => {
    element.addEventListener('click', () => {
      const id = element.dataset.roomFinding as RoomFindingId;
      if (!ROOM_FINDINGS[id]) return;
      state.roomFindings = unique([...state.roomFindings, id]);
      saveAct2Progress();
      openRoomModal();
      scheduleScan();
    });
  });
}

function enhanceInterview(): void {
  if (!act1Complete()) return;
  const name = document.querySelector<HTMLElement>('.character-modal-premium .interview-name h1')?.textContent?.trim();
  const questions = document.querySelector<HTMLElement>('.character-modal-premium .interview-questions');
  if (!name || !questions || !EXTRA_QUESTIONS[name]) return;

  questions.querySelectorAll('.act2-interview-topic').forEach((item) => item.remove());
  EXTRA_QUESTIONS[name].forEach((topic) => {
    const unlocked = topic.unlocked();
    const asked = state.askedQuestions.includes(topic.id);
    const article = document.createElement('article');
    article.className = `act2-interview-topic ${unlocked ? '' : 'locked'} ${asked ? 'asked' : ''}`;
    article.innerHTML = `<button ${unlocked ? '' : 'disabled'}><span>${asked ? '↻' : unlocked ? '→' : '⌁'}</span><div><small>${asked ? 'Повторить вопрос' : unlocked ? 'Новый вопрос акта II' : 'Нужны материалы второго акта'}</small><strong>${topic.question}</strong></div></button>${asked ? `<div class="interview-answer"><span>${name.split(' ')[0]}</span><p>${topic.answer}</p></div>` : ''}`;
    article.querySelector('button')?.addEventListener('click', () => {
      if (!unlocked) return;
      state.askedQuestions = unique([...state.askedQuestions, topic.id]);
      saveAct2Progress();
      enhanceInterview();
    });
    questions.append(article);
  });
}

function scan(): void {
  setVersion();
  enhanceTopbar();
  enhanceDashboard();
  enhanceEvidenceGrid();
  enhanceInterview();
}

function scheduleScan(): void {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    scan();
  });
}

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(scheduleScan, 70), true);
window.addEventListener('storage', () => {
  state = loadAct2Progress();
  scheduleScan();
});

scheduleScan();
