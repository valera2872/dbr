export {};

type CameraMoment = {
  time: string;
  subject: string;
  shortSubject: string;
  badge: string;
  action: string;
  note: string;
  x: string;
  door: '307' | '312' | '314' | 'none';
  direction: 'left' | 'right' | 'still';
  accent: string;
  empty?: boolean;
};

const BUILD = 'v0.4.6';

const MOMENTS: CameraMoment[] = [
  {
    time: '22:48',
    subject: 'Елена Ветрова',
    shortSubject: 'Елена',
    badge: 'Е',
    action: 'подходит к номеру 314',
    note: 'Елена останавливается у двери 314 и разговаривает с Ильёй.',
    x: '76%',
    door: '314',
    direction: 'right',
    accent: '#d8829b'
  },
  {
    time: '23:04',
    subject: 'Елена Ветрова',
    shortSubject: 'Елена',
    badge: 'Е',
    action: 'возвращается к номеру 307',
    note: 'После разговора Елена идёт по коридору обратно к своему номеру.',
    x: '27%',
    door: '307',
    direction: 'left',
    accent: '#d8829b'
  },
  {
    time: '23:41',
    subject: 'Кирилл Бессонов',
    shortSubject: 'Кирилл',
    badge: 'К',
    action: 'входит в номер 312',
    note: 'Кирилл входит в соседний с 314-м номер и больше в коридоре не появляется.',
    x: '55%',
    door: '312',
    direction: 'right',
    accent: '#7fa9d8'
  },
  {
    time: '23:47',
    subject: 'Илья Соколов',
    shortSubject: 'Илья',
    badge: 'И',
    action: 'выходит из номера 314',
    note: 'Илья покидает номер и направляется по коридору за горячей водой.',
    x: '74%',
    door: '314',
    direction: 'left',
    accent: '#a7ba77'
  },
  {
    time: '23:50',
    subject: 'Илья Соколов',
    shortSubject: 'Илья',
    badge: 'И',
    action: 'возвращается в номер 314',
    note: 'Это последнее подтверждённое появление Ильи в гостевом коридоре.',
    x: '79%',
    door: '314',
    direction: 'right',
    accent: '#a7ba77'
  },
  {
    time: '00:17',
    subject: 'Коридор пуст',
    shortSubject: 'Пусто',
    badge: '',
    action: 'людей в зоне камеры нет',
    note: 'Сообщение отправлено в 00:17, но камера не фиксирует ни Илью, ни другого человека.',
    x: '50%',
    door: 'none',
    direction: 'still',
    accent: '#e58a82',
    empty: true
  }
];

function setVersion(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;
  document.documentElement.dataset.dbrBuild = BUILD;
  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;
}

function relabelQuestion(question: HTMLElement): void {
  const kicker = question.querySelector<HTMLElement>('.premium-kicker');
  const heading = question.querySelector<HTMLElement>('h2');
  const buttons = Array.from(question.querySelectorAll<HTMLButtonElement>('button'));

  if (kicker) kicker.textContent = 'ВЫВОД ПО КАМЕРЕ';
  if (heading) heading.textContent = 'Что подтверждает последовательность событий?';

  if (buttons[0]) buttons[0].textContent = 'Илья вышел из номера после 23:50';
  if (buttons[1]) buttons[1].textContent = 'Кирилл вошёл в 314 через главный вход';
  if (buttons[2]) buttons[2].textContent = 'Илья вернулся в 314, но его выход через коридор не зафиксирован';
  if (buttons[3]) buttons[3].textContent = 'Запись камеры прерывалась после 23:50';
}

function createTimelineButton(moment: CameraMoment): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'one-corridor-event';
  button.dataset.time = moment.time;
  button.innerHTML = `
    <time>${moment.time}</time>
    <span>${moment.shortSubject}</span>
    <small>${moment.action}</small>
  `;
  return button;
}

