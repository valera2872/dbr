import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY,
  CORE_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY,
  STATE_DIAGNOSTICS_KEY,
  STATE_SCHEMA_KEY,
  STATE_SCHEMA_VERSION
} from './build';

export type CoreProgress = {
  phase: 'home' | 'prologue' | 'hq';
  prologueIndex: number;
  activeTab: string;
  seenEvidenceIds: string[];
  flaggedEvidenceIds: string[];
  inspectedHotspotIds: string[];
  seenDialogueTopicIds: string[];
  discoveredFactIds: string[];
  selectedHypotheses: string[];
  puzzleAnswers: Record<string, string>;
  checkpointAnswerId: string | null;
  act1Complete: boolean;
  startedAt: string | null;
};

export type Act2Progress = {
  plan: string[];
  room: string[];
  questions: string[];
};

export type Act3Progress = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

export type InterrogationProgress = {
  stage: 'calm' | 'guarded' | 'cornered' | 'broken';
  asked: string[];
  presented: string[];
  transcript: unknown[];
  wrongConclusions: string[];
  complete: boolean;
};

export type Act4Progress = {
  search: string[];
  card: string[];
  finalAnswer: string | null;
  wrongAnswers: string[];
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
};

export type RouteStage =
  | 'act1-evidence'
  | 'act1-report'
  | 'act2-plan'
  | 'act2-room'
  | 'act3-archive'
  | 'act3-identity'
  | 'act3-interviews'
  | 'act3-report'
  | 'kirill-interrogation'
  | 'act4-search'
  | 'act4-card'
  | 'act4-report'
  | 'complete';

export type StateHealthIssue = {
  code: string;
  message: string;
  severity: 'warning' | 'error';
};

export type InvestigationSnapshot = {
  schema: number;
  core: CoreProgress;
  act2: Act2Progress;
  act3: Act3Progress;
  interrogation: InterrogationProgress;
  act4: Act4Progress;
  derived: {
    coreEvidenceCount: number;
    planCount: number;
    roomCount: number;
    archiveCount: number;
    identityCount: number;
    act3QuestionCount: number;
    interrogationComplete: boolean;
    searchCount: number;
    cardCount: number;
    act1Complete: boolean;
    act2Complete: boolean;
    act3Complete: boolean;
    act4Complete: boolean;
    percent: number;
    stage: RouteStage;
    issues: StateHealthIssue[];
  };
};

type Listener = (snapshot: InvestigationSnapshot, reason: string) => void;

type StorageSection = 'core' | 'act2' | 'act3' | 'interrogation' | 'act4';

const CORE_EVIDENCE_IDS = ['E001', 'E002', 'E003', 'E004', 'E005'];
const PLAN_IDS = ['wall', 'stamp', 'width'];
const ROOM_IDS = ['panel', 'tracks', 'envelope', 'fibres'];
const ARCHIVE_IDS = ['catalog', 'contact', 'audio', 'custody'];
const IDENTITY_IDS = ['registration', 'festival', 'message'];
const ACT3_QUESTION_IDS = ['d-original', 'v-name'];
const SEARCH_IDS = ['entry', 'ilya', 'medical', 'lamp'];
const CARD_IDS = ['serial', 'copy', 'clip', 'integrity'];

const SECTION_KEYS: Record<StorageSection, string> = {
  core: CORE_STORAGE_KEY,
  act2: ACT2_STORAGE_KEY,
  act3: ACT3_STORAGE_KEY,
  interrogation: INTERROGATION_STORAGE_KEY,
  act4: ACT4_STORAGE_KEY
};

const listeners = new Set<Listener>();
let scheduled = false;
let cached: InvestigationSnapshot;
let cachedSignature = '';

