import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const build = read('src/build.ts');
const main = read('src/main.tsx');
const guide = read('src/interrogationGuidance.ts');
const css = read('src/interrogationGuidance.css');
const test = read('tests/e2e/interrogation-guidance.spec.ts');

check(pkg.version === '0.8.8', 'Interrogation guidance release должен иметь версию 0.8.8');
check(build.includes("APP_BUILD = 'v0.8.8'"), 'APP_BUILD должен быть v0.8.8');
check(exists('src/interrogationGuidance.ts'), 'Нет runtime-подсказки допроса');
check(exists('src/interrogationGuidance.css'), 'Нет стилей маршрута допроса');
check(exists('tests/e2e/interrogation-guidance.spec.ts'), 'Нет браузерного теста раннего допроса');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает guidance runtime');
check(main.includes("./interrogationGuidance.css"), 'main.tsx не подключает guidance CSS');
check(main.indexOf("./interrogationGuidance';") < main.indexOf("./interactiveInterrogation';"), 'Guidance должен регистрироваться до перехвата карточки Кирилла');

[
  'Зафиксировать версию',
  'Собрать и предъявить улики',
  'Разрушить алиби',
  'Сейчас допрос нужно приостановить',
  'Закрыть допрос и открыть отчёт №1',
  'Найти в ${source}',
  'план → панель → физический след → запись Антона',
  'Перейти к спасательной операции E010'
].forEach((token) => check(guide.includes(token), `Guidance runtime не содержит: ${token}`));

check(!guide.includes('new MutationObserver'), 'Guidance runtime не должен создавать MutationObserver');
check(!guide.includes('setInterval'), 'Guidance runtime не должен использовать polling');
check(guide.includes('requestAnimationFrame'), 'Guidance runtime не синхронизируется с перерисовкой допроса');
check(guide.includes('guide.dataset.guideSignature !== signature'), 'Guidance пересоздаёт кнопку без изменения состояния');
check(css.includes('.interrogation-guide-steps'), 'Нет визуальной шкалы этапов');
check(css.includes('.next-guided-evidence'), 'Следующая улика не подсвечивается');
check(css.includes('@media (max-width: 980px)'), 'Маршрут допроса не адаптирован под телефон');

[
  'Вопросы закончены',
  'Открыть отчёт №1',
  'После отчёта №1',
  'checkpoint-panel'
].forEach((token) => check(test.includes(token), `Браузерный тест не проверяет: ${token}`));

if (failures.length) {
  console.error('\nInterrogation guidance smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nInterrogation guidance smoke passed: the early Kirill interview now explains the three-stage route, keeps its action stable and exits directly to report No. 1.');