function enhanceCamera(root: HTMLElement): void {
  if (root.dataset.reconstruction === BUILD) return;

  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const question = root.querySelector<HTMLElement>('.camera-question');
  const taskbar = root.querySelector<HTMLElement>('.scene-taskbar');
  if (!frame || !question) return;

  root.dataset.reconstruction = BUILD;

  if (taskbar) {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const helper = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = 'Переключайте время и сопоставляйте подтверждённые появления у дверей 307, 312 и 314';
    if (helper) helper.textContent = 'Это реконструкция по журналу камеры, а не восстановленный видеокадр';
  }

  relabelQuestion(question);

  const layout = document.createElement('div');
  layout.className = 'one-corridor-layout';

  const main = document.createElement('section');
  main.className = 'one-corridor-main';
  main.innerHTML = `
    <header class="one-corridor-heading">
      <div>
        <span>CAM 3F · РЕКОНСТРУКЦИЯ</span>
        <h2>Перемещения в коридоре</h2>
      </div>
      <small>Схема показывает только подтверждённые события в зоне обзора стационарной камеры.</small>
    </header>

    <div class="reconstruction-stage" data-time="22:48" data-direction="right">
      <div class="reconstruction-grid"></div>
      <div class="camera-origin">
        <span class="camera-origin-icon"></span>
        <strong>CAM 3F</strong>
        <small>главный коридор</small>
      </div>
      <div class="camera-view-cone"></div>

      <div class="room-strip" aria-hidden="true">
        <div class="room-cell room-307"><span>307</span><small>номер Елены</small></div>
        <div class="room-cell room-312"><span>312</span><small>соседний номер</small></div>
        <div class="room-cell room-314"><span>314</span><small>номер Ильи</small></div>
      </div>

      <div class="corridor-lane" aria-hidden="true">
        <span class="lane-line lane-line-top"></span>
        <span class="lane-line lane-line-bottom"></span>
        <span class="lane-label">ГОСТЕВОЙ КОРИДОР · ЗОНА ОБЗОРА</span>
      </div>

      <div class="reconstruction-marker">
        <span class="marker-pulse"></span>
        <span class="marker-badge">Е</span>
        <span class="marker-motion"><i></i></span>
        <div class="marker-card">
          <small>ПОДТВЕРЖДЕНО КАМЕРОЙ</small>
          <strong>Елена Ветрова</strong>
          <p>подходит к номеру 314</p>
        </div>
      </div>

      <div class="reconstruction-empty" hidden>
        <span>00:17 · НЕТ ДВИЖЕНИЯ</span>
        <strong>Коридор пуст</strong>
        <p>В зоне дверей 307, 312 и 314 никто не появляется.</p>
      </div>

      <div class="reconstruction-readout">
        <time>22:48</time>
        <div>
          <strong>Елена Ветрова: подходит к номеру 314</strong>
          <p>Елена останавливается у двери 314 и разговаривает с Ильёй.</p>
        </div>
      </div>
    </div>

    <nav class="one-corridor-timeline" aria-label="События камеры"></nav>
  `;

  const timeline = main.querySelector<HTMLElement>('.one-corridor-timeline');
  const stage = main.querySelector<HTMLElement>('.reconstruction-stage');
  const marker = main.querySelector<HTMLElement>('.reconstruction-marker');
  const markerBadge = main.querySelector<HTMLElement>('.marker-badge');
  const markerName = main.querySelector<HTMLElement>('.marker-card strong');
  const markerAction = main.querySelector<HTMLElement>('.marker-card p');
  const empty = main.querySelector<HTMLElement>('.reconstruction-empty');
  const readoutTime = main.querySelector<HTMLTimeElement>('.reconstruction-readout time');
  const readoutTitle = main.querySelector<HTMLElement>('.reconstruction-readout strong');
  const readoutText = main.querySelector<HTMLElement>('.reconstruction-readout p');
  const rooms = {
    '307': main.querySelector<HTMLElement>('.room-307'),
    '312': main.querySelector<HTMLElement>('.room-312'),
    '314': main.querySelector<HTMLElement>('.room-314')
  };

  if (!timeline || !stage || !marker || !markerBadge || !markerName || !markerAction || !empty || !readoutTime || !readoutTitle || !readoutText) return;

  const aside = document.createElement('aside');
  aside.className = 'one-corridor-aside';
  aside.innerHTML = `
    <section class="one-corridor-task">
      <span>ЧТО НУЖНО СОПОСТАВИТЬ</span>
      <ol>
        <li><b>1</b><p><strong>23:41</strong><small>Кирилл входит в соседний номер 312.</small></p></li>
        <li><b>2</b><p><strong>23:50</strong><small>Илья возвращается в номер 314.</small></p></li>
        <li><b>3</b><p><strong>00:17</strong><small>Коридор пуст: новый выход Ильи не зафиксирован.</small></p></li>
      </ol>
      <p class="one-corridor-limit"><strong>Ограничение:</strong> камера видит основной гостевой коридор, но не служебные или скрытые пути.</p>
    </section>
  `;
  aside.append(question);

  const buttons: HTMLButtonElement[] = [];
  const viewed = new Set<string>();

  const selectMoment = (moment: CameraMoment): void => {
    viewed.add(moment.time);
    buttons.forEach((button) => button.classList.toggle('is-active', button.dataset.time === moment.time));

    stage.dataset.time = moment.time;
    stage.dataset.direction = moment.direction;
    stage.style.setProperty('--event-accent', moment.accent);
    readoutTime.textContent = moment.time;
    readoutTitle.textContent = `${moment.subject}: ${moment.action}`;
    readoutText.textContent = moment.note;

    Object.entries(rooms).forEach(([room, element]) => {
      element?.classList.toggle('is-active', room === moment.door);
    });

    if (moment.empty) {
      marker.hidden = true;
      empty.hidden = false;
    } else {
      marker.hidden = false;
      empty.hidden = true;
      marker.style.left = moment.x;
      marker.dataset.labelSide = Number.parseFloat(moment.x) > 60 ? 'left' : 'right';
      markerBadge.textContent = moment.badge;
      markerName.textContent = moment.subject;
      markerAction.textContent = moment.action;
    }

    const taskItems = Array.from(aside.querySelectorAll<HTMLLIElement>('.one-corridor-task li'));
    taskItems[0]?.classList.toggle('is-seen', viewed.has('23:41'));
    taskItems[1]?.classList.toggle('is-seen', viewed.has('23:50'));
    taskItems[2]?.classList.toggle('is-seen', viewed.has('00:17'));
  };

  MOMENTS.forEach((moment) => {
    const button = createTimelineButton(moment);
    button.addEventListener('click', () => selectMoment(moment));
    buttons.push(button);
    timeline.append(button);
  });

  layout.append(main, aside);
  frame.replaceChildren(layout);
  consoleElement?.remove();
  selectMoment(MOMENTS[0]);
}

function scan(): void {
  setVersion();
  document.querySelectorAll<HTMLElement>('.camera-evidence').forEach(enhanceCamera);
}

let scheduled = false;
function scheduleScan(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(scan, 80), true);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
else scan();

const poll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(poll), 12000);
