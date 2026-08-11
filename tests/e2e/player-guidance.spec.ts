import { expect, test } from '@playwright/test';

test('новичок получает одно понятное первое действие вместо обзора всего штаба', async ({ page }) => {
  await page.goto('./?fresh=1&release=e2e-player-guidance');
  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  await launch.getByRole('button', { name: 'Начать расследование' }).click();

  for (let step = 0; step < 3; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }

  const finalPrologueAction = page.locator('.premium-prologue-card .premium-cta');
  await expect(finalPrologueAction).toContainText('Перейти к первому действию');
  await finalPrologueAction.click();

  const onboarding = page.locator('.player-onboarding');
  await expect(onboarding).toBeVisible();
  await expect(onboarding).toHaveClass(/focused-first-action/);
  await expect(onboarding).toHaveAttribute('aria-label', 'Ваше первое действие');
  await expect(onboarding).toContainText('Осмотрите номер 314');
  await expect(onboarding).toContainText('Пока не нужно разбираться во всём штабе');
  await expect(onboarding).toContainText('На фотографии будут отмечены четыре зоны');
  await expect(onboarding).toContainText('Когда осмотр закончится, игра сама покажет следующее действие');
  await expect(onboarding.locator('.player-onboarding-grid')).toBeHidden();

  const firstAction = onboarding.getByRole('button', { name: /^Осмотреть номер 314/ });
  await expect(firstAction).toBeVisible();
  await expect(onboarding.getByRole('button', { name: 'Открыть весь штаб без обучения' })).toBeVisible();
  await firstAction.click();

  await expect(onboarding).toHaveCount(0);
  await expect(page.locator('.evidence-e001')).toBeVisible();

  const floating = page.locator('.player-guide-floating');
  await expect(floating).toBeVisible();
  await expect(floating).toContainText('Понять, что произошло в запертом номере');
  await expect(floating).toContainText('Осмотрите четыре отмеченные зоны номера 314');
  await expect(floating).toContainText('Осмотрено зон: 0/4');
  await expect(floating.getByRole('button', { name: /Следующий шаг: Начать с осмотра номера 314/ })).toBeVisible();

  await page.getByRole('button', { name: 'Осмотреть Окно' }).click();
  await expect(floating).toContainText('Осмотрено зон: 1/4');
  await expect(floating.getByRole('button', { name: /Следующий шаг: Продолжить осмотр номера/ })).toBeVisible();

  await floating.getByRole('button', { name: 'Объяснить' }).click();
  const help = page.locator('.player-guide-panel');
  await expect(help).toBeVisible();
  await expect(help).toContainText('Навигационная помощь');
  await expect(help).toContainText('Осмотрите четыре отмеченные зоны номера 314');
  await expect(help).toContainText('Она не раскрывает правильную детективную версию');
});

test('проводник показывает следующий архивный шаг прямо на игровом поле', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem('dbr:dbr_001_room_314:0.2.0', JSON.stringify({
      phase: 'hq',
      prologueIndex: 3,
      activeTab: 'evidence',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [],
      discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
      selectedHypotheses: [],
      puzzleAnswers: { E004: '23:50' },
      checkpointAnswerId: 'other_route',
      act1Complete: true,
      startedAt: '2026-08-10T00:00:00.000Z'
    }));
  });

  await page.goto('./?release=e2e-player-guidance-act2');
  await page.locator('.commercial-launch').getByRole('button', { name: 'Продолжить расследование' }).click();

  const floating = page.locator('.player-guide-floating');
  await expect(floating).toContainText('Проверить, существовал ли другой путь между номерами 312 и 314');
  await expect(floating).toContainText('Изучите архивный план этажа');
  await expect(floating.getByRole('button', { name: /Следующий шаг: Открыть архивный план/ })).toBeVisible();

  await floating.getByRole('button', { name: 'Объяснить' }).click();
  const help = page.locator('.player-guide-panel');
  await expect(help).toContainText('Проверено отметок на плане: 0/3');
  await expect(help.getByRole('button', { name: 'Открыть архивный план' })).toBeVisible();
});
