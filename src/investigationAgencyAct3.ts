import { ACT3_STORAGE_KEY } from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const CHECK_FIBRES = 'agency3:fibres';
const CHECK_TOOLMARKS = 'agency3:toolmarks';
const CHECK_ENVELOPE = 'agency3:envelope';
const ASK_DENIS_ENVELOPE = 'agency3:denis-envelope';
const ARCHIVE_REQUESTED = 'agency3:archive-requested';

const TRACE_CUSTODY = 'agency3:trace-custody';
const ASK_DENIS_FAMILY = 'agency3:denis-family';
const CHECK_MARINA = 'agency3:id-marina';
const CHECK_DENIS = 'agency3:id-denis';
const CHECK_KIRILL = 'agency3:id-kirill';
const CHECK_ELENA = 'agency3:id-elena';
const IDENTITY_REQUESTED = 'agency3:identity-requested';

let installed = false;
let scheduled = false;
let latestState: InvestigationSnapshot | null = null;

type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

function unique(values: string[], marker: string): string[] {
  return values.includes(marker) ? values : [...values, marker];
}

function has(state: InvestigationSnapshot, marker: string): boolean {
  return state.act3.questions.includes(marker);
}

function readAct3(): Act3State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT3_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    return {
      archive: Array.isArray(raw.archive) ? raw.archive.filter((item): item is string => typeof item === 'string') : [],
      identity: Array.isArray(raw.identity) ? raw.identity.filter((item): item is string => typeof item === 'string') : [],
      questions: Array.isArray(raw.questions) ? raw.questions.filter((item): item is string => typeof item === 'string') : [],
      checkpointAnswer: typeof raw.checkpointAnswer === 'string' ? raw.checkpointAnswer : null,
      complete: raw.complete === true
    };
  } catch {
    return { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false };
  }
}

function record(marker: string): void {
  const current = readAct3();
  const next = { ...current, questions: unique(current.questions, marker) };
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { agency: marker } }));
  refreshInvestigationState(`investigation-agency-act3:${marker}`);
  scheduleApply(`investigation-agency-act3:${marker}`);
}

function archiveRequested(state: InvestigationSnapshot): boolean {
  return has(state, ARCHIVE_REQUESTED) || state.derived.archiveCount > 0;
}

function identityRequested(state: InvestigationSnapshot): boolean {
  return has(state, IDENTITY_REQUESTED) || state.derived.identityCount > 0;
}

function archiveLeadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.act2Complete
    && state.derived.archiveCount === 0
    && !has(state, ARCHIVE_REQUESTED);
}

function archiveReceived(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.act2Complete
    && state.derived.archiveCount === 0
    && has(state, ARCHIVE_REQUESTED);
}

function identityLeadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.archiveCount >= 4
    && state.derived.identityCount === 0
    && !has(state, IDENTITY_REQUESTED)
    && !state.act3.complete;
}

function identityReceived(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.archiveCount >= 4
    && state.derived.identityCount === 0
    && has(state, IDENTITY_REQUESTED)
    && !state.act3.complete;
}

function agencyActive(state: InvestigationSnapshot): boolean {
  return archiveLeadActive(state) || archiveReceived(state) || identityLeadActive(state) || identityReceived(state);
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  const target = buttons.find((button) => button.textContent?.includes(label) && window.getComputedStyle(button).display !== 'none');
  target?.click();
}

function openEvidence(id: 'E008' | 'E009'): void {
  clickTab('Материалы');
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>(`[data-evidence-id="${id}"]`)?.click();
  }));
}

