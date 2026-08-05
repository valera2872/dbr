const MAX_FRAMES = 90;

function findButtonByText(selector: string, text: string): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(selector))
    .find((button) => button.textContent?.includes(text)) ?? null;
}

function openCompletedReport(attempt = 0): void {
  const reportButton = findButtonByText('.react-final-panel button', 'Открыть итог дела');
  if (reportButton) {
    reportButton.click();
    return;
  }

  if (attempt === 0) {
    findButtonByText('.premium-sidebar button, .premium-mobile-nav button', 'Дело')?.click();
  }

  if (attempt >= MAX_FRAMES) return;
  window.requestAnimationFrame(() => openCompletedReport(attempt + 1));
}

export function installCompletedCaseReturn(): void {
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('.commercial-launch [data-primary]')
      : null;

    if (!target?.textContent?.includes('Открыть итог дела')) return;
    window.requestAnimationFrame(() => openCompletedReport());
  }, true);
}
