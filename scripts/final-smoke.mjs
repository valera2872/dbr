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
const act2 = read('src/act2HiddenRouteV2.ts');
const act3 = read('src/act3ArchiveIdentity.ts');
const act4 = read('src/act4FinalOperation.ts');
const act4Css = read('src/act4FinalOperation.css');
const interrogation = read('src/interactiveInterrogation.ts');
const sw = read('public/sw.js');
const caseData = JSON.parse(read('src/cases/room314.json'));

check(pkg.version === '0.7.0', 'package.json должен иметь версию 0.7.0');
check(build.includes("APP_BUILD = 'v0.7.0'"), 'APP_BUILD должен быть v0.7.0');
check(build.includes('ACT4_STORAGE_KEY'), 'В реестре отсутствует ACT4_STORAGE_KEY');
check(main.includes("./act4FinalOperation.css"), 'main.tsx не подключает стили акта IV');
check(main.includes("./act4FinalOperation'"), 'main.tsx не подключает акт IV');
check(main.indexOf("./act4FinalOperation'") < main.indexOf("./versionGuard'"), 'Акт IV должен загружаться до versionGuard');
check(sw.includes('dbr-v0-7-0-final-operation'), 'Service worker не использует cache key v0.7.0');

['E001', 'E002', 'E003', 'E004', 'E005'].forEach((id) => {
  check(caseData.evidence.some((item) => item.id === id), `В базовом деле отсутствует ${id}`);
});
['E006', 'E007'].forEach((id) => check(act2.includes(id), `В акте II отсутствует ${id}`));
['E008', 'E009'].forEach((id) => check(act3.includes(id), `В акте III отсутствует ${id}`));
['E010', 'E011'].forEach((id) => check(act4.includes(id), `В финальном акте отсутствует ${id}`));

[
  'src/act4FinalOperation.ts',
  'src/act4FinalOperation.css',
  'src/interactiveInterrogation.ts',
  'src/kirillVideoRuntime.ts',
  'src/actorStudio.ts',
  'dist/index.html'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(interrogation.includes('старая служебная комната'), 'Допрос не открывает направление поиска E010');
check(act4.includes("SEARCH_IDS = ['entry', 'ilya', 'medical', 'lamp']"), 'E010 не содержит четыре зоны поиска');
check(act4.includes("CARD_IDS = ['serial', 'copy', 'clip', 'integrity']"), 'E011 не содержит четыре проверки носителя');
check(act4.includes("id: 'kirill_responsibility'"), 'Нет корректной финальной формулировки ответственности');
check(act4.includes('Илья найден живым'), 'Нет результата спасательной операции');
check(act4.includes('РАССЛЕДОВАНИЕ ЗАВЕРШЕНО'), 'Нет итогового отчёта дела');
check(act4.includes('Следователь высшей категории'), 'Нет оценки качества прохождения');
check(act4.includes('dbr:runtime-settled'), 'Акт IV не использует общий performance kernel');
check(!act4.includes('new MutationObserver'), 'Акт IV не должен создавать отдельный MutationObserver');
check(!act4.includes('setInterval'), 'Акт IV не должен использовать polling');
check(act4Css.includes('.act4-report-overlay'), 'Нет визуального эпилога');
check(act4Css.includes('.premium-pass-acts.has-act4'), 'Шкала расследования не расширена до акта IV');

if (failures.length) {
  console.error('\nFinal operation smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nFinal operation smoke passed: E001–E011, rescue, card verification, accusation and epilogue are present in build 0.7.0.');
