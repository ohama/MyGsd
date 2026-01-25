# 명령어 생성

Claude Code 슬래시 명령어를 생성하는 방법.

## 상황

- 반복되는 워크플로우를 자동화할 때
- 사용자가 직접 호출하는 기능이 필요할 때
- 여러 도구를 조합한 작업을 단순화할 때

## 방법

### Step 1: 명령어 파일 생성

**GSD 명령어:** `.claude/commands/gsd/명령어.md`
**범용 명령어:** `.claude/commands/명령어.md`

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: 한 줄 설명
---

<role>
명령어의 역할과 목적.
</role>

<commands>

## 사용법

| 명령 | 설명 |
|------|------|
| `/명령어` | 기본 동작 |
| `/명령어 인자` | 인자 있는 동작 |

</commands>

<execution>

## Step 1: 입력 파싱

...

## Step 2: 동작 수행

...

</execution>

<examples>

### 예시 1

...

</examples>
```

### Step 2: YAML Frontmatter 작성

```yaml
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: 한 줄 설명 (Task tool에 표시됨)
---
```

**allowed-tools 옵션:**
- `Read, Write, Edit` - 파일 조작
- `Bash` - 명령어 실행
- `Glob, Grep` - 검색
- `WebFetch, WebSearch` - 웹 접근

### Step 3: 핵심 섹션 작성

| 섹션 | 필수 | 용도 |
|------|------|------|
| `<role>` | O | 명령어의 역할 정의 |
| `<commands>` | O | 사용법 테이블 |
| `<execution>` | O | 단계별 실행 로직 |
| `<examples>` | O | 사용 예시 |
| `<edge_cases>` | | 예외 처리 |

### Step 4: 테스트

```
/명령어
/명령어 인자
```

## 예시

### Good: /howto 명령어

```markdown
---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
description: 개발 지식을 howto 문서로 기록하고 관리
---

<role>
개발자가 작업 중 배운 것, 해결한 문제를 기록하도록 돕습니다.
</role>

<commands>

| 명령 | 설명 |
|------|------|
| `/howto` | 문서 목록 |
| `/howto new 제목` | 새 문서 생성 |
| `/howto record` | 세션 작업 기록 |

</commands>
```

### Good: /release 명령어

```markdown
---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: 버전 업그레이드, CHANGELOG 작성, 릴리스 커밋 생성
---

<commands>

| 명령 | 설명 |
|------|------|
| `/release patch` | 패치 버전 |
| `/release minor` | 마이너 버전 |
| `/release major` | 메이저 버전 |

</commands>
```

### Bad

```markdown
---
description: 도움  # 너무 짧음, 도구 목록 없음
---

# 내용

뭔가 합니다.  # 구조화 안됨
```

## 체크리스트

- [ ] `.claude/commands/` 에 파일 생성됨
- [ ] YAML frontmatter에 allowed-tools, description 있음
- [ ] `<role>` 섹션에 역할 정의됨
- [ ] `<commands>` 섹션에 사용법 테이블 있음
- [ ] `<execution>` 섹션에 단계별 로직 있음
- [ ] `<examples>` 섹션에 예시 있음
- [ ] 테스트 완료

## 관련 문서

- `.claude/docs/commands.md` - 명령어 레퍼런스
- `.claude/commands/howto.md` - howto 명령어 예시
- `.claude/commands/release.md` - release 명령어 예시
