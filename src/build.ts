export const APP_BUILD = 'v0.8.3';
export const CASE_ID = 'dbr_001_room_314';
export const CORE_STORAGE_KEY = `dbr:${CASE_ID}:0.2.0`;
export const ACT2_STORAGE_KEY = `dbr:${CASE_ID}:act2:v0.5.0`;
export const ACT3_STORAGE_KEY = `dbr:${CASE_ID}:act3:v0.6.0`;
export const ACT4_STORAGE_KEY = `dbr:${CASE_ID}:act4:v0.7.0`;
// Ключ допроса сохраняется прежним, чтобы обновление не сбрасывало прохождение.
export const INTERROGATION_STORAGE_KEY = `dbr:${CASE_ID}:interrogation:kirill:v0.6.2`;
export const LIVING_SUSPECT_STORAGE_KEY = `dbr:${CASE_ID}:living-suspect:kirill:v0.6.3`;
export const PREMIUM_STORAGE_PREFIX = `dbr:${CASE_ID}:premium:`;
export const STATE_SCHEMA_KEY = `${PREMIUM_STORAGE_PREFIX}state-schema`;
export const STATE_DIAGNOSTICS_KEY = `${PREMIUM_STORAGE_PREFIX}diagnostics`;
export const STATE_SCHEMA_VERSION = 1;