function resultCopy(marker: string): string {
  switch (marker) {
    case CHECK_FIBRES:
      return 'Экспресс-анализ: тёмное синтетическое волокно массового типа. Оно подтверждает свежий контакт с панелью, но не позволяет связать след с конкретным человеком.';
    case CHECK_TOOLMARKS:
      return 'Следы на винтах свежие, но инструмент типовой — крестообразная отвёртка PH2. Индивидуализировать инструмент невозможно.';
    case CHECK_ENVELOPE:
      return 'На обороте: штамп «BOX 15-B / CONTACT B» и запись Дениса «оригинал — у А.Б.». Конверт относится к техническому архиву фестиваля 2015 года.';
    case ASK_DENIS_ENVELOPE:
      return 'Денис: «А.Б. — Антон Белов. После его гибели часть оригиналов не вернулась в общую оцифровку. Коробку 15-B хранили отдельно».';
    case TRACE_CUSTODY:
      return 'В дополнительном листе выдачи найдено: один из оригинальных носителей после гибели Антона временно получила Вера Белова — его младшая сестра.';
    case ASK_DENIS_FAMILY:
      return 'Денис подтверждает: Илья хотел, чтобы на встрече присутствовал кто-то из семьи Белова. Вера должна была приехать, но Денис утверждает, что не знает, под какой фамилией она зарегистрировалась.';
    case CHECK_MARINA:
      return 'Личность Марины подтверждается кадровыми документами отеля и непрерывной историей работы. Несоответствий нет.';
    case CHECK_DENIS:
      return 'Паспортные данные Дениса совпадают с договорами по архиву 2015 года. Несоответствий личности нет.';
    case CHECK_KIRILL:
      return 'Данные Кирилла совпадают с договорами организатора и архивными документами фестиваля. Подмена личности не обнаружена.';
    case CHECK_ELENA:
      return 'Базовая сверка даёт аномалию: дата рождения Елены совпадает с архивной записью Веры Беловой, а фамилия «Ветрова» появляется в доступных документах только позднее. Нужна полноценная документальная проверка.';
    default:
      return '';
  }
}

function actionCard(state: InvestigationSnapshot, marker: string, title: string, subtitle: string, disabled = false): string {
  const done = has(state, marker);
  return `<button type="button" class="evidence-led-action ${done ? 'done' : ''}" data-evidence-led-action="${marker}" ${done || disabled ? 'disabled' : ''}>
    <span>${done ? '✓' : disabled ? '·' : '○'}</span><div><strong>${title}</strong><small>${done ? resultCopy(marker) : subtitle}</small></div>
  </button>`;
}

function archiveLeadMarkup(state: InvestigationSnapshot): string {
  const breakthrough = has(state, CHECK_ENVELOPE) && has(state, ASK_DENIS_ENVELOPE);
  return `<section class="evidence-led-panel" data-evidence-led-mode="archive-lead" aria-label="Следственная развилка после номера 312">
    <header><div><p>Следственная развилка</p><h2>Почему след из 312 ведёт дальше?</h2></div><span>Ваш ход</span></header>
    <p class="evidence-led-intro">Скрытый маршрут существовал и использовался этой ночью. В комнате Кирилла найден конверт из старого архива. Теперь решите, какие проверки действительно могут объяснить, <strong>зачем кому-то понадобился этот маршрут</strong>.</p>
    <div class="evidence-led-actions">
      ${actionCard(state, CHECK_FIBRES, 'Отправить волокна на экспресс-анализ', 'Попробовать связать свежий след у панели с конкретным человеком.')}
      ${actionCard(state, CHECK_TOOLMARKS, 'Проверить следы инструмента на винтах', 'Установить, можно ли идентифицировать инструмент, которым открывали панель.')}
      ${actionCard(state, CHECK_ENVELOPE, 'Изучить маркировку конверта 2015 года', 'Проверить штампы, архивный код и рукописную пометку Дениса.')}
      ${actionCard(state, ASK_DENIS_ENVELOPE, 'Спросить Дениса о пометке «А.Б.»', 'Уточнить, кого обозначают инициалы и почему материал оказался в 312.')}
    </div>
    ${breakthrough ? `<div class="evidence-led-breakthrough"><p>Основание для нового запроса</p><h3>Конверт ведёт в отдельную архивную коробку фестиваля 2015 года</h3><span>Две независимые зацепки совпали: архивный код BOX 15-B и объяснение Дениса о пропавших оригиналах после гибели Антона. Теперь следователь имеет причину поднимать старый архив — не потому, что игра сказала «идите в архив».</span><button type="button" data-evidence-led-action="${ARCHIVE_REQUESTED}">Запросить BOX 15-B и журнал оцифровки →</button></div>` : '<div class="evidence-led-waiting">Проверяйте версии. Некоторые действия подтвердят детали, но не дадут нового направления.</div>'}
  </section>`;
}

