export {};

type Act2State = { plan: string[]; room: string[]; questions: string[] };

const BUILD = 'v0.5.0';
const KEY = 'dbr:dbr_001_room_314:act2:v0.5.0';
const CASE_PREFIX = 'dbr:dbr_001_room_314:';
const ROOM_IMAGE = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1900&q=86';
const PLAN_IDS = ['wall', 'stamp', 'width'];
const ROOM_IDS = ['panel', 'tracks', 'envelope', 'fibres'];

const PLAN: Record<string, { n: string; label: string; title: string; text: string }> = {
  wall: { n: '01', label: 'Стык 312 / 314', title: 'Разрыв в капитальной стене', text: 'Архивный лист показывает дверную коробку шириной 82 см между номерами 312 и 314. В современной схеме на её месте сплошная стена.' },
  stamp: { n: '02', label: 'Штамп реконструкции', title: 'Изменение проекта в 2015 году', text: 'Пометка требует закрыть старый проём декоративными панелями, однако акт окончательной заделки в архивной папке отсутствует.' },
  width: { n: '03', label: 'Толщина стены', title: 'Служебная полость шириной 96 см', text: 'Промежуток между комнатами почти на метр шире обычной перегородки. Внутри мог сохраниться узкий технический маршрут.' }
};

const ROOM: Record<string, { n: string; label: string; title: string; text: string }> = {
  panel: { n: '01', label: 'Шкаф у общей стены', title: 'Панель открывали недавно', text: 'Внутренняя стенка держится на новых винтах. За ней видна старая металлическая дверная коробка.' },
  tracks: { n: '02', label: 'Ковёр', title: 'Следы совпадают с номером 314', text: 'Две параллельные полосы имеют ту же ширину, что и следы возле шкафа в комнате Ильи.' },
  envelope: { n: '03', label: 'Письменный стол', title: 'Конверт из архива фестиваля', text: 'В ящике найден пустой конверт 2015 года. На обороте рукой Дениса записано: «оригинал — у А.Б.».' },
  fibres: { n: '04', label: 'Решётка у панели', title: 'Свежие волокна тёмной ткани', text: 'На выступе возле скрытого проёма зацепились волокна куртки. Маршрут использовали недавно.' }
};

let state = load();
let scheduled = false;

function load(): Act2State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Act2State>;
    return {
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      room: Array.isArray(parsed.room) ? parsed.room : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : []
    };
  } catch {
    return { plan: [], room: [], questions: [] };
  }
}

function save(): void { localStorage.setItem(KEY, JSON.stringify(state)); }
function add(list: string[], id: string): string[] { return Array.from(new Set([...list, id])); }
function passage(): boolean { return PLAN_IDS.every((id) => state.plan.includes(id)); }
function roomDone(): boolean { return ROOM_IDS.every((id) => state.room.includes(id)); }

function act1(): boolean {
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(CASE_PREFIX) || key.includes(':act2:')) continue;
    try {
      if ((JSON.parse(localStorage.getItem(key) ?? '{}') as { act1Complete?: boolean }).act1Complete) return true;
    } catch { /* ignore obsolete saves */ }
  }
  return false;
}

function setText(node: Element | null, value: string): void {
  if (node && node.textContent !== value) node.textContent = value;
}

function setVersion(): void {
  const nextTitle = /v\d+\.\d+\.\d+/.test(document.title) ? document.title.replace(/v\d+\.\d+\.\d+/, BUILD) : `${document.title} · ${BUILD}`;
  if (document.title !== nextTitle) document.title = nextTitle;
  setText(document.querySelector('.build-marker'), BUILD);
}

function evidenceTab(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  buttons.find((button) => button.textContent?.includes('Материалы'))?.click();
}

