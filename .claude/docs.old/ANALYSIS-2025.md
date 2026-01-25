# GSD 시스템 분석 및 개선 제안

**분석일:** 2025-01-25
**GSD 버전:** 1.9.13
**Claude Code 버전:** 최신

## 요약

GSD는 잘 설계된 시스템이지만, 최신 Claude Code 기능을 활용하고 몇 가지 기술적 부채를 해결하면 더 견고해질 수 있습니다.

---

## 1. 주요 발견 사항

### 1.1 Config 파싱 취약점 (Critical)

**문제:** 모든 명령어에서 JSON 설정을 `grep/tr`로 파싱합니다.

```bash
# 현재 패턴 (취약)
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | \
  grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | \
  grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

**취약점:**
- 주석이 있는 JSON 파싱 실패
- 중첩된 객체 처리 불가
- 공백/줄바꿈 변형에 민감
- 특수문자가 포함된 값 처리 실패

**제안:** Node.js 또는 `jq` 사용

```bash
# jq 사용
MODEL_PROFILE=$(jq -r '.model_profile // "balanced"' .planning/config.json 2>/dev/null)

# 또는 Node.js 원라이너
MODEL_PROFILE=$(node -p "require('./.planning/config.json').model_profile || 'balanced'" 2>/dev/null)
```

---

### 1.2 파일 인라인 보일러플레이트 (High)

**문제:** `@` 문법이 Task 경계를 넘어 작동하지 않아, 모든 명령어가 파일을 수동으로 읽고 인라인합니다.

```javascript
// 현재 - 각 명령어에서 반복
Task(prompt="
<context>
@.planning/STATE.md     // Task 내부에서 작동 안 함
</context>
...")

// 실제 작동 방식 - 명령어가 직접 읽어서 인라인
const stateContent = fs.readFileSync('.planning/STATE.md');
Task(prompt="
<context>
${stateContent}
</context>
...")
```

**제안:** 공통 유틸리티 훅 또는 헬퍼 스크립트 생성

```javascript
// .claude/hooks/gsd-context.js
module.exports = {
  loadPlanningContext() {
    return {
      state: fs.readFileSync('.planning/STATE.md', 'utf8'),
      config: JSON.parse(fs.readFileSync('.planning/config.json', 'utf8')),
      roadmap: fs.readFileSync('.planning/ROADMAP.md', 'utf8')
    };
  }
};
```

---

### 1.3 모델 프로파일 테이블 중복 (Medium)

**문제:** 각 명령어에 모델 룩업 테이블이 하드코딩되어 있습니다.

```markdown
# execute-phase.md
| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| gsd-executor | opus | sonnet | sonnet |
| gsd-verifier | sonnet | sonnet | haiku |

# plan-phase.md (동일한 테이블 중복)
| Agent | quality | balanced | budget |
| gsd-planner | opus | opus | sonnet |
| gsd-phase-researcher | opus | sonnet | haiku |
```

**제안:** 중앙 집중식 참조 파일 생성

```json
// .claude/get-shit-done/model-profiles.json
{
  "quality": {
    "gsd-planner": "opus",
    "gsd-executor": "opus",
    "gsd-verifier": "sonnet"
  },
  "balanced": {
    "gsd-planner": "opus",
    "gsd-executor": "sonnet",
    "gsd-verifier": "sonnet"
  },
  "budget": {
    "gsd-planner": "sonnet",
    "gsd-executor": "sonnet",
    "gsd-verifier": "haiku"
  }
}
```

---

### 1.4 Hooks 개선 필요 (Medium)

**현재 문제점:**

1. **매 세션마다 npm 체크**
   - 캐시 유효성 검증 없음
   - 24시간 캐싱 권장

2. **에러 무시**
   - Silent fail은 디버깅 어려움
   - 로그 파일 추가 권장

3. **하드코딩된 경로**
   - `~/.claude/todos` 등 경로가 하드코딩됨

**개선된 gsd-check-update.js:**

```javascript
// 캐시 유효성 체크 추가
const CACHE_TTL_HOURS = 24;

if (fs.existsSync(cacheFile)) {
  const cache = JSON.parse(fs.readFileSync(cacheFile));
  const ageHours = (Date.now() / 1000 - cache.checked) / 3600;
  if (ageHours < CACHE_TTL_HOURS) {
    process.exit(0); // 캐시 유효, 체크 생략
  }
}
```

---

### 1.5 Skills 활용 기회 (High - 새 기능)

현재 Claude Code는 **Skills** 시스템을 지원합니다. GSD의 일부 기능을 Skills로 리팩토링할 수 있습니다.

**Skills로 변환하기 좋은 후보:**

| 현재 | Skills 변환 가능 | 이유 |
|------|-----------------|------|
| `gsd:debug` | `superpowers:systematic-debugging` 연동 | 디버깅 방법론 공유 |
| `gsd:verify-work` | `superpowers:verification-before-completion` 연동 | 검증 패턴 재사용 |
| TDD 참조 | `superpowers:test-driven-development` 연동 | TDD 워크플로우 표준화 |

**연동 예시:**

```markdown
<!-- gsd:execute-phase.md 에서 -->
<execution_context>
# TDD가 필요한 태스크는 TDD skill 호출
@Skill(superpowers:test-driven-development)
</execution_context>
```

**주의:** GSD 명령어 자체를 Skills로 변환하는 것은 권장하지 않습니다.
- GSD 명령어는 이미 `/gsd:*` 형태로 잘 작동
- Skills는 cross-cutting concerns에 더 적합

---

### 1.6 에이전트 정의 스키마 부재 (Medium)

**문제:** 에이전트가 Markdown으로 정의되어 검증이 없습니다.

**현재:**
```markdown
# gsd-planner.md
(1,350줄의 자유형 Markdown)
```

**제안:** 프론트매터에 구조화된 메타데이터 추가

```yaml
---
name: gsd-planner
version: 1.0.0
inputs:
  - name: phase_context
    type: file
    required: true
  - name: project_state
    type: file
    required: true
outputs:
  - name: PLAN.md
    type: file
    path_pattern: ".planning/phases/{phase}/{plan}-PLAN.md"
model_requirements:
  min: sonnet
  recommended: opus
context_budget: 50%
---
```

---

### 1.7 Task 타임아웃 부재 (Low)

**문제:** 서브에이전트가 무한 루프에 빠지면 오케스트레이터도 멈춤

**현재:**
```javascript
Task(prompt="...", subagent_type="gsd-executor")
// 타임아웃 없음 - 영원히 대기 가능
```

**제안:** Task 래퍼 또는 문서화된 탈출 패턴
```javascript
// 현재 Claude Code에서는 직접 지원하지 않으므로 문서화 필요
// "오래 걸리는 태스크는 체크포인트 분할 권장"
```

---

## 2. 아키텍처 개선 제안

### 2.1 중앙 집중식 설정 관리

```
.claude/get-shit-done/
├── config/
│   ├── model-profiles.json    # 모델 매핑
│   ├── defaults.json          # 기본값
│   └── schema.json            # config.json 스키마
├── lib/
│   ├── config-loader.js       # 설정 로드 유틸리티
│   ├── context-builder.js     # 파일 인라인 헬퍼
│   └── model-resolver.js      # 프로파일→모델 해석
```

### 2.2 Skills 연동 계층

```
superpowers (범용 Skills)
    ↑ 참조
gsd (도메인 특화 Commands)
    ↑ 호출
사용자
```

**연동 예시:**
- `gsd:debug` → 내부적으로 `superpowers:systematic-debugging` 방법론 참조
- `gsd:execute-phase` → TDD 태스크에 `superpowers:test-driven-development` 적용

---

## 3. 우선순위별 개선 작업

### P0 (즉시 수정 권장)

| 항목 | 영향 | 작업량 |
|------|------|--------|
| Config 파싱을 jq/Node.js로 변경 | 안정성 | 낮음 |
| 업데이트 체크 캐싱 (24시간) | 성능 | 낮음 |

### P1 (권장)

| 항목 | 영향 | 작업량 |
|------|------|--------|
| 모델 프로파일 중앙화 | 유지보수성 | 중간 |
| 파일 인라인 헬퍼 생성 | DRY | 중간 |
| Skills 연동 (TDD, 디버깅) | 기능 확장 | 중간 |

### P2 (향후)

| 항목 | 영향 | 작업량 |
|------|------|--------|
| 에이전트 스키마 정의 | 문서화 | 높음 |
| 훅 에러 로깅 | 디버깅 | 낮음 |
| config.json 스키마 검증 | 안정성 | 중간 |

---

## 4. Skills 통합 상세 제안

### 4.1 현재 superpowers Skills 활용

시스템에 이미 다음 Skills가 로드되어 있습니다:

```
superpowers:systematic-debugging
superpowers:test-driven-development
superpowers:verification-before-completion
superpowers:brainstorming
superpowers:writing-plans
superpowers:executing-plans
```

### 4.2 GSD와 Skills 연동 방안

**Option A: 참조 연동 (권장)**

GSD 에이전트가 Skills의 방법론을 참조하되, 별도로 호출하지 않음:

```markdown
<!-- gsd-debugger.md 에 추가 -->
<methodology_reference>
이 에이전트는 superpowers:systematic-debugging의 과학적 방법론을 따릅니다.
참조: @.claude/commands/superpowers/systematic-debugging.md
</methodology_reference>
```

**Option B: 하이브리드 호출**

특정 상황에서 Skills를 명시적으로 호출:

```markdown
<!-- gsd:execute-phase 에서 TDD 태스크 발견 시 -->
<tdd_detection>
태스크에 `tdd: true` 플래그가 있으면:
1. superpowers:test-driven-development Skill 참조
2. RED-GREEN-REFACTOR 사이클 준수
</tdd_detection>
```

**Option C: 듀얼 인터페이스**

사용자가 GSD 또는 superpowers 중 선택 가능:

```
/gsd:debug          # GSD 풀 스택 (상태 추적, STATE.md 업데이트)
/superpowers:systematic-debugging  # 가벼운 디버깅만
```

### 4.3 권장 연동

| GSD 기능 | Skills 연동 | 연동 방식 |
|----------|-------------|-----------|
| `gsd:debug` | `systematic-debugging` | 방법론 참조 (Option A) |
| `gsd:plan-phase` | `brainstorming` | 선택적 호출 (Option B) |
| `gsd:execute-phase` (TDD) | `test-driven-development` | 조건부 참조 |
| `gsd:verify-work` | `verification-before-completion` | 체크리스트 공유 |

---

## 5. 구체적 코드 변경 예시

### 5.1 Config 파싱 개선

**변경 전 (모든 명령어에 중복):**
```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | \
  grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | \
  grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

**변경 후 (헬퍼 스크립트):**

```javascript
// .claude/hooks/gsd-config.js
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = '.planning/config.json';
const DEFAULTS = {
  model_profile: 'balanced',
  mode: 'interactive',
  depth: 'standard'
};

function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return { ...DEFAULTS, ...config };
  } catch {
    return DEFAULTS;
  }
}

// CLI 인터페이스
const key = process.argv[2];
if (key) {
  const config = loadConfig();
  console.log(config[key] || '');
}

module.exports = { loadConfig };
```

**명령어에서 사용:**
```bash
MODEL_PROFILE=$(node .claude/hooks/gsd-config.js model_profile)
```

### 5.2 24시간 캐싱 추가

```javascript
// gsd-check-update.js 수정
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24시간

// 캐시 체크
if (fs.existsSync(cacheFile)) {
  try {
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const age = Math.floor(Date.now() / 1000) - cache.checked;
    if (age < CACHE_TTL_SECONDS) {
      console.log('GSD update check: using cached result');
      process.exit(0);
    }
  } catch {}
}

// 기존 npm 체크 로직...
```

---

## 6. 결론

GSD는 체계적이고 잘 설계된 시스템입니다. 제안된 개선 사항은 대부분 "기술적 부채 청산" 수준이며, 핵심 아키텍처 변경은 필요하지 않습니다.

**즉시 적용 권장:**
1. Config 파싱을 Node.js 헬퍼로 변경
2. 업데이트 체크 캐싱 추가

**중기 검토 권장:**
1. superpowers Skills와의 연동 (특히 TDD, 디버깅)
2. 모델 프로파일 중앙화

**기존 강점 유지:**
- 웨이브 기반 병렬 실행
- 과학적 디버깅 방법론
- 4-규칙 이탈 처리
- 원자적 커밋 패턴