function archiveReceivedMarkup(): string {
  return `<section class="evidence-led-panel" data-evidence-led-mode="archive-received" aria-label="Получены архивные материалы">
    <header><div><p>Ответ на запрос</p><h2>Архив выдал BOX 15-B и журнал оцифровки</h2></div><span>Новый материал</span></header>
    <p class="evidence-led-intro">Этот материал появился как результат вашей проверки конверта и объяснения Дениса. Теперь можно восстановить, какого оригинала не хватает и почему он был важен Илье.</p>
    <button type="button" class="evidence-led-open" data-evidence-led-action="open-e008">Открыть полученный архивный материал →</button>
  </section>`;
}

function identityLeadMarkup(state: InvestigationSnapshot): string {
  const custody = has(state, TRACE_CUSTODY);
  const family = has(state, ASK_DENIS_FAMILY);
  const candidateStage = custody && family;
  const elenaChecked = has(state, CHECK_ELENA);

  return `<section class="evidence-led-panel" data-evidence-led-mode="identity-lead" aria-label="Проверка неизвестного участника старого дела">
    <header><div><p>Новая проблема</p><h2>Кому принадлежала цепочка B-17 после гибели Антона?</h2></div><span>Ваш ход</span></header>
    <p class="evidence-led-intro">Архив доказал существование B-17 и связь старого происшествия с Кириллом. Но в цепочке хранения оригинала остаётся пробел. Не назначайте подозреваемого заранее — восстановите, <strong>кто мог сохранить носитель до встречи с Ильёй</strong>.</p>
    <div class="evidence-led-actions compact">
      ${actionCard(state, TRACE_CUSTODY, 'Поднять дополнительный лист выдачи носителей', 'Проследить судьбу оригиналов после гибели Антона.')}
      ${actionCard(state, ASK_DENIS_FAMILY, 'Уточнить у Дениса, кто должен был представлять семью Белова', custody ? 'Спросить о Вере Беловой и её участии во встрече.' : 'Сначала установите имя в цепочке хранения.', !custody)}
    </div>
    ${candidateStage ? `<div class="evidence-led-breakthrough identity"><p>Несоответствие</p><h3>Вера Белова должна была приехать, но такого имени среди участников нет</h3><span>Если она присутствует под другим именем, это нужно доказать документами. Выберите, чью личность разумно проверить. Ошибочная проверка не штрафуется — она просто исключит человека.</span></div>
      <div class="evidence-led-actions candidates">
        ${actionCard(state, CHECK_MARINA, 'Проверить Марину Орлову', 'Сверить личность с кадровой историей отеля.')}
        ${actionCard(state, CHECK_DENIS, 'Проверить Дениса Ракитина', 'Сверить личность с архивными договорами.')}
        ${actionCard(state, CHECK_KIRILL, 'Проверить Кирилла Бессонова', 'Сверить личность с документами организатора фестиваля.')}
        ${actionCard(state, CHECK_ELENA, 'Проверить Елену Ветрову', 'Сверить базовые анкетные данные с архивом семьи Белова.')}
      </div>` : '<div class="evidence-led-waiting">Сначала восстановите цепочку хранения и выясните, кто из семьи Белова должен был приехать.</div>'}
    ${elenaChecked ? `<div class="evidence-led-breakthrough"><p>Основание для документальной проверки</p><h3>У Елены обнаружено совпадение, которое нельзя считать случайным без проверки</h3><span>Базовые данные совпали с Верой Беловой. Теперь следователь имеет право запросить регистрационные карточки, старые документы и переписку Ильи для полноценного сопоставления.</span><button type="button" data-evidence-led-action="${IDENTITY_REQUESTED}">Запросить документы для проверки Елены →</button></div>` : ''}
  </section>`;
}

