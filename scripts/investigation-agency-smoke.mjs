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
const agency = read('src/investigationAgency.ts');
const agencyAct3 = read('src/investigationAgencyAct3.ts');
const agencyA11y = read('src/investigationAgencyAccessibility.ts');
const interrogationAgency = read('src/investigationAgencyInterrogation.ts');
const interrogationCss = read('src/interrogationAgency.css');
const sw = read('public/sw.js');
const interrogationTest = read('tests/e2e/interrogation-agency.spec.ts');

check(pkg.version === '0.10.0', 'Investigative agency release должна иметь версию 0.10.0');
check(build.includes("APP_BUILD = 'v0.10.0'"), 'APP_BUILD не обновлён до v0.10.0');
check(sw.includes('dbr-v0-10-0-interrogation-agency'), 'Service worker cache не обновлён до v0.10.0');
[
  'src/investigationAgency.ts',
  'src/investigationAgencyAct3.ts',
  'src/investigationAgencyAccessibility.ts',
  'src/investigationAgencyInterrogation.ts',
  'src/interrogationAgency.css',
  'tests/e2e/investigative-agency.spec.ts',
  'tests/e2e/evidence-led-chain.spec.ts',
  'tests/e2e/interrogation-agency.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('installInvestigationAgency'), 'main.tsx не подключает investigative agency runtime');
check(main.includes('installInvestigationAgencyAct3'), 'main.tsx не подключает evidence-led Act III runtime');
check(main.includes("./investigationAgencyInterrogation"), 'main.tsx не подключает interrogation agency runtime');
check(main.includes("./interrogationAgency.css"), 'main.tsx не подключает interrogation agency CSS');
check(main.includes("./investigationAgencyAccessibility"), 'main.tsx не подключает accessibility guard');

[
  'agency:plan-requested',
  'Запросить обмерный план до реконструкции',
  'Не каждая обязана дать новую улику'
].forEach((token) => check(agency.includes(token), `Act II agency не содержит: ${token}`));
[
  'agency3:archive-requested',
  'agency3:identity-requested',
  'Запросить BOX 15-B и журнал оцифровки',
  'Запросить документы для проверки Елены'
].forEach((token) => check(agencyAct3.includes(token), `Act III agency не содержит: ${token}`));

[
  'Правильный порядок не показывается',
  'Если связка слаба, Кирилл объяснит, чего она не доказывает',
  'Будущие доказательства и их названия здесь не показываются',
  'next-guided-evidence',
  'agencyFutureHidden'
].forEach((token) => check(interrogationAgency.includes(token), `Interrogation agency не содержит: ${token}`));
check(interrogationAgency.includes("stage === 'kirill-interrogation'"), 'Interrogation agency не различает ключевой допрос');
check(interrogationAgency.includes('button.disabled'), 'Будущие доказательства не скрываются по фактической доступности');
check(!interrogationAgency.includes('new MutationObserver'), 'Interrogation agency не должен создавать MutationObserver');
check(!interrogationAgency.includes('setInterval'), 'Interrogation agency не должен использовать polling');
check(interrogationCss.includes('.interrogation-agency-brief'), 'Нет визуального briefing допроса');

[
  'ключевой допрос не показывает правильный порядок доказательств',
  'Старая запись не доказывает, что я куда-либо ходил этой ночью',
  'audio-before-route',
  'ранний повторный допрос не раскрывает названия ещё не найденных доказательств',
  'toBeHidden()'
].forEach((token) => check(interrogationTest.includes(token), `Браузерный тест допроса не проверяет: ${token}`));

check(agencyA11y.includes("setAttribute('aria-label', 'Открыть рабочую панель')"), 'Agency navigation сохраняет устаревший aria-label');

if (failures.length) {
  console.error('\nInvestigative agency smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nInvestigative agency smoke passed: deductions and Kirill interrogation remain player-led in v0.10.0.');
