# K-School 학습 보고서 양식 v1.0

**발행일:** 2026-05-31  
**생성 주체:** K-School AI 교수  
**전송 대상:** 부모·보호자 / 사람 교사 / 관리자 / gopang PDV  

---

## 1. 주간 학습 보고서 (Weekly Progress Report)

**발행 주기:** 매주 일요일 자동 생성  
**고팡 PDV 유형:** `school_weekly_progress`

---

### 📋 표지

| 항목 | 내용 |
|------|------|
| 보고서 유형 | 주간 학습 진도 보고서 |
| 학생 이름 | {display_name} |
| 학제 단계 | {stage} ({age}세) |
| 보고 기간 | {period.start} ~ {period.end} (제{week_no}주) |
| 생성 일시 | {generated_at} |
| 생성 주체 | K-School AI 교수 v2.0 |

---

### 📊 이번 주 요약

| 항목 | 값 |
|------|-----|
| 총 학습 세션 | {total_sessions}회 |
| 총 학습 시간 | {total_minutes}분 ({total_hours}시간) |
| 활성 과목 수 | {subjects_active}개 |
| 평균 이해도 | {overall_comprehension}% |
| 평균 자기평가 | {self_rating_avg} / 10 |

> **한 줄 요약:** {summary.headline}

---

### 📚 과목별 진도

| 과목 | 세션 수 | 이해도 | 진도율 | 학습 속도 | Bloom |
|------|---------|--------|--------|---------|-------|
| {subject_name_ko} | {sessions_done}회 | {comprehension}% | {progress_pct}% | {pace} | Lv.{bloom_level} |
| … | … | … | … | … | … |

**이번 주 학습 토픽:**

| 과목 | 학습 토픽 |
|------|---------|
| {subject_name_ko} | {topics_covered} |

---

### 🧬 5차원 역량 현황

| 역량 차원 | 현재 점수 | 주간 변화 |
|---------|---------|---------|
| 인지(C) — 데이터처리·패턴인식 | {c_score} | {c_delta:+} |
| 육체(P) — 정밀작업·감각활용 | {p_score} | {p_delta:+} |
| 창의(Cr) — 아이디어생성·혁신 | {cr_score} | {cr_delta:+} |
| 사회(S) — 대인관계·리더십 | {s_score} | {s_delta:+} |
| 전문판단(J) — 윤리·안전결정 | {j_score} | {j_delta:+} |
| **AI 대체 가능성 지수** | **{ai_replaceability}%** | {ai_delta:+} |

> AI 대체 가능성이 낮을수록 인간 고유 역할에 가깝습니다. (목표: 50% 미만)

---

### ⭐ 이번 주 강점

{strengths[0]}  
{strengths[1]}  
{strengths[2]}

---

### 📈 다음 주 학습 계획

{next_week_plan}

---

### 💬 AI 교수 소견

{ai_professor_note}

---

### 📡 gopang PDV 기록 (6하원칙)

| 원칙 | 내용 |
|------|------|
| 누가(Who) | {pdv_6w.who} |
| 언제(When) | {pdv_6w.when} |
| 어디서(Where) | {pdv_6w.where} |
| 무엇을(What) | {pdv_6w.what} |
| 어떻게(How) | {pdv_6w.how} |
| 왜(Why) | {pdv_6w.why} |
| PDV 기록 ID | {pdv_entry_id} |

---

---

## 2. 월간 성장 분석 보고서 (Monthly Growth Analysis)

**발행 주기:** 매월 말일 자동 생성  
**고팡 PDV 유형:** `school_monthly_analysis`

---

### 📋 표지

| 항목 | 내용 |
|------|------|
| 보고서 유형 | 월간 성장 분석 보고서 |
| 학생 이름 | {display_name} |
| 학제 단계 | {stage} ({age}세) |
| 문화권 | {cultural_region} |
| 모국어 | {native_language} |
| 보고 기간 | {period.year}년 {period.month}월 |
| 생성 일시 | {generated_at} |

---

### 📊 이달 핵심 지표

| 항목 | 값 | 비고 |
|------|-----|------|
| 총 학습 세션 | {total_sessions}회 | |
| 총 학습 시간 | {total_hours}시간 | |
| 활성 과목 수 | {subjects_active}개 | |
| 완료 과목 수 | {subjects_completed}개 | |
| 전 과목 평균 진도 | {overall_progress}% | |
| 전월 대비 역량 성장 | +{monthly_growth}% | |

> **한 줄 요약:** {executive_summary.headline}

---

### 📚 과목별 상세 분석

| 과목 | 유형 | 세션 | 시간 | 진도 | 이해도 | Bloom | 현재 블록 |
|------|------|------|------|------|--------|-------|---------|
| {subject_name_ko} | {subject_type} | {sessions_done}회 | {total_hours}h | {progress_pct}% | {avg_comprehension}% | Lv.{bloom_achieved} | {current_block} |

**과목별 평가 기록:**

| 과목 | 평가 유형 | 점수 | 오답 토픽 |
|------|---------|------|---------|
| {subject_name_ko} | {assessment.type} | {assessment.score}점 | {wrong_topics} |

**AI 교수 과목 평가:**  
{subject.ai_comment}

---

### 🧬 5차원 역량 월간 분석

