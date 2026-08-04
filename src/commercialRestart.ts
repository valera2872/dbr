import { CASE_ID, CORE_STORAGE_KEY } from './build';
import { INTERNAL_MODE } from './internalMode';

export {};

const CASE_PREFIX = `dbr:${CASE_ID}`;
const GATE_SEEN_KEY = `dbr:${CASE_ID}:commercial:gate-seen`;

function clearCaseStorage(storage: Storage): void {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key?.startsWith(CASE_PREFIX)) storage.removeItem(key);
  }
}

function cleanStartedProgress() {
  return {
    phase: 'prologue',
    prologueIndex: 0,
    activeTab: 'case',
    seenEvidenceIds: [],
    flaggedEvidenceIds: [],
    inspectedHotspotIds: [],
    seenDialogueTopicIds: [],
    discoveredFactIds: [],
    selectedHypotheses: [],
    puzzleAnswers: {},
    checkpointAnswerId: null,
    act1Complete: false,
    startedAt: new Date().toISOString()
  };
}

function restartFromCommercialConfirmation(event: MouseEvent): void {
  if (INTERNAL_MODE) return;
  const target = event.target instanceof Element
    ? event.target.closest<HTMLButtonElement>('[data-confirm-restart]')
    : null;
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  try {
    clearCaseStorage(localStorage);
    clearCaseStorage(sessionStorage);
    localStorage.setItem(CORE_STORAGE_KEY, JSON.stringify(cleanStartedProgress()));
    sessionStorage.setItem(GATE_SEEN_KEY, '1');
  } catch {
    // The next page load still opens the clean commercial cover when storage is unavailable.
  }

  const url = new URL(window.location.href);
  ['fresh', 'newCase', 'actorStudio', 'diagnostics', 'qa', 'fixture', 'debug'].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  window.location.reload();
}

document.addEventListener('click', restartFromCommercialConfirmation, true);
