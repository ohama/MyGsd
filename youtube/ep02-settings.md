# EP02: Settings 설정 파일

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 6-8분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | settings.json은 공유, settings.local.json은 로컬 전용 |

---

## 인트로 (20초)

**[화면: 두 개의 JSON 파일 아이콘]**

> .claude/ 시리즈 두 번째 영상입니다.
> 오늘은 **설정 파일 두 개**의 차이점과 활용법을 알아봅니다.
>
> 왜 굳이 두 개로 나눠놨을까요?

---

## 본론 1: 두 파일의 역할 (1분)

**[화면: 테이블 그래픽]**

| 파일 | Git | 용도 |
|------|-----|------|
| `settings.json` | 공유됨 | hooks, 상태줄 |
| `settings.local.json` | gitignore | 권한 설정 |

> `settings.json`은 팀원 모두가 공유하는 설정입니다.
> 세션 시작 시 실행할 훅, 상태줄에 뭘 보여줄지 정의합니다.
>
> `settings.local.json`은 **내 컴퓨터에서만** 적용되는 설정입니다.
> 주로 **권한**을 정의합니다. "이 bash 명령어 실행해도 돼" 같은 거죠.
>
> 왜 분리할까요?
> 팀원 A는 npm 프로젝트를 하고, B는 dotnet 프로젝트를 합니다.
> 허용할 명령어가 다르죠. 그래서 권한은 로컬에 둡니다.

---

## 본론 2: settings.json 실전 예시 (2분)

**[화면: JSON 코드 하이라이트]**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/check-update.js"
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/statusline.js"
  }
}
```

> 실제 사용 예시를 볼까요.

### hooks 섹션

> `hooks`는 특정 이벤트에 실행할 명령을 정의합니다.
>
> 여기서 `SessionStart`는 Claude Code 세션이 시작될 때 실행됩니다.
> 저는 버전 업데이트 체크 스크립트를 등록해뒀어요.

**[화면: 세션 시작 → 스크립트 실행 흐름도]**

### statusLine 섹션

> `statusLine`은 Claude Code 하단 상태줄에 정보를 표시합니다.
>
> 이 스크립트가 주기적으로 실행되면서 현재 작업 상태, 컨텍스트 사용률 같은 걸 보여줍니다.

**[화면: 상태줄 스크린샷]**

```
Opus4.5 │ P03/07 45% │ ~/project │ ███░░ 30%
```

---

## 본론 3: settings.local.json 실전 예시 (2분)

**[화면: JSON 코드]**

```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(npm run *)",
      "Skill(commit)",
      "Skill(push)"
    ]
  }
}
```

> `settings.local.json`은 주로 **permissions**를 정의합니다.

### 권한 패턴 이해하기

**[화면: 패턴별 설명 테이블]**

| 패턴 | 의미 |
|------|------|
| `Bash(git add *)` | git add 명령 허용 |
| `Bash(npm run *)` | npm 스크립트 실행 허용 |
| `Skill(commit)` | /commit 스킬 허용 |

> 별표(*)는 와일드카드입니다.
> `git add *`는 `git add .`도, `git add file.js`도 다 허용한다는 뜻이에요.

### 자동 생성

> 이 파일을 직접 만들 필요는 없습니다.
> Claude Code가 권한을 요청할 때 "Allow"를 누르면 자동으로 추가됩니다.
>
> 다만, 팀 프로젝트에서 미리 정의해두면 매번 허용 안 눌러도 되겠죠.

---

## 본론 4: 설정 우선순위 (1분)

**[화면: 계층 다이어그램]**

```
settings.local.json (높은 우선순위)
        ↓ 덮어씀
settings.json (기본)
```

> 두 파일에 같은 키가 있으면 어떻게 될까요?
>
> `settings.local.json`이 이깁니다.
> 로컬 설정이 공유 설정을 **덮어씁니다**.

### 예시

```json
// settings.json
{ "statusLine": { "command": "node shared-status.js" } }

// settings.local.json
{ "statusLine": { "command": "node my-status.js" } }
```

> 이 경우 `my-status.js`가 실행됩니다.

---

## 본론 5: 최소 설정으로 시작하기 (1분)

**[화면: 빈 JSON 파일]**

> 처음에는 빈 파일로 시작해도 됩니다.

```json
{}
```

> 진짜 이게 끝이에요.
> 필요할 때 하나씩 추가하면 됩니다.

### 추천 시작 설정

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started!'"
          }
        ]
      }
    ]
  }
}
```

> 이렇게 간단한 echo부터 시작해서, 점점 복잡한 스크립트로 발전시키세요.

---

## 아웃트로 (30초)

**[화면: 다음 에피소드 미리보기]**

> 오늘은 설정 파일 두 개의 역할을 알아봤습니다.
>
> - `settings.json`: 팀 공유 설정 (hooks, statusLine)
> - `settings.local.json`: 내 컴퓨터 전용 (permissions)
>
> 다음 영상에서는 **Commands**, 슬래시 명령어를 직접 만들어봅니다.
> `/commit`, `/push` 같은 명령어를 어떻게 정의하는지 알려드릴게요.
>
> 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- JSON 코드는 syntax highlighting 적용
- 설정 우선순위는 애니메이션으로 덮어쓰기 시각화
- 상태줄 스크린샷은 실제 터미널 캡처
