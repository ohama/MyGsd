# GSD (Get Shit Done) for Claude Code

Claude Code를 위한 체계적인 프로젝트 관리 워크플로우 시스템.

> **Based on:** [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)
>
> 원본 프로젝트를 Claude Code 환경에 맞게 수정하고, 추가 명령어를 포함했습니다.

## 개요

GSD는 "컨텍스트 로트(context rot)" 문제를 해결합니다 — Claude가 긴 개발 세션 동안 컨텍스트 윈도우를 채우면서 발생하는 품질 저하.

**핵심 워크플로우:**
```
요구사항 정의 → 리서치 → 계획 → 실행 → 검증
```

각 단계에서 새로운 컨텍스트 윈도우를 사용하여 품질을 유지합니다.

## 설치

```bash
npx get-shit-done-cc@latest
```

## 빠른 시작

```bash
# 1. 새 프로젝트 시작
/gsd:new-project

# 2. 첫 번째 페이즈 계획
/gsd:plan-phase 1

# 3. 페이즈 실행
/gsd:execute-phase 1

# 4. 진행 상황 확인
/gsd:progress
```

## 주요 명령어

### GSD 코어

| 명령어 | 설명 |
|--------|------|
| `/gsd:new-project` | 새 프로젝트 초기화 (심층 질문, 리서치, 로드맵) |
| `/gsd:plan-phase <N>` | 페이즈 N 계획 생성 |
| `/gsd:execute-phase <N>` | 페이즈 N 실행 |
| `/gsd:progress` | 현재 상태 및 다음 단계 안내 |
| `/gsd:verify-work <N>` | 수동 검증 테스트 |
| `/gsd:quick` | 빠른 작업 (계획 없이 GSD 보장) |
| `/gsd:debug` | 체계적 디버깅 세션 |

### 추가된 명령어

| 명령어 | 설명 |
|--------|------|
| `/howto` | 개발 지식 기록 및 관리 |
| `/howto scan` | 현재 세션 작업을 문서화 |
| `/howto new <제목>` | 새 howto 문서 생성 |
| `/release <patch\|minor\|major>` | 버전 업그레이드, CHANGELOG, 릴리스 커밋 |
| `/commit` | Git 초기화, .gitignore 관리, 스마트 커밋 |

### Scripts

| 스크립트 | 설명 |
|----------|------|
| `scripts/clean.sh` | 새 프로젝트 시작 전 정리 (메타 파일, .planning/, docs/howto/, Git 태그) |

## 구조

```
.claude/
├── agents/           # AI 에이전트 (11개)
├── commands/         # 슬래시 명령어
│   ├── gsd/          # GSD 명령어 (27개)
│   ├── howto.md      # 개발 지식 기록 ✨
│   └── release.md    # 릴리스 관리 ✨
├── skills/           # 방법론 및 패턴
│   └── gsd/          # GSD 스킬 (11개) ✨
├── hooks/            # Node.js 훅 스크립트
├── get-shit-done/    # GSD 코어 시스템
└── docs/             # 문서
```

✨ = 추가된 항목

## 추가된 기능

### Skills 시스템

에이전트가 공유하는 방법론을 스킬로 정의:

```
.claude/skills/gsd/
├── resolve-model-profile.md     # 모델 프로파일 결정
├── verify-goal-backward.md      # 목표 역추적 검증
├── deviation-classifier.md      # 실행 이탈 분류
├── atomic-git-workflow.md       # 원자적 커밋 패턴
└── ...
```

### Howto 문서

개발 지식을 `docs/howto/`에 기록:

```bash
# 세션 작업 기록
/howto scan

# 문서 목록
/howto

# 검색
/howto 키워드
```

### Release 명령어

```bash
/release patch   # 0.0.X
/release minor   # 0.X.0
/release major   # X.0.0
```

- CHANGELOG.md 자동 생성
- 버전 파일 업데이트 (package.json, VERSION)
- 릴리스 커밋 + 태그 생성

## 문서

- [구조 개요](.claude/docs/structure.md)
- [명령어 레퍼런스](.claude/docs/commands.md)
- [에이전트](.claude/docs/agents.md)
- [스킬](.claude/docs/skills.md)
- [워크플로우](.claude/docs/workflows.md)
- [설정](.claude/docs/configuration.md)

## 원본 프로젝트

이 프로젝트는 [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)을 기반으로 합니다.

**원본의 핵심 기능:**
- 컨텍스트 엔지니어링으로 품질 유지
- XML 프롬프트 포맷팅
- 멀티 에이전트 오케스트레이션
- 태스크별 원자적 Git 커밋
- 마크다운 문서를 통한 세션 간 상태 유지

## 라이선스

원본 프로젝트의 라이선스를 따릅니다.
