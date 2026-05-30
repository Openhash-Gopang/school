// ── K-School 설정 ────────────────────────────────────────
const SUPA_URL  = 'https://ebbecjfrwaswbdybbgiu.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYmVjamZyd2Fzd2JkeWJiZ2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjE5ODQsImV4cCI6MjA5NTEzNzk4NH0.H2ahQKtWdSke04Pdi3hDY86pdTx7UUKPUpQMlS_zciA';
const HDR = { 'apikey': SUPA_ANON, 'Authorization': 'Bearer ' + SUPA_ANON };

// 학제 정의
const SCHOOL_STAGES = [
  { id:'kindergarten', label:'유치원',  en:'Kindergarten', age:'3-5세',  color:'#ff9800', icon:'🌱' },
  { id:'elementary',   label:'초등학교', en:'Elementary',   age:'6-11세', color:'#4caf50', icon:'📚' },
  { id:'middle',       label:'중학교',   en:'Middle',       age:'12-14세',color:'#2196f3', icon:'🔬' },
  { id:'high',         label:'고등학교', en:'High',         age:'15-17세',color:'#9c27b0', icon:'💡' },
  { id:'university',   label:'대학교',   en:'University',   age:'18-21세',color:'#f44336', icon:'🎓' },
  { id:'graduate',     label:'대학원',   en:'Graduate',     age:'22세+',  color:'#3ecf8e', icon:'🏆' },
];

// 7단계 프로세스
const SEVEN_STAGES = [
  { n:1, title:'인간 고유 업무 식별',    desc:'AI 대체 불가능 업무 자동 나열 및 분류', metric:'32.2% 대체 불가 · 48.9% 협업 필요', icon:'🧬' },
  { n:2, title:'사회 효용 최대화 배정',  desc:'개인 역량과 사회 필요의 최적 매칭',     metric:'41.3% 사회 효용 향상',               icon:'⚖️' },
  { n:3, title:'개인 의사 수집 및 반영', desc:'수용 여부 확인 · 대안 직종 제안',        metric:'96.7% 응답률 · 87.2% 만족도',         icon:'💬' },
  { n:4, title:'균형점 최적화',          desc:'NSGA-II 기반 개인-사회 통합 효용',       metric:'통합효용 0.801 달성',                  icon:'🎯' },
  { n:5, title:'맞춤형 교육 제공',       desc:'AI 교수 주도 · 인간 교사 보조 체계',     metric:'98.2% 역량 매칭 정확도',               icon:'🤖' },
  { n:6, title:'주기적 동적 갱신',       desc:'50년 장기 예측 · AI-인간 역할 재조정',   metric:'98.7% 자동 재실행 성공률',             icon:'🔄' },
  { n:7, title:'실시간 진로 수정',       desc:'개인 주도 진로 변경 · 즉시 처리',        metric:'평균 2.3분 내 처리',                   icon:'✏️' },
];

// AI 교수진 10명
const AI_PROFESSORS = [
  { id:'prof-01', name:'사고 교수', spec:'논리·철학·비판적사고', icon:'🧠', color:'#9c27b0' },
  { id:'prof-02', name:'수리 교수', spec:'수학·통계·알고리즘',   icon:'📐', color:'#2196f3' },
  { id:'prof-03', name:'과학 교수', spec:'물리·화학·생물·지구과학', icon:'⚗️', color:'#4caf50' },
  { id:'prof-04', name:'언어 교수', spec:'국어·영어·다국어소통',  icon:'🗣️', color:'#ff9800' },
  { id:'prof-05', name:'예술 교수', spec:'음악·미술·창의표현',    icon:'🎨', color:'#e91e63' },
  { id:'prof-06', name:'체육 교수', spec:'신체발달·스포츠·건강',  icon:'🏃', color:'#f44336' },
  { id:'prof-07', name:'사회 교수', spec:'역사·지리·경제·정치',   icon:'🌍', color:'#795548' },
  { id:'prof-08', name:'기술 교수', spec:'AI·코딩·공학·미래기술', icon:'💻', color:'#00bcd4' },
  { id:'prof-09', name:'감성 교수', spec:'심리·공감·대인관계',    icon:'❤️', color:'#ff5722' },
  { id:'prof-10', name:'진로 교수', spec:'직업예측·사회역할·균형점', icon:'🎯', color:'#3ecf8e' },
];
