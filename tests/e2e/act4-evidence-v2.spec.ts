import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function seedAct4(page: Page) {
  await page.addInitScript(({ core, act2, act3, act4, interrogation }) => {
    localStorage.setItem(core, JSON.stringify({
      phase: 'hq', prologueIndex: 3, activeTab: 'evidence',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [], discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
      selectedHypotheses: [], puzzleAnswers: { E004: '23:50' }, checkpointAnswerId: 'other_route',
      act1Complete: true, startedAt: '2026-08-19T10:00:00.000Z'
    }));
    localStorage.setItem(act2, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'v2:marina-closure', 'v2:m3-log']
    }));
    localStorage.setItem(act3, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: ['registration', 'festival', 'message'],
      questions: [
        'agency3:archive-requested', 'agency3:trace-custody', 'agency3:denis-family',
        'agency3:id-elena', 'agency3:identity-requested', 'd-original', 'v-name',
        'e009:vera-corridor', 'e009:vera-device', 'e009:vera-route',
        'v2:desk-sampled', 'actor:k:injury-observed', 'actor:k:comparison-requested', 'actor:k:presence-proven'
      ],
      checkpointAnswer: 'separate_lies', complete: true
    }));
    localStorage.setItem(interrogation, JSON.stringify({
      stage: 'broken', asked: ['alibi'],
      presented: ['opportunity', 'plan', 'panel', 'tracks', 'm3', 'presence', 'threat', 'card'],
      transcript: [], wrongConclusions: [], complete: true
    }));
    localStorage.setItem(act4, JSON.stringify({
      search: [], card: [], finalAnswer: null, wrongAnswers: [], complete: false,
      startedAt: null, completedAt: null
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
  }, { core: CORE, act2: ACT2, act3: ACT3, act4: ACT4, interrogation: INTERROGATION });
}

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-act4-evidence-v2');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(page.locator('.premium-app')).toBeVisible();

  const materials = page.locator('.premium-sidebar button:visible, .premium-mobile-nav button:visible').filter({ hasText: 'Материалы' }).first();
  await materials.click();
}

async function clickAllRows(page: Page, modal: string) {
  const rows = page.locator(`${modal} .act4-v2-rows button`);
  const count = await rows.count();
  for (let index = 0; index < count; index += 1) await rows.nth(index).click();
}

test('E010 и E011 отделяют наблюдаемые факты, подлинность и допустимый вывод', async ({ page }) => {
  await seedAct4(page);
  await continueCase(page);

  await expect(page.locator('[data-evidence-id="E010"]')).toBeEnabled();
  await page.locator('[data-evidence-id="E010"]').click();

  const e010 = page.locator('.act4-v2-modal.evidence-e010');
  await expect(e010).toBeVisible();
  await clickAllRows(page, '.act4-v2-modal.evidence-e010');

  await e010.getByRole('button', { name: /Кирилл перенёс Илью сюда/ }).click();
  await expect(e010.locator('.act4-v2-feedback')).toContainText('Слишком сильный вывод');
  await expect(e010.locator('.act4-v2-feedback')).toContainText('не индивидуализирует Кирилла');

  await e010.getByRole('button', { name: /Илью после травмы намеренно изолировали/ }).click();
  await expect(e010).toContainText('Факт сокрытия отделён от личности исполнителя');
  await e010.getByRole('button', { name: /Открыть E011/ }).click();

  const e011 = page.locator('.act4-v2-modal.evidence-e011');
  await expect(e011).toBeVisible();
  await expect(e011).not.toContainText('К. Бессонов · операционная часть');

  await clickAllRows(page, '.act4-v2-modal.evidence-e011');
  await expect(e011).toContainText('К. Бессонов · операционная часть');
  await expect(e011).toContainText('Ранний фрагмент E008 не содержал имени');

  await e011.getByRole('button', { name: 'Кирилл заранее спланировал гибель Антона.' }).click();
  await expect(e011.locator('.act4-v2-feedback')).toContainText('не доказывает заранее подготовленное убийство');

  await e011.getByRole('button', { name: /Перейти к обвинению/ }).click();
  await expect(e011).toHaveCount(0);

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT4);
  expect(saved.search).toEqual(['entry', 'ilya', 'medical', 'lamp', 'e010:bounded-conclusion']);
  expect(saved.card).toEqual(['serial', 'copy', 'clip', 'integrity']);
  expect(saved.complete).toBe(false);

  const synthesis = page.locator('.final-synthesis');
  await expect(synthesis).toBeVisible();
  await expect(synthesis).toContainText('Почему именно Кирилл?');
  await expect(synthesis).toContainText('отсутствие открытия M3');
  await expect(synthesis).toContainText('STR-совпадение микроследа');
  await expect(synthesis).toContainText('0/6');
});
