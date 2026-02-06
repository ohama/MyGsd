# EP05: Agents AI 서브프로세스

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 8-10분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | Agent는 독립 실행되는 전문화된 AI 프로세스다 |

---

## 인트로 (30초)

**[화면: 여러 에이전트가 병렬로 작업하는 다이어그램]**

> .claude/ 시리즈 다섯 번째 영상입니다.
> 오늘은 **Agents**를 다룹니다.
>
> Command는 대화 안에서 실행됩니다.
> Agent는 다릅니다. **완전히 새로운 프로세스**로 독립 실행됩니다.
>
> 복잡한 작업을 쪼개서 전문화된 에이전트에게 맡기는 거죠.

---

## 본론 1: Agent란? (1분 30초)

**[화면: Command vs Agent 비교]**

| | Command | Agent |
|--|---------|-------|
| 실행 | 현재 대화에서 | 새 프로세스로 spawn |
| 컨텍스트 | 대화 맥락 유지 | 독립된 컨텍스트 |
| 결과 | 대화에 출력 | 호출자에게 반환 |

> Command를 실행하면 지금 대화에서 바로 동작합니다.
> Agent는 **새로운 프로세스를 띄워서** 독립적으로 작업합니다.

**[화면: spawn 흐름도]**

```
/gsd:plan-phase 실행
    ↓
gsd-planner 에이전트 spawn
    ↓
(독립된 컨텍스트에서 계획 수립)
    ↓
PLAN.md 생성 후 반환
```

> 에이전트가 끝나면 결과를 **파일로** 남깁니다.
> `PLAN.md` 같은 산출물이죠.

### Agent vs Hook

| | Agent | Hook |
|--|-------|------|
| 실행 환경 | AI 모델 | Node.js |
| 지능 | 판단하며 실행 | 정해진 로직만 |
| 속도 | 느림 | 빠름 |
| 비용 | API 토큰 소비 | 무료 |

> Hook은 Node.js 스크립트입니다. 빠르지만 단순한 작업만 가능합니다.
> Agent는 AI가 판단하며 실행합니다. 느리지만 복잡한 작업이 가능합니다.

---

## 본론 2: Agent 파일 구조 (1분 30초)

**[화면: Markdown 파일 예시]**

```markdown
---
name: gsd-planner
description: Phase를 실행 가능한 Plan으로 분해
tools: Read, Write, Bash, Glob, Grep
spawned_by:
  - /gsd:plan-phase
skills_integration:
  - superpowers:brainstorming
---

<role>
당신은 계획 수립 전문가입니다.
Phase 목표를 분석하고, 실행 가능한 태스크로 분해합니다.
</role>

<execution_flow>
## Step 1: 목표 파악
## Step 2: 태스크 분해
## Step 3: 의존성 분석
## Step 4: PLAN.md 생성
</execution_flow>
```

### frontmatter 필드

| 필드 | 역할 |
|------|------|
| `name` | 에이전트 식별자 |
| `description` | Task 도구에 표시될 설명 |
| `tools` | 사용 가능한 도구 |
| `spawned_by` | 이 에이전트를 spawn하는 명령 |
| `skills_integration` | 참조할 스킬 목록 |

> `tools`가 중요합니다.
> 검증용 에이전트는 읽기만 필요하니까 `Read, Grep, Glob`만.
> 실행용 에이전트는 쓰기도 필요하니까 `Read, Write, Edit, Bash`까지.

---

## 본론 3: GSD 에이전트 시스템 (2분)

**[화면: 에이전트 관계도]**

> GSD 프레임워크는 **11개 전문 에이전트**로 구성됩니다.

### 핵심 3종

**[화면: 3개 에이전트 아이콘]**

#### 1. gsd-planner (계획)

```
Phase "사용자 인증 구현"
    ↓ gsd-planner
Task 1: JWT 구현
Task 2: 로그인 API
Task 3: 미들웨어 통합
```

> Phase를 실행 가능한 Task로 쪼갭니다.

#### 2. gsd-executor (실행)

```
Task 1 → 코드 작성 → 테스트 → 커밋
Task 2 → 코드 작성 → 테스트 → 커밋
Task 3 → 코드 작성 → 테스트 → 커밋
```

> 각 Task를 실행하고 **태스크별 커밋**을 생성합니다.

#### 3. gsd-verifier (검증)

```
코드 + Phase 목표
    ↓ gsd-verifier
"목표 달성률 95%"
"누락 항목: 에러 핸들링"
```

> 결과물이 목표를 달성했는지 검증합니다.

### 전체 흐름

**[화면: 애니메이션 흐름도]**

```
/gsd:plan-phase
    ├─ gsd-researcher → RESEARCH.md
    ├─ gsd-planner → PLAN.md
    └─ gsd-plan-checker → 검증

/gsd:execute-phase
    └─ gsd-executor → 코드 + 커밋 + SUMMARY.md

verify-phase
    └─ gsd-verifier → VERIFICATION.md
```

---

## 본론 4: 에이전트 간 데이터 전달 (1분)

**[화면: 파일 기반 통신 다이어그램]**

> 에이전트는 **독립 프로세스**입니다.
> 서로 직접 대화할 수 없어요.
>
> 그래서 **파일**로 데이터를 주고받습니다.

```
gsd-planner → PLAN.md → gsd-executor → SUMMARY.md → gsd-verifier
```

> planner가 PLAN.md를 만들고,
> executor가 그걸 읽어서 실행하고 SUMMARY.md를 만들고,
> verifier가 그걸 읽어서 검증합니다.

### 장점

> 파일로 전달하면 좋은 점이 있습니다.
>
> 1. **중간에 멈춰도** 파일이 남아있음
> 2. **사람이 수정** 가능 (PLAN.md 직접 편집)
> 3. **히스토리 추적** 가능 (git으로 관리)

---

## 본론 5: Agent 작성 팁 (1분 30초)

**[화면: 팁 카드]**

### 1. role을 구체적으로

```markdown
<role>
You are a GSD plan executor.
Your job: Execute the plan completely,
commit each task, create SUMMARY.md.
</role>
```

> 에이전트는 **새 컨텍스트**에서 시작합니다.
> 역할을 아주 구체적으로 써줘야 합니다.

### 2. tools는 최소한으로

```yaml
# 검증 에이전트 - 읽기만
tools: Read, Bash, Grep, Glob

# 실행 에이전트 - 쓰기 포함
tools: Read, Write, Edit, Bash
```

> 필요 없는 도구를 빼면 에이전트가 역할을 벗어나지 않습니다.

### 3. skills_integration으로 방법론 주입

```yaml
skills_integration:
  - superpowers:test-driven-development
  - gsd:atomic-git-workflow
```

> "TDD로 해", "태스크마다 커밋해"
> 이런 **방법론**을 스킬로 주입합니다.

---

## 아웃트로 (30초)

**[화면: 정리]**

> 오늘 배운 내용입니다.
>
> 1. Agent는 독립 프로세스로 spawn
> 2. 전문화된 역할 수행 (계획, 실행, 검증)
> 3. 파일로 데이터 전달
> 4. tools 제한으로 역할 범위 통제
>
> 다음 영상에서는 **Hooks**,
> 이벤트 기반 자동화 스크립트를 알아봅니다.
>
> 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- 에이전트 관계도는 애니메이션으로 하나씩 등장
- spawn 과정은 터미널 녹화
- 파일 기반 통신은 화살표 애니메이션
