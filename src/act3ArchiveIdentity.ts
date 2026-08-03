export {};

type Act2State = { plan?: string[]; room?: string[]; questions?: string[] };
type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

const BUILD = 'v0.6.0';
const ACT2_KEY = 'dbr:dbr_001_room_314:act2:v0.5.0';
const KEY = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ARCHIVE_IDS = ['catalog', 'contact', 'audio', 'custody'];
const IDENTITY_IDS = ['registration', 'festival', 'message'];

const ARCHIVE: Record<string, { n: string; label: string; title: string; text: string; code: string }> = {
  catalog: {
    n: '01',
    label: 'Каталог оцифровки',
    title: 'В цифровой папке отсутствует один оригинал',
    text: 'В бумажной описи значатся 48 файлов. Денис передал Илье только 47: позиция B-17 удалена из цифровой копии.',
    code: '48 ORIGINALS / 47 DIGITAL FILES'
  },
  contact: {
    n: '02',
    label: 'Контактный лист B',
    title: 'Кадр B-17 существовал и был отмечен Антоном',
    text: 'Между B-16 и B-18 сохранилась служебная отметка: «оригинал отдельно». На полях — инициалы А.Б. и номер карты 314-17.',
    code: 'B-16  ·  [B-17]  ·  B-18'
  },
  audio: {
    n: '03',
    label: 'Расшифровка диктофона',
    title: 'Антон спорил с организатором перед гибелью',
    text: 'На записи слышно: «Кирилл, проход должен быть закрыт по акту…» Затем разговор обрывается шумом в служебной зоне.',
    code: '21:42:08 / SERVICE CORRIDOR'
  },
  custody: {
    n: '04',
    label: 'Журнал выдачи носителей',
    title: 'Денис получил два оригинальных носителя, но вернул один',
    text: 'Серийный номер второго носителя совпадает с пустым футляром из сумки Ильи. Утверждение Дениса об «обычном архиве» ложно.',
    code: 'CARD 314-17 / STATUS: NOT RETURNED'
  }
};

const IDENTITY: Record<string, { n: string; label: string; title: string; text: string }> = {
  registration: {
    n: '01',
    label: 'Регистрационная карточка',
    title: 'Фамилия Ветрова появилась только после 2018 года',
    text: 'Дата рождения и подпись совпадают, но в старых документах участница значится под другой фамилией.'
  },
  festival: {
    n: '02',
    label: 'Список родственников 2015',
    title: 'Елена Ветрова — это Вера Белова',
    text: 'Вера Белова указана как младшая сестра погибшего Антона Белова. Фотография и дата рождения совпадают с данными гостьи номера 307.'
  },
  message: {
    n: '03',
    label: 'Черновик Ильи',
    title: 'Илья заранее знал настоящую личность Веры',
    text: 'В черновике написано: «Вера, приезжайте под фамилией матери. До копирования карты никому не говорите, кто вы». Она приехала как источник, а не случайная участница.'
  }
};

let state = load();
let scheduled = false;

function load(): Act3State {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Act3State>;
    return {
      archive: Array.isArray(parsed.archive) ? parsed.archive : [],
      identity: Array.isArray(parsed.identity) ? parsed.identity : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      checkpointAnswer: typeof parsed.checkpointAnswer === 'string' ? parsed.checkpointAnswer : null,
      complete: parsed.complete === true
    };
  } catch {
    return { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false };
  }
}

function save(): void { localStorage.setItem(KEY, JSON.stringify(state)); }
function add(list: string[], id: string): string[] { return Array.from(new Set([...list, id])); }
function archiveDone(): boolean { return ARCHIVE_IDS.every((id) => state.archive.includes(id)); }
function identityDone(): boolean { return IDENTITY_IDS.every((id) => state.identity.includes(id)); }
function questionsDone(): boolean { return state.questions.includes('d-original') && state.questions.includes('v-name'); }
function checkpointReady(): boolean { return archiveDone() && identityDone() && questionsDone(); }

