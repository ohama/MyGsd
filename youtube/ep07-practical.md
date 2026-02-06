# EP07: 실전 활용 사례

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 10-12분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | 배운 것을 실제 프로젝트에 적용하는 방법 |

---

## 인트로 (30초)

**[화면: 시리즈 회고]**

> .claude/ 시리즈 마지막 영상입니다.
> 지금까지 Settings, Commands, Skills, Agents, Hooks를 배웠습니다.
>
> 오늘은 **실전 활용 사례**를 통해 복습하고,
> **나만의 .claude/ 만드는 방법**을 알려드립니다.

---

## 사례 1: 프로젝트 전용 Command (2분)

**[화면: /tutorial 실행 장면]**

### 문제

> 튜토리얼 프로젝트를 만들고 있습니다.
> 6개 챕터 + 3개 부록이 있어요.
>
> 매번 이렇게 설명해야 합니다:
> "2번 챕터 작성해줘. 형식은 이렇고, 테스트는 이렇게..."

### 해결: /tutorial 명령어

```markdown
# .claude/commands/tutorial.md

## 문서 구조

| Chapter | 파일명 | 내용 |
|---------|--------|------|
| 1 | chapter-01.md | 프로젝트 설정 |
| 2 | chapter-02.md | 사칙연산 |
| ... | ... | ... |

## 인자 처리

| 명령 | 설명 |
|------|------|
| `/tutorial` | 목록 및 상태 표시 |
| `/tutorial 2` | 2번 챕터 작성 |
| `/tutorial pdf` | PDF 생성 |
```

**[화면: /tutorial 2 실행]**

> `/tutorial 2`만 입력하면
> Claude가 알아서 2번 챕터를 작성합니다.
> 형식, 테스트 방법, 프로젝트 규칙 다 알고 있어요.

### 핵심 기법

> **프로젝트 지식을 명령어에 캡슐화**합니다.
> CLI 옵션, 테스트 도구, 문서 형식...
> 다 명령어 안에 넣어두면 매번 설명 안 해도 됩니다.

---

## 사례 2: 이미지 규칙 Skill (2분)

**[화면: Before/After 이미지 코드]**

### 문제

> Claude가 이미지를 넣을 때 일관성이 없었습니다.

```markdown
<!-- 어떤 때는 -->
![](https://cdn.example.com/a.png)

<!-- 어떤 때는 -->
<img src="/images/b.png" />

<!-- 어떤 때는 -->
![이미지](images/c.png)
```

### 해결: markdown-image-insertion 스킬

```markdown
---
name: markdown-image-insertion
trigger: Markdown 문서를 생성·편집할 때
---

## 규칙

1. 상대경로만 사용: `images/파일.png`
2. HTML 금지
3. alt text 필수
```

**[화면: After - 일관된 이미지 코드]**

```markdown
![프로젝트 구조](images/architecture.png)
![로그인 흐름](images/login-flow.png)
```

> 스킬 정의 후에는 **항상 일관된 형식**입니다.

### 핵심 기법

> **Claude가 자꾸 틀리는 것을 Skill로 고정**합니다.
> "권장"이 아니라 "절대 규칙"으로 쓰면 효과적입니다.

---

## 사례 3: /howto 지식 추출 (2분)

**[화면: 세션 → 문서 흐름]**

### 문제

> Claude와 작업하면서 많이 배웁니다.
> 근데 세션 끝나면 다 사라져요.

### 해결: /howto 명령어

```
작업 세션
    ↓ /howto scan
세션 분석 → 문서화할 주제 발견
    ↓ /howto next
docs/howto/jwt-pipeline.md 생성
```

**[화면: 생성된 howto 문서]**

```markdown
# JWT 인증 파이프라인 구축

## The Insight
JWT 검증은 미들웨어 레벨에서 한 번만 해야 한다.

## Why This Matters
각 API에서 중복 검증하면 성능 저하 + 코드 중복.

## The Approach
1. 미들웨어에서 토큰 추출
2. 검증 + 디코드
3. req.user에 저장
```

### 품질 필터

> 모든 걸 문서화하진 않습니다.
> 4가지 기준 중 **2개 이상** 충족해야 합니다:

| 기준 | 설명 |
|------|------|
| Non-Googleable | 검색으로 안 나오는 것 |
| Hard-Won | 삽질 끝에 얻은 통찰 |
| Actionable | 바로 적용 가능 |
| Reusable | 반복해서 쓸 수 있음 |

---

## 나만의 .claude/ 만들기 (3분)

**[화면: 단계별 가이드]**

### Step 1: 기본 구조 생성

```bash
mkdir -p .claude/commands .claude/skills .claude/hooks
echo '{}' > .claude/settings.json
echo 'settings.local.json' > .claude/.gitignore
```

**[화면: 터미널에서 실행]**

### Step 2: 첫 Command 만들기

> 프로젝트에서 **자주 하는 작업**을 명령어로 만듭니다.

```markdown
# .claude/commands/deploy.md
---
allowed-tools: Bash, Read
description: 프로덕션 배포
---

## Step 1: 테스트 실행
npm test

## Step 2: 빌드
npm run build

## Step 3: 배포 (확인 후)
사용자 확인 받고 배포
```

### Step 3: 반복 규칙을 Skill로

> Claude가 **자꾸 틀리는 것**을 스킬로 고정합니다.

```markdown
# .claude/skills/api-format.skill.md
---
name: api-format
trigger: API 엔드포인트 작성 시
---

## 응답 형식

{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Step 4: 자동화할 것을 Hook으로

```javascript
// .claude/hooks/check-env.js
#!/usr/bin/env node
const fs = require('fs');

if (!fs.existsSync('.env')) {
  console.error('WARNING: .env file missing!');
}
```

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/check-env.js"
      }]
    }]
  }
}
```

### Step 5: 다른 프로젝트에서 재사용

```bash
# submodule로 분리
cd .claude && git init
git remote add origin <url>
git push -u origin master

# 다른 프로젝트에서 사용
git submodule add <url> .claude
```

---

## 정리: 언제 뭘 쓰나? (1분)

**[화면: 정리 테이블]**

| 상황 | 사용할 것 | 예시 |
|------|-----------|------|
| 자주 실행하는 워크플로우 | **Command** | /commit, /deploy |
| Claude가 따라야 할 규칙 | **Skill** | 이미지 규칙, API 형식 |
| 복잡한 자동화 태스크 | **Agent** | 계획, 실행, 검증 |
| 세션 이벤트 자동화 | **Hook** | 버전 체크, 환경 확인 |

---

## 아웃트로 (1분)

**[화면: 시리즈 전체 회고]**

> 7편에 걸쳐 .claude/ 디렉토리를 알아봤습니다.

| EP | 주제 |
|----|------|
| 01 | .claude/ 소개 |
| 02 | Settings |
| 03 | Commands |
| 04 | Skills |
| 05 | Agents |
| 06 | Hooks |
| 07 | 실전 활용 (지금) |

> 핵심은 하나입니다.
> **Claude의 행동을 코드로 정의한다.**
>
> 한 번 정의해두면 매번 설명 안 해도 됩니다.
> 여러 프로젝트에서 재사용할 수 있습니다.
>
> 오늘부터 여러분만의 `.claude/`를 만들어보세요!
>
> 시리즈 끝까지 시청해주셔서 감사합니다.
> 도움이 됐다면 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- 사례별로 실제 화면 녹화 포함
- Step별 가이드는 터미널 라이브 코딩
- 최종 정리 테이블은 풀스크린
- 아웃트로에 시리즈 전체 썸네일 모자이크
