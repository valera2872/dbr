import { useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ACT3_STORAGE_KEY } from './build';
import { refreshInvestigationState } from './investigationState';
import './kirillActorProofV2.css';

type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

type ProofOption = {
  id: 'presence' | 'route' | 'assault' | 'history';
  text: string;
  feedback: string;
  correct?: boolean;
};

const DESK_SAMPLED = 'v2:desk-sampled';
const HAND_OBSERVED = 'actor:kirill-hand-observed';
const STR_MATCH = 'actor:kirill-str-match';
const PRESENCE_PROVEN = 'actor:kirill-presence-proven';
const VERA_CHECKPOINT = 'separate_lies';

const OPTIONS: ProofOption[] = [
  {
    id: 'presence',
    text: 'Микрослед крови Кирилла находится в свежей затёртой зоне стола 314: Кирилл физически контактировал с местом этой ночи.',
    feedback: 'Верно. Индивидуализированный след связывает Кирилла с номером 314 независимо от маршрута, мотива и его собственного рассказа.',
    correct: true
  },
  {
    id: 'route',
    text: 'Совпадение крови само по себе доказывает, что Кирилл вошёл именно через V314.',
    feedback: 'Нет. Биологический след устанавливает человека и место контакта, но не путь, которым он туда попал. Маршрут доказывается отдельно E006/E007.'
  },
  {
    id: 'assault',
    text: 'Совпадение крови само по себе полностью доказывает нападение Кирилла на Илью.',
    feedback: 'Слишком сильный вывод. След доказывает присутствие Кирилла у затёртой зоны; действие, маршрут и мотив должны сходиться с другими доказательствами.'
  },
  {
    id: 'history',
    text: 'След подтверждает, что Кирилл был ответственен за происшествие с Антоном в 2015 году.',
    feedback: 'Нет. Этот микрослед относится к номеру 314 нынешней ночью. Историческая ответственность устанавливается материалами B-17.'
  }
];

const EMPTY: Act3State = {
  archive: [],
  identity: [],
  questions: [],
  checkpointAnswer: null,
  complete: false
};

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let installed = false;
let scheduled = false;

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string')))
    : [];
}

function readState(): Act3State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT3_STORAGE_KEY) ?? '{}') as Partial<Act3State>;
    return {
      archive: strings(raw.archive),
      identity: strings(raw.identity),
      questions: strings(raw.questions),
      checkpointAnswer: typeof raw.checkpointAnswer === 'string' ? raw.checkpointAnswer : null,
      complete: raw.complete === true
    };
  } catch {
    return EMPTY;
  }
}

function unique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

function writeState(next: Act3State, reason: string): void {
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(next));
  refreshInvestigationState(`kirill-actor-proof-v2:${reason}`);
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', {
    detail: { source: 'kirill-actor-proof-v2', reason, complete: next.complete }
  }));
}

function addMarker(marker: string, reason: string): Act3State {
  const state = readState();
  if (state.questions.includes(marker)) return state;
  const next = { ...state, questions: unique(state.questions, marker) };
  writeState(next, reason);
  return next;
}

function observeHand(): void {
  addMarker(HAND_OBSERVED, 'hand-observed');
  schedulePatch();
}

function recordStrMatch(): Act3State {
  const state = readState();
  if (!state.questions.includes(DESK_SAMPLED) || !state.questions.includes(HAND_OBSERVED)) return state;
  return addMarker(STR_MATCH, 'str-match');
}

function provePresence(): Act3State {
  const state = readState();
  if (!state.questions.includes(STR_MATCH)) return state;
  const questions = unique(state.questions, PRESENCE_PROVEN);
  const next = {
    ...state,
    questions,
    complete: state.checkpointAnswer === VERA_CHECKPOINT ? true : state.complete
  };
  writeState(next, 'presence-proven');
  return next;
}

function enforceNewE009Gate(event: Event): void {
  const detail = event instanceof CustomEvent ? event.detail as { source?: string } | undefined : undefined;
  if (detail?.source !== 'e009-v2') return;

  const state = readState();
  if (!state.complete || state.checkpointAnswer !== VERA_CHECKPOINT || state.questions.includes(PRESENCE_PROVEN)) return;

  // Do not migrate or invalidate old completed saves on page load. This only catches a new E009
  // completion event in the current session and keeps Act III open until actor identity is proven.
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify({ ...state, complete: false }));
  refreshInvestigationState('kirill-actor-proof-v2:e009-proof-gate');
}

function findKirillCard(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>('.premium-person-card'))
    .find((card) => card.textContent?.includes('Кирилл Бессонов'));
}