function readAct2(): Act2State {
  try { return JSON.parse(localStorage.getItem(ACT2_KEY) ?? '{}') as Act2State; }
  catch { return {}; }
}

function roomDone(): boolean {
  const room = readAct2().room ?? [];
  return ['panel', 'tracks', 'envelope', 'fibres'].every((id) => room.includes(id));
}

function setText(node: Element | null, value: string): void {
  if (node && node.textContent !== value) node.textContent = value;
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  buttons.find((button) => button.textContent?.includes(label))?.click();
}

function closeModal(): void {
  document.querySelector('.act3-modal-backdrop')?.remove();
}

function shell(id: string, category: string, title: string, summary: string): HTMLElement {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'premium-modal-backdrop act3-modal-backdrop';
  backdrop.innerHTML = `
    <section class="premium-modal evidence-modal-premium act3-modal evidence-${id.toLowerCase()}">
      <header class="premium-modal-header">
        <div><p class="premium-kicker">${category} · ${id}</p><h1>${title}</h1><p>${summary}</p></div>
        <button class="premium-icon-button close act3-close" aria-label="Закрыть">×</button>
      </header>
      <div class="premium-modal-body act3-modal-body"></div>
      <footer class="premium-modal-footer">
        <span class="act3-save-note">Материалы сохраняются автоматически</span>
        <button class="premium-cta compact act3-return">Вернуться в штаб <span>→</span></button>
      </footer>
    </section>`;
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) closeModal(); });
  backdrop.querySelector('.act3-close')?.addEventListener('click', closeModal);
  backdrop.querySelector('.act3-return')?.addEventListener('click', closeModal);
  document.body.append(backdrop);
  return backdrop.querySelector<HTMLElement>('.act3-modal-body')!;
}

function archiveModal(): void {
  if (!roomDone()) return;
  const latest = state.archive.at(-1);
  const body = shell('E008', 'Архивное расследование', 'Оригиналы фестиваля 2015', 'Сопоставьте бумажную опись, контактный лист, звук и журнал выдачи носителей.');
  body.innerHTML = `
    <div class="act3-archive-layout">
      <section class="archive-worktable">
        <div class="archive-worktable-head"><span>ARCHIVE / BOX 15-B</span><strong>ФЕСТИВАЛЬ «СЕВЕРНЫЙ СКЛОН»</strong><small>Оригинальные материалы · доступ ограничен</small></div>
        <div class="archive-folder-stack">
          ${ARCHIVE_IDS.map((id) => `<button class="archive-file ${state.archive.includes(id) ? 'inspected' : ''}" data-archive="${id}"><span>${state.archive.includes(id) ? '✓' : ARCHIVE[id].n}</span><div><small>${ARCHIVE[id].label}</small><strong>${ARCHIVE[id].code}</strong></div></button>`).join('')}
        </div>
        <div class="archive-card-slot ${state.archive.includes('custody') ? 'matched' : ''}"><span>314-17</span><strong>Слот оригинального носителя</strong><small>${state.archive.includes('custody') ? 'Совпадение с футляром Ильи подтверждено' : 'Серийный номер не сопоставлен'}</small></div>
      </section>
      <aside class="act3-investigation-panel">
        <div class="act3-progress"><span>${state.archive.length}/4</span><div><strong>Проверка происхождения</strong><small>${archiveDone() ? 'Цепочка носителя восстановлена' : 'Изучите четыре документа'}</small></div></div>
        <div class="act3-finding-list">${ARCHIVE_IDS.map((id) => `<button data-archive="${id}" class="${state.archive.includes(id) ? 'done' : ''}"><span>${state.archive.includes(id) ? '✓' : ARCHIVE[id].n}</span><div><strong>${ARCHIVE[id].label}</strong><small>${state.archive.includes(id) ? ARCHIVE[id].title : 'Открыть документ'}</small></div></button>`).join('')}</div>
        <div class="act3-result ${archiveDone() ? 'success' : ''}">${archiveDone()
          ? '<p class="premium-kicker">Вывод по E008</p><h3>Денис скрывал уникальный оригинал B-17</h3><p>Карта 314-17 существовала, была у Ильи и стала вероятной целью нападения. Но подтверждённое нахождение Дениса в баре не объясняет маршрут через номер 312.</p><button class="act3-open-identity">Проверить личность Елены →</button>'
          : latest
            ? `<p class="premium-kicker">Обнаружено</p><h3>${ARCHIVE[latest].title}</h3><p>${ARCHIVE[latest].text}</p>`
            : '<span>▤</span><strong>Восстановите цепочку оригинала</strong><p>Проверьте, что исчезло при оцифровке и кому передавали второй носитель.</p>'}</div>
      </aside>
    </div>`;
  body.querySelectorAll<HTMLElement>('[data-archive]').forEach((node) => node.addEventListener('click', () => {
    const id = node.dataset.archive!;
    state.archive = add(state.archive, id);
    save();
    archiveModal();
    schedule();
  }));
  body.querySelector('.act3-open-identity')?.addEventListener('click', identityModal);
}

