-- ═══════════════════════════════════════════════════════════════
-- K-School Supabase Schema v1.0
-- 배포: gopang Supabase 프로젝트 (ebbecjfrwaswbdybbgiu)
-- 기반: AI 에이전트 기반 7단계 개인-사회 통합 최적화 특허
-- 연관: public.users (guid = user_guid FK)
--
-- 테이블 목록 (6개):
--   1. school_student_profiles  — 학생 프로파일 + 5차원 역량
--   2. school_subjects          — 수강 과목 등록
--   3. school_sessions          — 개별 학습 세션 기록
--   4. school_progress          — 과목별 진도 현황
--   5. school_assessments       — 퀴즈·자기평가 기록
--   6. school_career_log        — 진로 상담·변경 이력
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- 1. school_student_profiles
--    학생 기본 정보 + 5차원 역량 점수 + 균형점
--    주기적 갱신: 매 5세션, 매월 종합 재평가
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_student_profiles (
  id              bigserial       PRIMARY KEY,

  -- 식별
  user_guid       text            NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,
  display_name    text,

  -- 발달 단계 (S1–S7)
  stage           text            NOT NULL CHECK (stage IN ('S1','S2','S3','S4','S5','S6','S7')),
  age             smallint        CHECK (age BETWEEN 0 AND 120),
  gender          text,

  -- 다국어·문화권 (특허 §다국어 지원)
  native_language text            DEFAULT 'ko',   -- 26개 지원 언어 코드
  cultural_region text            CHECK (cultural_region IN (
                                    'western','east_asian','latin','african','middle_eastern','other'
                                  )),

  -- 학습 특성
  personality     text[],         -- ['내향적','분석형'] 등 복수 태그
  interests       text[],         -- ['음악','스포츠','게임'] 등
  learning_style  text            CHECK (learning_style IN ('visual','auditory','kinesthetic','reading')),

  -- 5차원 역량 점수 (특허 §실시예 6, 각 0–100)
  c_score         numeric(5,2)    DEFAULT 50 CHECK (c_score  BETWEEN 0 AND 100), -- 인지
  p_score         numeric(5,2)    DEFAULT 50 CHECK (p_score  BETWEEN 0 AND 100), -- 육체
  cr_score        numeric(5,2)    DEFAULT 50 CHECK (cr_score BETWEEN 0 AND 100), -- 창의
  s_score         numeric(5,2)    DEFAULT 50 CHECK (s_score  BETWEEN 0 AND 100), -- 사회
  j_score         numeric(5,2)    DEFAULT 50 CHECK (j_score  BETWEEN 0 AND 100), -- 전문판단

  -- AI 대체 가능성 지수 (자동 계산)
  -- ai_replaceability = c×0.30 + p×0.25 + cr×0.20 + s×0.15 + j×0.10
  ai_replaceability numeric(5,2)  GENERATED ALWAYS AS (
    c_score * 0.30 + p_score * 0.25 + cr_score * 0.20 +
    s_score * 0.15 + j_score * 0.10
  ) STORED,

  -- 진로 균형점 (특허 §실시예 3·4)
  career_primary  text,           -- 시스템 추천 직종
  career_personal text,           -- 학생 희망 직종
  career_balance  text,           -- 최종 합의 직종 (균형점)
  utility_score   numeric(4,3)    CHECK (utility_score BETWEEN 0 AND 1), -- U_total 0.0–1.0
  happiness_score numeric(4,3)    CHECK (happiness_score BETWEEN 0 AND 1),

  -- 타임스탬프
  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now(),

  UNIQUE (user_guid)
);

-- 자동 updated_at 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_school_student_profiles_updated
  BEFORE UPDATE ON public.school_student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.school_student_profiles IS 'K-School 학생 프로파일 + 5차원 역량 (특허 §실시예 6)';
COMMENT ON COLUMN public.school_student_profiles.ai_replaceability IS 'AI 대체 가능성 지수 (자동 계산): 낮을수록 인간 고유 역할';
COMMENT ON COLUMN public.school_student_profiles.utility_score     IS '개인-사회 통합 효용 U_total = 0.6×U_ind + 0.4×U_soc';


