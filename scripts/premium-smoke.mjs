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
const actorStudio = read('src/actorStudio.ts');
const actorStudioCss = read('src/actorStudio.css');
const actorStudioGuide = read('src/actorStudioGuide.ts');
const actorStudioGuideCss = read('src/actorStudioGuide.css');
const videoContract = read('src/kirillVideoContract.ts');
const videoRuntime = read('src/kirillVideoRuntime.ts');
const videoManifest = JSON.parse(read('public/media/kirill/manifest.json'));

check(packageJson.version === '0.6.7', 'package.json должен иметь версию 0.6.7');
check(build.includes("APP_BUILD = 'v0.6.7'"), 'src/build.ts должен объявлять APP_BUILD v0.6.7');
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
  "./actorStudio.css",
  "./actorStudioGuide.css",
  "./premiumPass",
  "./interactiveInterrogation",
  "./livingSuspect",
  "./kirillVideoRuntime",
  "./versionGuard"
];
requiredMainImports.forEach((entry) => check(main.includes(entry), `main.tsx не подключает ${entry}`));
check(main.includes('mountActorStudio'), 'main.tsx не монтирует Actor Studio');
check(main.includes('mountActorStudioGuide'), 'main.tsx не монтирует пошаговый гид Actor Studio');
check(main.indexOf("./freshStart'") < main.indexOf("./performanceKernel'"), 'freshStart должен выполняться до восстановления состояния приложения');
check(main.indexOf("./performanceKernel'") < main.indexOf("./cameraFrames'"), 'performanceKernel должен загружаться до legacy runtime-модулей');
check(main.indexOf("./interactiveInterrogation'") < main.indexOf("./livingSuspect'"), 'Сцена Кирилла должна расширять уже подключённый допрос');
check(main.indexOf("./livingSuspect'") < main.indexOf("./kirillVideoRuntime'"), 'Line-level video runtime должен загружаться после базовой сцены');
check(main.indexOf("./kirillVideoRuntime'") < main.indexOf("./versionGuard'"), 'versionGuard должен загружаться последним');

const evidenceIds = caseData.evidence.map((item) => item.id);
['E001', 'E002', 'E003', 'E004', 'E005'].forEach((id) => {
  check(evidenceIds.includes(id), `В базовом деле отсутствует ${id}`);
});
['E006', 'E007'].forEach((id) => check(act2.includes(id), `В акте II отсутствует ${id}`));
['E008', 'E009'].forEach((id) => check(act3.includes(id), `В акте III отсутствует ${id}`));

[
  'src/premiumPass.ts',
  'src/premiumPass.css',
  'src/performanceKernel.ts',
  'src/interactiveInterrogation.ts',
  'src/interactiveInterrogation.css',
  'src/livingSuspect.ts',
  'src/livingSuspect.css',
  'src/freshStart.ts',
  'src/actorStudio.ts',
  'src/actorStudio.css',
  'src/actorStudioGuide.ts',
  'src/actorStudioGuide.css',
  'src/kirillVideoContract.ts',
  'src/kirillVideoRuntime.ts',
  'public/media/kirill/manifest.json',
  'public/media/kirill/README.md',
  'PREMIUM_PASS.md',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));
check(serviceWorker.includes('dbr-v0-6-7-actor-studio-onboarding'), 'Service worker не использует cache key v0.6.7');

check(performanceKernel.includes('CoalescedMutationObserver'), 'Performance kernel не объединяет MutationObserver');
check(performanceKernel.includes('dbr:runtime-settled'), 'Performance kernel не отправляет событие синхронизации');
check(interrogation.includes('data-present'), 'Допрос не поддерживает предъявление улик');
check(interrogation.includes('data-conclusion'), 'Допрос не поддерживает фиксацию противоречия');
check(interrogation.includes('старая служебная комната'), 'Допрос не открывает следующее направление поиска');

check(livingSuspect.includes('selectVerifiedMaleRussianVoice'), 'Нет строгой проверки мужского русского голоса');
check(!livingSuspect.includes('?? russian[0]'), 'Запрещён fallback на первый русский голос: он может быть женским');
check(livingSuspect.includes('stored.voice === true'), 'Озвучка должна быть выключена по умолчанию');
check(livingSuspect.includes('living-suspect-video'), 'Сцена не содержит слот настоящего видео');
check(!livingSuspect.includes('new MutationObserver'), 'Сцена не должна добавлять новый MutationObserver');
check(!livingSuspect.includes('setInterval'), 'Сцена не должна использовать polling');

