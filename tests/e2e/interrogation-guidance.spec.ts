import { expect, test, type Page } from '@playwright/test';

async function openHeadquarters(page: Page) {
  await page.goto('./?fresh=1&release=e2e-interrogation-guidance');
  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  await launch.getByRole('button', { name: 'Начать расследование' }).click();

  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }
  await expect(page.locator('.premium-app')).toBeVisible();
  await expect(page.locator('.player-onboarding')).toBeVisible();
  await page.locator('.player-onboarding').getByRole('button', { name: 'Закрыть обучение' }).click();
}

async function openTab(page: Page, label: string) {
  const buttons = page
    .locator('.premium-sidebar button, .premium-mobile-nav button')
    .filter({ hasText: label });
  const count = await buttons.count();

  for (let index = 0; index < count; index += 1) {
    if (await buttons.nth(index).isVisible()) {
      await buttons.nth(index).click();
      return;
    }
  }

  throw new Error(`Не найдена видимая вкладка: ${label}`);
}

test('ранний допрос не подсказывает проход до появления основания и ведёт к отчёту №1', async ({ page }) => {
  await openHeadquarters(page);
  await openTab(page, 'Люди');

  await page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).click();
  await expect(page.locator('.interrogation-shell')).toBeVisible();
  await expect(page.locator('.interrogation-guide')).toContainText('Зафиксировать алиби');
  await expect(page.locator('.interrogation-premise-note')).toContainText('Следователь спрашивает только о том, для чего уже есть основание');
  await expect(page.locator('[data-ask="alibi"]')).toBeVisible();
  await expect(page.locator('[data-ask="passage"]')).toBeHidden();
  await expect(page.locator('[data-ask="anton"]')).toBeHidden();
  await expect(page.locator('.interrogation-control-title')).toContainText('после промежуточного отчёта №1');
  await expect(page.locator('.interrogation-evidence').first().locator('i')).toHaveText('После отчёта №1');

  await page.locator('[data-ask="alibi"]').click();

  const action = page.locator('.interrogation-guide-action');
  await expect(action).toContainText('Базовое алиби зафиксировано');
  await expect(action).toContainText('Дальше нужны факты, а не догадки');
  await expect(action).toContainText('ещё не знает ни о старом проходе');
  const reportRoute = action.locator('[data-interrogation-guide-route="case"]');
  await expect(reportRoute).toContainText('открыть отчёт №1');
  await reportRoute.click();

  await expect(page.locator('.interrogation-shell')).toHaveCount(0);
  await expect(page.locator('.premium-dashboard')).toBeVisible();
  await expect(page.locator('.checkpoint-panel')).toBeVisible();
});
