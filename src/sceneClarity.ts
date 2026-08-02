export {};

const BUILD = 'v0.3.3';

function applySceneClarity(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;

  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;

  document.querySelectorAll<HTMLElement>('.room-clue-overlays').forEach((overlay) => overlay.remove());

  document.querySelectorAll<HTMLElement>('.room-taskbar').forEach((taskbar) => {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const hint = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = 'Нажмите четыре метки на фотографии и изучите найденные детали';
    if (hint) hint.textContent = 'Галочка означает, что зона уже осмотрена';
  });

  document.querySelectorAll<HTMLElement>('.camera-taskbar').forEach((taskbar) => {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const hint = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = '1. Нажимайте на время снизу  2. Сравните события  3. Выберите последнее появление Ильи';
    if (hint && !hint.classList.contains('camera-view-count')) hint.textContent = 'Итоговый вопрос находится под временной шкалой';
  });

  document.querySelectorAll<HTMLButtonElement>('.camera-events button').forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    const event = button.querySelector('span')?.textContent?.trim() ?? '';
    button.title = `${time}: ${event}`;
    button.setAttribute('aria-label', `Показать запись ${time}: ${event}`);
  });
}

const observer = new MutationObserver(() => requestAnimationFrame(applySceneClarity));
observer.observe(document.documentElement, { childList: true, subtree: true });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applySceneClarity, { once: true });
} else {
  applySceneClarity();
}
