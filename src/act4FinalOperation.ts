import {
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';

export {};

type Act3State = { complete?: boolean };
type InterrogationState = { complete?: boolean };

type Act4State = {
  search: string[];
  card: string[];
  finalAnswer: string | null;
  wrongAnswers: string[];
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
};

type SearchPoint = {
  n: string;
  label: string;
  title: string;
  text: string;
  fact: string;
};

type CardCheck = {
  n: string;
  label: string;
  title: string;
  text: string;
  code: string;
};

const SEARCH_IDS = ['entry', 'ilya', 'medical', 'lamp'];
const CARD_IDS = ['serial', 'copy', 'clip', 'integrity'];

const SEARCH_POINTS: Record<string, SearchPoint> = {
  entry: {
    n: '01',
    label: 'Дверь и защёлка',
    title: 'Комнату заперли снаружи',
    text: 'Внутренняя ручка исправна, но сервисную защёлку перевели с коридора. Человек внутри не мог открыть дверь без инструмента.',
    fact: 'Кирилл не просто перенёс Илью — он намеренно ограничил возможность выбраться.'
  },
  ilya: {
    n: '02',
    label: 'За складной ширмой',
    title: 'Илья найден живым',
    text: 'Илья дезориентирован, на виске ушиб. Дыхание стабильное. Он реагирует на голос и сообщает, что карту успел спрятать до потери сознания.',
    fact: 'Исчезновение было сокрытием пострадавшего, а не убийством или добровольным уходом.'
  },
  medical: {
    n: '03',
    label: 'Аптечный шкаф',
    title: 'Кто-то пытался остановить кровь',
    text: 'Из шкафа взяты бинт и антисептик. Упаковки лежат рядом с Ильёй. Помощь была минимальной, после неё человека оставили без связи.',
    fact: 'Кирилл понимал, что Илья жив и нуждается в медицинской помощи.'
  },
  lamp: {
    n: '04',
    label: 'Аварийный светильник',
    title: 'Под плафоном спрятан переходник microSD',
    text: 'На корпусе свежие следы пальцев, внутри — пустой адаптер с номером 314-17. Илья показывает на решётку технической ниши рядом.',
    fact: 'Карта не была у Кирилла: Илья успел отделить microSD от заметного адаптера.'
  }
};

const CARD_CHECKS: Record<string, CardCheck> = {
  serial: {
    n: '01',
    label: 'Серийный номер',
    title: 'Носитель совпадает с архивной записью',
    text: 'Идентификатор карты совпадает с журналом выдачи и маркировкой футляра из сумки Ильи.',
    code: '314-17 / MATCH'
  },
  copy: {
    n: '02',
    label: 'Журнал копирования',
    title: 'Илья успел создать проверочную копию',
    text: 'В 23:56 начато копирование оригинала. Контрольная сумма записана в черновик и совпадает с файлом на карте.',
    code: '23:56:11 / COPY OK'
  },
  clip: {
    n: '03',
    label: 'Фрагмент B-17',
    title: 'Запись раскрывает старый мотив',
    text: 'Антон фиксирует незакрытый служебный маршрут. Кирилл требует убрать запись и продолжить мероприятие, несмотря на снятое ограждение у технической лестницы.',
    code: '2015 / B-17 / ORIGINAL'
  },
  integrity: {
    n: '04',
    label: 'Проверка целостности',
    title: 'Фрагмент не редактировался',
    text: 'Метаданные, последовательность кадров и контрольная сумма подтверждают непрерывную оригинальную запись.',
    code: 'SHA-256 / VERIFIED'
  }
};

const FINAL_OPTIONS = [
  {
    id: 'premeditated',
    text: 'Кирилл заранее планировал убить Антона в 2015 году и Илью этой ночью.',
    feedback: 'Материалы подтверждают сокрытие опасного нарушения и нападение на Илью, но не доказывают заранее подготовленное убийство.'
  },
  {
    id: 'conspiracy',
    text: 'Денис, Вера и Кирилл совместно инсценировали исчезновение ради карты.',
    feedback: 'Денис и Вера действительно лгали, но по разным причинам. Их перемещения и дальнейшие действия не подтверждают общий сговор.'
  },
  {
    id: 'kirill_responsibility',
    text: 'Кирилл пришёл за картой через скрытый проход, травмировал Илью во время борьбы, перенёс его в служебную комнату и не вызвал помощь. Карта доказывает его роль в сокрытии опасного нарушения 2015 года, после которого погиб Антон.',
    feedback: 'Верно. Мотив, маршрут, действия после нападения и содержание оригинала образуют единую доказательную цепочку.',
    correct: true
  },
  {
    id: 'staged',
    text: 'Илья сам инсценировал исчезновение, чтобы вынудить участников признаться.',
    feedback: 'Состояние Ильи, запертая снаружи дверь, следы перемещения и признание Кирилла исключают добровольную инсценировку.'
  }
];

let state = load();
let scheduled = false;
let reportOpen = false;

function initialState(): Act4State {
  return {
    search: [],
    card: [],
    finalAnswer: null,
    wrongAnswers: [],
    complete: false,
    startedAt: null,
    completedAt: null
  };
}

function load(): Act4State {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACT4_STORAGE_KEY) ?? '{}') as Partial<Act4State>;
    return {
      ...initialState(),
      ...parsed,
      search: Array.isArray(parsed.search) ? parsed.search : [],
      card: Array.isArray(parsed.card) ? parsed.card : [],
      wrongAnswers: Array.isArray(parsed.wrongAnswers) ? parsed.wrongAnswers : []
    };
  } catch {
    return initialState();
  }
}

