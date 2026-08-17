import { ACT2_STORAGE_KEY, ACT3_STORAGE_KEY } from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const ENVELOPE_HANDWRITING = 'agency:envelope-handwriting';
const ENVELOPE_MEDIA_LINK = 'agency:envelope-media-link';
const FIBRE_LAB = 'agency:fibre-lab';
const KIRILL_ENVELOPE = 'agency:kirill-envelope';
const ARCHIVE_REQUESTED = 'agency:archive-requested';

const VERA_RELATIVE = 'agency:vera-relative';
const VERA_CURRENT_GUESTS = 'agency:vera-current-guests';
const DENIS_VERA = 'agency:denis-vera';
const ARCHIVE_DEAD_END = 'agency:archive-dead-end';
const IDENTITY_REQUESTED = 'agency:identity-requested';

let installed = false;
let scheduled = false;
let latestState: InvestigationSnapshot | null = null;

type Act2State = { plan: string[]; room: string[]; questions: string[] };
type Act3State = { archive: string[]; identity: string[]; questions: string[]; checkpointAnswer: string | null; complete: boolean };

function unique(values: string[], marker: string): string[] {
  return values.includes(marker) ? values : [...values, marker];
}

function readAct2(): Act2State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT2_STORAGE_KEY) ?? '{}') as Partial<Act2State>;
    return {
      plan: Array.isArray(raw.plan) ? raw.plan : [],
      room: Array.isArray(raw.room) ? raw.room : [],
      questions: Array.isArray(raw.questions) ? raw.questions : []
    };
  } catch {
    return { plan: [], room: [], questions: [] };
  }
}

function readAct3(): Act3State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT3_STORAGE_KEY) ?? '{}') as Partial<Act3State>;
    return {
      archive: Array.isArray(raw.archive) ? raw.archive : [],
      identity: Array.isArray(raw.identity) ? raw.identity : [],
      questions: Array.isArray(raw.questions) ? raw.questions : [],
      checkpointAnswer: typeof raw.checkpointAnswer === 'string' ? raw.checkpointAnswer : null,
      complete: raw.complete === true
    };
  } catch {
    return { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false };
  }
}

function has2(state: InvestigationSnapshot, marker: string): boolean {
  return state.act2.questions.includes(marker);
}

function has3(state: InvestigationSnapshot, marker: string): boolean {
  return state.act3.questions.includes(marker);
}

function record2(marker: string): void {
  const current = readAct2();
  localStorage.setItem(ACT2_STORAGE_KEY, JSON.stringify({ ...current, questions: unique(current.questions, marker) }));
  window.dispatchEvent(new CustomEvent('dbr:act2-updated', { detail: { causalEvidence: marker } }));
  refreshInvestigationState(`causal-evidence:${marker}`);
  scheduleApply(`causal-evidence:${marker}`);
}

function record3(marker: string): void {
  const current = readAct3();
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify({ ...current, questions: unique(current.questions, marker) }));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { causalEvidence: marker } }));
  refreshInvestigationState(`causal-evidence:${marker}`);
  scheduleApply(`causal-evidence:${marker}`);
}

function archiveRequested(state: InvestigationSnapshot): boolean {
  return has2(state, ARCHIVE_REQUESTED) || state.derived.archiveCount > 0;
}

function identityRequested(state: InvestigationSnapshot): boolean {
  return has3(state, IDENTITY_REQUESTED) || state.derived.identityCount > 0;
}

function archiveLeadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.roomCount >= 4
    && state.derived.archiveCount === 0
    && !archiveRequested(state);
}

function archiveReceived(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.roomCount >= 4
    && state.derived.archiveCount === 0
    && has2(state, ARCHIVE_REQUESTED);
}

function identityLeadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.archiveCount >= 4
    && state.derived.identityCount === 0
    && !identityRequested(state);
}

function identityReceived(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.derived.archiveCount >= 4
    && state.derived.identityCount === 0
    && has3(state, IDENTITY_REQUESTED);
}

function causalMode(state: InvestigationSnapshot): 'archive-lead' | 'archive-received' | 'identity-lead' | 'identity-received' | 'off' {
  if (archiveLeadActive(state)) return 'archive-lead';
  if (archiveReceived(state)) return 'archive-received';
  if (identityLeadActive(state)) return 'identity-lead';
  if (identityReceived(state)) return 'identity-received';
  return 'off';
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  buttons.find((button) => button.textContent?.includes(label) && button.getClientRects().length > 0)?.click();
}

