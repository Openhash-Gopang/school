#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix.py — school 저장소 전용.

갭: desktop.html에 로드되는 js/app.js의 _sendToAIProfessorRaw()
(학생 대상 AI 교수 챗)가 /deepseek 호출 시 service_id를 안 보낸다.
같은 desktop.html 안의 다른 챗 경로(line ~2251)는 이미 service_id:'kedu'로
2026-07-05에 패치됐는데, 이 함수만 별도 구현이라 빠졌다(실사로 확인).

조치: js/app.js의 /deepseek 호출 body에 service_id: 'kedu' 한 줄 추가.
worker.js의 callDeepSeek()가 이미 이 값을 보고 UNIVERSAL-INTEGRITY/
UNIVERSAL-common을 강제 주입한다(2026-07-05 신설, 별도 서버 변경 불필요).

실행 위치: school 저장소 루트에서 실행. js/app.js가 그 자리에 있어야 한다.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TARGET = ROOT / "js" / "app.js"

OLD = """  const res = await fetch('https://hondi-proxy.tensor-city.workers.dev/deepseek', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:       'deepseek-chat',
      max_tokens:  1024,
      temperature: 0.7,
      messages,
    }),
  });"""

NEW = """  const res = await fetch('https://hondi-proxy.tensor-city.workers.dev/deepseek', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:       'deepseek-chat',
      service_id:  'kedu', // 2026-07-07: worker.js가 UNIVERSAL-INTEGRITY/UNIVERSAL-common 강제 주입
      max_tokens:  1024,
      temperature: 0.7,
      messages,
    }),
  });"""


def main():
    if not TARGET.exists():
        print(f"[FAIL] 대상 파일 없음: {TARGET}")
        sys.exit(1)

    text = TARGET.read_text(encoding="utf-8")

    if NEW in text:
        print("[FAIL] 이미 패치된 것으로 보임(중복 실행 의심) — 변경 없이 종료")
        sys.exit(1)

    if OLD not in text:
        print("[FAIL] 삽입 지점(anchor)을 찾지 못함 — 원본이 변경된 것으로 보임. "
              "수동 확인 필요.")
        sys.exit(1)

    if text.count(OLD) != 1:
        print(f"[FAIL] anchor가 {text.count(OLD)}번 발견됨(1번이어야 함) — 수동 확인 필요.")
        sys.exit(1)

    text = text.replace(OLD, NEW, 1)
    TARGET.write_text(text, encoding="utf-8")

    check = TARGET.read_text(encoding="utf-8")
    if "service_id:  'kedu'" not in check:
        print("[FAIL] 검증 실패 — 파일은 써졌으나 내용이 기대와 다름.")
        sys.exit(1)

    print("[OK] js/app.js — service_id: 'kedu' 추가 완료")
    print("[OK] 검증 통과")


if __name__ == "__main__":
    main()
