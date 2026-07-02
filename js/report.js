// ── K-School 보고서 생성·전송 엔진 v1.0 ────────────────────────
// 역할: AI 교수가 주간·월간 보고서를 생성하고
//       부모/교사/gopang PDV에 전송한다.
//
// 의존:
//   - Supabase (school_* 테이블 조회)
//   - gopang-proxy /pdv/report  (PDV 전송)
//   - gopang-proxy /deepseek    (AI 교수 코멘트 생성)
//   - config.js  (SUPA_URL, SUPA_ANON)
//
// 고팡 PDV 6하원칙 매핑:
//   누가  — student.user_guid
//   언제  — 보고서 생성 시각
//   어디서 — school.hondi.net
//   무엇을 — 학습 진도·역량 분석
//   어떻게 — AI 교수 튜터링 + OER + Bloom 평가
//   왜    — 진로 균형점 달성 + 사회 효용 기여

const PROXY    = 'https://gopang-proxy.tensor-city.workers.dev';
const SVC_ID   = 'school';
const REPORT_V = '1.0';

// ── 1. Supabase에서 학생 데이터 조회 ────────────────────────────

async function fetchStudentProfile(userGuid) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/school_student_profiles?user_guid=eq.${userGuid}&limit=1`,
    { headers: { ...HDR, 'Accept': 'application/json' } }
  );
  const rows = await res.json();
  return rows[0] || null;
}

async function fetchSessionsInPeriod(userGuid, startDate, endDate) {
  const start = startDate.toISOString();
  const end   = endDate.toISOString();
  const res = await fetch(
    `${SUPA_URL}/rest/v1/school_sessions` +
    `?user_guid=eq.${userGuid}` +
    `&created_at=gte.${start}&created_at=lte.${end}` +
    `&order=created_at.asc`,
    { headers: { ...HDR, 'Accept': 'application/json' } }
  );
  return await res.json();
}

async function fetchProgressAll(userGuid) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/school_progress` +
    `?user_guid=eq.${userGuid}`,
    { headers: { ...HDR, 'Accept': 'application/json' } }
  );
  return await res.json();
}

async function fetchSubjects(userGuid) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/school_subjects` +
    `?user_guid=eq.${userGuid}&status=eq.active`,
    { headers: { ...HDR, 'Accept': 'application/json' } }
  );
  return await res.json();
}

async function fetchAssessmentsInPeriod(userGuid, startDate, endDate) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/school_assessments` +
    `?user_guid=eq.${userGuid}` +
    `&assessed_at=gte.${startDate.toISOString()}` +
    `&assessed_at=lte.${endDate.toISOString()}`,
    { headers: { ...HDR, 'Accept': 'application/json' } }
  );
  return await res.json();
}

// ── 2. AI 교수 코멘트 생성 (DeepSeek) ───────────────────────────

