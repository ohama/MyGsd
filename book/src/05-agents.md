# Chapter 5: Agents (에이전트)

## Agents란?

Agents는 **독립적으로 실행되는 AI 서브프로세스**다.
Claude Code의 `Task` 도구로 spawn되어 특정 역할을 수행한 뒤 결과를 반환한다.

```
Command  → 사용자가 실행하는 대화형 명령
Skill    → Claude가 자동 적용하는 규칙
Agent    → 독립 실행되는 AI 서브프로세스 (spawn/return)
```

### Agent vs Command

| 항목 | Command | Agent |
|------|---------|-------|
| 실행 | 사용자가 `/명령` 입력 | 다른 명령/워크플로우가 Task로 spawn |
| 컨텍스트 | 현재 대화 맥락 유지 | **새로운 컨텍스트**에서 독립 실행 |
| 도구 | 모든 도구 사용 가능 | frontmatter에 정의된 도구만 |
| 결과 | 대화에 직접 출력 | 결과를 호출자에게 반환 |

### Agent vs Hook

| 항목 | Agent | Hook |
|------|-------|------|
| 실행 환경 | AI 모델 (Claude) | Node.js 스크립트 |
| 지능 | AI가 판단하며 실행 | 정해진 로직만 실행 |
| 용도 | 복잡한 분석/생성 작업 | 이벤트 기반 자동화 |

## Agent 파일 구조

`.claude/agents/` 디렉토리에 Markdown 파일로 정의한다.

### 기본 구조

```markdown
---
name: agent-name
description: 에이전트가 하는 일 설명
tools: Read, Write, Edit, Bash, Grep, Glob
color: green
spawned_by:
  - /gsd:plan-phase
  - /gsd:plan-milestone-gaps
skills_integration:
  - superpowers:brainstorming
  - gsd:atomic-git-workflow
---

<skills_reference>
이 에이전트가 사용하는 스킬 참조 설명
</skills_reference>

<role>
에이전트의 역할과 책임 설명
</role>

<execution_flow>
실행 순서와 로직
</execution_flow>
```

### Frontmatter 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | O | 에이전트 식별자 (kebab-case) |
| `description` | O | Task 도구에서 표시될 설명 |
| `tools` | O | 사용 가능한 도구 목록 (쉼표 구분) |
| `color` | 선택 | UI 표시 색상 |
| `spawned_by` | 권장 | 이 에이전트를 spawn하는 명령/워크플로우 |
| `skills_integration` | 선택 | 참조할 스킬 목록 |

### 사용 가능한 도구

| 도구 | 용도 |
|------|------|
| `Read` | 파일 읽기 |
| `Write` | 파일 쓰기 |
| `Edit` | 파일 수정 |
| `Bash` | 명령 실행 |
| `Grep` | 내용 검색 |
| `Glob` | 파일 패턴 검색 |
| `WebFetch` | 웹 페이지 접근 |
| `WebSearch` | 웹 검색 |

## 실전 예시: GSD 에이전트 시스템

GSD 프레임워크는 11개의 전문화된 에이전트로 구성된다.

### 핵심 에이전트 3개

#### 1. gsd-planner (계획 수립)

```yaml
---
name: gsd-planner
description: Creates executable phase plans with task breakdown and dependency analysis
tools: Read, Write, Bash, Glob, Grep, WebFetch
spawned_by:
  - /gsd:plan-phase
skills_integration:
  - superpowers:brainstorming
  - superpowers:writing-plans
---
```

**역할:** Phase를 실행 가능한 Plan으로 분해한다.

```
Phase "사용자 인증 구현"
    ↓ gsd-planner
Plan 1: JWT 토큰 구현 (Wave 1)
Plan 2: 로그인 API 구현 (Wave 1)
Plan 3: 미들웨어 통합 (Wave 2, Plan 1·2에 의존)
```

#### 2. gsd-executor (실행)

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: Read, Write, Edit, Bash, Grep, Glob
spawned_by:
  - /gsd:execute-phase
skills_integration:
  - superpowers:test-driven-development
  - gsd:atomic-git-workflow
  - gsd:deviation-classifier
---
```

**역할:** Plan의 각 task를 실행하고 태스크별 커밋을 생성한다.

#### 3. gsd-verifier (검증)

```yaml
---
name: gsd-verifier
description: Validates code against phase goals using goal-backward analysis
tools: Read, Bash, Grep, Glob
spawned_by:
  - verify-phase workflow
skills_integration:
  - gsd:verify-goal-backward
---
```

**역할:** 빌드된 코드가 Phase 목표를 달성했는지 검증한다.

### 전체 에이전트 맵

```
/gsd:new-project
    ├─ gsd-project-researcher (x4, 병렬)
    ├─ gsd-research-synthesizer
    └─ gsd-roadmapper

/gsd:plan-phase
    ├─ gsd-phase-researcher (선택)
    ├─ gsd-planner
    └─ gsd-plan-checker (선택)

/gsd:execute-phase
    └─ gsd-executor (plan별 spawn)

verify-phase workflow
    └─ gsd-verifier

/gsd:map-codebase
    └─ gsd-codebase-mapper (병렬)

/gsd:audit-milestone
    └─ gsd-integration-checker

/gsd:debug
    └─ gsd-debugger
```

## Agent 작성 가이드

### 1. role을 구체적으로 정의한다

```markdown
<role>
You are a GSD plan executor.
Your job: Execute the plan completely, commit each task,
create SUMMARY.md, update STATE.md.
</role>
```

에이전트는 **새로운 컨텍스트**에서 실행되므로, 역할과 책임을 명확히 써야 한다.

### 2. tools는 최소한으로 제한한다

```yaml
# 검증 에이전트 - 읽기 전용
tools: Read, Bash, Grep, Glob

# 실행 에이전트 - 쓰기 포함
tools: Read, Write, Edit, Bash, Grep, Glob
```

불필요한 도구를 제거하면 에이전트가 역할을 벗어나지 않는다.

### 3. skills_integration으로 방법론을 주입한다

```yaml
skills_integration:
  - superpowers:test-driven-development   # TDD 방법론
  - gsd:atomic-git-workflow               # 태스크별 커밋
```

에이전트가 어떤 **방식으로** 작업해야 하는지를 스킬로 정의한다.

### 4. execution_flow로 실행 순서를 명시한다

```markdown
<execution_flow>

<step name="load_state" priority="first">
1. STATE.md 읽기
2. 현재 위치 파악
</step>

<step name="execute_tasks">
1. Plan의 각 task 순서대로 실행
2. task마다 atomic commit
</step>

<step name="create_summary" priority="last">
1. SUMMARY.md 생성
2. STATE.md 업데이트
</step>

</execution_flow>
```

### 5. 에이전트 간 데이터 전달은 파일로

에이전트는 독립 프로세스이므로 **파일**을 통해 데이터를 주고받는다:

```
gsd-planner → PLAN.md → gsd-executor → SUMMARY.md → gsd-verifier
```

## 다음 장

- [Chapter 6: Hooks 훅](06-hooks.md)
