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
const mediaRuntime = read('src/localMediaRuntime.ts');
const sw = read('public/sw.js');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

check(pkg.version === '0.8.8', 'Коммерческая сборка должна иметь версию 0.8.8');
check(build.includes("APP_BUILD = 'v0.8.8'"), 'APP_BUILD должен совпадать с v0.8.8');
check(sw.includes('dbr-v0-8-8-interrogation-guidance'), 'Service worker не использует cache key v0.8.8');

[
  'dist/index.html',
  'src/internalMode.ts',
  'src/commercialLaunch.ts',
  'src/AppErrorBoundary.tsx',
  'src/ReactCaseExtension.tsx',
  'src/firstPlayerFixes.ts',
  'src/firstPlayerFixes.css',
  'src/interrogationGuidance.ts',
  'src/interrogationGuidance.css',
  'src/localMediaRuntime.ts',
  'tests/e2e/commercial-flow.spec.ts',
  'tests/e2e/full-playthrough.spec.ts',
  'tests/e2e/first-player-flow.spec.ts',
  'tests/e2e/interrogation-guidance.spec.ts',
  '.github/workflows/browser-e2e.yml'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

[
  'Продолжить расследование',
  'Начать расследование',
  'Начать заново',
  'Восстановить сохранение',
  'Открыть итог дела',
  'repairSave'
].forEach((token) => check(launch.includes(token), `Коммерческий экран не содержит: ${token}`));

check(main.includes('AppErrorBoundary'), 'main.tsx не защищён аварийной границей');
check(main.includes('ReactCaseExtension'), 'main.tsx не монтирует React Core');
check(main.includes("./localMediaRuntime"), 'main.tsx не подключает гибридный медиаслой');
check(main.includes("./firstPlayerFixes"), 'main.tsx не подключает исправления первого прохождения');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает маршрут допроса');
check(main.includes('installCompletedCaseReturn()'), 'main.tsx не подключает возврат к итоговому отчёту');

check(mediaRuntime.includes('REALISTIC_PRIMARY_MEDIA = true'), 'Реалистичные первичные фото не включены');
check(mediaRuntime.includes('case-001-hybrid-realistic-v1'), 'Гибридный медиапакет не маркирован');
check(!mediaRuntime.includes('new MutationObserver'), 'Медиаслой не должен создавать MutationObserver');
check(!mediaRuntime.includes('setInterval'), 'Медиаслой не должен использовать polling');

check(fixes.includes('Следующий обязательный шаг'), 'После E005 нет понятного маршрута');
check(fixes.includes('Закладки следователя'), 'Кнопка ключевого материала остаётся без объяснения');
check(!fixes.includes('new MutationObserver'), 'First-player слой не должен создавать MutationObserver');
check(!fixes.includes('setInterval'), 'First-player слой не должен использовать polling');

check(interrogationGuide.includes('Сейчас допрос нужно приостановить'), 'Ранний допрос не объясняет остановку');
check(interrogationGuide.includes('Закрыть допрос и открыть отчёт №1'), 'Из допроса нет прямого перехода к отчёту №1');
check(!interrogationGuide.includes('new MutationObserver'), 'Маршрут допроса не должен создавать MutationObserver');
check(!interrogationGuide.includes('setInterval'), 'Маршрут допроса не должен использовать polling');

check(Array.isArray(manifest.icons) && manifest.icons.some((item) => item.src === './icon.svg'), 'PWA manifest не содержит иконку');
check(pkg.scripts?.['test:e2e'] === 'playwright test', 'Не объявлен Playwright e2e-скрипт');
check(pkg.devDependencies?.['@playwright/test'], 'Playwright отсутствует в devDependencies');

if (failures.length) {
  console.error('\nCommercial release smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nCommercial release smoke passed: v0.8.8 shell, recovery, React Core, first-player routing, interrogation guidance and hybrid media are present.');
