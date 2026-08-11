import { expect, test } from '@playwright/test';

test('коммерческий запуск использует параметры дела из manifest', async ({ page }) => {
  await page.goto('./?fresh=1&release=e2e-commercial-metadata');

  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  await expect(launch).toHaveAttribute('data-metadata-source', 'case-manifest');
  await expect(launch.locator('.commercial-launch-rating')).toHaveText('14+');

  const features = launch.locator('.commercial-launch-features > span');
  await expect(features.nth(0)).toHaveText('≈ 90 минут');
  await expect(features.nth(1)).toHaveText('1–4 игрока');
  await expect(launch).not.toContainText('16+');
  await expect(launch).not.toContainText('1–2 игрока');
});
