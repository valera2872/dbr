import { ACT2_STORAGE_KEY, ACT3_STORAGE_KEY } from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

export {};

type JsonState = Record<string, unknown>;
type CandidateId = 'marina' | 'denis' | 'vera' | 'kirill';

const DESK_SAMPLED = 'v2:desk-sampled';
const INJURY_SCAN = 'v2:injury-scan';
const CUT_OBSERVED = 'v2:kirill-cut-observed';
const COMPARE_PREFIX = 'v2:trace-compare-';
const TRACE_MATCH = 'v2:trace-kirill-match';

const CANDIDATES: Array<{ id: CandidateId; name: string; observation: string; comparison: string }> = [
  {
    id: 'marina',
    name: 'Марина Орлова',
    observation: 'Свежих порезов на кистях не видно. Рабочие перчатки чистые, повреждений кожи, подходящих к микроследу, нет.',
    comparison: 'Профиль контрольного образца Марины не совпадает с микроследом из 314.'
  },
  {
    id: 'denis',
    name: 'Денис Ракитин',
    observation: 'На пальцах есть старые сухие ссадины от фототехники, но свежей кровоточившей раны нет.',
    comparison: 'Профиль контрольного образца Дениса не совпадает с микроследом из 314.'
  },
  {
    id: 'vera',
    name: 'Вера Белова / Елена Ветрова',
    observation: 'Свежих повреждений кистей не обнаружено.',
    comparison: 'Профиль контрольного образца Веры не совпадает с микроследом из 314.'
  },
  {
    id: 'kirill',
    name: 'Кирилл Бессонов',
    observation: 'На правой кисти — свежий узкий порез под новым пластырем. Кирилл объясняет: «Зацепился за металлическую застёжку чемодана после заселения».',
    comparison: 'Срочная сравнительная экспертиза: ДНК-профиль микрокапли из затёртой зоны стола совпадает с контрольным образцом Кирилла. След находился внутри свежей влажной зоны протирания.'
  }
];

let latest: InvestigationSnapshot | null = null;
let scheduled = false;

function object(value: unknown): JsonState {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonState : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string'))) : [];
}

function read(key: string): JsonState {
  try { return object(JSON.parse(localStorage.getItem(key) ?? '{}')); }
  catch { return {}; }
}

function markers(): string[] {
  return strings(read(ACT3_STORAGE_KEY).questions);
}

function has(marker: string): boolean {
  return markers().includes(marker);
}

function addMarker(marker: string): void {
  const raw = read(ACT3_STORAGE_KEY);
  const current = strings(raw.questions);
  if (current.includes(marker)) return;
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify({ ...raw, questions: [...current, marker] }));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { actorProof: marker } }));
  refreshInvestigationState(`case001-v2-actor-proof:${marker}`);
  schedule('marker');
}

function act2Complete(): boolean {
  const raw = read(ACT2_STORAGE_KEY);
  const room = strings(raw.room);
  return ['panel', 'tracks', 'envelope', 'fibres'].every((id) => room.includes(id));
}

function plantKirillClue(): void {
  document.querySelectorAll<HTMLElement>('.premium-person-card').forEach((card) => {
    if (!card.textContent?.includes('Кирилл Бессонов')) return;
    if (card.querySelector('.case001-v2-kirill-clue')) return;
    const clue = document.createElement('small');
    clue.className = 'case001-v2-kirill-clue';
    clue.textContent = 'Наблюдение: свежий пластырь на правой кисти';
    card.append(clue);
  });

  const modal = document.querySelector<HTMLElement>('.character-modal-premium');
  if (!modal?.textContent?.includes('Кирилл Бессонов') || modal.querySelector('.case001-v2-kirill-modal-clue')) return;
  const anchor = modal.querySelector<HTMLElement>('.interview-name') ?? modal.querySelector<HTMLElement>('.premium-modal-header');
  if (!anchor) return;
  const clue = document.createElement('div');
  clue.className = 'case001-v2-kirill-modal-clue';
  clue.innerHTML = '<small>Наблюдение</small><strong>Свежий пластырь на правой кисти</strong><span>Кирилл говорит, что порезался о металлическую застёжку чемодана после заселения.</span>';
  anchor.insertAdjacentElement('afterend', clue);
}

function compared(id: CandidateId): boolean {
  return has(`${COMPARE_PREFIX}${id}`);
}