function dashboard(): void {
  if (!act1()) return;
  const root = document.querySelector<HTMLElement>('.premium-dashboard');
  const hero = root?.querySelector<HTMLElement>('.dashboard-hero');
  if (!root || !hero) return;

  setText(hero.querySelector('h1'), roomDone() ? 'Скрытый маршрут подтверждён' : 'Куда ведёт стена между 312 и 314?');
  setText(hero.querySelector('p:last-child'), roomDone()
    ? 'Осмотр номера 312 подтвердил: технический проход сохранился и использовался в ночь исчезновения.'
    : passage()
      ? 'Архивный план открыл старый проход. Теперь необходимо проверить его со стороны номера Кирилла.'
      : 'Обычные пути исключены. Сравните архивную и современную планировки третьего этажа.');

  const signature = `${passage()}-${roomDone()}`;
  let action = root.querySelector<HTMLButtonElement>('.act2-next-action');
  if (!action) {
    action = document.createElement('button');
    action.type = 'button';
    action.className = 'next-action-card act2-next-action';
    hero.insertAdjacentElement('afterend', action);
  }
  if (action.dataset.signature !== signature) {
    action.dataset.signature = signature;
    action.innerHTML = `<div class="action-index">Акт II · следующий шаг</div><div><strong>${passage() ? (roomDone() ? 'Сверить новые показания' : 'Осмотреть номер 312') : 'Изучить архивный план'}</strong><span>${passage() ? (roomDone() ? 'Кирилл и Марина должны объяснить найденный маршрут.' : 'Проверьте общую стену и следы внутри соседнего номера.') : 'Найдите конструктивное отличие между 312 и 314.'}</span></div><span class="act2-action-arrow">→</span>`;
    action.onclick = evidenceTab;
  }

  const list = root.querySelector<HTMLUListElement>('.premium-fact-list');
  if (list) {
    const facts = [
      passage() ? 'Архивный план подтверждает скрытый проход между номерами 312 и 314.' : '',
      state.room.includes('panel') ? 'Панель в шкафу номера 312 открывали недавно.' : '',
      roomDone() ? 'Следы в 312 и 314 совпадают: скрытый маршрут использовали в ночь исчезновения.' : ''
    ].filter(Boolean);
    const factSignature = facts.join('|');
    if (list.dataset.act2Facts !== factSignature) {
      list.dataset.act2Facts = factSignature;
      list.querySelectorAll('.act2-fact').forEach((item) => item.remove());
      facts.forEach((fact, index) => {
        const li = document.createElement('li');
        li.className = 'act2-fact';
        li.innerHTML = `<span>A2-${String(index + 1).padStart(2, '0')}</span><p>${fact}</p>`;
        list.append(li);
      });
    }
  }
}

function topbar(): void {
  if (!act1()) return;
  setText(document.querySelector('.topbar-case small'), 'Дело №001 · акт II');
  setText(document.querySelector('.topbar-actions .premium-pill'), roomDone() ? 'Маршрут подтверждён' : 'Акт II открыт');
}

function card(id: 'E006' | 'E007', unlocked: boolean): HTMLButtonElement {
  const planCard = id === 'E006';
  const seen = planCard ? state.plan.length > 0 : state.room.length > 0;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.evidenceId = id;
  button.disabled = !unlocked;
  button.className = `premium-evidence-card ${planCard ? 'amber' : 'cyan'} ${seen ? 'seen' : ''} ${unlocked ? '' : 'locked'} act2-evidence-card`;
  button.innerHTML = `${planCard ? '<div class="act2-card-blueprint"></div>' : `<img src="${ROOM_IMAGE}" alt=""/>`}<div class="evidence-card-shade"></div><div class="evidence-card-top"><span>${id}</span><span class="premium-pill ${seen ? 'secure' : unlocked ? 'live' : 'neutral'}">${seen ? 'Изучено' : unlocked ? 'Новое' : 'Закрыто'}</span></div><div class="evidence-card-icon">${planCard ? '⌗' : '⌖'}</div><div class="evidence-card-copy"><small>${planCard ? 'Архивный документ' : 'Интерактивная сцена'}</small><h2>${planCard ? 'Архивный план третьего этажа' : 'Осмотр номера 312'}</h2><p>${unlocked ? (planCard ? 'Сравните стены 312 и 314 и найдите отличие.' : 'Проверьте общую стену и следы в комнате Кирилла.') : 'Откроется после обнаружения скрытого прохода.'}</p></div><span class="evidence-number">0${planCard ? '6' : '7'}</span>`;
  button.onclick = () => planCard ? planModal() : roomModal();
  return button;
}

function evidenceGrid(): void {
  if (!act1()) return;
  const grid = document.querySelector<HTMLElement>('.premium-evidence-grid');
  if (!grid) return;
  const signature = `${state.plan.length}-${state.room.length}-${passage()}`;
  if (grid.dataset.act2Cards === signature && grid.querySelector('[data-evidence-id="E006"]') && grid.querySelector('[data-evidence-id="E007"]')) return;
  grid.dataset.act2Cards = signature;
  grid.querySelectorAll('.act2-evidence-card').forEach((node) => node.remove());
  grid.append(card('E006', true), card('E007', passage()));
  const stat = grid.closest('.premium-section')?.querySelector<HTMLElement>('.section-stat span');
  if (stat && stat.innerHTML !== 'из 7<br>изучено') stat.innerHTML = 'из 7<br>изучено';
}

function closeModal(): void { document.querySelector('.act2-modal-backdrop')?.remove(); }