function save(): void {
  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { complete: state.complete } }));
}

function readJson<T>(key: string): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '{}') as T; }
  catch { return {} as T; }
}

function add(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

function unlocked(): boolean {
  return readJson<Act3State>(ACT3_STORAGE_KEY).complete === true
    && readJson<InterrogationState>(INTERROGATION_STORAGE_KEY).complete === true;
}

function searchDone(): boolean {
  return SEARCH_IDS.every((id) => state.search.includes(id));
}

function cardDone(): boolean {
  return CARD_IDS.every((id) => state.card.includes(id));
}

function closeModal(): void {
  document.querySelector('.act4-modal-backdrop')?.remove();
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  buttons.find((button) => button.textContent?.includes(label))?.click();
}

function shell(id: string, category: string, title: string, summary: string): HTMLElement {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'premium-modal-backdrop act4-modal-backdrop';
  backdrop.innerHTML = `
    <section class="premium-modal evidence-modal-premium act4-modal evidence-${id.toLowerCase()}">
      <header class="premium-modal-header">
        <div><p class="premium-kicker">${category} · ${id}</p><h1>${title}</h1><p>${summary}</p></div>
        <button class="premium-icon-button close act4-close" aria-label="Закрыть">×</button>
      </header>
      <div class="premium-modal-body act4-modal-body"></div>
      <footer class="premium-modal-footer">
        <span>Прогресс финальной операции сохраняется автоматически</span>
        <button class="premium-cta compact act4-return">Вернуться в штаб <span>→</span></button>
      </footer>
    </section>`;
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) closeModal(); });
  backdrop.querySelector('.act4-close')?.addEventListener('click', closeModal);
  backdrop.querySelector('.act4-return')?.addEventListener('click', closeModal);
  document.body.append(backdrop);
  return backdrop.querySelector<HTMLElement>('.act4-modal-body')!;
}

