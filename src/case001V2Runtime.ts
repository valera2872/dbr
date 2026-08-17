import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY
} from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

type JsonState = Record<string, unknown>;
type Act2State = { plan: string[]; room: string[]; questions: string[] };
type Act3State = { archive: string[]; identity: string[]; questions: string[]; checkpointAnswer: string | null; complete: boolean };
type Act4State = {
  search: string[];
  card: string[];
  finalAnswer: string | null;
  wrongAnswers: string[];
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
};

type SearchDefinition = {
  id: string;
  n: string;
  label: string;
  title: string;
  text: string;
  effect: string;
};

const ARCHIVE_REQUESTED = 'agency3:archive-requested';
const MARINA_CLOSURE = 'v2:marina-closure';
const M3_LOG = 'v2:m3-log';
const DESK_SAMPLED = 'v2:desk-sampled';
const RESCUE_COMPLETE = 'v2:rescue-complete';
const SEARCH_IDS = ['entry', 'ilya', 'medical', 'lamp'];

const SEARCH: SearchDefinition[] = [
  {
    id: 'entry',
    n: '01',
    label: 'Дверь S-3',
    title: 'Комната изолирована со стороны служебной сети',
    text: 'Старая механическая защёлка закрыта со стороны P3. Изнутри S-3 без инструмента её не открыть, а в гостевой коридор отдельного выхода нет.',
    effect: 'Версия добровольной инсценировки резко слабеет.'
  },
  {
    id: 'ilya',
    n: '02',
    label: 'За ширмой',
    title: 'Илья найден живым',
    text: 'Илья дезориентирован после травмы головы. Он реагирует на голос, но сейчас не способен надёжно восстановить лицо нападавшего или точную последовательность переноса.',
    effect: 'Спасение потерпевшего отделяется от доказательства личности нападавшего.'
  },
  {
    id: 'medical',
    n: '03',
    label: 'Аптечный шкаф',
    title: 'Кто-то оказал минимальную помощь и ушёл',
    text: 'Открыты антисептик и бинт. Помощь была поверхностной: вызова медиков не было, телефон потерпевшего отсутствует.',
    effect: 'Тот, кто перенёс Илью, понимал, что он жив, но сознательно оставил его без связи.'
  },
  {
    id: 'lamp',
    n: '04',
    label: 'Техническая ниша',
    title: 'Найден адаптер 314-17 — без microSD',
    text: 'В нише лежит заметный адаптер с маркировкой 314-17. Самой microSD внутри нет. Значит, ключевой оригинал всё ещё не учтён.',
    effect: 'Появляется основание для отдельного целевого поиска носителя, а не готовая финальная улика.'
  }
];

let latestState: InvestigationSnapshot | null = null;
let scheduled = false;
let installed = false;

function object(value: unknown): JsonState {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonState : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string'))) : [];
}

function readRaw(key: string): JsonState {
  try {
    return object(JSON.parse(localStorage.getItem(key) ?? '{}'));
  } catch {
    return {};
  }
}

function readAct2(): Act2State {
  const raw = readRaw(ACT2_STORAGE_KEY);
  return { plan: strings(raw.plan), room: strings(raw.room), questions: strings(raw.questions) };
}

function readAct3(): Act3State {
  const raw = readRaw(ACT3_STORAGE_KEY);
  return {
    archive: strings(raw.archive),
    identity: strings(raw.identity),
    questions: strings(raw.questions),
    checkpointAnswer: typeof raw.checkpointAnswer === 'string' ? raw.checkpointAnswer : null,
    complete: raw.complete === true
  };
}

function readAct4(): Act4State {
  const raw = readRaw(ACT4_STORAGE_KEY);
  return {
    search: strings(raw.search),
    card: strings(raw.card),
    finalAnswer: typeof raw.finalAnswer === 'string' ? raw.finalAnswer : null,
    wrongAnswers: strings(raw.wrongAnswers),
    complete: raw.complete === true,
    startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : null,
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null
  };
}

function unique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

function writeAct2Marker(marker: string): void {
  const raw = readRaw(ACT2_STORAGE_KEY);
  const next = { ...raw, questions: unique(strings(raw.questions), marker) };
  localStorage.setItem(ACT2_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act2-updated', { detail: { v2: marker } }));
  refreshInvestigationState(`case001-v2:${marker}`);
  schedule(`case001-v2:${marker}`);
}

function writeAct3Marker(marker: string): void {
  const raw = readRaw(ACT3_STORAGE_KEY);
  const next = { ...raw, questions: unique(strings(raw.questions), marker) };
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { v2: marker } }));
  refreshInvestigationState(`case001-v2:${marker}`);
  schedule(`case001-v2:${marker}`);
}

