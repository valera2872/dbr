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
const commercialMetadata = read('src/commercialMetadataConsistency.ts');
const stageHeader = read('src/stageHeaderConsistency.ts');
const focusedFirstAction = read('src/focusedFirstAction.ts');
const progressiveNavigation = read('src/progressiveNavigation.ts');
const investigationAgency = read('src/investigationAgency.ts');
const investigationAgencyAct3 = read('src/investigationAgencyAct3.ts');
const interrogationAgency = read('src/investigationAgencyInterrogation.ts');
const finalSynthesis = read('src/FinalSynthesis.tsx');
const fixes = read('src/firstPlayerFixes.ts');
const interrogationGuide = read('src/interrogationGuidance.ts');
const act23 = read('src/act23Usability.ts');
const playerGuide = read('src/PlayerGuidance.tsx');
const mediaRuntime = read('src/localMediaRuntime.ts');
const evidenceRealism = read('src/evidenceRealism.ts');
const mediaCatalog = read('src/mediaCatalog.ts');
const case001V2 = read('src/case001V2Runtime.ts');
const v2Overlay = read('src/case001V2ReactOverlay.ts');
const actorProof = read('src/case001V2ActorProof.ts');
const sw = read('public/sw.js');
const manifest = JSON.parse(read('public/manifest.webmanifest'));

check(pkg.version === '0.11.1', 'Коммерческая сборка должна иметь версию 0.11.1');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(sw.includes('dbr-v0-11-1-evidence-actor-proof'), 'Service worker не использует cache key v0.11.1');

