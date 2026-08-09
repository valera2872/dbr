import { scheduleInvestigationRefresh } from './investigationState';

export {};

function syncAfterInteraction() {
  window.setTimeout(() => scheduleInvestigationRefresh('player-guidance-post-click'), 90);
  window.setTimeout(() => scheduleInvestigationRefresh('player-guidance-post-effect'), 240);
}

document.addEventListener('click', syncAfterInteraction, true);
window.addEventListener('pageshow', syncAfterInteraction);
