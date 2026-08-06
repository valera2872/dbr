import { CASE_MEDIA } from './mediaCatalog';

export {};

const REMOTE_HOST = 'images.unsplash.com';
const REALISTIC_PRIMARY_MEDIA = true;
const ROOM_PATTERN = /photo-1702675301342/i;
const CORRIDOR_PATTERN = /photo-(1706801582308|1725180333682)/i;
const KIRILL_PATTERN = /photo-1500648767791/i;
const MARINA_PATTERN = /photo-1494790108377/i;
const DENIS_PATTERN = /photo-1507003211169/i;
const VERA_PATTERN = /photo-1534528741775/i;
const ILYA_PATTERN = /photo-1506794778202/i;

let scheduled = false;

function portraitFromLabel(label: string): string | null {
  const normalized = label.toLocaleLowerCase('ru-RU');
  if (normalized.includes('кирилл')) return CASE_MEDIA.portraits.kirill;
  if (normalized.includes('марина')) return CASE_MEDIA.portraits.marina;
  if (normalized.includes('денис')) return CASE_MEDIA.portraits.denis;
  if (normalized.includes('вера')) return CASE_MEDIA.portraits.vera;
  if (normalized.includes('елена')) return CASE_MEDIA.portraits.elena;
  if (normalized.includes('илья')) return CASE_MEDIA.portraits.ilya;
  return null;
}

function rewriteRemoteSource(source: string, image?: HTMLImageElement): string {
  if (!source.includes(REMOTE_HOST)) return source;
  if (REALISTIC_PRIMARY_MEDIA) return source;
  if (ROOM_PATTERN.test(source)) return CASE_MEDIA.room314;
  if (CORRIDOR_PATTERN.test(source)) return CASE_MEDIA.corridor3f;
  if (KIRILL_PATTERN.test(source)) return CASE_MEDIA.portraits.kirill;
  if (MARINA_PATTERN.test(source)) return CASE_MEDIA.portraits.marina;
  if (DENIS_PATTERN.test(source)) return CASE_MEDIA.portraits.denis;
  if (VERA_PATTERN.test(source)) {
    return image?.classList.contains('track-portrait')
      ? CASE_MEDIA.portraits.elena
      : CASE_MEDIA.portraits.vera;
  }
  if (ILYA_PATTERN.test(source)) return CASE_MEDIA.portraits.ilya;
  return source;
}

function installSynchronousMediaRewrite(): void {
  const imagePrototype = HTMLImageElement.prototype;
  const nativeSetAttribute = imagePrototype.setAttribute;
  imagePrototype.setAttribute = function setOwnedImageAttribute(name: string, value: string): void {
    nativeSetAttribute.call(
      this,
      name,
      name.toLowerCase() === 'src' ? rewriteRemoteSource(value, this) : value
    );
  };

  const sourceDescriptor = Object.getOwnPropertyDescriptor(imagePrototype, 'src');
  if (sourceDescriptor?.get && sourceDescriptor.set) {
    Object.defineProperty(imagePrototype, 'src', {
      configurable: sourceDescriptor.configurable,
      enumerable: sourceDescriptor.enumerable,
      get: sourceDescriptor.get,
      set(value: string) {
        sourceDescriptor.set?.call(this, rewriteRemoteSource(String(value), this));
      }
    });
  }

  if (!REALISTIC_PRIMARY_MEDIA) {
    const style = document.createElement('style');
    style.dataset.dbrOwnedMedia = 'hero';
    style.textContent = `
      .premium-home,
      .premium-prologue {
        --hero-image: url("${CASE_MEDIA.hero}") !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function localSourceFor(image: HTMLImageElement): string | null {
  const source = image.currentSrc || image.src;
  if (REALISTIC_PRIMARY_MEDIA && source.includes(REMOTE_HOST)) return null;

  const label = [
    image.alt,
    image.getAttribute('aria-label') ?? '',
    image.closest<HTMLElement>('[aria-label]')?.getAttribute('aria-label') ?? '',
    image.closest<HTMLElement>('.premium-person-card, .character-card, .cctv-track-box')?.textContent ?? ''
  ].join(' ');

  const labelledPortrait = portraitFromLabel(label);
  if (labelledPortrait) return labelledPortrait;
  if (image.classList.contains('living-suspect-still')) return CASE_MEDIA.portraits.kirill;
  if (image.classList.contains('cctv-photo')) return CASE_MEDIA.corridor3f;

  const rewritten = rewriteRemoteSource(source, image);
  return rewritten === source ? null : rewritten;
}

function replaceImage(image: HTMLImageElement): void {
  const source = localSourceFor(image);
  if (!source || image.src === new URL(source, window.location.href).href) return;

  image.src = source;
  image.removeAttribute('srcset');
  image.dataset.dbrOwnedMedia = 'true';
  image.decoding = 'async';
}

function replaceHeroBackgrounds(): void {
  if (REALISTIC_PRIMARY_MEDIA) return;
  document.querySelectorAll<HTMLElement>('.premium-home, .premium-prologue').forEach((element) => {
    element.style.setProperty('--hero-image', `url("${CASE_MEDIA.hero}")`);
    element.dataset.dbrOwnedMedia = 'true';
  });
}

function applyOwnedMedia(): void {
  scheduled = false;
  replaceHeroBackgrounds();
  document.querySelectorAll<HTMLImageElement>('img').forEach(replaceImage);
  document.documentElement.dataset.dbrMediaPack = REALISTIC_PRIMARY_MEDIA
    ? 'case-001-hybrid-realistic-v1'
    : 'case-001-v1';
}

function scheduleOwnedMedia(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(applyOwnedMedia);
}

function preloadCriticalMedia(): void {
  [CASE_MEDIA.hero, CASE_MEDIA.corridor3f, CASE_MEDIA.portraits.kirill].forEach((source) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
  });
}

installSynchronousMediaRewrite();
preloadCriticalMedia();

document.addEventListener('click', () => window.setTimeout(scheduleOwnedMedia, 0), true);
window.addEventListener('dbr:runtime-settled', scheduleOwnedMedia);
window.addEventListener('pageshow', scheduleOwnedMedia);
window.addEventListener('dbr:interrogation-opened', scheduleOwnedMedia);
window.addEventListener('dbr:interrogation-updated', scheduleOwnedMedia);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleOwnedMedia, { once: true });
} else {
  scheduleOwnedMedia();
}
