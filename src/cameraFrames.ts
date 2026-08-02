export {};

const BUILD = 'v0.4.2';
const FRAME_2350 = 'https://images.pexels.com/photos/7599279/pexels-photo-7599279.jpeg?auto=compress&cs=tinysrgb&w=1600';
const FRAME_0017 = 'https://unsplash.com/photos/S78ir0FODg8/download?force=true&w=1600';

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

  if (kicker) kicker.textContent = 'ОДИН ВЫВОД';
  if (heading) heading.textContent = 'Что доказывают эти два кадра?';

  if (buttons[0]) buttons[0].textContent = 'Илья вышел через коридор после 23:50';
  if (buttons[1]) buttons[1].textContent = 'Кирилл вошёл в номер 314 через главную дверь';
  if (buttons[2]) buttons[2].textContent = 'После 23:50 Илья не выходил через главный коридор';
  if (buttons[3]) buttons[3].textContent = 'По этим кадрам нельзя сделать вывод';
}

function createFrame(time: string, title: string, note: string, src: string, empty = false): HTMLElement {
  const figure = document.createElement('figure');
  figure.className = `simple-camera-frame${empty ? ' is-empty' : ''}`;
  figure.innerHTML = `
    <div class="simple-camera-photo">
      <img src="${src}" alt="${title}" loading="eager" referrerpolicy="no-referrer" />
      <div class="simple-camera-stamp"><span><i></i> CAM 3F · REC</span><time>${time}:00</time></div>
    </div>
    <figcaption>
      <time>${time}</time>
      <div><strong>${title}</strong><p>${note}</p></div>
    </figcaption>
  `;
  return figure;
}

function enhanceCamera(root: HTMLElement): void {
  if (root.dataset.simpleCamera === BUILD) return;

  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const question = root.querySelector<HTMLElement>('.camera-question');
  const taskbar = root.querySelector<HTMLElement>('.scene-taskbar');
  if (!frame || !question) return;

  root.dataset.simpleCamera = BUILD;

  if (taskbar) {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const helper = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = 'Посмотрите только на два кадра: вход Ильи и состояние коридора позже';
    if (helper) helper.textContent = 'Ничего искать и переключать не нужно';
  }

  relabelQuestion(question);

  const layout = document.createElement('div');
  layout.className = 'simple-camera-layout';

  const evidence = document.createElement('section');
  evidence.className = 'simple-camera-evidence';
  evidence.innerHTML = `
    <header>
      <span>СРАВНЕНИЕ ЗАПИСИ</span>
      <h2>Что видно на камере?</h2>
    </header>
  `;

  const pair = document.createElement('div');
  pair.className = 'simple-camera-pair';
  pair.append(
    createFrame('23:50', 'Илья возвращается в номер 314', 'Камера фиксирует его вход через главный коридор.', FRAME_2350),
    createFrame('00:17', 'Коридор пуст', 'После входа камера не фиксирует выход Ильи обратно в коридор.', FRAME_0017, true)
  );

  const sequence = document.createElement('div');
  sequence.className = 'simple-camera-sequence';
  sequence.innerHTML = `
    <b>23:50</b><span>Илья входит в 314</span><i>→</i><b>00:17</b><span>коридор пуст</span>
  `;

  const limitation = document.createElement('p');
  limitation.className = 'simple-camera-limit';
  limitation.innerHTML = '<strong>Важно:</strong> камера видит главный коридор, но не служебные пути.';

  evidence.append(pair, sequence, limitation);

  const aside = document.createElement('aside');
  aside.className = 'simple-camera-answer';
  aside.append(question);

  layout.append(evidence, aside);
  frame.replaceChildren(layout);
  consoleElement?.remove();
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