[
  'dist/index.html', 'src/internalMode.ts', 'src/commercialLaunch.ts', 'src/commercialMetadataConsistency.ts',
  'src/stageHeaderConsistency.ts', 'src/focusedFirstAction.ts', 'src/focusedFirstAction.css',
  'src/progressiveNavigation.ts', 'src/investigationAgency.ts', 'src/investigationAgency.css',
  'src/investigationAgencyAct3.ts', 'src/investigationAgencyAct3.css',
  'src/investigationAgencyInterrogation.ts', 'src/interrogationAgency.css',
  'src/FinalSynthesis.tsx', 'src/finalSynthesis.css',
  'src/evidenceRealism.ts', 'src/evidenceRealism.css',
  'src/case001V2Runtime.ts', 'src/case001V2Runtime.css',
  'src/case001V2ReactOverlay.ts', 'src/case001V2ReactOverlay.css',
  'src/case001V2ActorProof.ts', 'src/case001V2ActorProof.css',
  'public/media/case-001/evidence/e006-plan-photo.svg',
  'public/media/case-001/evidence/e007-room-312.svg',
  'public/media/case-001/evidence/e008-archive-photo.svg',
  'public/media/case-001/evidence/e009-identity-desk.svg',
  'public/media/case-001/evidence/e010-service-photo.svg',
  'public/media/case-001/evidence/e011-forensic-photo.svg',
  'src/AppErrorBoundary.tsx', 'src/ReactCaseExtension.tsx', 'src/PlayerGuidance.tsx', 'src/playerGuidance.css',
  'src/firstPlayerFixes.ts', 'src/firstPlayerFixes.css', 'src/interrogationGuidance.ts',
  'src/interrogationGuidance.css', 'src/act23Usability.ts', 'src/act23Usability.css',
  'src/localMediaRuntime.ts', 'tests/e2e/commercial-flow.spec.ts', 'tests/e2e/commercial-metadata.spec.ts',
  'tests/e2e/stage-header.spec.ts', 'tests/e2e/stage-dashboard.spec.ts',
  'tests/e2e/progressive-navigation.spec.ts', 'tests/e2e/investigative-agency.spec.ts',
  'tests/e2e/evidence-led-chain.spec.ts', 'tests/e2e/interrogation-agency.spec.ts',
  'tests/e2e/final-synthesis.spec.ts', 'tests/e2e/evidence-realism.spec.ts', 'tests/e2e/full-playthrough.spec.ts',
  'tests/e2e/first-player-flow.spec.ts', 'tests/e2e/interrogation-guidance.spec.ts',
  'tests/e2e/player-guidance.spec.ts', '.github/workflows/browser-e2e.yml'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

['Продолжить расследование','Начать расследование','Начать заново','Восстановить сохранение','Открыть итог дела','repairSave']
  .forEach((token) => check(launch.includes(token), `Коммерческий экран не содержит: ${token}`));

check(main.includes('AppErrorBoundary'), 'main.tsx не защищён аварийной границей');
check(main.includes('ReactCaseExtension'), 'main.tsx не монтирует React Core');
check(main.includes('PlayerGuidance'), 'main.tsx не монтирует Player Guidance');
check(main.includes('FinalSynthesis'), 'main.tsx не монтирует сборку финального обвинения');
check(main.includes('installCommercialMetadataConsistency'), 'main.tsx не подключает синхронизацию коммерческих параметров');
check(main.includes('installStageHeaderConsistency'), 'main.tsx не подключает синхронизацию текущего этапа в штабе');
check(main.includes('installFocusedFirstAction'), 'main.tsx не подключает focused first action');
check(main.includes('installProgressiveNavigation'), 'main.tsx не подключает progressive navigation');
check(main.includes('installInvestigationAgency'), 'main.tsx не подключает investigative agency');
check(main.includes('installInvestigationAgencyAct3'), 'main.tsx не подключает evidence-led Act III agency');
check(main.includes('installCase001V2Runtime'), 'main.tsx не подключает Room 314 v2 runtime');
check(main.includes("./case001V2Runtime.css"), 'main.tsx не подключает стили Room 314 v2');
check(main.includes("./case001V2ActorProof"), 'main.tsx не подключает v2 actor proof runtime');
check(main.includes("./case001V2ActorProof.css"), 'main.tsx не подключает v2 actor proof styles');
check(main.includes("./investigationAgencyInterrogation"), 'main.tsx не подключает player-led interrogation agency');
check(main.includes("./interrogationAgency.css"), 'main.tsx не подключает стили player-led interrogation');
check(main.includes("./finalSynthesis.css"), 'main.tsx не подключает стили финальной реконструкции');
check(main.includes("./evidenceRealism.css"), 'main.tsx не подключает стили realism-v2');
check(main.includes("./evidenceRealism"), 'main.tsx не подключает runtime realism-v2');
check(main.includes("./investigationAgency.css"), 'main.tsx не подключает стили investigative agency');
check(main.includes("./investigationAgencyAct3.css"), 'main.tsx не подключает стили evidence-led Act III');
check(main.includes("./focusedFirstAction.css"), 'main.tsx не подключает стили focused first action');
check(main.includes("./playerGuidance.css"), 'main.tsx не подключает стили Player Guidance');
check(main.includes("./localMediaRuntime"), 'main.tsx не подключает гибридный медиаслой');
check(main.includes("./firstPlayerFixes"), 'main.tsx не подключает исправления первого прохождения');
check(main.includes("./interrogationGuidance"), 'main.tsx не подключает маршрут допроса');
check(main.includes("./act23Usability"), 'main.tsx не подключает маршрут актов II–III');
check(main.includes('installCompletedCaseReturn()'), 'main.tsx не подключает возврат к итоговому отчёту');

check(commercialMetadata.includes("./cases/room314.json"), 'Коммерческие параметры не берутся из manifest дела');
check(commercialMetadata.includes('manifest.ageRating'), 'Возрастной рейтинг не синхронизирован с manifest');
check(commercialMetadata.includes('manifest.estimatedMinutes'), 'Длительность не синхронизирована с manifest');
check(commercialMetadata.includes('manifest.players'), 'Количество игроков не синхронизировано с manifest');
check(commercialMetadata.includes('subscribeInvestigationState'), 'Коммерческие параметры не обновляются вместе с состоянием запуска');
check(!commercialMetadata.includes('new MutationObserver'), 'Синхронизация коммерческих параметров не должна создавать MutationObserver');
check(!commercialMetadata.includes('setInterval'), 'Синхронизация коммерческих параметров не должна использовать polling');

['Акт I', 'Акт II', 'Акт III', 'Ключевой допрос', 'Акт IV', 'Завершено']
  .forEach((token) => check(stageHeader.includes(token), `Stage-aware штаб не содержит этап: ${token}`));
check(stageHeader.includes('agencyTask'), 'Stage-aware штаб не учитывает player-led agency состояния');
check(stageHeader.includes('subscribeInvestigationState'), 'Stage-aware штаб не подписан на единое состояние расследования');
check(stageHeader.includes('refreshInvestigationState'), 'Stage-aware штаб не синхронизирует события актов с единым состоянием');
check(!stageHeader.includes('new MutationObserver'), 'Stage-aware штаб не должен создавать MutationObserver');
check(!stageHeader.includes('setInterval'), 'Stage-aware штаб не должен использовать polling');

[
  'Ваше первое действие',
  'Осмотрите номер 314',
  'Пока не нужно разбираться во всём штабе',
  'Перейти к первому действию'
].forEach((token) => check(focusedFirstAction.includes(token), `Focused first action не содержит: ${token}`));
check(focusedFirstAction.includes('subscribeInvestigationState'), 'Focused first action не подписан на состояние расследования');
check(!focusedFirstAction.includes('new MutationObserver'), 'Focused first action не должен создавать MutationObserver');
check(!focusedFirstAction.includes('setInterval'), 'Focused first action не должен использовать polling');

[
  'dbr:player-guidance:guided-first-run:v1',
  "new Set(['Дело', 'Материалы'])",
  "labels.add('Люди')",
  "labels.add('Хронология')",
  "labels.add('Версии')"
].forEach((token) => check(progressiveNavigation.includes(token), `Progressive navigation не содержит: ${token}`));
check(!progressiveNavigation.includes('new MutationObserver'), 'Progressive navigation не должна создавать MutationObserver');
check(!progressiveNavigation.includes('setInterval'), 'Progressive navigation не должна использовать polling');

[
  'agency:wall',
  'agency:renovation',
  'agency:plan-requested',
  'Запросить обмерный план до реконструкции',
  'Не каждая обязана дать новую улику'
].forEach((token) => check(investigationAgency.includes(token), `Investigative agency не содержит: ${token}`));
check(investigationAgency.includes('ACT2_STORAGE_KEY'), 'Investigative agency не использует существующее состояние акта II');
check(!investigationAgency.includes('new MutationObserver'), 'Investigative agency не должен создавать MutationObserver');
check(!investigationAgency.includes('setInterval'), 'Investigative agency не должен использовать polling');

[
  'agency3:archive-requested',
  'agency3:trace-custody',
  'agency3:id-elena',
  'agency3:identity-requested',
  'Запросить BOX 15-B и журнал оцифровки',
  'Вера Белова должна была приехать, но такого имени среди участников нет',
  'Открыть рабочую панель'
].forEach((token) => check(investigationAgencyAct3.includes(token), `Evidence-led Act III не содержит: ${token}`));
check(investigationAgencyAct3.includes('ACT3_STORAGE_KEY'), 'Evidence-led Act III не использует существующее состояние акта III');
check(!investigationAgencyAct3.includes('new MutationObserver'), 'Evidence-led Act III не должен создавать MutationObserver');
check(!investigationAgencyAct3.includes('setInterval'), 'Evidence-led Act III не должен использовать polling');

[
  'v2:marina-closure',
  'v2:m3-log',
  'v2:desk-sampled',
  'v2:rescue-complete',
  'agency3:archive-requested',
  'Маршрут найден. Исполнитель — ещё нет.',
  'Обыскать ветку P3 / S-3',
  'контроллер M3 не фиксирует ни одного открытия',
  'Поиск решил задачу спасения'
].forEach((token) => check(case001V2.includes(token), `Room 314 v2 runtime не содержит: ${token}`));
check(case001V2.includes('ACT4_STORAGE_KEY'), 'Ранний поиск S-3 не использует каноническое состояние Act IV');
check(case001V2.includes('subscribeInvestigationState'), 'Room 314 v2 runtime не подписан на единое состояние');

[
  'Неполная расшифровка конфликта',
  'E008 ещё не доказывает, что этим человеком был Кирилл',
  'Скрытая личность не равна виновности',
  'обе лжи реальны, но пока не устанавливают человека'
].forEach((token) => check(v2Overlay.includes(token), `V2 evidence semantics не содержит: ${token}`));

[
  'v2:injury-scan',
  'v2:kirill-cut-observed',
  'v2:trace-kirill-match',
  'Свежий пластырь на правой кисти',
  'ДНК-профиль микрокапли',
  'Кирилл физически был в номере 314'
].forEach((token) => check(actorProof.includes(token), `V2 actor proof не содержит: ${token}`));
check(actorProof.includes('ACT3_STORAGE_KEY'), 'Actor proof не сохраняется в каноническом Act III state');
check(actorProof.includes('subscribeInvestigationState'), 'Actor proof не подписан на единое состояние');
check(!actorProof.includes('new MutationObserver'), 'Actor proof не должен создавать MutationObserver');

[
  'Правильный порядок не показывается',
  'Если связка слаба, Кирилл объяснит, чего она не доказывает',
  'Будущие доказательства и их названия здесь не показываются',
  'next-guided-evidence',
  'agencyFutureHidden'
].forEach((token) => check(interrogationAgency.includes(token), `Player-led interrogation не содержит: ${token}`));
check(!interrogationAgency.includes('new MutationObserver'), 'Player-led interrogation не должен создавать MutationObserver');
check(!interrogationAgency.includes('setInterval'), 'Player-led interrogation не должен использовать polling');

[
  'Соберите обвинение из доказанных частей',
  'Какая пара материалов доказывает способ проникновения?',
  'Какая пара материалов связывает нападение с B-17?',
  'Версия не выдерживает проверку',
  "finalAnswer: 'kirill_responsibility'"
].forEach((token) => check(finalSynthesis.includes(token), `Финальная реконструкция не содержит: ${token}`));
check(finalSynthesis.includes('ACT4_STORAGE_KEY'), 'Финальная реконструкция не использует существующее состояние акта IV');
check(finalSynthesis.includes('wrongAnswers'), 'Ошибочные финальные версии не учитываются в итоговой оценке');
check(finalSynthesis.includes('subscribeInvestigationState'), 'Финальная реконструкция не подписана на единое состояние');
check(!finalSynthesis.includes('new MutationObserver'), 'Финальная реконструкция не должна создавать MutationObserver');
check(!finalSynthesis.includes('setInterval'), 'Финальная реконструкция не должна использовать polling');

check(mediaRuntime.includes('REALISTIC_PRIMARY_MEDIA = true'), 'Реалистичные первичные фото не включены');
check(mediaRuntime.includes('case-001-hybrid-realistic-v1'), 'Гибридный медиапакет не маркирован');
check(!mediaRuntime.includes('new MutationObserver'), 'Медиаслой не должен создавать MutationObserver');
check(!mediaRuntime.includes('setInterval'), 'Медиаслой не должен использовать polling');

['E006', 'E007', 'E008', 'E009', 'E010', 'E011', 'data-evidence-realism', 'realism-v2']
  .forEach((token) => check(evidenceRealism.includes(token), `Evidence realism runtime не содержит: ${token}`));
[
  'e006-plan-photo.svg',
  'e007-room-312.svg',
  'e008-archive-photo.svg',
  'e009-identity-desk.svg',
  'e010-service-photo.svg',
  'e011-forensic-photo.svg'
].forEach((token) => check(mediaCatalog.includes(token), `Media catalog не содержит realism-v2 asset: ${token}`));
check(!evidenceRealism.includes('new MutationObserver'), 'Evidence realism не должен создавать MutationObserver');
check(!evidenceRealism.includes('setInterval'), 'Evidence realism не должен использовать polling');

check(fixes.includes('Следующий обязательный шаг'), 'После E005 нет понятного маршрута');
check(fixes.includes('Закладки следователя'), 'Кнопка ключевого материала остаётся без объяснения');
check(!fixes.includes('new MutationObserver'), 'First-player слой не должен создавать MutationObserver');
check(!fixes.includes('setInterval'), 'First-player слой не должен использовать polling');

check(interrogationGuide.includes('Дальше нужны факты, а не догадки'), 'Ранний допрос не объясняет границу знания следователя');
check(interrogationGuide.includes("const QUESTION_IDS = ['alibi']"), 'Ранний допрос всё ещё требует преждевременные вопросы');
check(!interrogationGuide.includes('new MutationObserver'), 'Маршрут допроса не должен создавать MutationObserver');
check(!interrogationGuide.includes('setInterval'), 'Маршрут допроса не должен использовать polling');

check(act23.includes('Здесь не нужно искать скрытые точки на картинке'), 'E008 не объясняет механику архивной проверки');
check(act23.includes('Закрыть E009 и перейти к Кириллу'), 'После E009 нет прямого следующего шага');
check(!act23.includes('new MutationObserver'), 'Act II–III UX слой не должен создавать MutationObserver');
check(!act23.includes('setInterval'), 'Act II–III UX слой не должен использовать polling');

check(playerGuide.includes('Следующий шаг'), 'Базовый Player Guidance потерян');
check(playerGuide.includes('Объяснить'), 'Нет отдельного объяснения маршрута');
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

console.log('Commercial release smoke passed for v0.11.1 evidence semantics + actor proof.');