function searchModal(): void {
  if (!unlocked()) return;
  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
    save();
  }
  const latest = state.search.at(-1);
  const body = shell('E010', 'Финальная операция', 'Старая служебная комната', 'Проверьте помещение, куда Кирилл перенёс Илью через скрытый проход.');
  body.innerHTML = `
    <div class="act4-search-layout">
      <section class="act4-room-scene">
        <div class="act4-room-noise"></div>
        <div class="act4-room-label"><span>СЛУЖЕБНАЯ ЗОНА S-3</span><strong>${state.search.length}/4</strong></div>
        <button class="act4-hotspot door ${state.search.includes('entry') ? 'done' : ''}" data-search="entry"><i>${state.search.includes('entry') ? '✓' : '01'}</i><span>Защёлка</span></button>
        <button class="act4-hotspot person ${state.search.includes('ilya') ? 'done critical' : ''}" data-search="ilya"><i>${state.search.includes('ilya') ? '✓' : '02'}</i><span>Ширма</span></button>
        <button class="act4-hotspot cabinet ${state.search.includes('medical') ? 'done' : ''}" data-search="medical"><i>${state.search.includes('medical') ? '✓' : '03'}</i><span>Аптечка</span></button>
        <button class="act4-hotspot lamp ${state.search.includes('lamp') ? 'done' : ''}" data-search="lamp"><i>${state.search.includes('lamp') ? '✓' : '04'}</i><span>Светильник</span></button>
        <div class="act4-room-caption">Технический коридор · уровень −1 · связь нестабильна</div>
      </section>
      <aside class="act4-operation-panel">
        <div class="act4-operation-status ${state.search.includes('ilya') ? 'rescue' : ''}">
          <small>${state.search.includes('ilya') ? 'ПОСТРАДАВШИЙ ОБНАРУЖЕН' : 'ПОИСК ПРОДОЛЖАЕТСЯ'}</small>
          <h2>${state.search.includes('ilya') ? 'Илья жив. Медики вызваны.' : 'Осмотрите четыре контрольные зоны'}</h2>
          <p>${state.search.includes('ilya') ? 'До прибытия помощи зафиксируйте состояние помещения и найдите носитель.' : 'Начните с мест, которые объясняют, как человека удерживали и что искал Кирилл.'}</p>
        </div>
        <div class="act4-point-list">
          ${SEARCH_IDS.map((id) => `<button data-search="${id}" class="${state.search.includes(id) ? 'done' : ''}"><span>${state.search.includes(id) ? '✓' : SEARCH_POINTS[id].n}</span><div><strong>${SEARCH_POINTS[id].label}</strong><small>${state.search.includes(id) ? SEARCH_POINTS[id].title : 'Проверить зону'}</small></div></button>`).join('')}
        </div>
        <div class="act4-finding ${searchDone() ? 'success' : ''}">
          ${searchDone()
            ? '<p class="premium-kicker">Вывод по E010</p><h3>Илья был спрятан живым</h3><p>Кирилл оказал минимальную помощь, запер дверь снаружи и продолжил искать карту. Илья успел спрятать microSD в технической нише.</p><button class="act4-open-card">Извлечь карту 314-17 →</button>'
            : latest
              ? `<p class="premium-kicker">Зафиксировано</p><h3>${SEARCH_POINTS[latest].title}</h3><p>${SEARCH_POINTS[latest].text}</p><blockquote>${SEARCH_POINTS[latest].fact}</blockquote>`
              : '<span>⌖</span><strong>Работайте последовательно</strong><p>Каждая зона устанавливает отдельный элемент ответственности: удержание, состояние Ильи, осознание травмы и местонахождение карты.</p>'}
        </div>
      </aside>
    </div>`;

  body.querySelectorAll<HTMLElement>('[data-search]').forEach((node) => node.addEventListener('click', () => {
    const id = node.dataset.search!;
    state.search = add(state.search, id);
    save();
    searchModal();
    schedule();
  }));
  body.querySelector('.act4-open-card')?.addEventListener('click', cardModal);
}