function resultCopy(marker: string): string {
  switch (marker) {
    case FIBRE_LAB:
      return 'Волокна тёмной ткани слишком распространены: лаборатория не смогла связать их с конкретным человеком.';
    case KIRILL_ENVELOPE:
      return 'Кирилл отрицает, что видел конверт раньше. Само отрицание не устанавливает его происхождение.';
    case ENVELOPE_HANDWRITING:
      return 'Сравнение с архивными подписями: пометка «оригинал — у А.Б.» сделана рукой Дениса Ракитина.';
    case ENVELOPE_MEDIA_LINK:
      return 'Слово «оригинал», пустой футляр из сумки Ильи и номер на конверте указывают на отдельный физический носитель, а не обычный документ.';
    case ARCHIVE_DEAD_END:
      return 'В открытой цифровой папке фестиваля нет файла с таким номером. Если оригинал существовал, его нужно искать по бумажной описи.';
    case DENIS_VERA:
      return 'Денис: «Вера Белова — сестра Антона. После 2015-го я её почти не видел». Это объясняет фамилию, но не её нынешнее местонахождение.';
    case VERA_RELATIVE:
      return 'Список родственников погибшего: Вера Белова, младшая сестра Антона. В журнале носителей она указана как получатель второго оригинала B-17.';
    case VERA_CURRENT_GUESTS:
      return 'Гостьи с именем «Вера Белова» сейчас в отеле нет. Значит, нужно либо искать её вне отеля, либо проверить, не зарегистрирована ли она под другими данными.';
    default:
      return '';
  }
}

function action(state: InvestigationSnapshot, marker: string, title: string, subtitle: string, section: 2 | 3): string {
  const done = section === 2 ? has2(state, marker) : has3(state, marker);
  return `<button type="button" class="agency-action ${done ? 'done' : ''}" data-causal-action="${marker}" ${done ? 'disabled' : ''}>
    <span>${done ? '✓' : '○'}</span><div><strong>${title}</strong><small>${done ? resultCopy(marker) : subtitle}</small></div>
  </button>`;
}

function archiveLeadMarkup(state: InvestigationSnapshot): string {
  const breakthrough = has2(state, ENVELOPE_HANDWRITING) && has2(state, ENVELOPE_MEDIA_LINK);
  return `<section class="investigation-agency-panel causal-evidence-panel" data-causal-mode="archive-lead" aria-label="Выбор следующей линии расследования">
    <header><div><p>Новая развилка</p><h2>Что означает конверт, найденный в номере 312?</h2></div><span>Ваш ход</span></header>
    <p class="agency-lead">Проход действительно использовали этой ночью. Но в комнате Кирилла найден ещё один независимый след: старый конверт 2015 года с пометкой «оригинал — у А.Б.». Решите сами, какие проверки помогут понять, имеет ли он отношение к исчезновению Ильи.</p>
    <div class="agency-actions">
      ${action(state, FIBRE_LAB, 'Отправить волокна на срочное сравнение', 'Попытаться связать ткань у панели с одеждой участников.', 2)}
      ${action(state, KIRILL_ENVELOPE, 'Спросить Кирилла о конверте', 'Проверить, признаёт ли он найденный в своём номере предмет.', 2)}
      ${action(state, ENVELOPE_HANDWRITING, 'Проверить почерк на обороте', 'Сопоставить пометку с подписями участников и архивными документами.', 2)}
      ${action(state, ENVELOPE_MEDIA_LINK, 'Сопоставить конверт с вещами Ильи', 'Проверить номер, слово «оригинал» и пустой футляр карты памяти.', 2)}
    </div>
    ${breakthrough ? `<div class="agency-breakthrough"><p>Основание для запроса</p><h3>Денис пометил отдельный оригинальный носитель</h3><span>Теперь есть конкретная причина проверить архив фестиваля 2015 года: не потому, что игра сказала «идите в архив», а потому что найденный в 312 предмет связан с Денисом и отсутствующим носителем Ильи.</span><button type="button" data-causal-action="${ARCHIVE_REQUESTED}">Запросить бумажную опись и оригиналы фестиваля 2015 →</button></div>` : '<div class="agency-waiting">Проверяйте версии. Архив не откроется, пока найденные факты не дадут конкретного основания для запроса.</div>'}
  </section>`;
}

