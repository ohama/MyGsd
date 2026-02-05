# Chapter 7: 실전 활용 사례

## LangTutorial 프로젝트 분석

LangTutorial은 F# + FsLexYacc로 프로그래밍 언어를 만드는 튜토리얼 프로젝트다.
이 프로젝트가 `.claude/`를 어떻게 활용하는지 분석한다.

## 사례 1: 프로젝트 전용 Command - /tutorial

### 문제

튜토리얼은 6개 chapter + 3개 appendix로 구성된다.
각 문서의 작성 상태를 추적하고, 일관된 형식으로 작성하고, PDF로 변환해야 한다.

### 해결

`/tutorial` 명령어를 만들어 문서 관리 전체를 자동화했다.

```markdown
# Tutorial Command (.claude/commands/tutorial.md)

## 문서 구조

| Chapter | 파일명 | 내용 |
|---------|--------|------|
| 1 | chapter-01-foundation.md | .NET 10 + FsLexYacc 설정 |
| 2 | chapter-02-arithmetic.md | 사칙연산 인터프리터 |
| ... | ... | ... |

## 인자 처리

| 명령 | 설명 |
|------|------|
| `/tutorial` | 문서 목록 및 상태 표시 |
| `/tutorial 2` | chapter 2 작성 시작 |
| `/tutorial pdf` | 전체 PDF 생성 |
| `/tutorial tag 1.0` | tutorial-v1.0 태그 생성 |
```

### 핵심 기법

1. **프로젝트 지식 캡슐화**: CLI 인터페이스(`--expr`, `--emit-tokens`), 테스트 도구(Expecto, FsCheck) 등 프로젝트 고유 지식을 명령어에 담음
2. **다중 서브커맨드**: 하나의 명령어에 목록 보기, 작성, PDF 변환, 태깅 등 여러 기능
3. **작성 가이드 포함**: "Examples 섹션 반드시 포함", "코드는 입력 → 출력 형식" 등 문서 품질 규칙

## 사례 2: 프로젝트 전용 Skill - 이미지 규칙

### 문제

Claude가 Markdown 문서를 작성할 때 이미지 처리 방식이 일관되지 않았다:
- 절대경로 사용
- HTML `<img>` 태그 남용
- alt text 누락
- mdBook에서 깨지는 문법

### 해결

두 개의 스킬을 만들어 **자동으로** 규칙을 강제했다.

#### markdown-image-insertion.skill.md

```yaml
---
name: markdown-image-insertion
description: Markdown 문서 내 이미지 삽입 규칙을 강제
trigger: Markdown 문서를 생성·편집할 때 자동 적용
consumers:
  - 문서 작성 작업
  - mdbook-docs-images skill
---
```

**핵심 규칙:**
- 상대경로만 허용 (`images/a.png` O, `/images/a.png` X)
- HTML 사용 금지 (명시적 요청 시만 예외)
- 이미지 설계 주석을 HTML 코멘트로 남김

#### mdbook-docs-images.skill.md

```yaml
---
name: mdbook-docs-images
description: mdBook 문서 작성 시 규칙을 강제
trigger: mdBook 기반 문서를 생성·편집할 때 자동 적용
consumers:
  - mdbook command
---
```

**mdBook 전용 추가 규칙:**
- 모든 문서를 SUMMARY.md에 등록
- 헤더 레벨 건너뛰기 금지
- 코드 블록에 언어 명시 필수

### 핵심 기법: Skill 계층 구조

```
markdown-image-insertion (기본 이미지 규칙)
    └── mdbook-docs-images (mdBook 전용 확장)
         └── /mdbook command (명령어에서 참조)
```

기본 스킬을 만들고, 그 위에 특화 스킬을 쌓는 **계층 구조**다.

## 사례 3: /howto - 세션 지식 추출

### 문제

Claude와 작업하면서 배운 것들이 세션이 끝나면 사라진다.

### 해결

`/howto` 명령어로 세션에서 학습한 내용을 구조화된 문서로 추출한다.

```
작업 세션 진행
    ↓
/howto scan        → 세션 분석, 문서화할 주제 발견
    ↓
/howto             → 문서 목록 + TODO 확인
    ↓
/howto next        → TODO에서 문서 생성
    ↓
docs/howto/setup-fslexyacc-pipeline.md  ← 결과
```

