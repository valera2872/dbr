import { CORE_STORAGE_KEY } from './build';

export {};

type CoreProgress = {
  flaggedEvidenceIds?: string[];
  seenDialogueTopicIds?: string[];
};

type HotspotCopy = {
  label: string;
  title: string;
  description: string;
};

const REQUIRED_DIALOGUE_COUNT = 4;

const EVIDENCE_TITLES: Record<string, string> = {
  E001: 'Осмотр номера 314',
  E002: 'Последнее сообщение Ильи',
  E003: 'Журнал замка номера 314',
  E004: 'Коридорная камера',
  E005: 'Телефон у служебного лифта'
};

const HOTSPOTS: Record<string, HotspotCopy> = {
  window: {
    label: 'Окно',
    title: 'Закрытое окно',
    description: 'Ручка повернута изнутри. На наружном подоконнике и свежем снегу нет следов.'
  },
  desk: {
    label: 'Письменный стол',
    title: 'След возле края стола',
    description: 'Под краем видна тёмная точка, свежая царапина и влажный след от попытки протереть поверхность.'
  },
  bag: {
    label: 'Сумка',
    title: 'Пустой футляр',
    description: 'В сумке лежит пустой футляр от карты памяти. Остальные вещи Ильи находятся на месте.'
  },
  carpet: {
    label: 'Ковёр',
    title: 'Следы перемещения',
    description: 'Ворс приглажен двумя параллельными полосами от письменного стола в направлении шкафа.'
  }
};

let toastTimer: number | null = null;

function readCoreProgress(): CoreProgress {
  try {
    return JSON.parse(localStorage.getItem(CORE_STORAGE_KEY) ?? '{}') as CoreProgress;
  } catch {
    return {};
  }
}

function afterReact(callback: () => void): void {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

function isVisible(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  const target = buttons.find((button) => isVisible(button) && button.textContent?.includes(label))
    ?? buttons.find((button) => button.textContent?.includes(label));
  target?.click();
}

function closeVisibleModal(): void {
  const close = document.querySelector<HTMLButtonElement>(
    '.premium-modal-backdrop .premium-icon-button.close, .premium-modal-backdrop .premium-cta.compact'
  );
  close?.click();
}

function showToast(message: string): void {
  document.querySelector('.first-player-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'first-player-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);

  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.remove();
    toastTimer = null;
  }, 2800);
}

function hotspotIdFromButton(button: HTMLButtonElement): string | null {
  const text = `${button.getAttribute('aria-label') ?? ''} ${button.textContent ?? ''}`.toLocaleLowerCase('ru-RU');
  if (text.includes('письменный стол')) return 'desk';
  if (text.includes('окно')) return 'window';
  if (text.includes('сумка')) return 'bag';
  if (text.includes('ковёр')) return 'carpet';
  return null;
}

function renderSelectedHotspot(id: string): void {
  const modal = document.querySelector<HTMLElement>('.evidence-e001');
  const copy = HOTSPOTS[id];
  if (!modal || !copy) return;

  const panel = modal.querySelector<HTMLElement>('.room-inspection-panel');
  if (!panel) return;

  let result = panel.querySelector<HTMLElement>('.inspection-result');
  if (!result) {
    result = document.createElement('div');
    result.className = 'inspection-result';
    const placeholder = panel.querySelector('.inspection-placeholder');
    if (placeholder) placeholder.replaceWith(result);
    else panel.append(result);
  }

  if (result.dataset.selectedHotspot !== id) {
    result.dataset.selectedHotspot = id;
    result.innerHTML = `<p class="premium-kicker">Выбрано сейчас</p><h3>${copy.title}</h3><p>${copy.description}</p>`;
  }

  modal.querySelectorAll<HTMLButtonElement>('.room-marker, .inspection-list button').forEach((button) => {
    button.classList.toggle('current', hotspotIdFromButton(button) === id);
  });
}

