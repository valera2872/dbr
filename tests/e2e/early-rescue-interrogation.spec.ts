import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function seedEarlyRescue(page: Page) {
  await page.addInitScript(({ coreKey, act2Key, act3Key, act4Key, interrogationKey }) => {
    localStorage.setItem(coreKey, JSON.stringify({
      phase: 'hq', prologueIndex: 3, activeTab: 'people',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [], discoveredFactIds: [], selectedHypotheses: [],
      puzzleAnswers: { E004: '23:50' }, checkpointAnswerId: 'other_route',
      act1Complete: true, startedAt: '2026-08-18T00:00:00.000Z'
    }));
    localStorage.setItem(act2Key, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
    }));
    localStorage.setItem(act3Key, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: ['registration', 'festival', 'message'],
      questions: [
        'agency3:archive-requested', 'agency3:trace-custody', 'agency3:denis-family',
        'agency3:id-elena', 'agency3:identity-requested', 'd-original', 'v-name',
        'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route',
        'v2:desk-sampled', 'v2:rescue-complete'
      ],
      checkpointAnswer: 'separate_lies', complete: true
    }));
    localStorage.setItem(act4Key, JSON.stringify({
      search: ['entry', 'ilya', 'medical', 'lamp'], card: [], finalAnswer: null,
      wrongAnswers: [], complete: false, startedAt: '2026-08-18T00:20:00.000Z', completedAt: null
    }));
    localStorage.setItem(interrogationKey, JSON.stringify({
      stage: 'calm', asked: [], presented: [], transcript: [], wrongConclusions: [], complete: false
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
  }, { coreKey: CORE, act2Key: ACT2, act3Key: ACT3, act4Key: ACT4, interrogationKey: INTERROGATION });
}

async function continueAndOpenKirill(page: Page) {
  await page.goto('./?release=e2e-early-rescue-interrogation');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  const people = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: 'Люди' }).first();
  await people.click();
  await page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).click();
}

test('раннее спасение Ильи не возвращает предписанный порядок доказательств в допрос', async ({ page }) => {
  await seedEarlyRescue(page);
  await continueAndOpenKirill(page);

  const shell = page.locator('.interrogation-shell');
  await expect(shell).toBeVisible();
  await expect(shell).toHaveAttribute('data-investigation-agency', 'key');
  await expect(page.locator('.interrogation-agency-brief[data-interrogation-agency-mode="key"]')).toBeVisible();
  await expect(page.locator('.interrogation-guide')).toBeHidden();
  await expect(page.locator('.interrogation-evidence.next-guided-evidence')).toHaveCount(0);

  await page.locator('[data-ask="alibi"]').click();
  await expect(shell).toHaveAttribute('data-investigation-agency', 'key');
  await expect(page.locator('.interrogation-evidence.next-guided-evidence')).toHaveCount(0);

  const plan = page.locator('[data-present="plan"]');
  await expect(plan).toBeVisible();
  await plan.click();
  await expect(page.locator('.interrogation-transcript')).toContainText('На архивном плане есть проход между 312 и 314');
});