function writeSearch(id: string): void {
  const raw = readRaw(ACT4_STORAGE_KEY);
  const current = readAct4();
  const nextSearch = unique(current.search, id);
  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify({
    ...raw,
    search: nextSearch,
    card: current.card,
    wrongAnswers: current.wrongAnswers,
    complete: current.complete,
    startedAt: current.startedAt ?? new Date().toISOString(),
    completedAt: current.completedAt
  }));
  window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { source: 'case001-v2-early-search', id } }));
  if (SEARCH_IDS.every((item) => nextSearch.includes(item)) && !readAct3().questions.includes(RESCUE_COMPLETE)) {
    writeAct3Marker(RESCUE_COMPLETE);
  } else {
    refreshInvestigationState(`case001-v2:search:${id}`);
    schedule(`case001-v2:search:${id}`);
  }
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  const target = buttons.find((button) => button.textContent?.includes(label) && window.getComputedStyle(button).display !== 'none');
  target?.click();
}

function openEvidence(id: string): void {
  clickTab('Материалы');
  window.setTimeout(() => {
    document.querySelector<HTMLButtonElement>(`[data-evidence-id="${id}"]`)?.click();
  }, 180);
}

function hasAct2(marker: string): boolean {
  return readAct2().questions.includes(marker);
}

function hasAct3(marker: string): boolean {
  return readAct3().questions.includes(marker);
}

function rescueDone(): boolean {
  const state = readAct4();
  return SEARCH_IDS.every((id) => state.search.includes(id));
}

function v2Active(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.act2Complete
    && !state.act3.complete;
}

function setText(node: Element | null, value: string): void {
  if (node && node.textContent !== value) node.textContent = value;
}

function patchEvidenceCards(): void {
  setText(
    document.querySelector<HTMLElement>('[data-evidence-id="E006"] .evidence-card-copy p'),
    'Сопоставьте V314, старый доступ из 312 и продолжение сети к служебной зоне.'
  );
  setText(
    document.querySelector<HTMLElement>('[data-evidence-id="E007"] .evidence-card-copy p'),
    'Проверьте, сохранился ли доступ из 312 и соединяется ли он с независимой служебной веткой.'
  );
}

function patchE006(): void {
  const modal = document.querySelector<HTMLElement>('.evidence-e006');
  if (!modal) return;

  setText(modal.querySelector('.premium-modal-header > div > p:last-child'), 'Сопоставьте старую топологию этажа с современной схемой. Ищите не виновного, а возможные пути перемещения.');

  modal.querySelectorAll<HTMLElement>('[data-plan="width"]').forEach((node) => {
    setText(node.querySelector('i'), 'Служебная ветка');
    setText(node.querySelector('strong'), 'Служебная ветка');
    const small = node.querySelector('small');
    if (small && small.textContent?.includes('Служебная полость')) {
      small.textContent = 'V314 соединяется со старой веткой P3 к служебной зоне';
    }
  });

  const sheet = modal.querySelector<HTMLElement>('.archive-plan-sheet');
  if (sheet && !sheet.querySelector('.case001-v2-plan-branch')) {
    const branch = document.createElement('div');
    branch.className = 'case001-v2-plan-branch';
    branch.innerHTML = '<span>V314</span><i></i><b>P3 → M3 / SL3 / S-3</b>';
    sheet.append(branch);
  }

  const act2 = readAct2();
  const latest = act2.plan.at(-1);
  const result = modal.querySelector<HTMLElement>('.act2-result');
  if (result?.classList.contains('success')) {
    setText(result.querySelector('h3'), 'Старая сеть связывала 312 / 314 со служебной зоной');
    setText(result.querySelector('p:last-of-type'), 'V314 имел доступ со стороны 312 и продолжение к технической ветке P3. Это доказывает возможный маршрут, но не личность того, кто им воспользовался.');
    setText(result.querySelector('.act2-open-room'), 'Проверить современную проходимость из 312 →');
  } else if (latest === 'width') {
    setText(result?.querySelector('h3'), 'Полость продолжается в старую служебную сеть');
    setText(result?.querySelector('p:last-child'), 'Обмеры показывают: V314 не заканчивается между двумя номерами, а соединяется с технической веткой P3, ведущей к staff-зоне.');
  }
}

