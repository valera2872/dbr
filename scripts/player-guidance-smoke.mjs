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
const guide = read('src/PlayerGuidance.tsx');
const css = read('src/playerGuidance.css');
const test = read('tests/e2e/player-guidance.spec.ts');

check(/^0\.9\./.test(pkg.version), 'Player Guidance должен сохраняться в релизах 0.9.x');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
[
  'src/PlayerGuidance.tsx',
  'src/playerGuidance.css',
  'tests/e2e/player-guidance.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('PlayerGuidance'), 'main.tsx не монтирует PlayerGuidance');
check(main.includes("./playerGuidance.css"), 'main.tsx не подключает playerGuidance.css');

[
  'Вы — следователь. Интерфейс не должен быть загадкой.',
  'Главное правило игры',
  'Материалы',
  'Люди',
  'Дело',
  'Следующий шаг',
  'Объяснить',
  'Эта помощь объясняет только управление и следующий шаг',
  'Осмотрите четыре отмеченные зоны номера 314',
  'Проверить, существовал ли другой путь между номерами 312 и 314',
  'На изображении скрытых точек искать не нужно',
  'Открыть допрос Кирилла',
  'Следователь не должен знать о скрытом проходе заранее',
  'Открыть финальный отчёт'
].forEach((token) => check(guide.includes(token), `Player Guidance не содержит: ${token}`));

check(guide.includes('subscribeInvestigationState'), 'Player Guidance не подписан на единое состояние расследования');
check(guide.includes('scheduleInvestigationRefresh'), 'Player Guidance не обновляется после действий игрока');
check(!guide.includes('new MutationObserver'), 'Player Guidance не должен создавать MutationObserver');
check(!guide.includes('setInterval'), 'Player Guidance не должен использовать polling');
check(css.includes('.player-guide-floating'), 'Нет постоянно доступной навигационной помощи');
check(css.includes('.player-guide-next'), 'Нет видимого прямого следующего действия');
check(css.includes('.player-onboarding-rule'), 'Onboarding не объясняет главную модель игры');
check(css.includes('@media (max-width: 760px)'), 'Player Guidance не адаптирован под телефон');

[
  'Вы — следователь',
  'Главное правило игры',
  'Начать расследование: осмотреть номер 314',
  'Осмотрено зон: 1/4',
  'Следующий шаг: Продолжить осмотр номера',
  'Объяснить',
  'Следующий шаг: Открыть архивный план'
].forEach((token) => check(test.includes(token), `Браузерный тест Player Guidance не проверяет: ${token}`));

if (failures.length) {
  console.error('\nPlayer Guidance smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nPlayer Guidance smoke passed: onboarding, visible next action and state-aware navigation are present in v${pkg.version}.`);
