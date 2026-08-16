import { subscribeInvestigationState } from './investigationState';

let scheduled = false;

function apply(): void {
  scheduled = false;
  const button = document.querySelector<HTMLButtonElement>('.player-guide-next');
  if (!button) return;

  if (button.dataset.evidenceLedRoute === 'case') {
    if (button.dataset.agencyOriginalAria === undefined) {
      button.dataset.agencyOriginalAria = button.getAttribute('aria-label') ?? '';
    }
    button.setAttribute('aria-label', 'Открыть рабочую панель');
    return;
  }

  if (button.dataset.agencyOriginalAria !== undefined) {
    const original = button.dataset.agencyOriginalAria;
    if (original) button.setAttribute('aria-label', original);
    else button.removeAttribute('aria-label');
    delete button.dataset.agencyOriginalAria;
  }
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
}

subscribeInvestigationState(schedule);
document.addEventListener('click', schedule, true);
window.addEventListener('dbr:act2-updated', schedule);
window.addEventListener('dbr:act3-updated', schedule);
window.addEventListener('dbr:runtime-settled', schedule);
window.addEventListener('pageshow', schedule);

schedule();