function patchE007(): void {
  const modal = document.querySelector<HTMLElement>('.evidence-e007');
  if (!modal) return;

  setText(modal.querySelector('.premium-modal-header > div > p:last-child'), 'Проверьте современную проходимость V314, следы использования и связь с технической веткой. Не делайте вывод о пользователе маршрута раньше доказательств.');

  modal.querySelectorAll<HTMLElement>('[data-room="envelope"]').forEach((node) => {
    setText(node.querySelector('i'), 'Служебное ответвление');
    setText(node.querySelector('strong'), 'Служебное ответвление');
    const small = node.querySelector('small');
    if (small && (small.textContent?.includes('Конверт') || small.textContent?.includes('Открыть'))) {
      small.textContent = readAct2().room.includes('envelope')
        ? 'За полостью виден старый узел P3 с маркировкой M3 / SL3'
        : 'Проверить продолжение V314';
    }
  });

  const latest = readAct2().room.at(-1);
  const result = modal.querySelector<HTMLElement>('.act2-result');
  if (latest === 'envelope') {
    setText(result?.querySelector('h3'), 'V314 не является приватным тоннелем номера 312');
    setText(result?.querySelector('p:last-of-type'), 'За старой коробкой проходит ответвление P3. Оно соединяет V314 со служебным входом M3 и направлением к служебному лифту / S-3.');
  }

  const conclusion = result?.querySelector<HTMLElement>('.act2-final-conclusion');
  if (conclusion) {
    setText(conclusion.querySelector('strong'), 'Сеть использовали этой ночью');
    setText(conclusion.querySelector('span'), '312 ↔ V314 ↔ P3 ↔ служебная ветка');
    if (!conclusion.querySelector('.case001-v2-proof-limit')) {
      const note = document.createElement('small');
      note.className = 'case001-v2-proof-limit';
      note.textContent = 'E007 доказывает свежую проходимость. Кто именно вошёл в сеть — пока не доказано.';
      conclusion.append(note);
    }
  }
}

function patchInterviewBias(): void {
  const modal = document.querySelector<HTMLElement>('.character-modal-premium');
  if (!modal) return;
  modal.querySelectorAll<HTMLElement>('.interview-answer p').forEach((paragraph) => {
    if (paragraph.textContent?.includes('Если Кирилл знал старую планировку, мастер-ключ ему не требовался')) {
      paragraph.textContent = 'Панель из 312 действительно открывается обычным инструментом. Но старая сеть имела и staff-вход M3. Чтобы понять, кто мог пройти этой ночью, нужно проверять оба доступа, а не назначать виновного по номеру комнаты.';
    }
  });
}

function branchCard(
  icon: string,
  title: string,
  body: string,
  action: string | null,
  actionLabel: string,
  state: 'open' | 'progress' | 'done' = 'open'
): string {
  return `<article class="case001-v2-branch-card ${state}">
    <div class="case001-v2-branch-icon">${icon}</div>
    <div class="case001-v2-branch-copy"><small>${state === 'done' ? 'Установлено' : state === 'progress' ? 'В работе' : 'Линия проверки'}</small><h3>${title}</h3><p>${body}</p></div>
    ${action ? `<button type="button" data-case001-v2-action="${action}">${actionLabel}<span>→</span></button>` : '<span class="case001-v2-branch-done">✓</span>'}
  </article>`;
}

