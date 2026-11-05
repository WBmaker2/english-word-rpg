# 다음 구현 단계 계획 (2026-11-05)

## 목표
테스트 기반, 스킬 시스템, PWA/오프라인, 성능/접근성, 콘텐츠/UX 고도화.

## 단계
1. 테스트 인프라
   - Vitest + jsdom + fake-indexeddb 설치
   - SM-2 단위 테스트, words CRUD/복습 스케줄 테스트
2. 스킬 시스템
   - 스킬 데이터/쿨다운/포인트, 전투 스킬 UI
3. PWA/오프라인
   - vite-plugin-pwa, manifest, SW, 데이터 백업/복원
4. 성능/접근성
   - Dexie due 인덱스, 목록 가상화/페이지네이션, 키보드/ARIA
5. 콘텐츠/UX
   - TTS 설정, 학습 리마인더, 가져오기/내보내기

## 검증
- npm test, npm run build, npm run lint
