# 영어 단어 RPG (English Word RPG) — 구현 계획

## 1. 개요
단어를 맞추면 캐릭터가 성장하는 RPG 형태의 영어 단어 학습 웹앱.
간격 반복(SRS) 알고리즘으로 복습 시점을 자동 관리. API 없이 동작.

## 2. 목표 사용자
- 초·중·고 학생, 영어 학습자

## 3. 핵심 기능
- 단어장 관리 (직접 입력/CSV 가져오기)
- 전투 모드: 단어 맞추기 → 데미지/경험치
- 캐릭터 성장 (레벨, 장비, 스킬)
- SRS 복습 스케줄 (SM-2 알고리즘)
- 퀴즈 유형: 뜻 맞추기, 스펠링, 빈칸, 듣기(TTS)
- 통계 대시보드 (정답률, 연속 학습일)

## 4. 화면 구성
- 홈: 캐릭터/스탯/오늘의 복습 수
- 단어장: 목록, 추가, CSV 가져오기
- 전투: 문제 카드, HP, 애니메이션
- 상점: 장비 구매 (게임 내 코인)
- 통계: 차트

## 5. 기술 스택
- React + Vite + TypeScript
- 상태관리: Zustand + persist
- 애니메이션: Framer Motion
- TTS: Web Speech API
- 차트: Recharts
- 저장: IndexedDB (Dexie)

## 6. 데이터 모델
- Word { id, term, meaning, example, audio? }
- CardState { wordId, ease, interval, due, reps }
- Character { level, xp, hp, equipment, coins }
- BattleLog { date, correct, wrong }

## 7. 구현 단계
1. 세팅
2. 단어장 CRUD + CSV
3. SRS 엔진 (SM-2)
4. 전투 UI & 애니메이션
5. 캐릭터 성장/장비
6. TTS 듣기 모드
7. 통계 대시보드
8. 접근성/반응형

## 8. 비기능 요구사항
- 오프라인, 모바일 터치
- 대량 단어 성능

## 9. 검증
- 단위: SM-2 계산
- E2E: 학습→복습 스케줄 확인
