const {
  suppressSmallCells, flagComprehensionIllusion, kForLearnerCategory
} = require('../k-school-privacy-utils.js');

let failures = 0;
function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error(`FAIL: ${label}\n  actual:   ${a}\n  expected: ${e}`); failures++; }
  else console.log(`OK: ${label}`);
}

/* ── K-Health 원본 재사용 확인 — suppressSmallCells가 실제로 동작하는지 ── */
const r1 = suppressSmallCells([{ key: '중2-함수', count: 3 }], { k: 5 });
assertEq(r1[0].status, 'suppressed', '재사용된 suppressSmallCells: 표본 3명(k=5) → 억제');

const r2 = suppressSmallCells([{ key: '중2-함수', count: 42 }], { k: 5, roundTo: 5 });
assertEq(r2[0].status, 'published', '재사용된 suppressSmallCells: 표본 42명 → 공개');
assertEq(r2[0].value, 40, '42 → 5의 배수로 반올림 시 40');

/* ── flagComprehensionIllusion — K-School 전용 래퍼 ── */
const r3 = flagComprehensionIllusion(
  { key: '중2-함수', selfReportedComprehensionRate: 0.5, actualAssessmentPassRate: 0.2, sampleSize: 3 },
  { minSampleK: 5 }
);
assertEq(r3.flagged, false, '표본 3명(minSampleK=5 미만) → 플래그 안함');
assertEq(r3.reason, 'insufficient_sample', '사유는 표본부족');

const r4 = flagComprehensionIllusion(
  { key: '중2-함수', selfReportedComprehensionRate: 0.7, actualAssessmentPassRate: 0.4, sampleSize: 50 },
  { gapThreshold: 0.20 }
);
assertEq(r4.flagged, true, '격차 0.3 > 임계값 0.20 → 플래그(이해도 착시 의심)');

const r5 = flagComprehensionIllusion(
  { key: '중2-함수', selfReportedComprehensionRate: 0.55, actualAssessmentPassRate: 0.45, sampleSize: 50 },
  { gapThreshold: 0.20 }
);
assertEq(r5.flagged, false, '격차 0.1 <= 임계값 0.20 → 플래그 안함');

/* ── K-School 기본 gapThreshold(0.20)가 K-Health(0.15)보다 보수적인지 확인 ── */
const r6 = flagComprehensionIllusion(
  { key: '중1-일차방정식', selfReportedComprehensionRate: 0.62, actualAssessmentPassRate: 0.45, sampleSize: 50 }
  // opts 생략 — 기본값(0.20) 사용, 격차는 0.17
);
assertEq(r6.flagged, false, '기본 임계값 0.20 적용 시 격차 0.17은 플래그 안됨(K-Health 기본값 0.15였다면 플래그됐을 격차)');

/* ── kForLearnerCategory — 민감범주 미등록 시 기본 k=5 ── */
assertEq(kForLearnerCategory('SPED'), 5, 'SENSITIVE_LEARNER_CATEGORIES가 비어있으므로 미등록 코드는 기본 k=5');
assertEq(kForLearnerCategory('SPED', 10), 10, 'defaultK 인자 전달 시 그 값 사용');

console.log(failures === 0 ? '\n✅ 전체 통과' : `\n❌ ${failures}건 실패`);
process.exit(failures === 0 ? 0 : 1);