function evidenceIdFromModal(modal: Element | null): string | null {
  if (!modal) return null;
  const match = Array.from(modal.classList).find((item) => /^evidence-e\d{3}$/i.test(item));
  return match ? match.replace('evidence-', '').toUpperCase() : null;
}

function enhanceBookmarkButton(): void {
  const modal = document.querySelector<HTMLElement>('.evidence-modal-premium');
  const button = modal?.querySelector<HTMLButtonElement>('.flag-button');
  const footer = modal?.querySelector<HTMLElement>('.premium-modal-footer');
  const evidenceId = evidenceIdFromModal(modal);
  if (!button || !footer || !evidenceId) return;

  let help = footer.querySelector<HTMLElement>('.first-player-bookmark-help');
  if (!help) {
    help = document.createElement('small');
    help.className = 'first-player-bookmark-help';
    footer.insertBefore(help, footer.lastElementChild);
  }

  const flagged = readCoreProgress().flaggedEvidenceIds?.includes(evidenceId) ?? false;
  const state = flagged ? 'flagged' : 'unflagged';
  if (help.dataset.bookmarkState === state) return;
  help.dataset.bookmarkState = state;
  help.textContent = flagged
    ? 'Материал добавлен в ваши закладки на вкладке «Дело». На сюжет это не влияет.'
    : 'Это личная закладка для важных материалов; на правильность решения она не влияет.';
}

function renderBookmarksPanel(): void {
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  if (!dashboard) return;

  const flagged = readCoreProgress().flaggedEvidenceIds ?? [];
  const signature = flagged.join('|');
  const existing = dashboard.querySelector<HTMLElement>('.first-player-bookmarks');

  if (!flagged.length) {
    existing?.remove();
    return;
  }
  if (existing?.dataset.bookmarkSignature === signature) return;

  const panel = existing ?? document.createElement('article');
  panel.className = 'first-player-bookmarks';
  panel.dataset.bookmarkSignature = signature;
  panel.innerHTML = `
    <div>
      <p class="premium-kicker">Закладки следователя</p>
      <h2>Отмеченные материалы</h2>
      <small>Это ваш личный список. Закладки не влияют на сюжет и оценку.</small>
    </div>
    <div class="first-player-bookmark-list">
      ${flagged.map((id) => `<button type="button" data-first-player-evidence="${id}"><span>${id}</span><strong>${EVIDENCE_TITLES[id] ?? id}</strong></button>`).join('')}
    </div>`;

  if (!existing) dashboard.querySelector('.dashboard-grid')?.before(panel);
}

function renderE005Route(): void {
  const modal = document.querySelector<HTMLElement>('.evidence-e005');
  if (!modal) return;

  const progress = readCoreProgress();
  const asked = progress.seenDialogueTopicIds?.length ?? 0;
  const remaining = Math.max(0, REQUIRED_DIALOGUE_COUNT - asked);
  const routeState = remaining > 0 ? `people:${remaining}` : 'report';

  let banner = modal.querySelector<HTMLElement>('.first-player-route-banner');
  if (!banner) {
    banner = document.createElement('section');
    banner.className = 'first-player-route-banner';
    modal.querySelector('.premium-modal-body')?.append(banner);
  }
  if (banner.dataset.routeState === routeState) return;
  banner.dataset.routeState = routeState;

  if (remaining > 0) {
    banner.innerHTML = `
      <div><p class="premium-kicker">Следующий обязательный шаг</p><h2>Сверьте показания участников</h2><p>После телефона новые факты нужно проверить вопросами. До промежуточного отчёта осталось получить ${remaining} ключевых ответа.</p></div>
      <button type="button" data-first-player-route="people">Перейти к людям <span>→</span></button>`;
  } else {
    banner.innerHTML = `
      <div><p class="premium-kicker">Все данные собраны</p><h2>Промежуточный отчёт №1 готов</h2><p>Перейдите на вкладку «Дело» и выберите версию, которая объясняет дверь, окно, конфликт и телефон.</p></div>
      <button type="button" data-first-player-route="report">Открыть отчёт №1 <span>→</span></button>`;
  }
}

