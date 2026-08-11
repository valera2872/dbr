import { expect, test } from '@playwright/test';

const CORE_KEY = 'dbr:dbr_001_room_314:0.2.0';

test('после отчёта №1 штаб показывает акт II, а не завершённый акт I', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      phase: 'hq',
      prologueIndex: 3,
      activeTab: 'case',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [],
      discoveredFactIds: [],
      selectedHypotheses: [],
      puzzleAnswers: {},
      checkpointAnswerId: 'other_route',
      act1Complete: true,
      startedAt: '2026-08-11T12:00:00.000Z'
    }));
  }, CORE_KEY);

  await page.goto('./?release=e2e-stage-header-act2');

  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();

  const topbar = page.locator('.premium-topbar');
  await expect(topbar).toBeVisible();
  await expect(topbar).toHaveAttribute('data-route-stage', 'act2-plan');
  await expect(topbar.locator('.topbar-case small')).toHaveText('Дело №001 · Акт II');
  await expect(topbar.locator('.topbar-actions > .premium-pill')).toHaveText('Расследование идёт');
  await expect(topbar).not.toContainText('Акт завершён');
});