function identityModal(): void {
  if (!archiveDone()) return;
  const latest = state.identity.at(-1);
  const body = shell('E009', 'Проверка личности', 'Кто такая Елена Ветрова?', 'Сопоставьте регистрационные сведения с архивом старого дела и перепиской Ильи.');
  body.innerHTML = `
    <div class="act3-identity-layout">
      <section class="identity-comparison">
        <div class="identity-current-card">
          <div class="identity-portrait">ЕВ</div><div><small>ГОСТЬ · НОМЕР 307</small><strong>Елена Ветрова</strong><span>Заявленная связь: отсутствует</span></div>
        </div>
        <div class="identity-link ${identityDone() ? 'confirmed' : ''}"><span>⇄</span><small>${identityDone() ? 'СОВПАДЕНИЕ ПОДТВЕРЖДЕНО' : 'СОПОСТАВЛЕНИЕ'}</small></div>
        <div class="identity-archive-card">
          <div class="identity-portrait old">ВБ</div><div><small>АРХИВ · 2015</small><strong>Вера Белова</strong><span>Младшая сестра Антона Белова</span></div>
        </div>
        <div class="identity-documents">${IDENTITY_IDS.map((id) => `<button class="identity-document ${state.identity.includes(id) ? 'inspected' : ''}" data-identity="${id}"><span>${state.identity.includes(id) ? '✓' : IDENTITY[id].n}</span><div><strong>${IDENTITY[id].label}</strong><small>${state.identity.includes(id) ? IDENTITY[id].title : 'Проверить совпадение'}</small></div></button>`).join('')}</div>
      </section>
      <aside class="act3-investigation-panel">
        <div class="act3-progress"><span>${state.identity.length}/3</span><div><strong>Установление личности</strong><small>${identityDone() ? 'Настоящее имя установлено' : 'Нужно три совпадения'}</small></div></div>
        <div class="act3-finding-list">${IDENTITY_IDS.map((id) => `<button data-identity="${id}" class="${state.identity.includes(id) ? 'done' : ''}"><span>${state.identity.includes(id) ? '✓' : IDENTITY[id].n}</span><div><strong>${IDENTITY[id].label}</strong><small>${state.identity.includes(id) ? IDENTITY[id].title : 'Сопоставить документ'}</small></div></button>`).join('')}</div>
        <div class="act3-result ${identityDone() ? 'success' : ''}">${identityDone()
          ? '<p class="premium-kicker">Вывод по E009</p><h3>Елена Ветрова — Вера Белова</h3><p>Она скрыла родство с погибшим Антоном и передала Илье оригинальную карту. Это объясняет её ложь и визит к 314, но не делает её участницей ночного перемещения через 312.</p><button class="act3-open-people">Сверить показания Дениса и Веры →</button>'
          : latest
            ? `<p class="premium-kicker">Обнаружено</p><h3>${IDENTITY[latest].title}</h3><p>${IDENTITY[latest].text}</p>`
            : '<span>◎</span><strong>Докажите совпадение</strong><p>Одной похожей фотографии недостаточно: нужны документы и переписка.</p>'}</div>
      </aside>
    </div>`;
  body.querySelectorAll<HTMLElement>('[data-identity]').forEach((node) => node.addEventListener('click', () => {
    const id = node.dataset.identity!;
    state.identity = add(state.identity, id);
    save();
    identityModal();
    schedule();
  }));
  body.querySelector('.act3-open-people')?.addEventListener('click', () => { closeModal(); clickTab('Люди'); });
}