function archiveReceivedMarkup(): string {
  return `<section class="investigation-agency-panel causal-evidence-panel" data-causal-mode="archive-received" aria-label="Получены архивные материалы">
    <header><div><p>Ответ на запрос</p><h2>Архив выдал коробку фестиваля 2015 года</h2></div><span>Новый материал</span></header>
    <p class="agency-lead">Запрос основан на найденном в 312 конверте, почерке Дениса и пустом футляре Ильи. В бумажной описи есть позиции, отсутствующие в цифровой копии.</p>
    <button type="button" class="agency-open-materials" data-causal-action="open-e008">Открыть полученные архивные материалы →</button>
  </section>`;
}

function identityLeadMarkup(state: InvestigationSnapshot): string {
  const breakthrough = has3(state, VERA_RELATIVE) && has3(state, VERA_CURRENT_GUESTS);
  return `<section class="investigation-agency-panel causal-evidence-panel" data-causal-mode="identity-lead" aria-label="Проверка нового лица в деле">
    <header><div><p>Новая неизвестная</p><h2>Кто такая Вера Белова и где она сейчас?</h2></div><span>Ваш ход</span></header>
    <p class="agency-lead">Архив показал: второй оригинал B-17 был передан Вере Беловой. Это имя раньше не фигурировало среди четырёх участников встречи. Не выбирайте подозреваемого заранее — сначала установите, кто эта женщина и может ли она быть связана с нынешними гостями.</p>
    <div class="agency-actions">
      ${action(state, ARCHIVE_DEAD_END, 'Проверить открытую цифровую папку ещё раз', 'Убедиться, что B-17 действительно отсутствует среди переданных файлов.', 3)}
      ${action(state, DENIS_VERA, 'Спросить Дениса о Вере Беловой', 'Установить, почему её имя есть в журнале оригиналов.', 3)}
      ${action(state, VERA_RELATIVE, 'Проверить список родственников Антона', 'Установить личность Веры по материалам 2015 года.', 3)}
      ${action(state, VERA_CURRENT_GUESTS, 'Проверить Веру по текущей регистрации отеля', 'Есть ли человек с таким именем среди нынешних гостей?', 3)}
    </div>
    ${breakthrough ? `<div class="agency-breakthrough"><p>Логический разрыв</p><h3>Получатель B-17 не зарегистрирован под своим именем</h3><span>Вера — сестра Антона и держатель оригинала, но среди гостей её нет. Теперь оправдан следующий реальный следственный шаг: сопоставить архивные данные Веры с регистрационными карточками нынешних участников.</span><button type="button" data-causal-action="${IDENTITY_REQUESTED}">Сопоставить данные Веры с регистрациями нынешних гостей →</button></div>` : '<div class="agency-waiting">Сначала установите, кто такая Вера и присутствует ли она в отеле под своим именем.</div>'}
  </section>`;
}

function identityReceivedMarkup(): string {
  return `<section class="investigation-agency-panel causal-evidence-panel" data-causal-mode="identity-received" aria-label="Найдено регистрационное совпадение">
    <header><div><p>Результат сопоставления</p><h2>В регистрациях найдено вероятное совпадение</h2></div><span>Требует проверки</span></header>
    <p class="agency-lead">Одна из нынешних регистрационных карточек совпадает с архивными данными Веры по нескольким признакам. Это ещё не доказательство личности — проведите отдельную проверку документов и переписки.</p>
    <button type="button" class="agency-open-materials" data-causal-action="open-e009">Открыть проверку регистрационного совпадения →</button>
  </section>`;
}

function renderPanel(state: InvestigationSnapshot): void {
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  const existing = document.querySelector<HTMLElement>('.causal-evidence-panel');
  const mode = causalMode(state);

  if (!dashboard || mode === 'off') {
    existing?.remove();
    return;
  }

  const signature = `${mode}:${state.act2.questions.join('|')}:${state.act3.questions.join('|')}`;
  if (existing?.dataset.signature === signature) return;
  existing?.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = mode === 'archive-lead' ? archiveLeadMarkup(state)
    : mode === 'archive-received' ? archiveReceivedMarkup()
      : mode === 'identity-lead' ? identityLeadMarkup(state)
        : identityReceivedMarkup();
  const panel = wrapper.firstElementChild as HTMLElement | null;
  if (!panel) return;
  panel.dataset.signature = signature;

  const hero = dashboard.querySelector('.dashboard-hero');
  if (hero?.parentElement) hero.insertAdjacentElement('afterend', panel);
  else dashboard.prepend(panel);
}

