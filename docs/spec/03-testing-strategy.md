# 테스트 전략

계산 로직 테스트와 UI 테스트를 분리한다. 서버 calculator는 DOM 없이 순수 함수로 검증하고, UI는 원본 HTML과 동일한 입력/화면/전환을 검증한다.

## 1. 원본 고정과 fixture

- 6개 HTML을 회귀 기준으로 보존한다.
- 각 HTML의 질문 id·표시 문구·선택지·factor/domain 매핑을 추출한 검증 fixture를 둔다.
- 보호된 가중치/기준값/매핑 fixture는 서버 테스트에서만 import한다.
- HTML 로직의 대표 입력과 기대 결과를 golden fixture로 고정해 리팩토링 전후 동일성을 확인한다.

## 2. 기대수명 calculator

- 남성/여성 각 bracket의 기준값
- 출생연도 허용 경계 1930/2015와 범위 밖 거부
- 연령 bracket 경계 및 정확한 중간값(45/55/65/75는 낮은 bracket)
- 40세 미만과 80세 초과의 끝 bracket 선택
- 일반 Likert의 ±0.4, 10번 weight 1.5의 ±0.6
- 흡연, 음주, 검진의 모든 개별 delta
- 가족력/중증질환/만성질환 k와 세 값 중 최솟값 선택
- 모든 최소 응답, 모든 최대 응답, delta 0 조합
- `base + deltaSum × min(k)` 계산 순서와 소수점 첫째 자리 표시
- 83.7 미만/동일/초과 판정
- 동일 입력의 동일 결과
- preview 부분 계산과 최종 계산의 공통 primitive 일치

## 3. 생애설계 calculator

- 문항마다 만족도/중요도 둘 다 없으면 검증 실패
- 허용값 `0|2|4|6|8|10` 외 값 거부
- 6영역 × 5문항 매핑
- 영역 만족도 합(0~50), 만족도/중요도 평균
- 전체 만족도(0~300)
- gap `importanceAverage - satisfactionAverage`
- gap 상위 2개 및 `> 0.3` 경계(0.3은 제외)
- 우선순위가 0/1/2개인 경우
- strongest 영역 판정
- 우선순위/strongest 동점 시 원본 영역 순서
- 모든 최소, 모든 최대, 중요도와 만족도가 같은 응답
- 막대/중요도 marker/레이더에 전달되는 값

## 4. 여가 부캐 calculator

- 40문항과 factor별 정확히 4문항 매핑
- 1~5 외 값 및 중복/누락 거부
- Part 1/Part 2 factor raw score와 0~100 환산
- raw 4→0, 12→50, 20→100 등 반올림 사례
- Part 1/Part 2 1·2순위
- 동점 시 명시된 factor 순서
- primary value × primary sense의 25개 조합 전부
- 조합별 유형명과 활동 매핑
- 모든 최소/모든 최대 응답에서 결정론적 동점 결과
- 동일 입력의 동일 결과

## 5. API 및 보안

- 진단 타입별 valid payload와 다른 타입 payload 혼합 거부
- 정확한 문항 수, id 집합, 중복, 누락, 범위 검증
- 기대수명 client delta/k/base/result 주입 무시 또는 거부
- client가 계산 결과를 위조해 저장할 수 없음
- rate limit과 오류 status/code
- client build manifest/source map에 서버 전용 기준표, factor 규칙, persona mapping 문자열이 포함되지 않는지 검사
- 저장 정책 채택 후에만 RLS, 토큰 조회, 관리자 범위, 삭제/보존기간 테스트 추가

## 6. UI/E2E

각 진단에 대해 데스크톱과 모바일 viewport에서 다음을 확인한다.

- 랜딩 → 해당 Intro → Quiz → Result
- 직접 URL 접근 시 Intro 표시
- Intro의 원문 카피, 문항 수, 소요 시간, 개인정보 안내
- 이전/다음, 필수 응답, 자동 진행, 진행률, 재시작
- 질문/선택지 문구와 순서
- 결과의 모든 섹션, 인쇄/PDF, 요약 미리보기, 공유 UI
- 세 진단 사이의 고유 색상·레이아웃이 유지되는지

원본 HTML과 동일 viewport·동일 상태의 스크린샷을 비교한다. 허용 diff는 폰트 렌더링처럼 사전에 기록한 항목만 인정하며, 컴포넌트 공통화를 이유로 한 시각 차이는 허용하지 않는다.

## 7. 실행 우선순위

1. 서버 calculator golden/unit test
2. 요청/응답 schema와 보안 경계 test
3. 기대수명 파일럿 Intro/Quiz/Result E2E 및 visual regression
4. 생애설계와 여가 부캐 동일 검증
5. 저장 정책 확정 후 Supabase/RLS/관리자/PDF integration test

도구는 프로젝트 설정에 맞춰 Vitest 또는 Jest 중 하나를 사용하고, E2E/시각 회귀는 Playwright를 사용한다. 계산 테스트는 React Testing Library에 의존하지 않는다.
