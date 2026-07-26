/**
 * k-school-privacy-utils.js — K-Health 소규모 셀 억제 유틸리티 재사용 래퍼 v1.0
 * 설계 문서: docs/K_SCHOOL_PUBLIC_EDUCATION_DATA_SYSTEM_v1_0.md §3, §5, §7
 *
 * 이 파일은 로직을 새로 구현하지 않는다. `suppressSmallCells()` ·
 * `suppressWithHistoryGuard()`는 "질병"·"환자" 같은 도메인 개념에
 * 의존하지 않는 순수 함수이므로, health 저장소의 원본을 그대로 가져와
 * 쓴다(design doc §7 — 코드 재사용 원칙). 이 파일이 새로 정의하는 건
 * 교육 도메인 전용 두 가지뿐이다:
 *   1. SENSITIVE_LEARNER_CATEGORIES — 교육 도메인의 민감 범주 목록(§3.1)
 *   2. flagComprehensionIllusion() — flagAccessGap()의 가독성용 래퍼(§5)
 *
 * 로드 순서: 이 파일보다 먼저 k-health-privacy-utils.js가 로드되어
 * window.KHealthPrivacyUtils를 노출한 상태여야 한다.
 *   <script src="https://cdn.jsdelivr.net/gh/Openhash-Gopang/health@main/k-health-privacy-utils.js"></script>
 *   <script src="./k-school-privacy-utils.js"></script>
 *
 * Node(테스트) 환경에서는 require()로 직접 상대 경로 지정 — 아래 참고.
 */

(function () {

/* ════════════════════════════════════════════════════════════
   환경별 원본 유틸리티 로드 (브라우저: window, Node: require)
   ════════════════════════════════════════════════════════════ */
function _loadBase() {
  if (typeof window !== 'undefined' && window.KHealthPrivacyUtils) {
    return window.KHealthPrivacyUtils;
  }
  if (typeof module !== 'undefined' && module.exports) {
    // 테스트 등 Node 환경 — health 저장소를 형제 디렉터리로 체크아웃해
    // 상대 경로로 참조하거나, 테스트 러너에서 경로를 주입한다.
    // 기본값: ../health/k-health-privacy-utils.js — health와 school 저장소가
    // 형제 디렉터리로 체크아웃된 경우(예: C:\...\Downloads\health,
    // C:\...\Downloads\school) 이 경로가 맞다. CI 등 다른 구조에서는
    // K_HEALTH_PRIVACY_UTILS_PATH 환경변수로 재정의한다.
    try {
      return require(process.env.K_HEALTH_PRIVACY_UTILS_PATH || '../health/k-health-privacy-utils.js');
    } catch (e) {
      throw new Error(
        'k-health-privacy-utils.js를 찾을 수 없습니다. health 저장소를 형제 디렉터리로 체크아웃하거나, ' +
        'K_HEALTH_PRIVACY_UTILS_PATH 환경변수로 경로를 지정하세요. (' + e.message + ')'
      );
    }
  }
  throw new Error('k-health-privacy-utils.js가 먼저 로드되어야 합니다.');
}

const _base = _loadBase();
// 구조분해로 만든 로컬 바인딩은 이 IIFE 안에서만 유효하다 — 클래식
// <script> 태그로 로드되는 두 파일이 전역 스코프를 공유하므로, IIFE
// 없이 top-level const로 재선언하면 health 쪽의 동명 function 선언과
// 충돌한다(실제로 브라우저 렌더 테스트에서 발견된 버그 — 2026-07-26).
const _suppressSmallCells = _base.suppressSmallCells;
const _suppressWithHistoryGuard = _base.suppressWithHistoryGuard;

/* ════════════════════════════════════════════════════════════
   §3.1 교육 도메인 민감 범주 — 정책 검토위원회 승인 없이 채우지 않는다
   ════════════════════════════════════════════════════════════ */
const SENSITIVE_LEARNER_CATEGORIES = [
  // 예시 — 실제 목록은 교육 전문가·특수교육 당사자 자문을 거쳐 확정 전까지 비워둔다.
  // { code: 'SPED', name: '특수교육 대상', k: 20 },
  // { code: 'LOW_ACHIEVE', name: '학습부진(하위 누적)', k: 20 },
  // { code: 'MULTICULTURAL', name: '다문화가정 학생', k: 20 },
];

function kForLearnerCategory(categoryCode, defaultK = 5) {
  const found = SENSITIVE_LEARNER_CATEGORIES.find(c => c.code === categoryCode);
  return found ? found.k : defaultK;
}

/* ════════════════════════════════════════════════════════════
   §5 이해도 착시 격차 — flagAccessGap()의 가독성용 래퍼
   로직은 K-Health의 flagAccessGap()과 완전히 동일하다(비율 A vs
   비율 B의 격차 판정은 도메인 무관) — 이름만 교육 맥락에 맞춘다.
   ════════════════════════════════════════════════════════════ */

/**
 * @param {object} unit
 *   - key: 단원·학년군·지역 식별자
 *   - selfReportedComprehensionRate: 자기평가 "이해함" 비율 [0,1]
 *   - actualAssessmentPassRate: 실제 평가 "충족" 비율 [0,1] (교수 페르소나 PDV)
 *   - sampleSize: 두 소스 중 더 작은 표본 크기
 * @param {object} opts
 *   - gapThreshold: 격차 플래그 임계값(기본 0.20 — K-Health의 0.15보다 보수적,
 *     설계문서 §5에서 실측 데이터로 보정 필요하다고 명시한 잠정치)
 *   - minSampleK: 최소 표본(기본 5)
 */
function flagComprehensionIllusion(unit, opts = {}) {
  const gapThreshold = opts.gapThreshold ?? 0.20;
  const minSampleK = opts.minSampleK ?? 5;

  if (unit.sampleSize < minSampleK) {
    return { key: unit.key, flagged: false, reason: 'insufficient_sample' };
  }

  const gap = unit.selfReportedComprehensionRate - unit.actualAssessmentPassRate;
  if (gap > gapThreshold) {
    return {
      key: unit.key,
      flagged: true,
      gapMagnitude: Math.round(gap * 100) / 100,
      interpretation: '자기평가 이해도가 실제 평가 충족률보다 유의하게 높음 — 이해도 착시 의심 구간',
    };
  }
  return { key: unit.key, flagged: false };
}

/* ════════════════════════════════════════════════════════════
   내보내기
   ════════════════════════════════════════════════════════════ */
const KSchoolPrivacyUtils = {
  // K-Health 원본 재노출(§7 원칙 — 새로 구현 안 함)
  suppressSmallCells: _suppressSmallCells,
  suppressWithHistoryGuard: _suppressWithHistoryGuard,
  // K-School 전용
  flagComprehensionIllusion,
  kForLearnerCategory,
  SENSITIVE_LEARNER_CATEGORIES,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KSchoolPrivacyUtils;
}
if (typeof window !== 'undefined') {
  window.KSchoolPrivacyUtils = KSchoolPrivacyUtils;
}

})();
