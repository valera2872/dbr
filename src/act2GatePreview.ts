export {};

const CASE_PREFIX = 'dbr:dbr_001_room_314:';
const BASE_EVIDENCE = ['E001', 'E002', 'E003', 'E004', 'E005'];

function readBaseProgress(): { act1Complete: boolean; seenEvidenceIds: string[] } {
  let best = { act1Complete: false, seenEvidenceIds: [] as string[] };

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(CASE_PREFIX) || key.includes(':act2:')) continue;

    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? '{}') as {
        act1Complete?: boolean;
        seenEvidenceIds?: string[];
      };
      const seen = Array.isArray(parsed.seenEvidenceIds) ? parsed.seenEvidenceIds : [];
      if (seen.length >= best.seenEvidenceIds.length) {
        best = { act1Complete: Boolean(parsed.act1Complete), seenEvidenceIds: seen };
      }
      if (parsed.act1Complete) best.act1Complete = true;
    } catch {
      // Ignore obsolete or damaged local saves.
    }
  }

  return best;
}

function openCheckpoint(): void {
  const caseButton = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button')
  ).find((button) => button.textContent?.includes('Дело'));

  caseButton?.click();
  window.setTimeout(() => {
    document.querySelector<HTMLElement>('.checkpoint-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 120);
}

function createPreviewCard(id: 'E006' | 'E007'): HTMLButtonElement {
  const isPlan = id === 'E006';
  const card = document.createElement('button');
  card.type = 'button';
  card.dataset.evidenceId = id;
  card.className = `premium-evidence-card ${isPlan ? 'amber' : 'cyan'} locked act2-evidence-card act2-preview-card`;
  card.disabled = !isPlan;
  card.innerHTML = `
    ${isPlan ? '<div class="act2-card-blueprint"></div>' : ''}
    <div class="evidence-card-shade"></div>
    <div class="evidence-card-top">
      <span>${id}</span>
      <span class="premium-pill neutral">Закрыто</span>
    </div>
    <div class="evidence-card-icon">${isPlan ? '⌗' : '⌖'}</div>
    <div class="evidence-card-copy">
      <small>${isPlan ? 'Акт II · архивный документ' : 'Акт II · интерактивная сцена'}</small>
      <h2>${isPlan ? 'Архивный план третьего этажа' : 'Осмотр номера 312'}</h2>
      <p>${isPlan
        ? 'Завершите промежуточный отчёт №1 в разделе «Дело».'
        : 'Откроется после обнаружения скрытого прохода на архивном плане.'}</p>
    </div>
    <span class="evidence-number">0${isPlan ? '6' : '7'}</span>`;

  if (isPlan) {
    card.disabled = false;
    card.setAttribute('aria-label', 'Перейти к промежуточному отчёту для открытия E006');
    card.addEventListener('click', openCheckpoint);
  }

  return card;
}

function ensureStyles(): void {
  if (document.getElementById('act2-gate-preview-styles')) return;
  const style = document.createElement('style');
  style.id = 'act2-gate-preview-styles';
  style.textContent = `
    .act2-gate-banner {
      display:flex; align-items:center; justify-content:space-between; gap:18px;
      margin:0 0 18px; padding:16px 18px; border:1px solid rgba(124,232,227,.25);
      border-radius:14px; background:linear-gradient(135deg,rgba(9,31,35,.96),rgba(12,22,28,.96));
    }
    .act2-gate-banner small { display:block; margin-bottom:4px; color:#76ded9; font:800 10px/1.2 ui-monospace,monospace; letter-spacing:.12em; text-transform:uppercase; }
    .act2-gate-banner strong { display:block; color:#edf8f8; font:800 15px/1.3 Manrope,sans-serif; }
    .act2-gate-banner p { margin:5px 0 0; color:#91a7aa; font:500 12px/1.45 Manrope,sans-serif; }
    .act2-gate-banner button { flex:0 0 auto; padding:11px 15px; border:0; border-radius:10px; background:#7ce8e2; color:#062125; font:900 12px/1 Manrope,sans-serif; cursor:pointer; }
    .act2-preview-card { opacity:.82; }
    .act2-preview-card:not(:disabled) { cursor:pointer; }
    .act2-preview-card:not(:disabled):hover { opacity:1; border-color:rgba(124,232,227,.55); }
    @media (max-width:720px) { .act2-gate-banner { align-items:stretch; flex-direction:column; } .act2-gate-banner button { width:100%; } }
  `;
  document.head.append(style);
}

function removePreview(): void {
  document.querySelector('.act2-gate-banner')?.remove();
  document.querySelectorAll('.act2-preview-card').forEach((node) => node.remove());
}

function scan(): void {
  const progress = readBaseProgress();
  const allBaseSeen = BASE_EVIDENCE.every((id) => progress.seenEvidenceIds.includes(id));

  if (progress.act1Complete || !allBaseSeen) {
    removePreview();
    return;
  }

  const grid = document.querySelector<HTMLElement>('.premium-evidence-grid');
  const section = grid?.closest<HTMLElement>('.premium-section');
  if (!grid || !section) return;

  ensureStyles();

  if (!section.querySelector('.act2-gate-banner')) {
    const banner = document.createElement('div');
    banner.className = 'act2-gate-banner';
    banner.innerHTML = `
      <div>
        <small>Все материалы акта I изучены</small>
        <strong>Чтобы открыть E006, завершите промежуточный отчёт №1</strong>
        <p>Перейдите в раздел «Дело» и выберите вывод, который объясняет запертую дверь, закрытое окно и отсутствие Ильи в коридоре.</p>
      </div>
      <button type="button">Перейти к отчёту →</button>`;
    banner.querySelector('button')?.addEventListener('click', openCheckpoint);
    grid.insertAdjacentElement('beforebegin', banner);
  }

  if (!grid.querySelector('[data-evidence-id="E006"]')) grid.append(createPreviewCard('E006'));
  if (!grid.querySelector('[data-evidence-id="E007"]')) grid.append(createPreviewCard('E007'));

  const stat = section.querySelector<HTMLElement>('.section-stat span');
  if (stat) stat.innerHTML = 'из 7<br>изучено';
}

let scheduled = false;
function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('click', () => window.setTimeout(schedule, 80), true);
window.addEventListener('storage', schedule);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
else schedule();
