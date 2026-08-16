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
const css = read('src/investigationAgency.css');
const sw = read('public/sw.js');
const test = read('tests/e2e/investigative-agency.spec.ts');

check(pkg.version === '0.9.8', 'Investigative agency release должна иметь версию 0.9.8');
check(build.includes("APP_BUILD = 'v0.9.8'"), 'APP_BUILD не обновлён до v0.9.8');
check(sw.includes('dbr-v0-9-8-investigative-agency'), 'Service worker cache не обновлён до v0.9.8');
[
  'src/investigationAgency.ts',
  'src/investigationAgency.css',
  'tests/e2e/investigative-agency.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('installInvestigationAgency'), 'main.tsx не подключает investigative agency runtime');
check(main.includes("./investigationAgency.css"), 'main.tsx не подключает investigative agency CSS');

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

check(agency.includes('ACT2_STORAGE_KEY'), 'Следственные решения не сохраняются в существующем ключе акта II');
check(agency.includes('subscribeInvestigationState'), 'Investigative agency не подписан на единое состояние');
check(agency.includes('refreshInvestigationState'), 'Investigative agency не синхронизирует состояние');
check(!agency.includes('new MutationObserver'), 'Investigative agency не должен создавать MutationObserver');
check(!agency.includes('setInterval'), 'Investigative agency не должен использовать polling');
check(css.includes('.investigation-agency-panel'), 'Нет визуального слоя следственного решения');
check(css.includes('@media (max-width: 760px)'), 'Investigative agency не адаптирован для телефона');

[
  'Известные пути не объясняют исчезновение',
  'Перепроверить окно снаружи',
  'Повторно осмотреть шкаф и общую стену',
  'Уточнить историю ремонтов этажа',
  'Запросить обмерный план до реконструкции',
  'agency:plan-requested',
  'До реконструкции здесь был служебный проём'
].forEach((token) => check(test.includes(token), `Браузерный тест не проверяет: ${token}`));

if (failures.length) {
  console.error('\nInvestigative agency smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nInvestigative agency smoke passed: the old plan must be earned through player-selected investigative actions.');
