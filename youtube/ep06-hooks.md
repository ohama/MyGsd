# EP06: Hooks 이벤트 스크립트

## 메타 정보

| 항목 | 내용 |
|------|------|
| 영상 길이 | 7-9분 |
| 대상 | Claude Code 사용자 |
| 핵심 메시지 | Hook은 이벤트에 반응하는 Node.js 스크립트다 |

---

## 인트로 (30초)

**[화면: 세션 시작 시 스크립트 실행 장면]**

> .claude/ 시리즈 여섯 번째 영상입니다.
> 오늘은 **Hooks**를 다룹니다.
>
> 세션이 시작될 때 자동으로 뭔가 실행하고 싶었던 적 있으시죠?
> "업데이트 있는지 확인", "환경 설정 체크"...
>
> Hook으로 가능합니다. **Node.js 스크립트**를 이벤트에 연결하는 거죠.

---

## 본론 1: Hook vs Agent (1분)

**[화면: 비교 테이블]**

| | Hook | Agent |
|--|------|-------|
| 실행 환경 | Node.js | AI 모델 |
| 지능 | 정해진 로직 | 판단하며 실행 |
| 속도 | 빠름 | 느림 |
| 비용 | 무료 | API 토큰 |

> 핵심 원칙: **"단순한 건 Hook, 판단이 필요한 건 Agent"**
>
> 버전 체크? Node.js로 충분합니다. Hook으로.
> 코드 분석 후 계획 수립? AI가 필요합니다. Agent로.

---

## 본론 2: Hook 등록하기 (1분 30초)

**[화면: settings.json 예시]**

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
  }
}
```

> `settings.json`에서 이벤트별로 등록합니다.

### 지원 이벤트

| 이벤트 | 발생 시점 |
|--------|-----------|
| `SessionStart` | 세션 시작 |

> 현재는 `SessionStart`만 지원됩니다.
> 세션 시작할 때 실행할 스크립트를 등록하는 거죠.

### statusLine (특수 훅)

```json
{
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/statusline.js"
  }
}
```

> 상태줄은 별도로 등록합니다.
> 이 스크립트는 **주기적으로** 실행되어 상태줄을 업데이트합니다.

---

## 본론 3: 업데이트 체크 Hook 만들기 (2분)

**[화면: 코드 작성 장면]**

> 세션 시작 시 업데이트를 체크하는 훅을 만들어볼게요.

### 목표

```
세션 시작
    ↓
현재 버전 vs 최신 버전 비교
    ↓
업데이트 있으면 알림
```

### 핵심 코드

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

// 캐시 설정 (24시간마다 한 번만 체크)
const cacheDir = path.join(os.homedir(), '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'update-check.json');
const CACHE_TTL = 24 * 60 * 60; // 24시간 (초)

// 캐시 유효성 확인
function isCacheValid() {
  if (!fs.existsSync(cacheFile)) return false;
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  const age = Math.floor(Date.now() / 1000) - (cache.checked || 0);
  return age < CACHE_TTL;
}

// 캐시 유효하면 건너뛰기
if (isCacheValid()) {
  process.exit(0);
}

// 백그라운드에서 체크 (세션 시작을 블로킹하지 않음)
const child = spawn(process.execPath, [__dirname + '/check-update-bg.js'], {
  stdio: 'ignore',
  detached: true
});
child.unref();
```

### 설계 포인트

**[화면: 포인트별 하이라이트]**

#### 1. 캐시 TTL

> 24시간마다 한 번만 체크합니다.
> 매번 네트워크 요청하면 세션 시작이 느려지니까요.

#### 2. 백그라운드 실행

```javascript
const child = spawn(..., { detached: true });
child.unref();
```

> `detached: true`와 `unref()`로 메인 프로세스와 분리합니다.
> 세션 시작을 **블로킹하지 않아요**.

#### 3. Graceful fallback

> 네트워크 오류나면 그냥 조용히 실패합니다.
> Hook 오류가 세션을 망가뜨리면 안 되니까요.

---

## 본론 4: 상태줄 Hook (1분 30초)

**[화면: 상태줄 스크린샷]**

```
⬆ Opus4.5 │ Writing tests │ P03/07 45% │ ~/project │ ███░░ 30%
```

> 상태줄에 이런 정보를 표시하는 훅입니다.

### 표시 항목

| 항목 | 의미 |
|------|------|
| ⬆ | 업데이트 가능 |
| Opus4.5 | 현재 모델 |
| P03/07 45% | Phase 진행률 |
| ███░░ 30% | 컨텍스트 사용률 |

### 입력/출력

```javascript
// stdin으로 JSON 받음
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const data = JSON.parse(input);
  // data.model, data.cwd, data.context_window

  // stdout으로 상태줄 출력
  process.stdout.write(buildStatusLine(data));
});
```

> Claude Code가 JSON으로 현재 상태를 전달하고,
> 스크립트가 상태줄 문자열을 반환합니다.

### 색상 표시

```javascript
const green = s => `\x1b[32m${s}\x1b[39m`;
const yellow = s => `\x1b[33m${s}\x1b[39m`;
const red = s => `\x1b[31m${s}\x1b[39m`;

function colorByPercent(percent) {
  if (percent >= 90) return red;
  if (percent >= 70) return yellow;
  return green;
}
```

> ANSI 이스케이프 코드로 터미널 색상을 적용합니다.

---

## 본론 5: Hook 작성 팁 (1분)

**[화면: 팁 카드]**

### 1. shebang 필수

```javascript
#!/usr/bin/env node
```

> 첫 줄에 꼭 넣어주세요.

### 2. 빠르게 종료

> Hook은 세션 시작을 블로킹합니다.
> 오래 걸리는 작업은 `spawn + detached + unref`로 백그라운드 처리.

### 3. 오류 조용히 처리

```javascript
try {
  // 메인 로직
} catch (err) {
  // 로깅만 하고 종료
  console.error(err);
}
```

> Hook 오류가 세션을 망가뜨리면 안 됩니다.

### 4. 캐시 활용

```javascript
const CACHE_TTL = 24 * 60 * 60;
if (isCacheValid()) process.exit(0);
```

> 불필요한 반복 실행을 막습니다.

---

## 아웃트로 (30초)

**[화면: 정리]**

> 오늘 배운 내용입니다.
>
> 1. Hook은 이벤트에 반응하는 Node.js 스크립트
> 2. settings.json에서 이벤트별로 등록
> 3. 백그라운드 실행으로 세션 블로킹 방지
> 4. 캐시로 불필요한 실행 방지
>
> 다음 영상, 마지막 영상에서는
> 지금까지 배운 걸 **실전 활용 사례**로 정리합니다.
>
> 구독과 좋아요 부탁드립니다!

---

## 편집 노트

- 상태줄은 실제 터미널 녹화
- 코드는 핵심 부분만 하이라이트
- 색상 예시는 실제 터미널 색상으로
