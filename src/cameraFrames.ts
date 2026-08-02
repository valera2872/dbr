export {};

type CameraMoment = {
  time: string;
  subject: string;
  shortSubject: string;
  action: string;
  note: string;
  portrait: string;
  x: string;
  y: string;
  door: '307' | '312' | '314' | 'none';
  direction: 'left' | 'right' | 'still';
  empty?: boolean;
};

const BUILD = 'v0.4.3';
const MASTER_CORRIDOR = 'https://images.unsplash.com/photo-1706801582308-d4eda88de11f?auto=format&fit=crop&w=2400&q=92';

const MOMENTS: CameraMoment[] = [
  {
    time: '22:48',
    subject: 'Елена Ветрова',
    shortSubject: 'Елена',
    action: 'подходит к номеру 314',
    note: 'Елена останавливается у двери 314 и разговаривает с Ильёй.',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&q=88',
    x: '76%',
    y: '48%',
    door: '314',
    direction: 'right'
  },
  {
    time: '23:04',
    subject: 'Елена Ветрова',
    shortSubject: 'Елена',
    action: 'уходит к номеру 307',
    note: 'После разговора Елена возвращается по коридору к своему номеру.',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&q=88',
    x: '24%',
    y: '52%',
    door: '307',
    direction: 'left'
  },
  {
    time: '23:41',
    subject: 'Кирилл Бессонов',
    shortSubject: 'Кирилл',
    action: 'входит в номер 312',
    note: 'Кирилл входит в соседний с 314-м номер и больше в коридоре не появляется.',
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=88',
    x: '61%',
    y: '45%',
    door: '312',
    direction: 'right'
  },
  {
    time: '23:47',
    subject: 'Илья Соколов',
    shortSubject: 'Илья',
    action: 'выходит из номера 314',
    note: 'Илья покидает номер и идёт за горячей водой.',
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=420&q=88',
    x: '72%',
    y: '50%',
    door: '314',
    direction: 'left'
  },
  {
    time: '23:50',
    subject: 'Илья Соколов',
    shortSubject: 'Илья',
    action: 'возвращается в номер 314',
    note: 'Это последнее подтверждённое появление Ильи в гостевом коридоре.',
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=420&q=88',
    x: '79%',
    y: '48%',
    door: '314',
    direction: 'right'
  },
  {
    time: '00:17',
    subject: 'Движение не обнаружено',
    shortSubject: 'Пусто',
    action: 'коридор остаётся пустым',
    note: 'Сообщение отправлено в 00:17, но камера не фиксирует ни Илью, ни другого человека.',
    portrait: '',
    x: '50%',
    y: '50%',
    door: 'none',
    direction: 'still',
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
  if (heading) heading.textContent = 'Что подтверждает последовательность кадров?';

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
  if (root.dataset.oneCorridor === BUILD) return;

  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const question = root.querySelector<HTMLElement>('.camera-question');
  const taskbar = root.querySelector<HTMLElement>('.scene-taskbar');
  if (!frame || !question) return;

  root.dataset.oneCorridor = BUILD;

  if (taskbar) {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const helper = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = 'Одна стационарная камера. Переключайте время и следите, кто появляется у дверей 307, 312 и 314';
    if (helper) helper.textContent = 'Коридор и ракурс не меняются — меняются только участники события';
  }

  relabelQuestion(question);

  const layout = document.createElement('div');
  layout.className = 'one-corridor-layout';

  const main = document.createElement('section');
  main.className = 'one-corridor-main';
  main.innerHTML = `
    <header class="one-corridor-heading">
      <div><span>CAM 3F · НЕПРЕРЫВНАЯ ЗАПИСЬ</span><h2>Коридор третьего этажа</h2></div>
      <small>Система анализа выделяет лицо и ближайшую дверь. Это отметка поверх исходного кадра, а не отдельная фотография.</small>
    </header>
    <div class="one-corridor-stage">
      <img class="one-corridor-photo" src="${MASTER_CORRIDOR}" alt="Один и тот же коридор третьего этажа" loading="eager" referrerpolicy="no-referrer" />
      <div class="one-corridor-grade"></div>
      <div class="one-corridor-topbar"><span><i></i> CAM 3F · REC</span><time>18.10.2026 · 22:48:00</time></div>
      <span class="one-door door-307">307</span>
      <span class="one-door door-312">312</span>
      <span class="one-door door-314">314</span>
      <div class="one-corridor-target">
        <span class="target-line"></span>
        <div class="target-card">
          <img alt="" />
          <div><small>РАСПОЗНАНО</small><strong></strong><p></p></div>
        </div>
      </div>
      <div class="one-corridor-empty" hidden>
        <span>NO MOTION</span>
        <strong>Движение не обнаружено</strong>
        <small>Камера не фиксирует людей у дверей 307–314</small>
      </div>
      <div class="one-corridor-caption">
        <time>22:48</time>
        <div><strong>Елена подходит к номеру 314</strong><p></p></div>
      </div>
    </div>
    <nav class="one-corridor-timeline" aria-label="События камеры"></nav>
  `;

  const timeline = main.querySelector<HTMLElement>('.one-corridor-timeline');
  const stage = main.querySelector<HTMLElement>('.one-corridor-stage');
  const topTime = main.querySelector<HTMLTimeElement>('.one-corridor-topbar time');
  const target = main.querySelector<HTMLElement>('.one-corridor-target');
  const targetImage = main.querySelector<HTMLImageElement>('.target-card img');
  const targetName = main.querySelector<HTMLElement>('.target-card strong');
  const targetAction = main.querySelector<HTMLElement>('.target-card p');
  const empty = main.querySelector<HTMLElement>('.one-corridor-empty');
  const captionTime = main.querySelector<HTMLTimeElement>('.one-corridor-caption time');
  const captionTitle = main.querySelector<HTMLElement>('.one-corridor-caption strong');
  const captionText = main.querySelector<HTMLElement>('.one-corridor-caption p');
  const doors = {
    '307': main.querySelector<HTMLElement>('.door-307'),
    '312': main.querySelector<HTMLElement>('.door-312'),
    '314': main.querySelector<HTMLElement>('.door-314')
  };

  if (!timeline || !stage || !topTime || !target || !targetImage || !targetName || !targetAction || !empty || !captionTime || !captionTitle || !captionText) return;

  const aside = document.createElement('aside');
  aside.className = 'one-corridor-aside';
  aside.innerHTML = `
    <section class="one-corridor-task">
      <span>ЧТО НУЖНО УВИДЕТЬ</span>
      <ol>
        <li><b>1</b><p><strong>23:41</strong><small>Кирилл входит в соседний номер 312.</small></p></li>
        <li><b>2</b><p><strong>23:50</strong><small>Илья возвращается в номер 314.</small></p></li>
        <li><b>3</b><p><strong>00:17</strong><small>Коридор пуст: выход Ильи не зафиксирован.</small></p></li>
      </ol>
      <p class="one-corridor-limit"><strong>Ограничение:</strong> камера видит гостевой коридор, но не скрытые или служебные пути.</p>
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
    topTime.textContent = `18.10.2026 · ${moment.time}:00`;
    captionTime.textContent = moment.time;
    captionTitle.textContent = `${moment.subject}: ${moment.action}`;
    captionText.textContent = moment.note;

    Object.entries(doors).forEach(([door, element]) => {
      element?.classList.toggle('is-active', door === moment.door);
    });

    if (moment.empty) {
      target.hidden = true;
      empty.hidden = false;
    } else {
      target.hidden = false;
      empty.hidden = true;
      target.style.left = moment.x;
      target.style.top = moment.y;
      targetImage.src = moment.portrait;
      targetImage.alt = moment.subject;
      targetName.textContent = moment.subject;
      targetAction.textContent = moment.action;
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