| 역량 차원 | 월초 | 월말 | 변화 | 추세 |
|---------|------|------|------|------|
| 인지(C) | {c_score.start} | {c_score.end} | {c_score.delta:+} | {c_score.trend} |
| 육체(P) | {p_score.start} | {p_score.end} | {p_score.delta:+} | {p_score.trend} |
| 창의(Cr) | {cr_score.start} | {cr_score.end} | {cr_score.delta:+} | {cr_score.trend} |
| 사회(S) | {s_score.start} | {s_score.end} | {s_score.delta:+} | {s_score.trend} |
| 전문판단(J) | {j_score.start} | {j_score.end} | {j_score.delta:+} | {j_score.trend} |
| **AI 대체 가능성** | {ai.start}% | {ai.end}% | {ai.delta:+}% | {ai.trend} |

**역량 해석:** {ai_replaceability.interpretation}

---

### 😊 행복도 분석 (특허 §실시예 3)

```
Happiness_Score = 적성일치도×0.4 + 관심도×0.3 + 성장가능성×0.2 + 사회인정도×0.1
```

| 구성 요소 | 점수 | 가중치 |
|---------|------|--------|
| 적성일치도 | {aptitude_match:.0%} | 40% |
| 관심도 | {interest_level:.0%} | 30% |
| 성장가능성 | {growth_potential:.0%} | 20% |
| 사회인정도 | {social_recognition:.0%} | 10% |
| **행복도 예측 종합** | **{happiness_score:.0%}** | — |

{happiness_analysis.interpretation}

---

### 🎯 진로 균형점 분석

| 항목 | 내용 |
|------|------|
| 현재 진로 균형점 | {career_balance} |
| 개인-사회 통합 효용 | {utility_score} / 1.0 |
| AI 대체 가능성 | {ai_replaceability}% |
| 50년 장기 예측 | {50yr_prediction} |
| 사회 효용 기여도 | 상위 {social_impact_pct}% |

**AI 교수 진로 조언:** {career_alignment.recommendation}

---

### 🌟 이달의 성장 포인트

{growth_highlights[0]}  
{growth_highlights[1]}  
{growth_highlights[2]}

---

### 📌 집중 보완 영역

{areas_to_improve[0]}  
{areas_to_improve[1]}

---

### 🗓️ 다음 달 목표

| 번호 | 목표 |
|------|------|
| 1 | {next_month_goals[0]} |
| 2 | {next_month_goals[1]} |
| 3 | {next_month_goals[2]} |

---

### ✉️ AI 교수의 편지 (학부모·보호자께)

{ai_professor_letter}

---

### 🔍 편향 보정 감사 결과

| 속성 | 측정 편향 | 허용 한도 | 통과 여부 |
|------|---------|---------|---------|
| 성별 편향 | {gender_bias_pct}% | 5.5% | ✅ |
| 인종·국적 편향 | {race_bias_pct}% | 9.8% | ✅ |
| 연령 편향 | {age_bias_pct}% | 9.7% | ✅ |
| 소득 편향 | {income_bias_pct}% | 8.7% | ✅ |
| **종합** | — | — | {all_within_limit} |

---

### 📡 gopang PDV 기록 (6하원칙)

| 원칙 | 내용 |
|------|------|
| 누가(Who) | {pdv_6w.who} |
| 언제(When) | {pdv_6w.when} |
| 어디서(Where) | {pdv_6w.where} |
| 무엇을(What) | {pdv_6w.what} |
| 어떻게(How) | {pdv_6w.how} |
| 왜(Why) | {pdv_6w.why} |
| PDV 기록 ID | {pdv_entry_id} |

---

## 3. 소통 메커니즘

### 전송 흐름

```
[매주 일요일 / 매월 말일]
        ↓
  report.js — buildWeeklyReport() / buildMonthlyReport()
        ↓
  Supabase 조회 (school_sessions, school_progress, school_assessments)
        ↓
  DeepSeek API — AI 교수 코멘트 생성
        ↓
  ┌─────────────────────────────────────────────┐
  │  수취자별 전송                               │
  │                                             │
  │  1. gopang PDV                              │
  │     POST /pdv/report                        │
  │     → ACK { pdv_entry_id }                  │
  │     → hondi.net 사용자 PDV에 6하원칙 기록   │
  │                                             │
  │  2. 부모·보호자                              │
  │     POST /notify (email / 고팡 알림)         │
  │                                             │
  │  3. 사람 교사 / 관리자                       │
  │     POST /notify (email / 고팡 알림)         │
  └─────────────────────────────────────────────┘
        ↓
  Supabase school_reports 저장
  (pdv_entry_id 포함, report_hash로 중복 방지)
```

### 확인 메커니즘

| 단계 | 방법 |
|------|------|
| 전송 확인 | gopang-proxy `/pdv/report` ACK 수신 → `pdv_entry_id` 저장 |
| 중복 방지 | `report_hash` (SHA-256) — 동일 해시 재전송 시 Worker가 자동 무시 |
| 재전송 | ACK 미수신 시 3회 자동 재시도 (지수 백오프) |
| 조회 | `GET /svc/verify?svc_id=school` — 서비스 등록 상태 및 PDV 기록 확인 |
| 감사 로그 | `school_reports.pdv_entry_id` 로 gopang PDV와 교차 검증 가능 |

### Worker 엔드포인트 (README §6 기반)

| 메서드 | 경로 | school에서의 용도 |
|--------|------|----------------|
| POST | `/pdv/report` | 주간·월간 보고서 전송 |
| GET | `/svc/verify?svc_id=school` | 서비스 등록 확인 |
| POST | `/deepseek` | AI 교수 코멘트 생성 |
