export {};

type CameraMoment = {
  subject: string;
  note: string;
  x: string;
  direction: 'left' | 'right' | 'still';
  door: string;
  visible: boolean;
  subjectClass: string;
};

const BUILD = 'v0.3.4';

const CAMERA_MOMENTS: Record<string, CameraMoment> = {
  '22:48': {
    subject: 'Елена Ветрова',
    note: 'Подходит к номеру 314 и останавливается у двери.',
    x: '72%',
    direction: 'right',
    door: '314',
    visible: true,
    subjectClass: 'subject-elena'
  },
  '23:04': {
    subject: 'Елена Ветрова',
    note: 'Уходит от номера 314 в сторону своего номера 307.',
    x: '23%',
    direction: 'left',
    door: '307',
    visible: true,
    subjectClass: 'subject-elena'
  },
  '23:41': {
    subject: 'Кирилл Бессонов',
    note: 'Входит в соседний номер 312. После этого в коридоре его не видно.',
    x: '49%',
    direction: 'right',
    door: '312',
    visible: true,
    subjectClass: 'subject-kirill'
  },
  '23:47': {
    subject: 'Илья Соколов',
    note: 'Выходит из номера 314 и направляется за горячей водой.',
    x: '66%',
    direction: 'left',
    door: '314',
    visible: true,
    subjectClass: 'subject-ilya'
  },
  '23:50': {
    subject: 'Илья Соколов',
    note: 'Возвращается и входит в номер 314. Это последнее подтверждённое появление Ильи.',
    x: '76%',
    direction: 'right',
    door: '314',
    visible: true,
    subjectClass: 'subject-ilya'
  },
  '00:17': {
    subject: 'Движение не обнаружено',
    note: 'Сообщение Ильи отправлено, но в гостевом коридоре никто не появляется.',
    x: '50%',
    direction: 'still',
    door: '—',
    visible: false,
    subjectClass: 'subject-none'
  }
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

  let marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (!marker) {
    marker = createElement('div', 'dbr-build-marker');
    marker.setAttribute('aria-label', `Версия приложения ${BUILD}`);
    document.body.appendChild(marker);
  }
  marker.textContent = BUILD;
}

function explainLockedCamera(): void {
  document.querySelectorAll<HTMLButtonElement>('.premium-evidence-card').forEach((card) => {
    const title = card.querySelector('h2')?.textContent?.trim();
    if (title !== 'Коридорная камера' || !card.disabled) return;
    const description = card.querySelector<HTMLParagraphElement>('.evidence-card-copy p');
    if (description) description.textContent = 'Сначала изучите «Журнал замка номера 314». После закрытия журнала камера откроется автоматически.';
  });
}

