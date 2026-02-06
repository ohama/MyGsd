# EP04: Skills 자동 적용 규칙

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 7-9분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | Skill은 Claude가 자동으로 따르는 규칙이다 |

---

## 인트로 (30초)

**[화면: Claude가 이미지 경로를 수정하는 장면]**

> .claude/ 시리즈 네 번째 영상입니다.
> 오늘은 **Skills**를 다룹니다.
>
> Command는 사용자가 `/명령어`로 실행하죠.
> Skill은 다릅니다. **Claude가 알아서 적용**합니다.
>
> "이미지는 상대경로로", "API 응답은 이 형식으로"...
> 한 번 정의해두면 Claude가 자동으로 따릅니다.

---

## 본론 1: Command vs Skill (1분)

**[화면: 비교 테이블]**

| | Command | Skill |
|--|---------|-------|
| 호출 | 사용자가 `/명령어` | Claude가 자동 판단 |
| 위치 | `commands/` | `skills/` |
| 목적 | 작업 수행 | 규칙 강제 |

> 핵심 차이는 **호출 방식**입니다.
>
> Command는 제가 `/commit`이라고 입력해야 실행됩니다.
> Skill은 Claude가 **"아, 지금 이 규칙 적용해야겠다"** 하고 알아서 적용합니다.

**[화면: 흐름도]**

```
나: "이미지 포함해서 문서 작성해줘"
    ↓
Claude: markdown-image-insertion 스킬 감지
    ↓
Claude: 상대경로로 이미지 삽입
```

---

## 본론 2: Skill 파일 구조 (1분 30초)

**[화면: Markdown 파일 예시]**

```markdown
---
name: markdown-image-insertion
description: Markdown 이미지 삽입 규칙
trigger: Markdown 문서를 생성·편집할 때
---

# 규칙 본문

## 1. 기본 원칙
이미지 경로는 상대경로만 사용

## 2. 허용/금지
- O: images/photo.png
- X: /images/photo.png
- X: https://example.com/photo.png
```

### frontmatter 필드

| 필드 | 역할 |
|------|------|
| `name` | 스킬 식별자 |
| `description` | 스킬 설명 |
| `trigger` | 언제 적용할지 조건 |

> `trigger`가 중요합니다.
> "Markdown 문서를 생성·편집할 때"라고 적어두면,
> Claude가 문서 작업할 때 자동으로 이 규칙을 적용합니다.

---

## 본론 3: 이미지 규칙 Skill 만들기 (2분)

**[화면: 실제 작성 장면]**

> 실제로 이미지 규칙 스킬을 만들어볼게요.

### 문제 상황

```markdown
<!-- Claude가 자주 하는 실수 -->
![](https://example.com/img.png)   ← URL 사용
<img src="/images/a.png" />         ← HTML 사용
![](../../../images/b.png)          ← 복잡한 상대경로
```

> Claude가 이미지를 넣을 때 이런 실수를 자주 합니다.
> Skill로 규칙을 정의해서 막아봅시다.

### 스킬 작성

```markdown
---
name: markdown-image-insertion
description: Markdown 이미지 삽입 규칙
trigger: Markdown 문서를 생성·편집할 때
---

# 규칙

이 문서를 **절대 규칙**으로 사용한다.

## 1. 기본 원칙

1. 이미지 삽입은 Markdown 표준 문법만 사용
2. 이미지 경로는 상대경로만 사용
3. 모든 이미지는 `images/` 디렉토리 하위에 위치

## 2. 허용되는 문법

![대체 텍스트](images/파일명.png)

## 3. 금지

| 금지 | 이유 |
|------|------|
| HTML `<img>` | Markdown 아님 |
| 절대경로 `/images/` | 이식성 없음 |
| URL | 외부 의존 |

## 4. 검증 체크리스트

- [ ] 모든 이미지가 images/ 상대경로인가?
- [ ] alt text가 의미 있는가?
- [ ] HTML 사용이 없는가?
```

**[화면: Before/After 비교]**

### Before (Skill 없음)

```markdown
![](https://cdn.example.com/image.png)
```

### After (Skill 적용)

```markdown
![프로젝트 구조 다이어그램](images/architecture.png)
```

---

## 본론 4: mdbook-utils 공유 스킬 (1분 30초)

**[화면: 스킬 참조 다이어그램]**

> Skill은 **공통 로직을 공유**하는 데도 씁니다.

### 문제 상황

> `/pages`와 `/mdbook` 둘 다 이런 작업이 필요합니다:
> - mdbook 설치 확인
> - book.toml 탐지
> - SUMMARY.md 동기화

> 같은 코드를 두 번 쓰기 싫죠?

### 해결: 공유 스킬

```markdown
---
name: mdbook-utils
description: mdBook 공통 유틸리티
---

## 1. mdbook 설치 확인
which mdbook || echo "NOT_INSTALLED"

## 2. book.toml 탐지
[ -f "{DIR}/book.toml" ] && echo "FOUND"

## 3. SUMMARY.md 동기화
# ... 동기화 로직
```

### Command에서 참조

```markdown
<skills_reference>
이 커맨드는 `mdbook-utils` 스킬을 사용합니다:
- mdbook 설치 확인
- book.toml 탐지
</skills_reference>
```

> Command에서 `<skills_reference>`로 스킬을 참조하면,
> Claude가 해당 스킬의 로직을 따릅니다.

---

## 본론 5: Skill 작성 팁 (1분)

**[화면: 팁 카드 애니메이션]**

### 1. "절대 규칙"으로 작성

```markdown
이 문서를 **절대 규칙**으로 사용한다.
```

> "권장"이 아니라 "강제"로 써야 Claude가 일관되게 따릅니다.

### 2. 검증 체크리스트 포함

```markdown
## 검증 체크리스트
- [ ] 규칙 1 충족?
- [ ] 규칙 2 충족?
```

> Claude가 출력 전에 스스로 검증하게 합니다.

### 3. 허용/금지 명시

```markdown
| 허용 | 금지 |
|------|------|
| images/a.png | /images/a.png |
```

> 모호함을 줄여서 일관성을 높입니다.

---

## 아웃트로 (30초)

**[화면: 정리]**

> 오늘 배운 내용입니다.
>
> 1. Skill은 Claude가 자동으로 적용하는 규칙
> 2. `trigger`로 언제 적용할지 정의
> 3. 공통 로직을 스킬로 분리해서 재사용
> 4. "절대 규칙"으로 작성해야 효과적
>
> 다음 영상에서는 **Agents**,
> 독립 실행되는 AI 서브프로세스를 알아봅니다.
>
> 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- Before/After는 split screen으로
- 체크리스트는 체크 애니메이션
- 팁 카드는 하나씩 플립
