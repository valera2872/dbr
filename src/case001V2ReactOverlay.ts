import './case001V2ReactOverlay.css';

let scheduled = false;

function setText(node: Element | null, value: string): void {
  if (node && node.textContent !== value) node.textContent = value;
}

function setData(node: HTMLElement, key: string, value: string): void {
  if (node.dataset[key] !== value) node.dataset[key] = value;
}

function cardSummary(id: 'E006' | 'E007', value: string): void {
  const card = document.querySelector<HTMLElement>(`[data-evidence-id="${id}"]`);
  const copy = card?.querySelector<HTMLElement>('.evidence-card-copy');
  const original = copy?.querySelector<HTMLElement>('p:not(.case001-v2-card-summary)');
  if (!copy || !original) return;

  setData(original, 'case001V2LegacyCopy', '1');
  let summary = copy.querySelector<HTMLElement>('.case001-v2-card-summary');
  if (!summary) {
    summary = document.createElement('p');
    summary.className = 'case001-v2-card-summary';
    copy.append(summary);
  }
  setText(summary, value);
}

function modalSummary(modal: HTMLElement, value: string): void {
  const copy = modal.querySelector<HTMLElement>('.premium-modal-header > div');
  const original = copy?.querySelector<HTMLElement>('p:last-of-type');
  if (!copy || !original) return;

  setData(original, 'case001V2LegacyCopy', '1');
  let summary = copy.querySelector<HTMLElement>('.case001-v2-modal-summary');
  if (!summary) {
    summary = document.createElement('span');
    summary.className = 'case001-v2-modal-summary';
    copy.append(summary);
  }
  setText(summary, value);
}

function patchPointButton(button: HTMLElement | undefined, label: string, selectedText: string): void {
  if (!button) return;
  const strong = button.querySelector('strong');
  const small = button.querySelector('small');
  setText(strong, label);
  setText(small, button.classList.contains('done') ? selectedText : 'Проверить');
}

function findingOverride(modal: HTMLElement, kicker: string, title: string, body: string): void {
  const finding = modal.querySelector<HTMLElement>('.react-finding.success');
  if (!finding) return;
  setData(finding, 'case001V2Finding', '1');

  let override = finding.querySelector<HTMLElement>('.case001-v2-finding-override');
  if (!override) {
    override = document.createElement('div');
    override.className = 'case001-v2-finding-override';
    override.innerHTML = '<small></small><strong></strong><span></span>';
    finding.append(override);
  }
  setText(override.querySelector('small'), kicker);
  setText(override.querySelector('strong'), title);
  setText(override.querySelector('span'), body);
}

function patchGuide(modal: HTMLElement, title: string, body: string, actionLabel?: string, action?: () => void): void {
  const guide = modal.querySelector<HTMLElement>('.act23-player-guide');
  if (!guide) return;

  setText(guide.querySelector('strong'), title);
  setText(guide.querySelector('p'), body);

  const oldButton = guide.querySelector<HTMLButtonElement>('button');
  if (!oldButton || !actionLabel || !action) return;
  if (oldButton.dataset.case001V2Action === actionLabel) return;

  const replacement = oldButton.cloneNode(true) as HTMLButtonElement;
  replacement.dataset.case001V2Action = actionLabel;
  replacement.textContent = actionLabel;
  replacement.addEventListener('click', action);
  oldButton.replaceWith(replacement);
}

function closeModalToCase(modal: HTMLElement): void {
  modal.querySelector<HTMLButtonElement>('.premium-icon-button.close')?.click();
  window.requestAnimationFrame(() => {
    const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
    tabs.find((button) => button.offsetParent !== null && button.textContent?.includes('Дело'))?.click();
  });
}