-- ───────────────────────────────────────────────────────────────
-- 2. school_subjects
--    학생이 수강 중인 과목 등록
--    curriculum_v2.json의 subject_id 참조
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_subjects (
  id              bigserial       PRIMARY KEY,

  user_guid       text            NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,

  -- 과목 식별 (curriculum_v2.json)
  subject_id      text            NOT NULL,    -- 예: 'S5-05-05' (Biology S5)
  subject_name_en text            NOT NULL,
  subject_name_ko text,
  stage           text            NOT NULL,
  field_code      text            NOT NULL,    -- ISCED-F 코드 '00'–'10'

  -- 수강 유형 (curriculum_rules.json 기반)
  subject_type    text            NOT NULL
                  CHECK (subject_type IN ('core','HL','SL','major','elective','lab','reskill','optional')),

  -- OER 교재 (선택된 교재)
  oer_primary     text,           -- 예: 'openstax'
  oer_title       text,           -- 예: 'Biology 2e (OpenStax)'
  oer_url         text,

  -- 커리큘럼 계획 (AI 교수 생성)
  total_hours     smallint,       -- 총 학습 시간 (h)
  total_sessions  smallint,       -- 총 세션 수
  sessions_pw     smallint,       -- 주당 세션 수
  session_minutes smallint,       -- 1회 세션 시간 (분)
  duration_months smallint,       -- 예상 학습 기간 (개월)
  topic_blocks    jsonb,          -- [{block:'세포생물학', sessions:20, bloom:[1,2,3]}, ...]

  -- 진행 상태
  status          text            NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','paused','completed','dropped')),
  started_at      timestamptz     DEFAULT now(),
  completed_at    timestamptz,

  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now(),

  UNIQUE (user_guid, subject_id)
);

CREATE TRIGGER trg_school_subjects_updated
  BEFORE UPDATE ON public.school_subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.school_subjects IS 'K-School 수강 과목 등록 (curriculum_v2.json 연동)';
COMMENT ON COLUMN public.school_subjects.topic_blocks IS '토픽 블록 배열: [{block, sessions, bloom}]';


-- ───────────────────────────────────────────────────────────────
-- 3. school_sessions
--    개별 학습 세션 기록
--    세션마다 AI 교수가 INSERT
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_sessions (
  id              bigserial       PRIMARY KEY,

  user_guid       text            NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,
  subject_id      bigint          NOT NULL REFERENCES public.school_subjects(id) ON DELETE CASCADE,

  -- 세션 정보
  session_no      smallint        NOT NULL,    -- 과목 내 순번 (1, 2, 3...)
  topic_block     text,           -- 현재 토픽 블록명
  topic_detail    text,           -- 세션 내 구체적 토픽
  bloom_level     smallint        CHECK (bloom_level BETWEEN 1 AND 6),
  session_type    text            NOT NULL DEFAULT 'learning'
                  CHECK (session_type IN ('learning','review','assessment','supplementary')),

  -- 시간
  session_minutes smallint,       -- 실제 학습 시간 (분)
  started_at      timestamptz     NOT NULL DEFAULT now(),
  ended_at        timestamptz,

  -- 이해도 (AI 교수 판단)
  comprehension   numeric(4,1)    CHECK (comprehension BETWEEN 0 AND 100),
  -- 자기평가 (학생 입력 0–10)
  self_rating     smallint        CHECK (self_rating BETWEEN 0 AND 10),

  -- 세션 요약 (AI 교수 작성)
  summary         text,
  next_session    text,           -- 다음 세션 예고
  notes           text,           -- 특이사항

  -- 보충 세션 필요 여부 (자기평가 < 7 시 true)
  needs_supplement boolean        DEFAULT false,

  -- GWP 호출 여부 (고팡 앱에서 호출된 세션)
  from_gwp        boolean         DEFAULT false,
  gwp_context     text,           -- 고팡에서 전달된 ctx

  created_at      timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_school_sessions_user     ON public.school_sessions (user_guid);
CREATE INDEX idx_school_sessions_subject  ON public.school_sessions (subject_id);
CREATE INDEX idx_school_sessions_created  ON public.school_sessions (created_at DESC);

COMMENT ON TABLE  public.school_sessions IS 'K-School 개별 세션 기록 — 세션마다 AI 교수가 INSERT';
COMMENT ON COLUMN public.school_sessions.needs_supplement IS '자기평가 < 7 또는 이해도 < 50% 시 true → 보충 세션 생성';


-- ───────────────────────────────────────────────────────────────
-- 4. school_progress
--    과목별 진도 현황 (UPSERT 방식 — 항상 최신 상태 유지)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_progress (
  id                  bigserial   PRIMARY KEY,

  user_guid           text        NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,
  subject_id          bigint      NOT NULL REFERENCES public.school_subjects(id) ON DELETE CASCADE,

  -- 진도
  completed_sessions  smallint    NOT NULL DEFAULT 0,
  total_sessions      smallint    NOT NULL DEFAULT 0,
  progress_pct        numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_sessions = 0 THEN 0
         ELSE LEAST(completed_sessions::numeric / total_sessions * 100, 100)
    END
  ) STORED,

  current_block       text,       -- 현재 토픽 블록
  current_block_no    smallint    DEFAULT 1,

  -- 평균 이해도·자기평가
  avg_comprehension   numeric(4,1),
  avg_self_rating     numeric(3,1),

  -- 학습 시간 누계
  total_minutes       integer     DEFAULT 0,

  -- 성취도 등급 (Bloom 기준)
  bloom_achieved      smallint    CHECK (bloom_achieved BETWEEN 1 AND 6),

  -- 학습 속도 레이블
  pace_label          text        CHECK (pace_label IN ('fast','normal','slow','very_slow')),

  -- 마지막 학습일
  last_session_at     timestamptz,

  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_guid, subject_id)
);

