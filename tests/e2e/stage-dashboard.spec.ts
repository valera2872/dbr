import { expect, test } from '@playwright/test';

const CORE_KEY = 'dbr:dbr_001_room_314:0.2.0';
const ACT2_KEY = 'dbr:dbr_001_room_314:act2:v0.5.0';

test('в акте III dashboard показывает следственную проблему, а не готовый следующий материал', async ({ page }) => {
  await page.addInitScript(({ coreKey, act2Key }) => {
    localStorage.setItem(coreKey, JSON.stringify({
      phase: 'hq',
      prologueIndex: 3,
      activeTab: 'case',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [],
      discoveredFactIds: ['window_locked', 'door_not_used', 'conflict', 'phone_moved'],
      selectedHypotheses: [],
      puzzleAnswers: { E004: '23:50' },
      checkpointAnswerId: 'other_route',
      act1Complete: true,
      startedAt: '2026-08-11T12:00:00.000Z'
    }));
    localStorage.setItem(act2Key, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested']
    }));
  }, { coreKey: CORE_KEY, act2Key: ACT2_KEY });

  await page.goto('./?release=e2e-stage-dashboard-act3');

  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();

  const dashboard = page.locator('.premium-dashboard');
  await expect(dashboard).toBeVisible();
  await expect(dashboard).toHaveAttribute('data-route-stage', 'act3-archive');
  await expect(page.locator('.premium-topbar .topbar-case small')).toHaveText('Дело №001 · Акт III');

  const hero = dashboard.locator('.dashboard-hero');
  await expect(hero.locator('h1')).toHaveText('Что связывает номер 312 со старым делом?');
  await expect(hero).toContainText('Скрытый маршрут доказан');
  await expect(hero).not.toContainText('Восстановите историю карты 314-17');
  await expect(hero).not.toContainText('восстановить прежнюю планировку этажа');
  await expect(dashboard.locator('.dashboard-meter')).toBeHidden();
  await expect(dashboard.locator('.evidence-led-panel')).toContainText('Почему след из 312 ведёт дальше?');

  await expect(dashboard.locator('.objective-panel .premium-kicker')).toHaveText('Архив дела · Акт I');
  await expect(dashboard.locator('.objective-panel h2')).toHaveText('Факты первого этапа');
  await expect(dashboard.locator('.checkpoint-panel .premium-kicker')).toHaveText('Промежуточный отчёт №1');
  await expect(dashboard.locator('.checkpoint-panel .premium-pill')).toHaveText('Принят');
});