### 핵심 기법: 품질 필터

모든 것을 문서화하지 않는다. 4가지 기준 중 2개 이상 충족해야 문서화한다:

| 기준 | 설명 |
|------|------|
| **Non-Googleable** | 검색으로 쉽게 안 나오는 것 |
| **Hard-Won** | 디버깅/삽질 끝에 얻은 통찰 |
| **Actionable** | 정확히 무엇을 어디서 하는지 |
| **Reusable** | 반복해서 쓸 수 있는 패턴 |

### 문서 템플릿: Insight → Approach → Example

```markdown
# 제목

## The Insight
무엇을 깨달았나? (코드가 아니라 멘탈 모델)

## Why This Matters
모르면 뭐가 잘못되나?

## Recognition Pattern
이 지식이 필요한 상황을 어떻게 알아채나?

## The Approach
어떻게 생각하고 접근하나?

## Example
원리를 설명하는 코드
```

## 사례 4: Submodule 관리 - /claude-config

### 문제

`.claude/`가 submodule이므로 변경 시 submodule과 부모 저장소 모두 커밋/push해야 한다.

### 해결

`/claude-config` 명령어로 submodule 관리를 자동화했다.

```
/claude-config         → 상태 확인
/claude-config push    → submodule commit + push + 부모 업데이트
/claude-config pull    → submodule 최신화 + 부모 업데이트
```

## 나만의 .claude/ 만들기: 단계별 가이드

### Step 1: 기본 구조 생성

```bash
mkdir -p .claude/commands .claude/skills .claude/hooks
echo '{}' > .claude/settings.json
echo 'settings.local.json' > .claude/.gitignore
```

### Step 2: 첫 Command 만들기

프로젝트에서 자주 하는 작업을 명령어로 만든다.

```markdown
# .claude/commands/deploy.md
---
allowed-tools: Bash, Read
description: 프로덕션 배포
---

## Step 1: 테스트 실행
npm test 실행하고 결과 확인

## Step 2: 빌드
npm run build 실행

## Step 3: 배포
배포 명령 실행 전 사용자에게 확인
```

### Step 3: 반복되는 규칙을 Skill로

Claude가 자꾸 틀리는 것을 스킬로 고정한다.

```markdown
# .claude/skills/api-conventions.skill.md
---
name: api-conventions
description: API 응답 형식 규칙
trigger: API 엔드포인트를 작성할 때 자동 적용
---

## 응답 형식

모든 API 응답은 다음 형식을 따른다:

{
  "success": true,
  "data": { ... },
  "error": null
}

## 에러 응답

{
  "success": false,
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "..." }
}
```

### Step 4: 자동화할 것을 Hook으로

세션 시작 시 자동 실행할 스크립트를 만든다.

```javascript
// .claude/hooks/check-env.js
#!/usr/bin/env node
const fs = require('fs');

if (!fs.existsSync('.env')) {
  console.error('WARNING: .env file missing!');
  console.error('Copy .env.example to .env and fill in values.');
}
```

```json
// settings.json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/check-env.js" }
        ]
      }
    ]
  }
}
```

### Step 5: 다른 프로젝트에서 재사용

범용 설정을 submodule로 분리한다:

```bash
# 별도 저장소로 분리
cd .claude && git init && git remote add origin <url>
git add -A && git commit -m "initial" && git push

# 다른 프로젝트에서 사용
git submodule add <url> .claude
```

## 요약: 언제 무엇을 쓰는가

| 상황 | 사용할 것 | 예시 |
|------|-----------|------|
| 자주 실행하는 워크플로우 | **Command** | `/commit`, `/deploy`, `/tutorial` |
| Claude가 따라야 할 규칙 | **Skill** | 이미지 규칙, API 형식, 코딩 컨벤션 |
| 복잡한 자동화 태스크 | **Agent** | 계획 수립, 코드 실행, 검증 |
| 세션 이벤트 자동화 | **Hook** | 버전 체크, 환경 확인, 상태줄 |
| 전역 설정 | **settings.json** | hooks, statusLine |
| 로컬 권한 | **settings.local.json** | 허용 명령어 |