CREATE TRIGGER trg_school_progress_updated
  BEFORE UPDATE ON public.school_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.school_progress IS 'K-School 과목별 진도 현황 (UPSERT)';
COMMENT ON COLUMN public.school_progress.progress_pct IS '진도율 % (자동 계산)';
COMMENT ON COLUMN public.school_progress.pace_label   IS 'fast:이해도 90%+ / normal:70-89% / slow:50-69% / very_slow:50% 미만';


-- ───────────────────────────────────────────────────────────────
-- 5. school_assessments
--    퀴즈·자기평가 기록 (매 5세션 복습 + 임시 평가)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_assessments (
  id              bigserial       PRIMARY KEY,

  user_guid       text            NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,
  subject_id      bigint          NOT NULL REFERENCES public.school_subjects(id) ON DELETE CASCADE,
  session_id      bigint          REFERENCES public.school_sessions(id) ON DELETE SET NULL,

  -- 평가 유형
  assessment_type text            NOT NULL
                  CHECK (assessment_type IN (
                    'quiz_5session',    -- 매 5세션 복습 퀴즈
                    'self_rating',      -- 세션별 자기평가
                    'block_test',       -- 토픽 블록 완료 테스트
                    'mid_term',         -- 중간 평가
                    'final',            -- 최종 평가
                    'bloom_check'       -- Bloom 레벨 달성 확인
                  )),

  -- 퀴즈 문항 (JSON)
  questions       jsonb,
  -- 예시: [
  --   {"q":"세포막의 주요 기능은?", "options":["A","B","C","D"],
  --    "answer":"A", "student_answer":"A", "correct":true, "bloom":2}
  -- ]

  -- 점수
  score           numeric(5,2),   -- 0–100점
  max_score       numeric(5,2)    DEFAULT 100,
  bloom_level     smallint        CHECK (bloom_level BETWEEN 1 AND 6),

  -- 오답 분석 (AI 교수 작성)
  wrong_topics    text[],         -- 틀린 토픽 목록
  feedback        text,           -- AI 교수 피드백
  recommendation  text,           -- 보충 학습 권고

  -- 5차원 역량 변화 기록
  c_delta         numeric(4,2),   -- 이번 평가로 인한 C 점수 변화
  cr_delta        numeric(4,2),
  s_delta         numeric(4,2),
  j_delta         numeric(4,2),

  assessed_at     timestamptz     NOT NULL DEFAULT now(),

  created_at      timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_school_assessments_user    ON public.school_assessments (user_guid);
CREATE INDEX idx_school_assessments_subject ON public.school_assessments (subject_id);

COMMENT ON TABLE  public.school_assessments IS 'K-School 퀴즈·자기평가 기록 (매 5세션 + 블록 완료)';
COMMENT ON COLUMN public.school_assessments.questions  IS '문항 배열: [{q, options, answer, student_answer, correct, bloom}]';
COMMENT ON COLUMN public.school_assessments.wrong_topics IS '오답 토픽 → AI 교수 보충 세션 생성에 활용';


-- ───────────────────────────────────────────────────────────────
-- 6. school_career_log
--    진로 상담·변경 이력 (특허 §실시예 3·4·7단계)
--    모든 진로 관련 대화를 기록 — 7단계 재실행 근거
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_career_log (
  id                  bigserial   PRIMARY KEY,

  user_guid           text        NOT NULL REFERENCES public.users(guid) ON DELETE CASCADE,

  -- 이벤트 유형
  event_type          text        NOT NULL
                      CHECK (event_type IN (
                        'initial_assignment',   -- 최초 균형점 배정
                        'consultation',         -- 진로 상담 세션
                        'change_request',       -- 학생 진로 변경 요청
                        'change_approved',      -- 변경 승인 (사회 효용 5% 이내)
                        'change_conditional',   -- 조건부 승인 (5–10%)
                        'change_rejected',      -- 불허 (10% 초과)
                        'periodic_review',      -- 주기적 재검토 (분기)
                        'ai_update'             -- AI 기술 변화로 인한 자동 갱신 (6단계)
                      )),

  -- 진로 정보
  career_before       text,       -- 변경 전 직종
  career_after        text,       -- 변경 후 직종 (또는 요청 직종)
  career_alternatives text[],     -- 제안된 대안 직종 목록

  -- 균형점 수치 (특허 §실시예 4)
  utility_before      numeric(4,3),
  utility_after       numeric(4,3),
  social_impact_pct   numeric(5,2), -- 사회 효용 저하율 %
  happiness_before    numeric(4,3),
  happiness_after     numeric(4,3),

  -- 5차원 역량 스냅샷 (이 시점의 점수)
  c_score             numeric(5,2),
  p_score             numeric(5,2),
  cr_score            numeric(5,2),
  s_score             numeric(5,2),
  j_score             numeric(5,2),
  ai_replaceability   numeric(5,2),

  -- XAI 설명 (특허 §실시예 6)
  xai_reason          text,       -- 추천/결정 이유 (투명성)
  xai_uncertainty     text,       -- 불확실성 범위 설명

  -- AI 교수 메모
  notes               text,

  -- 커리큘럼 재생성 여부
  curriculum_rebuilt  boolean     DEFAULT false,

  -- 처리 시간 (특허 목표: 평균 2.3분)
  processing_minutes  numeric(5,2),

  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_school_career_user    ON public.school_career_log (user_guid);
CREATE INDEX idx_school_career_created ON public.school_career_log (created_at DESC);

COMMENT ON TABLE  public.school_career_log IS 'K-School 진로 상담·변경 이력 (7단계 재실행 근거)';
COMMENT ON COLUMN public.school_career_log.social_impact_pct IS '사회 효용 저하율: <5%=즉시승인, 5-10%=조건부, >10%=불허';
COMMENT ON COLUMN public.school_career_log.xai_reason        IS 'XAI 원칙: 추천 이유 투명 기록';
COMMENT ON COLUMN public.school_career_log.processing_minutes IS '진로 변경 처리 시간 (특허 목표 2.3분)';


-- ═══════════════════════════════════════════════════════════════
-- RLS (Row Level Security) 정책
-- 학생은 자신의 데이터만 읽기/쓰기 가능
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.school_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_progress         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_assessments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_career_log       ENABLE ROW LEVEL SECURITY;

-- anon 키로 자신의 행만 접근 (user_guid = 요청자 guid)
-- 실제 배포 시 auth.uid() 또는 JWT claim으로 교체 가능
CREATE POLICY school_student_profiles_self ON public.school_student_profiles
  USING (true) WITH CHECK (true);  -- AI 교수(서버)가 anon key로 모든 학생 접근

CREATE POLICY school_subjects_self ON public.school_subjects
  USING (true) WITH CHECK (true);

CREATE POLICY school_sessions_self ON public.school_sessions
  USING (true) WITH CHECK (true);

CREATE POLICY school_progress_self ON public.school_progress
  USING (true) WITH CHECK (true);

CREATE POLICY school_assessments_self ON public.school_assessments
  USING (true) WITH CHECK (true);

CREATE POLICY school_career_log_self ON public.school_career_log
  USING (true) WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════
-- 편의 뷰 — AI 교수가 학생 현황을 한 번에 조회
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.school_student_dashboard AS
SELECT
  sp.user_guid,
  sp.display_name,
  sp.stage,
  sp.age,
  sp.native_language,
  sp.cultural_region,
  sp.c_score, sp.p_score, sp.cr_score, sp.s_score, sp.j_score,
  sp.ai_replaceability,
  sp.career_balance,
  sp.utility_score,
  sp.happiness_score,
  COUNT(DISTINCT sub.id)              AS total_subjects,
  COUNT(DISTINCT CASE WHEN sub.status = 'active' THEN sub.id END) AS active_subjects,
  SUM(prog.completed_sessions)        AS total_sessions_done,
  SUM(prog.total_minutes)             AS total_study_minutes,
  AVG(prog.avg_comprehension)         AS overall_comprehension,
  MAX(sess.created_at)                AS last_study_at
FROM  public.school_student_profiles sp
LEFT  JOIN public.school_subjects sub   ON sub.user_guid = sp.user_guid
LEFT  JOIN public.school_progress prog  ON prog.user_guid = sp.user_guid
                                       AND prog.subject_id = sub.id
LEFT  JOIN public.school_sessions sess  ON sess.user_guid = sp.user_guid
GROUP BY sp.user_guid, sp.display_name, sp.stage, sp.age,
         sp.native_language, sp.cultural_region,
         sp.c_score, sp.p_score, sp.cr_score, sp.s_score, sp.j_score,
         sp.ai_replaceability, sp.career_balance,
         sp.utility_score, sp.happiness_score;

COMMENT ON VIEW public.school_student_dashboard IS 'K-School 학생 현황 종합 뷰 — AI 교수용';