function renderInterviewRoute(): void {
  const modal = document.querySelector<HTMLElement>('.character-modal-premium');
  if (!modal) return;

  const asked = readCoreProgress().seenDialogueTopicIds?.length ?? 0;
  const remaining = Math.max(0, REQUIRED_DIALOGUE_COUNT - asked);
  const routeState = remaining > 0 ? `remaining:${remaining}` : 'report';

  let banner = modal.querySelector<HTMLElement>('.first-player-interview-route');
  if (!banner) {
    banner = document.createElement('section');
    banner.className = 'first-player-interview-route';
    modal.append(banner);
  }
  if (banner.dataset.routeState === routeState) return;
  banner.dataset.routeState = routeState;

  if (remaining > 0) {
    banner.innerHTML = `<strong>До промежуточного отчёта №1 осталось получить ответов: ${remaining}</strong><span>Можно перейти к другим участникам через вкладку «Люди».</span>`;
  } else {
    banner.innerHTML = `<div><strong>Показания собраны</strong><span>Теперь сформулируйте промежуточный вывод.</span></div><button type="button" data-first-player-route="report">Открыть отчёт №1 →</button>`;
  }
}

function focusCheckpoint(): void {
  const checkpoint = document.querySelector<HTMLElement>('.checkpoint-panel');
  if (!checkpoint) return;
  checkpoint.scrollIntoView({ behavior: 'smooth', block: 'center' });
  checkpoint.classList.add('first-player-focus');
  window.setTimeout(() => checkpoint.classList.remove('first-player-focus'), 2200);
}

function enhanceVisibleUi(): void {
  enhanceBookmarkButton();
  renderBookmarksPanel();
  renderE005Route();
  renderInterviewRoute();
}

function routeTo(destination: 'people' | 'report'): void {
  closeVisibleModal();
  afterReact(() => {
    if (destination === 'people') {
      clickTab('Люди');
      showToast('Следующий шаг: задайте участникам ключевые вопросы.');
      return;
    }
    clickTab('Дело');
    afterReact(focusCheckpoint);
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button');
  if (!button) return;

  if (button.closest('.evidence-e001') && (button.matches('.room-marker') || button.closest('.inspection-list'))) {
    const id = hotspotIdFromButton(button);
    if (id) afterReact(() => renderSelectedHotspot(id));
  }

  if (button.matches('.flag-button')) {
    const modal = button.closest('.evidence-modal-premium');
    const evidenceId = evidenceIdFromModal(modal);
    afterReact(() => {
      enhanceBookmarkButton();
      renderBookmarksPanel();
      const selected = evidenceId ? readCoreProgress().flaggedEvidenceIds?.includes(evidenceId) : false;
      showToast(selected ? 'Добавлено в закладки следователя.' : 'Удалено из закладок.');
    });
  }

  const route = button.dataset.firstPlayerRoute;
  if (route === 'people' || route === 'report') routeTo(route);

  const evidenceId = button.dataset.firstPlayerEvidence;
  if (evidenceId) {
    clickTab('Материалы');
    afterReact(() => {
      const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-evidence-card'));
      cards.find((card) => card.textContent?.includes(evidenceId))?.click();
    });
  }

  if (button.closest('.character-modal-premium .interview-questions')) {
    afterReact(renderInterviewRoute);
  }

  afterReact(enhanceVisibleUi);
}, true);

window.addEventListener('dbr:runtime-settled', () => afterReact(enhanceVisibleUi));
window.addEventListener('pageshow', () => afterReact(enhanceVisibleUi));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => afterReact(enhanceVisibleUi), { once: true });
} else {
  afterReact(enhanceVisibleUi);
}
