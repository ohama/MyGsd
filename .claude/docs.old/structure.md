# GSD 구조 개요

## 디렉토리 구조

```
.claude/
├── settings.json           # Claude Code 설정 (hooks, statusLine)
├── agents/                 # GSD 특수 에이전트 정의
├── commands/gsd/           # 슬래시 명령어 정의
├── get-shit-done/          # GSD 코어 시스템
│   ├── VERSION             # 현재 버전 (1.9.13)
│   ├── templates/          # 문서 템플릿
│   ├── references/         # 참조 문서
│   └── workflows/          # 워크플로우 정의
└── hooks/                  # 훅 스크립트
```

## 상세 구조

### 1. `settings.json`

Claude Code 통합 설정:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/gsd-check-update.js"
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/gsd-statusline.js"
  }
}
```

- **SessionStart hook**: 세션 시작 시 업데이트 확인
- **statusLine**: 상태 표시줄에 GSD 정보 표시

### 2. `agents/` (11개 에이전트)

| 에이전트 | 역할 |
|----------|------|
| `gsd-planner` | 페이즈 계획 수립 |
| `gsd-executor` | 계획 실행 |
| `gsd-debugger` | 체계적 디버깅 |
| `gsd-verifier` | 목표 달성 검증 |
| `gsd-phase-researcher` | 페이즈별 기술 리서치 |
| `gsd-project-researcher` | 프로젝트 도메인 리서치 |
| `gsd-roadmapper` | 로드맵 생성 |
| `gsd-codebase-mapper` | 기존 코드베이스 분석 |
| `gsd-plan-checker` | 계획 품질 검증 |
| `gsd-integration-checker` | 페이즈 간 통합 검사 |
| `gsd-research-synthesizer` | 리서치 결과 종합 |

### 3. `commands/gsd/` (27개 명령어)

#### 프로젝트 초기화
- `new-project.md` - 새 프로젝트 시작
- `map-codebase.md` - 기존 코드베이스 분석

#### 페이즈 관리
- `plan-phase.md` - 페이즈 계획 생성
- `execute-phase.md` - 페이즈 실행
- `research-phase.md` - 페이즈 리서치
- `discuss-phase.md` - 페이즈 논의
- `add-phase.md` - 페이즈 추가
- `insert-phase.md` - 긴급 페이즈 삽입
- `remove-phase.md` - 페이즈 제거

#### 마일스톤 관리
- `new-milestone.md` - 새 마일스톤 시작
- `complete-milestone.md` - 마일스톤 완료
- `audit-milestone.md` - 마일스톤 감사

#### 작업 관리
- `progress.md` - 진행 상황 확인
- `resume-work.md` - 작업 재개
- `pause-work.md` - 작업 일시 중지
- `quick.md` - 빠른 작업 실행
- `verify-work.md` - 작업 검증
- `debug.md` - 디버깅

#### 할 일 관리
- `add-todo.md` - 할 일 추가
- `check-todos.md` - 할 일 확인

#### 설정 및 유틸리티
- `settings.md` - 설정 관리
- `set-profile.md` - 모델 프로파일 변경
- `help.md` - 도움말
- `update.md` - 업데이트
- `join-discord.md` - Discord 참여

### 4. `get-shit-done/templates/`

문서 생성을 위한 템플릿:

```
templates/
├── project.md              # PROJECT.md 템플릿
├── roadmap.md              # ROADMAP.md 템플릿
├── requirements.md         # REQUIREMENTS.md 템플릿
├── milestone.md            # 마일스톤 문서
├── research.md             # 리서치 문서
├── summary.md              # 실행 요약
├── context.md              # 컨텍스트 문서
├── state.md                # STATE.md 템플릿
├── config.json             # 설정 기본값
├── codebase/               # 코드베이스 분석 템플릿
│   ├── stack.md            # 기술 스택
│   ├── architecture.md     # 아키텍처
│   ├── structure.md        # 디렉토리 구조
│   ├── conventions.md      # 코딩 컨벤션
│   ├── testing.md          # 테스트 설정
│   ├── integrations.md     # 외부 통합
│   └── concerns.md         # 기술 부채
└── research-project/       # 프로젝트 리서치
    ├── SUMMARY.md
    ├── STACK.md
    ├── ARCHITECTURE.md
    ├── FEATURES.md
    └── PITFALLS.md
```

### 5. `get-shit-done/references/`

참조 문서:

| 파일 | 내용 |
|------|------|
| `model-profiles.md` | 모델 프로파일 정의 |
| `checkpoints.md` | 체크포인트 처리 |
| `tdd.md` | 테스트 주도 개발 가이드 |
| `verification-patterns.md` | 검증 패턴 |
| `git-integration.md` | Git 통합 |
| `questioning.md` | 질문 가이드라인 |
| `continuation-format.md` | 연속 실행 포맷 |
| `planning-config.md` | 계획 설정 |

### 6. `get-shit-done/workflows/`

워크플로우 정의:

| 파일 | 워크플로우 |
|------|------------|
| `execute-phase.md` | 페이즈 실행 |
| `execute-plan.md` | 개별 플랜 실행 |
| `verify-phase.md` | 페이즈 검증 |
| `verify-work.md` | 작업 검증 |
| `resume-project.md` | 프로젝트 재개 |
| `discovery-phase.md` | 발견 단계 |
| `discuss-phase.md` | 페이즈 논의 |
| `diagnose-issues.md` | 이슈 진단 |
| `map-codebase.md` | 코드베이스 매핑 |
| `complete-milestone.md` | 마일스톤 완료 |
| `transition.md` | 전환 처리 |

### 7. `hooks/`

| 파일 | 역할 |
|------|------|
| `gsd-check-update.js` | 세션 시작 시 업데이트 확인 |
| `gsd-statusline.js` | 상태 표시줄 정보 제공 |

## 런타임 생성 파일 (`.planning/`)

GSD 사용 시 생성되는 프로젝트 파일:

```
.planning/
├── PROJECT.md              # 프로젝트 비전 및 요구사항
├── ROADMAP.md              # 페이즈 로드맵
├── REQUIREMENTS.md         # 상세 요구사항 (REQ-ID)
├── STATE.md                # 현재 상태 및 컨텍스트
├── config.json             # 워크플로우 설정
├── research/               # 도메인 리서치 결과
├── codebase/               # 코드베이스 분석 결과
├── todos/                  # 할 일 관리
│   ├── pending/            # 대기 중
│   └── done/               # 완료
├── debug/                  # 디버그 세션
│   └── resolved/           # 해결된 이슈
├── quick/                  # 빠른 작업
└── phases/                 # 페이즈별 계획 및 결과
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   ├── 01-01-SUMMARY.md
    │   └── 01-VERIFICATION.md
    └── 02-features/
        └── ...
```
