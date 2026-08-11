import room314Source from './cases/room314.json';
import { subscribeInvestigationState } from './investigationState';

const manifest = room314Source.manifest;
let installed = false;

function setFeature(root: HTMLElement, index: number, emphasis: string, suffix: string): void {
  const feature = root.querySelectorAll<HTMLElement>('.commercial-launch-features > span').item(index);
  if (!feature) return;

  const strong = document.createElement('b');
  strong.textContent = emphasis;
  feature.replaceChildren(strong, document.createTextNode(suffix ? ` ${suffix}` : ''));
}

function splitPlayers(value: string): { count: string; label: string } {
  const match = value.trim().match(/^(\S+)\s+(.+)$/);
  return match
    ? { count: match[1], label: match[2] }
    : { count: value.trim(), label: '' };
}

function applyCommercialMetadata(): void {
  const launch = document.querySelector<HTMLElement>('.commercial-launch');
  if (!launch) return;

  const rating = launch.querySelector<HTMLElement>('.commercial-launch-rating');
  if (rating) rating.textContent = manifest.ageRating;

  setFeature(launch, 0, `≈ ${manifest.estimatedMinutes}`, 'минут');

  const players = splitPlayers(manifest.players);
  setFeature(launch, 1, players.count, players.label);

  launch.dataset.metadataSource = 'case-manifest';
}

export function installCommercialMetadataConsistency(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState(() => applyCommercialMetadata());
  window.addEventListener('pageshow', applyCommercialMetadata);
  applyCommercialMetadata();
}
