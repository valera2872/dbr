import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';

async function seedAfterRoom312(page: Page) {
  await page.addInitScript(({ core, act2, act3, act4 }) => {
    localStorage.setItem(core, JSON.stringify({
      phase: 'hq', prologueIndex: 3, activeTab: 'case',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [],
      discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
      selectedHypotheses: [], puzzleAnswers: { E004: '23:50' },
      checkpointAnswerId: 'other_route', act1Complete: true,
      startedAt: '2026-08-17T00:00:00.000Z'
    }));
    localStorage.setItem(act2, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested']
    }));
    localStorage.setItem(act3, JSON.stringify({
      archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false
    }));
    localStorage.setItem(act4, JSON.stringify({
      search: [], card: [], finalAnswer: null, wrongAnswers: [], complete: false,
      startedAt: null, completedAt: null
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
  }, { core: CORE, act2: ACT2, act3: ACT3, act4: ACT4 });
}

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-evidence-led-chain');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(page.locator('.premium-app')).toBeVisible();
}

test('E008 появляется только после самостоятельного выхода на архив 2015 года', async ({ page }) => {
  await seedAfterRoom312(page);
  await continueCase(page);

  const panel = page.locator('.evidence-led-panel[data-evidence-led-mode="archive-lead"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Почему след из 312 ведёт дальше?');
  await expect(page.locator('.react-next-action')).toBeHidden();

  await page.getByRole('button', { name: /Материалы/ }).first().click();
  await expect(page.locator('[data-evidence-id="E008"]')).toBeHidden();

  const guide = page.locator('.player-guide-floating');
  await expect(guide).toContainText('Открыть рабочую панель');
  await guide.getByRole('button', { name: /Открыть рабочую панель/ }).click();
  await expect(panel).toBeVisible();

  await panel.getByRole('button', { name: /Отправить волокна на экспресс-анализ/ }).click();
  await expect(panel).toContainText('массового типа');
  await expect(panel.getByRole('button', { name: /Запросить BOX 15-B/ })).toHaveCount(0);

  await panel.getByRole('button', { name: /Изучить маркировку конверта 2015 года/ }).click();
  await panel.getByRole('button', { name: /Спросить Дениса о пометке/ }).click();
  await expect(panel).toContainText('BOX 15-B / CONTACT B');
  await expect(panel).toContainText('Антон Белов');

  await panel.getByRole('button', { name: /Запросить BOX 15-B и журнал оцифровки/ }).click();
  const received = page.locator('.evidence-led-panel[data-evidence-led-mode="archive-received"]');
  await expect(received).toContainText('Архив выдал BOX 15-B');
  await received.getByRole('button', { name: /Открыть полученный архивный материал/ }).click();
  await expect(page.locator('.react-case-modal.evidence-e008')).toBeVisible();
});

test('E009 появляется только после восстановления Веры в цепочке хранения и проверки кандидата', async ({ page }) => {
  await seedAfterRoom312(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: [],
      questions: ['agency3:envelope', 'agency3:denis-envelope', 'agency3:archive-requested'],
      checkpointAnswer: null,
      complete: false
    }));
  }, ACT3);
  await continueCase(page);

  const panel = page.locator('.evidence-led-panel[data-evidence-led-mode="identity-lead"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Кому принадлежала цепочка B-17');

  await page.getByRole('button', { name: /Материалы/ }).first().click();
  await expect(page.locator('[data-evidence-id="E009"]')).toBeHidden();
  await page.locator('.player-guide-floating').getByRole('button', { name: /Открыть рабочую панель/ }).click();

  await panel.getByRole('button', { name: /Поднять дополнительный лист выдачи носителей/ }).click();
  await expect(panel).toContainText('Вера Белова');
  await panel.getByRole('button', { name: /Уточнить у Дениса/ }).click();
  await expect(panel).toContainText('такого имени среди участников нет');

  await panel.getByRole('button', { name: /Проверить Марину Орлову/ }).click();
  await expect(panel).toContainText('Несоответствий нет');
  await expect(panel.getByRole('button', { name: /Запросить документы для проверки Елены/ })).toHaveCount(0);

  await panel.getByRole('button', { name: /Проверить Елену Ветрову/ }).click();
  await expect(panel).toContainText('дата рождения Елены совпадает');
  await panel.getByRole('button', { name: /Запросить документы для проверки Елены/ }).click();

  const received = page.locator('.evidence-led-panel[data-evidence-led-mode="identity-received"]');
  await expect(received).toContainText('Получены документы Елены');
  await received.getByRole('button', { name: /Провести документальную сверку/ }).click();
  await expect(page.locator('.react-case-modal.evidence-e009')).toBeVisible();

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT3);
  expect(saved.questions).toEqual(expect.arrayContaining([
    'agency3:trace-custody',
    'agency3:denis-family',
    'agency3:id-marina',
    'agency3:id-elena',
    'agency3:identity-requested'
  ]));
});