function patchPersonCard(): void {
  const card = findKirillCard();
  if (!card) return;

  let clue = card.querySelector<HTMLElement>('.kirill-hand-card-clue');
  if (!clue) {
    clue = document.createElement('span');
    clue.className = 'kirill-hand-card-clue';
    card.append(clue);
  }
  clue.innerHTML = '<small>Наблюдение</small><strong>На правой кисти узкий свежий пластырь</strong>';
}

function patchInterrogation(): void {
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  if (!shell) return;

  const state = readState();
  const observed = state.questions.includes(HAND_OBSERVED);
  const questions = shell.querySelector<HTMLElement>('.interrogation-questions');
  if (questions) {
    let observation = questions.querySelector<HTMLElement>('.kirill-hand-observation');
    if (!observation) {
      observation = document.createElement('section');
      observation.className = 'kirill-hand-observation';
      questions.querySelector('p')?.after(observation);
    }
    observation.innerHTML = observed
      ? '<small>ЗАФИКСИРОВАННОЕ НАБЛЮДЕНИЕ</small><strong>Свежий порез правой кисти</strong><p>Кирилл: «Зацепил кисть о металлическую кромку чемодана, когда искал зарядку. Порез мелкий, обработал сам».</p>'
      : '<small>ВИЗУАЛЬНОЕ НАБЛЮДЕНИЕ</small><strong>На правой кисти свежий узкий пластырь.</strong><p>Это пока только видимый факт. Его значение не установлено.</p><button type="button" data-kirill-proof-action="observe-hand">Уточнить повреждение</button>';
  }

  if (!state.complete) {
    const contradiction = shell.querySelector<HTMLElement>('.interrogation-contradiction');
    const conclusions = contradiction?.querySelectorAll<HTMLButtonElement>('[data-conclusion]');
    conclusions?.forEach((button) => {
      button.disabled = true;
      button.dataset.actorProofBlocked = '1';
    });
    if (conclusions?.length && contradiction && !contradiction.querySelector('.kirill-actor-proof-gate')) {
      const note = document.createElement('div');
      note.className = 'kirill-actor-proof-gate';
      note.innerHTML = '<strong>Вывод пока не фиксируется</strong><span>Маршрут имеет несколько точек доступа. Сначала завершите независимую проверку того, кто физически был в 314.</span>';
      contradiction.append(note);
    }
  }
}

function findActorBranch(): HTMLElement | undefined {
  const panel = document.querySelector<HTMLElement>('.case001-v2-branch-panel');
  if (!panel) return undefined;
  return Array.from(panel.querySelectorAll<HTMLElement>('.case001-v2-branch-card')).find((card) => {
    const text = card.textContent ?? '';
    return text.includes('Кто физически был в 314?')
      || text.includes('Микрослед со стола сохранён для сравнения')
      || card.dataset.kirillActorProof === '1';
  });
}