function gateCards(state: InvestigationSnapshot): void {
  const e008 = document.querySelector<HTMLButtonElement>('[data-evidence-id="E008"]');
  if (e008) {
    const available = archiveRequested(state);
    e008.hidden = !available;
    e008.style.display = available ? '' : 'none';
    e008.disabled = !available;
    e008.dataset.causalAvailable = available ? '1' : '0';
    if (available) {
      const summary = e008.querySelector<HTMLElement>('.evidence-card-copy p');
      if (summary) summary.textContent = 'Бумажная опись и оригиналы, запрошенные после проверки конверта из номера 312.';
    }
  }

  const e009 = document.querySelector<HTMLButtonElement>('[data-evidence-id="E009"]');
  if (e009) {
    const available = identityRequested(state);
    e009.hidden = !available;
    e009.style.display = available ? '' : 'none';
    e009.disabled = !available;
    e009.dataset.causalAvailable = available ? '1' : '0';
    if (available && state.derived.identityCount === 0) {
      const title = e009.querySelector<HTMLElement>('.evidence-card-copy h2');
      const summary = e009.querySelector<HTMLElement>('.evidence-card-copy p');
      if (title) title.textContent = 'Регистрационное совпадение';
      if (summary) summary.textContent = 'Проверьте, совпадает ли одна из нынешних регистраций с архивными данными Веры Беловой.';
    }
  }
}

function neutralizeAutomaticRoute(state: InvestigationSnapshot): void {
  const mode = causalMode(state);
  const active = mode === 'archive-lead' || mode === 'identity-lead';
  const next = document.querySelector<HTMLElement>('.react-next-action');
  if (next) next.style.display = active ? 'none' : '';

  const hero = document.querySelector<HTMLElement>('.premium-dashboard .dashboard-hero');
  if (hero && active) {
    const kicker = hero.querySelector<HTMLElement>('.premium-kicker');
    const title = hero.querySelector<HTMLElement>('h1');
    const body = hero.querySelector<HTMLElement>('p:not(.premium-kicker)');
    if (kicker) kicker.textContent = 'Рабочая задача';
    if (mode === 'archive-lead') {
      if (title) title.textContent = 'Что означает находка в номере 312?';
      if (body) body.textContent = 'Маршрут подтверждён. Теперь отделите следы самого прохода от предметов, которые могут объяснить мотив исчезновения.';
    } else {
      if (title) title.textContent = 'Кому принадлежал оригинал B-17?';
      if (body) body.textContent = 'Архив дал новое имя. Установите человека и только потом решайте, связано ли оно с нынешними участниками.';
    }
  }

  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  if (!guide) return;
  guide.dataset.causalEvidence = mode;
  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');
  const nextButton = guide.querySelector<HTMLButtonElement>('.player-guide-next');
  if (active) {
    const small = guide.querySelector<HTMLElement>('.player-guide-floating-copy > small');
    const strong = guide.querySelector<HTMLElement>('.player-guide-floating-copy > strong');
    const paragraph = guide.querySelector<HTMLElement>('.player-guide-floating-copy > p');
    if (small) small.textContent = 'Следственное решение';
    if (strong) strong.textContent = mode === 'archive-lead' ? 'Разберите находки номера 312' : 'Установите Веру Белову';
    if (paragraph) paragraph.textContent = 'Конкретное направление не подсказывается. Выберите проверку и оцените результат.';
    if (nextButton) {
      nextButton.disabled = true;
      const nextSmall = nextButton.querySelector<HTMLElement>('small');
      const nextStrong = nextButton.querySelector<HTMLElement>('strong');
      const arrow = nextButton.querySelector<HTMLElement>('b');
      if (nextSmall) nextSmall.textContent = 'Ваш ход';
      if (nextStrong) nextStrong.textContent = 'Выберите следственное действие';
      if (arrow) arrow.textContent = '·';
    }
    if (explain) explain.style.display = 'none';
  } else {
    if (nextButton) nextButton.disabled = false;
    if (explain) explain.style.display = '';
  }
}

