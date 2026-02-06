# Chapter 4: Skills (스킬)

## Skills란?

Skills는 Claude가 특정 작업을 할 때 **자동으로 적용하는 규칙과 방법론**이다.
Commands가 사용자가 명시적으로 실행하는 것이라면, Skills는 **Claude가 스스로 판단하여 적용**한다.

```
Commands = 사용자가 실행   → /commit
Skills   = Claude가 적용   → "Markdown 작성 시 이미지 규칙 자동 적용"
```

## Command vs Skill 비교

| 항목 | Command | Skill |
|------|---------|-------|
| 호출 방식 | 사용자가 `/명령어` 실행 | Claude가 자동 판단 또는 에이전트가 참조 |
| 파일 위치 | `commands/` | `skills/` |
| 목적 | 특정 작업 수행 | 일관된 규칙/패턴 강제 |
| frontmatter | `allowed-tools`, `description` | `name`, `description`, `trigger`, `consumers` |
| 예시 | `/commit` (커밋 실행) | markdown-image-insertion (이미지 규칙) |

## Skill 파일 구조

### 기본 구조

```markdown
---
name: skill-name
description: 이 스킬이 하는 일 설명
trigger: 어떤 상황에서 적용되는지
consumers:
  - 이 스킬을 사용하는 대상 1
  - 이 스킬을 사용하는 대상 2
---

# 스킬 제목

스킬의 규칙과 방법론 (자유 형식 Markdown)
```

### Frontmatter 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | 권장 | 스킬 식별자 (kebab-case) |
| `description` | 권장 | 스킬이 하는 일 한 줄 설명 |
| `trigger` | 권장 | 이 스킬이 자동 적용되는 조건 |
| `consumers` | 선택 | 이 스킬을 참조하는 대상 목록 |

## 실전 예시 1: markdown-image-insertion

Markdown 문서에 이미지를 삽입할 때 적용되는 규칙 스킬이다.

```markdown
---
name: markdown-image-insertion
description: Markdown 문서 내 이미지 삽입 규칙을 강제하는 스킬
trigger: Markdown 문서를 생성·편집할 때 자동 적용
consumers:
  - 문서 작성 작업
  - mdbook-docs-images skill
---

# Markdown + Image Insertion Rules

Markdown 문서를 생성할 때 이 문서를 **절대 규칙(spec)** 으로 사용한다.

## 1. 기본 원칙 (Must Rules)

1. 이미지 삽입은 **Markdown 표준 문법만 사용**
2. 이미지 경로는 **상대경로만 사용**
3. 모든 이미지는 `images/` 디렉토리 하위에 위치
4. 실제 이미지 파일은 생성하지 않음
5. 모든 이미지에는 **의미 있는 alt text** 포함

## 2. 허용되는 이미지 문법

![대체 텍스트](images/파일명.png)

## 3. HTML 사용 규칙

- HTML 사용 **금지**
- 사람이 명시적으로 요청한 경우만 예외

## 4. 자체 검증 체크리스트

- [ ] 모든 이미지가 images/ 상대경로인가?
- [ ] alt text가 의미를 설명하는가?
- [ ] HTML 남용이 없는가?
```

### 이 스킬의 효과

Claude가 Markdown 문서를 작성할 때 **자동으로** 이 규칙을 따른다:
- `![](https://example.com/img.png)` 대신 `![설명](images/img.png)` 사용
- HTML `<img>` 태그 사용하지 않음
- 이미지마다 의미 있는 alt text 작성

## 실전 예시 2: mdbook-docs-images

mdBook 전용 문서 규칙 스킬이다. 위의 markdown-image-insertion 스킬을 **확장**한다.

```markdown
---
name: mdbook-docs-images
description: mdBook 문서 작성 시 이미지·구조·렌더링 규칙을 강제하는 스킬
trigger: mdBook 기반 문서를 생성·편집할 때 자동 적용
consumers:
  - mdbook command
  - 문서 작성 작업
---

# mdBook 문서 · 그림 규칙

## 1. mdBook 기본 구조 규칙

book/
 ├─ src/
 │   ├─ SUMMARY.md
 │   ├─ chapter_01.md
 │   └─ images/
 └─ book.toml

## 2. SUMMARY.md 작성 규칙

모든 문서는 SUMMARY.md에 등록되어야 한다.

## 3. 헤더 규칙

- 문서 제목은 # 하나만 사용
- 헤더 레벨 건너뛰기 금지

## 4. 코드 블록 규칙

- 언어 명시 필수
```

