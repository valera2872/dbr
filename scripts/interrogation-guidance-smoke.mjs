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

check(['0.8.8','0.8.9','0.9.0'].includes(pkg.version), 'Interrogation guidance должна сохраняться в релизах 0.8.8+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(exists('src/interrogationGuidance.ts'), 'Нет runtime-подсказки допроса');
check(exists('src/interrogationGuidance.css'), 'Нет стилей маршрута допроса');
check(exists('tests/e2e/interrogation-guidance.spec.ts'), 'Нет браузерного теста раннего допроса');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает guidance runtime');
check(main.includes("./interrogationGuidance.css"), 'main.tsx не подключает guidance CSS');
check(main.indexOf("./interrogationGuidance';") < main.indexOf("./interactiveInterrogation';"), 'Guidance должен регистрироваться до перехвата карточки Кирилла');

[
  'Зафиксировать алиби',
  'Найти и предъявить основания',
  'Разрушить алиби',
  'Дальше нужны факты, а не догадки',
  'Закрыть допрос и открыть отчёт №1',
  'Идея скрытого маршрута должна возникнуть из плана и следов',
  'план раскрывает существование прохода',
  'Перейти к спасательной операции'
].forEach((token) => check(guide.includes(token), `Guidance runtime не содержит: ${token}`));

check(guide.includes("const QUESTION_IDS = ['alibi']"), 'Ранний допрос должен требовать только обоснованный вопрос об алиби');
check(guide.includes("['passage', 'anton']"), 'Будущие гипотезы не скрываются из ранней линии вопросов');
check(guide.includes('button.hidden = true'), 'Преждевременные вопросы остаются видимыми');
check(!guide.includes('new MutationObserver'), 'Guidance runtime не должен создавать MutationObserver');
check(!guide.includes('setInterval'), 'Guidance runtime не должен использовать polling');
check(guide.includes('requestAnimationFrame'), 'Guidance runtime не синхронизируется с перерисовкой допроса');
check(guide.includes('guide.dataset.guideSignature !== signature'), 'Guidance пересоздаёт кнопку без изменения состояния');
check(css.includes('.interrogation-guide-steps'), 'Нет визуальной шкалы этапов');
check(css.includes('.interrogation-premise-note'), 'Нет объяснения логики появления вопросов');
check(css.includes('.next-guided-evidence'), 'Следующее доказательство не подсвечивается');
check(css.includes('@media (max-width: 980px)'), 'Маршрут допроса не адаптирован под телефон');

[
  'Базовое алиби зафиксировано',
  'data-ask="passage"',
  'toBeHidden()',
  'открыть отчёт №1',
  'data-interrogation-guide-route="case"',
  'После отчёта №1',
  'checkpoint-panel'
].forEach((token) => check(test.includes(token), `Браузерный тест не проверяет: ${token}`));

if (failures.length) {
  console.error('\nInterrogation guidance smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nInterrogation guidance smoke passed: the detective asks only grounded questions; the passage and Anton conflict are introduced by evidence, not spoiled in advance.');
