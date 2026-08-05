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
const finalMediaCss = read('src/finalMedia.css');
const reactCss = read('src/reactCaseExtension.css');
const reactCore = read('src/ReactCaseExtension.tsx');
const boundary = read('src/AppErrorBoundary.tsx');
const fixtures = read('src/routeFixtures.ts');
const diagnostics = read('src/stabilityDiagnostics.ts');
const mediaCatalog = read('src/mediaCatalog.ts');
const mediaRuntime = read('src/localMediaRuntime.ts');
const sw = read('public/sw.js');
const index = read('index.html');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

check(pkg.version === '0.8.5', 'package.json должен иметь версию 0.8.5');
check(build.includes("APP_BUILD = 'v0.8.5'"), 'APP_BUILD должен быть v0.8.5');
check(sw.includes('dbr-v0-8-5-react-core'), 'Service worker не использует cache key v0.8.5');

[
  'src/internalMode.ts',
  'src/commercialLaunch.ts',
  'src/commercialShell.css',
  'src/AppErrorBoundary.tsx',
  'src/mediaCatalog.ts',
  'src/localMediaRuntime.ts',
  'src/finalMedia.css',
  'src/ReactCaseExtension.tsx',
  'src/reactCaseExtension.css',
  'public/icon.svg',
  'playwright.config.ts',
  'tests/e2e/commercial-flow.spec.ts',
  'tests/e2e/local-media.spec.ts',
  'tests/e2e/react-core.spec.ts',
  '.github/workflows/browser-e2e.yml',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

const mediaFiles = [
  'media/case-001/scenes/room-314.svg',
  'media/case-001/scenes/corridor-3f.svg',
  'media/case-001/portraits/kirill.svg',
  'media/case-001/portraits/marina.svg',
  'media/case-001/portraits/denis.svg',
  'media/case-001/portraits/vera.svg',
  'media/case-001/portraits/ilya.svg',
  'media/case-001/portraits/elena.svg',
  'media/case-001/evidence/e006-archive-plan.svg',
  'media/case-001/evidence/e008-archive-table.svg',
  'media/case-001/evidence/e010-service-room.svg',
  'media/case-001/evidence/e011-card-lab.svg',
  'media/case-001/evidence/final-case-report.svg'
];

mediaFiles.forEach((file) => {
  check(exists(`public/${file}`), `Отсутствует исходный медиаресурс public/${file}`);
  check(exists(`dist/${file}`), `Медиаресурс не попал в production build: dist/${file}`);
  check(sw.includes(`/dbr/${file}`), `Service worker не кеширует ${file}`);
});

check(main.includes("from './internalMode'"), 'main.tsx не подключает режим коммерческого релиза');
check(main.includes('AppErrorBoundary'), 'main.tsx не защищён аварийной границей React');
check(main.includes('mountCommercialLaunch'), 'main.tsx не монтирует коммерческий экран запуска');
check(main.includes('ReactCaseExtension'), 'main.tsx не монтирует React Core');
check(main.includes("./commercialShell.css"), 'main.tsx не подключает коммерческие стили');
check(main.includes("./localMediaRuntime"), 'main.tsx не подключает локальный медиапакет');
check(main.includes("./finalMedia.css"), 'main.tsx не подключает финальный медиапакет');
check(main.includes("./reactCaseExtension.css"), 'main.tsx не подключает стили React Core');
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

check(mediaCatalog.includes('room-314.svg'), 'Каталог не содержит локальную сцену номера 314');
check(mediaCatalog.includes('corridor-3f.svg'), 'Каталог не содержит локальный коридор');
check(mediaCatalog.includes('portraits/kirill.svg'), 'Каталог не содержит портрет Кирилла');
check(mediaCatalog.includes('e006-archive-plan.svg'), 'Каталог не содержит E006');
check(mediaCatalog.includes('e008-archive-table.svg'), 'Каталог не содержит E008');
check(mediaCatalog.includes('e010-service-room.svg'), 'Каталог не содержит E010');
check(mediaCatalog.includes('e011-card-lab.svg'), 'Каталог не содержит E011');
check(mediaCatalog.includes('final-case-report.svg'), 'Каталог не содержит финальный отчёт');
check(finalMediaCss.includes('.archive-plan-sheet'), 'E006 не подключён к интерфейсу');
check(finalMediaCss.includes('.archive-worktable'), 'E008 не подключён к интерфейсу');
check(finalMediaCss.includes('.act4-room-scene'), 'E010 не подключён к интерфейсу');
check(finalMediaCss.includes('.act4-card-lab'), 'E011 не подключён к интерфейсу');
check(finalMediaCss.includes('.act4-report'), 'Финальный отчёт не подключён к интерфейсу');
check(reactCss.includes('.react-case-modal'), 'Нет коммерческого layout React Core');
check(reactCore.includes('createPortal'), 'React Core не использует React portals');
check(reactCore.includes('Прогресс сохраняется автоматически'), 'React-модали не объясняют автосохранение');
check(!reactCore.includes('new MutationObserver'), 'React Core не должен создавать MutationObserver');
check(!reactCore.includes('setInterval'), 'React Core не должен использовать polling');
check(mediaRuntime.includes('installSynchronousMediaRewrite'), 'Старые URL не подменяются до первого рендера');
check(mediaRuntime.includes('HTMLImageElement.prototype'), 'Медиаслой не перехватывает установку src изображений');
check(mediaRuntime.includes("dataset.dbrMediaPack = 'case-001-v1'"), 'Медиапакет не маркирует активную версию');
check(!mediaRuntime.includes('new MutationObserver'), 'Локальный медиаслой не должен создавать MutationObserver');
check(!mediaRuntime.includes('setInterval'), 'Локальный медиаслой не должен использовать polling');

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

console.log('\nCommercial release smoke passed: commercial shell, React-owned acts II–IV, complete local media, offline cache and browser contracts are present in build 0.8.5.');