function setBranchAction(card: HTMLElement, action: 'people' | 'compare' | null, label = ''): void {
  card.querySelectorAll('[data-case001-v2-action], .case001-v2-branch-done, [data-kirill-proof-action]').forEach((node) => node.remove());
  if (!action) {
    const done = document.createElement('span');
    done.className = 'case001-v2-branch-done';
    done.textContent = '✓';
    card.append(done);
    return;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.kirillProofAction = action;
  button.innerHTML = `${label}<span>→</span>`;
  card.append(button);
}

function patchActorBranch(): void {
  const card = findActorBranch();
  if (!card) return;

  const state = readState();
  const sampled = state.questions.includes(DESK_SAMPLED);
  if (!sampled) return;

  const observed = state.questions.includes(HAND_OBSERVED);
  const matched = state.questions.includes(STR_MATCH);
  const proven = state.questions.includes(PRESENCE_PROVEN);
  card.dataset.kirillActorProof = '1';

  const status = card.querySelector<HTMLElement>('.case001-v2-branch-copy small');
  const title = card.querySelector<HTMLElement>('.case001-v2-branch-copy h3');
  const body = card.querySelector<HTMLElement>('.case001-v2-branch-copy p');

  if (proven) {
    card.classList.remove('progress');
    card.classList.add('done');
    if (status) status.textContent = 'Установлено';
    if (title) title.textContent = 'Кирилл физически связан с затёртой зоной 314';
    if (body) body.textContent = 'STR-профиль микроследа совпал с контрольным образцом Кирилла. Это доказывает его физический контакт со свежей затёртой зоной у стола — независимо от версии маршрута.';
    setBranchAction(card, null);
    return;
  }

  card.classList.remove('done');
  card.classList.add('progress');
  if (status) status.textContent = 'В работе';

  if (!observed) {
    if (title) title.textContent = 'Микрослед сохранён. Нужен источник для сравнения';
    if (body) body.textContent = 'Биологический микрослед сам по себе не называет человека. Осмотрите участников и ищите независимое основание для сравнительного образца.';
    setBranchAction(card, 'people', 'Проверить участников на свежие повреждения');
    return;
  }

  if (title) title.textContent = matched ? 'Лабораторное совпадение получено' : 'Есть основание для сравнительного анализа';
  if (body) body.textContent = matched
    ? 'Профиль микроследа совпал с контрольным образцом Кирилла. Осталось сформулировать только тот вывод, который действительно следует из сравнения.'
    : 'У Кирилла зафиксирован свежий порез правой кисти и есть сохранённый микрослед из 314. Теперь сравнительный анализ имеет конкретное следственное основание.';
  setBranchAction(card, 'compare', matched ? 'Сформулировать доказанный вывод' : 'Сопоставить микрослед с образцом Кирилла');
}

function patchBranchCount(): void {
  const state = readState();
  if (!state.questions.includes(DESK_SAMPLED) || state.questions.includes(PRESENCE_PROVEN)) return;
  const panel = document.querySelector<HTMLElement>('.case001-v2-branch-panel');
  const counter = panel?.querySelector<HTMLElement>('.case001-v2-branch-head > strong');
  if (!counter) return;
  const match = counter.textContent?.match(/^(\d+)\/4$/);
  if (!match) return;
  const current = Number(match[1]);
  counter.textContent = `${Math.max(0, current - 1)}/4`;
}

function clickTab(label: string): void {
  const target = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'))
    .find((button) => button.textContent?.includes(label) && button.getClientRects().length > 0);
  target?.click();
}

function ensureRoot(): Root {
  if (!host) {
    host = document.createElement('div');
    host.id = 'dbr-kirill-actor-proof-v2-root';
    document.body.append(host);
  }
  if (!root) root = createRoot(host);
  return root;
}

function closeProof(): void {
  root?.render(<></>);
}

function ActorProofModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<Act3State>(() => readState());
  const [selected, setSelected] = useState<ProofOption | null>(null);
  const sampled = state.questions.includes(DESK_SAMPLED);
  const observed = state.questions.includes(HAND_OBSERVED);
  const matched = state.questions.includes(STR_MATCH);
  const proven = state.questions.includes(PRESENCE_PROVEN);

  const runComparison = () => {
    if (!sampled || !observed || matched) return;
    const next = recordStrMatch();
    setState(next);
  };

  const choose = (option: ProofOption) => {
    if (!matched || proven) return;
    setSelected(option);
    if (!option.correct) return;
    const next = provePresence();
    setState(next);
  };

  return <div className="premium-modal-backdrop react-case-modal-backdrop kirill-actor-proof-backdrop" onMouseDown={onClose}>
    <section className="premium-modal react-case-modal kirill-actor-proof-modal" data-kirill-actor-proof-v2="1" onMouseDown={(event) => event.stopPropagation()}>
      <header className="premium-modal-header">
        <div><p className="premium-kicker">ИНДИВИДУАЛИЗАЦИЯ СЛЕДА · 314</p><h1>Кто оставил микрослед у стола?</h1><p>Сопоставьте сохранённый след E001 только после появления независимого основания для контрольного образца. Совпадение человека, места и действия — разные выводы.</p></div>
        <button className="premium-icon-button close" onClick={onClose} aria-label="Закрыть">×</button>
      </header>

      <div className="premium-modal-body kirill-actor-proof-layout">
        <section className="kirill-actor-proof-sources">
          <article>
            <div className="kirill-actor-proof-code">E001 / BIO</div>
            <small>НОМЕР 314 · ПИСЬМЕННЫЙ СТОЛ</small>
            <h2>Микрослед из затёртой зоны</h2>
            <p>Отобран у нижнего края ещё заметной влажной протирки рядом со свежей царапиной. Видимый след был почти удалён; владельца микроследа первичный осмотр не устанавливал.</p>
            <strong>{sampled ? '✓ Образец сохранён' : 'Образец ещё не отобран'}</strong>
          </article>
          <article>
            <div className="kirill-actor-proof-code">K-REF</div>
            <small>КИРИЛЛ БЕССОНОВ · ПРАВАЯ КИСТЬ</small>
            <h2>Свежий поверхностный порез</h2>
            <p>{observed ? 'Повреждение зафиксировано при личном осмотре. Кирилл объясняет его металлической кромкой чемодана и говорит, что обработал порез самостоятельно.' : 'Контрольный источник ещё не обоснован наблюдением.'}</p>
            <strong>{observed ? '✓ Есть основание запросить контрольный образец' : 'Сначала зафиксируйте наблюдение'}</strong>
          </article>
        </section>

        <section className={`kirill-actor-proof-lab ${matched ? 'done' : ''}`}>
          <header><small>СРАВНИТЕЛЬНОЕ ИССЛЕДОВАНИЕ</small><h2>STR-профиль биологического микроследа</h2></header>
          {!matched ? <>
            <div className="kirill-actor-proof-pending"><span>∿</span><p>Лаборатория не получает «подозреваемого по сюжету». Сравнение возможно только потому, что у следствия уже есть конкретный микрослед и отдельно замеченное свежее повреждение.</p></div>
            <button className="premium-cta compact" disabled={!sampled || !observed} onClick={runComparison}>Запросить контрольный образец и STR-анализ →</button>
          </> : <div className="kirill-actor-proof-result">
            <div><span>314-DESK-µ01</span><b>STR PROFILE</b><strong>MATCH</strong></div>
            <p>По исследованным STR-локусам профиль микроследа совпадает с контрольным образцом Кирилла Бессонова. Постороннего второго профиля в этом микроследе не выделено.</p>
            <small>Предел результата: лаборатория устанавливает источник биологического материала. Она не устанавливает маршрут проникновения и не формулирует обвинение.</small>
          </div>}
        </section>

        {matched && <section className="kirill-actor-proof-conclusion">
          <p className="premium-kicker">ДОКАЗАТЕЛЬНЫЙ ВЫВОД</p>
          <h2>Что именно теперь доказано?</h2>
          {OPTIONS.map((option) => <button key={option.id} disabled={proven} className={selected?.id === option.id ? option.correct ? 'correct' : 'wrong' : ''} onClick={() => choose(option)}>
            <span>{selected?.id === option.id ? option.correct ? '✓' : '×' : '○'}</span><strong>{option.text}</strong>
          </button>)}
          {selected && <p className={`kirill-actor-proof-feedback ${selected.correct ? 'success' : 'warning'}`}>{selected.feedback}</p>}
          {proven && <div className="kirill-actor-proof-locked"><span>✓</span><div><strong>Физическое присутствие индивидуализировано</strong><p>Теперь маршрут E006/E007 остаётся способом, M3 — альтернативным доступом, а микрослед отдельно связывает Кирилла с 314.</p></div></div>}
        </section>}
      </div>

      <footer className="premium-modal-footer"><span>{proven ? 'Actor proof сохранён в каноническом Act III state.' : 'Не делайте из одного совпадения выводов, которые оно не доказывает.'}</span><button className="premium-cta compact" onClick={onClose}>Вернуться к расследованию <span>→</span></button></footer>
    </section>
  </div>;
}

