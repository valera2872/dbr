import { expect, test } from '@playwright/test';

const CORE = 'dbr:dbr_001_room_314:0.2.0';
const ACT2 = 'dbr:dbr_001_room_314:act2:v0.5.0';
const ACT3 = 'dbr:dbr_001_room_314:act3:v0.6.0';
const ACT4 = 'dbr:dbr_001_room_314:act4:v0.7.0';
const INTERROGATION = 'dbr:dbr_001_room_314:interrogation:kirill:v0.6.2';

async function seedEvidenceState(page: Parameters<typeof test>[0] extends never ? never : any) {
  await page.addInitScript(({ core, act2, act3, act4, interrogation }) => {
    localStorage.setItem(core, JSON.stringify({
      phase: 'hq', prologueIndex: 3, activeTab: 'case',
      seenEvidenceIds: ['E001', 'E002', 'E003', 'E004', 'E005'],
      flaggedEvidenceIds: [],
      inspectedHotspotIds: ['E001:window', 'E001:desk', 'E001:bag', 'E001:carpet'],
      seenDialogueTopicIds: [], discoveredFactIds: ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007'],
      selectedHypotheses: [], puzzleAnswers: { E004: '23:50' }, checkpointAnswerId: 'other_route',
      act1Complete: true, startedAt: '2026-08-17T08:00:00.000Z'
    }));
    localStorage.setItem(act2, JSON.stringify({
      plan: ['wall', 'stamp', 'width'],
      room: ['panel', 'tracks', 'envelope', 'fibres'],
      questions: ['agency:wall', 'agency:renovation', 'agency:plan-requested', 'agency:archive-requested']
    }));
    localStorage.setItem(act3, JSON.stringify({
      archive: ['catalog', 'contact', 'audio', 'custody'],
      identity: ['registration', 'festival', 'message'],
      questions: ['d-original', 'v-name', 'agency:identity-requested'],
      checkpointAnswer: 'separate_lies', complete: true
    }));
    localStorage.setItem(interrogation, JSON.stringify({
      stage: 'broken', asked: ['alibi'], presented: ['plan', 'panel', 'tracks', 'audio'], transcript: [], wrongConclusions: [], complete: true
    }));
    localStorage.setItem(act4, JSON.stringify({
      search: [], card: [], finalAnswer: null, wrongAnswers: [], complete: false, startedAt: null, completedAt: null
    }));
  }, { core: CORE, act2: ACT2, act3: ACT3, act4: ACT4, interrogation: INTERROGATION });
}

test('E006–E011 используют разные вещественные визуалы вместо повторяющихся прототипных картинок', async ({ page }, testInfo) => {
  await seedEvidenceState(page);
  await page.goto('./?release=e2e-evidence-realism');
  await page.locator('.commercial-launch').getByRole('button', { name: 'Продолжить расследование' }).click();

  const materials = page.locator('.premium-sidebar button, .premium-mobile-nav button').filter({ hasText: 'Материалы' });
  for (let index = 0; index < await materials.count(); index += 1) {
    if (await materials.nth(index).isVisible()) { await materials.nth(index).click(); break; }
  }

  const expected: Record<string, string> = {
    E006: 'e006-plan-photo.svg',
    E007: 'e007-room-312.svg',
    E008: 'e008-archive-photo.svg',
    E009: 'e009-identity-desk.svg',
    E010: 'e010-service-photo.svg',
    E011: 'e011-forensic-photo.svg'
  };

  const resolved = new Set<string>();
  for (const [id, filename] of Object.entries(expected)) {
    const card = page.locator(`[data-evidence-id="${id}"]`);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('data-evidence-realism', 'v2');
    const image = card.locator('img');
    await expect(image).toHaveAttribute('data-evidence-realism', 'v2');
    const source = await image.getAttribute('src');
    expect(source).toContain(filename);
    resolved.add(source ?? '');
  }
  expect(resolved.size).toBe(6);
  await expect(page.locator('html')).toHaveAttribute('data-dbr-evidence-media', 'realism-v2');

  await page.screenshot({ path: testInfo.outputPath('evidence-realism-grid.png'), fullPage: true });

  await page.locator('[data-evidence-id="E007"]').click();
  const roomScene = page.locator('.react-case-modal.evidence-e007 .act2-room-photo');
  await expect(roomScene).toBeVisible();
  await expect(roomScene).toHaveAttribute('data-evidence-realism', 'v2');
  await expect(roomScene).toHaveCSS('background-image', /e007-room-312\.svg/);
});
