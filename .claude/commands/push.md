---
allowed-tools: Read, Bash, AskUserQuestion
description: 안전한 git push with 브랜치 보호, 태그 푸시, PR 생성 제안
---

<role>
당신은 Git 푸시 관리자입니다. 푸시 전 검증, 브랜치 보호, 태그 관리, PR 생성 제안을 담당합니다.
</role>

<commands>

## 사용법

| 명령 | 설명 |
|------|------|
| `/push` | 현재 브랜치를 origin으로 푸시 |
| `/push --tags` | 태그도 함께 푸시 |
| `/push --pr` | 푸시 후 PR 생성 |
| `/push <remote>` | 지정된 remote로 푸시 |
| `/push --force` | Force push (확인 후) |

</commands>

<execution>

## Step 1: 현재 상태 확인

```bash
# 현재 브랜치
git branch --show-current

# Upstream 설정 여부
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null

# 푸시되지 않은 커밋 수
git rev-list --count @{u}..HEAD 2>/dev/null || git rev-list --count HEAD

# 원격 저장소 목록
git remote -v
```

## Step 2: Pre-push 검증

### 2.1 푸시할 커밋 확인

```bash
# Upstream이 있으면
git log --oneline @{u}..HEAD

# 없으면 (새 브랜치)
git log --oneline -10
```

푸시할 커밋이 없으면:

```markdown
푸시할 커밋이 없습니다.

현재 브랜치가 원격과 동기화되어 있습니다.
```

### 2.2 로컬 태그 확인

```bash
# 푸시되지 않은 태그 확인
git tag -l | while read tag; do
  git ls-remote --tags origin "$tag" 2>/dev/null | grep -q "$tag" || echo "$tag"
done
```

푸시되지 않은 태그가 있으면:

```markdown
⚠️ 푸시되지 않은 태그가 있습니다:

- v1.0.0
- milestone-v1.0

태그도 함께 푸시할까요? [Y/N]
```

### 2.3 Staged/Unstaged 변경사항 확인

```bash
git status --porcelain
```

커밋되지 않은 변경사항이 있으면:

```markdown
⚠️ 커밋되지 않은 변경사항이 있습니다.

Modified:
- src/index.ts
- README.md

[P] 그대로 푸시  [C] 먼저 커밋 (/commit)  [X] 취소
```

## Step 3: 브랜치 보호 확인

### 3.1 보호된 브랜치 감지

```bash
BRANCH=$(git branch --show-current)
PROTECTED_BRANCHES="main master develop"

for protected in $PROTECTED_BRANCHES; do
  if [ "$BRANCH" = "$protected" ]; then
    echo "PROTECTED"
    break
  fi
done
```

보호된 브랜치면 경고:

```markdown
⚠️ 보호된 브랜치에 직접 푸시하려고 합니다.

브랜치: main

[Y] 계속 푸시  [B] 새 브랜치 생성 후 푸시  [X] 취소
```

### 3.2 새 브랜치 생성 옵션

사용자가 [B] 선택 시:

```markdown
새 브랜치 이름을 입력하세요:

제안: feature/[현재작업-요약]
```

```bash
git checkout -b <new-branch>
git push -u origin <new-branch>
```

## Step 4: Force Push 감지

```bash
# 원격과 로컬 히스토리 비교
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
BASE=$(git merge-base HEAD @{u} 2>/dev/null)

if [ "$REMOTE" != "$BASE" ]; then
  echo "DIVERGED"
fi
```

히스토리가 분기되었으면:

```markdown
⚠️ 로컬과 원격 히스토리가 분기되었습니다.

원격: abc1234 "feat: previous commit"
로컬: def5678 "feat: rebased commit"
공통: 123abcd

[F] Force push (--force-with-lease)
[P] Pull 먼저 (merge)
[R] Pull --rebase 먼저
[X] 취소
```

**--force 옵션이 명시적으로 주어진 경우에도 확인:**

```markdown
⚠️ Force push를 실행합니다.

이 작업은 원격 히스토리를 덮어씁니다.
다른 협업자의 작업이 손실될 수 있습니다.

정말 진행할까요? [Y/N]
```

## Step 5: Upstream 설정

새 브랜치 (upstream 없음) 감지:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "NO_UPSTREAM"
```

Upstream이 없으면 자동으로 `-u` 추가:

```markdown
새 브랜치입니다. Upstream을 설정합니다.

