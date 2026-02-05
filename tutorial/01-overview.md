# Chapter 1: .claude/ 디렉토리 개요

## .claude/ 란?

`.claude/` 디렉토리는 Claude Code의 **프로젝트별 설정 디렉토리**다.
이 디렉토리에 설정, 명령어, 스킬, 에이전트, 훅을 정의하면 Claude Code가 프로젝트 맥락에 맞게 동작한다.

핵심 아이디어: **Claude Code의 행동을 코드로 정의한다.**

## 디렉토리 구조

```
.claude/
├── settings.json          # 공유 설정 (hooks, statusLine)
├── settings.local.json    # 로컬 전용 설정 (gitignore됨)
├── .gitignore             # 로컬 설정 파일 제외
├── commands/              # 슬래시 명령어 (/commit, /push 등)
├── skills/                # 스킬 정의 (재사용 가능한 규칙/방법론)
├── agents/                # AI 에이전트 정의 (Task 도구로 실행)
└── hooks/                 # 이벤트 기반 스크립트 (Node.js)
```

### 각 디렉토리의 역할

| 디렉토리 | 역할 | 파일 형식 | 호출 방식 |
|----------|------|-----------|-----------|
| `commands/` | 사용자가 실행하는 명령 | Markdown | `/명령어` |
| `skills/` | Claude가 자동 적용하는 규칙 | Markdown (YAML frontmatter) | 자동 또는 에이전트가 참조 |
| `agents/` | 독립 실행되는 AI 서브프로세스 | Markdown (YAML frontmatter) | Task 도구로 spawn |
| `hooks/` | 이벤트 트리거 스크립트 | JavaScript (Node.js) | settings.json에서 등록 |

## Submodule로 여러 프로젝트에서 공유

`.claude/` 디렉토리를 **Git submodule**로 관리하면 여러 프로젝트에서 동일한 설정을 공유할 수 있다.

```bash
# 새 프로젝트에 추가
git submodule add git@github.com:user/Claude-Config.git .claude

# 기존 프로젝트 클론 시
git clone --recurse-submodules <repo-url>
```

### 공유 vs 로컬

| 파일 | 공유 | 설명 |
|------|------|------|
| `settings.json` | O | hooks, statusLine 등 공유 설정 |
| `settings.local.json` | X | 프로젝트별 권한 (gitignore) |
| `commands/` | O | 모든 프로젝트에서 사용 가능 |
| `skills/` | 일부 | GSD 스킬은 공유, 프로젝트 스킬은 로컬 |

### 설정 변경 시 동기화

```bash
# Project A에서 변경 후 push
cd .claude && git add -A && git commit -m "feat: new command" && git push
cd .. && git add .claude && git commit -m "chore: update .claude submodule"

# Project B에서 pull
cd .claude && git pull origin master
cd .. && git add .claude && git commit -m "chore: update .claude submodule"
```

## 동작 원리

Claude Code는 세션 시작 시 `.claude/` 디렉토리를 읽어 다음을 수행한다:

1. **settings.json** 로드 → hooks 실행, statusLine 표시
2. **commands/** 스캔 → `/명령어`로 사용 가능한 명령 등록
3. **skills/** 스캔 → 관련 작업 시 자동 적용할 규칙 인식
4. **agents/** 스캔 → Task 도구에서 spawn 가능한 에이전트 등록

```
세션 시작
  │
  ├─ settings.json 로드
  │   ├─ SessionStart hooks 실행
  │   └─ statusLine 설정
  │
  ├─ commands/ 등록
  │   └─ /commit, /push, /howto ...
  │
  ├─ skills/ 인식
  │   └─ markdown-image-insertion, mdbook-docs-images ...
  │
  └─ agents/ 등록
      └─ gsd-planner, gsd-executor ...
```

## 다음 장

- [Chapter 2: Settings 설정](02-settings.md) - settings.json과 settings.local.json
