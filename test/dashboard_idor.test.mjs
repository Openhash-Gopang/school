import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

// dashboard.html — window._onGopangAuth(user)의 guid 선택 로직(URL 파라미터
// 우선, 인증된 user.ipv6는 폴백)을 실제 DOM 환경에서 재현한다.
// "로그인은 했지만(user A), URL의 ?guid=만 다른 학생(user B)으로 바꾸면
// user B의 프로필·성적표가 그대로 조회되는가"를 검증한다.

describe('school/dashboard.html — 학생 프로필 IDOR 수정 확인', () => {
  let dom, fetchedUrls;

  before(() => {
    fetchedUrls = [];
    dom = new JSDOM(`<!doctype html><html><body>
      <div id="s-name"></div><div id="s-avatar"></div><div id="s-sub"></div>
      <div id="s-stage"></div><div id="s-career"></div><div id="career-wish"></div>
      <div id="s-airep"></div><div id="st-airep"></div><div id="s-airep-bar"></div>
    </body></html>`, {
      runScripts: 'outside-only',
      url: 'https://school.hondi.net/dashboard.html?guid=victim-student-guid',
    });

    dom.window.SUPA_URL  = 'https://ebbecjfrwaswbdybbgiu.supabase.co';
    dom.window.SUPA_ANON = 'test-anon-key';
    dom.window.fetch = async (url) => {
      fetchedUrls.push(String(url));
      return { json: async () => ([{ display_name: '피해 학생', stage: 'S4', age: 13 }]) };
    };
    // dashboard.html의 load()는 이 테스트가 검증하려는 범위(guid 선택 로직) 밖의
    // DOM 요소도 여럿 건드린다 — 없는 id는 더미 엘리먼트로 처리해 무관한 실패를 막는다.
    const realGetById = dom.window.document.getElementById.bind(dom.window.document);
    dom.window.document.getElementById = (id) => realGetById(id) || dom.window.document.createElement('div');

    dom.window.set = () => {};
    dom.window.bar = () => {};

    const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf-8');
    const scriptMatch = html.match(/<script>\s*\n\/\/ ── 탭 전환[\s\S]*?<\/script>/);
    if (!scriptMatch) throw new Error('dashboard.html 구조가 바뀌어 인라인 스크립트를 못 찾음 — 테스트 갱신 필요');
    dom.window.eval(scriptMatch[0].replace(/<\/?script>/g, ''));
  });

  after(() => { dom.window.close(); });

  test('취약점 수정 확인: URL의 ?guid=가 다른 학생을 가리켜도, 실제로는 로그인한 본인(userA)의 프로필만 조회된다', async () => {
    // userA로 정상 로그인 — URL엔 여전히 victim-student-guid가 남아있다(공격 시도 재현).
    await dom.window._onGopangAuth({ ipv6: 'userA-guid', level: 'L0' });
    await new Promise(r => setTimeout(r, 50));

    const profileReq = fetchedUrls.find(u => u.includes('school_student_profiles'));
    assert.ok(profileReq, 'load()가 프로필을 조회해야 함');
    assert.ok(profileReq.includes('userA-guid'),
      '로그인한 본인(userA-guid)의 프로필이 조회되어야 함');
    assert.equal(profileReq.includes('victim-student-guid'), false,
      'URL의 ?guid=victim-student-guid는 이제 완전히 무시되어야 함');
  });

  test('URL 파라미터를 아예 참조하는 코드가 남아있지 않다', () => {
    const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf-8');
    assert.equal(/URLSearchParams\(location\.search\)/.test(html), false,
      'guid를 URL에서 읽어오는 경로 자체가 제거되어야 함');
  });
});