function identityReceivedMarkup(): string {
  return `<section class="evidence-led-panel" data-evidence-led-mode="identity-received" aria-label="Получены документы для проверки личности">
    <header><div><p>Ответ на запрос</p><h2>Получены документы Елены и архив семьи Белова</h2></div><span>Новый материал</span></header>
    <p class="evidence-led-intro">Проверка возникла из установленной цепочки хранения B-17 и отсутствующего имени Веры среди участников. Теперь можно провести полноценное сопоставление личности.</p>
    <button type="button" class="evidence-led-open" data-evidence-led-action="open-e009">Провести документальную сверку →</button>
  </section>`;
}

function gateCards(state: InvestigationSnapshot): void {
  const e008 = document.querySelector<HTMLButtonElement>('[data-evidence-id="E008"]');
  if (e008) {
    const available = archiveRequested(state);
    e008.dataset.evidenceLedAvailable = available ? '1' : '0';
    e008.hidden = !available;
    e008.style.display = available ? '' : 'none';
    if (!available) e008.disabled = true;
  }

  const e009 = document.querySelector<HTMLButtonElement>('[data-evidence-id="E009"]');
  if (e009) {
    const available = identityRequested(state);
    e009.dataset.evidenceLedAvailable = available ? '1' : '0';
    e009.hidden = !available;
    e009.style.display = available ? '' : 'none';
    if (!available) e009.disabled = true;
  }
}

function neutralizeDashboard(state: InvestigationSnapshot): void {
  if (!agencyActive(state)) return;
  const hero = document.querySelector<HTMLElement>('.premium-dashboard .dashboard-hero');
  const next = document.querySelector<HTMLElement>('.react-next-action');
  if (next) next.style.display = 'none';
  if (!hero) return;

  const kicker = hero.querySelector<HTMLElement>('.premium-kicker');
  const title = hero.querySelector<HTMLElement>('h1');
  const body = hero.querySelector<HTMLElement>('p:not(.premium-kicker)');
  if (kicker) kicker.textContent = 'Рабочая задача';

  if (archiveLeadActive(state)) {
    if (title) title.textContent = 'Что связывает номер 312 со старым делом?';
    if (body) body.textContent = 'Скрытый маршрут доказан. Теперь решите, какие найденные в комнате следы объясняют мотив и ведут к следующему источнику.';
  } else if (archiveReceived(state)) {
    if (title) title.textContent = 'Получен материал по вашему запросу';
    if (body) body.textContent = 'BOX 15-B и журнал оцифровки готовы к изучению.';
  } else if (identityLeadActive(state)) {
    if (title) title.textContent = 'Кто сохранил оригинал B-17?';
    if (body) body.textContent = 'Восстановите цепочку хранения после гибели Антона и только затем решайте, чью личность нужно проверять.';
  } else if (identityReceived(state)) {
    if (title) title.textContent = 'Есть основание проверить личность Елены';
    if (body) body.textContent = 'Документы получены. Теперь сопоставьте их самостоятельно.';
  }
}

function neutralizeGuidance(state: InvestigationSnapshot): void {
  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  if (!guide || !agencyActive(state)) return;

  guide.dataset.evidenceLedAgency = '1';
  const small = guide.querySelector<HTMLElement>('.player-guide-floating-copy > small');
  const strong = guide.querySelector<HTMLElement>('.player-guide-floating-copy > strong');
  const paragraph = guide.querySelector<HTMLElement>('.player-guide-floating-copy > p');
  const progress = guide.querySelector<HTMLElement>('.player-guide-floating-copy > span');
  const next = guide.querySelector<HTMLButtonElement>('.player-guide-next');
  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');

  if (small) small.textContent = 'Следственное решение';
  if (strong) strong.textContent = archiveLeadActive(state) || archiveReceived(state)
    ? 'Следующее направление должно появиться из найденных фактов'
    : 'Не назначайте личность заранее — сначала получите основание';
  if (paragraph) paragraph.textContent = 'Выберите проверку в рабочей панели. Интерфейс не назовёт правильный материал или человека заранее.';
  if (progress) progress.textContent = 'Дедукция принадлежит игроку';
  if (next) {
    next.disabled = true;
    const s = next.querySelector<HTMLElement>('small');
    const st = next.querySelector<HTMLElement>('strong');
    const b = next.querySelector<HTMLElement>('b');
    if (s) s.textContent = 'Ваш ход';
    if (st) st.textContent = 'Выберите следственную проверку';
    if (b) b.textContent = '·';
  }
  if (explain) explain.style.display = 'none';
}

