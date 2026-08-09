import { expect, test, type Page } from '@playwright/test';

function evidenceCard(page: Page, id: string) {
  return page.locator('.premium-evidence-card').filter({ hasText: id }).first();
}

async function openTab(page: Page, label: string) {
  const button = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
}

async function openHeadquarters(page: Page) {
  await page.goto('./?fresh=1&release=e2e-first-player');
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

test('E001 показывает последнюю выбранную зону, а E005 ведёт к следующему шагу', async ({ page }) => {
  await openHeadquarters(page);
  await openTab(page, 'Материалы');

  await evidenceCard(page, 'E001').click();
  await expect(page.locator('.evidence-e001')).toBeVisible();

  await page.getByRole('button', { name: 'Осмотреть Ковёр' }).click();
  await expect(page.locator('.evidence-e001 .inspection-result')).toContainText('Следы перемещения');

  await page.getByRole('button', { name: 'Осмотреть Окно' }).click();
  await expect(page.locator('.evidence-e001 .inspection-result')).toContainText('Закрытое окно');
  await expect(page.locator('.evidence-e001 .inspection-result')).not.toContainText('Ворс приглажен');

  await page.locator('.evidence-e001 .flag-button').click();
  await expect(page.locator('.first-player-toast')).toContainText('Добавлено в закладки');
  await expect(page.locator('.evidence-e001 .first-player-bookmark-help')).toContainText('вкладке «Дело»');

  await page.getByRole('button', { name: /Вернуться в штаб/ }).click();
  await openTab(page, 'Дело');
  await expect(page.locator('.first-player-bookmarks')).toContainText('Осмотр номера 314');

  await openTab(page, 'Материалы');
  await evidenceCard(page, 'E005').click();
  const route = page.locator('.evidence-e005 .first-player-route-banner');
  await expect(route).toContainText('Следующий обязательный шаг');
  await route.getByRole('button', { name: /Перейти к людям/ }).click();

  await expect(page.locator('.premium-people-grid')).toBeVisible();
  await expect(page.locator('.premium-section-header')).toContainText('Все что-то скрывают');
});
