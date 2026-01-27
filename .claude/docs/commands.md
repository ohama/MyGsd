# GSD 명령어 레퍼런스

## 범용 명령어

### `/howto`

개발 지식을 기록하고 관리합니다.

| 사용법 | 설명 |
|--------|------|
| `/howto` | 문서 목록 표시 |
| `/howto 키워드` | 문서 검색 |
| `/howto new 제목` | 새 문서 생성 |
| `/howto scan` | 세션 작업 기록 |

**문서 위치:** `docs/howto/`

---

### `/commit`

Git 저장소 초기화, .gitignore 관리, 스마트 커밋을 수행합니다.

| 사용법 | 설명 |
|--------|------|
| `/commit` | 전체 워크플로우 실행 |
| `/commit -m "메시지"` | 메시지 지정하여 커밋 |

**기능:**
- Git 저장소가 없으면 `git init` 실행
- `.gitignore`가 없으면 기본 템플릿 생성
- 새 파일 중 무시할 파일 감지 (.env, 로그, 시크릿 등)
- 변경사항 분석 후 한꺼번에/그룹별 커밋 선택

---

### `/release`

버전 업그레이드, CHANGELOG 작성, 릴리스 커밋을 생성합니다.

| 사용법 | 설명 |
|--------|------|
| `/release patch` | 패치 버전 (0.0.X) |
| `/release minor` | 마이너 버전 (0.X.0) |
| `/release major` | 메이저 버전 (X.0.0) |

---

## GSD 명령어

## 프로젝트 초기화

### `/gsd:new-project`

새 프로젝트를 초기화합니다.

**프로세스:**
1. 프로젝트에 대한 심층 질문
2. 도메인 리서치 (선택, 4개 병렬 에이전트)
3. 요구사항 정의 (v1/v2/범위 외)
4. 로드맵 생성

