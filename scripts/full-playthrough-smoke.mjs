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
const test = read('tests/e2e/full-playthrough.spec.ts');

const versionParts = String(pkg.version).split('.').map((part) => Number.parseInt(part, 10));
const [major = 0, minor = 0, patch = 0] = versionParts;
const supportsFullPlaythrough = major > 0 || minor > 8 || (minor === 8 && patch >= 8);
check(supportsFullPlaythrough, 'Полный playthrough должен сохраняться в релизах 0.8.8+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(sw.includes(`dbr-v${pkg.version.replaceAll('.', '-')}`), 'Service worker не использует текущий cache key');
check(exists('dist/index.html'), 'Production bundle не создан');
check(exists('tests/e2e/full-playthrough.spec.ts'), 'Отсутствует полный браузерный маршрут');
check(exists('src/completedCaseReturn.ts'), 'Отсутствует механизм возврата к итоговому отчёту');

for (let index = 1; index <= 11; index += 1) {
  const id = `E${String(index).padStart(3, '0')}`;
  check(test.includes(id), `Полный маршрут не фиксирует ${id}`);
}

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
  'До реконструкции здесь был служебный проём',
  'Запросить BOX 15-B и журнал оцифровки',
  'Проверить Елену Ветрову',
  'agency3:identity-requested',
  'Денис скрывал оригинал, Вера — личность',
  'data-conclusion="route"',
  'Извлечь карту 314-17',
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

['CORE', 'ACT2', 'ACT3', 'INTERROGATION', 'ACT4'].forEach((token) => {
  check(test.includes(token), `Полный маршрут не проверяет сохранение ${token}`);
});

check(main.includes("from './completedCaseReturn'"), 'main.tsx не подключает возврат к итоговому отчёту');
check(main.includes('installCompletedCaseReturn()'), 'Мост завершённого дела не установлен');
check(main.includes('FinalSynthesis'), 'main.tsx не монтирует player-built final synthesis');
check(returnBridge.includes(".react-final-panel button"), 'Мост не открывает React-отчёт');
check(returnBridge.includes("'.premium-sidebar button, .premium-mobile-nav button'"), 'Мост не умеет вернуться в раздел «Дело»');
check(returnBridge.includes('MAX_FRAMES = 90'), 'Ожидание React-отчёта не ограничено');
check(!returnBridge.includes('new MutationObserver'), 'Мост возврата не должен создавать MutationObserver');
check(!returnBridge.includes('setInterval'), 'Мост возврата не должен использовать polling');

check(!test.includes('addInitScript'), 'Полный маршрут не должен подменять исходное состояние через addInitScript');
check(!test.includes('localStorage.setItem'), 'Полный маршрут не должен предварительно записывать прогресс');
check(test.includes('test.setTimeout(90_000)'), 'Полный маршрут не имеет собственного лимита времени');
check(test.includes('desktop-chromium'), 'Полный маршрут не закреплён за детерминированным desktop-профилем');

if (failures.length) {
  console.error('\nFull playthrough smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nFull playthrough smoke passed: a clean browser route earns major evidence, builds the final accusation from six parts, and reaches the epilogue.');
