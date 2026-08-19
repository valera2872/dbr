import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

const core = {
  phase: 'hq',
  prologueIndex: 3,
  activeTab: 'people',
  seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
  flaggedEvidenceIds: [],
  inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
  seenDialogueTopicIds: [],
  discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
  selectedHypotheses: [],
  puzzleAnswers: { E004: '23:50' },
  checkpointAnswerId: 'other_route',
  act1Complete: true,
  startedAt: '2026-08-17T00:00:00.000Z'
};

async function seed(page: Page, act2: unknown, act3: unknown) {
  await page.addInitScript(({ coreKey, act2Key, act3Key, interrogationKey, coreState, act2State, act3State }) => {
    localStorage.setItem(coreKey, JSON.stringify(coreState));
    localStorage.setItem(act2Key, JSON.stringify(act2State));
    localStorage.setItem(act3Key, JSON.stringify(act3State));
    localStorage.setItem(interrogationKey, JSON.stringify({
      stage: 'calm', asked: [], presented: [], transcript: [], wrongConclusions: [], complete: false
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
  }, {
    coreKey: CORE,
    act2Key: ACT2,
    act3Key: ACT3,
    interrogationKey: INTERROGATION,
    coreState: core,
    act2State: act2,
    act3State: act3
  });
}

async function continueAndOpenKirill(page: Page) {
  await page.goto('./?release=e2e-interrogation-agency');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();

  const people = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: 'Люди' }).first();
  await people.click();
  await page.locator('.premium-person-card').filter({ hasText: 'Кирилл Бессонов' }).click();
  await expect(page.locator('.interrogation-shell')).toBeVisible();
}

test('ключевой допрос не показывает правильный порядок и требует замкнуть независимые доказательные семьи', async ({ page }) => {
  await seed(page,
    {
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
    },
    {
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: ['registration', 'festival', 'message'],
      questions: [
        'agency3:envelope', 'agency3:denis-envelope', 'agency3:archive-requested',
        'agency3:trace-custody', 'agency3:denis-family', 'agency3:id-elena',
        'agency3:identity-requested', 'd-original', 'v-name',
        'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route',
        'v2:desk-sampled', 'actor:k:injury-observed', 'actor:k:comparison-requested', 'actor:k:presence-proven'
      ],
      checkpointAnswer: 'separate_lies',
      complete: true
    }
  );
  await continueAndOpenKirill(page);

  const brief = page.locator('.interrogation-agency-brief[data-interrogation-agency-mode="key"]');
  await expect(brief).toBeVisible();
  await expect(brief).toContainText('Проверьте алиби Кирилла своей доказательной цепочкой');
  await expect(brief).toContainText('Правильный порядок не показывается');
  await expect(brief).toContainText('Все уже добытые вами материалы доступны здесь');
  await expect(page.locator('.interrogation-guide')).toBeHidden();
  await expect(page.locator('.interrogation-evidence.next-guided-evidence')).toHaveCount(0);
  await expect(page.locator('.interrogation-control-title small')).toContainText('Выберите доказательство самостоятельно');

  await page.locator('[data-ask="alibi"]').click();

  // Deliberately weak first move. It is allowed, but Kirill correctly narrows what it proves.
  await page.locator('[data-present="audio"]').click();
  await expect(page.locator('.interrogation-transcript')).toContainText('В этом фрагменте нет имён');

  let saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), INTERROGATION);
  expect(saved.presented).toContain('audio');
  expect(saved.complete).toBe(false);
  await expect(page.locator('.interrogation-contradiction.ready')).toHaveCount(0);

  // Route + old context alone is no longer enough. The player must close opportunity,
  // alternative-access, individualized-presence and motive families too.
  for (const id of ['plan', 'panel', 'tracks', 'opportunity', 'm3', 'threat', 'card']) {
    await page.locator(`[data-present="${id}"]`).click();
    await expect(page.locator('.interrogation-evidence.next-guided-evidence')).toHaveCount(0);
  }
  await expect(page.locator('.interrogation-contradiction.ready')).toHaveCount(0);

  await page.locator('[data-present="presence"]').click();
  await expect(page.locator('.interrogation-transcript')).toContainText('16 из 16 локусов');
  await expect(page.locator('.interrogation-contradiction.ready')).toBeVisible();
  await expect(page.locator('.interrogation-contradiction')).toContainText('Связка замкнулась');

  // An overclaim is rejected without completing the interrogation.
  await page.locator('[data-conclusion="presence"]').click();
  await expect(page.locator('.interrogation-transcript')).toContainText('физическое присутствие нельзя автоматически превращать');
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), INTERROGATION);
  expect(saved.complete).toBe(false);

  await page.locator('[data-conclusion="route"]').click();
  await expect(page.locator('.interrogation-contradiction.complete')).toContainText('Версия Кирилла разрушена');
  await expect(page.locator('.interrogation-contradiction.complete')).toContainText('Граница доказательства сохранена');

  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), INTERROGATION);
  expect(saved.complete).toBe(true);
});

test('ранний повторный допрос не раскрывает названия ещё не найденных доказательств', async ({ page }) => {
  await seed(page,
    {
      plan: ['wall', 'stamp', 'width'],
      room: [],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested']
    },
    {
      archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false
    }
  );
  await continueAndOpenKirill(page);

  const brief = page.locator('.interrogation-agency-brief[data-interrogation-agency-mode="mid"]');
  await expect(brief).toBeVisible();
  await expect(brief).toContainText('Будущие доказательства и их названия здесь не показываются');
  await expect(page.locator('.interrogation-guide')).toBeHidden();

  await expect(page.locator('[data-present="opportunity"]')).toBeVisible();
  await expect(page.locator('[data-present="plan"]')).toBeVisible();
  await expect(page.locator('[data-present="panel"]')).toBeHidden();
  await expect(page.locator('[data-present="tracks"]')).toBeHidden();
  await expect(page.locator('[data-present="m3"]')).toBeHidden();
  await expect(page.locator('[data-present="presence"]')).toBeHidden();
  await expect(page.locator('[data-present="card"]')).toBeHidden();
  await expect(page.locator('.interrogation-control-title small')).toHaveText('Показаны только уже найденные материалы. Будущие доказательства скрыты.');
});
