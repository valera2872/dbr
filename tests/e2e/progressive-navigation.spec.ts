import { expect, test, type Page } from '@playwright/test';

function visibleNavigation(page: Page) {
  return page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible');
}

async function startGuidedCase(page: Page) {
  await page.goto('./?fresh=1&release=e2e-progressive-navigation');
  const launch = page.locator('.commercial-launch');
  await launch.getByRole('button', { name: 'Начать расследование' }).click();

  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }

  const onboarding = page.locator('.player-onboarding');
  await expect(onboarding).toBeVisible();
  await onboarding.getByRole('button', { name: /^Осмотреть номер 314/ }).click();
  await expect(page.locator('.evidence-e001')).toBeVisible();
}

test('в guided first run штаб раскрывается постепенно', async ({ page }) => {
  await startGuidedCase(page);

  for (const label of ['Окно', 'Письменный стол', 'Сумка', 'Ковёр']) {
    await page.getByRole('button', { name: `Осмотреть ${label}` }).click();
  }
  await page.getByRole('button', { name: /Вернуться в штаб/ }).click();

  await expect(page.locator('html')).toHaveAttribute('data-dbr-progressive-hq', '1');
  await expect(visibleNavigation(page).filter({ hasText: 'Дело' })).toBeVisible();
  await expect(visibleNavigation(page).filter({ hasText: 'Материалы' })).toBeVisible();
  await expect(page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Люди' }).first()).toBeHidden();
  await expect(page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Версии' }).first()).toBeHidden();
  await expect(page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Хронология' }).first()).toBeHidden();

  const guide = page.locator('.player-guide-floating');
  await guide.getByRole('button', { name: /Следующий шаг: Открыть последнее сообщение/ }).click();
  await expect(page.locator('.evidence-e002')).toBeVisible();
  await page.getByRole('button', { name: /Вернуться в штаб/ }).click();

  await expect(visibleNavigation(page).filter({ hasText: 'Люди' })).toBeVisible();
  await expect(page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Версии' }).first()).toBeHidden();
  await expect(page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Хронология' }).first()).toBeHidden();
});

test('пропуск guided first run оставляет полный штаб', async ({ page }) => {
  await page.goto('./?fresh=1&release=e2e-progressive-navigation-skip');
  await page.locator('.commercial-launch').getByRole('button', { name: 'Начать расследование' }).click();

  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }

  const onboarding = page.locator('.player-onboarding');
  await onboarding.getByRole('button', { name: 'Открыть весь штаб без обучения' }).click();
  await expect(onboarding).toHaveCount(0);

  await expect(page.locator('html')).toHaveAttribute('data-dbr-progressive-hq', '0');
  for (const label of ['Дело', 'Материалы', 'Люди', 'Версии', 'Хронология']) {
    await expect(visibleNavigation(page).filter({ hasText: label })).toBeVisible();
  }
});
