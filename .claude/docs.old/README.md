# GSD (Get Shit Done) Documentation

GSD는 Claude Code를 위한 체계적인 프로젝트 관리 워크플로우 시스템입니다.

**Version:** 1.9.13

## 문서 목차

| 문서 | 설명 |
|------|------|
| [구조 개요](./structure.md) | 디렉토리 구조 및 파일 역할 |
| [빠른 시작](./quickstart.md) | 5분 안에 GSD 시작하기 |
| [명령어 레퍼런스](./commands.md) | 전체 슬래시 명령어 목록 |
| [에이전트](./agents.md) | 특수 에이전트 역할 및 동작 |
| [워크플로우](./workflows.md) | 단계별 작업 흐름 가이드 |
| [설정](./configuration.md) | 설정 옵션 및 모델 프로파일 |

## GSD란?

GSD는 "Get Shit Done"의 약자로, 솔로 개발자가 Claude Code와 함께 프로젝트를 체계적으로 진행할 수 있도록 설계된 워크플로우 시스템입니다.

### 핵심 개념

```
프로젝트 → 마일스톤 → 페이즈 → 플랜 → 태스크
```

- **프로젝트(Project)**: 전체 제품/서비스
- **마일스톤(Milestone)**: 릴리스 단위 (v1.0, v2.0 등)
- **페이즈(Phase)**: 마일스톤 내 주요 기능 단위
- **플랜(Plan)**: 페이즈 내 구체적 실행 계획
- **태스크(Task)**: 플랜 내 개별 작업 항목

### 핵심 워크플로우

```
/gsd:new-project → /gsd:plan-phase → /gsd:execute-phase → 반복
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

## 생성되는 파일 구조

```
.planning/
├── PROJECT.md            # 프로젝트 비전 및 요구사항
├── ROADMAP.md            # 페이즈 로드맵
├── REQUIREMENTS.md       # 상세 요구사항
├── STATE.md              # 프로젝트 상태 및 컨텍스트
├── config.json           # 워크플로우 설정
└── phases/               # 페이즈별 계획 및 결과
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   └── 01-01-SUMMARY.md
    └── 02-features/
        └── ...
```

## 업데이트

GSD는 빠르게 발전합니다. 주기적으로 업데이트하세요:

```bash
npx get-shit-done-cc@latest
```

또는:

```
/gsd:update
```

## 도움말

- `/gsd:help` - 명령어 레퍼런스 표시
- `/gsd:progress` - 현재 상태 및 다음 단계 안내
- [Discord 커뮤니티](https://discord.gg/gsd) - `/gsd:join-discord`