function restoreChrome(state: InvestigationSnapshot): void {
  if (agencyActive(state)) return;
  const next = document.querySelector<HTMLElement>('.react-next-action');
  if (next) next.style.display = '';
  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  if (!guide) return;
  guide.dataset.evidenceLedAgency = '0';
  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');
  const guideNext = guide.querySelector<HTMLButtonElement>('.player-guide-next');
  if (explain) explain.style.display = '';
  if (guideNext) guideNext.disabled = false;
}

function panelMarkup(state: InvestigationSnapshot): string {
  if (archiveLeadActive(state)) return archiveLeadMarkup(state);
  if (archiveReceived(state)) return archiveReceivedMarkup();
  if (identityLeadActive(state)) return identityLeadMarkup(state);
  return identityReceivedMarkup();
}

function renderPanel(state: InvestigationSnapshot): void {
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  const existing = document.querySelector<HTMLElement>('.evidence-led-panel');
  if (!dashboard || !agencyActive(state)) {
    existing?.remove();
    return;
  }

  const signature = [state.derived.stage, state.act3.questions.join('|')].join(':');
  if (existing?.dataset.signature === signature) return;
  existing?.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = panelMarkup(state);
  const panel = wrapper.firstElementChild as HTMLElement | null;
  if (!panel) return;
  panel.dataset.signature = signature;

  const hero = dashboard.querySelector('.dashboard-hero');
  if (hero?.parentElement) hero.insertAdjacentElement('afterend', panel);
  else dashboard.prepend(panel);
}

function apply(state = latestState ?? refreshInvestigationState('investigation-agency-act3:apply')): void {
  latestState = state;
  gateCards(state);
  neutralizeDashboard(state);
  neutralizeGuidance(state);
  restoreChrome(state);
  renderPanel(state);
}

function scheduleApply(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    latestState = refreshInvestigationState(reason);
    apply(latestState);
  }));
}

function handleAction(event: MouseEvent): void {
  const target = event.target as Element | null;
  const button = target?.closest<HTMLButtonElement>('[data-evidence-led-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.evidenceLedAction;
  if (!action) return;

  if (action === 'open-e008') {
    openEvidence('E008');
    return;
  }
  if (action === 'open-e009') {
    openEvidence('E009');
    return;
  }

  const state = refreshInvestigationState('investigation-agency-act3:before-action');
  if (action === ASK_DENIS_FAMILY && !has(state, TRACE_CUSTODY)) return;
  if (action === ARCHIVE_REQUESTED && !(has(state, CHECK_ENVELOPE) && has(state, ASK_DENIS_ENVELOPE))) return;
  if (action === IDENTITY_REQUESTED && !has(state, CHECK_ELENA)) return;

  const allowed = [
    CHECK_FIBRES, CHECK_TOOLMARKS, CHECK_ENVELOPE, ASK_DENIS_ENVELOPE, ARCHIVE_REQUESTED,
    TRACE_CUSTODY, ASK_DENIS_FAMILY, CHECK_MARINA, CHECK_DENIS, CHECK_KIRILL, CHECK_ELENA,
    IDENTITY_REQUESTED
  ];
  if (allowed.includes(action)) record(action);
}

export function installInvestigationAgencyAct3(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => {
    latestState = state;
    scheduleApply('investigation-agency-act3:state');
  });

  document.addEventListener('click', handleAction);
  document.addEventListener('click', () => scheduleApply('investigation-agency-act3:click'), true);
  window.addEventListener('pageshow', () => scheduleApply('investigation-agency-act3:pageshow'));
  window.addEventListener('dbr:runtime-settled', () => scheduleApply('investigation-agency-act3:runtime'));
  window.addEventListener('dbr:act2-updated', () => scheduleApply('investigation-agency-act3:act2'));
  window.addEventListener('dbr:act3-updated', () => scheduleApply('investigation-agency-act3:act3'));

  scheduleApply('investigation-agency-act3:install');
}
