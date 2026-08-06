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
}

async function openTab(page: Page, label: string) {
  const button = page
    .locator('.premium-sidebar button, .premium-mobile-nav button')
    .filter({ hasText: label })
    .filter({ visible: true })
    .first();
  await expect(button).toBeVisible();
  await button.click();
}

test('ранний допрос Кирилла объясняет следующий шаг и ведёт к отчёту №1', async ({ page }) => {
  await openHeadquarters(page);
  await openTab(page, 'Люди');

  await page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).click();
  await expect(page.locator('.interrogation-shell')).toBeVisible();
  await expect(page.locator('.interrogation-guide')).toContainText('Зафиксировать версию');
  await expect(page.locator('.interrogation-control-title')).toContainText('после промежуточного отчёта №1');
  await expect(page.locator('.interrogation-evidence').first().locator('i')).toHaveText('После отчёта №1');

  for (const id of ['alibi', 'passage', 'anton']) {
    await page.locator(`[data-ask="${id}"]`).click();
  }

  const action = page.locator('.interrogation-guide-action');
  await expect(action).toContainText('Вопросы закончены');
  await expect(action).toContainText('Сейчас допрос нужно приостановить');
  await action.getByRole('button', { name: /Открыть отчёт №1/ }).click();

  await expect(page.locator('.interrogation-shell')).toHaveCount(0);
  await expect(page.locator('.premium-dashboard')).toBeVisible();
  await expect(page.locator('.checkpoint-panel')).toBeVisible();
});