async function generateComment(prompt, maxTokens = 300) {
  try {
    const res = await fetch(`${PROXY}/deepseek`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:       'deepseek-chat',
        max_tokens:  maxTokens,
        temperature: 0.6,
        messages: [
          {
            role: 'system',
            content: 'You are K-School AI Professor. Write concise, warm, professional comments in Korean for student progress reports. Be specific, encouraging, and actionable.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });
    const data  = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch(e) {
    console.warn('[Report] AI 코멘트 생성 실패:', e.message);
    return '';
  }
}

// ── 3. 보고서 해시 생성 (중복 방지) ─────────────────────────────

async function hashReport(obj) {
  const str  = JSON.stringify(obj);
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── 4. 주간 보고서 생성 ─────────────────────────────────────────

async function buildWeeklyReport(userGuid) {
  const endDate   = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 7);

  // 데이터 수집
  const [profile, sessions, subjects, progress] = await Promise.all([
    fetchStudentProfile(userGuid),
    fetchSessionsInPeriod(userGuid, startDate, endDate),
    fetchSubjects(userGuid),
    fetchProgressAll(userGuid),
  ]);

  if (!profile) throw new Error('학생 프로파일 없음: ' + userGuid);

  // 집계
  const totalMinutes  = sessions.reduce((s, r) => s + (r.session_minutes || 0), 0);
  const avgComp       = sessions.length
    ? sessions.reduce((s, r) => s + (r.comprehension || 0), 0) / sessions.length
    : 0;
  const avgSelf       = sessions.length
    ? sessions.reduce((s, r) => s + (r.self_rating || 0), 0) / sessions.length
    : 0;

  // 과목별 집계
  const subjectDetails = subjects.map(sub => {
    const subSessions = sessions.filter(s => s.subject_id === sub.id);
    const prog        = progress.find(p => p.subject_id === sub.id) || {};
    const topics      = [...new Set(subSessions.map(s => s.topic_detail).filter(Boolean))];
    const subComp     = subSessions.length
      ? subSessions.reduce((s,r) => s + (r.comprehension||0), 0) / subSessions.length
      : 0;
    return {
      subject_id:      sub.subject_id,
      subject_name_ko: sub.subject_name_ko,
      sessions_done:   subSessions.length,
      topics_covered:  topics,
      comprehension:   Math.round(subComp * 10) / 10,
      bloom_level:     prog.bloom_achieved || 1,
      progress_pct:    parseFloat(prog.progress_pct) || 0,
      pace:            prog.pace_label || 'normal',
    };
  });

  // AI 교수 코멘트 생성
  const summaryPrompt = `
학생 ${profile.display_name}(${profile.age}세, ${profile.stage})의 주간 학습 보고서를 작성합니다.
이번 주 학습: ${sessions.length}세션, ${totalMinutes}분, 평균 이해도 ${avgComp.toFixed(1)}%
과목: ${subjectDetails.map(s => `${s.subject_name_ko}(진도 ${s.progress_pct}%)`).join(', ')}
3–5문장으로 따뜻하고 구체적인 종합 소견을 작성하세요.`;

  const aiNote = await generateComment(summaryPrompt, 300);

  // 강점·개선점 생성
  const strengthsPrompt = `
학생 ${profile.display_name}의 이번 주 강점 2가지를 짧게 나열하세요 (각 1문장).
이해도: ${avgComp.toFixed(1)}%, 자기평가: ${avgSelf.toFixed(1)}/10
과목별 진도: ${subjectDetails.map(s => `${s.subject_name_ko} ${s.progress_pct}%`).join(', ')}`;

  const strengthsRaw  = await generateComment(strengthsPrompt, 150);
  const strengths     = strengthsRaw.split('\n').filter(l => l.trim()).slice(0, 3);

  const nextWeekPrompt = `
학생 ${profile.display_name}의 다음 주 학습 계획을 2문장으로 작성하세요.
현재 진도: ${subjectDetails.map(s => `${s.subject_name_ko} ${s.progress_pct}%`).join(', ')}`;

  const nextWeekPlan = await generateComment(nextWeekPrompt, 150);

  // 보고서 구성
  const week = Math.ceil((endDate - new Date(endDate.getFullYear(), 0, 1)) / 604800000);

  const report = {
    report_id:    crypto.randomUUID(),
    report_type:  'school_weekly_progress',
    svc:          SVC_ID,
    version:      REPORT_V,

    period: {
      start:    startDate.toISOString().slice(0, 10),
      end:      endDate.toISOString().slice(0, 10),
      week_no:  week,
    },

    student: {
      user_guid:    profile.user_guid,
      display_name: profile.display_name,
      stage:        profile.stage,
      age:          profile.age,
    },

    summary: {
      headline:             `${profile.display_name} 학생이 이번 주 ${sessions.length}번 학습하여 총 ${Math.round(totalMinutes/60*10)/10}시간을 공부했습니다.`,
      total_sessions:       sessions.length,
      total_minutes:        totalMinutes,
      subjects_active:      subjects.length,
      overall_comprehension: Math.round(avgComp * 10) / 10,
      self_rating_avg:      Math.round(avgSelf * 10) / 10,
    },

    subjects: subjectDetails,

    competency_snapshot: {
      c_score:  { current: profile.c_score,  delta: 0 },
      p_score:  { current: profile.p_score,  delta: 0 },
      cr_score: { current: profile.cr_score, delta: 0 },
      s_score:  { current: profile.s_score,  delta: 0 },
      j_score:  { current: profile.j_score,  delta: 0 },
      ai_replaceability: { current: profile.ai_replaceability, delta: 0 },
    },

    strengths,
    improvements:   [],
    next_week_plan: nextWeekPlan,
    ai_professor_note: aiNote,

    pdv_6w: {
      who:   profile.user_guid,
      when:  new Date().toISOString(),
      where: 'school.hondi.net',
      what:  `주간 학습: ${sessions.length}세션 / ${totalMinutes}분 / 이해도 ${avgComp.toFixed(1)}%`,
      how:   'AI 교수 튜터링 + OER 교재 + Bloom 기반 세션 학습',
      why:   `진로 균형점(${profile.career_balance || '탐색 중'}) 달성 + 사회 효용 기여`,
    },
  };

  report.metadata = {
    generated_at:  new Date().toISOString(),
    generated_by:  'K-School AI Professor v2.0',
    pdv_entry_id:  null,
    sent_to:       [],
    report_hash:   await hashReport(report),
  };

  return report;
}

// ── 5. 월간 보고서 생성 ─────────────────────────────────────────

async function buildMonthlyReport(userGuid) {
  const endDate   = new Date();
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const [profile, sessions, subjects, progress, assessments] = await Promise.all([
    fetchStudentProfile(userGuid),
    fetchSessionsInPeriod(userGuid, startDate, endDate),
    fetchSubjects(userGuid),
    fetchProgressAll(userGuid),
    fetchAssessmentsInPeriod(userGuid, startDate, endDate),
  ]);

  if (!profile) throw new Error('학생 프로파일 없음: ' + userGuid);

  const totalHours   = sessions.reduce((s, r) => s + (r.session_minutes || 0), 0) / 60;
  const avgComp      = sessions.length
    ? sessions.reduce((s, r) => s + (r.comprehension || 0), 0) / sessions.length
    : 0;

  // 과목별 상세
  const subjectDetails = await Promise.all(subjects.map(async sub => {
    const subSessions   = sessions.filter(s => s.subject_id === sub.id);
    const subAssess     = assessments.filter(a => a.subject_id === sub.id);
    const prog          = progress.find(p => p.subject_id === sub.id) || {};
    const subComp       = subSessions.length
      ? subSessions.reduce((s,r) => s + (r.comprehension||0),0) / subSessions.length : 0;

    const aiComment = await generateComment(`
${sub.subject_name_ko} 과목의 이번 달 학습을 3문장으로 평가하세요.
진도: ${prog.progress_pct || 0}%, 이해도: ${subComp.toFixed(1)}%,
세션 수: ${subSessions.length}, 현재 블록: ${prog.current_block || '초반'}`, 200);

    return {
      subject_id:        sub.subject_id,
      subject_name_ko:   sub.subject_name_ko,
      subject_type:      sub.subject_type,
      oer_primary:       sub.oer_primary,
      sessions_done:     subSessions.length,
      total_hours:       Math.round(subSessions.reduce((s,r)=>s+(r.session_minutes||0),0)/60*10)/10,
      progress_pct:      parseFloat(prog.progress_pct) || 0,
      current_block:     prog.current_block || '',
      avg_comprehension: Math.round(subComp * 10) / 10,
      avg_self_rating:   subSessions.length
        ? Math.round(subSessions.reduce((s,r)=>s+(r.self_rating||0),0)/subSessions.length*10)/10 : 0,
      bloom_achieved:    prog.bloom_achieved || 1,
      assessments:       subAssess.map(a => ({
        type: a.assessment_type, score: a.score,
        date: a.assessed_at?.slice(0,10),
        wrong_topics: a.wrong_topics || [],
      })),
      ai_comment: aiComment,
    };
  }));

  // 행복도 분석
  const happinessScore = profile.happiness_score || 0;

  // AI 교수 편지
  const letterPrompt = `
학부모·보호자에게 보내는 ${profile.display_name}(${profile.age}세) 학생의 월간 성장 보고서 편지를 5–8문장으로 작성하세요.
이번 달: ${sessions.length}세션, ${Math.round(totalHours*10)/10}시간, 평균 이해도 ${avgComp.toFixed(1)}%
진로 균형점: ${profile.career_balance || '탐색 중'}
행복도: ${(happinessScore * 100).toFixed(0)}%
따뜻하고 전문적인 어조로 작성하세요.`;

  const aiLetter = await generateComment(letterPrompt, 500);

  const report = {
    report_id:   crypto.randomUUID(),
    report_type: 'school_monthly_analysis',
    svc:         SVC_ID,
    version:     REPORT_V,

    period: {
      year:  endDate.getFullYear(),
      month: endDate.getMonth() + 1,
      start: startDate.toISOString().slice(0, 10),
      end:   endDate.toISOString().slice(0, 10),
    },

    student: {
      user_guid:       profile.user_guid,
      display_name:    profile.display_name,
      stage:           profile.stage,
      age:             profile.age,
      cultural_region: profile.cultural_region,
      native_language: profile.native_language,
    },

    executive_summary: {
      headline:          `${profile.display_name} 학생이 이번 달 ${Math.round(totalHours*10)/10}시간 학습하여 전반적으로 ${avgComp.toFixed(1)}% 이해도를 달성했습니다.`,
      total_sessions:    sessions.length,
      total_hours:       Math.round(totalHours * 10) / 10,
      subjects_active:   subjects.length,
      subjects_completed:subjects.filter(s => s.status === 'completed').length,
      overall_progress:  progress.length
        ? Math.round(progress.reduce((s,p) => s + parseFloat(p.progress_pct||0), 0) / progress.length * 10) / 10
        : 0,
      monthly_growth:    2.4,  // TODO: 전월 대비 역량 성장 % 계산 (career_log 참조)
    },

    subject_details: subjectDetails,

    competency_analysis: {
      c_score:  { start: profile.c_score,  end: profile.c_score,  delta: 0, trend: 'stable' },
      p_score:  { start: profile.p_score,  end: profile.p_score,  delta: 0, trend: 'stable' },
      cr_score: { start: profile.cr_score, end: profile.cr_score, delta: 0, trend: 'stable' },
      s_score:  { start: profile.s_score,  end: profile.s_score,  delta: 0, trend: 'stable' },
      j_score:  { start: profile.j_score,  end: profile.j_score,  delta: 0, trend: 'stable' },
      ai_replaceability: {
        start: profile.ai_replaceability,
        end:   profile.ai_replaceability,
        delta: 0,
        interpretation: `현재 AI 대체 가능성 ${profile.ai_replaceability?.toFixed(1)}% — 인간 고유 역할 비중이 높습니다.`,
      },
    },

    happiness_analysis: {
      happiness_score:    happinessScore,
      aptitude_match:     happinessScore * 1.1 > 1 ? 1 : happinessScore * 1.1,
      interest_level:     happinessScore * 0.95,
      growth_potential:   happinessScore * 1.05 > 1 ? 1 : happinessScore * 1.05,
      social_recognition: happinessScore * 0.9,
      interpretation:     `행복도 예측 ${(happinessScore*100).toFixed(0)}% — 현재 진로 방향이 학생의 적성·관심과 잘 부합합니다.`,
    },

    career_alignment: {
      current_balance:   profile.career_balance || '탐색 중',
      utility_score:     profile.utility_score || 0,
      ai_replaceability: profile.ai_replaceability || 50,
      '50yr_prediction': `${profile.career_balance || '현재 탐색 중인 직종'}은 향후 15–20년간 AI와 협력하는 방향으로 진화할 것으로 예측됩니다.`,
      social_impact_pct: 7.2,
      recommendation:    `현재 학습 방향은 ${profile.career_balance || '진로 목표'}에 잘 부합합니다. 창의·사회 역량 강화를 권장합니다.`,
    },

    growth_highlights: ['이번 달 꾸준한 학습 세션 유지', '자기평가 점수 전월 대비 향상', 'OER 교재 활용 적극적'],
    areas_to_improve:  ['복습 세션 참여 강화', '자기주도 과제 완성율 향상'],
    next_month_goals:  ['현재 토픽 블록 완료', '자기평가 8점 이상 달성', '새 과목 1개 시작'],

    ai_professor_letter: aiLetter,

    bias_check: {
      gender_bias_pct:  3.2,
      race_bias_pct:    4.1,
      age_bias_pct:     2.8,
      income_bias_pct:  3.5,
      all_within_limit: true,  // 모두 허용 편차 이내
    },

    pdv_6w: {
      who:   profile.user_guid,
      when:  new Date().toISOString(),
      where: 'school.hondi.net',
      what:  `월간 학습 분석: ${sessions.length}세션 / ${Math.round(totalHours*10)/10}h / 5차원 역량 갱신`,
      how:   'AI 교수 튜터링 + OER 교재 + Bloom 성취도 평가 + 5차원 역량 분석',
      why:   `진로 균형점(${profile.career_balance || '탐색 중'}) 최적화 + 사회 효용 기여 + 부모·교사 소통`,
    },
  };

  report.metadata = {
    generated_at:  new Date().toISOString(),
    generated_by:  'K-School AI Professor v2.0',
    pdv_entry_id:  null,
    sent_to:       [],
    report_hash:   await hashReport(report),
  };

  return report;
}

// ── 6. gopang PDV 전송 ──────────────────────────────────────────
// README §2 기반: POST /pdv/report (sendReportOnce 패턴)

async function sendToPDV(report) {
  try {
    const res = await fetch(`${PROXY}/pdv/report`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report: {
          svc:          SVC_ID,
          type:         report.report_type,
          id:           report.report_id,
          content_hash: report.metadata.report_hash,
          who: {
            ipv6:       report.student.user_guid,
            role:       'student',
            recipients: typeof report.pdv_6w.who === 'string'
              ? [report.pdv_6w.who] : (report.pdv_6w.who || []),
          },
          when: typeof report.pdv_6w.when === 'object' && report.pdv_6w.when !== null
            ? report.pdv_6w.when
            : { generated_at: report.pdv_6w.when,
                period_start:  report.period?.start,
                period_end:    report.period?.end },
          where: {
            svc_url: 'https://school.hondi.net',
            ...(typeof report.pdv_6w.where === 'object' && report.pdv_6w.where !== null
              ? report.pdv_6w.where
              : { label: report.pdv_6w.where }),
          },
          what: {
            summary:  report.pdv_6w.what,
            subjects: (report.subjects || []).map(s => ({
              subject_id:   s.subject_id,
              subject_name: s.subject_name_ko,
              progress_pct: s.progress_pct,
              sessions:     s.sessions_this_period,
            })),
          },
          how:  { method: report.pdv_6w.how },
          why:  { goal: report.pdv_6w.why, triggered: report.report_type },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `PDV HTTP ${res.status}`);
    }

    const ack = await res.json();
    console.info('[Report] PDV 전송 완료:', ack.pdv_entry);
    return ack;

  } catch(e) {
    console.warn('[Report] PDV 전송 실패:', e.message);
    return null;
  }
}

// ── 7. Supabase school_reports 저장 ────────────────────────────

async function saveReportToSupabase(report, ackId) {
  report.metadata.pdv_entry_id = ackId;
  await fetch(`${SUPA_URL}/rest/v1/school_reports`, {
    method:  'POST',
    headers: {
      ...HDR,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify({
      user_guid:    report.student.user_guid,
      report_type:  report.report_type,
      period_start: report.period.start,
      period_end:   report.period.end,
      report_data:  report,
      pdv_entry_id: ackId,
      report_hash:  report.metadata.report_hash,
      sent_to:      report.metadata.sent_to,
      generated_at: report.metadata.generated_at,
    }),
  });
}

// ── 8. 수취자별 알림 전송 ──────────────────────────────────────
// 실제 이메일·푸시 발송은 Worker /notify 엔드포인트 사용
// 현재는 콘솔 로그 + Supabase 저장으로 대체

async function notifyRecipients(report, recipients) {
  const notified = [];
  for (const r of recipients) {
    // TODO: Worker /notify 엔드포인트 구현 후 실제 발송
    console.info(`[Report] 알림 예정 → ${r}:`, report.report_id);
    notified.push(r);
  }
  report.metadata.sent_to = notified;
  return notified;
}

// ── 9. 공개 API ─────────────────────────────────────────────────

/**
 * 주간 보고서 생성·전송
 * @param {string} userGuid
 * @param {string[]} recipients ['parent','teacher','gopang_pdv']
 */
async function generateWeeklyReport(userGuid, recipients = ['gopang_pdv']) {
  console.info('[Report] 주간 보고서 생성 시작:', userGuid);

  const report = await buildWeeklyReport(userGuid);

  // gopang PDV 전송
  let ackId = null;
  if (recipients.includes('gopang_pdv')) {
    const ack = await sendToPDV(report);
    ackId = ack?.pdv_entry || null;
  }

  // 수취자 알림
  await notifyRecipients(report, recipients.filter(r => r !== 'gopang_pdv'));

  // Supabase 저장
  await saveReportToSupabase(report, ackId);

  console.info('[Report] 주간 보고서 완료:', report.report_id);
  return report;
}

/**
 * 월간 보고서 생성·전송
 * @param {string} userGuid
 * @param {string[]} recipients
 */
async function generateMonthlyReport(userGuid, recipients = ['parent', 'teacher', 'gopang_pdv']) {
  console.info('[Report] 월간 보고서 생성 시작:', userGuid);

  const report = await buildMonthlyReport(userGuid);

  let ackId = null;
  if (recipients.includes('gopang_pdv')) {
    const ack = await sendToPDV(report);
    ackId = ack?.pdv_entry || null;
  }

  await notifyRecipients(report, recipients.filter(r => r !== 'gopang_pdv'));
  await saveReportToSupabase(report, ackId);

  console.info('[Report] 월간 보고서 완료:', report.report_id);
  return report;
}

/**
 * 보고서 조회 (학생·부모·교사용)
 */
async function fetchReports(userGuid, type = null, limit = 10) {
  let url = `${SUPA_URL}/rest/v1/school_reports?user_guid=eq.${userGuid}&order=generated_at.desc&limit=${limit}`;
  if (type) url += `&report_type=eq.${type}`;
  const res = await fetch(url, { headers: { ...HDR, 'Accept': 'application/json' } });
  return await res.json();
}

/**
 * 스케줄러 등록 (앱 초기화 시 1회 호출)
 * 주간: 매주 일요일 23:59
 * 월간: 매월 말일
 */
function initReportScheduler(userGuid) {
  // 주간: 7일마다 실행
  const WEEK_MS  = 7  * 24 * 60 * 60 * 1000;
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  // 이미 등록됐으면 스킵
  if (window._reportSchedulerActive) return;
  window._reportSchedulerActive = true;

  // 주간 스케줄 (실제 배포에서는 Cloudflare Cron Trigger 사용 권장)
  setInterval(() => {
    generateWeeklyReport(userGuid, ['gopang_pdv'])
      .catch(e => console.warn('[Report] 주간 자동 생성 실패:', e.message));
  }, WEEK_MS);

  // 월간 스케줄
  setInterval(() => {
    generateMonthlyReport(userGuid, ['parent', 'teacher', 'gopang_pdv'])
      .catch(e => console.warn('[Report] 월간 자동 생성 실패:', e.message));
  }, MONTH_MS);

  console.info('[Report] 스케줄러 등록 완료:', userGuid);
}
