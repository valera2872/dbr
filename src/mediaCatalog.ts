const BASE = `${import.meta.env.BASE_URL}media/case-001`;

const evidence = {
  e006ArchivePlan: `${BASE}/evidence/e006-archive-plan.svg`,
  e008ArchiveTable: `${BASE}/evidence/e008-archive-table.svg`,
  e010ServiceRoom: `${BASE}/evidence/e010-service-room.svg`,
  e011CardLab: `${BASE}/evidence/e011-card-lab.svg`,
  finalCaseReport: `${BASE}/evidence/final-case-report.svg`
} as const;

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
  },
  evidence: {
    ...evidence,
    archivePlan: evidence.e006ArchivePlan,
    archiveTable: evidence.e008ArchiveTable,
    serviceRoom: evidence.e010ServiceRoom,
    cardLab: evidence.e011CardLab,
    finalReport: evidence.finalCaseReport
  }
} as const;

export type CharacterMediaId = keyof typeof CASE_MEDIA.portraits;
export type EvidenceMediaId = keyof typeof CASE_MEDIA.evidence;

export function getPortrait(id: string): string {
  return CASE_MEDIA.portraits[id as CharacterMediaId] ?? CASE_MEDIA.portraits.ilya;
}
