const {
  normalizeComprehension, normalizeSessionFrequency,
  groupLearnerRecords, aggregateLearnerComprehension,
} = require('../k-school-aggregate.js');

let failures = 0;
function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error(`FAIL: ${label}\n  actual:   ${a}\n  expected: ${e}`); failures++; }
  else console.log(`OK: ${label}`);
}
function assertTrue(cond, label) {
  if (!cond) { console.error(`FAIL: ${label}`); failures++; }
  else console.log(`OK: ${label}`);
}

/* ── normalizeComprehension ── */
assertEq(normalizeComprehension(1), 'low', '1점 → low');
assertEq(normalizeComprehension(2), 'low', '2점 → low');
assertEq(normalizeComprehension(3), 'mid', '3점 → mid');
assertEq(normalizeComprehension(4), 'high', '4점 → high');
assertEq(normalizeComprehension(5), 'high', '5점 → high');
assertEq(normalizeComprehension(NaN), null, '유효하지 않은 값 → null');

/* ── normalizeSessionFrequency ── */
assertEq(normalizeSessionFrequency(3), '<5', '3회 → <5 버킷');
assertEq(normalizeSessionFrequency(5), '5-15', '5회(경계값) → 5-15 버킷');
assertEq(normalizeSessionFrequency(15), '5-15', '15회(경계값) → 5-15 버킷');
assertEq(normalizeSessionFrequency(16), '15+', '16회 → 15+ 버킷');

/* ── 픽스처: 40명 학습자, 같은 그룹(표본 충분) ── */
function makeLearners(n, { unit = 'M2-FUNC', grade = 'MS2', region = '제주시', period = '2026-07', highRatio = 0.3 } = {}) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const score = i < n * highRatio ? 5 : (i < n * (highRatio + 0.4) ? 3 : 1);
    arr.push({
      learner_guid: `learner-${unit}-${i}`,
      unit_code: unit, grade_band: grade, region, period,
      comprehension_raw_score: score,
      session_count_monthly: 3 + (i % 20),
      dropout: i % 13 === 0,
    });
  }
  return arr;
}

/* ── groupLearnerRecords: 그룹화 및 중복 제거 확인 ── */
const learners40 = makeLearners(40);
const dup = { ...learners40[0] }; // 동일 학습자 중복 레코드
const grouped = groupLearnerRecords([...learners40, dup]);
assertEq(grouped.size, 1, '모든 레코드가 같은 그룹(단원×학년군×지역×월)으로 묶임');
const g = grouped.values().next().value;
assertEq(g.total, 40, '중복 레코드(같은 learner_guid)는 1회만 집계됨 — 40명 그대로');

/* ── 필수 차원 누락 레코드는 스킵 ── */
const withMissing = [...learners40, { learner_guid: 'x', comprehension_raw_score: 5 }]; // unit_code 등 누락
const groupedMissing = groupLearnerRecords(withMissing);
assertEq(groupedMissing.values().next().value.total, 40, '필수 차원(unit_code 등) 누락 레코드는 집계에서 제외됨');

/* ── aggregateLearnerComprehension: 표본 충분(40명, k=5) → 공개 ── */
const agg1 = aggregateLearnerComprehension(learners40, { k: 5, roundTo: 5 });
assertEq(agg1.length, 1, '그룹 1개 반환');
assertEq(agg1[0].status, 'published', '표본 40명(k=5) → 공개');
assertTrue(agg1[0].sample_size >= 35 && agg1[0].sample_size <= 45, `표본 크기가 반올림되어 40 근처(실제: ${agg1[0].sample_size})`);
assertTrue(
  agg1[0].comprehension_distribution.low + agg1[0].comprehension_distribution.mid + agg1[0].comprehension_distribution.high > 0,
  '이해도 분포가 비어있지 않음'
);

/* ── aggregateLearnerComprehension: 표본 부족(3명) → 억제 ── */
const smallGroup = makeLearners(3, { unit: 'RARE-UNIT' });
const agg2 = aggregateLearnerComprehension(smallGroup, { k: 5 });
assertEq(agg2[0].status, 'suppressed', '표본 3명(k=5 미만) → 억제');
assertTrue(!('comprehension_distribution' in agg2[0]), '억제된 그룹은 이해도 분포 자체를 반환하지 않음(원본 비노출)');

/* ── 개인 식별 정보(learner_guid)가 결과에 전혀 노출되지 않는지 확인 ── */
const serialized = JSON.stringify(agg1);
assertTrue(!serialized.includes('learner-'), '집계 결과에 개인 학습자 GUID가 전혀 포함되지 않음');

/* ── 서로 다른 지역은 별도 그룹으로 집계 ── */
const twoRegions = [...makeLearners(20, { region: '제주시' }), ...makeLearners(20, { region: '서귀포시' })];
const aggRegions = aggregateLearnerComprehension(twoRegions, { k: 5 });
assertEq(aggRegions.length, 2, '지역이 다르면 별도 그룹으로 집계됨');

console.log(failures === 0 ? '\n✅ 전체 통과' : `\n❌ ${failures}건 실패`);
process.exit(failures === 0 ? 0 : 1);
