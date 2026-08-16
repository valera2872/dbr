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
const agency = read('src/investigationAgency.ts');
const agencyAct3 = read('src/investigationAgencyAct3.ts');
const css = read('src/investigationAgency.css');
const cssAct3 = read('src/investigationAgencyAct3.css');
const sw = read('public/sw.js');
const test = read('tests/e2e/investigative-agency.spec.ts');
const act3Test = read('tests/e2e/evidence-led-chain.spec.ts');

check(pkg.version === '0.9.9', 'Investigative agency release должна иметь версию 0.9.9');
check(build.includes("APP_BUILD = 'v0.9.9'"), 'APP_BUILD не обновлён до v0.9.9');
check(sw.includes('dbr-v0-9-9-evidence-led-chain'), 'Service worker cache не обновлён до v0.9.9');
[
  'src/investigationAgency.ts',
  'src/investigationAgency.css',
  'src/investigationAgencyAct3.ts',
  'src/investigationAgencyAct3.css',
  'tests/e2e/investigative-agency.spec.ts',
  'tests/e2e/evidence-led-chain.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('installInvestigationAgency'), 'main.tsx не подключает investigative agency runtime');
check(main.includes('installInvestigationAgencyAct3'), 'main.tsx не подключает evidence-led Act III runtime');
check(main.includes("./investigationAgency.css"), 'main.tsx не подключает investigative agency CSS');
check(main.includes("./investigationAgencyAct3.css"), 'main.tsx не подключает evidence-led Act III CSS');

[
  'agency:window',
  'agency:lock',
  'agency:wall',
  'agency:renovation',
  'agency:plan-requested',
  'Не каждая обязана дать новую улику',
  'Запросить обмерный план до реконструкции',
  'Третий этаж перестраивали после фестиваля 2015 года',
  'Известные пути выхода не объясняют исчезновение',
  'До реконструкции здесь был служебный проём'
].forEach((token) => check(agency.includes(token), `Investigative agency не содержит: ${token}`));

[
  'agency3:fibres',
  'agency3:toolmarks',
  'agency3:envelope',
  'agency3:denis-envelope',
  'agency3:archive-requested',
  'agency3:trace-custody',
  'agency3:denis-family',
  'agency3:id-elena',
  'agency3:identity-requested',
  'Запросить BOX 15-B и журнал оцифровки',
  'Вера Белова должна была приехать, но такого имени среди участников нет',
  'Запросить документы для проверки Елены',
  'Открыть рабочую панель'
].forEach((token) => check(agencyAct3.includes(token), `Evidence-led Act III не содержит: ${token}`));

check(agency.includes('ACT2_STORAGE_KEY'), 'Следственные решения акта II не сохраняются в существующем ключе');
check(agencyAct3.includes('ACT3_STORAGE_KEY'), 'Следственные решения акта III не сохраняются в существующем ключе');
check(agency.includes('subscribeInvestigationState'), 'Investigative agency не подписан на единое состояние');
check(agencyAct3.includes('subscribeInvestigationState'), 'Evidence-led Act III не подписан на единое состояние');
check(agencyAct3.includes('data-evidence-led-route'), 'Навигация к рабочей панели не отделена от детективной подсказки');
check(!agency.includes('new MutationObserver'), 'Investigative agency не должен создавать MutationObserver');
check(!agencyAct3.includes('new MutationObserver'), 'Evidence-led Act III не должен создавать MutationObserver');
check(!agency.includes('setInterval'), 'Investigative agency не должен использовать polling');
check(!agencyAct3.includes('setInterval'), 'Evidence-led Act III не должен использовать polling');
check(css.includes('.investigation-agency-panel'), 'Нет визуального слоя первого следственного решения');
check(cssAct3.includes('.evidence-led-panel'), 'Нет визуального слоя evidence-led Act III');
check(cssAct3.includes('@media (max-width: 760px)'), 'Evidence-led Act III не адаптирован для телефона');

[
  'Известные пути не объясняют исчезновение',
  'Перепроверить окно снаружи',
  'Повторно осмотреть шкаф и общую стену',
  'Уточнить историю ремонтов этажа',
  'Запросить обмерный план до реконструкции',
  'agency:plan-requested',
  'До реконструкции здесь был служебный проём'
].forEach((token) => check(test.includes(token), `Браузерный тест первого agency не проверяет: ${token}`));

[
  'E008 появляется только после самостоятельного выхода на архив 2015 года',
  'Отправить волокна на экспресс-анализ',
  'Запросить BOX 15-B и журнал оцифровки',
  'E009 появляется только после восстановления Веры',
  'Проверить Марину Орлову',
  'Проверить Елену Ветрову',
  'agency3:identity-requested'
].forEach((token) => check(act3Test.includes(token), `Браузерный тест evidence-led цепочки не проверяет: ${token}`));

if (failures.length) {
  console.error('\nInvestigative agency smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nInvestigative agency smoke passed: E006, E008 and E009 must all be earned through player-selected investigative actions.');