function candidateMarkup(candidate: (typeof CANDIDATES)[number]): string {
  const done = compared(candidate.id);
  const match = candidate.id === 'kirill' && has(TRACE_MATCH);
  return `<article class="case001-v2-comparison ${done ? 'done' : ''} ${match ? 'match' : ''}">
    <div><small>${candidate.name}</small><p>${candidate.observation}</p></div>
    ${done
      ? `<div class="case001-v2-comparison-result"><strong>${match ? 'СОВПАДЕНИЕ' : 'НЕ СОВПАДАЕТ'}</strong><span>${candidate.comparison}</span></div>`
      : `<button type="button" data-v2-compare="${candidate.id}">Сравнить микрослед <span>→</span></button>`}
  </article>`;
}

function renderPanel(state: InvestigationSnapshot): void {
  const existing = document.querySelector<HTMLElement>('.case001-v2-actor-proof');
  const active = state.core.phase === 'hq' && act2Complete() && has(DESK_SAMPLED);
  if (!active) {
    existing?.remove();
    return;
  }

  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  if (!dashboard) return;

  const scan = has(INJURY_SCAN);
  const matched = has(TRACE_MATCH);
  const signature = `${scan}:${matched}:${CANDIDATES.map((candidate) => compared(candidate.id)).join('-')}`;
  if (existing?.dataset.signature === signature) return;
  existing?.remove();

  const panel = document.createElement('section');
  panel.className = `case001-v2-actor-proof ${matched ? 'matched' : ''}`;
  panel.dataset.signature = signature;
  panel.innerHTML = `
    <header><div><p>Криминалистическая ветка · E001</p><h2>${matched ? 'Кирилл физически был в номере 314' : 'Чей микрослед остался в затёртой зоне?'}</h2></div><span>${matched ? 'Доказано' : 'Отдельная связь'}</span></header>
    ${matched
      ? `<div class="case001-v2-proof-result"><strong>Независимое доказательство присутствия</strong><p>Свежий биологический микрослед из зоны, которую пытались протереть после конфликта, совпадает с контрольным образцом Кирилла. Это опровергает его утверждение, что он вообще не входил в 314, но само по себе ещё не доказывает мотив и весь маршрут.</p><small>Теперь доказательства разделены: E006/E007 — возможность и использование сети; M3 — проверка альтернативного staff-доступа; микрослед — физическое присутствие Кирилла.</small></div>`
      : !scan
        ? `<div class="case001-v2-proof-premise"><p>Вы уже взяли микрослед из влажной затёртой зоны возле стола. До сравнения нужен фактический повод выбрать контрольные образцы. Осмотрите участников на свежие повреждения, которые могли оставить небольшую каплю крови.</p><button type="button" data-v2-injury-scan>Осмотреть участников на свежие повреждения →</button></div>`
        : `<div class="case001-v2-observation-note"><strong>Осмотр участников завершён</strong><p>Свежая рана обнаружена только у Кирилла, но это ещё не совпадение. Его объяснение про чемодан возможно. Сравнительная экспертиза должна проверить, относится ли кровь из 314 именно к нему.</p></div><div class="case001-v2-comparison-grid">${CANDIDATES.map(candidateMarkup).join('')}</div>`}
  `;

  const branch = dashboard.querySelector<HTMLElement>('.case001-v2-branch-panel');
  if (branch) branch.insertAdjacentElement('afterend', panel);
  else dashboard.prepend(panel);

  panel.querySelector('[data-v2-injury-scan]')?.addEventListener('click', () => {
    addMarker(INJURY_SCAN);
    addMarker(CUT_OBSERVED);
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-v2-compare]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.v2Compare as CandidateId | undefined;
      if (!id) return;
      addMarker(`${COMPARE_PREFIX}${id}`);
      if (id === 'kirill') addMarker(TRACE_MATCH);
    });
  });
}

function apply(state = latest ?? refreshInvestigationState('case001-v2-actor-proof:apply')): void {
  latest = state;
  plantKirillClue();
  renderPanel(state);
}

function schedule(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    apply(latest ?? refreshInvestigationState(`case001-v2-actor-proof:${reason}`));
  }));
}

subscribeInvestigationState((state) => {
  latest = state;
  schedule('state');
});
document.addEventListener('click', () => schedule('click'), true);
['dbr:runtime-settled', 'dbr:act2-updated', 'dbr:act3-updated', 'pageshow'].forEach((event) => window.addEventListener(event, () => schedule(event)));
schedule('init');
