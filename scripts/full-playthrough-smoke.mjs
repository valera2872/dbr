import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const build = read('src/build.ts');
const sw = read('public/sw.js');
const main = read('src/main.tsx');
const returnBridge = read('src/completedCaseReturn.ts');
const actorProof = read('src/KirillActorProofV2.tsx');
const test = read('tests/e2e/full-playthrough.spec.ts');
const actorTest = read('tests/e2e/kirill-actor-proof.spec.ts');

const versionParts = String(pkg.version).split('.').map((part) => Number.parseInt(part, 10));
const [major = 0, minor = 0, patch = 0] = versionParts;
const supportsFullPlaythrough = major > 0 || minor > 8 || (minor === 8 && patch >= 8);
check(supportsFullPlaythrough, 'Полный playthrough должен сохраняться в релизах 0.8.8+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(sw.includes(`dbr-v${pkg.version.replaceAll('.', '-')}`), 'Service worker не использует текущий cache key');
check(exists('dist/index.html'), 'Production bundle не создан');
check(exists('tests/e2e/full-playthrough.spec.ts'), 'Отсутствует полный браузерный маршрут');
check(exists('tests/e2e/kirill-actor-proof.spec.ts'), 'Отсутствует браузерная регрессия actor proof');
check(exists('src/KirillActorProofV2.tsx'), 'Отсутствует individualized actor proof Кирилла');
check(exists('src/completedCaseReturn.ts'), 'Отсутствует механизм возврата к итоговому отчёту');

for (const id of ['E001','E002','E003','E004','E005','E006','E007','E008','E009','E011']) {
  check(test.includes(id), `Полный маршрут не фиксирует ${id}`);
}
check(test.includes("saved.act4.search"), 'V2 rescue / E010-equivalent search state не проверяется');

[
  'Начать расследование',
  'one-corridor-event[data-time="23:50"]',
  'one-corridor-event[data-time="00:17"]',
  'cameraAnswers.nth(2)',
  'Известные пути выхода не объясняют исчезновение',
  'Повторно осмотреть шкаф и общую стену',
  'Уточнить историю ремонтов этажа',
  'Запросить обмерный план до реконструкции',
  'agency:plan-requested',
  'Старая сеть связывала 312 / 314 со служебной зоной',
  'Маршрут найден. Исполнитель — ещё нет.',
  'Обыскать ветку P3 \\/ S-3',
  'Илья жив. Но дело ещё не раскрыто.',
  'Поднять акт реконструкции 2015',
  'Запросить журнал M3',
  'Взять микрослед с затёртой зоны',
  'Проверить участников на свежие повреждения',
  'Уточнить повреждение',
  'Сопоставить микрослед с образцом Кирилла',
  'Запросить контрольный образец и STR-анализ',
  'actor:kirill-hand-observed',
  'actor:kirill-str-match',
  'actor:kirill-presence-proven',
  'Физическое присутствие индивидуализировано',
  'Запросить BOX 15-B \\/ журнал оцифровки',
  'Проверить Елену Ветрову',
  'agency3:identity-requested',
  'data-e009-identity-v2',
  'Предъявить сопоставление Елене',
  'identity-v2-opportunity-list',
  'e009:vera-corridor',
  'e009:vera-device',
  'e009:vera-route',
  'Вера — реальный источник B-17',
  'data-conclusion="route"',
  'final-synthesis',
  'E006 старый план \\+ E007 свежие следы',
  'E008 цепочка оригинала \\+ E011 подлинная карта',
  'Проверить доказательную цепочку',
  'РАССЛЕДОВАНИЕ ЗАВЕРШЕНО',
  'Открыть итог дела',
  'page.close()',
  'context.newPage()',
  'runtimeErrors'
].forEach((token) => check(test.includes(token), `Полный маршрут не содержит контроль: ${token}`));

[
  'HAND_OBSERVED',
  'STR_MATCH',
  'PRESENCE_PROVEN',
  "detail?.source !== 'e009-v2'",
  'state.checkpointAnswer === VERA_CHECKPOINT',
  'не устанавливает маршрут',
  'не формулирует обвинение'
].forEach((token) => check(actorProof.includes(token), `Actor proof не содержит контроль: ${token}`));

[
  'микрослед индивидуализирует Кирилла только после наблюдения и сравнительного анализа',
  'новый отчёт E009 не закрывает Act III без actor proof',
  'actor:kirill-presence-proven',
  'expect(stored.complete).toBe(false)'
].forEach((token) => check(actorTest.includes(token), `Actor proof E2E не проверяет: ${token}`));

['CORE', 'ACT2', 'ACT3', 'INTERROGATION', 'ACT4'].forEach((token) => {
  check(test.includes(token), `Полный маршрут не проверяет сохранение ${token}`);
});

check(main.includes("from './completedCaseReturn'"), 'main.tsx не подключает возврат к итоговому отчёту');
check(main.includes('installCompletedCaseReturn()'), 'Мост завершённого дела не установлен');
check(main.includes('FinalSynthesis'), 'main.tsx не монтирует player-built final synthesis');
check(main.includes('installIdentityEvidenceV2()'), 'main.tsx не устанавливает E009 v2 identity workspace');
check(main.includes('installKirillActorProofV2()'), 'main.tsx не устанавливает individualized actor proof');
check(returnBridge.includes(".react-final-panel button"), 'Мост не открывает React-отчёт');
check(returnBridge.includes("'.premium-sidebar button, .premium-mobile-nav button'"), 'Мост не умеет вернуться в раздел «Дело»');
check(returnBridge.includes('MAX_FRAMES = 90'), 'Ожидание React-отчёта не ограничено');
check(!returnBridge.includes('new MutationObserver'), 'Мост возврата не должен создавать MutationObserver');
check(!returnBridge.includes('setInterval'), 'Мост возврата не должен использовать polling');

check(!test.includes('addInitScript'), 'Полный маршрут не должен подменять исходное состояние через addInitScript');
check(!test.includes('localStorage.setItem'), 'Полный маршрут не должен предварительно записывать прогресс');
check(test.includes('test.setTimeout(120_000)'), 'Полный маршрут не имеет собственного лимита времени');
check(test.includes('desktop-chromium'), 'Полный маршрут не закреплён за детерминированным desktop-профилем');

if (failures.length) {
  console.error('\nFull playthrough smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nFull playthrough smoke passed: the clean route now earns Kirill identity proof from an observed injury + E001 microtrace before the key interrogation and still reaches the epilogue.');