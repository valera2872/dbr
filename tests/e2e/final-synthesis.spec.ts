import { expect, test, type Page } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function seedFinal(page: Page) {
  await page.addInitScript(({ core, act2, act3, act4, interrogation }) => {
    localStorage.setItem(core, JSON.stringify({
      phase: 'hq', prologueIndex: 3, activeTab: 'case',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [], discoveredFactIds: ['F001','F002','F003','F004','F005','F006','F007'],
      selectedHypotheses: [], puzzleAnswers: { E004: '23:50' }, checkpointAnswerId: 'other_route',
      act1Complete: true, startedAt: '2026-08-17T00:00:00.000Z'
    }));
    localStorage.setItem(act2, JSON.stringify({
      plan: ['wall','stamp','width'], room: ['panel','tracks','envelope','fibres'],
      questions: ['agency:wall','agency:renovation','agency:plan-requested']
    }));
    localStorage.setItem(act3, JSON.stringify({
      archive: ['catalog','contact','audio','custody'], identity: ['registration','festival','message'],
      questions: ['agency3:archive-requested','agency3:trace-custody','agency3:denis-family','agency3:id-elena','agency3:identity-requested','d-original','v-name'],
      checkpointAnswer: 'separate_lies', complete: true
    }));
    localStorage.setItem(interrogation, JSON.stringify({
      stage: 'broken', asked: ['alibi'], presented: ['plan','panel','tracks','audio'], transcript: [], wrongConclusions: [], complete: true
    }));
    localStorage.setItem(act4, JSON.stringify({
      search: ['entry','ilya','medical','lamp'], card: ['serial','copy','clip','integrity'],
      finalAnswer: null, wrongAnswers: [], complete: false,
      startedAt: '2026-08-17T00:20:00.000Z', completedAt: null
    }));
    localStorage.setItem('dbr:player-guidance:onboarding:v1', '1');
  }, { core: CORE, act2: ACT2, act3: ACT3, act4: ACT4, interrogation: INTERROGATION });
}

async function continueCase(page: Page) {
  await page.goto('./?release=e2e-final-synthesis');
  const launch = page.locator('.commercial-launch');
  await expect(launch.getByRole('button', { name: 'Продолжить расследование' })).toBeVisible();
  await launch.getByRole('button', { name: 'Продолжить расследование' }).click();
  await expect(page.locator('.premium-app')).toBeVisible();
}

async function choose(page: Page, groupTitle: RegExp, option: RegExp) {
  const group = page.locator('.final-synthesis-group').filter({ hasText: groupTitle });
  await expect(group).toBeVisible();
  await group.getByRole('button', { name: option }).click();
}

test('финальное обвинение собирается из шести частей и слабая связка получает логический отказ', async ({ page }) => {
  await seedFinal(page);
  await continueCase(page);

  const synthesis = page.locator('.final-synthesis');
  await expect(synthesis).toBeVisible();
  await expect(synthesis).toContainText('Соберите обвинение из доказанных частей');
  await expect(page.locator('.react-final-panel')).toBeHidden();
  await expect(page.locator('.react-next-action')).toBeHidden();

  const guide = page.locator('.player-guide-floating');
  await expect(guide).toContainText('Соберите собственную доказательную цепочку');
  await expect(guide).toContainText('Готового финального ответа нет');
  await expect(guide).not.toContainText('Открыть финальный отчёт');
  await expect(guide.getByRole('button', { name: 'Открыть сборку обвинения' })).toBeVisible();
  await expect(guide.locator('.player-guide-explain')).toBeHidden();

  await choose(page, /Кто совершил действия/, /Кирилл Бессонов/);
  await choose(page, /Как был преодолён/, /служебный проём между 312 и 314/);
  await choose(page, /Зачем нападавшему/, /Получить носитель B-17/);
  await choose(page, /доказанная роль Кирилла/, /знал об опасном открытом служебном маршруте/);

  // Deliberately choose evidence that only excludes ordinary exits but does not prove the hidden route.
  await choose(page, /Какая пара материалов доказывает способ/, /E003 журнал замка \+ E004 коридорная камера/);
  await choose(page, /Какая пара материалов связывает нападение/, /E008 цепочка оригинала \+ E011 подлинная карта/);

  await expect(synthesis).toContainText('6/6');
  await synthesis.getByRole('button', { name: /Проверить доказательную цепочку/ }).click();
  await expect(synthesis.locator('.final-synthesis-feedback')).toContainText('не доказывает сам путь проникновения');

  let saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT4);
  expect(saved.complete).toBe(false);
  expect(saved.wrongAnswers).toContain('synthesis-1');

  // Repair only the unsupported link; no correct answer is injected by the UI.
  await choose(page, /Какая пара материалов доказывает способ/, /E006 старый план \+ E007 свежие следы/);
  await synthesis.getByRole('button', { name: /Проверить доказательную цепочку/ }).click();

  await expect(page.locator('.act4-report-overlay')).toBeVisible();
  await expect(page.locator('.act4-report')).toContainText('РАССЛЕДОВАНИЕ ЗАВЕРШЕНО');

  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), ACT4);
  expect(saved.finalAnswer).toBe('kirill_responsibility');
  expect(saved.complete).toBe(true);
  expect(saved.wrongAnswers).toContain('synthesis-1');
});