check(!livingCss.includes('@keyframes living-idle'), 'Запрещено покачивание статичной фотографии');
check(!livingCss.includes('@keyframes living-blink'), 'Запрещена нарисованная имитация моргания поверх фотографии');
check(livingCss.includes('animation: none !important'), 'Статичная фотография должна быть явно защищена от анимации');
check(livingCss.includes('A still image never pretends to move'), 'CSS должен документировать честный fallback');

check(actorStudio.includes("params.get(STUDIO_PARAM) !== 'kirill'"), 'Actor Studio не защищён отдельным URL-режимом');
check(actorStudio.includes('navigator.mediaDevices.getUserMedia'), 'Actor Studio не включает камеру и микрофон');
check(actorStudio.includes('new MediaRecorder'), 'Actor Studio не записывает WebM-дубли');
check(actorStudio.includes('manifestFromCaptures'), 'Actor Studio не генерирует manifest.json');
check(actorStudio.includes('downloadAllButton'), 'Actor Studio не экспортирует комплект клипов');
check(actorStudioCss.includes('.actor-camera-shell'), 'Actor Studio не имеет производственного интерфейса камеры');

check(actorStudioGuide.includes('Это не функция игры и не тест веб-камеры'), 'Первый экран не объясняет назначение Actor Studio');
check(actorStudioGuide.includes('Студия сама не превращает фотографию'), 'Нет честного предупреждения об ограничениях студии');
check(actorStudioGuide.includes("script.id === 'alibi-initial'"), 'Гид не выбирает понятный тестовый дубль с речью');
check(actorStudioGuide.includes('Начать отсчёт и записать реплику'), 'Гид не переводит кнопки в пошаговый сценарий');
check(actorStudioGuide.includes('этот ролик затем появится в игре'), 'Гид не объясняет результат записи');
check(actorStudioGuideCss.includes('.actor-onboarding-backdrop'), 'Нет визуального вводного экрана Actor Studio');
check(actorStudioGuideCss.includes('.actor-guided-task'), 'Нет постоянной инструкции над камерой');
check(!actorStudioGuide.includes('new MutationObserver'), 'Гид Actor Studio не должен добавлять MutationObserver');
check(!actorStudioGuide.includes('setInterval'), 'Гид Actor Studio не должен использовать polling');

check(videoContract.includes("id: 'idle'"), 'В контракте нет idle-сцены');
check(videoContract.includes("id: 'confession'"), 'В контракте нет кульминационного признания');
check(videoContract.includes('findKirillScriptByText'), 'Контракт не умеет сопоставлять старые сохранения по тексту');
const scriptCount = (videoContract.match(/filename: '/g) ?? []).length;
check(scriptCount >= 18, `Контракт содержит только ${scriptCount} видеосцен; требуется не менее 18`);

check(videoRuntime.includes('manifest.lines'), 'Video runtime не ищет точный клип реплики');
check(videoRuntime.includes('findKirillScriptByText'), 'Video runtime не сопоставляет реплику со сценарием');
check(videoRuntime.includes('playIdle'), 'Video runtime не возвращается к живому idle-дублю');
check(videoRuntime.includes('РЕАЛЬНЫЙ ВИДЕОДУБЛЬ'), 'Интерфейс не различает реальное видео и фотореференс');
check(!videoRuntime.includes('new MutationObserver'), 'Video runtime не должен добавлять MutationObserver');
check(!videoRuntime.includes('setInterval'), 'Video runtime не должен использовать polling');

check(videoManifest.version === 2, 'Манифест Кирилла должен использовать схему v2');
check(typeof videoManifest.lines === 'object' && videoManifest.lines !== null, 'Манифест v2 должен содержать объект lines');

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

console.log(`\nPremium smoke passed: ${evidenceIds.length + 9} evidence, guided Actor Studio and line-level video contracts, build ${packageJson.version}.`);
