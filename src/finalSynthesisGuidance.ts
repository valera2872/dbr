import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

let scheduled = false;
let active = false;

function finalSynthesisActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq' && state.derived.cardCount >= 4 && !state.act4.complete;
}

function visibleTab(label: string): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'))
    .find((button) => button.textContent?.includes(label) && button.getClientRects().length > 0);
}

function routeToCase(): void {
  visibleTab('Дело')?.click();
  window.requestAnimationFrame(() => document.querySelector<HTMLElement>('.final-synthesis')?.scrollIntoView({ block: 'start' }));
}

function apply(state: InvestigationSnapshot): void {
  const guide = document.querySelector<HTMLElement>('.player-guide-floating');
  const shouldOwn = finalSynthesisActive(state);
  active = shouldOwn;
  if (!guide) return;

  const explain = guide.querySelector<HTMLButtonElement>('.player-guide-explain');
  const next = guide.querySelector<HTMLButtonElement>('.player-guide-next');

  if (!shouldOwn) {
    if (guide.dataset.finalSynthesisGuidance === '1') {
      delete guide.dataset.finalSynthesisGuidance;
      if (explain) explain.style.display = '';
      if (next) delete next.dataset.finalSynthesisRoute;
    }
    return;
  }

  guide.dataset.finalSynthesisGuidance = '1';
  const small = guide.querySelector<HTMLElement>('.player-guide-floating-copy > small');
  const strong = guide.querySelector<HTMLElement>('.player-guide-floating-copy > strong');
  const paragraph = guide.querySelector<HTMLElement>('.player-guide-floating-copy > p');
  const progress = guide.querySelector<HTMLElement>('.player-guide-floating-copy > span');

  if (small) small.textContent = 'Финальная реконструкция';
  if (strong) strong.textContent = 'Соберите собственную доказательную цепочку';
  if (paragraph) paragraph.textContent = 'Интерфейс ведёт только к рабочему экрану. Исполнителя, маршрут, мотив и подтверждающие пары материалов выбираете вы.';
  if (progress) progress.textContent = 'Готового финального ответа нет';
  if (next) {
    next.dataset.finalSynthesisRoute = 'case';
    next.disabled = false;
    next.setAttribute('aria-label', 'Открыть сборку обвинения');
    const label = next.querySelector<HTMLElement>('small');
    const title = next.querySelector<HTMLElement>('strong');
    const arrow = next.querySelector<HTMLElement>('b');
    if (label) label.textContent = 'Навигация';
    if (title) title.textContent = 'Открыть сборку обвинения';
    if (arrow) arrow.textContent = '→';
  }
  if (explain) explain.style.display = 'none';
}

function schedule(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    apply(refreshInvestigationState(reason));
  }));
}

function captureRoute(event: MouseEvent): void {
  const target = event.target as Element | null;
  const button = target?.closest<HTMLButtonElement>('.player-guide-next[data-final-synthesis-route="case"]');
  if (!button || !active) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  routeToCase();
  schedule('final-synthesis-guidance:route');
}

subscribeInvestigationState((state) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => apply(state))));
document.addEventListener('click', captureRoute, true);
window.addEventListener('dbr:act4-updated', () => { if (active) schedule('final-synthesis-guidance:act4'); });
window.addEventListener('dbr:runtime-settled', () => { if (active) schedule('final-synthesis-guidance:runtime'); });
window.addEventListener('pageshow', () => schedule('final-synthesis-guidance:pageshow'));

schedule('final-synthesis-guidance:install');
