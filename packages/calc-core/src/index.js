/**
 * @salary-cal/calc-core — 순수 계산·검증 로직 단일 진입점
 * (레거시 js/domain/* 를 워크스페이스 상대 경로로 재수출)
 */

export * from '../../../js/domain/salary.js';
export * from '../../../js/domain/tax.js';
export * from '../../../js/domain/loan.js';
export * from '../../../js/domain/validation.js';

export {
  SHARE_QUERY_SCHEMA_VERSION,
  shareQueryParamSchema,
  parseShareSearchParams,
  safeShareParamsObject,
} from './schemas.js';
