# EP03: Commands 슬래시 명령어

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 8-10분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | Markdown 파일 하나가 명령어 하나다 |

---

## 인트로 (30초)

**[화면: /commit 실행 장면]**

> .claude/ 시리즈 세 번째 영상입니다.
> 오늘은 **슬래시 명령어**를 직접 만들어봅니다.
>
> `/commit`, `/push`, `/deploy`...
> 이런 명령어, 어떻게 만드는지 궁금하셨죠?
> 놀라지 마세요. **Markdown 파일 하나**면 됩니다.

---

## 본론 1: Commands 기본 구조 (1분 30초)

**[화면: 디렉토리 구조]**

```
.claude/commands/
├── commit.md     → /commit
├── push.md       → /push
├── deploy.md     → /deploy
└── gsd/
    ├── plan.md   → /gsd:plan
    └── exec.md   → /gsd:exec
```

> `commands/` 디렉토리에 Markdown 파일을 넣으면,
> **파일명이 곧 명령어명**이 됩니다.
>
> `commit.md` → `/commit`
> `push.md` → `/push`
>
> 하위 디렉토리를 만들면 **네임스페이스**가 됩니다.
> `gsd/plan.md` → `/gsd:plan`

### 파일 구조

**[화면: Markdown 파일 예시]**

```markdown
---
allowed-tools: Read, Write, Bash
description: 스마트 커밋 도우미
---

# 본문 (Claude에게 전달되는 프롬프트)

## Step 1: 변경사항 확인
git status로 변경된 파일 확인

## Step 2: 커밋 메시지 생성
Conventional Commits 형식으로 메시지 생성
```

> 파일은 두 부분으로 나뉩니다.
>
> 위쪽 `---` 사이가 **frontmatter**. 메타데이터입니다.
> 아래쪽이 **본문**. Claude에게 전달되는 프롬프트입니다.

---

## 본론 2: /commit 만들어보기 (3분)

**[화면: 실제 코딩 장면]**

> 실제로 `/commit` 명령어를 만들어볼게요.

### Step 1: 파일 생성

```bash
touch .claude/commands/commit.md
```

### Step 2: Frontmatter 작성

```markdown
---
allowed-tools: Read, Write, Bash, AskUserQuestion
description: Git 변경사항 분석 후 스마트 커밋
---
```

> `allowed-tools`는 이 명령어가 사용할 수 있는 도구입니다.
> `description`은 명령어 목록에 표시될 설명이에요.

### Step 3: 역할 정의

```markdown
<role>
당신은 커밋 관리자입니다.
변경사항을 분석하고, 적절한 커밋 메시지를 생성합니다.
</role>
```

> `<role>` 태그로 Claude의 역할을 명확히 합니다.
> "커밋 관리자"라고 정의하면, Claude가 그 역할에 맞게 행동합니다.

### Step 4: 실행 순서 정의

```markdown
<execution>

## Step 1: 변경사항 확인
git status 실행하여 변경된 파일 목록 확인

## Step 2: 변경 내용 분석
git diff로 실제 변경 내용 확인

## Step 3: 커밋 메시지 생성
Conventional Commits 형식으로 메시지 생성:
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 변경
- refactor: 리팩토링

## Step 4: 사용자 확인
커밋 전 메시지 확인 요청

## Step 5: 커밋 실행
git commit 실행

</execution>
```

**[화면: /commit 실행 데모]**

> 이제 `/commit`을 실행하면,
> Claude가 이 순서대로 작업을 진행합니다.

---

## 본론 3: 인자 처리 (1분 30초)

**[화면: 명령어 + 인자 예시]**

```
/commit              → 대화형 커밋
/commit -m "메시지"  → 메시지 지정 커밋
```

> 명령어에 인자를 전달할 수도 있습니다.

### 인자 처리 테이블

```markdown
<commands>

| 명령 | 설명 |
|------|------|
| `/commit` | 대화형으로 커밋 |
| `/commit -m "메시지"` | 메시지 지정 커밋 |
| `/commit --amend` | 이전 커밋 수정 |

</commands>
```

> `<commands>` 섹션에 사용법을 테이블로 정리하면,
> Claude가 인자에 따라 다르게 동작합니다.

---

## 본론 4: /pages + /mdbook 예시 (2분)

**[화면: 두 명령어 비교]**

> 같은 기능을 **다른 방식**으로 제공하는 예시를 볼게요.

```
/pages   → CI가 빌드 (GitHub Actions)
/mdbook  → 로컬에서 빌드 (직접 커밋)
```

> 둘 다 mdBook 사이트를 배포하는 명령어입니다.
> 하지만 방식이 다릅니다.

### /pages (CI 기반)

```markdown
<execution>
## Step 1: book.toml 생성
## Step 2: SUMMARY.md 생성
## Step 3: GitHub Actions 워크플로우 생성
## Step 4: README에 Pages URL 추가
</execution>
```

> `/pages`는 CI 워크플로우를 만들어서,
> 푸시할 때마다 자동으로 빌드됩니다.

### /mdbook (로컬 빌드)

```markdown
<commands>
| 명령 | 설명 |
|------|------|
| `/mdbook init <dir>` | 초기화 |
| `/mdbook build [dir]` | 빌드 |
| `/mdbook serve [dir]` | 개발 서버 |
</commands>
```

> `/mdbook`은 로컬에서 직접 빌드하고,
> `docs/` 폴더를 커밋합니다.

### 공통 로직은 Skill로

> 두 명령어 모두 "mdbook 설치 확인", "book.toml 탐지" 같은 작업이 필요합니다.
> 이런 **공통 로직은 Skill로 분리**합니다.
>
> Skill은 다음 영상에서 자세히 다룹니다.

---

## 본론 5: 프로젝트 전용 Command (1분)

**[화면: /tutorial 예시]**

> Command는 **프로젝트 전용**으로도 만들 수 있습니다.

```markdown
# /tutorial Command

프로젝트의 튜토리얼 문서를 관리합니다.

| 명령 | 설명 |
|------|------|
| `/tutorial` | 문서 목록 표시 |
| `/tutorial 3` | 3번 챕터 작성 |
| `/tutorial pdf` | PDF 생성 |
```

> 이 명령어는 **이 프로젝트에서만** 의미가 있습니다.
> 문서 구조, 챕터 번호 같은 프로젝트 고유 지식을 담고 있거든요.

### 범용 vs 프로젝트 전용

| 유형 | 예시 | 공유 |
|------|------|------|
| 범용 | `/commit`, `/push` | submodule로 공유 |
| 프로젝트 전용 | `/tutorial`, `/deploy` | 해당 프로젝트만 |

---

## 아웃트로 (30초)

**[화면: 정리 슬라이드]**

> 오늘 배운 내용 정리합니다.
>
> 1. `commands/` 디렉토리에 Markdown 파일 = 명령어
> 2. frontmatter로 도구와 설명 정의
> 3. 본문으로 실행 순서 정의
> 4. 하위 디렉토리 = 네임스페이스
>
> 다음 영상에서는 **Skills**,
> Claude가 자동으로 적용하는 규칙을 알아봅니다.
>
> 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- /commit 실행은 실제 터미널 녹화로
- frontmatter vs 본문 구분은 색상으로 하이라이트
- 범용/프로젝트전용 비교는 테이블 애니메이션
