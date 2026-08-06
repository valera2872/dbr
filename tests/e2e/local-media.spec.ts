import { expect, test } from '@playwright/test';

test('первичный осмотр использует реалистичные фото, а финальные материалы остаются локальными', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('images.unsplash.com')) remoteRequests.push(request.url());
  });

  await page.goto('./?release=e2e-realistic-primary-media');
  await expect(page.locator('.commercial-launch')).toBeVisible();

  const homeBackground = await page.locator('.premium-home').evaluate((element) =>
    getComputedStyle(element).backgroundImage
  );
  expect(homeBackground).toContain('images.unsplash.com');

  const finalMediaBackgrounds = await page.evaluate(() => {
    const classes = [
      'archive-plan-sheet',
      'archive-worktable',
      'act4-room-scene',
      'act4-card-lab',
      'act4-report'
    ];
    return classes.map((className) => {
      const element = document.createElement('div');
      element.className = className;
      element.style.position = 'fixed';
      element.style.left = '-10000px';
      document.body.append(element);
      const background = getComputedStyle(element).backgroundImage;
      element.remove();
      return background;
    });
  });

  [
    'e006-archive-plan.svg',
    'e008-archive-table.svg',
    'e010-service-room.svg',
    'e011-card-lab.svg',
    'final-case-report.svg'
  ].forEach((file, index) => expect(finalMediaBackgrounds[index]).toContain(file));

  for (const file of [
    'e006-archive-plan.svg',
    'e008-archive-table.svg',
    'e010-service-room.svg',
    'e011-card-lab.svg',
    'final-case-report.svg'
  ]) {
    const response = await page.request.get(`./media/case-001/evidence/${file}`);
    expect(response.ok(), `${file} должен загружаться из production bundle`).toBe(true);
  }

  await page.locator('.commercial-launch').getByRole('button', { name: 'Начать расследование' }).click();
  await expect(page.locator('.premium-prologue')).toBeVisible();

  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }

  await expect(page.locator('.premium-app')).toBeVisible();

  await page.getByRole('button', { name: /Материалы/ }).first().click();
  await expect(page.locator('.premium-evidence-grid')).toBeVisible();
  const evidenceSources = await page.locator('.premium-evidence-card img').evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).src)
  );
  expect(evidenceSources.some((source) => source.includes('images.unsplash.com'))).toBe(true);

  await page.getByRole('button', { name: /Люди/ }).first().click();
  await expect(page.locator('.premium-people-grid')).toBeVisible();
  const portraitSources = await page.locator('.premium-person-card img').evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).src)
  );
  expect(portraitSources.length).toBeGreaterThan(0);
  expect(portraitSources.every((source) => source.includes('images.unsplash.com'))).toBe(true);

  expect(remoteRequests.length).toBeGreaterThan(0);
  await expect(page.locator('img[src*="images.unsplash.com"]')).not.toHaveCount(0);
});
