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

check(pkg.version === '0.8.6', 'Полный playthrough release должен иметь версию 0.8.6');
check(build.includes("APP_BUILD = 'v0.8.6'"), 'APP_BUILD должен быть v0.8.6');
check(sw.includes('dbr-v0-8-6-full-playthrough'), 'Service worker не использует cache key v0.8.6');
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
  'Другой человек проник в номер и вывел Илью',
  'Денис скрывал оригинал, Вера — личность',
  'data-conclusion="route"',
  'Извлечь карту 314-17',
  'Кирилл пришёл за картой через скрытый проход',
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
check(returnBridge.includes(".react-final-panel button"), 'Мост не открывает React-отчёт');
check(returnBridge.includes("'.premium-sidebar button, .premium-mobile-nav button'"), 'Мост не умеет вернуться в раздел «Дело»');
check(returnBridge.includes('MAX_FRAMES = 90'), 'Ожидание React-отчёта не ограничено');
check(!returnBridge.includes('new MutationObserver'), 'Мост возврата не должен создавать MutationObserver');
check(!returnBridge.includes('setInterval'), 'Мост возврата не должен использовать polling');

check(!test.includes('addInitScript'), 'Полный маршрут не должен подменять исходное состояние через addInitScript');
check(!test.includes('localStorage.setItem'), 'Полный маршрут не должен предварительно записывать прогресс');
check(test.includes('test.setTimeout(90_000)'), 'Полный маршрут не имеет собственного лимита времени');
check(test.includes("desktop-chromium"), 'Полный маршрут не закреплён за детерминированным desktop-профилем');

if (failures.length) {
  console.error('\nFull playthrough smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nFull playthrough smoke passed: a clean browser route covers E001–E011, current E004 reconstruction, both reports, interrogation, rescue, accusation, epilogue and return from a fresh tab.');
