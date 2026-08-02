export {};

import sprite from './cameraFrameAssets/sprite';

type FrameMoment = {
  name: string;
  action: string;
  position: string;
  empty: boolean;
};

const BUILD = 'v0.4.0';

const FRAMES: Record<string, FrameMoment> = {
  '22:48': { name: 'Елена Ветрова', action: 'подходит к номеру 314', position: '0% 0%', empty: false },
  '23:04': { name: 'Елена Ветрова', action: 'уходит в сторону номера 307', position: '50% 0%', empty: false },
  '23:41': { name: 'Кирилл Бессонов', action: 'входит в номер 312', position: '100% 0%', empty: false },
  '23:47': { name: 'Илья Соколов', action: 'выходит из номера 314', position: '0% 100%', empty: false },
  '23:50': { name: 'Илья Соколов', action: 'возвращается в номер 314', position: '50% 100%', empty: false },
  '00:17': { name: 'Коридор пуст', action: 'движение не зафиксировано', position: '100% 100%', empty: true }
};

function setVersion(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;
  document.documentElement.dataset.dbrBuild = BUILD;
  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;
}

function enhanceCamera(root: HTMLElement): void {
  if (root.dataset.realFrames === BUILD) return;

  const stage = root.querySelector<HTMLElement>('.cctv-photo-stage');
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!stage || buttons.length === 0) return;

  root.dataset.realFrames = BUILD;
  stage.querySelectorAll('.cctv-real-frame, .cctv-real-empty').forEach((node) => node.remove());

  const frame = document.createElement('div');
  frame.className = 'cctv-real-frame';
  frame.setAttribute('role', 'img');
  frame.style.backgroundImage = `url("${sprite}")`;

  const empty = document.createElement('div');
  empty.className = 'cctv-real-empty';
  empty.hidden = true;
  empty.innerHTML = '<span>КОНТРОЛЬНЫЙ КАДР</span><strong>Движение не обнаружено</strong><small>После возвращения Ильи коридор остаётся пустым</small>';

  stage.prepend(frame);
  stage.append(empty);

  const render = (time: string): void => {
    const moment = FRAMES[time];
    if (!moment) return;

    stage.classList.remove('real-frame-switch');
    void stage.offsetWidth;
    stage.classList.add('real-frame-switch');

    frame.style.backgroundPosition = moment.position;
    frame.setAttribute('aria-label', moment.empty ? 'Пустой гостиничный коридор' : `${moment.name}: ${moment.action}`);
    empty.hidden = !moment.empty;

    const timeOverlay = stage.querySelector<HTMLTimeElement>('.cctv-topbar time');
    if (timeOverlay) timeOverlay.textContent = `18.10.2026 · ${time}:00`;
  };

  buttons.forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    if (!FRAMES[time]) return;
    button.addEventListener('click', () => render(time));
  });

  const active = buttons.find((button) => button.classList.contains('active-moment')) ?? buttons[0];
  render(active.querySelector('time')?.textContent?.trim() ?? '22:48');
}

function scan(): void {
  setVersion();
  document.querySelectorAll<HTMLElement>('.camera-evidence').forEach(enhanceCamera);
}

let scheduled = false;
const scheduleScan = (): void => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
};

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(scan, 80), true);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
else scan();

const poll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(poll), 12000);
