export {};

import sprite from './cameraFrameAssets/sprite';

const BUILD = 'v0.4.1';

const FRAME_POSITIONS: Record<string, string> = {
  '22:48': '0% 0%',
  '23:04': '50% 0%',
  '23:41': '100% 0%',
  '23:47': '0% 100%',
  '23:50': '50% 100%',
  '00:17': '100% 100%'
};

function setVersion(): void {
  document.title = `ДБР — Номер 314 · ${BUILD}`;
  document.documentElement.dataset.dbrBuild = BUILD;
  const marker = document.querySelector<HTMLElement>('.dbr-build-marker');
  if (marker) marker.textContent = BUILD;
}

function createKeyFrame(
  time: '23:50' | '00:17',
  eyebrow: string,
  title: string,
  note: string
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cctv-key-frame key-${time.replace(':', '')}`;
  button.dataset.time = time;
  button.innerHTML = `
    <span class="key-frame-photo" aria-hidden="true"></span>
    <span class="key-frame-top"><i></i> CAM 3F · ${time}:00</span>
    <span class="key-frame-caption">
      <small>${eyebrow}</small>
      <strong>${title}</strong>
      <em>${note}</em>
    </span>
    <span class="key-frame-check">✓ просмотрено</span>
  `;

  const photo = button.querySelector<HTMLElement>('.key-frame-photo');
  if (photo) {
    photo.style.backgroundImage = `url("${sprite}")`;
    photo.style.backgroundPosition = FRAME_POSITIONS[time];
  }

  return button;
}

function enhanceCamera(root: HTMLElement): void {
  if (root.dataset.sharpComparison === BUILD) return;

  const frame = root.querySelector<HTMLElement>('.cctv-frame');
  const consoleElement = root.querySelector<HTMLElement>('.camera-console');
  const events = root.querySelector<HTMLElement>('.camera-events');
  const question = root.querySelector<HTMLElement>('.camera-question');
  const eventButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.camera-events button'));
  if (!frame || !consoleElement || !events || !question || eventButtons.length === 0) return;

  root.dataset.sharpComparison = BUILD;

  const taskbar = root.querySelector<HTMLElement>('.scene-taskbar');
  if (taskbar) {
    const title = taskbar.querySelector<HTMLElement>('strong');
    const helper = taskbar.querySelector<HTMLElement>('small');
    if (title) title.textContent = 'Сравните два ключевых кадра: вход Ильи и последний кадр после него';
    if (helper) helper.textContent = 'Сначала нажмите 23:50, затем 00:17';
  }

  const layout = document.createElement('div');
  layout.className = 'cctv-compare-layout';

  const main = document.createElement('section');
  main.className = 'cctv-compare-main';
  main.innerHTML = `
    <div class="compare-heading">
      <div><span>КЛЮЧЕВОЕ СРАВНЕНИЕ</span><strong>Что произошло после возвращения Ильи?</strong></div>
      <small>Оба кадра показаны одновременно и не растягиваются сверх исходного разрешения</small>
    </div>
  `;

  const frameGrid = document.createElement('div');
  frameGrid.className = 'cctv-key-grid';
  const key2350 = createKeyFrame(
    '23:50',
    'КАДР 1 · ПОСЛЕДНИЙ ВХОД',
    'Илья возвращается в номер 314',
    'Камера фиксирует его у двери 314.'
  );
  const key0017 = createKeyFrame(
    '00:17',
    'КАДР 2 · ПОСЛЕ ВХОДА',
    'Гостевой коридор пуст',
    'Выход Ильи через главный коридор не зафиксирован.'
  );
  frameGrid.append(key2350, key0017);

  const finding = document.createElement('div');
  finding.className = 'cctv-comparison-finding';
  finding.innerHTML = `
    <span>ВЫВОД ИЗ ЗАПИСИ</span>
    <strong>23:50 — Илья входит в 314 → 00:17 — коридор пуст</strong>
    <p>Камера подтверждает вход, но не показывает последующий выход через главную дверь и гостевой коридор.</p>
  `;

  const context = document.createElement('div');
  context.className = 'cctv-context-strip';
  context.innerHTML = '<div class="context-title"><span>ОСТАЛЬНАЯ ХРОНОЛОГИЯ</span><small>Нужна только для проверки последовательности событий</small></div>';
  context.append(events);

  main.append(frameGrid, finding, context);

  const aside = document.createElement('aside');
  aside.className = 'cctv-compare-aside';
  const steps = document.createElement('div');
  steps.className = 'cctv-compare-steps';
  steps.innerHTML = `
    <span>КАК ПРОВЕРИТЬ</span>
    <div class="compare-step step-2350"><b>1</b><p><strong>Откройте 23:50</strong><small>Убедитесь, что Илья вернулся в 314</small></p><i>не просмотрено</i></div>
    <div class="compare-step step-0017"><b>2</b><p><strong>Откройте 00:17</strong><small>Проверьте, появился ли он позже</small></p><i>не просмотрено</i></div>
  `;
  aside.append(steps, question);

  layout.append(main, aside);
  frame.replaceChildren(layout);
  consoleElement.remove();

  const viewed = new Set<string>();
  const statusByTime: Record<string, { card: HTMLButtonElement; step: HTMLElement | null }> = {
    '23:50': { card: key2350, step: steps.querySelector('.step-2350') },
    '00:17': { card: key0017, step: steps.querySelector('.step-0017') }
  };

  const markViewed = (time: string): void => {
    if (!(time in statusByTime)) return;
    viewed.add(time);
    const status = statusByTime[time];
    status.card.classList.add('is-viewed');
    status.card.setAttribute('aria-pressed', 'true');
    if (status.step) {
      status.step.classList.add('is-complete');
      const label = status.step.querySelector<HTMLElement>('i');
      if (label) label.textContent = 'просмотрено';
    }
    if (viewed.size === 2) layout.classList.add('comparison-complete');
  };

  const activateTimeline = (time: string): void => {
    const target = eventButtons.find((button) => button.querySelector('time')?.textContent?.trim() === time);
    if (target) target.click();
    markViewed(time);
  };

  key2350.addEventListener('click', () => activateTimeline('23:50'));
  key0017.addEventListener('click', () => activateTimeline('00:17'));

  eventButtons.forEach((button) => {
    const time = button.querySelector('time')?.textContent?.trim() ?? '';
    button.dataset.framePosition = FRAME_POSITIONS[time] ?? '';
    button.addEventListener('click', () => markViewed(time));
  });
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
