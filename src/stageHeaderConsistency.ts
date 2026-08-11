import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot,
  type RouteStage
} from './investigationState';

const STAGE_LABELS: Record<RouteStage, string> = {
  'act1-evidence': 'Акт I',
  'act1-report': 'Акт I',
  'act2-plan': 'Акт II',
  'act2-room': 'Акт II',
  'act3-archive': 'Акт III',
  'act3-identity': 'Акт III',
  'act3-interviews': 'Акт III',
  'act3-report': 'Акт III',
  'kirill-interrogation': 'Ключевой допрос',
  'act4-search': 'Акт IV',
  'act4-card': 'Акт IV',
  'act4-report': 'Акт IV',
  complete: 'Завершено'
};

let installed = false;
let latest: InvestigationSnapshot | null = null;

function applyStageHeader(state: InvestigationSnapshot): void {
  latest = state;

  const topbar = document.querySelector<HTMLElement>('.premium-topbar');
  if (!topbar) return;

  const stage = STAGE_LABELS[state.derived.stage];
  const caseMeta = topbar.querySelector<HTMLElement>('.topbar-case small');
  if (caseMeta) caseMeta.textContent = `Дело №001 · ${stage}`;

  const status = topbar.querySelector<HTMLElement>('.topbar-actions > .premium-pill');
  if (status) {
    const complete = state.derived.stage === 'complete';
    status.textContent = complete ? 'Расследование завершено' : 'Расследование идёт';
    status.classList.remove('secure', 'live', 'neutral', 'amber');
    status.classList.add(complete ? 'secure' : 'live');
  }

  topbar.dataset.routeStage = state.derived.stage;
}

function refreshAndApply(reason: string): void {
  applyStageHeader(refreshInvestigationState(reason));
}

export function installStageHeaderConsistency(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => applyStageHeader(state));

  ['dbr:act2-updated', 'dbr:act3-updated', 'dbr:interrogation-updated', 'dbr:act4-updated', 'dbr:runtime-settled']
    .forEach((name) => window.addEventListener(name, () => refreshAndApply(`stage-header:${name}`)));

  window.addEventListener('pageshow', () => refreshAndApply('stage-header:pageshow'));

  if (latest) applyStageHeader(latest);
}
