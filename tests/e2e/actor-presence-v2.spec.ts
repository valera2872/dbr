import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function seed(page: Page) {
  await page.addInitScript(({ coreKey, act2Key, act3Key, interrogationKey }) => {
    localStorage.setItem(coreKey, JSON.stringify({
      phase: 'hq',
      prologueIndex: 3,
      activeTab: 'people',
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
    }));
    localStorage.setItem(act2Key, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:window', 'agency:lock', 'agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
    }));
    localStorage.setItem(act3Key, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: ['registration', 'festival', 'message'],
      questions: ['d-original', 'v-name', 'v2:desk-sampled', 'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route'],
      checkpointAnswer: 'separate_lies',
      complete: true
    }));
    localStorage.setItem(interrogationKey, JSON.stringify({
      stage: 'calm', asked: [], presented: [], transcript: [], wrongConclusions: [], complete: false
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem('dbr:player-guidance:guided-first-run:v1', '1');
  }, { coreKey: CORE, act2Key: ACT2, act3Key: ACT3, interrogationKey: INTERROGATION });
}

async function openKirill(page: Page) {
  await page.goto('./?release=e2e-actor-presence-v2');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();

  const people = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: 'Люди' }).first();
  await people.click();

  const kirill = page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' });
  await expect(kirill.locator('.actor-presence-card-clue')).toContainText('свежая повязка');
  await kirill.click();
  await expect(page.locator('.interrogation-shell')).toBeVisible();
}

test('свежая травма даёт основание сравнить Кирилла с микроследом, но не выдаёт готовое обвинение', async ({ page }) => {
  await seed(page);
  await openKirill(page);

  const panel = page.locator('.actor-presence-v2');
  await expect(panel).toContainText('Свежая повязка на правой ладони');
  await expect(panel).toContainText('Игра не связывает её с уликами автоматически');

  await panel.getByRole('button', { name: 'Зафиксировать повреждение' }).click();
  await expect(panel).toContainText('В 314-й я не заходил');

  await panel.getByRole('button', { name: 'Сверить повязку с коридорной камерой' }).click();
  await expect(panel).toContainText('не связывает повреждение с номером 314');

  await panel.getByRole('button', { name: 'Сравнить с биологическим микроследом из 314' }).click();
  await expect(panel).toContainText('16 из 16 исследованных локусов совпадают');
  await expect(panel).toContainText('не устанавливает механизм нападения');

  await panel.getByRole('button', { name: 'Кирилл напал на Илью' }).click();
  await expect(panel).toContainText('Слишком сильный вывод');

  await panel.getByRole('button', { name: 'Кирилл физически контактировал со столом в 314' }).click();
  await expect(panel).toHaveAttribute('data-actor-presence-v2', 'proven');
  await expect(panel).toContainText('Кирилл физически был в 314');
  await expect(panel).toContainText('не доказывает нападение или путь входа');

  const markers = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').questions as string[], ACT3);
  expect(markers).toEqual(expect.arrayContaining([
    'actor:k:injury-observed',
    'actor:k:comparison-requested',
    'actor:k:presence-proven'
  ]));

  await page.getByRole('button', { name: 'Закрыть допрос' }).click();
  await expect(page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).locator('.actor-presence-card-clue')).toContainText('Присутствие в 314 доказано');
});
