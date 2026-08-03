import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const failures = [];
const warnings = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const warn = (condition, message) => {
  if (!condition) warnings.push(message);
};

const packageJson = JSON.parse(read('package.json'));
const build = read('src/build.ts');
const main = read('src/main.tsx');
const versionGuard = read('src/versionGuard.ts');
const caseData = JSON.parse(read('src/cases/room314.json'));
const act2 = read('src/act2HiddenRouteV2.ts');
const act3 = read('src/act3ArchiveIdentity.ts');
const serviceWorker = read('public/sw.js');
const performanceKernel = read('src/performanceKernel.ts');
const interrogation = read('src/interactiveInterrogation.ts');
const livingSuspect = read('src/livingSuspect.ts');
const livingCss = read('src/livingSuspect.css');
const freshStart = read('src/freshStart.ts');

check(packageJson.version === '0.6.5', 'package.json должен иметь версию 0.6.5');
check(build.includes("APP_BUILD = 'v0.6.5'"), 'src/build.ts должен объявлять APP_BUILD v0.6.5');
check(build.includes('INTERROGATION_STORAGE_KEY'), 'src/build.ts должен объявлять ключ интерактивного допроса');
check(build.includes('LIVING_SUSPECT_STORAGE_KEY'), 'src/build.ts должен объявлять ключ сцены допроса');
check(versionGuard.includes("from './build'"), 'versionGuard должен получать версию из src/build.ts');
check(versionGuard.includes('premium-build-marker'), 'versionGuard должен защищать единую метку сборки');

const requiredMainImports = [
  "./freshStart",
  "./performanceKernel",
  "./premiumPass.css",
  "./buildMarker.css",
  "./interactiveInterrogation.css",
  "./livingSuspect.css",
  "./premiumPass",
  "./interactiveInterrogation",
  "./livingSuspect",
  "./versionGuard"
];
requiredMainImports.forEach((entry) => check(main.includes(entry), `main.tsx не подключает ${entry}`));
check(main.indexOf("./freshStart'") < main.indexOf("./performanceKernel'"), 'freshStart должен выполняться до восстановления состояния приложения');
check(main.indexOf("./performanceKernel'") < main.indexOf("./cameraFrames'"), 'performanceKernel должен загружаться до legacy runtime-модулей');
check(main.indexOf("./interactiveInterrogation'") < main.indexOf("./livingSuspect'"), 'Сцена Кирилла должна расширять уже подключённый допрос');
check(main.indexOf("./livingSuspect'") < main.indexOf("./versionGuard'"), 'versionGuard должен загружаться последним');

const evidenceIds = caseData.evidence.map((item) => item.id);
['E001', 'E002', 'E003', 'E004', 'E005'].forEach((id) => {
  check(evidenceIds.includes(id), `В базовом деле отсутствует ${id}`);
});
['E006', 'E007'].forEach((id) => check(act2.includes(id), `В акте II отсутствует ${id}`));
['E008', 'E009'].forEach((id) => check(act3.includes(id), `В акте III отсутствует ${id}`));

check(exists('src/premiumPass.ts'), 'Отсутствует src/premiumPass.ts');
check(exists('src/premiumPass.css'), 'Отсутствует src/premiumPass.css');
check(exists('src/performanceKernel.ts'), 'Отсутствует src/performanceKernel.ts');
check(exists('src/interactiveInterrogation.ts'), 'Отсутствует src/interactiveInterrogation.ts');
check(exists('src/interactiveInterrogation.css'), 'Отсутствует src/interactiveInterrogation.css');
check(exists('src/livingSuspect.ts'), 'Отсутствует src/livingSuspect.ts');
check(exists('src/livingSuspect.css'), 'Отсутствует src/livingSuspect.css');
check(exists('src/freshStart.ts'), 'Отсутствует src/freshStart.ts');
check(exists('public/media/kirill/manifest.json'), 'Отсутствует манифест реальных видеоклипов Кирилла');
check(exists('public/media/kirill/README.md'), 'Не документирован контракт видеоклипов Кирилла');
check(exists('PREMIUM_PASS.md'), 'Отсутствует PREMIUM_PASS.md');
check(exists('dist/index.html'), 'Vite не создал dist/index.html');
check(serviceWorker.includes('dbr-v0-6-5-honest-interrogation'), 'Service worker не использует cache key v0.6.5');

check(performanceKernel.includes('CoalescedMutationObserver'), 'Performance kernel не объединяет MutationObserver');
check(performanceKernel.includes('dbr:runtime-settled'), 'Performance kernel не отправляет событие синхронизации');
check(interrogation.includes('data-present'), 'Допрос не поддерживает предъявление улик');
check(interrogation.includes('data-conclusion'), 'Допрос не поддерживает фиксацию противоречия');
check(interrogation.includes('старая служебная комната'), 'Допрос не открывает следующее направление поиска');

check(livingSuspect.includes('selectVerifiedMaleRussianVoice'), 'Нет строгой проверки мужского русского голоса');
check(livingSuspect.includes('VERIFIED_MALE_VOICE'), 'Нет списка признаков мужского голоса');
check(!livingSuspect.includes('?? russian[0]'), 'Запрещён fallback на первый русский голос: он может быть женским');
check(livingSuspect.includes('stored.voice === true'), 'Озвучка должна быть выключена по умолчанию');
check(livingSuspect.includes('VideoManifest'), 'Нет контракта реальных видеореакций');
check(livingSuspect.includes('living-suspect-video'), 'Сцена не содержит слот настоящего видео');
check(livingSuspect.includes('manifest.json'), 'Сцена не загружает манифест видеоклипов');
check(livingSuspect.includes('activateWhenReady'), 'Сцена не ждёт фактического появления окна допроса');
check(livingSuspect.includes('requestAnimationFrame'), 'Сцена не использует ограниченную синхронизацию с отрисовкой');
check(!livingSuspect.includes('new MutationObserver'), 'Сцена не должна добавлять новый MutationObserver');
check(!livingSuspect.includes('setInterval'), 'Сцена не должна использовать polling');

check(!livingCss.includes('@keyframes living-idle'), 'Запрещено покачивание статичной фотографии');
check(!livingCss.includes('@keyframes living-blink'), 'Запрещена нарисованная имитация моргания поверх фотографии');
check(livingCss.includes('animation: none !important'), 'Статичная фотография должна быть явно защищена от анимации');
check(livingCss.includes('A still image never pretends to move'), 'CSS должен документировать честный fallback');

check(freshStart.includes("params.get('fresh') === '1'"), 'Нет явного fresh-start URL режима');
check(freshStart.includes('localStorage.removeItem'), 'Fresh start не очищает локальный прогресс дела');
check(freshStart.includes('history.replaceState'), 'Fresh start должен удалять служебный параметр из URL');

warn(!act2.includes('function setVersion'), 'Акт II всё ещё содержит legacy setVersion; защита выполняется versionGuard');
warn(!act3.includes('function setVersion'), 'Акт III всё ещё содержит legacy setVersion; защита выполняется versionGuard');
warn(!read('src/cameraFrames.ts').includes('function setVersion'), 'E004 всё ещё содержит legacy setVersion; защита выполняется versionGuard');

if (warnings.length) {
  console.warn('\nPremium smoke warnings:');
  warnings.forEach((message) => console.warn(`  - ${message}`));
}

if (failures.length) {
  console.error('\nPremium smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nPremium smoke passed: ${evidenceIds.length + 8} evidence, interrogation, honest media and fresh-start contracts, build ${packageJson.version}.`);
