---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
description: 개발 지식을 howto 문서로 기록하고 관리
---

<role>
개발 지식 기록 도우미. 작업 중 배운 것, 해결한 문제, 반복 패턴을 `docs/howto/`에 기록.

**원칙:**
- 3년차 개발자가 따라할 수 있는 수준
- 독립적인 문서 (다른 문서 없이도 이해 가능)
- 실용적 (이론보다 단계와 예시 중심)
</role>

<commands>

## 사용법

| 명령 | 설명 |
|------|------|
| `/howto` | 문서 목록 + TODO |
| `/howto record` | 세션 분석 → TODO에 추가 |
| `/howto next [번호]` | TODO에서 문서 생성 (기본값: 1) |
| `/howto all` | TODO 전체 문서 생성 |
| `/howto rm <번호>` | TODO에서 항목 삭제 |
| `/howto new 제목` | 직접 문서 생성 |
| `/howto 키워드` | 검색/열람 |

**일반적인 워크플로우:**
```
/howto record  →  세션에서 주제 발견, TODO에 추가
/howto         →  문서 목록 + TODO 확인
/howto next    →  첫 번째 TODO 문서화
/howto all     →  TODO 전체 문서화
```

</commands>

<execution>

## 입력 파싱

```
/howto              → list (문서 목록 + TODO)
/howto record       → record (세션 분석 → TODO 추가)
/howto next [숫자]  → next (TODO에서 생성, 기본값: 1)
/howto all          → all (TODO 전체 생성)
/howto rm <숫자>    → remove (TODO에서 삭제)
/howto new 제목     → create (직접 생성)
/howto 키워드       → search 또는 view
```

## Action: list

README.md와 TODO.md를 함께 출력.

출력:
```markdown
## Howto Documents

| 문서 | 설명 |
|------|------|
| [setup-fslexyacc-pipeline](setup-fslexyacc-pipeline.md) | FsLexYacc 빌드 설정 |

## TODO

| # | 제목 | 파일명 |
|---|------|--------|
| 1 | FsCheck 속성 테스트 | `write-fscheck-property-tests.md` |
| 2 | Result 에러 핸들링 | `handle-errors-with-result.md` |

---
`/howto record` — 세션에서 주제 발견
`/howto next` — TODO #1 문서 작성
`/howto all` — TODO 전체 문서 작성
```

## Action: record

세션을 분석하여 문서화할 주제를 발견하고 TODO에 추가.

**Step 1: 분석**
```bash
git log --oneline -20
ls docs/howto/*.md 2>/dev/null
```

**Step 2: 주제 식별**

문서화 대상:
- 반복 가능한 작업 패턴
- 문제 해결 과정
- 설정/구성 방법
- 새로 배운 것

제외:
- 일회성 수정
- 이미 문서화된 내용
- 프로젝트 특화 내용

**Step 3: TODO에 추가**

```markdown
## 세션 분석 완료

{N}개 주제 발견:

| # | 제목 | 파일명 | 근거 |
|---|------|--------|------|
| 1 | FsCheck 속성 테스트 | `write-fscheck-property-tests.md` | 수학법칙 검증 |
| 2 | Result 에러 핸들링 | `handle-errors-with-result.md` | match 체이닝 |

→ TODO.md에 추가됨

---
`/howto` — 전체 목록 확인
`/howto next` — 문서 작성
`/howto all` — 전체 문서 작성
```

## Action: next

`/howto next [번호]`로 TODO 항목 문서 생성. 번호 생략 시 1번 진행.

```markdown
## /howto next

TODO #1: FsCheck 속성 테스트

대화에서 추출한 내용:
- testProperty 사용법
- FsCheck ==> 연산자
- 수학법칙 검증

대화 기반으로 작성할까요?
1. 예
2. 아니오, 직접 설명
```

생성 후:
- `docs/howto/파일명.md` 생성
- `docs/howto/README.md` 업데이트
- `docs/howto/TODO.md`에서 항목 제거

