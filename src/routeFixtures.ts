import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY,
  CASE_ID,
  CORE_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';

export {};

const params = new URLSearchParams(window.location.search);
const fixture = params.get('fixture');
const qaEnabled = params.get('qa') === '1';

const now = '2026-08-03T20:00:00.000Z';

function clearCase(): void {
  const prefix = `dbr:${CASE_ID}`;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedCore(complete: boolean): void {
  write(CORE_STORAGE_KEY, {
    phase: 'hq',
    prologueIndex: 3,
    activeTab: 'case',
    seenEvidenceIds: complete ? ['E001', 'E002', 'E003', 'E004', 'E005'] : [],
    flaggedEvidenceIds: [],
    inspectedHotspotIds: complete ? ['window', 'desk', 'bag', 'carpet'] : [],
    seenDialogueTopicIds: [],
    discoveredFactIds: complete ? ['F001', 'F002', 'F003', 'F004', 'F005'] : [],
    selectedHypotheses: [],
    puzzleAnswers: {},
    checkpointAnswerId: complete ? 'hidden-route' : null,
    act1Complete: complete,
    startedAt: now
  });
}

function seedAct2(complete: boolean): void {
  write(ACT2_STORAGE_KEY, {
    plan: complete ? ['wall', 'stamp', 'width'] : [],
    room: complete ? ['panel', 'tracks', 'envelope', 'fibres'] : [],
    questions: complete ? ['kirill-plan', 'marina-312'] : []
  });
}

function seedAct3(complete: boolean): void {
  write(ACT3_STORAGE_KEY, {
    archive: complete ? ['catalog', 'contact', 'audio', 'custody'] : [],
    identity: complete ? ['registration', 'festival', 'message'] : [],
    questions: complete ? ['d-original', 'd-card', 'v-name', 'v-card'] : [],
    checkpointAnswer: complete ? 'separate_lies' : null,
    complete
  });
}

function seedInterrogation(complete: boolean): void {
  write(INTERROGATION_STORAGE_KEY, {
    stage: complete ? 'broken' : 'calm',
    asked: complete ? ['alibi', 'passage', 'anton'] : [],
    presented: complete ? ['plan', 'panel', 'tracks', 'audio', 'card'] : [],
    transcript: [],
    wrongConclusions: [],
    complete
  });
}

function seedAct4(mode: 'empty' | 'search' | 'card' | 'complete'): void {
  const search = mode === 'empty' ? [] : ['entry', 'ilya', 'medical', 'lamp'];
  const card = mode === 'card' || mode === 'complete' ? ['serial', 'copy', 'clip', 'integrity'] : [];
  write(ACT4_STORAGE_KEY, {
    search,
    card,
    finalAnswer: mode === 'complete' ? 'kirill_responsibility' : null,
    wrongAnswers: [],
    complete: mode === 'complete',
    startedAt: mode === 'empty' ? null : now,
    completedAt: mode === 'complete' ? now : null
  });
}

if (qaEnabled && fixture) {
  clearCase();

  if (fixture === 'clean') {
    // Deliberately leave the case empty.
  } else if (fixture === 'act2') {
    seedCore(true);
    seedAct2(false);
  } else if (fixture === 'act3') {
    seedCore(true);
    seedAct2(true);
    seedAct3(false);
  } else if (fixture === 'interrogation') {
    seedCore(true);
    seedAct2(true);
    seedAct3(true);
    seedInterrogation(false);
  } else if (fixture === 'act4') {
    seedCore(true);
    seedAct2(true);
    seedAct3(true);
    seedInterrogation(true);
    seedAct4('empty');
  } else if (fixture === 'card') {
    seedCore(true);
    seedAct2(true);
    seedAct3(true);
    seedInterrogation(true);
    seedAct4('search');
  } else if (fixture === 'report') {
    seedCore(true);
    seedAct2(true);
    seedAct3(true);
    seedInterrogation(true);
    seedAct4('card');
  } else if (fixture === 'complete') {
    seedCore(true);
    seedAct2(true);
    seedAct3(true);
    seedInterrogation(true);
    seedAct4('complete');
  }

  params.delete('fixture');
  params.delete('qa');
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  document.documentElement.dataset.dbrFixture = fixture;
}