function shell(id: string, category: string, title: string, summary: string): HTMLElement {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'premium-modal-backdrop act2-modal-backdrop';
  backdrop.innerHTML = `<section class="premium-modal evidence-modal-premium act2-modal evidence-${id.toLowerCase()}"><header class="premium-modal-header"><div><p class="premium-kicker">${category} · ${id}</p><h1>${title}</h1><p>${summary}</p></div><button class="premium-icon-button close act2-close">×</button></header><div class="premium-modal-body act2-modal-body"></div><footer class="premium-modal-footer"><span class="act2-save-note">Прогресс второго акта сохранён</span><button class="premium-cta compact act2-return">Вернуться в штаб <span>→</span></button></footer></section>`;
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) closeModal(); });
  backdrop.querySelector('.act2-close')?.addEventListener('click', closeModal);
  backdrop.querySelector('.act2-return')?.addEventListener('click', closeModal);
  document.body.append(backdrop);
  return backdrop.querySelector<HTMLElement>('.act2-modal-body')!;
}

function planModal(): void {
  if (!act1()) return;
  const body = shell('E006', 'Архивный документ', 'Архивный план третьего этажа', 'Найдите конструктивные отметки, исчезнувшие из современной схемы.');
  const latest = state.plan.at(-1);
  body.innerHTML = `<div class="act2-plan-layout"><div class="archive-plan-sheet"><div class="plan-paper-grid"></div><div class="plan-heading"><span>ОТЕЛЬ «СЕВЕРНЫЙ СКЛОН»</span><strong>ЭТАЖ 3 · ОБМЕРНЫЙ ПЛАН 2004</strong><small>Архивный экземпляр / лист 3-А</small></div><div class="plan-corridor"><span>ГОСТЕВОЙ КОРИДОР</span></div><div class="plan-room plan-310"><b>310</b><small>18.4 м²</small></div><div class="plan-room plan-312"><b>312</b><small>19.1 м²</small><i>ТЕХ. НИША</i></div><div class="plan-room plan-314"><b>314</b><small>20.0 м²</small></div><div class="plan-hidden-door ${passage() ? 'revealed' : ''}"><span></span><em>старый проём 820 мм</em></div><div class="plan-service-void"><span>960</span></div><div class="plan-renovation-stamp">РЕКОНСТРУКЦИЯ 2015<br/><b>ЗАКРЫТЬ ПАНЕЛЯМИ</b></div>${PLAN_IDS.map((id) => `<button class="plan-hotspot ${state.plan.includes(id) ? 'inspected' : ''}" data-plan="${id}"><span>${state.plan.includes(id) ? '✓' : PLAN[id].n}</span><i>${PLAN[id].label}</i></button>`).join('')}<div class="plan-scale">0&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;3 м</div></div><aside class="act2-investigation-panel"><div class="act2-progress"><span>${state.plan.length}/3</span><div><strong>Сопоставление плана</strong><small>${passage() ? 'Скрытый маршрут найден' : 'Проверьте три несоответствия'}</small></div></div><div class="act2-finding-list">${PLAN_IDS.map((id) => `<button data-plan="${id}" class="${state.plan.includes(id) ? 'done' : ''}"><span>${state.plan.includes(id) ? '✓' : PLAN[id].n}</span><div><strong>${PLAN[id].label}</strong><small>${state.plan.includes(id) ? PLAN[id].title : 'Проверить отметку'}</small></div></button>`).join('')}</div><div class="act2-result ${passage() ? 'success' : ''}">${passage() ? '<p class="premium-kicker">Новый факт</p><h3>Между 312 и 314 сохранился технический проход</h3><p>Современная отделка скрывает старую дверь. Проверить маршрут можно со стороны номера Кирилла.</p><button class="act2-open-room">Открыть осмотр номера 312 →</button>' : latest ? `<p class="premium-kicker">Обнаружено</p><h3>${PLAN[latest].title}</h3><p>${PLAN[latest].text}</p>` : '<span>⌗</span><strong>Найдите три несоответствия</strong><p>Проверяйте толщину стен, строительные отметки и штамп реконструкции.</p>'}</div></aside></div>`;
  body.querySelectorAll<HTMLElement>('[data-plan]').forEach((node) => node.addEventListener('click', () => { const id = node.dataset.plan!; state.plan = add(state.plan, id); save(); planModal(); schedule(); }));
  body.querySelector('.act2-open-room')?.addEventListener('click', roomModal);
}