function card(id: 'E008' | 'E009', unlocked: boolean): HTMLButtonElement {
  const archive = id === 'E008';
  const seen = archive ? state.archive.length > 0 : state.identity.length > 0;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.evidenceId = id;
  button.disabled = !unlocked;
  button.className = `premium-evidence-card ${archive ? 'amber' : 'cyan'} ${seen ? 'seen' : ''} ${unlocked ? '' : 'locked'} act3-evidence-card`;
  button.innerHTML = `
    <div class="${archive ? 'act3-card-archive' : 'act3-card-identity'}"></div>
    <div class="evidence-card-shade"></div>
    <div class="evidence-card-top"><span>${id}</span><span class="premium-pill ${seen ? 'secure' : unlocked ? 'live' : 'neutral'}">${seen ? 'Изучено' : unlocked ? 'Новое' : 'Закрыто'}</span></div>
    <div class="evidence-card-icon">${archive ? '▤' : '◎'}</div>
    <div class="evidence-card-copy"><small>${archive ? 'Архивное расследование' : 'Проверка личности'}</small><h2>${archive ? 'Оригиналы фестиваля 2015' : 'Кто такая Елена Ветрова?'}</h2><p>${unlocked ? (archive ? 'Восстановите происхождение карты памяти 314-17.' : 'Сопоставьте документы гостьи с архивом семьи Белова.') : (archive ? 'Откроется после полного осмотра номера 312.' : 'Сначала установите, что скрывал Денис.')}</p></div>
    <span class="evidence-number">0${archive ? '8' : '9'}</span>`;
  button.onclick = () => archive ? archiveModal() : identityModal();
  return button;
}

function evidenceGrid(): void {
  if (!roomDone()) return;
  const grid = document.querySelector<HTMLElement>('.premium-evidence-grid');
  if (!grid) return;
  const signature = `${state.archive.length}-${state.identity.length}-${archiveDone()}`;
  if (grid.dataset.act3Cards !== signature || !grid.querySelector('[data-evidence-id="E008"]') || !grid.querySelector('[data-evidence-id="E009"]')) {
    grid.dataset.act3Cards = signature;
    grid.querySelectorAll('.act3-evidence-card').forEach((node) => node.remove());
    grid.append(card('E008', true), card('E009', archiveDone()));
  }

  const section = grid.closest('.premium-section');
  const strong = section?.querySelector<HTMLElement>('.section-stat strong');
  const span = section?.querySelector<HTMLElement>('.section-stat span');
  const act2 = readAct2();
  const studied = 5 + ((act2.plan?.length ?? 0) > 0 ? 1 : 0) + ((act2.room?.length ?? 0) > 0 ? 1 : 0) + (state.archive.length > 0 ? 1 : 0) + (state.identity.length > 0 ? 1 : 0);
  setText(strong ?? null, String(studied));
  if (span && span.innerHTML !== 'из 9<br>изучено') span.innerHTML = 'из 9<br>изучено';
}