function cardModal(): void {
  if (!searchDone()) return;
  const latest = state.card.at(-1);
  const body = shell('E011', 'Цифровая экспертиза', 'Карта памяти 314-17', 'Подтвердите происхождение носителя и восстановите содержание оригинального фрагмента B-17.');
  body.innerHTML = `
    <div class="act4-card-layout">
      <section class="act4-card-lab">
        <div class="act4-reader">
          <div class="act4-microsd"><span>314</span><strong>17</strong><i>ORIGINAL</i></div>
          <div class="act4-reader-slot"></div>
          <div class="act4-reader-light ${state.card.length ? 'active' : ''}"></div>
        </div>
        <div class="act4-terminal">
          <header><span>DBR FORENSIC READER</span><strong>${cardDone() ? 'VERIFIED' : 'ANALYSIS'}</strong></header>
          ${CARD_IDS.map((id) => `<button data-card="${id}" class="${state.card.includes(id) ? 'done' : ''}"><span>${state.card.includes(id) ? '✓' : CARD_CHECKS[id].n}</span><div><small>${CARD_CHECKS[id].label}</small><strong>${state.card.includes(id) ? CARD_CHECKS[id].code : 'RUN CHECK'}</strong></div></button>`).join('')}
          <footer><span>CHAIN OF CUSTODY</span><i>${state.card.length}/4</i></footer>
        </div>
      </section>
      <aside class="act4-operation-panel">
        <div class="act4-operation-status ${cardDone() ? 'verified' : ''}">
          <small>${cardDone() ? 'ОРИГИНАЛ ПОДТВЕРЖДЁН' : 'ЦИФРОВАЯ ЭКСПЕРТИЗА'}</small>
          <h2>${cardDone() ? 'Фрагмент B-17 пригоден как доказательство' : 'Проведите четыре проверки'}</h2>
          <p>${cardDone() ? 'Цепочка хранения, контрольная сумма и непрерывность записи совпадают.' : 'Нельзя строить финальное обвинение только на содержании файла — сначала подтвердите его подлинность.'}</p>
        </div>
        <div class="act4-point-list">
          ${CARD_IDS.map((id) => `<button data-card="${id}" class="${state.card.includes(id) ? 'done' : ''}"><span>${state.card.includes(id) ? '✓' : CARD_CHECKS[id].n}</span><div><strong>${CARD_CHECKS[id].label}</strong><small>${state.card.includes(id) ? CARD_CHECKS[id].title : 'Запустить проверку'}</small></div></button>`).join('')}
        </div>
        <div class="act4-finding ${cardDone() ? 'success' : ''}">
          ${cardDone()
            ? '<p class="premium-kicker">Вывод по E011</p><h3>Старое дело стало мотивом нового нападения</h3><p>Запись показывает, что Кирилл настоял на использовании опасного служебного маршрута и потребовал скрыть доказательство после гибели Антона. Илья собирался опубликовать оригинал.</p><button class="act4-go-final">Составить окончательное обвинение →</button>'
            : latest
              ? `<p class="premium-kicker">Результат проверки</p><h3>${CARD_CHECKS[latest].title}</h3><p>${CARD_CHECKS[latest].text}</p><code>${CARD_CHECKS[latest].code}</code>`
              : '<span>▣</span><strong>Подтвердите не только содержание</strong><p>Серийный номер, копирование, оригинальный фрагмент и целостность должны образовать единую цепочку.</p>'}
        </div>
      </aside>
    </div>`;

  body.querySelectorAll<HTMLElement>('[data-card]').forEach((node) => node.addEventListener('click', () => {
    const id = node.dataset.card!;
    state.card = add(state.card, id);
    save();
    cardModal();
    schedule();
  }));
  body.querySelector('.act4-go-final')?.addEventListener('click', () => {
    closeModal();
    clickTab('Дело');
    window.setTimeout(() => document.querySelector<HTMLElement>('.act4-final-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 220);
  });
}

function evidenceCard(id: 'E010' | 'E011', enabled: boolean): HTMLButtonElement {
  const search = id === 'E010';
  const studied = search ? state.search.length > 0 : state.card.length > 0;
  const complete = search ? searchDone() : cardDone();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `premium-evidence-card act4-evidence-card evidence-${id.toLowerCase()} ${complete ? 'premium-pass-complete' : enabled ? 'premium-pass-new' : ''}`;
  button.dataset.evidenceId = id;
  button.disabled = !enabled;
  button.innerHTML = `
    <div class="evidence-card-shade"></div>
    <div class="evidence-card-top"><span>${id}</span><span class="premium-pill ${complete ? 'secure' : enabled ? 'live' : 'neutral'}">${complete ? 'Изучено' : studied ? 'В работе' : enabled ? 'Новое' : 'Закрыто'}</span></div>
    <div class="evidence-card-icon">${search ? '⌖' : '▣'}</div>
    <div class="evidence-card-copy"><small>${search ? 'Финальная операция' : 'Цифровая экспертиза'}</small><h2>${search ? 'Старая служебная комната' : 'Карта памяти 314-17'}</h2><p>${enabled ? (search ? 'Найдите Илью и зафиксируйте действия после нападения.' : 'Извлеките оригинал и подтвердите содержание B-17.') : 'Откроется после завершения предыдущего шага.'}</p></div>
    <span class="evidence-number">${search ? '10' : '11'}</span>`;
  button.onclick = () => search ? searchModal() : cardModal();
  return button;
}

function evidenceGrid(): void {
  if (!unlocked()) return;
  const grid = document.querySelector<HTMLElement>('.premium-evidence-grid');
  if (!grid) return;
  const signature = `${state.search.length}-${state.card.length}-${searchDone()}-${cardDone()}`;
  if (grid.dataset.act4Cards !== signature || !grid.querySelector('[data-evidence-id="E010"]') || !grid.querySelector('[data-evidence-id="E011"]')) {
    grid.dataset.act4Cards = signature;
    grid.querySelectorAll('.act4-evidence-card').forEach((node) => node.remove());
    grid.append(evidenceCard('E010', true), evidenceCard('E011', searchDone()));
  }

  const section = grid.closest('.premium-section');
  const strong = section?.querySelector<HTMLElement>('.section-stat strong');
  const span = section?.querySelector<HTMLElement>('.section-stat span');
  const existing = Number(strong?.textContent ?? 9);
  const act4Studied = Number(state.search.length > 0) + Number(state.card.length > 0);
  if (strong) strong.textContent = String(Math.max(existing, 9 + act4Studied));
  if (span) span.innerHTML = 'из 11<br>изучено';
}

function rank(): { title: string; note: string } {
  const errors = state.wrongAnswers.length;
  if (errors === 0) return { title: 'Следователь высшей категории', note: 'Все элементы ответственности установлены с первой попытки.' };
  if (errors <= 2) return { title: 'Точная реконструкция', note: 'Дело раскрыто, а ошибочные версии были быстро исключены.' };
  return { title: 'Дело раскрыто', note: 'Финальная цепочка доказана после проверки нескольких конкурирующих версий.' };
}

function copyReport(button: HTMLButtonElement): void {
  const text = [
    'ДБР — дело №001 «Номер 314»',
    'Илья найден живым в старой служебной комнате.',
    'Кирилл использовал скрытый проход, травмировал Илью во время борьбы и скрыл его без вызова помощи.',
    'Карта 314-17 подтверждает сокрытие опасного нарушения 2015 года, после которого погиб Антон.',
    `Итог: ${rank().title}.`
  ].join('\n');
  navigator.clipboard?.writeText(text).then(() => { button.textContent = 'Итог скопирован ✓'; }).catch(() => { button.textContent = 'Не удалось скопировать'; });
}

function showReport(): void {
  if (!state.complete || reportOpen) return;
  reportOpen = true;
  const outcome = rank();
  const overlay = document.createElement('div');
  overlay.className = 'act4-report-overlay';
  overlay.innerHTML = `
    <article class="act4-report">
      <div class="act4-report-grid"></div>
      <header><p>ДБР · ДЕЛО №001</p><span>РАССЛЕДОВАНИЕ ЗАВЕРШЕНО</span><h1>Номер 314</h1><h2>${outcome.title}</h2></header>
      <section class="act4-report-hero"><strong>Илья найден живым</strong><p>Медики подтверждают: травма не угрожает жизни. После госпитализации он передал показания и разрешил использовать проверочную копию B-17.</p></section>
      <div class="act4-report-columns">
        <section><small>ЭТОЙ НОЧЬЮ</small><h3>Нападение и сокрытие</h3><p>Кирилл прошёл из 312 в 314, потребовал карту и во время борьбы травмировал Илью. Затем перенёс его в служебную комнату, оказал минимальную помощь и запер дверь снаружи.</p></section>
        <section><small>СТАРОЕ ДЕЛО</small><h3>Мотив 2015 года</h3><p>B-17 подтверждает, что Кирилл настоял на использовании небезопасного маршрута и требовал скрыть запись после гибели Антона. Публикация Ильи угрожала раскрыть это сокрытие.</p></section>
      </div>
      <section class="act4-responsibility">
        <div><span>КИРИЛЛ</span><strong>Исполнитель нападения и сокрытия</strong><p>Маршрут, признание, состояние комнаты и оригинал образуют единую цепочку.</p></div>
        <div><span>ДЕНИС</span><strong>Скрывал архивный оригинал</strong><p>Лгал о B-17, но не участвовал в ночном перемещении Ильи.</p></div>
        <div><span>ВЕРА</span><strong>Скрывала личность источника</strong><p>Передала карту Илье и приехала под другой фамилией, но не совершала нападение.</p></div>
      </section>
      <footer><div><small>ОЦЕНКА РАССЛЕДОВАНИЯ</small><strong>${outcome.title}</strong><span>${outcome.note}</span></div><div class="act4-report-actions"><button data-copy-report>Скопировать итог</button><button data-close-report>Вернуться в штаб</button><a href="${import.meta.env.BASE_URL}?fresh=1">Начать дело заново</a></div></footer>
    </article>`;
  overlay.querySelector<HTMLButtonElement>('[data-copy-report]')?.addEventListener('click', (event) => copyReport(event.currentTarget as HTMLButtonElement));
  overlay.querySelector('[data-close-report]')?.addEventListener('click', () => {
    overlay.classList.add('leaving');
    window.setTimeout(() => { overlay.remove(); reportOpen = false; }, 260);
  });
  document.body.append(overlay);
}

function finalPanel(): void {
  if (!unlocked()) return;
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  if (!dashboard) return;
  let panel = dashboard.querySelector<HTMLElement>('.act4-final-panel');
  if (!panel) {
    panel = document.createElement('article');
    panel.className = 'premium-panel act4-final-panel';
    dashboard.append(panel);
  }

  const ready = searchDone() && cardDone();
  const selected = FINAL_OPTIONS.find((option) => option.id === state.finalAnswer);
  const signature = `${state.search.length}-${state.card.length}-${state.finalAnswer}-${state.complete}-${state.wrongAnswers.length}`;
  if (panel.dataset.signature === signature) return;
  panel.dataset.signature = signature;
  panel.innerHTML = `
    <div class="panel-title"><div><p class="premium-kicker">Финальный логический узел · акт IV</p><h2>Окончательный отчёт</h2></div><span class="premium-pill ${state.complete ? 'secure' : ready ? 'live' : 'neutral'}">${state.complete ? 'Дело закрыто' : ready ? 'Готов' : `${Number(searchDone()) + Number(cardDone())}/2`}</span></div>
    ${!ready
      ? `<div class="act4-final-locked"><span>⌁</span><strong>Сначала завершите финальную операцию</strong><p>${!searchDone() ? 'Найдите Илью в E010. ' : ''}${searchDone() && !cardDone() ? 'Проверьте карту в E011.' : ''}</p><button>${!searchDone() ? 'Перейти к E010' : 'Перейти к E011'} →</button></div>`
      : `<div class="act4-final-question"><p>Как следует сформулировать ответственность Кирилла, не выходя за пределы доказанных фактов?</p>${FINAL_OPTIONS.map((option) => `<button data-final="${option.id}" class="${state.finalAnswer === option.id ? (option.correct ? 'chosen correct' : 'chosen wrong') : ''}" ${state.complete && state.finalAnswer !== option.id ? 'disabled' : ''}><span>${state.finalAnswer === option.id ? (option.correct ? '✓' : '×') : '○'}</span><strong>${option.text}</strong></button>`).join('')}${selected ? `<div class="act4-final-feedback ${selected.correct ? 'success' : 'warning'}"><strong>${selected.correct ? 'Окончательный вывод принят' : 'Формулировка не подтверждена полностью'}</strong><p>${selected.feedback}</p>${selected.correct ? '<button data-open-report>Открыть итог дела →</button>' : ''}</div>` : ''}</div>`}`;

  panel.querySelector('.act4-final-locked button')?.addEventListener('click', () => {
    clickTab('Материалы');
    window.setTimeout(() => document.querySelector<HTMLButtonElement>(`[data-evidence-id="${!searchDone() ? 'E010' : 'E011'}"]`)?.click(), 180);
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-final]').forEach((button) => button.addEventListener('click', () => {
    if (state.complete) return;
    const option = FINAL_OPTIONS.find((item) => item.id === button.dataset.final);
    if (!option) return;
    state.finalAnswer = option.id;
    if (option.correct) {
      state.complete = true;
      state.completedAt = new Date().toISOString();
    } else {
      state.wrongAnswers = add(state.wrongAnswers, option.id);
    }
    save();
    finalPanel();
    schedule();
    if (option.correct) window.setTimeout(showReport, 420);
  }));
  panel.querySelector('[data-open-report]')?.addEventListener('click', showReport);
}

