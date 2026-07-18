import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

// dashboard.html — window._onGopangAuth(user)의 guid 선택 로직(URL 파라미터
// 우선, 인증된 user.ipv6는 폴백)을 실제 DOM 환경에서 재현한다.
// "로그인은 했지만(user A), URL의 ?guid=만 다른 학생(user B)으로 바꾸면
// user B의 프로필·성적표가 그대로 조회되는가"를 검증한다.

describe('school/dashboard.html — 학생 프로필 IDOR(권한 없는 열람)', () => {
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

  test('BUG CHECK: 로그인한 사용자(userA)가 URL의 ?guid=만 바꾸면, 본인 소유 여부 확인 없이 다른 학생(victim)의 프로필을 그대로 조회한다', async () => {
    // userA로 정상 로그인했다고 가정 — 하지만 URL엔 victim-student-guid가 들어있다.
    await dom.window._onGopangAuth({ ipv6: 'userA-guid', level: 'L0' });
    // _onGopangAuth 자체가 load(guid)를 await 없이 fire-and-forget으로 호출한다
    // (dashboard.html 자체의 패턴) — 그 안의 순차 fetch들이 끝날 시간을 준다.
    await new Promise(r => setTimeout(r, 50));

    const profileReq = fetchedUrls.find(u => u.includes('school_student_profiles'));
    assert.ok(profileReq, 'load()가 프로필을 조회해야 함');
    assert.ok(profileReq.includes('victim-student-guid'),
      'URL 파라미터(victim-student-guid)가 그대로 쓰였다 — userA-guid로 강제되지 않음');
    assert.equal(profileReq.includes('userA-guid'), false,
      '로그인한 본인(userA-guid)의 프로필이 아니라 URL이 지정한 남의 프로필을 조회함');
  });

  test('요청자가 조회 대상 학생 본인인지 검증하는 코드가 dashboard.html 어디에도 없다', () => {
    const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf-8');
    const hasOwnershipCheck = /user\.ipv6\s*===\s*guid|guid\s*===\s*user\.ipv6|requireLevel\(/.test(html);
    assert.equal(hasOwnershipCheck, false,
      'guid와 로그인 사용자를 비교하거나 권한 레벨을 재확인하는 코드가 전혀 없음을 확인');
  });
});