$ git push -u origin <branch>
```

## Step 6: 푸시 실행

### 일반 푸시

```bash
git push origin <branch>
```

### Upstream 설정 포함

```bash
git push -u origin <branch>
```

### 태그 포함

```bash
git push origin <branch> --tags
```

### Force push (--force-with-lease 사용)

```bash
git push --force-with-lease origin <branch>
```

## Step 7: 결과 표시

```markdown
## Push 완료

**브랜치:** feature/auth → origin/feature/auth
**커밋:** 3개 푸시됨
**태그:** 2개 푸시됨 (v1.0.0, milestone-v1.0)

### 푸시된 커밋
- `def5678` feat: add authentication
- `abc1234` test: add auth tests
- `9876543` docs: update README

### 원격 URL
https://github.com/user/repo/tree/feature/auth
```

## Step 8: PR 생성 제안

main/master가 아닌 브랜치를 푸시한 경우:

```markdown
---

## 다음 단계

Pull Request를 생성할까요?

[Y] PR 생성  [N] 나중에

---
```

사용자가 [Y] 선택 시 또는 `--pr` 옵션:

```bash
gh pr create --fill
```

또는 URL 제공:

```markdown
PR 생성 URL:
https://github.com/user/repo/compare/main...feature/auth
```

</execution>

<edge_cases>

## 예외 처리

### 원격 저장소 없음

```markdown
⚠️ 원격 저장소가 설정되지 않았습니다.

원격을 추가하세요:
$ git remote add origin <url>
```

### 인증 실패

```markdown
⚠️ 푸시 실패: 인증 오류

다음을 확인하세요:
1. SSH 키 설정: ssh -T git@github.com
2. 토큰 설정: gh auth status
3. 자격 증명 갱신: git credential reject
```

### 원격 브랜치가 더 최신

```markdown
⚠️ 원격 브랜치가 로컬보다 앞서 있습니다.

원격에 2개의 새 커밋이 있습니다.

[P] Pull 먼저  [F] Force push  [X] 취소
```

### 여러 Remote가 있는 경우

```bash
git remote -v
```

```markdown
여러 원격 저장소가 있습니다:

1. origin  → github.com/user/repo
2. upstream → github.com/original/repo
3. staging → staging.example.com/repo

어디로 푸시할까요? [1/2/3]
```

### Pre-push 훅 실패

```markdown
⚠️ pre-push 훅이 실패했습니다.

[훅 출력 메시지]

문제를 해결한 후 다시 /push를 실행하세요.
```

</edge_cases>

<examples>

### 예시 1: 기본 푸시

```
User: /push

Claude: ## Pre-push 확인

**브랜치:** feature/auth → origin/feature/auth
**커밋:** 3개

- def5678 feat: add login
- abc1234 test: add tests
- 9876543 docs: update README

푸시할까요? [Y/N]

User: Y

## Push 완료

3개 커밋이 푸시되었습니다.

---
PR을 생성할까요? [Y/N]

User: N

완료.
```

### 예시 2: 보호된 브랜치

```
User: /push

Claude: ⚠️ 보호된 브랜치에 직접 푸시하려고 합니다.

브랜치: main

[Y] 계속 푸시  [B] 새 브랜치 생성  [X] 취소

User: B

새 브랜치 이름: feature/my-changes

## Push 완료

**브랜치:** feature/my-changes → origin/feature/my-changes (새로 생성)

---
PR을 생성할까요? [Y/N]
```

### 예시 3: 태그와 함께 푸시

```
User: /push --tags

Claude: ## Pre-push 확인

**브랜치:** main
**커밋:** 1개
**태그:** 2개 (v1.0.0, milestone-v1.0)

푸시할까요? [Y/N]

User: Y

## Push 완료

**커밋:** 1개 푸시됨
**태그:** 2개 푸시됨
```

### 예시 4: Force push

```
User: /push --force

Claude: ⚠️ Force push를 실행합니다.

이 작업은 원격 히스토리를 덮어씁니다.
다른 협업자의 작업이 손실될 수 있습니다.

브랜치: feature/auth
원격 HEAD: abc1234
로컬 HEAD: def5678

정말 진행할까요? [Y/N]

User: Y

## Push 완료 (force)

--force-with-lease로 푸시되었습니다.
```

</examples>

<output_format>

## 최종 출력 형식

```markdown
## Push 완료

**브랜치:** <local> → <remote>/<branch>
**커밋:** N개 푸시됨
**태그:** N개 푸시됨 (있는 경우)

### 푸시된 커밋
- `hash` message
- `hash` message

### 링크
- 브랜치: <url>
- CI: <actions-url> (감지된 경우)

---

## 다음 단계

[PR 생성 제안 또는 완료 메시지]
```

</output_format>