function patchE006(): void {
  cardSummary('E006', 'Сопоставьте V314, доступ из 312 и продолжение старой сети P3 к служебной зоне.');

  const modal = document.querySelector<HTMLElement>('.react-case-modal.evidence-e006');
  if (!modal) return;
  setData(modal, 'case001V2Evidence', 'E006');
  modalSummary(modal, 'Сопоставьте старую топологию этажа с современной схемой. Ищите возможные пути перемещения, а не виновного.');

  const hotspots = Array.from(modal.querySelectorAll<HTMLElement>('.plan-hotspot'));
  setText(hotspots[2]?.querySelector('i'), 'Служебная ветка');

  const list = Array.from(modal.querySelectorAll<HTMLElement>('.react-point-list > button'));
  patchPointButton(list[2], 'Служебная ветка P3', 'V314 продолжается в P3 к M3 / SL3 / S-3');

  const scene = modal.querySelector<HTMLElement>('.archive-plan-sheet');
  if (scene && !scene.querySelector('.case001-v2-plan-branch')) {
    const branch = document.createElement('div');
    branch.className = 'case001-v2-plan-branch';
    branch.innerHTML = '<span>V314</span><i></i><b>P3 → M3 / SL3 / S-3</b>';
    scene.append(branch);
  }

  const finding = modal.querySelector<HTMLElement>('.react-finding');
  if (finding && !finding.classList.contains('success') && list[2]?.classList.contains('done')) {
    setText(finding.querySelector('h3'), 'Полость продолжается в старую служебную сеть');
    setText(finding.querySelector('p:last-child'), 'Обмеры показывают: V314 соединяется с технической веткой P3, ведущей к независимому staff-входу и служебной зоне.');
  }

  findingOverride(
    modal,
    'Вывод по E006',
    'Старая сеть связывала 312 / 314 со служебной зоной',
    'V314 имел доступ со стороны 312 и продолжение к P3 → M3 / SL3 / S-3. План доказывает возможный маршрут, но не личность того, кто им воспользовался.'
  );

  const complete = modal.querySelector('.react-finding.success') !== null;
  if (complete) {
    patchGuide(
      modal,
      'Топология восстановлена',
      'Вы установили V314 и ветку P3 к служебной зоне. Это ещё не доказывает, кто пользовался сетью. Теперь проверьте её современную проходимость.',
      'Проверить современную проходимость из 312 →',
      () => {
        modal.querySelector<HTMLButtonElement>('.premium-icon-button.close')?.click();
        window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-evidence-id="E007"]')?.click());
      }
    );
  }
}

function patchE007(): void {
  cardSummary('E007', 'Проверьте современную проходимость V314, свежие следы и связь с независимой служебной веткой P3.');

  const modal = document.querySelector<HTMLElement>('.react-case-modal.evidence-e007');
  if (!modal) return;
  setData(modal, 'case001V2Evidence', 'E007');
  modalSummary(modal, 'Проверьте, сохранилась ли сеть физически и использовалась ли этой ночью. Сам маршрут ещё не устанавливает человека.');

  const markers = Array.from(modal.querySelectorAll<HTMLElement>('.act2-room-marker'));
  setText(markers[2]?.querySelector('i'), 'Служебное ответвление');

  const list = Array.from(modal.querySelectorAll<HTMLElement>('.react-point-list > button'));
  patchPointButton(list[2], 'Служебное ответвление P3', 'V314 соединяется с P3 → M3 / SL3 / S-3');

  const finding = modal.querySelector<HTMLElement>('.react-finding');
  if (finding && !finding.classList.contains('success') && list[2]?.classList.contains('done')) {
    setText(finding.querySelector('h3'), 'V314 не заканчивается внутри номера 312');
    setText(finding.querySelector('p:last-child'), 'За полостью проходит P3 — старое ответвление к staff-входу M3, служебному лифту SL3 и комнате S-3.');
  }

  findingOverride(
    modal,
    'Вывод по E007',
    'Сеть использовали этой ночью',
    'Панель и совпадающие следы подтверждают свежую проходимость 312 ↔ V314 ↔ P3. Независимый staff-вход M3 тоже физически существует. Кто именно вошёл в сеть — пока не доказано.'
  );

  const complete = modal.querySelector('.react-finding.success') !== null;
  if (complete) {
    patchGuide(
      modal,
      'Сеть использовали этой ночью',
      'Вы доказали свежую проходимость, но не исполнителя. Теперь расследование должно разойтись по версиям: искать Илью, проверять staff-доступ, B-17 и физические следы в 314.',
      'Вернуться к следственной развилке →',
      () => closeModalToCase(modal)
    );
  }
}

function apply(): void {
  patchE006();
  patchE007();
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    apply();
  }));
}

document.addEventListener('click', schedule, true);
['dbr:runtime-settled', 'dbr:act2-updated', 'dbr:act3-updated', 'pageshow'].forEach((event) => window.addEventListener(event, schedule));
schedule();
