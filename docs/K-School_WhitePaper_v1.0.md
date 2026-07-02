# K-School 백서 (White Paper)
## AI 맞춤형 교육 플랫폼 — 설계 원리, 구성 요소 및 동작 메커니즘

**버전** v1.0 | **발행** 2026년 6월  
**발행처** AI City Inc. | **플랫폼** school.hondi.net  
**레포지토리** github.com/Openhash-Gopang/school  
**라이선스** GPL-3.0  
**분류** 기술 공개 문서 (Public Technical Document)

---

## 목차

1. [개요 및 철학](#1-개요-및-철학)
2. [고팡 생태계에서의 위치](#2-고팡-생태계에서의-위치)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [파일 및 디렉토리 구조](#4-파일-및-디렉토리-구조)
5. [핵심 구성 요소 상세](#5-핵심-구성-요소-상세)
6. [AI 교수 시스템](#6-ai-교수-시스템)
7. [학생 데이터 모델 (Supabase)](#7-학생-데이터-모델-supabase)
8. [보고서 생성 및 PDV 통합](#8-보고서-생성-및-pdv-통합)
9. [GWP 연동 프로토콜](#9-gwp-연동-프로토콜)
10. [인증 및 보안](#10-인증-및-보안)
11. [Cloudflare Worker 인프라](#11-cloudflare-worker-인프라)
12. [AI 대체가능성 지수](#12-ai-대체가능성-지수)
13. [테스트 및 검증 (T2~T7)](#13-테스트-및-검증-t2t7)
14. [확장성 및 로드맵](#14-확장성-및-로드맵)

---

## 1. 개요 및 철학

### 1.1 K-School이란

K-School은 고팡(Gopang) 생태계의 **AI 맞춤형 교육 플랫폼**이다. 기존 학교 교육이 학급 전체를 동일한 속도와 방식으로 가르치는 것과 달리, K-School은 학생 개개인의 나이·성격·관심사·진로 목표에 완전히 맞춤화된 AI 교수를 제공한다.

### 1.2 핵심 명제

> *"세상에서 가장 좋은 개인 교사는 학생을 완벽하게 이해하는 교사다."*

K-School AI 교수는 다음을 실현한다.

| 기존 교육 | K-School AI |
|-----------|------------|
| 학급 단위 동일 진도 | 학생 1인 1교수 맞춤 진도 |
| 교사의 경험 의존 | 세상의 모든 지식 보유 |
| 시험으로 성취 측정 | 실시간 이해도 추적 + 진로 연결 |
| 단방향 강의 | 소크라테스식 대화형 학습 |
| 흥미 단절 | 취향·문화·관심사와 학습 연결 |

### 1.3 교육 철학: 예방적 법학(Preventive Jurisprudence)의 교육 적용

고팡 생태계의 철학적 기반인 PD-TJM 모델은 K-School에 다음과 같이 적용된다.

```
분쟁 → 법원 (사후)
             VS.
지식 → 이해 → 현명한 판단 (사전)

K-School은 "천 번의 재판보다 한 번의 교육"이라는 원칙을 구현한다.
교육받은 시민 → 분쟁 예방 → K-Law 의존도 감소
```

### 1.4 AI 대체가능성 역설

K-School의 독특한 특징 중 하나는 **AI 대체가능성 지수(ai_replaceability)**를 학생에게 투명하게 공개한다는 점이다. AI가 대체하기 어려운 역량을 키우도록 유도하면서, 동시에 AI를 도구로 활용하는 능력을 함께 교육한다.

---

## 2. 고팡 생태계에서의 위치

```
┌─────────────────────────────────────────────────────────┐
│                    고팡 (hondi.net)                     │
│         AI 통합 플랫폼 — 고팡 AI 비서 (GWP Hub)          │
└────────┬──────────┬──────────┬──────────┬───────────────┘
         │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼──────┐
    │K-School│ │K-Market│ │ K-Law  │ │ K-Health │
    │교육·학습│ │시장·거래│ │법률·중재│ │의료·건강  │
    └────┬───┘ └────────┘ └────────┘ └──────────┘
         │
    ┌────▼────────────────────────────────┐
    │          공통 인프라                  │
    │  PDV (Personal Data Vault)          │
    │  OpenHash PHLD 분산 원장             │
    │  Supabase (ebbecjfrwaswbdybbgiu)   │
    │  Cloudflare Worker (gopang-proxy)   │
    │  고팡 SSO (subsystem-auth.js)       │
    └─────────────────────────────────────┘
```

K-School은 K-Law, K-Market, K-Health와 동일한 기반 인프라를 공유하면서도 교육 특화 데이터 스키마와 AI 교수 시스템 프롬프트를 독립적으로 운영한다. 고팡 AI 비서는 GWP 프로토콜을 통해 학습이 필요한 순간 K-School을 자동 호출한다.

---

## 3. 시스템 아키텍처

### 3.1 전체 구조

```
사용자 단말 (모바일/데스크톱)
│
├── school.hondi.net/desktop.html   ← 랜딩 페이지
│   ├── 히어로 섹션 (K-School 소개)
│   ├── 기존 학교 vs K-School 비교표
│   ├── 6대 핵심 특징 카드
│   ├── 동작 흐름도
│   ├── 좌측 사이드바 (school 방식 hover 확장)
│   └── webapp.html 진입 버튼
│
├── school.hondi.net/index.html     ← 리디렉터 (PWA 진입점)
│
└── school.hondi.net/webapp.html    ← AI 교수 채팅 앱 (PWA)
    ├── AI 교수 채팅 인터페이스
    ├── 학생 프로필 관리
    ├── 진도율 대시보드
    ├── 주간/월간 보고서
    ├── PDV 전송 모듈
    └── GWP 수신/발신 처리

외부 서비스
├── gopang-proxy.tensor-city.workers.dev  (Cloudflare Worker)
│   ├── /deepseek         → DeepSeek API 프록시 (스트리밍)
│   ├── /pdv/report       → PDV 6W 기록 전달
│   ├── /geocode          → Kakao 역지오코딩
│   └── /sso              → 고팡 SSO 검증
│
├── ebbecjfrwaswbdybbgiu.supabase.co   (Supabase PostgreSQL)
│   ├── school_student_profiles   (학생 기본 정보)
│   ├── school_subjects           (학습 과목)
│   ├── school_sessions           (학습 세션)
│   ├── school_progress           (진도율)
│   ├── school_assessments        (평가)
│   ├── school_reports            (보고서)
│   ├── school_career_log         (진로 기록)
│   └── school_student_dashboard  (집계 뷰)
│
├── api.deepseek.com (DeepSeek AI)
│   └── deepseek-chat  (주 모델)
│
└── hondi.net/auth/subsystem-auth.js  (고팡 SSO)
```

### 3.2 배포 환경

| 구성 요소 | 플랫폼 | 주소 |
|-----------|--------|------|
| 프론트엔드 | GitHub Pages | school.hondi.net |
| AI 프록시 | Cloudflare Workers | gopang-proxy.tensor-city.workers.dev |
| 데이터베이스 | Supabase (PostgreSQL) | ebbecjfrwaswbdybbgiu.supabase.co |
| AI 추론 | DeepSeek API | api.deepseek.com |
| 인증 | 고팡 SSO | hondi.net/auth/subsystem-auth.js |
| 라이선스 | GPL-3.0 | github.com/Openhash-Gopang/school |

---

## 4. 파일 및 디렉토리 구조

```
school.hondi.net/ (github.com/Openhash-Gopang/school)
│
├── desktop.html          # 랜딩 페이지 (Supabase 디자인 시스템)
├── webapp.html           # AI 교수 채팅 앱 (PWA, 모바일 우선)
├── index.html            # 진입점 리디렉터
├── CNAME                 # school.hondi.net
├── LICENSE               # GPL-3.0
├── .nojekyll             # GitHub Pages Jekyll 비활성화
│
├── css/
│   └── school.css        # 추가 스타일 (webapp 보완)
│
├── js/
│   ├── app.js            # 메인 앱 로직 (AI 교수 채팅)
│   ├── auth.js           # 고팡 SSO 연동
│   ├── report.js         # 보고서 생성 + PDV 전송
│   └── system_prompt.txt # AI 교수 시스템 프롬프트 (20개 섹션)
│
├── data/
│   └── subjects.json     # 과목 데이터 (학습 커리큘럼)
│
└── prompts/
    └── system_prompt.txt # AI 교수 행동 지침 (v2.0)
```

### 4.1 핵심 파일 역할 요약

| 파일 | 역할 | 비고 |
|------|------|------|
| `webapp.html` | AI 교수 채팅 UI + PWA 컨테이너 | 모바일 우선, `100dvh` |
| `js/app.js` | DeepSeek 호출, GWP 처리, 세션 관리 | 메인 로직 |
| `js/auth.js` | 고팡 SSO 연동, `_onGopangAuth` 콜백 | subsystem-auth.js 보조 |
| `js/report.js` | 주간/월간 보고서, PDV 전송, SHA-256 해시 | 핵심 데이터 파이프라인 |
| `prompts/system_prompt.txt` | AI 교수 성격·교수법·취향 연결 규칙 | 20개 섹션 |
| `data/subjects.json` | 과목 목록 및 커리큘럼 정의 | |

---

## 5. 핵심 구성 요소 상세

### 5.1 desktop.html — 랜딩 페이지

Supabase 디자인 시스템 기반의 랜딩 페이지로, K-School의 가치와 작동 방식을 시각적으로 설명한다.

**주요 섹션**

```
히어로 섹션
  - "당신만의 AI 교수" 핵심 메시지
  - 나이·성격·관심사 맞춤화 강조
  - CTA: "지금 시작하기" → webapp.html

비교표 (.compare-section)
  - 기존 학교: 획일적, 수동적, 시험 중심
  - K-School: 맞춤형, 능동적, 성장 중심

6대 핵심 특징 (.feature-card × 6)
  1. 완전 맞춤형 커리큘럼
  2. 소크라테스식 대화 학습
  3. 취향·진로 연결 교육
  4. 실시간 진도 추적 + PDV 기록
  5. AI 대체가능성 지수 투명 공개
  6. GWP 통합 (고팡 AI 비서 연동)

동작 흐름도 (인포그래픽)
  학생 입력 → AI 교수 분석 → 맞춤 강의 → 이해도 확인 → PDV 기록

좌측 사이드바 (school 방식)
  - position: fixed, hover 시 224px 확장
  - 섹션 네비게이션 + webapp 진입
```

### 5.2 webapp.html — AI 교수 채팅 앱

**레이아웃 구조**

```html
<div id="app">  ← height: 100dvh, overflow: hidden

  <div class="top-bar">   ← 고정 상단 바
    고팡 복귀 버튼 | K-School 타이틀 | 설정

  <div class="message-list">  ← 스크롤 영역
    AI 교수 메시지 (bubble-ai)
    학생 메시지 (bubble-user)
    타이핑 인디케이터

  <div class="input-dock">   ← 고정 하단
    텍스트 입력 | 파일 첨부 | 전송
```

**모바일 최적화**

```css
html, body {
  height: 100dvh;           /* iOS Safari 주소창 대응 */
  overflow: hidden;          /* 스크롤 잠금 */
}
:root {
  --safe-top:    env(safe-area-inset-top,    0px);  /* 노치 */
  --safe-bottom: env(safe-area-inset-bottom, 0px);  /* 홈 인디케이터 */
}
.input-dock {
  padding-bottom: var(--safe-bottom);
}
```

---

## 6. AI 교수 시스템

### 6.1 시스템 프롬프트 구조 (v2.0, 20개 섹션)

K-School AI 교수의 행동 지침은 `prompts/system_prompt.txt`에 정의되어 있으며, 20개 섹션으로 구성된다.

```
§ 1  역할 정의          — "당신은 학생 전담 AI 교수입니다"
§ 2  교육 철학          — 소크라테스식 대화, 이해 우선
§ 3  나이별 언어 조정    — 7세~성인 구분, 어휘·문체 자동 조절
§ 4  성격 유형 대응      — MBTI 유사 분류, 내향/외향 접근법 차별화
§ 5  학습 스타일 파악    — 시각형/청각형/읽기형/운동형 구분
§ 6  진도 관리 원칙      — 이해 확인 없이 다음 단계 금지
§ 7  오답 처리 규칙      — 틀려도 격려, 원인 분석 우선
§ 8  질문 유도 기법      — 답을 주기 전 생각 유도
§ 9  메타인지 훈련       — "왜 그렇게 생각했나요?" 반복
§10  수업 흐름 설계      — 도입-전개-정리-확인 4단계
§11  과목 연결 학습      — 수학-과학-역사 교차 연결
§12  취향 연결 규칙      — 학생의 관심사(게임, 음악, 스포츠)를 예시로 활용
§13  진로 연결 지도      — 현재 학습이 미래 진로와 연결되는 시점 명시
§14  AI 대체가능성 교육  — 창의성·공감·리더십 역량의 중요성 안내
§15  문화권별 교수법     — 한국, 동아시아, 서구 학습 문화 차이 반영
§16  보고서 코멘트 기준  — 주간/월간 AI 코멘트 작성 규칙
§17  학부모 소통 원칙    — 보고서의 학부모 가독성 요건
§18  위기 대응 프로토콜  — 학습 거부, 무기력, 정서 위기 감지 시
§19  세션 종료 절차      — 학습 요약, 다음 목표 설정, PDV 저장
§20  개인정보 보호       — 학생 정보 외부 공유 금지
```

### 6.2 AI 교수 대화 흐름

```
학생 입력
    ↓
app.js → sendMessage()
    ↓
시스템 프롬프트 + 학생 프로필 + 이전 대화 이력(최근 20개) 결합
    ↓
gopang-proxy.tensor-city.workers.dev/deepseek
    ├── model: 'deepseek-chat'
    ├── stream: true
    └── max_tokens: 1024
    ↓
SSE 스트리밍 → 실시간 버블 렌더링
    ↓
응답 완료 → school_sessions 기록 → 이해도 평가 → 다음 질문 생성
```

### 6.3 학생 프로필 기반 맞춤화

AI 교수는 세션 시작 시 학생 프로필을 Supabase에서 조회하여 응답을 맞춤화한다.

```javascript
// 학생 프로필 예시
{
  user_guid: "2601:db80:...",
  name: "김지아",
  age: 15,
  grade: "중3",
  learning_style: "visual",       // 시각형
  personality: "INFP",
  interests: ["케이팝", "드라마", "그림"],
  career_goal: "패션 디자이너",
  weak_subjects: ["수학", "물리"],
  strong_subjects: ["미술", "국어"],
  current_stage: "S5",            // 학습 단계
  ai_replaceability: 69.60        // GENERATED ALWAYS AS
}
```

### 6.4 GWP 컨텍스트 자동 전달

고팡 AI 비서에서 K-School이 호출될 때, 학습 컨텍스트가 자동으로 전달된다.

```javascript
// URL 파라미터: ?gwp=1&ctx=수학+이차방정식
const _gwpContext = params.get('ctx');

// app.js 838번 줄 — GWP 컨텍스트 자동 전송
if (_gwpContext && _isGwp) {
  await sendMessage(_gwpContext);  // 학생이 입력 안 해도 자동 시작
}
```

---

## 7. 학생 데이터 모델 (Supabase)

### 7.1 테이블 구조 및 관계

```
school_student_profiles (1)
    ├──< school_subjects          (1:N) 학습 과목
    ├──< school_sessions          (1:N) 학습 세션
    │       └──< school_progress  (1:N) 과목별 진도
    ├──< school_assessments       (1:N) 평가 기록
    ├──< school_reports           (1:N) 보고서
    └──< school_career_log        (1:N) 진로 탐색 기록

school_student_dashboard (VIEW)
    → 집계: 총 학습시간, 평균 진도율, 최근 성취, AI 대체가능성
```

### 7.2 핵심 테이블 스키마

#### school_student_profiles

```sql
CREATE TABLE school_student_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid       UUID NOT NULL UNIQUE,   -- 고팡 사용자 식별자
  name            TEXT NOT NULL,
  age             INTEGER,
  grade           TEXT,                   -- '초3', '중2', '고1', '대학생'
  learning_style  TEXT,                   -- 'visual'|'auditory'|'reading'|'kinesthetic'
  personality     TEXT,                   -- MBTI 또는 자유 기술
  interests       TEXT[],                 -- 배열 ['케이팝', '게임']
  career_goal     TEXT,
  weak_subjects   TEXT[],
  strong_subjects TEXT[],
  current_stage   TEXT NOT NULL DEFAULT 'S1',  -- S1~S10
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### school_subjects

```sql
CREATE TABLE school_subjects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid       UUID REFERENCES school_student_profiles(user_guid),
  subject_id      TEXT NOT NULL,          -- 'math_algebra', 'science_physics'
  subject_name_en TEXT,
  subject_name_ko TEXT,
  topic_block     TEXT,                   -- 대단원: '이차방정식'
  topic_detail    TEXT,                   -- 소단원: '완전제곱식'
  difficulty      INTEGER CHECK (1<=difficulty AND difficulty<=5),
  enrolled_at     TIMESTAMPTZ DEFAULT now()
);
```

#### school_sessions

```sql
CREATE TABLE school_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid       UUID REFERENCES school_student_profiles(user_guid),
  subject_id      TEXT,
  session_type    TEXT CHECK (session_type IN ('learning','review','assessment','career')),
  started_at      TIMESTAMPTZ DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  duration_min    INTEGER,                -- 학습 시간(분)
  messages_count  INTEGER DEFAULT 0,
  comprehension   INTEGER CHECK (1<=comprehension AND comprehension<=10),  -- 이해도
  ai_comment      TEXT,                  -- AI 교수 세션 코멘트
  gwp_context     TEXT                   -- GWP로 전달받은 컨텍스트
);
```

#### school_progress

```sql
CREATE TABLE school_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid       UUID REFERENCES school_student_profiles(user_guid),
  subject_id      TEXT NOT NULL,
  topic_block     TEXT,
  mastery_score   NUMERIC(5,2),           -- 0.00 ~ 100.00
  progress_pct    NUMERIC(5,2)
    GENERATED ALWAYS AS (mastery_score * 0.01 * 100) STORED,  -- 자동 계산
  last_studied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_guid, subject_id, topic_block)
);
```

#### school_assessments

```sql
CREATE TABLE school_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid         UUID REFERENCES school_student_profiles(user_guid),
  subject_id        TEXT,
  assessment_type   TEXT CHECK (assessment_type IN (
                      'quiz_5session','monthly','diagnostic','career_aptitude'
                    )),
  score             NUMERIC(5,2),         -- 0.00 ~ 100.00
  max_score         NUMERIC(5,2) DEFAULT 100,
  ai_replaceability NUMERIC(5,2)
    GENERATED ALWAYS AS (
      CASE
        WHEN score >= 90 THEN 30.0        -- 고득점 = 낮은 대체가능성
        WHEN score >= 70 THEN 50.0
        WHEN score >= 50 THEN 70.0
        ELSE 85.0
      END
    ) STORED,
  assessed_at       TIMESTAMPTZ DEFAULT now()
);
```

#### school_reports

```sql
CREATE TABLE school_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_guid       UUID REFERENCES school_student_profiles(user_guid),
  report_type     TEXT CHECK (report_type IN ('weekly','monthly','semester')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  content         JSONB,                  -- 보고서 전문 JSON
  ai_comment      TEXT,                   -- AI 교수 종합 코멘트
  report_hash     TEXT UNIQUE,            -- SHA-256 (중복 방지)
  pdv_entry_id    TEXT,                   -- PDV 기록 ID
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 7.3 중요한 스키마 규칙

테스트(T5, T6) 과정에서 확인된 중요한 제약 사항들이다.

```
1. GENERATED ALWAYS AS 컬럼 주의
   → progress_pct, ai_replaceability는 INSERT 시 반드시 제외
   → SELECT로만 조회 가능

2. session_type CHECK 제약
   → 'regular' X → 'learning' O (올바른 값)
   → 'quiz' X → 'quiz_5session' O

3. school_subjects.topic 컬럼명
   → 'topic' X → 'topic_block', 'topic_detail' 분리됨

4. school_student_profiles 선행 INSERT 필수
   → school_subjects 등 FK 참조 테이블은 profiles가 먼저 존재해야 함

5. report_hash UNIQUE 제약
   → 동일 내용 중복 전송 방지
   → SHA-256 기반 hashReport() 함수로 생성
```

---

## 8. 보고서 생성 및 PDV 통합

### 8.1 report.js — 보고서 파이프라인

`report.js`는 K-School의 핵심 데이터 파이프라인으로, 학습 세션 데이터를 집계하여 보고서를 생성하고 PDV에 전송한다.

```
학습 세션 누적 (school_sessions)
         ↓
generateWeeklyReport(user_guid) 또는 generateMonthlyReport(user_guid)
         ↓
┌────────────────────────────────────────────────────────┐
│  보고서 생성                                             │
│  1. school_sessions 집계 → 학습 시간, 과목, 이해도 평균  │
│  2. school_progress 조회 → 과목별 진도율                 │
│  3. school_assessments 조회 → 평가 점수 추이             │
│  4. generateComment() → DeepSeek으로 AI 코멘트 생성     │
│  5. buildWeeklyReport() → 6W 요약 문자열 생성            │
│  6. hashReport() → SHA-256 해시 생성                    │
└────────────────────────────────────────────────────────┘
         ↓
school_reports INSERT (Supabase 직접 fetch)
         ↓
PDV 전송 → sendPDVReport(user_guid, report)
         ↓
POST gopang-proxy.tensor-city.workers.dev/pdv/report
  {
    user_guid: "사용자 UUID",
    source: "school",
    report: {           ← 반드시 중첩 객체 형태
      pdv_6w: {
        who:   "김지아 (중3)",
        what:  "수학 이차방정식 학습 완료",
        when:  "2026-06-01 ~ 2026-06-07",
        where: "school.hondi.net",
        why:   "패션 디자이너 진로 연계 수학 강화",
        how:   "AI 교수 대화형 학습 7회 세션"
      },
      summary: { ... },
      pdv_type: "weekly_report"
    }
  }
         ↓
응답: { pdv_entry: "PDV-{guid}-{timestamp}" }
         ↓
school_reports.pdv_entry_id 업데이트
```

### 8.2 PDV 6W 원칙 (6하원칙)

PDV에는 원본 보고서 전문이 아닌 **6하원칙 요약만** 저장된다. 원본은 `school_reports` 테이블에 보관된다.

```
Who   → 학생 이름 + 학년
What  → 학습한 과목, 완료한 단원, 달성한 이해도
When  → 학습 기간 (주간/월간)
Where → school.hondi.net
Why   → 진로 목표와의 연결 이유
How   → 학습 세션 수, AI 교수 방식, 평가 유형
```

### 8.3 sbFetch vs. 직접 fetch 선택 기준

테스트(T6) 과정에서 확인된 중요한 구현 원칙이다.

```javascript
// sbFetch(): Prefer: resolution=merge-duplicates 헤더 포함
// → school_reports UPSERT (중복 시 업데이트)에 사용
// → pdv_log에 직접 사용 시 503 오류 발생 (사용 금지)

// 직접 fetch(): pdv_log 삽입에 사용
// → Prefer: return=minimal 헤더만 사용
// → Worker /pdv/report 엔드포인트 경유

// 올바른 PDV 전송:
fetch(PROXY_BASE + '/pdv/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_guid, source: 'school', report: {...} })
});
```

### 8.4 Worker try-catch 필수 규칙

Cloudflare Worker의 모든 핸들러는 try-catch로 감싸야 한다. 감싸지 않으면 500 오류가 브라우저에서 CORS 오류로 오인된다.

```javascript
// worker.js — 올바른 패턴
async function handlePDVReport(request, corsHeaders) {
  try {
    const body = await request.json();
    // ... 처리 ...
    return new Response(JSON.stringify({ pdv_entry: id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders   // ← catch에도 corsHeaders 필수
    });
  }
}
```

---

## 9. GWP 연동 프로토콜

### 9.1 GWP 등록

K-School은 `gopang_v2/webapp.html`의 `GWP_REGISTRY`에 등록되어 있다.

```javascript
// hondi.net GWP_REGISTRY
const GWP_REGISTRY = {
  school: {
    url: 'https://school.hondi.net/webapp.html?gwp=1&ctx=',
    name: 'K-School',
    keywords: ['공부', '수학', '과학', '영어', '학습', '교육',
               '모르겠', '가르쳐', '설명해', '시험', '숙제']
  },
  // market, klaw, ...
};
```

### 9.2 GWP 호출 우선순위

```javascript
// gopang app.js — GWP 매칭이 aiActive보다 우선 (838번 줄 원리)
async function handleInput(text) {
  const gwpTarget = gwpMatch(text);   // 키워드 매칭

  if (gwpTarget) {                    // GWP 매칭 시 즉시 실행
    await gwpLaunch(gwpTarget, text); // aiActive 여부 무관
    return;                           // 일반 AI 응답 건너뜀
  }

  await callAI(text);                 // GWP 미매칭 시 일반 AI
}
```

### 9.3 K-School GWP 메시지 타입

```javascript
// 고팡 → K-School
{ type: 'GWP_LAUNCH',
  svc: 'school',
  ctx: '수학 이차방정식 근의 공식을 모르겠어' }

// K-School → 고팡 (세션 완료)
{ type: 'GWP_SESSION_COMPLETE',
  svc: 'school',
  pdv_id: 'PDV-...',
  minutes: 25,
  topics: ['이차방정식', '근의공식', '판별식'] }

// K-School → 고팡 (닫기)
{ type: 'GWP_CLOSE', svc: 'school' }
```

### 9.4 인증과 GWP의 관계

```
고팡에서 GWP로 K-School 호출
       ↓
school/webapp.html?gwp=1&ctx=수학
       ↓
subsystem-auth.js → 시나리오 2B (Silent iframe 인증)
       ↓
_onGopangAuth(user) 콜백 → 사용자 정보 확보
       ↓
GWP 컨텍스트 자동 전송 (학생이 입력 없이도 바로 시작)
       ↓
AI 교수: "안녕하세요! 이차방정식 근의 공식에 대해 알고 싶으시군요!"
```

---

## 10. 인증 및 보안

### 10.1 고팡 SSO 연동

K-School은 자체 인증 시스템 없이 고팡 통합 SSO를 사용한다.

```javascript
// auth.js + subsystem-auth.js 연동
window._onGopangAuth = async function(user) {
  // subsystem-auth.js가 인증 완료 시 호출
  // user: { guid, level, exp, via }

  await loadStudentProfile(user.guid);  // Supabase 프로필 조회
  await initSession(user);              // 세션 초기화
  scheduleLocation();                   // GPS 위치 (선택적)
};
```

**인증 시나리오**

| 시나리오 | 메커니즘 | K-School 적용 |
|----------|----------|--------------|
| 2B — Silent iframe | hondi.net 세션 쿠키 자동 검증 | GWP 호출 시 기본 |
| 2A — 세션 캐시 | 로컬스토리지 토큰 (30일) | 재방문 시 |
| D — 게스트 | 인증 없이 샘플 강의만 열람 | 비로그인 사용자 |

### 10.2 학생 데이터 보호

```
원칙 1: PDV 저장 — 원본 보고서는 school_reports (학교 DB)
                    PDV에는 6W 요약만 저장
                    오직 학생 본인만 PDV 열람 가능

원칙 2: AI 교수 대화 비공개
         대화 이력은 로컬 메모리에만 존재
         세션 종료 시 요약 → PDV 저장, 전문은 폐기

원칙 3: 미성년 보호
         §20 시스템 프롬프트에 미성년 학생 정보 보호 명시
         학부모 열람: 보고서의 집계 정보만 공유 가능
```

---

## 11. Cloudflare Worker 인프라

### 11.1 gopang-proxy 엔드포인트

`gopang-proxy`는 K-School을 포함한 모든 고팡 서브 서비스가 공유하는 API 게이트웨이다.

```
gopang-proxy.tensor-city.workers.dev
│
├── POST /deepseek       ← DeepSeek API 키 은닉 프록시 (스트리밍)
├── POST /pdv/report     ← PDV 6W 기록 (school_reports → pdv_log)
├── GET  /geocode        ← Kakao 역지오코딩
└── POST /sso            ← 고팡 SSO 토큰 검증
```

### 11.2 worker.js 공유 모듈 주의사항

`worker.js`는 K-School, K-Market, K-Law 등 **모든 서브 서비스가 공유하는 공개 모듈**이다. 수정 시 전 서비스에 영향을 미치므로 각별한 주의가 필요하다.

```
수정 시 확인 사항:
  1. CORS 헤더 (corsHeaders) — 모든 응답에 포함
  2. try-catch — 모든 핸들러에 필수
  3. 라우팅 — source 필드로 서비스 구분 (school / market / klaw)
  4. 배포 후 즉시 전 서비스 동작 확인
  5. Cloudflare 배포 버전 ≠ GitHub 버전 가능성 주의
```

### 11.3 DeepSeek 스트리밍 처리

```javascript
// app.js — SSE 스트리밍
const res = await fetch(PROXY_BASE + '/deepseek', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [...systemMsg, ...recentHistory],
    stream: true,
    max_tokens: 1024,
  })
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  for (const line of buf.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') break;
    const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
    appendToLastBubble(delta);  // 실시간 글자 단위 렌더링
  }
}
```

---

## 12. AI 대체가능성 지수

### 12.1 개념 정의

`ai_replaceability`는 특정 학생의 현재 역량이 AI로 대체될 가능성을 0~100으로 나타내는 지수다. **낮을수록 좋다.**

```
ai_replaceability = 100 → AI가 완전히 대체 가능한 역량
ai_replaceability =   0 → AI가 대체 불가능한 고유 인간 역량
```

### 12.2 산출 공식

```sql
-- school_assessments.ai_replaceability (GENERATED ALWAYS AS)
CASE
  WHEN score >= 90 THEN 30.0   -- 최고 성취 → 창의·응용력 보유 추정
  WHEN score >= 70 THEN 50.0   -- 평균 이상 → 일부 AI 대체 가능
  WHEN score >= 50 THEN 70.0   -- 평균 이하 → 기계적 암기 수준
  ELSE 85.0                    -- 기초 미달 → 반복 작업 수준
END
```

### 12.3 테스트 데이터 예시

```
학생: 김지아 (stage S5)
평가 점수: 수학 72점, 미술 95점, 국어 88점
weighted ai_replaceability: 69.60

해석:
  수학(72점) → 50.0 (평균적 AI 대체 위험)
  미술(95점) → 30.0 (창의성 영역, 낮은 대체 위험)
  국어(88점) → 30.0 (표현력·공감, 낮은 대체 위험)
  가중 평균: 69.60
```

### 12.4 교육적 활용

```
K-School AI 교수는 학생에게 ai_replaceability를 투명하게 공개하고,
해당 지수를 낮추는 방향으로 학습 목표를 설정한다.

높은 점수 영역(AI 대체 위험 높음):
  → 창의적 적용, 비판적 사고, 학제간 연결 학습으로 전환

낮은 점수 영역(AI 대체 위험 낮음):
  → 강점으로 인정하고 진로와 연결

목표: ai_replaceability < 40 (고유 인간 역량 영역)
```

---

## 13. 테스트 및 검증 (T2~T7)

T2~T7은 K-School 시스템의 공식 통합 테스트 항목으로, 2026년 5~6월에 수행되었다.

### 13.1 테스트 결과 요약

| 테스트 | 항목 | 결과 | 비고 |
|--------|------|------|------|
| **T2** | 랜딩 페이지 | ✅ PASS | 히어로·비교표·특징 카드 정상 |
| **T3** | 모바일 UI | ✅ PASS | 375px, 100dvh, safe-area 정상 |
| **T4** | AI 교수 채팅 | ✅ PASS | DeepSeek 스트리밍 정상 |
| **T5** | Supabase INSERT | ✅ PASS | 스키마 오류 6개 수정 후 통과 |
| **T6** | 보고서 + PDV | ✅ PASS | `pdv_entry: PDV-2601db80test-...` 확인 |
| **T7** | GWP 연동 | ✅ PASS | GWP 키워드 매칭 + postMessage 정상 |

### 13.2 T5 주요 스키마 수정 이력

```
오류 1: session_type = 'regular'
수정  : session_type = 'learning'  (CHECK 제약 준수)

오류 2: assessment_type = 'quiz'
수정  : assessment_type = 'quiz_5session'

오류 3: INSERT INTO school_subjects (..., topic, ...)
수정  : INSERT INTO school_subjects (..., topic_block, topic_detail, ...)

오류 4: INSERT ... progress_pct = 75.0
수정  : progress_pct 컬럼 제외 (GENERATED ALWAYS AS)

오류 5: INSERT ... ai_replaceability = 69.60
수정  : ai_replaceability 컬럼 제외 (GENERATED ALWAYS AS)

오류 6: school_subjects INSERT 전 school_student_profiles 미존재
수정  : profiles 먼저 INSERT (FK 의존성)
```

### 13.3 T6 PDV 전송 디버깅 이력

```
오류 1: sbFetch()로 pdv_log INSERT → 503
원인  : Prefer: resolution=merge-duplicates가 pdv_log에 부적합
수정  : 직접 fetch() + Prefer: return=minimal

오류 2: report.js → flat JSON 전송
원인  : Worker가 { report: {...} } 중첩 객체를 기대
수정  : body: JSON.stringify({ user_guid, source:'school', report:{...} })

오류 3: pdv_6w 필드가 문자열로 전송됨
원인  : buildWeeklyReport()가 when/where/who를 string으로 생성
수정  : JSON.parse()로 객체 변환 후 전송

오류 4: Worker 500 오류가 CORS 오류로 표시
원인  : catch 블록에 corsHeaders 미포함
수정  : catch(e) { return Response(..., { headers: corsHeaders }) }

최종 결과: pdv_entry: "PDV-2601db80test-1780224973587" ✅
```

---

## 14. 확장성 및 로드맵

### 14.1 현재 구현 완료

- [x] `desktop.html` 랜딩 페이지 (비교표, 특징 카드, 동작 흐름도)
- [x] `webapp.html` AI 교수 채팅 (PWA, 모바일 최적화)
- [x] `js/app.js` DeepSeek 스트리밍 + GWP 처리
- [x] `js/report.js` 주간/월간 보고서 + PDV 전송
- [x] `prompts/system_prompt.txt` AI 교수 행동 지침 v2.0 (20개 섹션)
- [x] Supabase 7개 테이블 (`school_*`)
- [x] ai_replaceability GENERATED 컬럼
- [x] GWP 연동 (gopang_v2 GWP_REGISTRY 등록)
- [x] 고팡 SSO (subsystem-auth.js)
- [x] T2~T7 통합 테스트 통과

### 14.2 로드맵

**Phase 2 — 6개월 내**

- [ ] 학부모 포털 (보고서 열람, 진도 모니터링)
- [ ] 수업 자료 생성 (AI 교수 → 맞춤 PDF 문제지)
- [ ] 음성 학습 인터페이스 (Speech-to-Text 통합)
- [ ] 학생 간 협력 학습 (동일 진로 그룹 매칭)
- [ ] K-Law 연동 (학습 분쟁 해결 시뮬레이션)

**Phase 3 — 1년 내**

- [ ] 글로벌 다언어 지원 (영어, 일본어, 중국어 AI 교수)
- [ ] 대학 입시 AI 컨설팅 (수능·SAT·IELTS 맞춤)
- [ ] 기업 임직원 교육 확장
- [ ] OpenHash 학습 이력 불변 인증서 발급
- [ ] K-School SDK 외부 교육기관 공개

### 14.3 K-School의 사회적 가치

```
현재 교육의 문제:
  - 사교육비: 연간 26조 원 (2024, 통계청)
  - 교육 격차: 소득 수준에 따른 교육 질 차이
  - 획일적 교육: 다양한 재능의 발굴 실패

K-School의 목표:
  - AI 교수 1인 → 동등한 교육 기회 제공
  - 사교육비 절감 (AI 교수 = 최고 수준 과외)
  - 취향·진로 연결로 학습 동기 제고
  - ai_replaceability 지수로 미래 직업 준비
```

---

## 부록 A — 주요 오류 코드 및 해결책

| 오류 | 원인 | 해결 |
|------|------|------|
| `503 sbFetch pdv_log` | Prefer: merge-duplicates 충돌 | 직접 fetch() 사용 |
| `CORS error (실제 500)` | catch에 corsHeaders 누락 | 모든 catch에 corsHeaders 추가 |
| `NOT NULL violation stage` | school_subjects stage 미입력 | stage 필드 'S1' 기본값 설정 |
| `CHECK violation session_type` | 'regular' 값 사용 | 'learning'으로 수정 |
| `GENERATED ALWAYS AS` | ai_replaceability INSERT 시도 | INSERT 컬럼 목록에서 제외 |
| `FK violation` | profiles 미존재 상태에서 subjects INSERT | 의존성 순서 준수 |

## 부록 B — 환경 변수 및 설정

| 설정 | 값 | 위치 |
|------|----|------|
| Supabase URL | `https://ebbecjfrwaswbdybbgiu.supabase.co` | app.js |
| Cloudflare Worker | `https://gopang-proxy.tensor-city.workers.dev` | app.js |
| DeepSeek 모델 | `deepseek-chat` | app.js |
| AI 교수 프롬프트 | `prompts/system_prompt.txt` | app.js |
| DEEPSEEK_API_KEY | Worker 환경변수 (비공개) | Cloudflare Dashboard |
| KAKAO_REST_KEY | Worker 환경변수 (비공개) | Cloudflare Dashboard |

## 부록 C — 기술 스택

| 구성 | 기술 |
|------|------|
| 프론트엔드 | Vanilla HTML/CSS/JS, ES Modules |
| AI 모델 | DeepSeek Chat (deepseek-chat) |
| 데이터베이스 | Supabase PostgreSQL (REST API) |
| 서버리스 | Cloudflare Workers (gopang-proxy) |
| CDN/호스팅 | GitHub Pages + Cloudflare |
| 인증 | 고팡 SSO (subsystem-auth.js) |
| PWA | Service Worker (sw.js), manifest.json |
| 해시 | SHA-256 (보고서 중복 방지) |
| 라이선스 | GPL-3.0 |

---

*본 문서는 AI City Inc.의 K-School 플랫폼의 기술 공개 문서입니다.*  
*문의: tensor.city@gmail.com | 제주특별자치도 제주시 한림읍*  
*레포지토리: https://github.com/Openhash-Gopang/school*
