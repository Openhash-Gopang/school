// ── K-School 설정 ────────────────────────────────────────
// 2026-08-20: Supabase(SUPA_URL/SUPA_ANON)는 2026-08-12 시크릿 사고 이후
// 자격증명이 빈 문자열로 남아 report.js의 모든 조회가 조용히 실패하고
// 있었다. klaw 저장소가 이미 쓰는 패턴(L1_URL, webapp.html 참고)을 따라
// PocketBase(l1-hanlim, gopang pb_migrations의 school_* 컬렉션)로 전환한다.
// school_* 컬렉션은 공개 read/write 규칙(listRule/createRule 등 null)이라
// 별도 API 키가 필요 없다 — HDR도 더 이상 필요 없어 제거했다.
const PB_BASE = 'https://l1-hanlim.hondi.net/api/collections/';

// AI 교수 시스템 프롬프트 경로
const SYSTEM_PROMPT_URL = '/prompts/system_prompt.txt';

// 학제 정의
const SCHOOL_STAGES = [
  { id:'kindergarten', label:'유치원',   age:'3-5세',   color:'#f59e0b' },
  { id:'elementary',   label:'초등학교', age:'6-11세',  color:'#22c55e' },
  { id:'middle',       label:'중학교',   age:'12-14세', color:'#3b82f6' },
  { id:'high',         label:'고등학교', age:'15-17세', color:'#8b5cf6' },
  { id:'university',   label:'대학교',   age:'18-21세', color:'#ef4444' },
  { id:'graduate',     label:'대학원',   age:'22세+',   color:'#3ecf8e' },
];

// 7단계 프로세스
const SEVEN_STAGES = [
  { n:1, title:'인간 고유 업무 식별',    desc:'AI 대체 불가능 업무 자동 나열 및 분류', metric:'32.2% 대체 불가 · 48.9% 협업 필요' },
  { n:2, title:'사회 효용 최대화 배정',  desc:'개인 역량과 사회 필요의 최적 매칭',     metric:'41.3% 사회 효용 향상' },
  { n:3, title:'개인 의사 수집 및 반영', desc:'수용 여부 확인 · 대안 직종 제안',        metric:'96.7% 응답률 · 87.2% 만족도' },
  { n:4, title:'균형점 최적화',          desc:'NSGA-II 기반 개인-사회 통합 효용',       metric:'통합효용 0.801 달성' },
  { n:5, title:'맞춤형 교육 제공',       desc:'AI 교수 전담 · 학생 프로파일 반영',      metric:'98.2% 역량 매칭 정확도' },
  { n:6, title:'주기적 동적 갱신',       desc:'50년 장기 예측 · AI-인간 역할 재조정',   metric:'98.7% 자동 재실행 성공률' },
  { n:7, title:'실시간 진로 수정',       desc:'개인 주도 진로 변경 · 즉시 처리',        metric:'평균 2.3분 내 처리' },
];

// AI 교수 — 단일, 모든 분야 담당
const AI_PROFESSOR = {
  id:      'prof-01',
  name:    'AI 교수',
  domains: ['논리·철학','수학·통계','과학','언어','예술','체육','사회','기술','심리','진로'],
  desc:    '세상의 모든 지식을 갖추고, 학생 한 명을 유치원부터 대학원까지 수십 년간 전담 지도합니다.',
};

// ── PocketBase 공용 헬퍼 (2026-08-20 신설) ─────────────────────
// desktop.html/dashboard.html이 각자 따로 Supabase를 직접 호출하던 걸
// 여기 한 곳으로 모았다. school_student_dashboard(Postgres 집계 뷰)는
// PocketBase에 대응물이 없어서, report.js가 이미 하던 것과 같은 방식으로
// school_sessions/school_subjects를 직접 읽어 클라이언트에서 집계한다.
// school_subjects?select=*,school_progress(...)의 PostgREST 임베드 조인도
// PocketBase에 없어서, subjects와 progress를 각각 조회 후 subject.id 기준
// 클라이언트에서 합쳐 기존 s.school_progress[0] 접근 형태를 그대로 유지한다.

async function pbList(collectionName, filterExpr, extraQuery) {
  const filter = encodeURIComponent(filterExpr);
  const res = await fetch(`${PB_BASE}${collectionName}/records?filter=(${filter})${extraQuery || ''}`);
  const data = await res.json();
  return data.items || [];
}

async function fetchSchoolProfile(guid) {
  const rows = await pbList('school_student_profiles', `user_guid='${guid}'`, '&perPage=1');
  return rows[0] || null;
}

async function fetchSchoolDashboardAggregate(guid) {
  const [sessions, subjects] = await Promise.all([
    pbList('school_sessions', `user_guid='${guid}'`, '&perPage=500'),
    pbList('school_subjects', `user_guid='${guid}' && status='active'`, '&perPage=200'),
  ]);
  const total_study_minutes = sessions.reduce((s, r) => s + (r.session_minutes || 0), 0);
  const overall_comprehension = sessions.length
    ? sessions.reduce((s, r) => s + (r.comprehension || 0), 0) / sessions.length
    : 0;
  return {
    total_study_minutes,
    total_sessions_done: sessions.length,
    overall_comprehension,
    active_subjects: subjects.length,
  };
}

async function fetchSchoolSubjectsWithProgress(guid) {
  const [subjects, progress] = await Promise.all([
    pbList('school_subjects', `user_guid='${guid}'`, '&perPage=200'),
    pbList('school_progress', `user_guid='${guid}'`, '&perPage=200'),
  ]);
  return subjects.map(s => ({
    ...s,
    school_progress: progress.filter(p => p.subject_id === s.id),
  }));
}

async function fetchSchoolReports(guid, limit) {
  return pbList('school_reports', `user_guid='${guid}'`, `&sort=-created&perPage=${limit || 3}`);
}
