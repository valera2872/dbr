export {};

const APP_BUILD = 'v0.5.2';

function applyBuildVersion(): void {
  if (document.documentElement.dataset.dbrBuild !== APP_BUILD) {
    document.documentElement.dataset.dbrBuild = APP_BUILD;
  }

  const nextTitle = /v\d+\.\d+\.\d+/.test(document.title)
    ? document.title.replace(/v\d+\.\d+\.\d+/, APP_BUILD)
    : `ДБР — Номер 314 · ${APP_BUILD}`;

  if (document.title !== nextTitle) document.title = nextTitle;

  document.querySelectorAll<HTMLElement>('.dbr-build-marker, .build-marker').forEach((marker) => {
    if (marker.textContent !== APP_BUILD) marker.textContent = APP_BUILD;
    const label = `Версия приложения ${APP_BUILD}`;
    if (marker.getAttribute('aria-label') !== label) marker.setAttribute('aria-label', label);
  });
}

// Следим только за появлением новых узлов. Изменение текста версии больше не запускает
// рекурсивный цикл наблюдателя и не блокирует главный поток браузера.
const observer = new MutationObserver(() => applyBuildVersion());
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

document.addEventListener('click', () => window.setTimeout(applyBuildVersion, 0), true);
window.addEventListener('pageshow', applyBuildVersion);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyBuildVersion, { once: true });
} else {
  applyBuildVersion();
}

// Старые модули могут один раз поздно переписать метку. Несколько безопасных повторов
// достаточно; постоянного интервала и characterData-наблюдения больше нет.
[100, 500, 1500, 4000, 8000].forEach((delay) => {
  window.setTimeout(applyBuildVersion, delay);
});
