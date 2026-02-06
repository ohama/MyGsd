# Chapter 3: Commands (슬래시 명령어)

## Commands란?

Commands는 사용자가 `/명령어`로 실행하는 **대화형 명령**이다.
`.claude/commands/` 디렉토리에 Markdown 파일로 정의한다.

```
.claude/commands/
├── commit.md          → /commit
├── push.md            → /push
├── release.md         → /release
├── howto.md           → /howto
├── pages.md           → /pages (mdBook + CI 설정)
├── mdbook.md          → /mdbook (로컬 빌드)
└── gsd/               → /gsd:* (하위 디렉토리 = 네임스페이스)
    ├── plan-phase.md  → /gsd:plan-phase
    ├── execute-phase.md → /gsd:execute-phase
    └── ...
```

**파일명이 곧 명령어명이다:**
- `commit.md` → `/commit`
- `gsd/plan-phase.md` → `/gsd:plan-phase`

## Command 파일 구조

### 기본 구조

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: 이 명령어의 한 줄 설명
---

명령어 실행 시 Claude가 따를 지시문 (자유 형식 Markdown)
```

### Frontmatter (YAML)

| 필드 | 필수 | 설명 |
|------|------|------|
| `allowed-tools` | 선택 | 이 명령 실행 시 사용 가능한 도구 |
| `description` | 권장 | 명령어 목록에 표시될 설명 |

### 본문

본문은 Claude에게 전달되는 **프롬프트**다.
자유 형식이지만, 보통 다음 섹션으로 구성한다:

1. **역할 정의** - Claude의 역할
2. **사용법** - 명령어 인자와 옵션
3. **실행 순서** - Step별 동작
4. **예시** - 입출력 예시

## 실전 예시 1: /commit

Git 커밋을 도와주는 명령어. 파일 분석, .gitignore 관리, Conventional Commits 형식 메시지 생성까지 자동화한다.

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
description: Git 초기화, .gitignore 관리, 스마트 커밋
---

<role>
당신은 커밋 관리자입니다. Git 저장소 초기화, .gitignore 관리,
변경사항 분석 후 사용자와 함께 커밋을 생성합니다.
</role>

<commands>

## 사용법

| 명령 | 설명 |
|------|------|
| `/commit` | 전체 워크플로우 실행 |
| `/commit -m "메시지"` | 메시지 지정하여 커밋 |

</commands>

<execution>

## Step 1: Git 저장소 확인
git rev-parse --is-inside-work-tree 실행
실패 시 git init

## Step 2: .gitignore 확인
없으면 기본 템플릿 생성

## Step 3: 새 파일 분석
.env, *.log 등 gitignore 후보 탐지

## Step 4: 변경사항 분석
파일을 디렉토리/유형/기능으로 그룹화

## Step 5: 커밋 방식 질문
[A] 한꺼번에 [G] 그룹별

## Step 6: 커밋 메시지 생성
Conventional Commits 형식으로 자동 생성

## Step 7: 커밋 실행 및 결과 표시

</execution>
```

### 핵심 패턴

- `<role>`: Claude의 역할 정의
- `<commands>`: 사용법 표
- `<execution>`: Step별 실행 순서
- `<examples>`: 입출력 예시

## 실전 예시 2: /pages + /mdbook (배포 방식 선택)

같은 기능(mdBook 사이트 배포)을 **다른 방식**으로 제공하는 두 명령어다.

```markdown
/pages   → CI 자동 빌드 (GitHub Actions가 빌드)
/mdbook  → 로컬 빌드 (직접 빌드 후 커밋)
```

### /pages (CI 기반)

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
description: mdBook 프로젝트 설정 및 GitHub Pages 배포 준비 (CI 자동 빌드)
---

<role>
mdBook 설정 도우미. CI가 빌드하므로 로컬 빌드는 하지 않는다.
</role>

<execution>
## Step 1: 디렉토리 스캔
## Step 2: 프로젝트 정보 수집
## Step 3: book.toml, SUMMARY.md 생성
## Step 4: GitHub Actions 워크플로우 생성
## Step 5: README.md에 Pages URL 추가
</execution>
```

### /mdbook (로컬 빌드)

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
description: mdBook 로컬 빌드 및 정적 배포 (CI 없이 직접 커밋)
---

<role>
mdBook 로컬 빌드 도우미. docs/를 직접 커밋하여 배포한다.
</role>

<commands>
| 명령 | 설명 |
|------|------|
| `/mdbook init <dir>` | 초기화 (CI 없이) |
| `/mdbook build [dir]` | 로컬 빌드 |
| `/mdbook serve [dir]` | 개발 서버 |
| `/mdbook sync [dir]` | SUMMARY.md 동기화 |
</commands>
```

### 공통 로직은 Skill로 분리

두 명령어 모두 같은 작업(mdbook 설치 확인, book.toml 탐지, 빌드)이 필요하다.
**공통 로직을 Skill로 분리**하여 중복을 제거한다:

