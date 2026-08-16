import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function openTab(page: Page, label: string) {
  const button = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
}

function baseEvidenceCard(page: Page, id: string) {
  return page.locator('.premium-evidence-card').filter({
    has: page.getByText(id, { exact: true })
  }).first();
}

async function closeEvidence(page: Page) {
  const button = page.getByRole('button', { name: /Вернуться в штаб/ }).last();
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('.premium-modal-backdrop')).toHaveCount(0);
}

async function clickEvery(locator: ReturnType<Page['locator']>) {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    await locator.nth(index).click();
  }
}

test('чистое расследование проходит весь маршрут E001–E011 и сохраняет эпилог', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Полный маршрут выполняется один раз в desktop Chromium');
  test.setTimeout(90_000);

  const runtimeErrors: string[] = [];
  const trackErrors = (target: Page) => target.on('pageerror', (error) => runtimeErrors.push(error.message));
  trackErrors(page);

  await page.goto('./?fresh=1&release=e2e-full-playthrough');
  const launch = page.locator('.commercial-launch');
  await expect(launch).toBeVisible();
  await launch.getByRole('button', { name: 'Начать расследование' }).click();

  await expect(page.locator('.premium-prologue')).toBeVisible();
  for (let step = 0; step < 4; step += 1) {
    await page.locator('.premium-prologue-card .premium-cta').click();
  }
  await expect(page.locator('.premium-app')).toBeVisible();
  await expect(page.locator('.player-onboarding')).toBeVisible();
  await page.locator('.player-onboarding .player-guide-secondary').click();
  await expect(page.locator('.player-onboarding')).toHaveCount(0);

  // ACT I — E001–E005 and intermediate report No. 1.
  await openTab(page, 'Материалы');

  await baseEvidenceCard(page, 'E001').click();
  await expect(page.locator('.evidence-e001')).toBeVisible();
  for (const label of ['Окно', 'Письменный стол', 'Сумка', 'Ковёр']) {
    await page.getByRole('button', { name: `Осмотреть ${label}` }).click();
  }
  await expect(page.locator('.evidence-e001 .inspection-progress')).toContainText('4/4');
  await closeEvidence(page);

  for (const id of ['E002', 'E003']) {
    await baseEvidenceCard(page, id).click();
    await expect(page.locator(`.evidence-${id.toLowerCase()}`)).toBeVisible();
    await closeEvidence(page);
  }

  await baseEvidenceCard(page, 'E004').click();
  await expect(page.locator('.evidence-e004')).toBeVisible();
  const cameraEvents = page.locator('.evidence-e004 .one-corridor-event');
  await expect(cameraEvents).toHaveCount(6);
  await page.locator('.evidence-e004 .one-corridor-event[data-time="23:50"]').click();
  await page.locator('.evidence-e004 .one-corridor-event[data-time="00:17"]').click();
  const cameraAnswers = page.locator('.evidence-e004 .camera-question > div > button');
  await expect(cameraAnswers).toHaveCount(4);
  await cameraAnswers.nth(2).click();
  await expect(page.locator('.evidence-e004 .camera-feedback.success')).toBeVisible();
  await closeEvidence(page);

  await baseEvidenceCard(page, 'E005').click();
  await expect(page.locator('.evidence-e005')).toBeVisible();
  await closeEvidence(page);

  await openTab(page, 'Дело');
  await page.getByRole('button', { name: /Известные пути выхода не объясняют исчезновение/ }).click();
  await expect(page.locator('.checkpoint-panel')).toContainText('Вывод подтверждён');

  // ACT II discovery — the investigator earns the old plan instead of receiving it as a scripted next step.
  const agency = page.locator('.investigation-agency-panel[data-agency-mode="lead"]');
  await expect(agency).toBeVisible();
  await expect(page.locator('.react-next-action')).toBeHidden();
  await agency.getByRole('button', { name: /Повторно осмотреть шкаф и общую стену/ }).click();
  await agency.getByRole('button', { name: /Уточнить историю ремонтов этажа/ }).click();
  await expect(agency).toContainText('Третий этаж перестраивали после фестиваля 2015 года');
  await agency.getByRole('button', { name: /Запросить обмерный план до реконструкции/ }).click();

  const received = page.locator('.investigation-agency-panel[data-agency-mode="received"]');
  await expect(received).toContainText('Архив прислал обмерный план 2004 года');
  await received.getByRole('button', { name: /Перейти к полученному материалу/ }).click();

  await expect(page.locator('[data-evidence-id="E006"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E006"]').click();
  await expect(page.locator('.react-case-modal.evidence-e006')).toBeVisible();
  await clickEvery(page.locator('.react-case-modal.evidence-e006 .plan-hotspot'));
  await expect(page.locator('.react-case-modal.evidence-e006')).toContainText('До реконструкции здесь был служебный проём');
  await closeEvidence(page);

  await expect(page.locator('[data-evidence-id="E007"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E007"]').click();
  await clickEvery(page.locator('.react-case-modal.evidence-e007 .act2-room-marker'));
  await expect(page.locator('.react-case-modal.evidence-e007')).toContainText('Маршрут использовали этой ночью');
  await closeEvidence(page);

  // ACT III — E008, E009 and intermediate report No. 2.
  await expect(page.locator('[data-evidence-id="E008"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E008"]').click();
  await clickEvery(page.locator('.react-case-modal.evidence-e008 .react-point-list button'));
  await expect(page.locator('.react-case-modal.evidence-e008')).toContainText('Денис скрывал уникальный оригинал B-17');
  await closeEvidence(page);

  await expect(page.locator('[data-evidence-id="E009"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E009"]').click();
  await clickEvery(page.locator('.react-case-modal.evidence-e009 .react-point-list button'));
  await page.getByRole('button', { name: /Денис: почему отсутствует B-17/ }).click();
  await page.getByRole('button', { name: /Елена: ваше настоящее имя — Вера Белова/ }).click();
  await page.locator('.react-case-modal.evidence-e009 .react-checkpoint').getByRole('button', {
    name: /Денис скрывал оригинал, Вера — личность/
  }).click();
  await expect(page.locator('.react-case-modal.evidence-e009 .react-checkpoint')).toContainText('Верно');
  await closeEvidence(page);

  // Evidence-driven interrogation of Kirill. The passage is introduced by the plan, not by a premature question.
  await openTab(page, 'Люди');
  await page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).click();
  await expect(page.locator('.interrogation-shell')).toBeVisible();
  await expect(page.locator('[data-ask="passage"]')).toBeHidden();
  await expect(page.locator('[data-ask="anton"]')).toBeHidden();
  await page.locator('[data-ask="alibi"]').click();

  for (const id of ['plan', 'panel', 'tracks', 'fibres', 'audio', 'card']) {
    await page.locator(`[data-present="${id}"]`).click();
  }
  await expect(page.locator('.interrogation-contradiction.ready')).toBeVisible();
  await page.locator('[data-conclusion="route"]').click();
  await expect(page.locator('.interrogation-contradiction.complete')).toContainText('Алиби разрушено');
  await page.getByRole('button', { name: 'Закрыть допрос' }).click();

  // ACT IV — E010, E011, accusation and epilogue.
  await openTab(page, 'Материалы');
  await expect(page.locator('[data-evidence-id="E010"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E010"]').click();
  await clickEvery(page.locator('.react-case-modal.evidence-e010 .act4-hotspot'));
  await expect(page.locator('.react-case-modal.evidence-e010')).toContainText('Илья был спрятан живым');
  await page.getByRole('button', { name: /Извлечь карту 314-17/ }).click();

  await expect(page.locator('.react-case-modal.evidence-e011')).toBeVisible();
  await clickEvery(page.locator('.react-case-modal.evidence-e011 .react-point-list button'));
  await expect(page.locator('.react-case-modal.evidence-e011')).toContainText('Старое дело стало мотивом нападения');
  await page.getByRole('button', { name: /Перейти к обвинению/ }).click();

  await expect(page.locator('.react-final-panel')).toBeVisible();
  await page.getByRole('button', { name: /Кирилл пришёл за картой через скрытый проход/ }).click();
  await expect(page.locator('.act4-report-overlay')).toBeVisible();
  await expect(page.locator('.act4-report')).toContainText('РАССЛЕДОВАНИЕ ЗАВЕРШЕНО');
  await expect(page.locator('.act4-report')).toContainText('Следователь высшей категории');

  const saved = await page.evaluate(({ core, act2, act3, interrogation, act4 }) => ({
    core: JSON.parse(localStorage.getItem(core) ?? '{}'),
    act2: JSON.parse(localStorage.getItem(act2) ?? '{}'),
    act3: JSON.parse(localStorage.getItem(act3) ?? '{}'),
    interrogation: JSON.parse(localStorage.getItem(interrogation) ?? '{}'),
    act4: JSON.parse(localStorage.getItem(act4) ?? '{}')
  }), { core: CORE, act2: ACT2, act3: ACT3, interrogation: INTERROGATION, act4: ACT4 });

  expect(saved.core.act1Complete).toBe(true);
  expect(saved.core.checkpointAnswerId).toBe('other_route');
  expect(saved.act2.questions).toEqual(expect.arrayContaining(['agency:wall', 'agency:renovation', 'agency:plan-requested']));
  expect(saved.act2.plan).toEqual(['wall', 'stamp', 'width']);
  expect(saved.act2.room).toEqual(['panel', 'tracks', 'envelope', 'fibres']);
  expect(saved.act3.complete).toBe(true);
  expect(saved.act3.checkpointAnswer).toBe('separate_lies');
  expect(saved.interrogation.asked).toContain('alibi');
  expect(saved.interrogation.complete).toBe(true);
  expect(saved.act4.search).toEqual(['entry', 'ilya', 'medical', 'lamp']);
  expect(saved.act4.card).toEqual(['serial', 'copy', 'clip', 'integrity']);
  expect(saved.act4.finalAnswer).toBe('kirill_responsibility');
  expect(saved.act4.complete).toBe(true);

  await page.screenshot({ path: testInfo.outputPath('completed-case-report.png'), fullPage: true });
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();

  // A new top-level browsing context has fresh sessionStorage but shares the saved case.
  await page.close();
  const returningPage = await context.newPage();
  trackErrors(returningPage);
  await returningPage.goto('./?release=e2e-return-to-completed-case');

  const completedLaunch = returningPage.locator('.commercial-launch');
  await expect(completedLaunch.getByRole('button', { name: 'Открыть итог дела' })).toBeVisible();
  await completedLaunch.getByRole('button', { name: 'Открыть итог дела' }).click();
  await expect(returningPage.locator('.act4-report-overlay')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
