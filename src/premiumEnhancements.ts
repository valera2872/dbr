import { APP_BUILD } from './build';

export {};

type CameraMoment = {
  subject: string;
  title: string;
  note: string;
  x: string;
  y: string;
  direction: string;
  door: string;
  visible: boolean;
  portrait: string;
};

const BUILD = APP_BUILD;
const CORRIDOR_IMAGE = 'https://images.unsplash.com/photo-1725180333682-2746546519a4?auto=format&fit=crop&w=1800&q=82';

const CAMERA_MOMENTS: Record<string, CameraMoment> = {
  '22:48': {
    subject: 'Елена Ветрова',
    title: 'Елена подходит к номеру 314',
    note: 'Она останавливается у двери номера 314 и разговаривает с Ильёй.',
    x: '78%', y: '42%', direction: 'движется к двери 314 →', door: '314', visible: true,
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=82'
  },
  '23:04': {
    subject: 'Елена Ветрова',
    title: 'Елена уходит в сторону номера 307',
    note: 'После разговора она возвращается по коридору к своему номеру.',
    x: '25%', y: '45%', direction: '← уходит к номеру 307', door: '307', visible: true,
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=82'
  },
  '23:41': {
    subject: 'Кирилл Бессонов',
    title: 'Кирилл входит в номер 312',
    note: 'Он входит в соседний номер 312. После этого камера его в коридоре не фиксирует.',
    x: '66%', y: '39%', direction: 'направляется к двери 312 →', door: '312', visible: true,
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=82'
  },
  '23:47': {
    subject: 'Илья Соколов',
    title: 'Илья выходит из номера 314',
    note: 'Он покидает комнату и идёт за горячей водой.',
    x: '73%', y: '43%', direction: '← уходит от двери 314', door: '314', visible: true,
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=82'
  },
  '23:50': {
    subject: 'Илья Соколов',
    title: 'Илья возвращается в номер 314',
    note: 'Это последнее подтверждённое появление Ильи в гостевом коридоре.',
    x: '81%', y: '42%', direction: 'входит в дверь 314 →', door: '314', visible: true,
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=82'
  },
  '00:17': {
    subject: 'Движение не обнаружено',
    title: 'Коридор пуст',
    note: 'Сообщение отправлено в 00:17, но камера не фиксирует движения у дверей 312–314.',
    x: '50%', y: '50%', direction: '', door: '—', visible: false, portrait: ''
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

  const markers = Array.from(document.querySelectorAll<HTMLElement>(
    '.premium-build-marker, .dbr-build-marker, .build-marker'
  ));
  let marker = markers[0];

  if (!marker) {
    marker = createElement('div', 'premium-build-marker');
    document.body.appendChild(marker);
  }

  markers.slice(1).forEach((duplicate) => duplicate.remove());
  marker.classList.remove('dbr-build-marker', 'build-marker');
  marker.classList.add('premium-build-marker');
  marker.textContent = BUILD;
  marker.setAttribute('aria-label', `Версия приложения ${BUILD}`);
}

function explainLockedCamera(): void {
  document.querySelectorAll<HTMLButtonElement>('.premium-evidence-card').forEach((card) => {
    const title = card.querySelector('h2')?.textContent?.trim();
    if (title !== 'Коридорная камера' || !card.disabled) return;
    const description = card.querySelector<HTMLParagraphElement>('.evidence-card-copy p');
    if (description) {
      description.textContent = 'Сначала изучите «Журнал замка номера 314». После закрытия журнала камера откроется автоматически.';
    }
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
    const shortLabel = labelByZone[marker.getAttribute('aria-label') ?? ''];
    if (!shortLabel) return;
    marker.dataset.zoneLabel = shortLabel;
    const visibleLabel = marker.querySelector<HTMLElement>('i');
    if (visibleLabel) visibleLabel.textContent = shortLabel;
  });
}

function enhanceCamera(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!frame || eventButtons.length === 0 || root.dataset.uxEnhanced === BUILD) return;

  root.dataset.uxEnhanced = BUILD;
  root.querySelectorAll(':scope > .scene-taskbar.camera-taskbar').forEach((node) => node.remove());

  const task = createElement(
    'div',
    'scene-taskbar camera-taskbar',
    '<div><span>ЗАДАЧА ПО КАМЕРЕ</span><strong>Нажимайте на время под кадром и сравнивайте, кого зафиксировала камера</strong></div><small class="camera-view-count">Просмотрено 0 из 6</small>'
  );
  root.prepend(task);

  frame.innerHTML = `
    <div class="cctv-photo-stage">
      <img class="cctv-photo" src="${CORRIDOR_IMAGE}" alt="Коридор третьего этажа отеля" />
      <div class="cctv-photo-grade"></div>
      <div class="cctv-scanlines"></div>
      <div class="cctv-topbar"><span><i></i> CAM 3F · REC</span><time>18.10.2026 · 22:48:00</time></div>
      <span class="cctv-room-tag room-307">307</span>
      <span class="cctv-room-tag room-312">312</span>
      <span class="cctv-room-tag room-314">314</span>
      <div class="cctv-track-box">
        <span class="track-corner tl"></span><span class="track-corner tr"></span><span class="track-corner bl"></span><span class="track-corner br"></span>
        <img class="track-portrait" alt="" />
        <strong class="track-name"></strong>
        <small class="track-direction"></small>
      </div>
      <div class="cctv-empty" hidden><span>NO MOTION</span><strong>Движение не обнаружено</strong><small>Гостевой коридор пуст</small></div>
      <div class="cctv-event-card"><time>22:48</time><div><span>ЗАФИКСИРОВАНО</span><strong>Елена подходит к номеру 314</strong><p>Она останавливается у двери номера 314 и разговаривает с Ильёй.</p></div></div>
      <div class="cctv-source">CAM 3F · архив без разрывов</div>
    </div>`;

  const stage = frame.querySelector<HTMLElement>('.cctv-photo-stage');
  const topTime = frame.querySelector<HTMLTimeElement>('.cctv-topbar time');
  const track = frame.querySelector<HTMLElement>('.cctv-track-box');
  const portrait = frame.querySelector<HTMLImageElement>('.track-portrait');
  const name = frame.querySelector<HTMLElement>('.track-name');
  const direction = frame.querySelector<HTMLElement>('.track-direction');
  const empty = frame.querySelector<HTMLElement>('.cctv-empty');
  const cardTime = frame.querySelector<HTMLTimeElement>('.cctv-event-card time');
  const cardTitle = frame.querySelector<HTMLElement>('.cctv-event-card strong');
  const cardText = frame.querySelector<HTMLElement>('.cctv-event-card p');
  const count = task.querySelector<HTMLElement>('.camera-view-count');
  const viewed = new Set<string>();

  if (!stage || !topTime || !track || !portrait || !name || !direction || !empty || !cardTime || !cardTitle || !cardText) return;

  const selectMoment = (button: HTMLButtonElement): void => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
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
    cardTitle.textContent = moment.title;
    cardText.textContent = moment.note;

    track.style.left = moment.x;
    track.style.top = moment.y;
    track.hidden = !moment.visible;
    empty.hidden = moment.visible;
    name.textContent = moment.subject;
    direction.textContent = moment.direction;
    portrait.src = moment.portrait;
    portrait.alt = moment.visible ? moment.subject : '';

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

document.addEventListener('click', () => window.setTimeout(scheduleScan, 0), true);
window.addEventListener('dbr:runtime-settled', scheduleScan);
window.addEventListener('pageshow', scheduleScan);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleScan, { once: true });
} else {
  scheduleScan();
}