**생성 파일:**
- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/research/` (선택)
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

---

### `/gsd:map-codebase`

기존 코드베이스를 분석합니다.

**용도:** 브라운필드(기존 코드베이스) 프로젝트에 GSD 적용 전

**생성 파일:**
```
.planning/codebase/
├── STACK.md          # 기술 스택
├── ARCHITECTURE.md   # 아키텍처 패턴
├── STRUCTURE.md      # 디렉토리 구조
├── CONVENTIONS.md    # 코딩 컨벤션
├── TESTING.md        # 테스트 설정
├── INTEGRATIONS.md   # 외부 서비스
└── CONCERNS.md       # 기술 부채
```

---

## 페이즈 계획

### `/gsd:discuss-phase <number>`

페이즈에 대한 비전을 명확히 합니다.

**사용 시점:** 페이즈가 어떻게 동작해야 하는지 아이디어가 있을 때

**생성 파일:** `CONTEXT.md`

```
/gsd:discuss-phase 2
```

---

### `/gsd:research-phase <number>`

페이즈 구현을 위한 기술 리서치를 수행합니다.

**사용 시점:** 3D, 게임, 오디오, ML 등 전문 도메인 작업 시

**생성 파일:** `RESEARCH.md`

```
/gsd:research-phase 3
```

---

### `/gsd:list-phase-assumptions <number>`

Claude가 계획하려는 접근 방식을 미리 확인합니다.

**사용 시점:** 계획 전 방향 확인이 필요할 때

**생성 파일:** 없음 (대화형 출력만)

```
/gsd:list-phase-assumptions 3
```

---

### `/gsd:plan-phase <number> [--gaps]`

페이즈에 대한 상세 실행 계획을 생성합니다.

**생성 파일:** `.planning/phases/XX-name/XX-YY-PLAN.md`

```
/gsd:plan-phase 1
```

**옵션:**
- `--gaps`: 검증에서 발견된 갭만 계획

---

## 실행

### `/gsd:execute-phase <number> [--gaps-only]`

페이즈의 모든 계획을 실행합니다.

**프로세스:**
1. 계획을 웨이브로 그룹화
2. 각 웨이브를 순차 실행 (웨이브 내 병렬)
3. 완료 후 페이즈 목표 검증
4. ROADMAP.md, STATE.md 업데이트

```
/gsd:execute-phase 5
```

**옵션:**
- `--gaps-only`: 갭 클로저 계획만 실행

---

### `/gsd:quick`

빠른 작업을 GSD 보장과 함께 실행합니다.

**특징:**
- 리서처, 체커, 베리파이어 생략
- `.planning/quick/`에 저장
- STATE.md만 업데이트

```
/gsd:quick
```

---

## 로드맵 관리

### `/gsd:add-phase <description>`

마일스톤 끝에 새 페이즈를 추가합니다.

```
/gsd:add-phase "관리자 대시보드 추가"
```

---

### `/gsd:insert-phase <after> <description>`

기존 페이즈 사이에 긴급 작업을 삽입합니다.

**결과:** 소수점 페이즈 생성 (예: 7.1)

```
/gsd:insert-phase 7 "긴급 보안 수정"
```

---

### `/gsd:remove-phase <number>`

미래 페이즈를 제거하고 번호를 재정렬합니다.

**제한:** 미시작 페이즈만 제거 가능

```
/gsd:remove-phase 17
```

---

## 마일스톤 관리

### `/gsd:new-milestone <name>`

새 마일스톤을 시작합니다.

**프로세스:** `/gsd:new-project`와 동일한 흐름

```
/gsd:new-milestone "v2.0 Features"
```

---

### `/gsd:complete-milestone <version>`

완료된 마일스톤을 아카이브합니다.

**동작:**
- MILESTONES.md에 항목 생성
- milestones/ 디렉토리에 상세 아카이브
- Git 태그 생성
- 다음 버전 준비

```
/gsd:complete-milestone 1.0.0
```

---

### `/gsd:audit-milestone [version]`

마일스톤 완성도를 원래 의도와 비교 감사합니다.

**생성 파일:** `MILESTONE-AUDIT.md`

```
/gsd:audit-milestone
```

---

### `/gsd:plan-milestone-gaps`

감사에서 발견된 갭을 해결할 페이즈를 생성합니다.

```
/gsd:plan-milestone-gaps
```

---

## 진행 추적

### `/gsd:progress`

프로젝트 상태를 확인하고 다음 행동을 안내합니다.

**표시 정보:**
- 시각적 진행 바
- 최근 작업 요약
- 현재 위치
- 다음 단계 제안

```
/gsd:progress
```

---

## 세션 관리

### `/gsd:resume-work`

이전 세션에서 작업을 재개합니다.

**동작:**
- STATE.md에서 컨텍스트 로드
- 현재 위치 표시
- 다음 행동 제안

```
/gsd:resume-work
```

---

### `/gsd:pause-work`

작업 중간에 컨텍스트를 저장합니다.

**생성 파일:** `.continue-here`

```
/gsd:pause-work
```

---

## 디버깅

### `/gsd:debug [description]`

체계적인 디버깅 세션을 시작합니다.

**특징:**
- 과학적 방법 (증거 → 가설 → 테스트)
- `/clear` 후에도 상태 유지
- `.planning/debug/`에 세션 저장

```
/gsd:debug "로그인 버튼이 작동하지 않음"
/gsd:debug  # 이전 세션 재개
```

---

## 할 일 관리

### `/gsd:add-todo [description]`

대화에서 할 일을 캡처합니다.

```
/gsd:add-todo                    # 대화에서 추론
/gsd:add-todo 모달 z-index 수정  # 직접 지정
```

---

### `/gsd:check-todos [area]`

대기 중인 할 일을 확인합니다.

```
/gsd:check-todos          # 전체 목록
/gsd:check-todos api      # 영역 필터
```

---

## 검증

### `/gsd:verify-work [phase]`

대화형 UAT(User Acceptance Testing)를 수행합니다.

**프로세스:**
- SUMMARY.md에서 테스트 항목 추출
- 하나씩 예/아니오 테스트
- 실패 시 자동 진단 및 수정 계획

```
/gsd:verify-work 3
```

---

## 설정

### `/gsd:settings`

대화형으로 워크플로우 설정을 변경합니다.

**설정 가능:**
- 에이전트 토글 (리서처, 체커, 베리파이어)
- 모델 프로파일

```
/gsd:settings
```

---

### `/gsd:set-profile <profile>`

모델 프로파일을 빠르게 변경합니다.

**프로파일:**
- `quality` - 모든 곳에 Opus
- `balanced` - 계획에 Opus, 실행에 Sonnet (기본값)
- `budget` - 작성에 Sonnet, 리서치/검증에 Haiku

```
/gsd:set-profile budget
```

---

## 유틸리티

### `/gsd:help`

명령어 레퍼런스를 표시합니다.

---

### `/gsd:update`

GSD를 최신 버전으로 업데이트합니다.

**동작:**
- 버전 비교
- 변경 로그 표시
- 확인 후 설치

```
/gsd:update
```

---

### `/gsd:join-discord`

GSD Discord 커뮤니티에 참여합니다.

```
/gsd:join-discord
```
