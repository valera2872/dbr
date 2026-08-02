export {};

type VisibleMoment = {
  name: string;
  portrait: string;
  x: string;
  y: string;
  scale: string;
  direction: 'left' | 'right';
  role: 'elena' | 'kirill' | 'ilya' | 'none';
  visible: boolean;
  action: string;
};

const BUILD = 'v0.3.9';

const MOMENTS: Record<string, VisibleMoment> = {
  '22:48': {
    name: 'Елена Ветрова',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82',
    x: '79%',
    y: '64%',
    scale: '0.94',
    direction: 'right',
    role: 'elena',
    visible: true,
    action: 'подходит к двери 314'
  },
  '23:04': {
    name: 'Елена Ветрова',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82',
    x: '27%',
    y: '63%',
    scale: '0.84',
    direction: 'left',
    role: 'elena',
    visible: true,
    action: 'уходит в сторону 307'
  },
  '23:41': {
    name: 'Кирилл Бессонов',
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=82',
    x: '66%',
    y: '63%',
    scale: '1.04',
    direction: 'right',
    role: 'kirill',
    visible: true,
    action: 'входит в номер 312'
  },
  '23:47': {
    name: 'Илья Соколов',
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=82',
    x: '72%',
    y: '63%',
    scale: '0.99',
    direction: 'left',
    role: 'ilya',
    visible: true,
    action: 'выходит из номера 314'
  },
  '23:50': {
    name: 'Илья Соколов',
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=82',
    x: '82%',
    y: '64%',
    scale: '0.96',
    direction: 'right',
    role: 'ilya',
    visible: true,
    action: 'возвращается в номер 314'
  },
  '00:17': {
    name: 'Коридор пуст',
    portrait: '',
    x: '50%',
    y: '63%',
    scale: '1',
    direction: 'right',
    role: 'none',
    visible: false,
    action: 'движение не зафиксировано'
  }
};

function updateVersion(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;
  document.documentElement.dataset.dbrBuild = BUILD;
  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;
}

function enhanceCamera(root: HTMLElement): void {
  if (root.dataset.motionEnhanced === BUILD) return;

  const stage = root.querySelector<HTMLElement>('.cctv-photo-stage');
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!stage || buttons.length === 0) return;

  root.dataset.motionEnhanced = BUILD;
  stage.querySelectorAll('.cctv-visible-person, .cctv-frame-change').forEach((node) => node.remove());

  const figure = document.createElement('div');
  figure.className = 'cctv-visible-person role-elena direction-right';
  figure.setAttribute('aria-live', 'polite');
  figure.innerHTML = `
    <div class="cctv-person-shadow"></div>
    <div class="cctv-person-box">
      <span class="person-corner tl"></span><span class="person-corner tr"></span>
      <span class="person-corner bl"></span><span class="person-corner br"></span>
      <div class="cctv-body-wrap">
        <div class="cctv-figure-head"><img alt="" /></div>
        <div class="cctv-figure-neck"></div>
        <div class="cctv-figure-torso">
          <span class="cctv-lapel left"></span><span class="cctv-lapel right"></span>
          <span class="cctv-clothing-line"></span>
        </div>
        <div class="cctv-figure-arm left"><span class="cctv-hand"></span></div>
        <div class="cctv-figure-arm right"><span class="cctv-hand"></span></div>
        <div class="cctv-figure-leg left"><span class="cctv-shoe"></span></div>
        <div class="cctv-figure-leg right"><span class="cctv-shoe"></span></div>
      </div>
    </div>
    <div class="cctv-person-caption"><strong></strong><small></small></div>
  `;

  const stamp = document.createElement('div');
  stamp.className = 'cctv-frame-change';
  stamp.innerHTML = '<span>КАДР</span><strong>22:48</strong><small>Елена подходит к двери 314</small>';

  stage.append(figure, stamp);

  const image = figure.querySelector<HTMLImageElement>('img');
  const name = figure.querySelector<HTMLElement>('.cctv-person-caption strong');
  const action = figure.querySelector<HTMLElement>('.cctv-person-caption small');
  const stampTime = stamp.querySelector<HTMLElement>('strong');
  const stampAction = stamp.querySelector<HTMLElement>('small');
  if (!image || !name || !action || !stampTime || !stampAction) return;

  const render = (time: string): void => {
    const moment = MOMENTS[time];
    if (!moment) return;

    stage.classList.remove('cctv-frame-switch');
    void stage.offsetWidth;
    stage.classList.add('cctv-frame-switch');

    figure.style.left = moment.x;
    figure.style.top = moment.y;
    figure.style.setProperty('--person-scale', moment.scale);
    figure.className = `cctv-visible-person role-${moment.role} direction-${moment.direction}`;
    figure.hidden = !moment.visible;

    image.src = moment.portrait;
    image.alt = moment.visible ? moment.name : '';
    name.textContent = moment.name;
    action.textContent = moment.action;
    stampTime.textContent = time;
    stampAction.textContent = moment.visible ? `${moment.name}: ${moment.action}` : moment.action;
    stamp.classList.toggle('empty-frame', !moment.visible);
  };

  buttons.forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    button.addEventListener('click', () => render(time));
  });

  const active = buttons.find((button) => button.classList.contains('active-moment')) ?? buttons[0];
  render(active.querySelector('time')?.textContent?.trim() ?? '22:48');
}

function scan(): void {
  updateVersion();
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
document.addEventListener('click', () => window.setTimeout(scan, 100), true);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
else scan();

const poll = window.setInterval(scan, 250);
window.setTimeout(() => window.clearInterval(poll), 12000);
