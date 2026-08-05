import { expect, test } from '@playwright/test';

test('служебная метка версии не размножается в фоне', async ({ page }) => {
  await page.goto('./?release=e2e-marker-regression');
  await expect(page.locator('.commercial-launch')).toBeVisible();

  const markerSelector = '.premium-build-marker, .dbr-build-marker, .build-marker';
  await expect(page.locator(markerSelector)).toHaveCount(1);
  await page.waitForTimeout(2_000);
  await expect(page.locator(markerSelector)).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-dbr-build', 'v0.8.6');
});
