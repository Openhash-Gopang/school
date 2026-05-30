// ── K-School 설정 ────────────────────────────────────────
const SUPA_URL  = 'https://ebbecjfrwaswbdybbgiu.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYmVjamZyd2Fzd2JkeWJiZ2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjE5ODQsImV4cCI6MjA5NTEzNzk4NH0.H2ahQKtWdSke04Pdi3hDY86pdTx7UUKPUpQMlS_zciA';
const HDR = { 'apikey': SUPA_ANON, 'Authorization': 'Bearer ' + SUPA_ANON };

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
