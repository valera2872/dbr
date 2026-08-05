import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.tsx');
const core = read('src/ReactCaseExtension.tsx');
const css = read('src/reactCaseExtension.css');
const build = read('src/build.ts');

check(pkg.version === '0.8.5', 'React Core release должен иметь версию 0.8.5');
check(build.includes("APP_BUILD = 'v0.8.5'"), 'APP_BUILD должен быть v0.8.5');
check(exists('dist/index.html'), 'Production bundle не создан');
check(exists('src/ReactCaseExtension.tsx'), 'Отсутствует ReactCaseExtension.tsx');
check(exists('src/reactCaseExtension.css'), 'Отсутствуют стили React Core');
check(exists('tests/e2e/react-core.spec.ts'), 'Отсутствует браузерная проверка React Core');

check(main.includes("import { ReactCaseExtension } from './ReactCaseExtension'"), 'React Core не импортирован в main.tsx');
check(main.includes('<ReactCaseExtension />'), 'React Core не смонтирован рядом с PremiumApp');
check(!main.includes("import './act2HiddenRouteV2'"), 'Legacy act2 enhancer всё ещё активен');
check(!main.includes("import './act2GatePreview'"), 'Legacy act2 preview всё ещё активен');
check(!main.includes("import './act3ArchiveIdentity'"), 'Legacy act3 enhancer всё ещё активен');
check(!main.includes("import './act4FinalOperation'"), 'Legacy act4 enhancer всё ещё активен');

['E006', 'E007', 'E008', 'E009', 'E010', 'E011'].forEach((id) => {
  check(core.includes(`id=\"${id}\"`) || core.includes(`'${id}'`), `React Core не содержит ${id}`);
});

['ACT2_STORAGE_KEY', 'ACT3_STORAGE_KEY', 'ACT4_STORAGE_KEY', 'INTERROGATION_STORAGE_KEY'].forEach((token) => {
  check(core.includes(token), `React Core не использует совместимый ключ ${token}`);
});

check(core.includes('createPortal'), 'Игровые карточки и модали не перенесены в React portals');
check(core.includes('data-react-case-core="v0.8.5"'), 'React Core не маркирует собственную контрольную точку');
check(core.includes('dbr:act2-updated'), 'React Core не уведомляет об обновлении акта II');
check(core.includes('dbr:act3-updated'), 'React Core не уведомляет об обновлении акта III');
check(core.includes('dbr:act4-updated'), 'React Core не уведомляет об обновлении акта IV');
check(!core.includes('document.createElement'), 'React Core не должен вручную собирать игровые DOM-узлы');
check(!core.includes('innerHTML'), 'React Core не должен рендерить игровые экраны через innerHTML');
check(!core.includes('new MutationObserver'), 'React Core не должен создавать MutationObserver');
check(!core.includes('setInterval'), 'React Core не должен использовать polling');
check(css.includes('.react-case-modal'), 'Нет layout React-модалей');
check(css.includes('@media (max-width: 620px)'), 'React Core не адаптирован под телефон');
check(css.includes('@media (prefers-reduced-motion: reduce)'), 'React Core не учитывает reduced motion');

if (failures.length) {
  console.error('\nReact Core migration smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nReact Core migration smoke passed: acts II–IV are React-owned, storage-compatible and free of legacy DOM construction.');
