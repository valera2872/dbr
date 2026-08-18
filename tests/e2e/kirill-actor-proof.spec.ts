import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

const core = {
  phase: 'hq',
  prologueIndex: 3,
  activeTab: 'case',
  seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
  flaggedEvidenceIds: [],
  inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
  seenDialogueTopicIds: [],
  discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
  selectedHypotheses: [],
  puzzleAnswers: { E004: '23:50' },
  checkpointAnswerId: 'other_route',
  act1Complete: true,
  startedAt: '2026-08-18T00:00:00.000Z'
};

const act2 = {
  plan: ['wall', 'stamp', 'width'],
  room: ['panel', 'tracks', 'envelope', 'fibres'],
  questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
};

const act4 = {
  search: [],
  card: [],
  finalAnswer: null,
  wrongAnswers: [],
  complete: false,
  startedAt: null,
  completedAt: null
};

async function seed(page: Page, act3: Record<string, unknown>) {
  await page.addInitScript(({ coreKey, act2Key, act3Key, act4Key, interrogationKey, coreState, act2State, act3State, act4State }) => {
    localStorage.setItem(coreKey, JSON.stringify(coreState));
    localStorage.setItem(act2Key, JSON.stringify(act2State));
    localStorage.setItem(act3Key, JSON.stringify(act3State));
    localStorage.setItem(act4Key, JSON.stringify(act4State));
    localStorage.setItem(interrogationKey, JSON.stringify({
      stage: 'calm', asked: [], presented: [], transcript: [], wrongConclusions: [], complete: false
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem('dbr:player-guidance:guided-first-run:v1', 'skipped');
  }, {
    coreKey: CORE,
    act2Key: ACT2,
    act3Key: ACT3,
    act4Key: ACT4,
    interrogationKey: INTERROGATION,
    coreState: core,
    act2State: act2,
    act3State: act3,
    act4State: act4
  });
}

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-kirill-actor-proof');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
}

async function openTab(page: Page, label: string) {
  const target = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: label }).first();
  await expect(target).toBeVisible();
  await target.click();
}

test('микрослед индивидуализирует Кирилла только после наблюдения и сравнительного анализа', async ({ page }) => {
  await seed(page, {
    archive: ['catalog', 'contact', 'audio', 'custody'],
    identity: ['registration', 'festival', 'message'],
    questions: [
      'agency3:archive-requested', 'agency3:trace-custody', 'agency3:identity-requested',
      'd-original', 'v-name', 'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route',
      'v2:desk-sampled'
    ],
    checkpointAnswer: 'separate_lies',
    complete: false
  });
  await continueCase(page);

  await openTab(page, 'Дело');
  const branch = page.locator('.case001-v2-branch-panel');
  await expect(branch).toBeVisible();
  await expect(branch).toContainText('Микрослед сохранён. Нужен источник для сравнения');
  await expect(page.locator('[data-kirill-actor-proof-v2="1"]')).toHaveCount(0);
  await branch.getByRole('button', { name: /Проверить участников на свежие повреждения/ }).click();

  const kirillCard = page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' });
  await expect(kirillCard).toContainText('На правой кисти узкий свежий пластырь');
  await kirillCard.click();
  const interrogation = page.locator('.interrogation-shell');
  await expect(interrogation).toBeVisible();
  await expect(interrogation).toContainText('Это пока только видимый факт');
  await interrogation.getByRole('button', { name: 'Уточнить повреждение' }).click();
  await expect(interrogation).toContainText('металлическую кромку чемодана');
  await interrogation.getByRole('button', { name: 'Закрыть допрос' }).click();

  await openTab(page, 'Дело');
  await expect(branch).toContainText('Есть основание для сравнительного анализа');
  await branch.getByRole('button', { name: /Сопоставить микрослед с образцом Кирилла/ }).click();

  const proof = page.locator('[data-kirill-actor-proof-v2="1"]');
  await expect(proof).toBeVisible();
  await expect(proof).toContainText('Совпадение человека, места и действия — разные выводы');
  await proof.getByRole('button', { name: /Запросить контрольный образец и STR-анализ/ }).click();
  await expect(proof).toContainText('STR PROFILE');
  await expect(proof).toContainText('MATCH');

  await proof.getByRole('button', { name: /доказывает, что Кирилл вошёл именно через V314/ }).click();
  await expect(proof).toContainText('не устанавливает маршрут');
  await proof.getByRole('button', { name: /физически контактировал с местом этой ночи/ }).click();
  await expect(proof).toContainText('Физическое присутствие индивидуализировано');

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT3);
  expect(stored.questions).toEqual(expect.arrayContaining([
    'v2:desk-sampled',
    'actor:kirill-hand-observed',
    'actor:kirill-str-match',
    'actor:kirill-presence-proven'
  ]));
  expect(stored.checkpointAnswer).toBe('separate_lies');
  expect(stored.complete).toBe(true);
});

test('новый отчёт E009 не закрывает Act III без actor proof', async ({ page }) => {
  await seed(page, {
    archive: ['catalog', 'contact', 'audio', 'custody'],
    identity: ['registration', 'festival', 'message'],
    questions: [
      'agency3:archive-requested', 'agency3:trace-custody', 'agency3:id-elena', 'agency3:identity-requested',
      'd-original', 'v-name', 'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route',
      'v2:desk-sampled'
    ],
    checkpointAnswer: null,
    complete: false
  });
  await continueCase(page);

  await openTab(page, 'Материалы');
  const e009Card = page.locator('[data-evidence-id="E009"]');
  await expect(e009Card).toBeEnabled();
  await e009Card.click();

  const e009 = page.locator('.evidence-e009[data-e009-identity-v2="1"]');
  await expect(e009.locator('.identity-v2-checkpoint')).toBeVisible();
  await e009.locator('.identity-v2-checkpoint').getByRole('button', { name: /Вера — реальный источник B-17/ }).click();
  await expect(e009).toContainText('Верно');

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT3);
  expect(stored.checkpointAnswer).toBe('separate_lies');
  expect(stored.complete).toBe(false);
  expect(stored.questions).not.toContain('actor:kirill-presence-proven');
});