```markdown
# mdbook-utils.skill.md

## 1. mdbook 설치 확인
which mdbook || echo "NOT_INSTALLED"

## 2. book.toml 탐지
[ -f "{DIR}/book.toml" ] && echo "FOUND"

## 3. SUMMARY.md 동기화
...

## 4. 빌드 명령
mdbook clean {DIR}
mdbook build {DIR}
```

Command 파일에서 Skill을 참조한다:

```markdown
<skills_reference>
이 커맨드는 `mdbook-utils` 스킬을 사용한다:
- mdbook 설치 확인
- book.toml 탐지
- SUMMARY.md 동기화
</skills_reference>
```

스킬에 대한 자세한 내용은 [Chapter 4: Skills](04-skills.md)를 참조한다.

---

## 실전 예시 3: /tutorial (프로젝트 전용)

LangTutorial 프로젝트에서 만든 **프로젝트 전용 명령어**다.
튜토리얼 문서의 목록, 작성, PDF 변환을 관리한다.

```markdown
# Tutorial Command

튜토리얼 문서 목록을 표시하고 작성을 관리한다.

## 실행 시 동작

1. **문서 목록 표시**: tutorial/ 디렉토리의 모든 문서 파일 나열
2. **상태 표시**: 각 문서의 완성 상태 (✓ 완성 / ○ 미작성)
3. **다음 작성 제안**: 아직 작성되지 않은 다음 문서 추천

## 문서 구조

| Chapter | 파일명 | 내용 |
|---------|--------|------|
| 1 | chapter-01-foundation.md | 프로젝트 설정 |
| 2 | chapter-02-arithmetic.md | 사칙연산 |
| ... | ... | ... |

## 인자 처리

| 명령 | 설명 |
|------|------|
| `/tutorial` | 문서 목록 표시 |
| `/tutorial <번호>` | 해당 chapter 작성 시작 |
| `/tutorial pdf` | PDF 생성 |
```

### 포인트

- frontmatter 없이도 동작한다 (본문만으로 충분)
- 프로젝트 특화 지식(문서 구조, CLI 인터페이스)을 명령어에 담을 수 있다
- 인자에 따라 다른 동작을 정의할 수 있다

## 실전 예시 4: /howto (지식 관리)

세션에서 배운 것을 문서로 기록하는 명령어.

```markdown
---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
description: 개발 지식을 howto 문서로 기록하고 관리
---

<role>
개발 지식 기록 도우미. 작업 중 배운 것, 해결한 문제,
반복 패턴을 docs/howto/에 기록.
</role>

<commands>
| 명령 | 설명 |
|------|------|
| `/howto` | 문서 목록 + TODO |
| `/howto scan` | 세션 분석 → TODO에 추가 |
| `/howto next` | TODO에서 문서 생성 |
| `/howto new 제목` | 직접 문서 생성 |
</commands>
```

## 하위 디렉토리 = 네임스페이스

디렉토리를 만들면 자동으로 네임스페이스가 된다:

```
commands/
├── commit.md             → /commit
├── push.md               → /push
└── gsd/
    ├── plan-phase.md     → /gsd:plan-phase
    ├── execute-phase.md  → /gsd:execute-phase
    └── debug.md          → /gsd:debug
```

GSD 프레임워크는 `gsd/` 네임스페이스에 27개 명령어를 정의하여 프로젝트 관리 워크플로우 전체를 명령어로 제어한다.

## Command 작성 가이드

### 1. 역할을 명확히 정의한다

```markdown
<role>
당신은 릴리스 관리자입니다.
버전 번호를 올리고, CHANGELOG를 작성하고,
git tag를 생성합니다.
</role>
```

### 2. Step별로 실행 순서를 명시한다

```markdown
## Step 1: 현재 버전 확인
VERSION 파일 읽기

## Step 2: 버전 범프
patch/minor/major 선택

## Step 3: CHANGELOG 생성
git log에서 변경사항 추출
```

### 3. 인자 처리를 테이블로 정리한다

```markdown
| 명령 | 설명 |
|------|------|
| `/release` | 대화형으로 버전 선택 |
| `/release patch` | 패치 버전 올림 |
| `/release minor` | 마이너 버전 올림 |
```

### 4. 에지 케이스를 미리 정의한다

```markdown
<edge_cases>
### 변경사항 없음
"커밋할 변경사항이 없습니다" 출력

### 훅 실패
원인 분석 후 해결 방법 제시
</edge_cases>
```

## 범용 vs 프로젝트 전용

| 유형 | 예시 | 공유 |
|------|------|------|
| 범용 | `/commit`, `/push`, `/release` | submodule로 공유 |
| 프로젝트 전용 | `/tutorial`, `/deploy` | 해당 프로젝트만 |

범용 명령어는 submodule의 `commands/`에, 프로젝트 전용은 프로젝트 루트의 `.claude/commands/`에 넣는다.

## 다음 장

- [Chapter 4: Skills 스킬](04-skills.md)