function interview(): void {
  if (!roomDone()) return;
  const heading = document.querySelector<HTMLElement>('.character-modal-premium .interview-name h1');
  const container = document.querySelector<HTMLElement>('.character-modal-premium .interview-questions');
  const currentName = heading?.textContent?.trim() ?? '';
  if (!heading || !container) return;

  const isDenis = currentName.includes('Денис Ракитин');
  const isVera = currentName.includes('Елена Ветрова') || currentName.includes('Вера Белова');
  if (!isDenis && !isVera) return;

  if (isVera && identityDone()) heading.textContent = 'Вера Белова';

  const definitions = isDenis
    ? [
        { id: 'd-original', unlock: archiveDone(), q: 'Почему в цифровой папке отсутствует оригинал B-17?', a: 'Я убрал его из общей копии. На записи был разговор, который мог уничтожить нескольких людей и мою работу. Но карту я отдал Илье — после этого был в баре.' },
        { id: 'd-card', unlock: state.archive.includes('custody'), q: 'Почему журнал показывает второй носитель 314-17?', a: 'Антон хранил оригинал отдельно. После его смерти карта оказалась у Веры. Я понял, что именно её она привезла Илье.' }
      ]
    : [
        { id: 'v-name', unlock: identityDone(), q: 'Ваше настоящее имя — Вера Белова?', a: 'Да. Антон был моим братом. Илья попросил не раскрывать имя, пока не скопирует карту и не проверит запись.' },
        { id: 'v-card', unlock: archiveDone() && identityDone(), q: 'Вы передали Илье оригинальную карту 314-17?', a: 'Передала вечером. В 22:48 я подошла спросить, успел ли он сделать копию. Он сказал ждать до утра, и я вернулась в 307-й.' }
      ];

  const signature = `${isDenis ? 'denis' : 'vera'}-${archiveDone()}-${identityDone()}-${state.questions.join(',')}`;
  if (container.dataset.act3Interview === signature) return;
  container.dataset.act3Interview = signature;
  container.querySelectorAll('.act3-interview-topic').forEach((node) => node.remove());

  definitions.forEach((item) => {
    const asked = state.questions.includes(item.id);
    const article = document.createElement('article');
    article.className = `act3-interview-topic ${item.unlock ? '' : 'locked'} ${asked ? 'asked' : ''}`;
    article.innerHTML = `<button ${item.unlock ? '' : 'disabled'}><span>${asked ? '↻' : item.unlock ? '→' : '⌁'}</span><div><small>${asked ? 'Повторить вопрос' : item.unlock ? 'Новый вопрос акта III' : 'Нужны E008 и E009'}</small><strong>${item.q}</strong></div></button>${asked ? `<div class="interview-answer"><span>${isDenis ? 'Денис' : 'Вера'}</span><p>${item.a}</p></div>` : ''}`;
    article.querySelector('button')?.addEventListener('click', () => {
      if (!item.unlock) return;
      state.questions = add(state.questions, item.id);
      save();
      container.dataset.act3Interview = '';
      interview();
      schedule();
    });
    container.append(article);
  });
}

const CHECKPOINT_OPTIONS = [
  {
    id: 'vera_attack',
    text: 'Вера похитила Илью, чтобы вернуть карту памяти.',
    feedback: 'Она скрывала личность и передала карту, но камера фиксирует её возвращение в 307 задолго до ночного перемещения.'
  },
  {
    id: 'denis_route',
    text: 'Денис вывел Илью через скрытый проход и уничтожил оригинал.',
    feedback: 'Денис лгал об архиве, но его присутствие в баре подтверждено. Версия не связывает его с маршрутом через 312.'
  },
  {
    id: 'separate_lies',
    text: 'Денис скрывал оригинал, Вера — свою личность; их ложь объясняет карту, но не исполнителя, использовавшего проход из 312.',
    feedback: 'Верно. Мотив вокруг карты установлен, но физический маршрут по-прежнему ведёт к соседнему номеру 312.',
    correct: true
  },
  {
    id: 'common_plot',
    text: 'Все участники заранее договорились инсценировать исчезновение.',
    feedback: 'Материалы показывают разные причины для лжи, а не подтверждённый общий сговор.'
  }
];

