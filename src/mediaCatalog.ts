const BASE = `${import.meta.env.BASE_URL}media/case-001`;

const evidence = {
  e006ArchivePlan: `${BASE}/evidence/e006-archive-plan.svg`,
  e007Room312: `${BASE}/evidence/e007-room-312.svg`,
  e008ArchiveTable: `${BASE}/evidence/e008-archive-table.svg`,
  e009IdentityDesk: `${BASE}/evidence/e009-identity-desk.svg`,
  e010ServiceRoom: `${BASE}/evidence/e010-service-room.svg`,
  e011CardLab: `${BASE}/evidence/e011-card-lab.svg`,
  finalCaseReport: `${BASE}/evidence/final-case-report.svg`,
  e006Thumbnail: `${BASE}/evidence/e006-plan-photo.svg`,
  e007Thumbnail: `${BASE}/evidence/e007-room-312.svg`,
  e008Thumbnail: `${BASE}/evidence/e008-archive-photo.svg`,
  e009Thumbnail: `${BASE}/evidence/e009-identity-desk.svg`,
  e010Thumbnail: `${BASE}/evidence/e010-service-photo.svg`,
  e011Thumbnail: `${BASE}/evidence/e011-forensic-photo.svg`
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
    room312: evidence.e007Room312,
    archiveTable: evidence.e008ArchiveTable,
    identityDesk: evidence.e009IdentityDesk,
    serviceRoom: evidence.e010ServiceRoom,
    cardLab: evidence.e011CardLab,
    finalReport: evidence.finalCaseReport,
    thumbnails: {
      E006: evidence.e006Thumbnail,
      E007: evidence.e007Thumbnail,
      E008: evidence.e008Thumbnail,
      E009: evidence.e009Thumbnail,
      E010: evidence.e010Thumbnail,
      E011: evidence.e011Thumbnail
    }
  }
} as const;

export type CharacterMediaId = keyof typeof CASE_MEDIA.portraits;
export type EvidenceMediaId = keyof typeof CASE_MEDIA.evidence;

export function getPortrait(id: string): string {
  return CASE_MEDIA.portraits[id as CharacterMediaId] ?? CASE_MEDIA.portraits.ilya;
}
