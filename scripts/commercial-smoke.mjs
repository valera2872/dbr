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
const internalMode = read('src/internalMode.ts');
const launch = read('src/commercialLaunch.ts');
const shellCss = read('src/commercialShell.css');
const boundary = read('src/AppErrorBoundary.tsx');
const fixtures = read('src/routeFixtures.ts');
const diagnostics = read('src/stabilityDiagnostics.ts');
const sw = read('public/sw.js');
const index = read('index.html');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

check(pkg.version === '0.8.2', 'package.json должен иметь версию 0.8.2');
check(build.includes("APP_BUILD = 'v0.8.2'"), 'APP_BUILD должен быть v0.8.2');
check(sw.includes('dbr-v0-8-2-browser-playthrough'), 'Service worker не использует cache key v0.8.2');

[
  'src/internalMode.ts',
  'src/commercialLaunch.ts',
  'src/commercialShell.css',
  'src/AppErrorBoundary.tsx',
  'public/icon.svg',
  'playwright.config.ts',
  'tests/e2e/commercial-flow.spec.ts',
  '.github/workflows/browser-e2e.yml',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes("from './internalMode'"), 'main.tsx не подключает режим коммерческого релиза');
check(main.includes('AppErrorBoundary'), 'main.tsx не защищён аварийной границей React');
check(main.includes('mountCommercialLaunch'), 'main.tsx не монтирует коммерческий экран запуска');
check(main.includes("./commercialShell.css"), 'main.tsx не подключает коммерческие стили');
check(main.includes('INTERNAL_MODE\n  ? mountActorStudio'), 'Actor Studio не ограничен внутренним режимом');

check(internalMode.includes('dataset.dbrMode'), 'internalMode не маркирует режим интерфейса');
check(internalMode.includes("'actorStudio', 'diagnostics', 'qa', 'fixture', 'debug'"), 'Внешние ссылки не очищаются от внутренних параметров');
check(fixtures.includes('INTERNAL_MODE &&'), 'QA fixtures доступны без внутреннего режима');
check(diagnostics.includes('if (INTERNAL_MODE)'), 'Техническая диагностика доступна в коммерческом режиме');

[
  'Продолжить расследование',
  'Начать расследование',
  'Начать заново',
  'Восстановить сохранение',
  'Прогресс сохраняется автоматически',
  'После первой загрузки дело доступно офлайн',
  'repairSave',
  'attachMediaFallbacks'
].forEach((token) => check(launch.includes(token), `Коммерческий экран не содержит: ${token}`));

check(!launch.includes('new MutationObserver'), 'Коммерческий слой не должен создавать MutationObserver');
check(!launch.includes('setInterval'), 'Коммерческий слой не должен использовать polling');
check(launch.includes('requestAnimationFrame'), 'Запуск нового дела не использует ограниченное ожидание React CTA');

check(shellCss.includes("html[data-dbr-mode='commercial'] .premium-build-marker"), 'Номер сборки виден покупателю');
check(shellCss.includes('@media (max-width: 620px)'), 'Нет мобильного коммерческого layout');
check(shellCss.includes("[data-media-fallback='true']"), 'Нет визуального fallback для недоступных изображений');
check(shellCss.includes('@media (prefers-reduced-motion: reduce)'), 'Не учтено ограничение анимации');

check(boundary.includes('Последний сохранённый шаг не удалён'), 'Аварийный экран не объясняет сохранность прогресса');
check(boundary.includes('Перезагрузить'), 'Аварийный экран не предлагает безопасное восстановление');
check(boundary.includes('Начать дело заново'), 'Аварийный экран не предлагает чистый запуск');

check(index.includes('og:title'), 'В index.html отсутствуют метаданные публикации');
check(index.includes('viewport-fit=cover'), 'Не включены safe-area мобильных устройств');
check(Array.isArray(manifest.icons) && manifest.icons.some((item) => item.src === './icon.svg'), 'PWA manifest не содержит иконку продукта');
check(pkg.scripts?.['test:e2e'] === 'playwright test', 'Не объявлен браузерный e2e-скрипт');
check(pkg.devDependencies?.['@playwright/test'], 'Playwright отсутствует в devDependencies');

if (failures.length) {
  console.error('\nCommercial release smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nCommercial release smoke passed: launch, resume, restart, recovery, internal-tool gating, install identity and real browser playthrough contract are present in build 0.8.2.');
