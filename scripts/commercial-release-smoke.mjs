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
const launch = read('src/commercialLaunch.ts');
const fixes = read('src/firstPlayerFixes.ts');
const interrogationGuide = read('src/interrogationGuidance.ts');
const act23 = read('src/act23Usability.ts');
const playerGuide = read('src/PlayerGuidance.tsx');
const mediaRuntime = read('src/localMediaRuntime.ts');
const sw = read('public/sw.js');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

check(pkg.version === '0.9.2', 'Коммерческая сборка должна иметь версию 0.9.2');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(sw.includes('dbr-v0-9-2-guided-first-run'), 'Service worker не использует cache key v0.9.2');

[
  'dist/index.html', 'src/internalMode.ts', 'src/commercialLaunch.ts', 'src/AppErrorBoundary.tsx',
  'src/ReactCaseExtension.tsx', 'src/PlayerGuidance.tsx', 'src/playerGuidance.css',
  'src/firstPlayerFixes.ts', 'src/firstPlayerFixes.css', 'src/interrogationGuidance.ts',
  'src/interrogationGuidance.css', 'src/act23Usability.ts', 'src/act23Usability.css',
  'src/localMediaRuntime.ts', 'tests/e2e/commercial-flow.spec.ts', 'tests/e2e/full-playthrough.spec.ts',
  'tests/e2e/first-player-flow.spec.ts', 'tests/e2e/interrogation-guidance.spec.ts',
  'tests/e2e/player-guidance.spec.ts', '.github/workflows/browser-e2e.yml'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

['Продолжить расследование','Начать расследование','Начать заново','Восстановить сохранение','Открыть итог дела','repairSave']
  .forEach((token) => check(launch.includes(token), `Коммерческий экран не содержит: ${token}`));

check(main.includes('AppErrorBoundary'), 'main.tsx не защищён аварийной границей');
check(main.includes('ReactCaseExtension'), 'main.tsx не монтирует React Core');
check(main.includes('PlayerGuidance'), 'main.tsx не монтирует Player Guidance');
check(main.includes("./playerGuidance.css"), 'main.tsx не подключает стили Player Guidance');
check(main.includes("./localMediaRuntime"), 'main.tsx не подключает гибридный медиаслой');
check(main.includes("./firstPlayerFixes"), 'main.tsx не подключает исправления первого прохождения');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает маршрут допроса');
check(main.includes("./act23Usability"), 'main.tsx не подключает маршрут актов II–III');
check(main.includes('installCompletedCaseReturn()'), 'main.tsx не подключает возврат к итоговому отчёту');

check(mediaRuntime.includes('REALISTIC_PRIMARY_MEDIA = true'), 'Реалистичные первичные фото не включены');
check(mediaRuntime.includes('case-001-hybrid-realistic-v1'), 'Гибридный медиапакет не маркирован');
check(!mediaRuntime.includes('new MutationObserver'), 'Медиаслой не должен создавать MutationObserver');
check(!mediaRuntime.includes('setInterval'), 'Медиаслой не должен использовать polling');

check(fixes.includes('Следующий обязательный шаг'), 'После E005 нет понятного маршрута');
check(fixes.includes('Закладки следователя'), 'Кнопка ключевого материала остаётся без объяснения');
check(!fixes.includes('new MutationObserver'), 'First-player слой не должен создавать MutationObserver');
check(!fixes.includes('setInterval'), 'First-player слой не должен использовать polling');

check(interrogationGuide.includes('Дальше нужны факты, а не догадки'), 'Ранний допрос не объясняет границу знания следователя');
check(interrogationGuide.includes('Закрыть допрос и открыть отчёт №1'), 'Из допроса нет прямого перехода к отчёту №1');
check(interrogationGuide.includes("const QUESTION_IDS = ['alibi']"), 'Ранний допрос всё ещё требует преждевременные вопросы');
check(interrogationGuide.includes("['passage', 'anton']"), 'Будущие гипотезы не скрываются до появления доказательств');
check(!interrogationGuide.includes('new MutationObserver'), 'Маршрут допроса не должен создавать MutationObserver');
check(!interrogationGuide.includes('setInterval'), 'Маршрут допроса не должен использовать polling');

check(act23.includes('Здесь не нужно искать скрытые точки на картинке'), 'E008 не объясняет механику архивной проверки');
check(act23.includes('Закрыть E009 и перейти к Кириллу'), 'После E009 нет прямого следующего шага');
check(!act23.includes('new MutationObserver'), 'Act II–III UX слой не должен создавать MutationObserver');
check(!act23.includes('setInterval'), 'Act II–III UX слой не должен использовать polling');

check(playerGuide.includes('Главное правило игры'), 'Onboarding не объясняет модель прохождения');
check(playerGuide.includes('Следующий шаг'), 'Нет постоянно видимого следующего действия');
check(playerGuide.includes('Объяснить'), 'Нет отдельного объяснения маршрута');
check(playerGuide.includes('Следователь не должен знать о скрытом проходе заранее'), 'Player Guidance не объясняет происхождение гипотезы прохода');
check(playerGuide.includes('subscribeInvestigationState'), 'Player Guidance не использует единое состояние расследования');
check(!playerGuide.includes('new MutationObserver'), 'Player Guidance не должен создавать MutationObserver');
check(!playerGuide.includes('setInterval'), 'Player Guidance не должен использовать polling');

check(Array.isArray(manifest.icons) && manifest.icons.some((item) => item.src === './icon.svg'), 'PWA manifest не содержит иконку');
check(pkg.scripts?.['test:e2e'] === 'playwright test', 'Не объявлен Playwright e2e-скрипт');
check(pkg.devDependencies?.['@playwright/test'], 'Playwright отсутствует в devDependencies');

if (failures.length) {
  console.error('\nCommercial release smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nCommercial release smoke passed: v0.9.2 keeps evidence-grounded interrogation and exposes the next operational action directly.');