function array(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string')));
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readRaw(key: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? object(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function coreProgress(raw = readRaw(CORE_STORAGE_KEY)): CoreProgress {
  const phase = raw.phase === 'prologue' || raw.phase === 'hq' ? raw.phase : 'home';
  return {
    phase,
    prologueIndex: Number.isFinite(raw.prologueIndex) ? Math.max(0, Number(raw.prologueIndex)) : 0,
    activeTab: typeof raw.activeTab === 'string' ? raw.activeTab : 'case',
    seenEvidenceIds: array(raw.seenEvidenceIds),
    flaggedEvidenceIds: array(raw.flaggedEvidenceIds),
    inspectedHotspotIds: array(raw.inspectedHotspotIds),
    seenDialogueTopicIds: array(raw.seenDialogueTopicIds),
    discoveredFactIds: array(raw.discoveredFactIds),
    selectedHypotheses: array(raw.selectedHypotheses),
    puzzleAnswers: object(raw.puzzleAnswers) as Record<string, string>,
    checkpointAnswerId: stringOrNull(raw.checkpointAnswerId),
    act1Complete: raw.act1Complete === true,
    startedAt: stringOrNull(raw.startedAt)
  };
}

function act2Progress(raw = readRaw(ACT2_STORAGE_KEY)): Act2Progress {
  return { plan: array(raw.plan), room: array(raw.room), questions: array(raw.questions) };
}

function act3Progress(raw = readRaw(ACT3_STORAGE_KEY)): Act3Progress {
  return {
    archive: array(raw.archive),
    identity: array(raw.identity),
    questions: array(raw.questions),
    checkpointAnswer: stringOrNull(raw.checkpointAnswer),
    complete: raw.complete === true
  };
}

function interrogationProgress(raw = readRaw(INTERROGATION_STORAGE_KEY)): InterrogationProgress {
  const stage = raw.stage === 'guarded' || raw.stage === 'cornered' || raw.stage === 'broken'
    ? raw.stage
    : 'calm';
  return {
    stage,
    asked: array(raw.asked),
    presented: array(raw.presented),
    transcript: Array.isArray(raw.transcript) ? raw.transcript : [],
    wrongConclusions: array(raw.wrongConclusions),
    complete: raw.complete === true
  };
}

function act4Progress(raw = readRaw(ACT4_STORAGE_KEY)): Act4Progress {
  return {
    search: array(raw.search),
    card: array(raw.card),
    finalAnswer: stringOrNull(raw.finalAnswer),
    wrongAnswers: array(raw.wrongAnswers),
    complete: raw.complete === true,
    startedAt: stringOrNull(raw.startedAt),
    completedAt: stringOrNull(raw.completedAt)
  };
}

function count(values: string[], required: string[]): number {
  return required.filter((id) => values.includes(id)).length;
}

function derive(
  core: CoreProgress,
  act2: Act2Progress,
  act3: Act3Progress,
  interrogation: InterrogationProgress,
  act4: Act4Progress
): InvestigationSnapshot['derived'] {
  const coreEvidenceCount = count(core.seenEvidenceIds, CORE_EVIDENCE_IDS);
  const planCount = count(act2.plan, PLAN_IDS);
  const roomCount = count(act2.room, ROOM_IDS);
  const archiveCount = count(act3.archive, ARCHIVE_IDS);
  const identityCount = count(act3.identity, IDENTITY_IDS);
  const act3QuestionCount = count(act3.questions, ACT3_QUESTION_IDS);
  const searchCount = count(act4.search, SEARCH_IDS);
  const cardCount = count(act4.card, CARD_IDS);

  const act1Complete = core.act1Complete === true;
  const act2Complete = roomCount === ROOM_IDS.length;
  const act3Complete = act3.complete === true;
  const interrogationComplete = interrogation.complete === true;
  const act4Complete = act4.complete === true;

  let stage: RouteStage = 'act1-evidence';
  if (coreEvidenceCount === CORE_EVIDENCE_IDS.length) stage = 'act1-report';
  if (act1Complete) stage = 'act2-plan';
  if (planCount === PLAN_IDS.length) stage = 'act2-room';
  if (act2Complete) stage = 'act3-archive';
  if (archiveCount === ARCHIVE_IDS.length) stage = 'act3-identity';
  if (identityCount === IDENTITY_IDS.length) stage = 'act3-interviews';
  if (act3QuestionCount === ACT3_QUESTION_IDS.length) stage = 'act3-report';
  if (act3Complete) stage = 'kirill-interrogation';
  if (interrogationComplete) stage = 'act4-search';
  if (searchCount === SEARCH_IDS.length) stage = 'act4-card';
  if (cardCount === CARD_IDS.length) stage = 'act4-report';
  if (act4Complete) stage = 'complete';

  const completedUnits = coreEvidenceCount
    + Number(act1Complete)
    + planCount
    + roomCount
    + archiveCount
    + identityCount
    + act3QuestionCount
    + Number(act3Complete)
    + Number(interrogationComplete)
    + searchCount
    + cardCount
    + Number(act4Complete);
  const totalUnits = 5 + 1 + 3 + 4 + 4 + 3 + 2 + 1 + 1 + 4 + 4 + 1;
  const percent = Math.max(0, Math.min(100, Math.round((completedUnits / totalUnits) * 100)));

  const issues: StateHealthIssue[] = [];
  if (act1Complete && coreEvidenceCount < CORE_EVIDENCE_IDS.length) {
    issues.push({ code: 'ACT1_WITHOUT_EVIDENCE', message: 'Акт I отмечен завершённым, но не все E001–E005 изучены.', severity: 'warning' });
  }
  if (act3Complete && (!act2Complete || archiveCount < 4 || identityCount < 3)) {
    issues.push({ code: 'ACT3_PREREQUISITES', message: 'Акт III завершён при неполных материалах предыдущих этапов.', severity: 'warning' });
  }
  if (interrogationComplete && !act3Complete) {
    issues.push({ code: 'INTERROGATION_PREREQUISITES', message: 'Допрос Кирилла завершён до промежуточного отчёта №2.', severity: 'error' });
  }
  if ((searchCount > 0 || cardCount > 0 || act4Complete) && !interrogationComplete) {
    issues.push({ code: 'ACT4_PREREQUISITES', message: 'Финальная операция содержит прогресс без доказанного противоречия Кирилла.', severity: 'error' });
  }
  if (act4Complete && (searchCount < 4 || cardCount < 4)) {
    issues.push({ code: 'ACT4_INCOMPLETE_EVIDENCE', message: 'Дело закрыто без полного изучения E010 и E011.', severity: 'error' });
  }

  return {
    coreEvidenceCount,
    planCount,
    roomCount,
    archiveCount,
    identityCount,
    act3QuestionCount,
    interrogationComplete,
    searchCount,
    cardCount,
    act1Complete,
    act2Complete,
    act3Complete,
    act4Complete,
    percent,
    stage,
    issues
  };
}

function createSnapshot(): InvestigationSnapshot {
  const core = coreProgress();
  const act2 = act2Progress();
  const act3 = act3Progress();
  const interrogation = interrogationProgress();
  const act4 = act4Progress();
  return {
    schema: STATE_SCHEMA_VERSION,
    core,
    act2,
    act3,
    interrogation,
    act4,
    derived: derive(core, act2, act3, interrogation, act4)
  };
}

function signature(snapshot: InvestigationSnapshot): string {
  return JSON.stringify(snapshot);
}

function writeDiagnostics(snapshot: InvestigationSnapshot): void {
  try {
    localStorage.setItem(STATE_SCHEMA_KEY, String(STATE_SCHEMA_VERSION));
    localStorage.setItem(STATE_DIAGNOSTICS_KEY, JSON.stringify({
      schema: STATE_SCHEMA_VERSION,
      stage: snapshot.derived.stage,
      percent: snapshot.derived.percent,
      issues: snapshot.derived.issues,
      updatedAt: new Date().toISOString()
    }));
  } catch {
    // Storage can be unavailable in privacy mode. The game remains playable.
  }
}

export function getInvestigationState(): InvestigationSnapshot {
  return cached;
}

export function refreshInvestigationState(reason = 'manual'): InvestigationSnapshot {
  const next = createSnapshot();
  const nextSignature = signature(next);
  if (nextSignature === cachedSignature) return cached;

  cached = next;
  cachedSignature = nextSignature;
  writeDiagnostics(next);
  listeners.forEach((listener) => listener(next, reason));
  window.dispatchEvent(new CustomEvent('dbr:state-changed', { detail: { reason, snapshot: next } }));
  return next;
}

export function scheduleInvestigationRefresh(reason = 'scheduled'): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    refreshInvestigationState(reason);
  });
}

