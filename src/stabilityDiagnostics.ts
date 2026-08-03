import {
  exportInvestigationState,
  getInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

export {};

const params = new URLSearchParams(window.location.search);
const explicitlyEnabled = params.get('diagnostics') === '1';
let latest = getInvestigationState();
let panel: HTMLElement | null = null;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character] ?? character);
}

async function copySnapshot(): Promise<void> {
  const text = exportInvestigationState();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function renderPanel(state: InvestigationSnapshot): void {
  if (!panel) return;
  const issueMarkup = state.derived.issues.length
    ? state.derived.issues.map((issue) => `<li class="${issue.severity}"><strong>${escapeHtml(issue.code)}</strong><span>${escapeHtml(issue.message)}</span></li>`).join('')
    : '<li class="ok"><strong>STATE_OK</strong><span>Противоречий между этапами не обнаружено.</span></li>';

  panel.innerHTML = `
    <header><div><small>DBR STATE SCHEMA ${state.schema}</small><strong>Диагностика прохождения</strong></div><button type="button" data-close aria-label="Закрыть">×</button></header>
    <div class="stability-diagnostics-grid">
      <article><span>Этап</span><strong>${state.derived.stage}</strong></article>
      <article><span>Прогресс</span><strong>${state.derived.percent}%</strong></article>
      <article><span>Материалы</span><strong>${state.derived.coreEvidenceCount + state.derived.planCount + state.derived.roomCount + state.derived.archiveCount + state.derived.identityCount + state.derived.searchCount + state.derived.cardCount}</strong></article>
      <article><span>Проблемы</span><strong>${state.derived.issues.length}</strong></article>
    </div>
    <ol>${issueMarkup}</ol>
    <footer><button type="button" data-copy>Скопировать технический снимок</button><a href="?fresh=1">Начать дело заново</a></footer>`;

  panel.querySelector('[data-close]')?.addEventListener('click', () => panel?.remove());
  panel.querySelector('[data-copy]')?.addEventListener('click', async (event) => {
    await copySnapshot();
    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = 'Снимок скопирован';
  });
}

function mount(): void {
  if (panel || (!explicitlyEnabled && latest.derived.issues.length === 0)) return;
  panel = document.createElement('aside');
  panel.className = `stability-diagnostics ${explicitlyEnabled ? 'expanded' : 'warning-only'}`;
  panel.setAttribute('aria-label', 'Диагностика сохранения расследования');
  document.body.append(panel);
  renderPanel(latest);
}

subscribeInvestigationState((state) => {
  latest = state;
  if (explicitlyEnabled || state.derived.issues.length > 0) mount();
  renderPanel(state);
});

window.addEventListener('pageshow', mount);
mount();
