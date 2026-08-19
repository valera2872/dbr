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
const agency = read('src/investigationAgencyInterrogation.ts');
const css = read('src/interrogationGuidance.css');
const test = read('tests/e2e/interrogation-guidance.spec.ts');
const agencyTest = read('tests/e2e/interrogation-agency.spec.ts');

const [major = 0, minor = 0, patch = 0] = String(pkg.version).split('.').map((part) => Number.parseInt(part, 10));
const supportsGuidance = major > 0 || minor > 8 || (minor === 8 && patch >= 8);
check(supportsGuidance, 'Interrogation premise guidance должна сохраняться в релизах 0.8.8+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(exists('src/interrogationGuidance.ts'), 'Нет runtime-проверки предпосылок допроса');
check(exists('src/investigationAgencyInterrogation.ts'), 'Нет player-led слоя допроса');
check(exists('src/interrogationGuidance.css'), 'Нет стилей маршрута допроса');
check(exists('tests/e2e/interrogation-guidance.spec.ts'), 'Нет браузерного теста раннего допроса');
check(exists('tests/e2e/interrogation-agency.spec.ts'), 'Нет браузерного теста самостоятельного допроса');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает premise guidance runtime');
check(main.includes("./investigationAgencyInterrogation"), 'main.tsx не подключает player-led interrogation runtime');
check(main.indexOf("./interrogationGuidance';") < main.indexOf("./interactiveInterrogation';"), 'Premise guidance должен регистрироваться до перехвата карточки Кирилла');

[
  'Зафиксировать алиби', 'Дальше нужны факты, а не догадки',
  'Закрыть допрос и открыть отчёт №1', 'Ключевое противоречие доказано',
  'не создаёт местонахождение Ильи'
].forEach((token) => check(guide.includes(token), `Premise guidance runtime не содержит: ${token}`));
check(!guide.includes('Кирилл указал новое место поиска'), 'Legacy guidance снова делает признание источником поиска Ильи');
check(!guide.includes('Перейти к спасательной операции'), 'Legacy guidance снова confession-gates спасательную операцию');

check(guide.includes("const QUESTION_IDS = ['alibi']"), 'Ранний допрос должен требовать только обоснованный вопрос об алиби');
check(guide.includes("['passage', 'anton']"), 'Преждевременные вопросы не скрываются из ранней линии');
check(guide.includes('button.hidden = true'), 'Преждевременные вопросы остаются видимыми');
check(!guide.includes('new MutationObserver'), 'Premise guidance не должен создавать MutationObserver');
check(!guide.includes('setInterval'), 'Premise guidance не должен использовать polling');
check(guide.includes('requestAnimationFrame'), 'Premise guidance не синхронизируется с перерисовкой допроса');
check(css.includes('.interrogation-premise-note'), 'Нет объяснения границы знания следователя');

[
  'Правильный порядок не показывается',
  'removeGuidedEvidenceHighlight',
  'Будущие доказательства и их названия здесь не показываются',
  'key-complete',
  'Признание подтверждает, а не создаёт доказательства'
].forEach((token) => check(agency.includes(token), `Player-led interrogation не нейтрализует старые подсказки: ${token}`));

[
  'Базовое алиби зафиксировано', 'data-ask="passage"', 'toBeHidden()', 'открыть отчёт №1',
  'data-interrogation-guide-route="case"', 'После отчёта №1', 'checkpoint-panel'
].forEach((token) => check(test.includes(token), `Браузерный тест premise guidance не проверяет: ${token}`));
[
  'Правильный порядок не показывается',
  'next-guided-evidence',
  'В этом фрагменте нет имён',
  'data-present="presence"',
  'Версия Кирилла разрушена'
].forEach((token) => check(agencyTest.includes(token), `Браузерный тест player-led допроса не проверяет: ${token}`));

if (failures.length) {
  console.error('\nInterrogation guidance smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nInterrogation guidance smoke passed: factual premises, proof boundaries and player-led evidence strategy remain protected in v${pkg.version}.`);
