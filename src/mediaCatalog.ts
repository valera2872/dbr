const BASE = `${import.meta.env.BASE_URL}media/case-001`;

export const CASE_MEDIA = {
  room314: `${BASE}/scenes/room-314.svg`,
  hero: `${BASE}/scenes/room-314.svg`,
  corridor3f: `${BASE}/scenes/corridor-3f.svg`,
  camera3f: `${BASE}/scenes/corridor-3f.svg`,
  portraits: {
    kirill: `${BASE}/portraits/kirill.svg`,
    marina: `${BASE}/portraits/marina.svg`,
    denis: `${BASE}/portraits/denis.svg`,
    vera: `${BASE}/portraits/vera.svg`,
    ilya: `${BASE}/portraits/ilya.svg`,
    elena: `${BASE}/portraits/elena.svg`
  }
} as const;

export type CharacterMediaId = keyof typeof CASE_MEDIA.portraits;

export function getPortrait(id: string): string {
  return CASE_MEDIA.portraits[id as CharacterMediaId] ?? CASE_MEDIA.portraits.ilya;
}
