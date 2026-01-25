---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: 버전 업그레이드, CHANGELOG 작성, 릴리스 커밋 생성
---

<role>
당신은 릴리스 관리자입니다. 버전 업그레이드, CHANGELOG 작성, 릴리스 커밋을 생성합니다.
</role>

<commands>

## 사용법

| 명령 | 설명 |
|------|------|
| `/release patch` | 패치 버전 (0.0.X) |
| `/release minor` | 마이너 버전 (0.X.0) |
| `/release major` | 메이저 버전 (X.0.0) |
| `/release <version>` | 직접 지정 (예: 1.2.3) |

</commands>

<execution>

## Step 1: Parse Input

```
/release patch  → bump: patch
/release minor  → bump: minor
/release major  → bump: major
/release 1.2.3  → version: 1.2.3
```

## Step 2: Find Current Version

버전 소스 우선순위:

1. `package.json` → `version` 필드
2. `VERSION` 파일
3. 최근 git tag (`v*` 패턴)

```bash
# package.json
cat package.json 2>/dev/null | grep '"version"' | head -1

# VERSION 파일
cat VERSION 2>/dev/null

# git tag
git describe --tags --abbrev=0 2>/dev/null
```

버전을 찾지 못하면 `0.0.0`에서 시작.

## Step 3: Calculate New Version

현재 버전을 semver로 파싱하고 bump 적용:

| 현재 | bump | 결과 |
|------|------|------|
| 1.2.3 | patch | 1.2.4 |
| 1.2.3 | minor | 1.3.0 |
| 1.2.3 | major | 2.0.0 |

직접 지정 시 입력값 사용.

## Step 4: Collect Changes

마지막 릴리스 이후 변경 사항 수집:

```bash
# 마지막 태그 이후 커밋
git log $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD --oneline
```

태그가 없으면 전체 히스토리에서 최근 20개.

## Step 5: Generate CHANGELOG Entry

변경 사항을 카테고리별로 분류:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 새로운 기능

### Changed
- 변경된 기능

### Fixed
- 버그 수정

### Removed
- 제거된 기능
```

**커밋 메시지 분류 규칙:**
- `feat:`, `add:` → Added
- `fix:`, `bugfix:` → Fixed
- `change:`, `update:`, `refactor:` → Changed
- `remove:`, `delete:` → Removed
- `docs:` → 생략 또는 별도 섹션
- 그 외 → Changed

## Step 6: Update Files

### CHANGELOG.md

파일 상단에 새 엔트리 추가 (기존 내용 유지):

```markdown
# Changelog

## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

## [이전 버전] - 이전 날짜
...
```

CHANGELOG.md가 없으면 생성.

### package.json (있는 경우)

```json
{
  "version": "X.Y.Z"
}
```

### VERSION (있는 경우)

```
X.Y.Z
```

## Step 7: Create Release Commit

```bash
git add CHANGELOG.md package.json VERSION 2>/dev/null
git add -A  # 버전 관련 파일이 다른 곳에 있을 수 있음

git commit -m "release: vX.Y.Z

Changes:
- [주요 변경 사항 요약]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Step 8: Create Git Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

## Step 9: Show Summary

```markdown
## Release vX.Y.Z 준비 완료

**Version:** X.Y.Z
**Date:** YYYY-MM-DD

### Changes
- [변경 사항 요약]

### Files Updated
- CHANGELOG.md
- package.json (있는 경우)

### Git
- Commit: [hash]
- Tag: vX.Y.Z

---
**Push 명령:**
```bash
git push && git push --tags
```
```

</execution>

<changelog_format>

## CHANGELOG.md 형식

[Keep a Changelog](https://keepachangelog.com/) 형식 준수:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2025-01-25

### Added
- 새로운 기능 A
- 새로운 기능 B

### Changed
- 기존 기능 수정

### Fixed
- 버그 수정

### Removed
- 제거된 기능
```

</changelog_format>

<examples>

### 예시 1: 패치 릴리스

```
User: /release patch

Claude: ## Release v1.2.4 준비 완료

**Version:** 1.2.3 → 1.2.4
**Date:** 2025-01-25

### Changes (3 commits)
- fix: 로그인 버튼 클릭 안됨 수정
- fix: 모달 z-index 문제 해결
- docs: README 업데이트

### Files Updated
- CHANGELOG.md
- package.json

### Git
- Commit: abc1234
- Tag: v1.2.4

---
**Push 명령:**
git push && git push --tags
```

### 예시 2: 직접 버전 지정

```
User: /release 2.0.0

Claude: ## Release v2.0.0 준비 완료

**Version:** 1.5.3 → 2.0.0
**Date:** 2025-01-25

### Changes (15 commits)
...
```

</examples>

<edge_cases>

## 예외 처리

### 버전 파일 없음

```markdown
⚠️ 버전 파일을 찾을 수 없습니다.

현재 버전을 0.0.0으로 가정합니다.
새 버전: 0.0.1 (patch)

계속할까요?
```

### 커밋 없음

```markdown
⚠️ 마지막 릴리스 이후 커밋이 없습니다.

릴리스를 취소하거나, 수동으로 CHANGELOG를 작성하세요.
```

### Working tree dirty

```markdown
⚠️ 커밋되지 않은 변경 사항이 있습니다.

먼저 커밋하거나 stash 하세요:
git stash
# 또는
git add -A && git commit -m "wip"
```

</edge_cases>