function patchRail(): void {
  if (!unlocked()) return;
  const list = document.querySelector<HTMLOListElement>('.premium-pass-acts');
  if (!list) return;
  list.classList.add('has-act4');
  let item = list.querySelector<HTMLLIElement>('[data-act4-stage]');
  if (!item) {
    item = document.createElement('li');
    item.dataset.act4Stage = 'true';
    list.append(item);
  }
  item.className = state.complete ? 'complete' : 'current';
  item.innerHTML = `<span>${state.complete ? '✓' : '04'}</span><div><small>Акт IV</small><strong>Финальная операция</strong></div>`;

  const percent = document.querySelector<HTMLElement>('.premium-pass-progress-copy strong');
  const bar = document.querySelector<HTMLElement>('.premium-pass-progress-track i');
  const completedUnits = state.search.length + state.card.length + Number(state.complete);
  const value = Math.min(100, Math.round(78 + completedUnits / 9 * 22));
  if (percent) percent.textContent = `${value}%`;
  if (bar) bar.style.width = `${value}%`;

  const next = document.querySelector<HTMLButtonElement>('.premium-pass-next');
  if (next) {
    const title = state.complete ? 'Расследование завершено' : !searchDone() ? 'Найти Илью в служебной комнате' : !cardDone() ? 'Проверить карту 314-17' : 'Составить окончательный отчёт';
    const description = state.complete ? 'Откройте итог дела и оценку расследования.' : !searchDone() ? `Проверено ${state.search.length} из 4 зон E010.` : !cardDone() ? `Выполнено ${state.card.length} из 4 проверок E011.` : 'Разделите доказанные действия, сокрытие и старый мотив.';
    next.removeAttribute('data-complete');
    next.innerHTML = `<span>Акт IV · следующий шаг</span><strong>${title}</strong><small>${description}</small><b aria-hidden="true">→</b>`;
    next.onclick = () => {
      if (state.complete) { showReport(); return; }
      if (!searchDone() || !cardDone()) {
        clickTab('Материалы');
        window.setTimeout(() => document.querySelector<HTMLButtonElement>(`[data-evidence-id="${!searchDone() ? 'E010' : 'E011'}"]`)?.click(), 180);
      } else {
        clickTab('Дело');
        window.setTimeout(() => document.querySelector<HTMLElement>('.act4-final-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
      }
    };
  }
}

function dashboard(): void {
  if (!unlocked()) return;
  const root = document.querySelector<HTMLElement>('.premium-dashboard');
  const hero = root?.querySelector<HTMLElement>('.dashboard-hero');
  if (!root || !hero) return;
  const topSmall = document.querySelector<HTMLElement>('.topbar-case small');
  const topPill = document.querySelector<HTMLElement>('.topbar-actions .premium-pill');
  if (topSmall) topSmall.textContent = 'Дело №001 · акт IV';
  if (topPill) topPill.textContent = state.complete ? 'Дело закрыто' : 'Финальная операция';
  const h1 = hero.querySelector<HTMLElement>('h1');
  const p = hero.querySelector<HTMLElement>('p:last-child');
  if (h1) h1.textContent = state.complete ? 'Номер 314: цепочка восстановлена' : !searchDone() ? 'Где Кирилл оставил Илью?' : !cardDone() ? 'Что доказывает оригинал B-17?' : 'Кто и за что несёт ответственность?';
  if (p) p.textContent = state.complete
    ? 'Илья найден живым. Нападение этой ночью и сокрытие нарушения 2015 года доказаны без смешения чужих мотивов и действий.'
    : !searchDone()
      ? 'Признание Кирилла открыло старую служебную комнату. Действуйте быстро: Илья мог оставаться там без помощи несколько часов.'
      : !cardDone()
        ? 'Илья найден. Теперь оригинальная карта должна подтвердить не только мотив, но и подлинность старого материала.'
        : 'Все материалы собраны. Сформулируйте итог так, чтобы каждое утверждение опиралось на отдельную доказанную цепочку.';

  root.querySelectorAll('.act3-next-action').forEach((node) => node.remove());
  let action = root.querySelector<HTMLButtonElement>('.act4-next-action');
  if (!action) {
    action = document.createElement('button');
    action.className = 'next-action-card act4-next-action';
    hero.insertAdjacentElement('afterend', action);
  }
  const title = state.complete ? 'Открыть итог дела' : !searchDone() ? 'Провести поиск в служебной зоне' : !cardDone() ? 'Проверить найденную microSD' : 'Сдать окончательный отчёт';
  const text = state.complete ? 'Просмотрите реконструкцию, ответственность участников и оценку прохождения.' : !searchDone() ? 'E010: найдите Илью и установите, что произошло после борьбы.' : !cardDone() ? 'E011: подтвердите происхождение и целостность B-17.' : 'Не приписывайте участникам действия, которых материалы не доказывают.';
  action.innerHTML = `<div class="action-index">Акт IV · финальная операция</div><div><strong>${title}</strong><span>${text}</span></div><span>→</span>`;
  action.onclick = () => {
    if (state.complete) { showReport(); return; }
    if (!searchDone() || !cardDone()) {
      clickTab('Материалы');
      window.setTimeout(() => document.querySelector<HTMLButtonElement>(`[data-evidence-id="${!searchDone() ? 'E010' : 'E011'}"]`)?.click(), 180);
    } else {
      document.querySelector<HTMLElement>('.act4-final-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
}

function scan(): void {
  if (!unlocked()) return;
  state = load();
  dashboard();
  evidenceGrid();
  finalPanel();
  patchRail();
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

window.addEventListener('dbr:runtime-settled', schedule);
window.addEventListener('dbr:interrogation-updated', schedule);
window.addEventListener('storage', schedule);
window.addEventListener('pageshow', schedule);
document.addEventListener('click', () => window.setTimeout(schedule, 120), true);

document.documentElement.dataset.act4Build = 'v0.7.0';
schedule();
