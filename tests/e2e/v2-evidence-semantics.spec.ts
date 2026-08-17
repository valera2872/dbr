import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';

const core = {
  phase: 'hq', prologueIndex: 3, activeTab: 'case',
  seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
  flaggedEvidenceIds: [],
  inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
  seenDialogueTopicIds: [],
  discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
  selectedHypotheses: [], puzzleAnswers: { E004: '23:50' },
  checkpointAnswerId: 'other_route', act1Complete: true,
  startedAt: '2026-08-17T00:00:00.000Z'
};

const act2 = {
  plan: ['wall', 'stamp', 'width'],
  room: ['panel', 'tracks', 'envelope', 'fibres'],
  questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
};

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-v2-evidence-semantics');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(page.locator('.premium-app')).toBeVisible();
}

async function openTab(page: Page, label: string) {
  const tab = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: label }).first();
  await expect(tab).toBeVisible();
  await tab.click();
}

test('E008 доказывает происхождение и конфликт, но не выдаёт историческую ответственность Кирилла', async ({ page }) => {
  await page.addInitScript(({ CORE, ACT2, ACT3, ACT4, core, act2 }) => {
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem(CORE, JSON.stringify(core));
    localStorage.setItem(ACT2, JSON.stringify(act2));
    localStorage.setItem(ACT3, JSON.stringify({
      archive: [], identity: [], questions: ['agency3:archive-requested'], checkpointAnswer: null, complete: false
    }));
    localStorage.setItem(ACT4, JSON.stringify({ search: [], card: [], wrongAnswers: [], complete: false, finalAnswer: null }));
  }, { CORE, ACT2, ACT3, ACT4, core, act2 });

  await continueCase(page);
  await openTab(page, 'Материалы');
  const card = page.locator('[data-evidence-id="E008"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('без преждевременного назначения виновного');
  await card.click();

  const modal = page.locator('.react-case-modal.evidence-e008');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('не окончательную личность ответственного');
  const points = modal.locator('.react-point-list > button');
  await expect(points).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await points.nth(index).click();

  await expect(modal).toContainText('Неполная расшифровка конфликта');
  await expect(modal).toContainText('E008 ещё не доказывает, что этим человеком был Кирилл');
  await expect(modal).not.toContainText('Антон спорил с Кириллом');
});

test('E009 оставляет Веру реальным подозреваемым, а не автоматически оправдывает её', async ({ page }) => {
  await page.addInitScript(({ CORE, ACT2, ACT3, ACT4, core, act2 }) => {
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem(CORE, JSON.stringify(core));
    localStorage.setItem(ACT2, JSON.stringify(act2));
    localStorage.setItem(ACT3, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: [],
      questions: ['agency3:archive-requested', 'agency3:trace-custody', 'agency3:denis-family', 'agency3:id-elena', 'agency3:identity-requested'],
      checkpointAnswer: null,
      complete: false
    }));
    localStorage.setItem(ACT4, JSON.stringify({ search: [], card: [], wrongAnswers: [], complete: false, finalAnswer: null }));
  }, { CORE, ACT2, ACT3, ACT4, core, act2 });

  await continueCase(page);
  await openTab(page, 'Материалы');
  const card = page.locator('[data-evidence-id="E009"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Скрытая личность не равна виновности');
  await card.click();

  const modal = page.locator('.react-case-modal.evidence-e009');
  await expect(modal).toBeVisible();
  const points = modal.locator('.react-point-list > button');
  await expect(points).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await points.nth(index).click();

  await expect(modal.locator('.case001-v2-vera-context')).toContainText('имела собственный конфликт с Ильёй');
  await modal.getByRole('button', { name: /Денис: почему отсутствует B-17/ }).click();
  await modal.getByRole('button', { name: /Елена: ваше настоящее имя — Вера Белова/ }).click();
  await expect(modal).toContainText('спорила с Ильёй');

  const checkpoint = modal.locator('.react-checkpoint');
  const correct = checkpoint.getByRole('button', { name: /обе лжи реальны, но пока не устанавливают человека/ });
  await expect(correct).toBeVisible();
  await correct.click();
  await expect(checkpoint).toContainText('ни одна сама не устанавливает человека, физически находившегося в 314');
});

test('микрослед E001 превращается в независимое доказательство присутствия Кирилла', async ({ page }) => {
  await page.addInitScript(({ CORE, ACT2, ACT3, ACT4, core, act2 }) => {
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
    localStorage.setItem(CORE, JSON.stringify(core));
    localStorage.setItem(ACT2, JSON.stringify(act2));
    localStorage.setItem(ACT3, JSON.stringify({
      archive: [], identity: [], questions: ['v2:desk-sampled'], checkpointAnswer: null, complete: false
    }));
    localStorage.setItem(ACT4, JSON.stringify({ search: [], card: [], wrongAnswers: [], complete: false, finalAnswer: null }));
  }, { CORE, ACT2, ACT3, ACT4, core, act2 });

  await continueCase(page);

  await openTab(page, 'Люди');
  const kirill = page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' });
  await expect(kirill).toContainText('свежий пластырь на правой кисти');
  await openTab(page, 'Дело');

  const proof = page.locator('.case001-v2-actor-proof');
  await expect(proof).toBeVisible();
  await expect(proof).toContainText('Чей микрослед остался в затёртой зоне?');
  await proof.getByRole('button', { name: /Осмотреть участников на свежие повреждения/ }).click();
  await expect(proof).toContainText('Свежая рана обнаружена только у Кирилла');

  await proof.getByRole('button', { name: /Сравнить микрослед/ }).nth(0).click();
  await expect(proof).toContainText('Профиль контрольного образца Марины не совпадает');
  await proof.locator('[data-v2-compare="kirill"]').click();

  await expect(proof).toContainText('Кирилл физически был в номере 314');
  await expect(proof).toContainText('ДНК-профиль микроследа совпадает');
  await expect(proof).toContainText('само по себе ещё не доказывает мотив и весь маршрут');

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT3);
  expect(saved.questions).toEqual(expect.arrayContaining([
    'v2:desk-sampled',
    'v2:injury-scan',
    'v2:kirill-cut-observed',
    'v2:trace-compare-marina',
    'v2:trace-compare-kirill',
    'v2:trace-kirill-match'
  ]));
});
