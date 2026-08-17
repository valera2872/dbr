const MAX_FRAMES = 45;

function visibleTab(label: string): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'))
    .find((button) => button.offsetParent !== null && button.textContent?.includes(label));
}

function openWhenReady(id: 'E008' | 'E009', frame = 0): void {
  const card = document.querySelector<HTMLButtonElement>(`[data-evidence-id="${id}"]`);
  if (card && !card.hidden && !card.disabled && card.offsetParent !== null) {
    card.click();
    return;
  }
  if (frame >= MAX_FRAMES) return;
  window.requestAnimationFrame(() => openWhenReady(id, frame + 1));
}

function handleEvidenceLedOpen(event: MouseEvent): void {
  const target = event.target as Element | null;
  const button = target?.closest<HTMLButtonElement>('[data-evidence-led-action="open-e008"], [data-evidence-led-action="open-e009"]');
  if (!button || button.disabled) return;

  const action = button.dataset.evidenceLedAction;
  const id = action === 'open-e008' ? 'E008' : action === 'open-e009' ? 'E009' : null;
  if (!id) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  visibleTab('Материалы')?.click();
  window.requestAnimationFrame(() => openWhenReady(id));
}

document.addEventListener('click', handleEvidenceLedOpen, true);
