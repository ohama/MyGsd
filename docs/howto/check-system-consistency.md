# 시스템 일관성 검사

.claude/ 시스템의 agents, commands, hooks, skills 간 일관성을 검사하고 수정하는 방법.

## 상황

- 시스템 컴포넌트를 추가/수정한 후
- 참조가 깨졌는지 확인할 때
- 중복이나 모순을 발견했을 때

## 방법

### Step 1: 컴포넌트 목록 확인

```bash
# 에이전트
ls .claude/agents/gsd-*.md

# 명령어
ls .claude/commands/gsd/*.md
ls .claude/commands/*.md

# 스킬
ls .claude/skills/gsd/*.md

# 훅
ls .claude/hooks/*.js
```

### Step 2: 일관성 검사 항목

#### 2-1. 에이전트 spawned_by 검사

모든 에이전트에 `spawned_by` 필드가 있는지 확인:

```bash
grep -L "spawned_by" .claude/agents/gsd-*.md
```

없으면 추가:

```yaml
spawned_by:
  - /gsd:명령어
  - 다른-에이전트
```

#### 2-2. 스킬 참조 검사

에이전트가 참조하는 스킬이 존재하는지:

```bash
# 에이전트에서 참조하는 스킬 목록
grep -h "gsd:" .claude/agents/*.md | grep -oE "gsd:[a-z-]+"

# 실제 스킬 파일
ls .claude/skills/gsd/*.md
```

#### 2-3. 스키마 준수 검사

에이전트 frontmatter가 스키마와 일치하는지:

- `name`: `^gsd-[a-z-]+$` 패턴
- `description`: 10-200자
- `color`: green, yellow, orange, red, blue, purple, cyan 중 하나
- `skills_integration`: `^(gsd|superpowers):[a-z-]+$` 패턴

#### 2-4. 중복 정의 검사

동일한 방법론이 여러 곳에 정의되었는지:

```bash
# 예: deviation 규칙이 여러 곳에 있는지
grep -l "deviation" .claude/agents/*.md .claude/skills/gsd/*.md
```

중복 발견 시 스킬로 통합.

### Step 3: 수정 우선순위

| 우선순위 | 유형 | 예시 |
|----------|------|------|
| Critical | 참조 깨짐 | 없는 스킬 참조 |
| Critical | 역할 혼동 | Hook vs Agent 구분 모호 |
| Warning | 중복 정의 | 같은 로직 여러 곳 |
| Warning | 문서화 누락 | spawned_by 없음 |
| Minor | 포맷 불일치 | 체크박스 스타일 |

### Step 4: 수정 적용

1. Critical → Warning → Minor 순서로 수정
2. 각 우선순위별로 커밋 분리
3. 커밋 메시지: `fix(critical):`, `fix(warning):`, `fix(minor):`

## 예시

### Good

```bash
# 체계적 검사
grep -L "spawned_by" .claude/agents/gsd-*.md
# 결과: 8개 파일 누락

# 일괄 수정 후 커밋
git add .claude/agents/
git commit -m "fix(warning): Add spawned_by to 8 agents"
```

### Bad

```bash
# 한 번에 모든 것 수정
git add -A
git commit -m "fix everything"  # 너무 모호
```

## 체크리스트

- [ ] 모든 에이전트에 spawned_by 있음
- [ ] 모든 스킬 참조가 유효함
- [ ] 중복 정의 없음 (스킬로 통합됨)
- [ ] 스키마 준수 (색상, 패턴)
- [ ] Hook과 Agent 구분 명확

## 관련 문서

- `.claude/get-shit-done/references/hooks-vs-agents.md` - Hook vs Agent 구분
- `.claude/get-shit-done/references/skills-integration.md` - 스킬 통합 가이드
- `.claude/get-shit-done/config/agent-schema.json` - 에이전트 스키마
