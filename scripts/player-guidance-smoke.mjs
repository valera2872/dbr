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
const focus = read('src/focusedFirstAction.ts');
const focusCss = read('src/focusedFirstAction.css');
const progressive = read('src/progressiveNavigation.ts');
const test = read('tests/e2e/player-guidance.spec.ts');
const progressiveTest = read('tests/e2e/progressive-navigation.spec.ts');

check(/^0\.9\./.test(pkg.version), 'Player Guidance должен сохраняться в релизах 0.9.x');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
[
  'src/PlayerGuidance.tsx',
  'src/playerGuidance.css',
  'src/focusedFirstAction.ts',
  'src/focusedFirstAction.css',
  'src/progressiveNavigation.ts',
  'tests/e2e/player-guidance.spec.ts',
  'tests/e2e/progressive-navigation.spec.ts'
].forEach((file) => check(exists(file), `Отсутствует ${file}`));

check(main.includes('PlayerGuidance'), 'main.tsx не монтирует PlayerGuidance');
check(main.includes("./playerGuidance.css"), 'main.tsx не подключает playerGuidance.css');
check(main.includes('installFocusedFirstAction'), 'main.tsx не подключает focused first action runtime');
check(main.includes("./focusedFirstAction.css"), 'main.tsx не подключает focused first action CSS');
check(main.includes('installProgressiveNavigation'), 'main.tsx не подключает progressive navigation');

[
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

[
  'Ваше первое действие',
  'Осмотрите номер 314',
  'Пока не нужно разбираться во всём штабе',
  'На фотографии будут отмечены четыре зоны',
  'Когда осмотр закончится, игра сама покажет следующее действие',
  'Перейти к первому действию',
  'Открыть весь штаб без обучения'
].forEach((token) => check(focus.includes(token), `Focused first action не содержит: ${token}`));

[
  'dbr:player-guidance:guided-first-run:v1',
  "new Set(['Дело', 'Материалы'])",
  "labels.add('Люди')",
  "labels.add('Хронология')",
  "labels.add('Версии')",
  'data-dbr-progressive-hq'
].forEach((token) => check(progressive.includes(token) || progressiveTest.includes(token), `Progressive navigation не содержит/не проверяет: ${token}`));

check(guide.includes('subscribeInvestigationState'), 'Player Guidance не подписан на единое состояние расследования');
check(guide.includes('scheduleInvestigationRefresh'), 'Player Guidance не обновляется после действий игрока');
check(!guide.includes('new MutationObserver'), 'Player Guidance не должен создавать MutationObserver');
check(!guide.includes('setInterval'), 'Player Guidance не должен использовать polling');
check(focus.includes('subscribeInvestigationState'), 'Focused first action не синхронизирован с состоянием расследования');
check(focus.includes('requestAnimationFrame'), 'Focused first action не синхронизируется с React-отрисовкой');
check(!focus.includes('new MutationObserver'), 'Focused first action не должен создавать MutationObserver');
check(!focus.includes('setInterval'), 'Focused first action не должен использовать polling');
check(progressive.includes('subscribeInvestigationState'), 'Progressive navigation не подписана на состояние расследования');
check(progressive.includes('refreshInvestigationState'), 'Progressive navigation не перечитывает прогресс после действия');
check(progressive.includes('requestAnimationFrame'), 'Progressive navigation не синхронизируется с React');
check(!progressive.includes('new MutationObserver'), 'Progressive navigation не должна создавать MutationObserver');
check(!progressive.includes('setInterval'), 'Progressive navigation не должна использовать polling');
check(css.includes('.player-guide-floating'), 'Нет постоянно доступной навигационной помощи');
check(css.includes('.player-guide-next'), 'Нет видимого прямого следующего действия');
check(focusCss.includes('.player-onboarding.focused-first-action'), 'Нет сфокусированного первого экрана');
check(focusCss.includes('.player-onboarding-grid'), 'Старый обзор трёх разделов не скрывается на первом экране');
check(focusCss.includes('display: none'), 'Старый обзор интерфейса остаётся видимым');
check(css.includes('@media (max-width: 760px)'), 'Player Guidance не адаптирован под телефон');

[
  'Перейти к первому действию',
  'focused-first-action',
  'Ваше первое действие',
  'Пока не нужно разбираться во всём штабе',
  'Открыть весь штаб без обучения',
  'Осмотрено зон: 1/4',
  'Следующий шаг: Продолжить осмотр номера',
  'Объяснить',
  'Следующее действие выбирает следователь',
  'Игра не указывает правильное направление'
].forEach((token) => check(test.includes(token), `Браузерный тест Player Guidance не проверяет: ${token}`));

[
  'штаб раскрывается постепенно',
  'Открыть последнее сообщение',
  'Открыть весь штаб без обучения',
  'data-dbr-progressive-hq'
].forEach((token) => check(progressiveTest.includes(token), `Браузерный тест progressive navigation не проверяет: ${token}`));

if (failures.length) {
  console.error('\nPlayer Guidance smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nPlayer Guidance smoke passed: focused first action, progressive HQ disclosure and investigative agency coexist in v${pkg.version}.`);