function renderBranchPanel(state: InvestigationSnapshot): void {
  const old = document.querySelector<HTMLElement>('.case001-v2-branch-panel');
  if (!v2Active(state)) {
    old?.remove();
    document.documentElement.dataset.case001V2Branching = 'off';
    return;
  }

  document.documentElement.dataset.case001V2Branching = 'active';

  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  const hero = dashboard?.querySelector<HTMLElement>('.dashboard-hero');
  if (!dashboard || !hero) return;

  const closure = hasAct2(MARINA_CLOSURE);
  const m3 = hasAct2(M3_LOG);
  const sampled = hasAct3(DESK_SAMPLED);
  const archiveRequested = hasAct3(ARCHIVE_REQUESTED);
  const rescued = rescueDone();
  const archiveStarted = state.derived.archiveCount > 0;

  const signature = [closure, m3, sampled, archiveRequested, rescued, state.derived.archiveCount, state.derived.identityCount].join(':');
  if (old?.dataset.signature === signature) return;
  old?.remove();

  const panel = document.createElement('section');
  panel.className = 'case001-v2-branch-panel';
  panel.dataset.signature = signature;
  panel.innerHTML = `
    <header class="case001-v2-branch-head">
      <div><p>Дело №001 · следственная развилка v2</p><h2>Маршрут найден. Исполнитель — ещё нет.</h2><span>V314 можно было достигнуть из 312, но старая сеть имела и независимый staff-доступ M3. Телефон Ильи оказался у служебного лифта. Выберите, какие линии проверять и в каком порядке.</span></div>
      <strong>${Number(rescued) + Number(archiveStarted) + Number(m3) + Number(sampled)}/4</strong>
    </header>
    <div class="case001-v2-branches">
      ${branchCard(
        '⌖',
        rescued ? 'Илья найден в S-3' : 'Где сейчас Илья?',
        rescued
          ? 'Поиск по служебной ветке дал результат. Илья жив, но его состояние пока не даёт надёжной идентификации нападавшего.'
          : 'E005 показывает постановочный след у служебного лифта, а E006/E007 — свежую проходимую сеть. Этого достаточно, чтобы искать по P3 в сторону S-3.',
        'search-s3',
        rescued ? 'Открыть протокол S-3' : 'Обыскать ветку P3 / S-3',
        rescued ? 'done' : 'open'
      )}
      ${branchCard(
        '▤',
        archiveStarted ? 'Происхождение B-17 проверяется' : archiveRequested ? 'BOX 15-B получен по запросу' : 'Что было целью нападения?',
        archiveStarted
          ? `Изучено элементов E008: ${state.derived.archiveCount}/4. Архивная ветка развивается независимо от поиска Ильи и проверки доступа.`
          : archiveRequested
            ? 'Запрос возник из пустого футляра, цели поездки Ильи и роли Дениса в оцифровке — без случайного конверта в 312.'
            : 'Пустой футляр, расследование смерти Антона и архивная роль Дениса уже дают основание проверить пропавший оригинал.',
        'archive',
        archiveRequested || archiveStarted ? 'Открыть E008' : 'Запросить BOX 15-B / журнал оцифровки',
        archiveStarted ? 'progress' : archiveRequested ? 'progress' : 'open'
      )}
      ${branchCard(
        '⌁',
        m3 ? 'Марина скрывала проблему здания, но M3 ночью не открывался' : closure ? 'Старую сеть закрыли не полностью' : 'Мог ли пройти персонал?',
        m3
          ? 'Акт полной конструктивной ликвидации отсутствует — Марина это знала. Но контроллер M3 не фиксирует ни одного открытия в критическое окно 23:30–01:00.'
          : closure
            ? 'Документы подтверждают косметическое закрытие гостевых створок при сохранённой технической сети. Теперь нужно проверить независимый staff-вход M3 именно этой ночью.'
            : 'Марина утверждала, что другого маршрута нет. E006/E007 этому противоречат. Проверьте документы реконструкции и затем журнал staff-входа.',
        m3 ? null : closure ? 'm3-log' : 'marina-closure',
        closure ? 'Запросить журнал M3' : 'Поднять акт реконструкции 2015',
        m3 ? 'done' : closure ? 'progress' : 'open'
      )}
      ${branchCard(
        '◉',
        sampled ? 'Микрослед со стола сохранён для сравнения' : 'Кто физически был в 314?',
        sampled
          ? 'Под затёртым следом выделен небольшой биологический микрослед. Сам по себе он пока не называет человека; сравнение должно появиться только при законном следственном основании.'
          : 'Маршрут даёт возможность, но не личность. Вернитесь к затёртому следу E001 и проведите целевой криминалистический отбор.',
        sampled ? null : 'desk-sample',
        'Взять микрослед с затёртой зоны',
        sampled ? 'done' : 'open'
      )}
    </div>
    <footer><strong>Правило v2:</strong><span>маршрут ≠ виновник. Каждая ветка отвечает на отдельный вопрос: где потерпевший, что было целью, кто имел доступ и кто реально находился в 314.</span></footer>`;

  hero.insertAdjacentElement('afterend', panel);
  panel.querySelectorAll<HTMLButtonElement>('[data-case001-v2-action]').forEach((button) => {
    button.addEventListener('click', () => handleBranchAction(button.dataset.case001V2Action ?? ''));
  });
}

function handleBranchAction(action: string): void {
  if (action === 'search-s3') {
    openSearchModal();
    return;
  }
  if (action === 'archive') {
    if (!hasAct3(ARCHIVE_REQUESTED)) writeAct3Marker(ARCHIVE_REQUESTED);
    openEvidence('E008');
    return;
  }
  if (action === 'marina-closure') {
    writeAct2Marker(MARINA_CLOSURE);
    return;
  }
  if (action === 'm3-log') {
    writeAct2Marker(M3_LOG);
    return;
  }
  if (action === 'desk-sample') {
    writeAct3Marker(DESK_SAMPLED);
  }
}

function closeSearchModal(): void {
  document.querySelector('.case001-v2-search-backdrop')?.remove();
}

