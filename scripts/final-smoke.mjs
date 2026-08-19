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
const reactCore = read('src/ReactCaseExtension.tsx');
const act4V2 = read('src/Act4EvidenceV2.tsx');
const finalSynthesis = read('src/FinalSynthesis.tsx');
const act4Css = read('src/act4FinalOperation.css');
const interrogation = read('src/interactiveInterrogation.ts');
const sw = read('public/sw.js');
const caseData = JSON.parse(read('src/cases/room314.json'));
const buildVersion = `APP_BUILD = 'v${pkg.version}'`;
const cacheVersion = `dbr-v${pkg.version.replaceAll('.', '-')}`;

check(/^0\.(?:[89]|[1-9]\d)\./.test(pkg.version), 'Версия должна быть не ниже завершённого маршрута 0.8.x');
check(build.includes(buildVersion), `APP_BUILD должен совпадать с package.json: v${pkg.version}`);
check(build.includes('ACT4_STORAGE_KEY'), 'В реестре отсутствует ACT4_STORAGE_KEY');
check(main.includes("./act4FinalOperation.css"), 'main.tsx не подключает стили акта IV');
check(main.includes('ReactCaseExtension'), 'main.tsx не монтирует React Core актов II–IV');
check(main.includes('Act4EvidenceV2'), 'main.tsx не монтирует Act IV evidence v2');
check(main.includes("./act4EvidenceV2.css"), 'main.tsx не подключает стили Act IV evidence v2');
check(!main.includes("import './act2HiddenRouteV2'"), 'Legacy DOM enhancer акта II всё ещё загружается');
check(!main.includes("import './act3ArchiveIdentity'"), 'Legacy DOM enhancer акта III всё ещё загружается');
check(!main.includes("import './act4FinalOperation'"), 'Legacy DOM enhancer акта IV всё ещё загружается');
check(sw.includes(cacheVersion), `Service worker не использует cache key ${cacheVersion}`);

['E001', 'E002', 'E003', 'E004', 'E005'].forEach((id) => {
  check(caseData.evidence.some((item) => item.id === id), `В базовом деле отсутствует ${id}`);
});
['E006', 'E007', 'E008', 'E009', 'E010', 'E011'].forEach((id) => {
  check(reactCore.includes(`id=\"${id}\"`) || reactCore.includes(`'${id}'`), `В React Core отсутствует ${id}`);
});

[
  'src/ReactCaseExtension.tsx',
  'src/Act4EvidenceV2.tsx',
  'src/reactCaseExtension.css',
  'src/act4FinalOperation.css',
  'src/act4EvidenceV2.css',
  'src/interactiveInterrogation.ts',
  'src/kirillVideoRuntime.ts',
  'src/actorStudio.ts',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(interrogation.includes("const M3_LOG = 'v2:m3-log'"), 'Допрос v2 не проверяет альтернативный доступ M3');
check(interrogation.includes("const PRESENCE_PROVEN = 'actor:k:presence-proven'"), 'Допрос v2 не требует индивидуального присутствия Кирилла в 314');
check(interrogation.includes("has('opportunity')") && interrogation.includes("has('threat')") && interrogation.includes("has('card')"), 'Допрос v2 не замыкает opportunity + motive доказательные семьи');
check(!interrogation.includes('Открыто направление поиска — старая служебная комната'), 'Допрос снова делает признание источником спасательной ветки E010');
check(interrogation.includes('Местонахождение Ильи') && interrogation.includes('не создаются этим признанием'), 'Допрос не фиксирует границу между признанием и независимым поиском Ильи');

check(act4V2.includes("ACT3_STORAGE_KEY") && act4V2.includes("v2:rescue-complete"), 'E010 v2 не сохраняет совместимость с независимым ранним спасением');
check(act4V2.includes('не индивидуализирует Кирилла'), 'E010 v2 не защищает границу «обстановка не равна личности исполнителя»');
check(act4V2.includes('Контрольная копия 23:56'), 'E011 v2 не использует независимый доинцидентный хэш');
check(act4V2.includes('Следов позднего монтажа не обнаружено'), 'E011 v2 не проверяет целостность B-17');
check(act4V2.includes('Ранний фрагмент E008 не содержал имени'), 'E011 v2 снова может превращать ранний E008 в готовую атрибуцию Кирилла');
check(act4V2.includes('не умысел на убийство'), 'E011 v2 не ограничивает историческое обвинение доказанным');
check(act4V2.includes("canonicalCard(unique(state.card, 'clip'))"), 'E011 v2 не нормализует старый канонический порядок Act IV card state');
check(act4V2.includes('Ответственность ограничена доказанным'), 'Итоговый отчёт не показывает доказательный предел 2015 года');
check(act4V2.includes('Исполнитель установлен совокупностью'), 'Итоговый отчёт не показывает независимую индивидуализацию исполнителя');

check(finalSynthesis.includes('Почему именно Кирилл?'), 'Финальный синтез не показывает уже заработанную связку индивидуализации');
check(finalSynthesis.includes('отсутствие открытия M3'), 'Финальный синтез потерял альтернативный доступ M3');
check(finalSynthesis.includes('STR-совпадение микроследа'), 'Финальный синтез потерял индивидуальный STR-proof');
check(finalSynthesis.includes('{chosenCount}/6'), 'Финальный синтез должен оставлять игроку шесть самостоятельных решений без повторного теста actor-proof');
check(finalSynthesis.includes("finalAnswer: 'kirill_responsibility'"), 'Нет корректной финальной формулировки ответственности');

check(reactCore.includes('Илья найден живым'), 'Нет результата спасательной операции');
check(reactCore.includes('РАССЛЕДОВАНИЕ ЗАВЕРШЕНО'), 'Нет fallback итогового отчёта дела');
check(reactCore.includes('Следователь высшей категории'), 'Нет оценки качества прохождения');
check(reactCore.includes('createPortal'), 'Акты II–IV не используют React portals');
check(!reactCore.includes('document.createElement'), 'React Core не должен вручную создавать игровые DOM-узлы');
check(!reactCore.includes('new MutationObserver'), 'React Core не должен создавать MutationObserver');
check(!reactCore.includes('setInterval'), 'React Core не должен использовать polling');
check(act4Css.includes('.act4-report-overlay'), 'Нет визуального эпилога');
check(act4Css.includes('.premium-pass-acts.has-act4'), 'Шкала расследования не расширена до акта IV');

if (failures.length) {
  console.error('\nFinal operation smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nFinal operation smoke passed: E001–E011, independent rescue, bounded E010/E011, Kirill proof constellation, final synthesis and epilogue remain present in React Core build ${pkg.version}.`);