/**
 * k-school-aggregate.js — 학습자 PDV 단일 소스 집계 파이프라인 v1.0
 * 설계 문서: docs/K_SCHOOL_PUBLIC_EDUCATION_DATA_SYSTEM_v1_0.md §4.1, §8 1단계
 *
 * 로드맵 1단계: "학습자 PDV 단일 소스로 시작(자기평가 집계만)"의 실제 구현.
 * 이 파일은 순수 함수만 담는다 — PDV 샌드박스 내부에서 실행되든, 월간 배치
 * 워커에서 실행되든 동일하게 동작해야 한다(k-health-privacy-utils.js와 같은 설계 원칙).
 *
 * 처리 흐름:
 *   원시 학습자 자기평가 레코드(개인 단위)
 *     → 단원×학년군×지역×월 단위로 그룹화
 *     → 그룹별 이해도 분포 집계
 *     → 소규모 셀 억제(k-school-privacy-utils.js 재사용) 적용
 *     → 정책 통계로 공개 가능한 형태만 반환
 *
 * 로드 순서(브라우저): k-health-privacy-utils.js → k-school-privacy-utils.js → 이 파일
 */

(function () {

function _loadKSchoolUtils() {
  if (typeof window !== 'undefined' && window.KSchoolPrivacyUtils) {
    return window.KSchoolPrivacyUtils;
  }
  if (typeof module !== 'undefined' && module.exports) {
    try {
      return require(process.env.K_SCHOOL_PRIVACY_UTILS_PATH || './k-school-privacy-utils.js');
    } catch (e) {
      throw new Error(
        'k-school-privacy-utils.js를 찾을 수 없습니다. K_SCHOOL_PRIVACY_UTILS_PATH 환경변수로 경로를 지정하세요. (' + e.message + ')'
      );
    }
  }
  throw new Error('k-school-privacy-utils.js가 먼저 로드되어야 합니다.');
}

const _ks = _loadKSchoolUtils();
const _suppressSmallCells = _ks.suppressSmallCells;

/* ════════════════════════════════════════════════════════════
   §4.1 캡슐 키가 요구하는 값 형태로 원시값을 정규화
   ════════════════════════════════════════════════════════════ */

/**
 * 원시 자기평가 응답(예: 1~5 척도, 또는 자유 텍스트 사전 분류 결과)을
 * 캡슐 API 스펙(enum {low,mid,high})으로 정규화한다.
 * 이 매핑 규칙 자체도 검토 대상이므로 별도 함수로 분리해둔다.
 */
function normalizeComprehension(rawScore) {
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) return null;
  if (rawScore <= 2) return 'low';    // 5점 척도 기준 1~2점
  if (rawScore <= 3) return 'mid';    // 3점
  return 'high';                      // 4~5점
}

/**
 * 월 활동 세션 수를 캡슐 키 스펙의 버킷(<5회/5-15회/15+회)으로 정규화한다.
 */
function normalizeSessionFrequency(count) {
  if (typeof count !== 'number' || count < 0) return null;
  if (count < 5) return '<5';
  if (count <= 15) return '5-15';
  return '15+';
}

/* ════════════════════════════════════════════════════════════
   그룹화 — 단원×학년군×지역×월 단위 (개인 식별 불가 형태로만)
   ════════════════════════════════════════════════════════════ */

/**
 * @param {Array<{learner_guid:string, unit_code:string, grade_band:string,
 *                 region:string, comprehension_raw_score:number,
 *                 session_count_monthly:number, dropout:boolean,
 *                 period:string}>} records — 원시 학습자 PDV 레코드(개인 단위)
 * @returns {Map<string, object>} groupKey → 그룹 원시 집계(억제 전)
 */
function groupLearnerRecords(records) {
  const groups = new Map();

  for (const r of records) {
    if (!r.unit_code || !r.grade_band || !r.region || !r.period) continue; // 필수 차원 누락 시 스킵

    const groupKey = `${r.period}|${r.region}|${r.grade_band}|${r.unit_code}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        period: r.period, region: r.region, grade_band: r.grade_band, unit_code: r.unit_code,
        comprehension_counts: { low: 0, mid: 0, high: 0 },
        session_freq_counts: { '<5': 0, '5-15': 0, '15+': 0 },
        dropout_count: 0,
        total: 0,
        _learnerGuids: new Set(), // 중복 집계 방지용(억제 전 내부 계산에만 쓰고 절대 반환하지 않음)
      });
    }

    const g = groups.get(groupKey);
    if (g._learnerGuids.has(r.learner_guid)) continue; // 같은 학습자 중복 레코드는 1회만 반영
    g._learnerGuids.add(r.learner_guid);

    const comp = normalizeComprehension(r.comprehension_raw_score);
    if (comp) g.comprehension_counts[comp]++;

    const freq = normalizeSessionFrequency(r.session_count_monthly);
    if (freq) g.session_freq_counts[freq]++;

    if (r.dropout) g.dropout_count++;

    g.total++;
  }

  return groups;
}

/* ════════════════════════════════════════════════════════════
   소규모 셀 억제 적용 및 공개용 통계 산출
   ════════════════════════════════════════════════════════════ */

/**
 * groupLearnerRecords()의 결과를 소규모 셀 억제를 거쳐 공개 가능한
 * 정책 통계로 변환한다.
 *
 * @param {Array<object>} rawRecords — 원시 학습자 PDV 레코드
 * @param {object} opts — { k: 최소 셀 크기(기본 5), roundTo: 반올림 단위(기본 5) }
 * @returns {Array<object>} 공개 가능한(또는 억제된) 그룹별 통계
 */
function aggregateLearnerComprehension(rawRecords, opts = {}) {
  const groups = groupLearnerRecords(rawRecords);
  const results = [];

  for (const g of groups.values()) {
    // 그룹 전체 표본 크기 자체를 소규모 셀 억제 대상으로 삼는다 —
    // 표본이 작으면 이해도 분포 자체를 공개하지 않는다.
    const suppressed = _suppressSmallCells(
      [{ key: g.key, count: g.total }],
      opts
    )[0];

    if (suppressed.status === 'suppressed') {
      results.push({
        key: g.key, period: g.period, region: g.region, grade_band: g.grade_band, unit_code: g.unit_code,
        status: 'suppressed',
        note: suppressed.note,
      });
      continue;
    }

    // 공개 가능 — 이해도 분포도 개별적으로 반올림(통제된 반올림, §3.2와 동일 원칙)
    const roundTo = opts.roundTo ?? 5;
    const roundCount = n => Math.round(n / roundTo) * roundTo;

    results.push({
      key: g.key, period: g.period, region: g.region, grade_band: g.grade_band, unit_code: g.unit_code,
      status: 'published',
      sample_size: suppressed.value, // 통제된 반올림이 적용된 표본 크기
      comprehension_distribution: {
        low: roundCount(g.comprehension_counts.low),
        mid: roundCount(g.comprehension_counts.mid),
        high: roundCount(g.comprehension_counts.high),
      },
      session_frequency_distribution: {
        '<5': roundCount(g.session_freq_counts['<5']),
        '5-15': roundCount(g.session_freq_counts['5-15']),
        '15+': roundCount(g.session_freq_counts['15+']),
      },
      dropout_rate: Math.round((g.dropout_count / g.total) * 100) / 100,
    });
  }

  return results;
}

/* ════════════════════════════════════════════════════════════
   내보내기
   ════════════════════════════════════════════════════════════ */
const KSchoolAggregate = {
  normalizeComprehension,
  normalizeSessionFrequency,
  groupLearnerRecords,
  aggregateLearnerComprehension,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KSchoolAggregate;
}
if (typeof window !== 'undefined') {
  window.KSchoolAggregate = KSchoolAggregate;
}

})();