export function subscribeInvestigationState(listener: Listener): () => void {
  listeners.add(listener);
  listener(cached, 'subscribe');
  return () => listeners.delete(listener);
}

export function writeInvestigationSection<T extends StorageSection>(
  section: T,
  value: T extends 'core' ? CoreProgress
    : T extends 'act2' ? Act2Progress
      : T extends 'act3' ? Act3Progress
        : T extends 'interrogation' ? InterrogationProgress
          : Act4Progress,
  reason = `write:${section}`
): void {
  localStorage.setItem(SECTION_KEYS[section], JSON.stringify(value));
  refreshInvestigationState(reason);
}

export function exportInvestigationState(): string {
  return JSON.stringify({
    build: document.querySelector('.premium-build-marker')?.textContent ?? 'unknown',
    exportedAt: new Date().toISOString(),
    snapshot: cached
  }, null, 2);
}

cached = createSnapshot();
cachedSignature = signature(cached);
writeDiagnostics(cached);

window.addEventListener('storage', () => scheduleInvestigationRefresh('storage'));
window.addEventListener('dbr:runtime-settled', () => scheduleInvestigationRefresh('runtime'));
window.addEventListener('dbr:interrogation-updated', () => scheduleInvestigationRefresh('interrogation'));
window.addEventListener('dbr:act4-updated', () => scheduleInvestigationRefresh('act4'));
window.addEventListener('pageshow', () => scheduleInvestigationRefresh('pageshow'));

document.documentElement.dataset.dbrStateSchema = String(STATE_SCHEMA_VERSION);