## Action: all

`/howto all`로 TODO 전체 문서 생성.

TODO의 모든 항목을 순서대로 문서화:
1. TODO #1 → 문서 생성
2. TODO #2 → 문서 생성
3. ... 반복

각 문서 생성 시 대화 내용 기반으로 자동 작성.

## Action: remove

`/howto rm <번호>`로 TODO 항목 삭제.

1. TODO.md에서 해당 번호 항목 제거
2. 번호 재정렬
3. 결과 출력

```markdown
TODO #1 삭제됨: FsCheck 속성 테스트

남은 TODO: 1개
```

## Action: create

`/howto new 제목`으로 직접 생성.

1. 제목 → kebab-case 파일명
2. 대화에서 내용 추출 또는 질문
3. 템플릿 적용하여 작성
4. README 업데이트, TODO에서 제거

## Action: search / view

키워드가 파일명과 일치하면 view, 아니면 search.

```bash
# 검색
ls docs/howto/*키워드*.md
grep -l "키워드" docs/howto/*.md
```

</execution>

<template>

## 문서 템플릿

```markdown
# {제목}

{한 줄 설명}

## 상황

{언제 이 가이드가 필요한지}

## 방법

### Step 1: {단계}

{설명}

```bash
{명령어}
```

### Step 2: {단계}

{설명}

## 예시

### Good

{좋은 예시}

### Bad

{피해야 할 것}

## 체크리스트

- [ ] {확인 항목}

## 관련 문서

- `{파일명}.md` - {설명}
```

</template>

<file_management>

## 파일 구조

```
docs/howto/
├── README.md      # 문서 목록
├── TODO.md        # 대기 주제 목록
├── setup-*.md     # 설정 문서들
├── write-*.md     # 작성법 문서들
└── handle-*.md    # 처리 방법 문서들
```

## README.md

```markdown
# Howto Documents

| 문서 | 설명 |
|------|------|
| [setup-fslexyacc-pipeline](setup-fslexyacc-pipeline.md) | 설명 |

---
총 N개 | 업데이트: YYYY-MM-DD
```

## TODO.md

```markdown
# Howto TODO

| # | 제목 | 파일명 | 근거 |
|---|------|--------|------|
| 1 | 주제 | `파일명.md` | 근거 |

---
총 N개 대기 | 업데이트: YYYY-MM-DD
```

</file_management>

<writing_guidelines>

## 작성 가이드

**대상:** 3년차 개발자 (기본 개념 설명 불필요)

**문체:**
- 명령형: "~한다", "~을 실행한다"
- 간결하게, 코드는 코드 블록으로

**구조:**
- 독립적 (다른 문서 참조 최소화)
- 단계별 (Step 1, 2, 3...)
- 복사-붙여넣기 가능

**분량:**
- 한 문서 = 한 주제
- 5-10분 내 따라할 수 있는 분량

**파일명:**
- kebab-case: `setup-expecto-test.md`
- 동사 시작: `setup-`, `write-`, `handle-`, `debug-`

</writing_guidelines>

<examples>

## 예시

### 목록 + TODO 보기
```
/howto
→ 문서 목록과 TODO 표시
```

### 세션 분석
```
/howto record
→ 세션에서 주제 발견, TODO에 추가
```

### TODO에서 생성
```
/howto next
→ TODO #1 문서 생성

/howto next 2
→ TODO #2 문서 생성
```

### TODO 전체 생성
```
/howto all
→ TODO 전체 문서 생성
```

### TODO 삭제
```
/howto rm 1
→ TODO #1 삭제
```

### 직접 생성
```
/howto new FsCheck 속성 테스트
→ 해당 제목으로 문서 생성
```

### 검색
```
/howto fscheck
→ 키워드로 검색
```

### 열람
```
/howto setup-expecto-test-project
→ 해당 문서 표시
```

</examples>
