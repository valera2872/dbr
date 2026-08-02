type CameraMoment = {
  subject: string;
  position: string;
  lane: 'guest' | 'service';
  note: string;
};

const BUILD = 'v0.3.2';

const CAMERA_MOMENTS: Record<string, CameraMoment> = {
  '22:48': { subject: 'Елена', position: '72%', lane: 'guest', note: 'Подходит к двери номера 314.' },
  '23:04': { subject: 'Елена', position: '16%', lane: 'guest', note: 'Уходит в сторону номера 307.' },
  '23:41': { subject: 'Кирилл', position: '34%', lane: 'guest', note: 'Входит в соседний номер 312.' },
  '23:47': { subject: 'Илья', position: '67%', lane: 'guest', note: 'Выходит из номера 314 за горячей водой.' },
  '23:50': { subject: 'Илья', position: '73%', lane: 'guest', note: 'Возвращается в номер 314. Это его последнее подтверждённое появление.' },
  '00:17': { subject: 'Нет движения', position: '50%', lane: 'service', note: 'Сообщение отправлено, но в гостевом коридоре никто не появляется.' }
};

function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, html = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  element.innerHTML = html;
  return element;
}

function installBuildMarker(): void {
  document.documentElement.dataset.dbrBuild = BUILD;
  document.title = `ДБР — Номер 314 · ${BUILD}`;

  if (document.querySelector('.dbr-build-marker')) return;
  const marker = createElement('div', 'dbr-build-marker', BUILD);
  marker.setAttribute('aria-label', `Версия приложения ${BUILD}`);
  document.body.appendChild(marker);
}

function explainLockedCamera(): void {
  document.querySelectorAll<HTMLButtonElement>('.premium-evidence-card').forEach((card) => {
    const title = card.querySelector('h2')?.textContent?.trim();
    if (title !== 'Коридорная камера' || !card.disabled) return;
    const description = card.querySelector<HTMLParagraphElement>('.evidence-card-copy p');
    if (description) description.textContent = 'Сначала изучите «Журнал замка номера 314» (E003). После этого камера откроется автоматически.';
  });
}

function enhanceRoom(layout: HTMLElement): void {
  const body = layout.parentElement;
  const image = layout.querySelector<HTMLElement>('.premium-room-image');
  if (!body || !image) return;
  if (layout.dataset.uxEnhanced === BUILD) return;

  layout.dataset.uxEnhanced = BUILD;
  body.querySelectorAll(':scope > .scene-taskbar.room-taskbar').forEach((node) => node.remove());
  image.querySelectorAll(':scope > .room-clue-overlays').forEach((node) => node.remove());

  const task = createElement(
    'div',
    'scene-taskbar room-taskbar',
    '<div><span>ЗАДАЧА ОСМОТРА</span><strong>Найдите четыре детали, исключающие обычный уход из номера</strong></div><small>Нажимайте на подписанные метки прямо на фотографии</small>'
  );
  body.insertBefore(task, layout);

  const props = createElement(
    'div',
    'room-clue-overlays',
    '<span class="clue-prop clue-window" aria-hidden="true"></span>' +
      '<span class="clue-prop clue-impact" aria-hidden="true"></span>' +
      '<span class="clue-prop clue-bag" aria-hidden="true"><i></i></span>' +
      '<span class="clue-prop clue-drag one" aria-hidden="true"></span>' +
      '<span class="clue-prop clue-drag two" aria-hidden="true"></span>'
  );
  image.appendChild(props);

  const labelByZone: Record<string, string> = {
    'Осмотреть Окно': 'Окно',
    'Осмотреть Письменный стол': 'Стол',
    'Осмотреть Сумка': 'Сумка',
    'Осмотреть Ковёр': 'Ковёр'
  };

  layout.querySelectorAll<HTMLButtonElement>('.room-marker').forEach((marker) => {
    const label = marker.getAttribute('aria-label') ?? '';
    const shortLabel = labelByZone[label];
    if (!shortLabel) return;
    marker.dataset.zoneLabel = shortLabel;
    const visibleLabel = marker.querySelector<HTMLElement>('i');
    if (visibleLabel) visibleLabel.textContent = shortLabel;
  });
}