function openProof(): void {
  const state = readState();
  if (!state.questions.includes(DESK_SAMPLED) || !state.questions.includes(HAND_OBSERVED)) return;
  ensureRoot().render(<ActorProofModal onClose={closeProof} />);
}

function handleClick(event: MouseEvent): void {
  const target = event.target as Element | null;
  const actionButton = target?.closest<HTMLElement>('[data-kirill-proof-action]');
  const action = actionButton?.dataset.kirillProofAction;
  if (action === 'observe-hand') {
    event.preventDefault();
    event.stopPropagation();
    observeHand();
    return;
  }
  if (action === 'people') {
    event.preventDefault();
    event.stopPropagation();
    clickTab('Люди');
    return;
  }
  if (action === 'compare') {
    event.preventDefault();
    event.stopPropagation();
    openProof();
    return;
  }

  const conclusion = target?.closest<HTMLElement>('.interrogation-shell [data-conclusion]');
  if (conclusion && !readState().complete) {
    event.preventDefault();
    event.stopImmediatePropagation();
    schedulePatch();
  }
}

function patch(): void {
  scheduled = false;
  patchPersonCard();
  patchInterrogation();
  patchActorBranch();
  patchBranchCount();
  document.documentElement.dataset.kirillActorProof = readState().questions.includes(PRESENCE_PROVEN) ? 'proven' : 'open';
}

function schedulePatch(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(patch));
}

export function installKirillActorProofV2(): void {
  if (installed) return;
  installed = true;
  ensureRoot();

  window.addEventListener('click', handleClick, true);
  window.addEventListener('click', schedulePatch, true);
  window.addEventListener('dbr:act3-updated', (event) => {
    enforceNewE009Gate(event);
    schedulePatch();
  });
  window.addEventListener('dbr:act2-updated', schedulePatch);
  window.addEventListener('dbr:interrogation-updated', schedulePatch);
  window.addEventListener('dbr:runtime-settled', schedulePatch);
  window.addEventListener('pageshow', schedulePatch);
  schedulePatch();
}
