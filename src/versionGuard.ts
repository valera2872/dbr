import { APP_BUILD } from './build';

export {};

function normalizeTitle(value: string): string {
  return /v\d+\.\d+\.\d+/.test(value)
    ? value.replace(/v\d+\.\d+\.\d+/, APP_BUILD)
    : `ДБР — Номер 314 · ${APP_BUILD}`;
}

function protectBuildMarkers(): void {
  document.querySelectorAll<HTMLElement>(
    '.dbr-build-marker, .build-marker, .premium-build-marker'
  ).forEach((marker) => {
    // Исторические runtime-модули ищут старые классы и переписывают версию.
    // После первого появления переводим метку на единый защищённый класс.
    marker.classList.remove('dbr-build-marker', 'build-marker');
    marker.classList.add('premium-build-marker');
    if (marker.textContent !== APP_BUILD) marker.textContent = APP_BUILD;
    marker.setAttribute('aria-label', `Версия приложения ${APP_BUILD}`);
  });
}

function applyBuildVersion(): void {
  if (document.documentElement.dataset.dbrBuild !== APP_BUILD) {
    document.documentElement.dataset.dbrBuild = APP_BUILD;
  }

  const nextTitle = normalizeTitle(document.title);
  if (document.title !== nextTitle) document.title = nextTitle;
  protectBuildMarkers();
}

// Отслеживаем только появление новых интерфейсных узлов. После защиты метки старые
// модули больше не находят её по своим селекторам и не создают цикл перезаписи.
const appObserver = new MutationObserver(applyBuildVersion);
appObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Заголовок вкладки защищается отдельно. Изменение текста title не запускает
// runtime-наблюдатели приложения, следящие только за childList основного DOM.
const titleElement = document.querySelector('title');
if (titleElement) {
  const titleObserver = new MutationObserver(applyBuildVersion);
  titleObserver.observe(titleElement, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

document.addEventListener('click', () => window.setTimeout(applyBuildVersion, 0), true);
window.addEventListener('pageshow', applyBuildVersion);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyBuildVersion, { once: true });
} else {
  applyBuildVersion();
}

[80, 300, 900, 2200].forEach((delay) => window.setTimeout(applyBuildVersion, delay));