function rewriteArchiveEvidence(): void {
  const modal = document.querySelector<HTMLElement>('.react-case-modal.evidence-e008');
  if (!modal) return;

  const buttons = Array.from(modal.querySelectorAll<HTMLButtonElement>('.react-point-list button'));
  const custody = buttons.find((button) => button.textContent?.includes('Журнал носителей'));
  if (custody?.classList.contains('done')) {
    const small = custody.querySelector<HTMLElement>('small');
    if (small) small.textContent = 'Оригинал B-17 получила Вера Белова';
  }

  const finding = modal.querySelector<HTMLElement>('.react-finding');
  if (finding && custody?.classList.contains('done') && modal.textContent?.includes('Второй носитель')) {
    const title = finding.querySelector<HTMLElement>('h3');
    const body = finding.querySelector<HTMLElement>('p:last-child');
    if (title) title.textContent = 'Второй оригинал был у Веры Беловой';
    if (body) body.textContent = 'Журнал выдачи связывает оригинал B-17 с Верой Беловой — сестрой погибшего Антона. Этот человек ещё не объяснён в текущем составе участников.';
  }

  const success = modal.querySelector<HTMLElement>('.react-finding.success');
  if (success) {
    const title = success.querySelector<HTMLElement>('h3');
    const body = success.querySelector<HTMLElement>('p:last-child');
    if (title) title.textContent = 'B-17 существовал, а второй оригинал ушёл Вере Беловой';
    if (body) body.textContent = 'Денис исключил B-17 из цифровой копии. Бумажный журнал показывает отдельный оригинальный носитель, переданный Вере Беловой.';
  }
}

function rewriteIdentityModal(): void {
  const modal = document.querySelector<HTMLElement>('.react-case-modal.evidence-e009');
  if (!modal) return;
  const header = modal.querySelector<HTMLElement>('.premium-modal-header > div');
  const title = header?.querySelector<HTMLElement>('h1');
  const summary = header?.querySelector<HTMLElement>('p:last-of-type');
  if (title) title.textContent = 'Проверка регистрационного совпадения';
  if (summary) summary.textContent = 'Сопоставьте архивные данные Веры Беловой с регистрацией нынешней гостьи. Совпадение должно быть доказано несколькими независимыми признаками.';
}

function apply(state = latestState ?? refreshInvestigationState('causal-evidence:apply')): void {
  latestState = state;
  gateCards(state);
  renderPanel(state);
  neutralizeAutomaticRoute(state);
  rewriteArchiveEvidence();
  rewriteIdentityModal();
  document.documentElement.dataset.dbrCausalEvidence = causalMode(state);
}

function scheduleApply(reason = 'causal-evidence:scheduled'): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    apply(refreshInvestigationState(reason));
    window.requestAnimationFrame(() => apply(refreshInvestigationState(`${reason}:settled`)));
  });
}

function handleAction(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-causal-action]') : null;
  if (!target) return;
  const actionName = target.dataset.causalAction;
  if (!actionName) return;

  const state = refreshInvestigationState('causal-evidence:before-action');

  if (actionName === 'open-e008') {
    clickTab('Материалы');
    scheduleApply('causal-evidence:open-e008');
    window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-evidence-id="E008"]')?.click());
    return;
  }
  if (actionName === 'open-e009') {
    clickTab('Материалы');
    scheduleApply('causal-evidence:open-e009');
    window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-evidence-id="E009"]')?.click());
    return;
  }

  if (actionName === ARCHIVE_REQUESTED) {
    if (!(has2(state, ENVELOPE_HANDWRITING) && has2(state, ENVELOPE_MEDIA_LINK))) return;
    record2(actionName);
    return;
  }
  if (actionName === IDENTITY_REQUESTED) {
    if (!(has3(state, VERA_RELATIVE) && has3(state, VERA_CURRENT_GUESTS))) return;
    record3(actionName);
    return;
  }

  if ([ENVELOPE_HANDWRITING, ENVELOPE_MEDIA_LINK, FIBRE_LAB, KIRILL_ENVELOPE].includes(actionName)) {
    record2(actionName);
    return;
  }
  if ([VERA_RELATIVE, VERA_CURRENT_GUESTS, DENIS_VERA, ARCHIVE_DEAD_END].includes(actionName)) record3(actionName);
}

export function installCausalEvidenceChain(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => {
    latestState = state;
    scheduleApply('causal-evidence:state');
  });

  document.addEventListener('click', handleAction);
  document.addEventListener('click', () => scheduleApply('causal-evidence:click'), true);
  window.addEventListener('pageshow', () => scheduleApply('causal-evidence:pageshow'));
  window.addEventListener('dbr:runtime-settled', () => scheduleApply('causal-evidence:runtime'));
  window.addEventListener('dbr:act2-updated', () => scheduleApply('causal-evidence:act2'));
  window.addEventListener('dbr:act3-updated', () => scheduleApply('causal-evidence:act3'));

  scheduleApply('causal-evidence:install');
}
