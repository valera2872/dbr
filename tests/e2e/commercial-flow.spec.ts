import { expect, test, type Page } from '@playwright/test';

const CORE_KEY = 'dbr:dbr_001_room_314:0.2.0';
const SEED_GUARD = '__dbr_e2e_seeded';

function coreProgress(overrides: Record<string, unknown> = {}) {
  return {
    phase: 'hq',
    prologueIndex: 3,
    activeTab: 'case',
    seenEvidenceIds: [],
    flaggedEvidenceIds: [],
    inspectedHotspotIds: [],
    seenDialogueTopicIds: [],
    discoveredFactIds: [],
    selectedHypotheses: [],
    puzzleAnswers: {},
    checkpointAnswerId: null,
    act1Complete: false,
    startedAt: '2026-08-04T12:00:00.000Z',
    ...overrides
  };
}

async function seedCore(page: Page, value: Record<string, unknown>) {
  await page.addInitScript(({ key, guard, progress }) => {
    if (window.sessionStorage.getItem(guard) === '1') return;
    window.localStorage.setItem(key, JSON.stringify(progress));
    window.sessionStorage.setItem(guard, '1');
  }, { key: CORE_KEY, guard: SEED_GUARD, progress: value });
}

function trackRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('новый покупатель проходит обложку и попадает в штаб', async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  await page.goto('./?release=e2e-clean');

  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-dbr-mode', 'commercial');
  await expect(launch.getByRole('heading', { level: 1 })).toContainText('Все лгут');
  await expect(launch.getByRole('button', { name: 'Начать расследование' })).toBeVisible();
  await expect(page.locator('.premium-build-marker')).toBeHidden();
  await expect(page.locator('.stability-diagnostics')).toHaveCount(0);
  await expect(page.getByText('Actor Studio', { exact: true })).toHaveCount(0);

  await launch.getByRole('button', { name: 'Начать расследование' }).click();
  await expect(page.locator('.premium-prologue')).toBeVisible();

  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }

  await expect(page.locator('.premium-app')).toBeVisible();
  await expect(page.locator('.premium-topbar')).toContainText('Номер 314');
  await expect(page.getByRole('button', { name: 'Меню' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('сохранённое расследование продолжается с прежнего раздела', async ({ page }) => {
  await seedCore(page, coreProgress({
    activeTab: 'evidence',
    seenEvidenceIds: ['E001', 'E002'],
    inspectedHotspotIds: ['E001:window', 'E001:desk'],
    discoveredFactIds: ['F001', 'F002']
  }));

  await page.goto('./?release=e2e-resume');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await expect(launch.locator('.commercial-launch-progress')).toHaveClass(/visible/);
  await expect(launch.locator('.commercial-launch-progress-copy > b')).not.toHaveText('0%');

  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(launch).toHaveCount(0);
  await expect(page.locator('.premium-app')).toBeVisible();
  await expect(page.locator('.premium-sidebar button.active')).toContainText('Материалы');
});

test('начать заново требует подтверждения и удаляет прежний прогресс', async ({ page }) => {
  await seedCore(page, coreProgress({
    seenEvidenceIds: ['E001', 'E002', 'E003'],
    discoveredFactIds: ['F001', 'F002', 'F003']
  }));

  await page.goto('./?release=e2e-restart');
  const launch = page.locator('.commercial-launch');
  await launch.getByRole('button', { name: 'Начать заново' }).click();

  const confirmation = launch.locator('.commercial-launch-confirm');
  await expect(confirmation).toHaveClass(/visible/);
  await expect(confirmation).toContainText('Текущий прогресс');
  await confirmation.getByRole('button', { name: 'Да, начать заново' }).click();

  await expect(page.locator('.premium-prologue')).toBeVisible();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), CORE_KEY);
  expect(saved.seenEvidenceIds ?? []).toEqual([]);
  expect(saved.phase).toBe('prologue');
});

test('противоречивое старое сохранение восстанавливается без белой страницы', async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  await seedCore(page, coreProgress({ act1Complete: true, checkpointAnswerId: 'hidden-route' }));

  await page.goto('./?release=e2e-recovery');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Восстановить сохранение' })).toBeVisible();
  await launch.getByRole('button', { name: 'Восстановить сохранение' }).click();

  const repairedLaunch = page.locator('.commercial-launch');
  await expect(repairedLaunch).toBeVisible();
  await expect(repairedLaunch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  const repaired = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), CORE_KEY);
  expect(repaired.act1Complete).toBe(false);
  expect(repaired.checkpointAnswerId).toBeNull();
  expect(repaired.phase).toBe('hq');
  expect(errors).toEqual([]);
});

test('мобильный запуск не ломается без внешних фотографий', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Проверка предназначена для мобильного проекта');
  test.skip(browserName !== 'chromium');

  const errors = trackRuntimeErrors(page);
  await page.route('https://images.unsplash.com/**', (route) => route.abort());
  await page.goto('./?release=e2e-mobile');

  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  const launchOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(launchOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('commercial-mobile-launch.png'), fullPage: true });

  await launch.getByRole('button', { name: 'Начать расследование' }).click();
  await expect(page.locator('.premium-prologue')).toBeVisible();
  const prologueOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(prologueOverflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
