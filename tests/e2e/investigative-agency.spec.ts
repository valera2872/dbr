import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';

const coreAfterReport = {
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
  startedAt: '2026-08-17T00:00:00.000Z'
};

async function visibleTab(page: Page, label: string) {
  const button = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
}

test('старый план появляется только как результат самостоятельной следственной цепочки', async ({ page }) => {
  await page.addInitScript(({ coreKey, act2Key, core }) => {
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem(coreKey, JSON.stringify(core));
    localStorage.setItem(act2Key, JSON.stringify({ plan: [], room: [], questions: [] }));
  }, { coreKey: CORE, act2Key: ACT2, core: coreAfterReport });

  await page.goto('./?release=e2e-investigative-agency');
  await page.locator('.commercial-launch').getByRole('button', { name: 'Продолжить расследование' }).click();

  const panel = page.locator('.investigation-agency-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Известные пути не объясняют исчезновение');
  await expect(panel).toContainText('Не каждая обязана дать новую улику');
  await expect(page.locator('.react-next-action')).toBeHidden();

  const guide = page.locator('.player-guide-floating');
  await expect(guide).toContainText('Игра не указывает правильное направление');
  await expect(guide.getByRole('button', { name: 'Следующее действие выбирает следователь' })).toBeDisabled();

  await visibleTab(page, 'Материалы');
  const planCard = page.locator('[data-evidence-id="E006"]');
  await expect(planCard).toBeHidden();
  await visibleTab(page, 'Дело');

  await panel.getByRole('button', { name: /Перепроверить окно снаружи/ }).click();
  await expect(panel).toContainText('нового маршрута эта проверка не дала');
  await expect(page.locator('[data-evidence-id="E006"]')).toBeHidden();

  await panel.getByRole('button', { name: /Запросить расширенный журнал замка/ }).click();
  await expect(panel).toContainText('Служебных открытий двери 314 после 23:50 нет');
  await expect(page.locator('[data-evidence-id="E006"]')).toBeHidden();

  await panel.getByRole('button', { name: /Повторно осмотреть шкаф и общую стену/ }).click();
  await expect(panel).toContainText('Полосы на ковре заканчиваются у шкафа');
  await expect(panel.getByRole('button', { name: /Запросить обмерный план до реконструкции/ })).toHaveCount(0);

  await panel.getByRole('button', { name: /Уточнить историю ремонтов этажа/ }).click();
  await expect(panel).toContainText('Третий этаж перестраивали после фестиваля 2015 года');

  const requestPlan = panel.getByRole('button', { name: /Запросить обмерный план до реконструкции/ });
  await expect(requestPlan).toBeVisible();
  await requestPlan.click();

  const received = page.locator('.investigation-agency-panel[data-agency-mode="received"]');
  await expect(received).toContainText('Архив прислал обмерный план 2004 года');

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT2);
  expect(stored.questions).toEqual(expect.arrayContaining([
    'agency:wall',
    'agency:renovation',
    'agency:plan-requested'
  ]));

  await received.getByRole('button', { name: /Перейти к полученному материалу/ }).click();
  await expect(planCard).toBeVisible();
  await expect(planCard).toBeEnabled();
  await expect(planCard).toContainText('V314');
  await expect(planCard).toContainText('служебной зоне');
  await planCard.click();

  const modal = page.locator('.react-case-modal.evidence-e006');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Ищите возможные пути перемещения, а не виновного');

  const hotspots = modal.locator('.plan-hotspot');
  await expect(hotspots).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await hotspots.nth(index).click();

  await expect(modal).toContainText('Старая сеть связывала 312 / 314 со служебной зоной');
  await expect(modal).toContainText('P3');
  await expect(modal).not.toContainText('Проход сохранился за панелями');
});
