# GSD 스킬 생성

GSD 시스템에 새로운 스킬을 추가하는 방법.

## 상황

- 여러 에이전트가 동일한 패턴을 반복 사용할 때
- 방법론을 표준화하여 일관성을 확보하고 싶을 때
- 중복된 로직을 하나의 참조 문서로 통합할 때

## 방법

### Step 1: 스킬 파일 생성

`.claude/skills/gsd/스킬명.md` 파일 생성:

```markdown
---
name: 스킬-이름
description: 한 줄 설명 (10-80자)
---

## When to Use

이 스킬을 사용해야 하는 상황.

## The Pattern

### Step 1: 첫 번째 단계

구체적인 지침...

### Step 2: 두 번째 단계

구체적인 지침...

## Examples

### Good

좋은 예시...

### Bad

피해야 할 예시...
```

### Step 2: 에이전트에 연결

스킬을 사용할 에이전트의 YAML frontmatter 수정:

```yaml
---
name: gsd-executor
skills_integration:
  - gsd:새-스킬-이름
---
```

### Step 3: 에이전트 본문에서 참조

```markdown
<skills_reference>
이 에이전트는 `gsd:새-스킬-이름` 스킬을 사용합니다.
</skills_reference>
```

## 예시

### Good

```yaml
---
name: deviation-classifier
description: 실행 중 이탈 상황을 분류하고 적절한 대응을 결정하는 규칙
---

## When to Use

gsd-executor가 계획 실행 중 예상과 다른 상황을 만났을 때.

## The Four Rules

### Rule 1: Blocker Detection
...
```

### Bad

```yaml
---
name: helper  # 너무 모호함
description: 도움  # 너무 짧음
---

# 내용 없이 제목만
```

## 체크리스트

- [ ] `.claude/skills/gsd/` 에 파일 생성됨
- [ ] YAML frontmatter에 name, description 있음
- [ ] When to Use 섹션 있음
- [ ] 단계별 패턴 정의됨
- [ ] 관련 에이전트에 skills_integration 추가됨

## 관련 문서

- `.claude/docs/skills.md` - 스킬 시스템 문서
- `.claude/get-shit-done/config/agent-schema.json` - 스키마 정의