function checkpoint(): void {
  if (!roomDone()) return;
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  if (!dashboard) return;

  let panel = dashboard.querySelector<HTMLElement>('.act3-checkpoint-panel');
  if (!panel) {
    panel = document.createElement('article');
    panel.className = 'premium-panel act3-checkpoint-panel';
    const grid = dashboard.querySelector('.dashboard-grid');
    (grid ?? dashboard).insertAdjacentElement('afterend', panel);
  }

  const signature = `${archiveDone()}-${identityDone()}-${questionsDone()}-${state.checkpointAnswer}-${state.complete}`;
  if (panel.dataset.signature === signature) return;
  panel.dataset.signature = signature;

  const ready = checkpointReady();
  const selected = CHECKPOINT_OPTIONS.find((option) => option.id === state.checkpointAnswer);
  panel.innerHTML = `
    <div class="panel-title"><div><p class="premium-kicker">Логический узел · акт III</p><h2>Промежуточный отчёт №2</h2></div><span class="premium-pill ${ready ? 'secure' : 'neutral'}">${ready ? 'Готов' : `${Number(archiveDone()) + Number(identityDone()) + Number(questionsDone())}/3`}</span></div>
    ${!ready && !state.complete
      ? `<div class="act3-checkpoint-locked"><span>⌁</span><strong>Сначала завершите две ветки и допросы</strong><p>${!archiveDone() ? 'Изучите E008. ' : ''}${archiveDone() && !identityDone() ? 'Изучите E009. ' : ''}${archiveDone() && identityDone() && !questionsDone() ? 'Задайте ключевые вопросы Денису и Вере.' : ''}</p><button class="act3-checkpoint-go">${!archiveDone() || !identityDone() ? 'Перейти к материалам' : 'Перейти к людям'} →</button></div>`
      : `<div class="act3-checkpoint"><p>Как теперь следует разделить установленные факты и ложные показания?</p>${CHECKPOINT_OPTIONS.map((option) => `<button data-checkpoint="${option.id}" class="${state.checkpointAnswer === option.id ? (option.correct ? 'chosen correct' : 'chosen wrong') : ''}" ${state.complete && state.checkpointAnswer !== option.id ? 'disabled' : ''}><span>${state.checkpointAnswer === option.id ? (option.correct ? '✓' : '×') : '○'}</span>${option.text}</button>`).join('')}${selected ? `<div class="act3-feedback ${selected.correct ? 'success' : 'warning'}"><strong>${selected.correct ? 'Вывод принят' : 'Вывод неполон'}</strong><p>${selected.feedback}</p></div>` : ''}</div>`}`;

  panel.querySelector('.act3-checkpoint-go')?.addEventListener('click', () => clickTab(!archiveDone() || !identityDone() ? 'Материалы' : 'Люди'));
  panel.querySelectorAll<HTMLButtonElement>('[data-checkpoint]').forEach((button) => button.addEventListener('click', () => {
    const option = CHECKPOINT_OPTIONS.find((item) => item.id === button.dataset.checkpoint);
    if (!option) return;
    state.checkpointAnswer = option.id;
    if (option.correct) state.complete = true;
    save();
    checkpoint();
    schedule();
  }));
}

