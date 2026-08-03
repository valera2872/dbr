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
const state = read('src/investigationState.ts');
const fixtures = read('src/routeFixtures.ts');
const pass = read('src/premiumPassV2.ts');
const diagnostics = read('src/stabilityDiagnostics.ts');
const css = read('src/stabilityPass.css');
const sw = read('public/sw.js');
const buildVersion = `APP_BUILD = 'v${pkg.version}'`;
const cacheVersion = `dbr-v${pkg.version.replaceAll('.', '-')}`;

check(/^0\.(?:[89]|[1-9]\d)\./.test(pkg.version), 'Версия должна быть не ниже stability pass 0.8.x');
check(build.includes(buildVersion), `APP_BUILD должен совпадать с package.json: v${pkg.version}`);
check(build.includes('STATE_SCHEMA_VERSION = 1'), 'Не объявлена версия единой схемы состояния');
check(sw.includes(cacheVersion), `Service worker не использует cache key ${cacheVersion}`);

[
  'src/investigationState.ts',
  'src/routeFixtures.ts',
  'src/premiumPassV2.ts',
  'src/stabilityDiagnostics.ts',
  'src/stabilityPass.css',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

const orderedImports = [
  "./freshStart'",
  "./internalMode'",
  "./routeFixtures'",
  "./performanceKernel'",
  "./investigationState'",
  "./premiumPassV2'",
  "./act4FinalOperation'",
  "./stabilityDiagnostics'",
  "./versionGuard'"
];
orderedImports.forEach((entry) => check(main.includes(entry), `main.tsx не подключает ${entry}`));
for (let index = 1; index < orderedImports.length; index += 1) {
  check(main.indexOf(orderedImports[index - 1]) < main.indexOf(orderedImports[index]), `Нарушен порядок загрузки ${orderedImports[index - 1]} → ${orderedImports[index]}`);
}
check(!main.includes("./premiumPass';"), 'Legacy premiumPass не должен загружаться одновременно с v2');

check(state.includes('type RouteStage'), 'Единое состояние не описывает этапы маршрута');
check(state.includes("'kirill-interrogation'"), 'Маршрут не содержит ключевой допрос');
check(state.includes("'act4-search'"), 'Маршрут не содержит E010');
check(state.includes("'act4-card'"), 'Маршрут не содержит E011');
check(state.includes("'complete'"), 'Маршрут не содержит завершение дела');
check(state.includes('ACT4_PREREQUISITES'), 'Нет диагностики преждевременно открытого акта IV');
check(state.includes('ACT4_INCOMPLETE_EVIDENCE'), 'Нет диагностики неполного финального отчёта');
check(!state.includes('new MutationObserver'), 'Единое состояние не должно создавать MutationObserver');
check(!state.includes('setInterval'), 'Единое состояние не должно использовать polling');

['clean', 'act2', 'act3', 'interrogation', 'act4', 'card', 'report', 'complete'].forEach((fixture) => {
  check(fixtures.includes(`fixture === '${fixture}'`) || fixtures.includes("fixture === 'clean'"), `Нет QA-фикстуры ${fixture}`);
});
check(fixtures.includes('INTERNAL_MODE &&'), 'Фикстуры должны быть защищены внутренним режимом');
check(fixtures.includes("params.get('qa') === '1'"), 'Фикстуры должны быть защищены параметром qa=1');
check(fixtures.includes('clearCase()'), 'Фикстуры должны начинаться с детерминированного чистого состояния');

check(pass.includes('subscribeInvestigationState'), 'Premium Pass v2 не подписан на единое состояние');
check(pass.includes('repeat(4') || css.includes('repeat(4'), 'Шкала не показывает четыре акта');
check(pass.includes("'act4-report'"), 'Premium Pass не ведёт к окончательному отчёту');
check(!pass.includes('new MutationObserver'), 'Premium Pass v2 не должен создавать MutationObserver');
check(!pass.includes('setInterval'), 'Premium Pass v2 не должен использовать polling');
check(diagnostics.includes('exportInvestigationState'), 'Диагностика не умеет экспортировать технический снимок');
check(diagnostics.includes('if (INTERNAL_MODE)'), 'Диагностика должна быть скрыта в коммерческом режиме');

const requiredStages = [
  'act1-evidence', 'act1-report', 'act2-plan', 'act2-room', 'act3-archive',
  'act3-identity', 'act3-interviews', 'act3-report', 'kirill-interrogation',
  'act4-search', 'act4-card', 'act4-report', 'complete'
];
requiredStages.forEach((stage) => check(state.includes(`'${stage}'`), `В state model отсутствует этап ${stage}`));

if (failures.length) {
  console.error('\nStability smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nStability smoke passed: unified state schema, migration diagnostics, four-act navigation and deterministic fixtures are present in build ${pkg.version}.`);
