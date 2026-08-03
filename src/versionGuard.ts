export {};

const APP_BUILD = 'v0.5.1';

function applyBuildVersion(): void {
  document.documentElement.dataset.dbrBuild = APP_BUILD;

  const nextTitle = /v\d+\.\d+\.\d+/.test(document.title)
    ? document.title.replace(/v\d+\.\d+\.\d+/, APP_BUILD)
    : `ДБР — Номер 314 · ${APP_BUILD}`;

  if (document.title !== nextTitle) document.title = nextTitle;

  document.querySelectorAll<HTMLElement>('.dbr-build-marker, .build-marker').forEach((marker) => {
    marker.textContent = APP_BUILD;
    marker.setAttribute('aria-label', `Версия приложения ${APP_BUILD}`);
  });
}

const observer = new MutationObserver(applyBuildVersion);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true
});

document.addEventListener('click', () => window.setTimeout(applyBuildVersion, 0), true);
window.addEventListener('pageshow', applyBuildVersion);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyBuildVersion, { once: true });
} else {
  applyBuildVersion();
}

// Legacy modules still contain historical BUILD constants and can rewrite the marker
// asynchronously. Keep the public build identity authoritative until they are refactored.
const guard = window.setInterval(applyBuildVersion, 500);
window.setTimeout(() => window.clearInterval(guard), 15000);
