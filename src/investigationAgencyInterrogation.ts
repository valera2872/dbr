import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const PLAN_REQUESTED = 'agency:plan-requested';
let scheduled = false;

function leadActive(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.core.act1Complete
    && state.derived.planCount === 0
    && !state.act2.questions.includes(PLAN_REQUESTED);
}

function apply(state: InvestigationSnapshot): void {
  const active = leadActive(state);
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  if (!shell) return;

  const guide = shell.querySelector<HTMLElement>('.interrogation-guide');
  if (guide) {
    if (active) {
      guide.dataset.agencyHidden = '1';
      guide.style.display = 'none';
    } else if (guide.dataset.agencyHidden === '1') {
      guide.style.display = '';
      delete guide.dataset.agencyHidden;
    }
  }

  shell.querySelectorAll<HTMLButtonElement>('.interrogation-evidence').forEach((button) => {
    if (active && button.disabled) {
      button.dataset.agencyHidden = '1';
      button.hidden = true;
      button.style.display = 'none';
      return;
    }
    if (!active && button.dataset.agencyHidden === '1') {
      button.hidden = false;
      button.style.display = '';
      delete button.dataset.agencyHidden;
    }
  });

  const note = shell.querySelector<HTMLElement>('.interrogation-control-title small');
  if (active && note) {
    note.dataset.agencyOriginal = note.textContent ?? '';
    note.textContent = 'Предъявляйте только уже найденные материалы. Будущие доказательства здесь не раскрываются.';
  } else if (!active && note?.dataset.agencyOriginal) {
    note.textContent = note.dataset.agencyOriginal;
    delete note.dataset.agencyOriginal;
  }

  shell.dataset.investigationAgency = active ? 'lead' : 'off';
}

function schedule(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    apply(refreshInvestigationState(reason));
    window.requestAnimationFrame(() => apply(refreshInvestigationState(`${reason}:settled`)));
  });
}

subscribeInvestigationState((state) => window.requestAnimationFrame(() => apply(state)));
document.addEventListener('click', () => schedule('investigation-agency-interrogation:click'), true);
window.addEventListener('dbr:interrogation-updated', () => schedule('investigation-agency-interrogation:update'));
window.addEventListener('dbr:act2-updated', () => schedule('investigation-agency-interrogation:act2'));