function roomModal(): void {
  if (!passage()) return;
  const body = shell('E007', 'Интерактивная сцена', 'Осмотр номера 312', 'Проверьте физическое продолжение маршрута со стороны комнаты Кирилла.');
  const latest = state.room.at(-1);
  body.innerHTML = `<div class="act2-room-layout"><div class="act2-room-photo"><img src="${ROOM_IMAGE}" alt="Номер 312"/><div class="act2-room-grade"></div><div class="act2-scene-label"><span>SCENE 312</span><small>08:46 · повторный осмотр</small></div>${ROOM_IDS.map((id) => `<button class="act2-room-marker marker-${id === 'panel' ? 'wardrobe-panel' : id === 'tracks' ? 'carpet-tracks' : id === 'envelope' ? 'archive-envelope' : 'vent-fibres'} ${state.room.includes(id) ? 'inspected' : ''}" data-room="${id}"><span>${state.room.includes(id) ? '✓' : ROOM[id].n}</span><i>${ROOM[id].label}</i></button>`).join('')}</div><aside class="act2-investigation-panel"><div class="act2-progress"><span>${state.room.length}/4</span><div><strong>Зоны осмотра</strong><small>${roomDone() ? 'Маршрут подтверждён' : 'Проверьте номер целиком'}</small></div></div><div class="act2-finding-list">${ROOM_IDS.map((id) => `<button data-room="${id}" class="${state.room.includes(id) ? 'done' : ''}"><span>${state.room.includes(id) ? '✓' : ROOM[id].n}</span><div><strong>${ROOM[id].label}</strong><small>${state.room.includes(id) ? ROOM[id].title : 'Осмотреть зону'}</small></div></button>`).join('')}</div><div class="act2-result ${roomDone() ? 'success' : ''}">${latest ? `<p class="premium-kicker">Обнаружено</p><h3>${ROOM[latest].title}</h3><p>${ROOM[latest].text}</p>${roomDone() ? '<div class="act2-final-conclusion"><strong>Маршрут доказан</strong><span>312 → скрытая панель → 314</span></div>' : ''}` : '<span>⌖</span><strong>Начните с общей стены</strong><p>Сопоставьте комнату с архивным планом и следами из номера Ильи.</p>'}</div></aside></div>`;
  body.querySelectorAll<HTMLElement>('[data-room]').forEach((node) => node.addEventListener('click', () => { const id = node.dataset.room!; state.room = add(state.room, id); save(); roomModal(); schedule(); }));
}

function interview(): void {
  if (!act1()) return;
  const name = document.querySelector<HTMLElement>('.character-modal-premium .interview-name h1')?.textContent?.trim();
  const container = document.querySelector<HTMLElement>('.character-modal-premium .interview-questions');
  if (!name || !container || !['Кирилл Бессонов', 'Марина Орлова'].includes(name)) return;

  const definitions = name === 'Кирилл Бессонов'
    ? [
        { id: 'k-plan', unlock: passage(), q: 'Почему архивный план показывает проход из вашего номера в 314?', a: 'Это старая техническая дверь. Я считал, что её заделали много лет назад, и не проверял стену.' },
        { id: 'k-panel', unlock: state.room.includes('panel'), q: 'Кто недавно снимал внутреннюю панель вашего шкафа?', a: 'Не знаю. Возможно, техническая служба. Я заселился вечером и шкафом почти не пользовался.' }
      ]
    : [
        { id: 'm-plan', unlock: passage(), q: 'Почему проход исчез из современной планировки?', a: 'Во время реконструкции его должны были закрыть. Я видела только современный комплект документов.' },
        { id: 'm-access', unlock: roomDone(), q: 'Кто мог открыть техническую панель между 312 и 314?', a: 'Панель открывается обычным инструментом. Если Кирилл знал старую планировку, мастер-ключ ему не требовался.' }
      ];
  const signature = `${name}-${passage()}-${state.room.join(',')}-${state.questions.join(',')}`;
  if (container.dataset.act2Interview === signature) return;
  container.dataset.act2Interview = signature;
  container.querySelectorAll('.act2-interview-topic').forEach((node) => node.remove());
  definitions.forEach((item) => {
    const asked = state.questions.includes(item.id);
    const article = document.createElement('article');
    article.className = `act2-interview-topic ${item.unlock ? '' : 'locked'} ${asked ? 'asked' : ''}`;
    article.innerHTML = `<button ${item.unlock ? '' : 'disabled'}><span>${asked ? '↻' : item.unlock ? '→' : '⌁'}</span><div><small>${asked ? 'Повторить вопрос' : item.unlock ? 'Новый вопрос акта II' : 'Нужны материалы второго акта'}</small><strong>${item.q}</strong></div></button>${asked ? `<div class="interview-answer"><span>${name.split(' ')[0]}</span><p>${item.a}</p></div>` : ''}`;
    article.querySelector('button')?.addEventListener('click', () => { if (!item.unlock) return; state.questions = add(state.questions, item.id); save(); container.dataset.act2Interview = ''; interview(); });
    container.append(article);
  });
}

function scan(): void { setVersion(); topbar(); dashboard(); evidenceGrid(); interview(); }
function schedule(): void { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; scan(); }); }

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(schedule, 80), true);
window.addEventListener('storage', () => { state = load(); schedule(); });
schedule();
