# Chapter 2: Settings 설정

## 두 개의 설정 파일

| 파일 | 공유 | 용도 |
|------|------|------|
| `settings.json` | O (git tracked) | hooks, statusLine 등 공통 설정 |
| `settings.local.json` | X (gitignored) | 프로젝트별 권한, 허용 명령 |

## settings.json

프로젝트의 공유 설정 파일이다. 모든 협업자(또는 submodule 사용 프로젝트)에게 동일하게 적용된다.

### 실제 예시

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/gsd-check-update.js"
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/gsd-statusline.js"
  }
}
```

### hooks 설정

`hooks`는 특정 이벤트 발생 시 실행할 명령을 정의한다.

```json
{
  "hooks": {
    "<이벤트명>": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "<실행할 명령>"
          }
        ]
      }
    ]
  }
}
```

**지원 이벤트:**

| 이벤트 | 발생 시점 |
|--------|-----------|
| `SessionStart` | Claude Code 세션 시작 시 |

**예시: 세션 시작 시 버전 체크**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/gsd-check-update.js"
          }
        ]
      }
    ]
  }
}
```

### statusLine 설정

Claude Code 하단 상태 표시줄에 표시할 정보를 정의한다.

```json
{
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/gsd-statusline.js"
  }
}
```

이 명령은 주기적으로 실행되어 현재 프로젝트 상태(진행 중인 phase, 프로젝트명 등)를 상태줄에 표시한다.

## settings.local.json

프로젝트별 로컬 설정이다. `.gitignore`에 포함되어 공유되지 않는다.

주로 **권한(permissions)** 을 정의하여 Claude Code가 특정 bash 명령, 스킬, 웹 접근을 할 수 있도록 허용한다.

### 구조

```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(npm run *)",
      "Skill(commit)",
      "Skill(push)",
      "WebFetch(github.com:*)"
    ]
  }
}
```

### 권한 패턴

| 패턴 | 설명 |
|------|------|
| `Bash(git add *)` | `git add` 명령 허용 |
| `Bash(git commit *)` | `git commit` 명령 허용 |
| `Bash(npm run *)` | npm 스크립트 실행 허용 |
| `Skill(commit)` | `/commit` 스킬 실행 허용 |
| `WebFetch(github.com:*)` | GitHub 웹 접근 허용 |

### 실제 예시 (LangTutorial 프로젝트)

```json
{
  "permissions": {
    "allow": [
      "Bash(git add .claude)",
      "Bash(git commit -m \"chore: update .claude submodule\")",
      "Bash(git submodule update --remote .claude)",
      "Bash(cd .claude && git fetch origin)",
      "Bash(cd .claude && git pull origin master)",
      "Bash(ls -la .claude/)",
      "Skill(commit)",
      "Skill(push)",
      "Skill(release)",
      "Skill(claude-config)"
    ]
  }
}
```

### 왜 분리하는가?

- `settings.json`: 모든 프로젝트에서 동일한 기본 동작 (hooks, 상태줄)
- `settings.local.json`: 프로젝트마다 다른 권한 (dotnet 프로젝트는 `dotnet` 허용, node 프로젝트는 `npm` 허용)

## 설정 우선순위

`settings.local.json`이 `settings.json`보다 우선한다.
동일한 키가 있으면 local이 덮어쓴다.

## 최소 설정으로 시작하기

처음에는 빈 `settings.json`으로 시작해도 된다:

```json
{}
```

필요에 따라 hooks, statusLine을 추가한다.
`settings.local.json`은 Claude Code가 권한을 요청할 때 자동으로 생성/업데이트되기도 한다.

## 다음 장

- [Chapter 3: Commands 슬래시 명령어](03-commands.md)
