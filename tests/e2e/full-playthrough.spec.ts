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

async function chooseFinal(page: Page, groupTitle: RegExp, option: RegExp) {
  const group = page.locator('.final-synthesis-group').filter({ hasText: groupTitle });
  await expect(group).toBeVisible();
  await group.getByRole('button', { name: option }).click();
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

  // ACT II — the player earns the historical topology and verifies present-day usability.
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
  await expect(page.locator('.react-case-modal.evidence-e006')).toContainText('Старая сеть связывала 312 / 314 со служебной зоной');
  await expect(page.locator('.react-case-modal.evidence-e006')).toContainText('P3');
  await closeEvidence(page);

  await expect(page.locator('[data-evidence-id="E007"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E007"]').click();
  await clickEvery(page.locator('.react-case-modal.evidence-e007 .act2-room-marker'));
  await expect(page.locator('.react-case-modal.evidence-e007')).toContainText('Сеть использовали этой ночью');
  await expect(page.locator('.react-case-modal.evidence-e007')).toContainText('Кто именно вошёл в сеть — пока не доказано');
  await closeEvidence(page);

  // V2 branching — route discovery opens independent investigative questions instead of naming Kirill.
  await openTab(page, 'Дело');
  const branch = page.locator('.case001-v2-branch-panel');
  await expect(branch).toBeVisible();
  await expect(branch).toContainText('Маршрут найден. Исполнитель — ещё нет.');

  // Rescue is earned from E005 + E006 + E007 before any confession.
  await branch.getByRole('button', { name: /Обыскать ветку P3 \/ S-3/ }).click();
  const earlySearch = page.locator('.case001-v2-search-modal');
  await expect(earlySearch).toBeVisible();
  await clickEvery(earlySearch.locator('.case001-v2-search-point'));
  await expect(earlySearch).toContainText('Илья жив. Но дело ещё не раскрыто.');
  await expect(earlySearch).toContainText('Личность нападавшего');
  await earlySearch.getByRole('button', { name: /Вернуться к параллельным версиям/ }).click();

  // Marina is a productive competing hypothesis: her building lie is real, but M3 did not open at night.
  await branch.getByRole('button', { name: /Поднять акт реконструкции 2015/ }).click();
  await expect(branch).toContainText('Старую сеть закрыли не полностью');
  await branch.getByRole('button', { name: /Запросить журнал M3/ }).click();
  await expect(branch).toContainText('M3 ночью не открывался');
  await expect(branch).toContainText('не фиксирует ни одного открытия');

  // The early wiped trace is preserved without prematurely naming its owner.
  await branch.getByRole('button', { name: /Взять микрослед с затёртой зоны/ }).click();
  await expect(branch).toContainText('Микрослед со стола сохранён для сравнения');

  // Archive provenance is now justified by the empty case + Ilya's purpose + Denis's role, not an envelope in 312.
  await branch.getByRole('button', { name: /Запросить BOX 15-B \/ журнал оцифровки/ }).click();
  await expect(page.locator('.react-case-modal.evidence-e008')).toBeVisible();
  await clickEvery(page.locator('.react-case-modal.evidence-e008 .react-point-list button'));
  await expect(page.locator('.react-case-modal.evidence-e008')).toContainText('Денис скрывал уникальный оригинал B-17');
  await closeEvidence(page);

  // The Vera/Elena line is earned from B-17 custody, then identity and opportunity are tested separately.
  await expect(page.locator('[data-evidence-id="E009"]')).toBeHidden();
  const guide = page.locator('.player-guide-floating');
  await expect(guide).toContainText('Открыть рабочую панель');
  await guide.getByRole('button', { name: /Открыть рабочую панель/ }).click();

  const identityLead = page.locator('.evidence-led-panel[data-evidence-led-mode="identity-lead"]');
  await expect(identityLead).toBeVisible();
  await identityLead.getByRole('button', { name: /Поднять дополнительный лист выдачи носителей/ }).click();
  await expect(identityLead).toContainText('Вера Белова');
  await identityLead.getByRole('button', { name: /Уточнить у Дениса/ }).click();
  await expect(identityLead).toContainText('такого имени среди участников нет');
  await identityLead.getByRole('button', { name: /Проверить Кирилла Бессонова/ }).click();
  await expect(identityLead).toContainText('Подмена личности не обнаружена');
  await identityLead.getByRole('button', { name: /Проверить Елену Ветрову/ }).click();
  await expect(identityLead).toContainText('дата рождения Елены совпадает');
  await identityLead.getByRole('button', { name: /Запросить документы для проверки Елены/ }).click();

  const identityReceived = page.locator('.evidence-led-panel[data-evidence-led-mode="identity-received"]');
  await expect(identityReceived).toContainText('Получены документы Елены');
  await identityReceived.getByRole('button', { name: /Провести документальную сверку/ }).click();

  const e009 = page.locator('.react-case-modal.evidence-e009[data-e009-identity-v2="1"]');
  await expect(e009).toBeVisible();
  await expect(e009).toContainText('Кто она?');
  await expect(e009).toContainText('могла ли она совершить нападение?');
  await clickEvery(e009.locator('.identity-v2-source-list > button'));
  await expect(e009).toContainText('«Елена Ветрова» и Вера Белова — один человек');
  await e009.getByRole('button', { name: /Предъявить сопоставление Елене/ }).click();
  await expect(e009).toContainText('секрет, источник и конфликт');
  await expect(e009).toContainText('ещё не отвечает, где Вера была во время нападения');

  await clickEvery(e009.locator('.identity-v2-opportunity-list button'));
  await expect(e009).toContainText('выход из 307 в гостевой коридор не зафиксирован');
  await expect(e009).toContainText('Связи с номером 307 нет');
  await e009.locator('.identity-v2-checkpoint').getByRole('button', {
    name: /Вера — реальный источник B-17/
  }).click();
  await expect(e009.locator('.identity-v2-checkpoint')).toContainText('Верно');
  await e009.getByRole('button', { name: 'Закрыть' }).click();
  await expect(page.locator('.identity-v2-backdrop')).toHaveCount(0);

  // Evidence-driven interrogation of Kirill.
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

  // ACT IV — Ilya is already rescued; E011 now closes the still-unresolved B-17 evidence line.
  await openTab(page, 'Материалы');
  await expect(page.locator('[data-evidence-id="E011"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E011"]').click();
  await expect(page.locator('.react-case-modal.evidence-e011')).toBeVisible();
  await clickEvery(page.locator('.react-case-modal.evidence-e011 .react-point-list button'));
  await expect(page.locator('.react-case-modal.evidence-e011')).toContainText('Старое дело стало мотивом нападения');
  await page.getByRole('button', { name: /Перейти к обвинению/ }).click();

  // Final accusation is built by the player from six independent parts instead of selecting one pre-written paragraph.
  const synthesis = page.locator('.final-synthesis');
  await expect(synthesis).toBeVisible();
  await chooseFinal(page, /Кто совершил действия/, /Кирилл Бессонов/);
  await chooseFinal(page, /Как был преодолён/, /служебный проём между 312 и 314/);
  await chooseFinal(page, /Зачем нападавшему/, /Получить носитель B-17/);
  await chooseFinal(page, /доказанная роль Кирилла/, /знал об опасном открытом служебном маршруте/);
  await chooseFinal(page, /Какая пара материалов доказывает способ/, /E006 старый план \+ E007 свежие следы/);
  await chooseFinal(page, /Какая пара материалов связывает нападение/, /E008 цепочка оригинала \+ E011 подлинная карта/);
  await expect(synthesis).toContainText('6/6');
  await synthesis.getByRole('button', { name: /Проверить доказательную цепочку/ }).click();

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
  expect(saved.act2.questions).toEqual(expect.arrayContaining([
    'agency:wall', 'agency:renovation', 'agency:plan-requested',
    'v2:marina-closure', 'v2:m3-log'
  ]));
  expect(saved.act2.plan).toEqual(['wall', 'stamp', 'width']);
  expect(saved.act2.room).toEqual(['panel', 'tracks', 'envelope', 'fibres']);
  expect(saved.act3.questions).toEqual(expect.arrayContaining([
    'agency3:archive-requested', 'v2:desk-sampled', 'v2:rescue-complete',
    'agency3:trace-custody', 'agency3:denis-family', 'agency3:id-kirill',
    'agency3:id-elena', 'agency3:identity-requested', 'd-original', 'v-name',
    'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route'
  ]));
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