function dashboard(): void {
  if (!roomDone()) return;
  const root = document.querySelector<HTMLElement>('.premium-dashboard');
  const hero = root?.querySelector<HTMLElement>('.dashboard-hero');
  if (!root || !hero) return;

  setText(document.querySelector('.topbar-case small'), 'Дело №001 · акт III');
  setText(document.querySelector('.topbar-actions .premium-pill'), state.complete ? 'Мотив установлен' : 'Акт III открыт');
  setText(hero.querySelector('h1'), state.complete ? 'Ложь отделена от исполнения' : 'Что находилось на пропавшей карте памяти?');
  setText(hero.querySelector('p:last-child'), state.complete
    ? 'Денис скрывал оригинал, а Вера — родство с погибшим. Эти мотивы объясняют их ложь, но маршрут похищения по-прежнему ведёт к номеру 312.'
    : archiveDone()
      ? (identityDone() ? 'Материалы установлены. Теперь Денис и Елена должны объяснить, почему скрывали правду.' : 'Денис скрыл оригинал B-17. Установите, кто привёз карту Илье под чужим именем.')
      : 'Осмотр 312 доказал способ проникновения. Теперь восстановите содержание и происхождение исчезнувшей карты памяти.');

  let action = root.querySelector<HTMLButtonElement>('.act3-next-action');
  if (!action) {
    action = document.createElement('button');
    action.type = 'button';
    action.className = 'next-action-card act3-next-action';
    hero.insertAdjacentElement('afterend', action);
  }
  const actionSignature = `${archiveDone()}-${identityDone()}-${questionsDone()}-${state.complete}`;
  if (action.dataset.signature !== actionSignature) {
    action.dataset.signature = actionSignature;
    const target = !archiveDone() || !identityDone() ? 'Материалы' : !questionsDone() ? 'Люди' : 'Дело';
    const title = state.complete ? 'Готовить финальную проверку номера 312' : !archiveDone() ? 'Изучить архив Дениса' : !identityDone() ? 'Установить личность Елены' : !questionsDone() ? 'Повторно допросить Дениса и Елену' : 'Сдать промежуточный отчёт №2';
    const text = state.complete ? 'Следующий этап — связать мотив, маршрут и конкретного исполнителя.' : !archiveDone() ? 'Найдите пропущенный оригинал и цепочку носителя 314-17.' : !identityDone() ? 'Сопоставьте гостью 307 с семьёй погибшего Антона.' : !questionsDone() ? 'Получите прямые объяснения их лжи.' : 'Отделите сокрытие прошлого от ночного похищения.';
    action.innerHTML = `<div class="action-index">Акт III · следующий шаг</div><div><strong>${title}</strong><span>${text}</span></div><span class="act3-action-arrow">→</span>`;
    action.onclick = () => clickTab(target);
  }

  const list = root.querySelector<HTMLUListElement>('.premium-fact-list');
  if (list) {
    const facts = [
      archiveDone() ? 'Оригинальная карта 314-17 существовала и была вероятной целью нападения.' : '',
      archiveDone() ? 'Денис намеренно удалил B-17 из цифровой копии архива.' : '',
      identityDone() ? 'Елена Ветрова — Вера Белова, сестра погибшего Антона.' : '',
      state.complete ? 'Ложь Дениса и Веры не объясняет использование скрытого прохода из номера 312.' : ''
    ].filter(Boolean);
    const factSignature = facts.join('|');
    if (list.dataset.act3Facts !== factSignature) {
      list.dataset.act3Facts = factSignature;
      list.querySelectorAll('.act3-fact').forEach((node) => node.remove());
      facts.forEach((fact, index) => {
        const li = document.createElement('li');
        li.className = 'act3-fact';
        li.innerHTML = `<span>A3-${String(index + 1).padStart(2, '0')}</span><p>${fact}</p>`;
        list.append(li);
      });
    }
  }
}

function scan(): void {
  if (!roomDone()) return;
  dashboard();
  evidenceGrid();
  interview();
  checkpoint();
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    state = load();
    scan();
  });
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(schedule, 90), true);
window.addEventListener('storage', schedule);
window.addEventListener('pageshow', schedule);

// BUILD is intentionally exported only through the DOM version guard loaded after this module.
document.documentElement.dataset.act3Build = BUILD;
schedule();
