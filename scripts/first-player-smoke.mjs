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
const fixes = read('src/firstPlayerFixes.ts');
const css = read('src/firstPlayerFixes.css');
const media = read('src/localMediaRuntime.ts');
const localCss = read('src/localMedia.css');
const test = read('tests/e2e/first-player-flow.spec.ts');

check(['0.8.8','0.8.9','0.9.0','0.9.1','0.9.2','0.9.3','0.9.4','0.9.5','0.9.6'].includes(pkg.version), 'First-player fixes должны сохраняться в релизах 0.8.8+');
check(build.includes(`APP_BUILD = 'v${pkg.version}'`), 'APP_BUILD должен совпадать с package version');
check(exists('src/firstPlayerFixes.ts'), 'Нет слоя исправлений первого прохождения');
check(exists('src/firstPlayerFixes.css'), 'Нет стилей исправлений первого прохождения');
check(exists('tests/e2e/first-player-flow.spec.ts'), 'Нет браузерной проверки первого прохождения');
check(main.includes("./firstPlayerFixes"), 'main.tsx не подключает first-player runtime');
check(main.includes("./firstPlayerFixes.css"), 'main.tsx не подключает first-player стили');
check(main.includes("./localMediaRuntime"), 'Гибридный медиаслой не подключён');

[
  'Выбрано сейчас','Закрытое окно','Добавлено в закладки следователя','Закладки следователя',
  'Следующий обязательный шаг','Перейти к людям','Открыть отчёт №1'
].forEach((token) => check(fixes.includes(token), `First-player runtime не содержит: ${token}`));

check(!fixes.includes('new MutationObserver'), 'First-player runtime не должен создавать MutationObserver');
check(!fixes.includes('setInterval'), 'First-player runtime не должен использовать polling');
check(fixes.includes('requestAnimationFrame'), 'First-player runtime не синхронизируется с React через кадр');
check(css.includes('.room-marker.current'), 'Нет явного состояния последней выбранной точки E001');
check(css.includes('.first-player-route-banner'), 'Нет заметного указателя следующего шага');
check(media.includes('REALISTIC_PRIMARY_MEDIA = true'), 'Реалистичные первичные фотографии не включены');
check(localCss.includes('images.unsplash.com'), 'Обложка не использует реалистичный production-референс');

[
  'Следы перемещения','Закрытое окно','not.toContainText(\'Ворс приглажен\')','Добавлено в закладки','Перейти к людям'
].forEach((token) => check(test.includes(token), `Браузерный тест не проверяет: ${token}`));

if (failures.length) {
  console.error('\nFirst-player smoke failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nFirst-player smoke passed: E001 selection, meaningful bookmarks, E005 routing and realistic primary media are present.');