### 스킬 간 참조

`consumers` 필드를 통해 스킬 간 관계를 정의할 수 있다:

```
markdown-image-insertion
    └── consumers: mdbook-docs-images skill
         → mdbook-docs-images가 이 스킬의 규칙을 포함

mdbook-docs-images
    └── consumers: mdbook command
         → /mdbook 명령어 실행 시 이 스킬 적용
```

## 실전 예시 3: mdbook-utils (공통 유틸리티)

여러 Command가 **공유하는 로직**을 Skill로 분리한 예시다.

```markdown
---
name: mdbook-utils
description: mdBook 공통 유틸리티 (설치 확인, book.toml 탐지, SUMMARY 동기화)
---

## 사용 커맨드

- `/pages` — mdBook 설정 및 CI 구성
- `/mdbook` — 로컬 빌드/서브/클린/싱크

---

## 1. mdbook 설치 확인

which mdbook || echo "NOT_INSTALLED"

설치 안 됨 → 안내:
  cargo install mdbook
  brew install mdbook  # macOS
  sudo apt install mdbook  # Ubuntu

---

## 2. book.toml 탐지

### 인자가 있는 경우
[ -f "{DIR}/book.toml" ] && echo "FOUND"

### 인자가 없는 경우
find . -maxdepth 2 -name "book.toml" -type f

---

## 3. SUMMARY.md 동기화

1. SUMMARY.md에서 링크된 .md 파일 추출
2. 디렉토리의 실제 .md 파일 목록과 비교
3. 차이 표시 및 업데이트 제안

---

## 4. 빌드 명령

mdbook clean {DIR}
mdbook build {DIR}
```

### 이 스킬의 효과

- `/pages`와 `/mdbook` 모두 **동일한 설치 확인 로직** 사용
- book.toml 탐지 로직이 **한 곳에서 관리**됨
- 새로운 mdBook 관련 명령어 추가 시 **재사용 가능**

### Command에서 Skill 참조

```markdown
<skills_reference>
이 커맨드는 `mdbook-utils` 스킬을 사용한다:
- mdbook 설치 확인
- book.toml 탐지
- SUMMARY.md 동기화
- 빌드 명령
</skills_reference>
```

## GSD 스킬 예시

GSD 프레임워크는 12개의 방법론 스킬을 정의한다:

| 스킬 | 용도 |
|------|------|
| `atomic-git-workflow` | 태스크별 커밋 전략 |
| `verify-goal-backward` | 목표에서 역추적하여 검증 |
| `wave-executor` | 의존성 기반 병렬 실행 |
| `deviation-classifier` | 실행 중 이탈 분류 |
| `checkpoint-and-state-save` | 상태 저장/복원 |
| `resolve-model-profile` | 모델 선택 로직 |

이 스킬들은 에이전트의 frontmatter에서 참조된다:

```yaml
# agents/gsd-executor.md frontmatter
skills_integration:
  - atomic-git-workflow
  - deviation-classifier
  - checkpoint-and-state-save
```

## Skill 작성 가이드

### 1. trigger를 명확히 정의한다

```yaml
trigger: Markdown 문서를 생성·편집할 때 자동 적용
```

Claude가 "지금 이 스킬을 적용해야 하나?"를 판단하는 기준이 된다.

### 2. 규칙은 "절대 규칙"으로 작성한다

```markdown
이 문서를 **절대 규칙(spec)** 으로 사용한다.
```

"권장"이 아니라 "강제"로 작성해야 Claude가 일관되게 따른다.

### 3. 검증 체크리스트를 포함한다

```markdown
## 자체 검증 체크리스트

- [ ] 모든 이미지가 images/ 상대경로인가?
- [ ] alt text가 의미를 설명하는가?
```

Claude가 출력 전에 스스로 검증하는 기준을 제공한다.

### 4. 허용/금지를 명시한다

```markdown
| 구분 | 허용 | 금지 |
|----|----|----|
| 상대경로 | images/a.png | /images/a.png |
| HTML | 명시적 요청 시만 | 자발적 사용 |
```

모호함을 줄여 일관성을 높인다.

### 5. 파일명에 용도를 담는다

```
markdown-image-insertion.skill.md   → 이미지 삽입 규칙
mdbook-docs-images.skill.md         → mdBook 문서 규칙
```

`.skill.md` 접미사로 일반 문서와 구분할 수 있다 (선택사항).

## 다음 장

- [Chapter 5: Agents 에이전트](05-agents.md)
