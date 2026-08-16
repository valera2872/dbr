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
  discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005'],
  selectedHypotheses: [],
  puzzleAnswers: { E004: 'service-gap' },
  checkpointAnswerId: 'hidden-route',
  act1Complete: true,
  startedAt: '2026-08-05T12:00:00.000Z'
};

async function seed(page: Page, values: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  }, values);
}

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-react-core');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(page.locator('.premium-app')).toBeVisible();
}

test('E006 и E007 принадлежат React и сохраняют прежний ключ акта II', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await seed(page, {
    [CORE]: core,
    [ACT2]: { plan: [], room: [], questions: ['agency:plan-requested'] },
    [ACT3]: { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false },
    [ACT4]: { search: [], card: [], finalAnswer: null, wrongAnswers: [], complete: false, startedAt: null, completedAt: null }
  });
  await continueCase(page);

  await page.getByRole('button', { name: /Материалы/ }).first().click();
  await expect(page.locator('.react-evidence-card')).toHaveCount(6);
  await expect(page.locator('.act2-evidence-card, .act3-evidence-card, .act4-evidence-card')).toHaveCount(0);
  await expect(page.locator('[data-evidence-id="E006"]')).toBeEnabled();
  await expect(page.locator('[data-evidence-id="E007"]')).toBeDisabled();

  await page.locator('[data-evidence-id="E006"]').click();
  await expect(page.locator('.react-case-modal.evidence-e006')).toBeVisible();
  const hotspots = page.locator('.react-case-modal.evidence-e006 .plan-hotspot');
  await expect(hotspots).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await hotspots.nth(index).click();

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT2);
  expect(saved.plan).toEqual(['wall', 'stamp', 'width']);
  expect(saved.questions).toContain('agency:plan-requested');
  await page.locator('.react-case-modal.evidence-e006 .premium-icon-button.close').click();
  await expect(page.locator('[data-evidence-id="E007"]')).toBeEnabled();
  expect(errors).toEqual([]);
});

test('финальное обвинение и отчёт работают в React без legacy акта IV', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await seed(page, {
    [CORE]: core,
    [ACT2]: { plan: ['wall', 'stamp', 'width'], room: ['panel', 'tracks', 'envelope', 'fibres'], questions: ['agency:plan-requested'] },
    [ACT3]: { archive: ['catalog', 'contact', 'audio', 'custody'], identity: ['registration', 'festival', 'message'], questions: ['d-original', 'v-name'], checkpointAnswer: 'separate_lies', complete: true },
    [INTERROGATION]: { stage: 'broken', asked: ['alibi'], presented: ['plan', 'panel', 'tracks', 'audio'], transcript: [], wrongConclusions: [], complete: true },
    [ACT4]: { search: ['entry', 'ilya', 'medical', 'lamp'], card: ['serial', 'copy', 'clip', 'integrity'], finalAnswer: null, wrongAnswers: [], complete: false, startedAt: '2026-08-05T12:10:00.000Z', completedAt: null }
  });
  await continueCase(page);

  await expect(page.locator('[data-react-case-core="v0.8.5"]')).toBeVisible();
  await expect(page.locator('.react-final-panel')).toBeVisible();
  await expect(page.locator('.act4-final-panel:not(.react-final-panel)')).toHaveCount(0);

  await page.getByRole('button', { name: /Кирилл пришёл за картой через скрытый проход/ }).click();
  await expect(page.locator('.act4-report-overlay')).toBeVisible();
  await expect(page.locator('.act4-report')).toContainText('РАССЛЕДОВАНИЕ ЗАВЕРШЕНО');

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT4);
  expect(saved.complete).toBe(true);
  expect(saved.finalAnswer).toBe('kirill_responsibility');
  expect(errors).toEqual([]);
});
