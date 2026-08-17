import { CASE_MEDIA } from './mediaCatalog';

const thumbnails = CASE_MEDIA.evidence.thumbnails;
let scheduled = false;

function applyCardMedia(): void {
  (Object.entries(thumbnails) as Array<[keyof typeof thumbnails, string]>).forEach(([id, src]) => {
    const card = document.querySelector<HTMLElement>(`[data-evidence-id="${id}"]`);
    const image = card?.querySelector<HTMLImageElement>('img');
    if (!card || !image) return;

    const absolute = new URL(src, window.location.href).href;
    if (image.src !== absolute) {
      image.src = src;
      image.removeAttribute('srcset');
    }
    image.decoding = 'async';
    image.dataset.evidenceRealism = 'v2';
    card.dataset.evidenceRealism = 'v2';
  });
}

function applySceneMedia(): void {
  const room312 = document.querySelector<HTMLElement>('.react-case-modal.evidence-e007 .act2-room-photo');
  if (room312) {
    room312.style.backgroundImage = `linear-gradient(rgba(4, 10, 11, .08), rgba(4, 10, 11, .28)), url("${CASE_MEDIA.evidence.room312}")`;
    room312.dataset.evidenceRealism = 'v2';
  }

  const archive = document.querySelector<HTMLElement>('.react-case-modal.evidence-e008 .archive-worktable');
  if (archive) {
    archive.style.backgroundImage = `linear-gradient(rgba(3, 8, 8, .06), rgba(3, 8, 8, .22)), url("${CASE_MEDIA.evidence.archiveTable}")`;
    archive.dataset.evidenceRealism = 'v2';
  }

  const identity = document.querySelector<HTMLElement>('.react-case-modal.evidence-e009 .identity-comparison');
  if (identity) {
    identity.style.setProperty('--identity-evidence-image', `url("${CASE_MEDIA.evidence.identityDesk}")`);
    identity.dataset.evidenceRealism = 'v2';
  }

  const serviceRoom = document.querySelector<HTMLElement>('.react-case-modal.evidence-e010 .act4-room-scene');
  if (serviceRoom) serviceRoom.dataset.evidenceRealism = 'v2';

  const cardLab = document.querySelector<HTMLElement>('.react-case-modal.evidence-e011 .act4-card-lab');
  if (cardLab) cardLab.dataset.evidenceRealism = 'v2';
}

function apply(): void {
  scheduled = false;
  applyCardMedia();
  applySceneMedia();
  document.documentElement.dataset.dbrEvidenceMedia = 'realism-v2';
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
}

document.addEventListener('click', schedule, true);
window.addEventListener('dbr:runtime-settled', schedule);
window.addEventListener('dbr:act2-updated', schedule);
window.addEventListener('dbr:act3-updated', schedule);
window.addEventListener('dbr:act4-updated', schedule);
window.addEventListener('pageshow', schedule);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
else schedule();