function enhanceRoom(layout: HTMLElement): void {
  const body = layout.parentElement;
  if (!body || layout.dataset.uxEnhanced === BUILD) return;
  layout.dataset.uxEnhanced = BUILD;

  body.querySelectorAll(':scope > .scene-taskbar.room-taskbar').forEach((node) => node.remove());
  layout.querySelectorAll('.room-clue-overlays').forEach((node) => node.remove());

  const task = createElement(
    'div',
    'scene-taskbar room-taskbar',
    '<div><span>ЗАДАЧА ОСМОТРА</span><strong>Нажмите четыре метки на фотографии и изучите найденные детали</strong></div><small>Галочка означает, что зона уже осмотрена</small>'
  );
  body.insertBefore(task, layout);

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
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!frame || !consoleElement || eventButtons.length === 0) return;
  if (root.dataset.uxEnhanced === BUILD) return;

  root.dataset.uxEnhanced = BUILD;
  root.querySelectorAll(':scope > .scene-taskbar.camera-taskbar').forEach((node) => node.remove());

  const task = createElement(
    'div',
    'scene-taskbar camera-taskbar',
    '<div><span>ЗАДАЧА ПО КАМЕРЕ</span><strong>Выберите время снизу и сравните, кто появляется в коридоре</strong></div><small class="camera-view-count">Просмотрено 0 из 6</small>'
  );
  root.prepend(task);

  frame.innerHTML = `
    <div class="cctv-real-stage">
      <div class="cctv-scanlines"></div>
      <div class="cctv-topbar"><span><i></i> CAM 3F · REC</span><time>18.10.2026 · 22:48:00</time></div>
      <div class="cctv-ceiling"><span></span><span></span><span></span></div>
      <div class="cctv-back-wall">
        <div class="cctv-door cctv-door-307"><b>307</b><i></i></div>
        <div class="cctv-door cctv-door-312"><b>312</b><i></i></div>
        <div class="cctv-door cctv-door-314"><b>314</b><i></i></div>
      </div>
      <div class="cctv-floor"><span></span><span></span><span></span><span></span></div>
      <div class="cctv-blind-zone"><strong>СЛЕПАЯ ЗОНА</strong><small>служебный проход вне полного обзора</small></div>
      <div class="cctv-person subject-elena direction-right">
        <div class="person-head"></div><div class="person-body"></div><div class="person-leg left"></div><div class="person-leg right"></div>
        <b>Елена Ветрова</b><small>идёт к номеру 314 →</small>
      </div>
      <div class="cctv-empty"><span>NO MOTION</span><strong>Движение не обнаружено</strong></div>
      <div class="cctv-event-card"><time>22:48</time><div><span>ЗАФИКСИРОВАНО</span><strong>Елена подходит к номеру 314</strong><p>Подходит к номеру 314 и останавливается у двери.</p></div></div>
      <div class="cctv-help">Нажмите на другую отметку времени под кадром</div>
    </div>`;

  const stage = frame.querySelector<HTMLElement>('.cctv-real-stage');
  const topTime = frame.querySelector<HTMLTimeElement>('.cctv-topbar time');
  const person = frame.querySelector<HTMLElement>('.cctv-person');
  const personName = person?.querySelector<HTMLElement>('b');
  const personDirection = person?.querySelector<HTMLElement>('small');
  const empty = frame.querySelector<HTMLElement>('.cctv-empty');
  const cardTime = frame.querySelector<HTMLTimeElement>('.cctv-event-card time');
  const cardTitle = frame.querySelector<HTMLElement>('.cctv-event-card strong');
  const cardText = frame.querySelector<HTMLElement>('.cctv-event-card p');
  const count = task.querySelector<HTMLElement>('.camera-view-count');
  const viewed = new Set<string>();

  if (!stage || !topTime || !person || !personName || !personDirection || !empty || !cardTime || !cardTitle || !cardText) return;

  const selectMoment = (button: HTMLButtonElement): void => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    const description = button.querySelector('span')?.textContent?.trim() ?? '';
    const moment = CAMERA_MOMENTS[time];
    if (!moment) return;

    viewed.add(time);
    eventButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active-moment', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    stage.dataset.time = time;
    stage.dataset.door = moment.door;
    topTime.textContent = `18.10.2026 · ${time}:00`;
    cardTime.textContent = time;
    cardTitle.textContent = description;
    cardText.textContent = moment.note;

    person.className = `cctv-person ${moment.subjectClass} direction-${moment.direction}`;
    person.style.left = moment.x;
    person.hidden = !moment.visible;
    empty.hidden = moment.visible;
    personName.textContent = moment.subject;
    personDirection.textContent = moment.direction === 'left' ? `← движение к номеру ${moment.door}` : moment.direction === 'right' ? `движение к номеру ${moment.door} →` : '';

    if (count) {
      count.textContent = `Просмотрено ${viewed.size} из ${eventButtons.length}`;
      if (viewed.size === eventButtons.length) count.textContent = 'Все кадры просмотрены — выберите ответ справа';
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
  window.setTimeout(scan, 100);
  window.setTimeout(scan, 350);
}, true);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
else scan();

const startupPoll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(startupPoll), 12000);