function openSearchModal(): void {
  closeSearchModal();
  const state = readAct4();
  const complete = SEARCH_IDS.every((id) => state.search.includes(id));
  const backdrop = document.createElement('div');
  backdrop.className = 'premium-modal-backdrop case001-v2-search-backdrop';
  backdrop.innerHTML = `
    <section class="premium-modal case001-v2-search-modal">
      <header class="premium-modal-header"><div><p class="premium-kicker">Ранний поиск · S-3</p><h1>Обыск старой служебной ветки</h1><p>E005 + E006 + E007 дали основание искать потерпевшего здесь до установления личности нападавшего.</p></div><button class="premium-icon-button close" data-v2-search-close aria-label="Закрыть">×</button></header>
      <div class="case001-v2-search-grid">
        <section class="case001-v2-search-scene">
          <div class="case001-v2-search-map"><span>P3</span><i></i><b>S-3</b><em>SL3</em></div>
          ${SEARCH.map((item) => `<button type="button" class="case001-v2-search-point ${state.search.includes(item.id) ? 'done' : ''}" data-v2-search="${item.id}"><span>${state.search.includes(item.id) ? '✓' : item.n}</span><strong>${item.label}</strong></button>`).join('')}
        </section>
        <aside class="case001-v2-search-findings">
          <div class="case001-v2-search-progress"><strong>${state.search.length}/4</strong><span>${complete ? 'Поиск завершён' : 'Контрольных зон проверено'}</span></div>
          ${SEARCH.map((item) => `<article class="${state.search.includes(item.id) ? 'done' : ''}"><span>${state.search.includes(item.id) ? '✓' : item.n}</span><div><strong>${item.title}</strong><p>${state.search.includes(item.id) ? item.text : 'Зона ещё не осмотрена.'}</p>${state.search.includes(item.id) ? `<small>${item.effect}</small>` : ''}</div></article>`).join('')}
          ${complete ? '<div class="case001-v2-search-result"><p>ПОТЕРПЕВШИЙ НАЙДЕН</p><h3>Илья жив. Но дело ещё не раскрыто.</h3><span>Поиск решил задачу спасения. Личность нападавшего, происхождение B-17 и microSD по-прежнему требуют независимых доказательств.</span></div>' : ''}
        </aside>
      </div>
      <footer class="premium-modal-footer"><span>Поиск сохраняется в каноническом Act IV state без смены ключа.</span><button class="premium-cta compact" data-v2-search-close>${complete ? 'Вернуться к параллельным версиям' : 'Вернуться к развилке'} <span>→</span></button></footer>
    </section>`;

  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) closeSearchModal(); });
  backdrop.querySelectorAll('[data-v2-search-close]').forEach((node) => node.addEventListener('click', closeSearchModal));
  backdrop.querySelectorAll<HTMLButtonElement>('[data-v2-search]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.v2Search;
      if (!id) return;
      writeSearch(id);
      openSearchModal();
    });
  });
  document.body.append(backdrop);
}

function hideLegacyArchiveLead(state: InvestigationSnapshot): void {
  if (!v2Active(state)) return;
  document.querySelectorAll<HTMLElement>('.evidence-led-panel').forEach((panel) => {
    const mode = panel.dataset.evidenceLedMode;
    if (mode === 'archive-lead' || mode === 'archive-received') panel.dataset.case001V2Superseded = '1';
  });
}

function patch(state: InvestigationSnapshot): void {
  latestState = state;
  patchEvidenceCards();
  patchE006();
  patchE007();
  patchInterviewBias();
  renderBranchPanel(state);
  hideLegacyArchiveLead(state);
}

function schedule(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    patch(latestState ?? refreshInvestigationState(reason));
  }));
}

export function installCase001V2Runtime(): void {
  if (installed) return;
  installed = true;
  subscribeInvestigationState((state) => {
    latestState = state;
    schedule('case001-v2:state');
  });
  document.addEventListener('click', () => schedule('case001-v2:click'), true);
  window.addEventListener('dbr:act2-updated', () => schedule('case001-v2:act2'));
  window.addEventListener('dbr:act3-updated', () => schedule('case001-v2:act3'));
  window.addEventListener('dbr:act4-updated', () => schedule('case001-v2:act4'));
  window.addEventListener('dbr:runtime-settled', () => schedule('case001-v2:runtime'));
  window.addEventListener('pageshow', () => schedule('case001-v2:pageshow'));
  new MutationObserver(() => schedule('case001-v2:mutation')).observe(document.documentElement, { childList: true, subtree: true });
  latestState = refreshInvestigationState('case001-v2:init');
  schedule('case001-v2:init');
}
