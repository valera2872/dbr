import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

let scheduled = false;

function keyInterrogation(state: InvestigationSnapshot): boolean {
  // Case 001 v2 allows Ilya to be rescued before Kirill is confronted. That can
  // populate Act IV search state early, so the legacy linear derived.stage may
  // already read as an Act IV stage. The interrogation mode follows the actual
  // proof gate and remains authoritative after completion so legacy guidance
  // cannot reintroduce confession-gated rescue copy.
  return state.core.phase === 'hq' && state.act3.complete;
}

function midInvestigationInterrogation(state: InvestigationSnapshot): boolean {
  return state.core.phase === 'hq'
    && state.core.act1Complete
    && !state.act3.complete
    && !state.interrogation.complete;
}

function hideFutureEvidence(shell: HTMLElement): void {
  shell.querySelectorAll<HTMLButtonElement>('.interrogation-evidence').forEach((button) => {
    const hiddenByAgency = button.dataset.agencyFutureHidden === '1';
    const shouldHide = button.disabled && !button.classList.contains('presented');

    if (shouldHide) {
      button.dataset.agencyFutureHidden = '1';
      button.hidden = true;
      button.style.display = 'none';
      button.setAttribute('aria-hidden', 'true');
      return;
    }

    if (hiddenByAgency) {
      button.hidden = false;
      button.style.display = '';
      button.removeAttribute('aria-hidden');
      delete button.dataset.agencyFutureHidden;
    }
  });
}

function removeGuidedEvidenceHighlight(shell: HTMLElement): void {
  shell.querySelectorAll('.interrogation-evidence.next-guided-evidence').forEach((element) => {
    element.classList.remove('next-guided-evidence');
  });
}

function briefingMarkup(mode: 'mid' | 'key', state: InvestigationSnapshot): string {
  if (mode === 'key' && state.interrogation.complete) {
    return `<section class="interrogation-agency-brief" data-interrogation-agency-mode="key-complete">
      <div class="interrogation-agency-copy">
        <small>Допрос · доказательная граница</small>
        <strong>Ключевое противоречие доказано</strong>
        <p>Кирилл признал вход в 314 и конфликт после 00:17 только после того, как связка уже доказала возможность, использование маршрута, отсутствие открытия M3, его физическое присутствие и мотив. Это признание не является источником местонахождения Ильи и не заменяет доказательства событий 2015 года.</p>
      </div>
      <div class="interrogation-agency-status"><span>Статус</span><b>✓</b><em>Признание подтверждает, а не создаёт доказательства</em></div>
    </section>`;
  }

  if (mode === 'key') {
    const presented = state.interrogation.presented.length;
    return `<section class="interrogation-agency-brief" data-interrogation-agency-mode="key">
      <div class="interrogation-agency-copy">
        <small>Допрос · самостоятельная проверка</small>
        <strong>Проверьте алиби Кирилла своей доказательной цепочкой</strong>
        <p>Все уже добытые вами материалы доступны здесь. Решите сами, что предъявлять и в каком порядке. Если связка слаба, Кирилл объяснит, чего она не доказывает. Если остаётся непроверенная ветка — вернитесь к расследованию. Его возражение — часть дела, а не ошибка интерфейса.</p>
      </div>
      <div class="interrogation-agency-status"><span>Предъявлено материалов</span><b>${presented}</b><em>Правильный порядок не показывается</em></div>
    </section>`;
  }

  return `<section class="interrogation-agency-brief" data-interrogation-agency-mode="mid">
    <div class="interrogation-agency-copy">
      <small>Допрос · граница знания</small>
      <strong>Спрашивайте только о том, для чего уже есть основание</strong>
      <p>Можно зафиксировать известное алиби и использовать уже найденные материалы. Будущие доказательства и их названия здесь не показываются. Если аргумента не хватает — продолжайте расследование.</p>
    </div>
  </section>`;
}

function renderBrief(shell: HTMLElement, mode: 'mid' | 'key' | 'off', state: InvestigationSnapshot): void {
  const old = shell.querySelector<HTMLElement>('.interrogation-agency-brief');
  const guide = shell.querySelector<HTMLElement>('.interrogation-guide');

  if (mode === 'off') {
    old?.remove();
    if (guide?.dataset.agencyHidden === '1') {
      guide.style.display = '';
      delete guide.dataset.agencyHidden;
    }
    return;
  }

  if (guide) {
    guide.dataset.agencyHidden = '1';
    guide.style.display = 'none';
  }

  const signature = `${mode}:${state.interrogation.complete ? 'complete' : 'open'}:${state.interrogation.asked.join('|')}:${state.interrogation.presented.join('|')}`;
  if (old?.dataset.signature === signature) return;
  old?.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = briefingMarkup(mode, state);
  const brief = wrapper.firstElementChild as HTMLElement | null;
  if (!brief) return;
  brief.dataset.signature = signature;
  shell.querySelector('.interrogation-header')?.insertAdjacentElement('afterend', brief);
}

function rewriteEvidenceCaption(shell: HTMLElement, mode: 'mid' | 'key' | 'off', state: InvestigationSnapshot): void {
  const note = shell.querySelector<HTMLElement>('.interrogation-control-title small');
  if (!note) return;

  if (mode === 'off') {
    if (note.dataset.agencyOriginal) {
      note.textContent = note.dataset.agencyOriginal;
      delete note.dataset.agencyOriginal;
    }
    return;
  }

  if (!note.dataset.agencyOriginal) note.dataset.agencyOriginal = note.textContent ?? '';
  note.textContent = state.interrogation.complete
    ? 'Признание не расширяет границы уже доказанных фактов.'
    : mode === 'key'
      ? 'Выберите доказательство самостоятельно. Кирилл будет оспаривать слабые связки.'
      : 'Показаны только уже найденные материалы. Будущие доказательства скрыты.';
}

function apply(state: InvestigationSnapshot): void {
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  if (!shell) return;

  hideFutureEvidence(shell);
  removeGuidedEvidenceHighlight(shell);

  const mode: 'mid' | 'key' | 'off' = keyInterrogation(state)
    ? 'key'
    : midInvestigationInterrogation(state)
      ? 'mid'
      : 'off';

  renderBrief(shell, mode, state);
  rewriteEvidenceCaption(shell, mode, state);
  shell.dataset.investigationAgency = state.interrogation.complete && mode === 'key' ? 'key-complete' : mode;
}

function schedule(reason: string): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    scheduled = false;
    apply(refreshInvestigationState(reason));
  }));
}

subscribeInvestigationState((state) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => apply(state))));
document.addEventListener('click', () => schedule('investigation-agency-interrogation:click'), true);
window.addEventListener('dbr:interrogation-updated', () => schedule('investigation-agency-interrogation:update'));
window.addEventListener('dbr:act2-updated', () => schedule('investigation-agency-interrogation:act2'));
window.addEventListener('dbr:act3-updated', () => schedule('investigation-agency-interrogation:act3'));
window.addEventListener('dbr:runtime-settled', () => schedule('investigation-agency-interrogation:runtime'));
window.addEventListener('pageshow', () => schedule('investigation-agency-interrogation:pageshow'));
