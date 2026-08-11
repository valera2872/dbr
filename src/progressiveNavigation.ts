import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const GUIDED_FIRST_RUN_KEY = 'dbr:player-guidance:guided-first-run:v1';
let installed = false;
let latestState: InvestigationSnapshot | null = null;

function visibleLabels(state: InvestigationSnapshot): Set<string> {
  if (state.derived.act1Complete || localStorage.getItem(GUIDED_FIRST_RUN_KEY) !== '1') {
    return new Set(['Дело', 'Материалы', 'Люди', 'Версии', 'Хронология']);
  }

  const labels = new Set(['Дело', 'Материалы']);

  if (state.derived.coreEvidenceCount >= 2) labels.add('Люди');
  if (state.core.puzzleAnswers.E004 === '23:50') labels.add('Хронология');
  if (state.derived.coreEvidenceCount >= 5) labels.add('Версии');

  return labels;
}

function applyNavigation(state: InvestigationSnapshot): void {
  latestState = state;

  if (state.derived.act1Complete && localStorage.getItem(GUIDED_FIRST_RUN_KEY) === '1') {
    localStorage.removeItem(GUIDED_FIRST_RUN_KEY);
  }

  const labels = visibleLabels(state);
  const guided = localStorage.getItem(GUIDED_FIRST_RUN_KEY) === '1' && !state.derived.act1Complete;
  document.documentElement.dataset.dbrProgressiveHq = guided ? '1' : '0';

  document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button').forEach((button) => {
    const label = button.querySelector('span')?.textContent?.trim() ?? '';
    const visible = labels.has(label);
    button.hidden = !visible;
    button.style.display = visible ? '' : 'none';
    button.dataset.progressiveVisible = visible ? '1' : '0';
  });
}

function scheduleApply(reason = 'progressive-navigation'): void {
  window.requestAnimationFrame(() => {
    const state = refreshInvestigationState(reason);
    applyNavigation(state);
    window.requestAnimationFrame(() => applyNavigation(state));
  });
}

function handleFirstRunChoice(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest('button') : null;
  if (!(target instanceof HTMLButtonElement)) return;
  if (!target.closest('.player-onboarding')) return;

  if (target.classList.contains('player-guide-primary')) {
    localStorage.setItem(GUIDED_FIRST_RUN_KEY, '1');
    scheduleApply('progressive-navigation:start');
  }

  if (target.classList.contains('player-guide-secondary')) {
    localStorage.removeItem(GUIDED_FIRST_RUN_KEY);
    scheduleApply('progressive-navigation:skip');
  }
}

export function installProgressiveNavigation(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => {
    latestState = state;
    window.requestAnimationFrame(() => applyNavigation(state));
  });

  document.addEventListener('click', handleFirstRunChoice, true);
  document.addEventListener('click', () => scheduleApply(), true);
  window.addEventListener('pageshow', () => scheduleApply('progressive-navigation:pageshow'));

  if (latestState) applyNavigation(latestState);
}
