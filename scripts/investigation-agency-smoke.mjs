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
const finalSynthesis = read('src/FinalSynthesis.tsx');
const interrogationCss = read('src/interrogationAgency.css');
const finalCss = read('src/finalSynthesis.css');
const sw = read('public/sw.js');
const interrogationTest = read('tests/e2e/interrogation-agency.spec.ts');
const earlyRescueInterrogationTest = read('tests/e2e/early-rescue-interrogation.spec.ts');
const finalTest = read('tests/e2e/final-synthesis.spec.ts');

const [major = 0, minor = 0] = String(pkg.version).split('.').map((part) => Number.parseInt(part, 10));
check(major > 0 || minor >= 10, 'Investigative agency должна сохраняться в релизах 0.10.0+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(sw.includes(`dbr-v${pkg.version.replaceAll('.', '-')}`), 'Service worker cache не соответствует текущему релизу');
[
  'src/investigationAgency.ts',
  'src/investigationAgencyAct3.ts',
  'src/investigationAgencyAccessibility.ts',
  'src/investigationAgencyInterrogation.ts',
  'src/interrogationAgency.css',
  'src/FinalSynthesis.tsx',
  'src/finalSynthesis.css',
  'tests/e2e/investigative-agency.spec.ts',
  'tests/e2e/evidence-led-chain.spec.ts',
  'tests/e2e/interrogation-agency.spec.ts',
  'tests/e2e/early-rescue-interrogation.spec.ts',
  'tests/e2e/final-synthesis.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('installInvestigationAgency'), 'main.tsx не подключает investigative agency runtime');
check(main.includes('installInvestigationAgencyAct3'), 'main.tsx не подключает evidence-led Act III runtime');
check(main.includes("./investigationAgencyInterrogation"), 'main.tsx не подключает interrogation agency runtime');
check(main.includes("./interrogationAgency.css"), 'main.tsx не подключает interrogation agency CSS');
check(main.includes("./investigationAgencyAccessibility"), 'main.tsx не подключает accessibility guard');
check(main.includes('FinalSynthesis'), 'main.tsx не монтирует player-built final synthesis');
check(main.includes("./finalSynthesis.css"), 'main.tsx не подключает final synthesis CSS');

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
  'agencyFutureHidden',
  'key-complete',
  'Признание подтверждает, а не создаёт доказательства'
].forEach((token) => check(interrogationAgency.includes(token), `Interrogation agency не содержит: ${token}`));
check(interrogationAgency.includes('state.act3.complete'), 'Interrogation agency не использует фактический proof gate Act III');
check(interrogationAgency.includes('!state.interrogation.complete'), 'Interrogation agency не различает незавершённый ранний допрос');
check(!interrogationAgency.includes("stage === 'kirill-interrogation'"), 'Interrogation agency снова зависит от линейного stage и ломает раннее спасение');
check(interrogationAgency.includes('button.disabled'), 'Будущие доказательства не скрываются по фактической доступности');
check(!interrogationAgency.includes('new MutationObserver'), 'Interrogation agency не должен создавать MutationObserver');
check(!interrogationAgency.includes('setInterval'), 'Interrogation agency не должен использовать polling');
check(interrogationCss.includes('.interrogation-agency-brief'), 'Нет визуального briefing допроса');

[
  'Соберите обвинение из доказанных частей',
  'Какая пара материалов доказывает способ проникновения?',
  'Какая пара материалов связывает нападение с B-17?',
  'firstProblem',
  'synthesis-'
].forEach((token) => check(finalSynthesis.includes(token), `Final synthesis не содержит: ${token}`));
check(finalSynthesis.includes("finalAnswer: 'kirill_responsibility'"), 'Final synthesis не сохраняет совместимый итог дела');
check(finalSynthesis.includes('wrongAnswers'), 'Final synthesis не учитывает ошибочные версии');
check(!finalSynthesis.includes('new MutationObserver'), 'Final synthesis не должен создавать MutationObserver');
check(!finalSynthesis.includes('setInterval'), 'Final synthesis не должен использовать polling');
check(finalCss.includes('html[data-final-synthesis="active"] .react-final-panel'), 'Старый готовый финальный ответ остаётся видимым');

[
  'ключевой допрос не показывает правильный порядок и требует замкнуть независимые доказательные семьи',
  'В этом фрагменте нет имён',
  'data-present="presence"',
  'Версия Кирилла разрушена',
  'ранний повторный допрос не раскрывает названия ещё не найденных доказательств',
  'toBeHidden()'
].forEach((token) => check(interrogationTest.includes(token), `Браузерный тест допроса не проверяет: ${token}`));
[
  'раннее спасение Ильи не возвращает предписанный порядок доказательств',
  "toHaveAttribute('data-investigation-agency', 'key')",
  'next-guided-evidence',
  'data-present="plan"'
].forEach((token) => check(earlyRescueInterrogationTest.includes(token), `Регрессия раннего спасения не проверяет: ${token}`));
[
  'финальное обвинение собирается из шести частей',
  'не доказывает сам путь проникновения',
  'synthesis-1',
  'kirill_responsibility'
].forEach((token) => check(finalTest.includes(token), `Браузерный тест финальной реконструкции не проверяет: ${token}`));

check(agencyA11y.includes("setAttribute('aria-label', 'Открыть рабочую панель')"), 'Agency navigation сохраняет устаревший aria-label');

if (failures.length) {
  console.error('\nInvestigative agency smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nInvestigative agency smoke passed: deductions, bounded interrogation proof and final accusation remain player-led in v${pkg.version}.`);