function enhanceCamera(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!frame || eventButtons.length === 0) return;
  if (root.dataset.uxEnhanced === BUILD) return;

  root.dataset.uxEnhanced = BUILD;
  root.querySelectorAll(':scope > .scene-taskbar.camera-taskbar').forEach((node) => node.remove());
  frame.querySelectorAll(':scope > .corridor-map').forEach((node) => node.remove());

  const task = createElement(
    'div',
    'scene-taskbar camera-taskbar',
    '<div><span>ЗАДАЧА ПО КАМЕРЕ</span><strong>Просмотрите отметки и найдите последнее появление Ильи</strong></div><small class="camera-view-count">Просмотрено 0 из 6</small>'
  );
  root.prepend(task);

  const map = createElement(
    'div',
    'corridor-map',
    '<div class="camera-cone"></div>' +
      '<div class="corridor-wall top"><span class="door door-307">307</span><span class="door door-312">312</span><span class="door door-314">314</span></div>' +
      '<div class="corridor-path"><span>ГОСТЕВОЙ КОРИДОР</span></div>' +
      '<div class="service-pocket"><span>СЛУЖЕБНАЯ ЗОНА</span><small>частично вне обзора</small></div>' +
      '<div class="camera-device"><b>CAM 3F</b><i></i></div>' +
      '<div class="tracked-person"><span></span><strong></strong></div>' +
      '<div class="camera-moment-card"><time></time><div><strong></strong><p></p></div></div>'
  );
  frame.appendChild(map);

  const viewed = new Set<string>();
  const count = task.querySelector<HTMLElement>('.camera-view-count');
  const tracked = map.querySelector<HTMLElement>('.tracked-person');
  const momentTime = map.querySelector<HTMLTimeElement>('.camera-moment-card time');
  const momentTitle = map.querySelector<HTMLElement>('.camera-moment-card strong');
  const momentText = map.querySelector<HTMLElement>('.camera-moment-card p');

  const selectMoment = (button: HTMLButtonElement): void => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    const description = button.querySelector('span')?.textContent?.trim() ?? '';
    const moment = CAMERA_MOMENTS[time];
    if (!moment || !tracked || !momentTime || !momentTitle || !momentText) return;

    viewed.add(time);
    eventButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active-moment', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    tracked.style.left = moment.position;
    tracked.classList.toggle('no-movement', moment.subject === 'Нет движения');
    tracked.classList.toggle('service-lane', moment.lane === 'service');
    const trackedLabel = tracked.querySelector<HTMLElement>('strong');
    if (trackedLabel) trackedLabel.textContent = moment.subject;

    momentTime.textContent = time;
    momentTitle.textContent = description || moment.subject;
    momentText.textContent = moment.note;

    if (count) {
      count.textContent = `Просмотрено ${viewed.size} из ${eventButtons.length}`;
      if (viewed.size === eventButtons.length) {
        count.textContent = 'Все отметки просмотрены — выберите ответ ниже';
        root.classList.add('camera-review-complete');
      }
    }
  };

  eventButtons.forEach((button) => {
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectMoment(button));
  });

  selectMoment(eventButtons[0]);
}

function scan(): void {
  installBuildMarker();
  explainLockedCamera();
  document.querySelectorAll<HTMLElement>('.premium-room-layout').forEach(enhanceRoom);
  document.querySelectorAll<HTMLElement>('.camera-evidence').forEach(enhanceCamera);
}

let scheduled = false;
function scheduleScan(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

const observer = new MutationObserver(scheduleScan);
observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('click', () => {
  window.setTimeout(scan, 0);
  window.setTimeout(scan, 120);
  window.setTimeout(scan, 400);
}, true);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scan, { once: true });
} else {
  scan();
}

const startupPoll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(startupPoll), 15000);
