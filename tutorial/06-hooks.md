# Chapter 6: Hooks (훅)

## Hooks란?

Hooks는 **이벤트 발생 시 자동 실행되는 스크립트**다.
Claude Code 세션의 특정 시점에 Node.js 스크립트를 실행하여 자동화를 구현한다.

```
Command  → 사용자가 실행
Skill    → Claude가 자동 적용하는 규칙
Agent    → AI 서브프로세스
Hook     → 이벤트 트리거 스크립트 (Node.js)
```

### 핵심 차이: Agent vs Hook

| 항목 | Agent | Hook |
|------|-------|------|
| 실행 환경 | AI 모델 (Claude) | Node.js 런타임 |
| 지능 | AI가 판단하며 실행 | 정해진 로직만 실행 |
| 속도 | 느림 (AI 추론 필요) | 빠름 (직접 실행) |
| 용도 | 복잡한 분석/생성 | 단순 자동화/데이터 수집 |
| 비용 | API 토큰 소비 | 무료 |

**원칙: "단순한 건 Hook, 판단이 필요한 건 Agent"**

## Hook 등록 방법

`settings.json`에 이벤트별로 등록한다:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/my-hook.js"
          }
        ]
      }
    ]
  }
}
```

### 지원 이벤트

| 이벤트 | 발생 시점 | 용도 |
|--------|-----------|------|
| `SessionStart` | 세션 시작 | 버전 체크, 환경 초기화 |

### statusLine (특수 훅)

상태줄은 별도 설정으로 등록한다:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node .claude/hooks/statusline.js"
  }
}
```

statusLine 스크립트는 **주기적으로 실행**되어 상태줄에 정보를 표시한다.

## 실전 예시 1: gsd-check-update.js

세션 시작 시 GSD 업데이트를 확인하는 훅.

### 동작 흐름

```
세션 시작
  │
  ├─ 캐시 확인 (24시간 TTL)
  │   ├─ 유효 → 종료 (중복 체크 방지)
  │   └─ 만료 → 계속
  │
  ├─ 현재 버전 읽기 (.claude/get-shit-done/VERSION)
  │
  ├─ npm에서 최신 버전 조회 (백그라운드)
  │
  └─ 결과를 캐시에 저장
      └─ ~/.claude/cache/gsd-update-check.json
```

### 핵심 코드 패턴

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'gsd-update-check.json');
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24시간

// 캐시 유효성 확인
function isCacheValid() {
  if (!fs.existsSync(cacheFile)) return false;
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  const age = Math.floor(Date.now() / 1000) - (cache.checked || 0);
  return age < CACHE_TTL_SECONDS;
}

// 캐시가 유효하면 건너뛰기
if (isCacheValid()) process.exit(0);

// 백그라운드에서 체크 (세션 시작을 블로킹하지 않음)
const child = spawn(process.execPath, ['-e', `
  // npm에서 최신 버전 조회
  const latest = execSync('npm view get-shit-done-cc version').trim();

  // 결과 캐시에 저장
  fs.writeFileSync(cacheFile, JSON.stringify({
    update_available: compareVersions(installed, latest),
    installed, latest,
    checked: Math.floor(Date.now() / 1000)
  }));
`], { stdio: 'ignore', detached: true });

child.unref(); // 메인 프로세스와 분리
```

### 설계 포인트

1. **캐시 TTL**: 24시간마다 한 번만 체크 (불필요한 네트워크 요청 방지)
2. **백그라운드 실행**: `spawn` + `detached` + `unref()`로 세션 시작을 블로킹하지 않음
3. **Graceful fallback**: 네트워크 오류 시 조용히 실패

## 실전 예시 2: gsd-statusline.js

상태줄에 프로젝트 정보를 표시하는 훅.

### 표시 항목

```
⬆ Opus4.5 │ Writing tests │ P03/07 45% │ ~/project │ ███░░ 30% │ 5h 15% │ 7d 8%
```

| 항목 | 소스 | 설명 |
|------|------|------|
| `⬆` | update cache | GSD 업데이트 가능 |
| `Opus4.5` | stdin (model) | 현재 모델 |
| `Writing tests` | todos JSON | 진행 중 태스크 |
| `P03/07 45%` | STATE.md | GSD phase 진행률 |
| `~/project` | stdin (cwd) | 작업 디렉토리 |
| `███░░ 30%` | stdin (context) | 컨텍스트 윈도우 사용률 |
| `5h 15%` | API | 5시간 사용량 |
| `7d 8%` | API | 7일 사용량 |

### 입력/출력

statusLine 스크립트는 **stdin으로 JSON을 받고 stdout으로 결과를 출력**한다:

```javascript
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  const data = JSON.parse(input);
  // data.model, data.cwd, data.context_window 등

  const output = buildStatusLine(data);
  process.stdout.write(output);
});
```

### 색상 표시

ANSI 이스케이프 코드로 터미널 색상을 적용한다:

```javascript
const green  = s => `\x1b[32m${s}\x1b[39m`;
const yellow = s => `\x1b[33m${s}\x1b[39m`;
const red    = s => `\x1b[31m${s}\x1b[39m`;
const dim    = s => `\x1b[2m${s}\x1b[22m`;

// 사용량에 따라 색상 변경
function colorByPercent(percent) {
  if (percent >= 90) return red;
  if (percent >= 70) return yellow;
  return green;
}
```

## Hook 작성 가이드

### 1. 항상 `#!/usr/bin/env node` 으로 시작

```javascript
#!/usr/bin/env node
```

### 2. 빠르게 종료한다

Hook은 세션 시작이나 상태줄 갱신을 블로킹하므로 가능한 빠르게 실행해야 한다.
오래 걸리는 작업은 `spawn` + `detached` + `unref()`로 백그라운드 처리한다.

### 3. 캐시를 활용한다

```javascript
const CACHE_TTL = 24 * 60 * 60; // 24시간
const cacheFile = path.join(os.homedir(), '.claude', 'cache', 'my-cache.json');

if (isCacheValid()) process.exit(0); // 캐시 유효하면 건너뛰기
```

### 4. 오류를 조용히 처리한다

Hook 오류가 세션을 망가뜨리면 안 된다:

```javascript
try {
  // 메인 로직
} catch (err) {
  // 로깅만 하고 종료
  logger.error('hook-name', 'Error', err);
}
```

### 5. 로거를 활용한다

```javascript
let logger;
try {
  logger = require('./gsd-logger');
} catch {
  logger = { info: () => {}, error: () => {}, debug: () => {} };
}
```

## Hook 파일 배치

```
.claude/hooks/
├── gsd-check-update.js   # SessionStart 훅
├── gsd-statusline.js     # statusLine 훅
├── gsd-config.js         # 설정 유틸리티 (다른 훅에서 require)
└── gsd-logger.js         # 로깅 유틸리티
```

- 훅 파일은 `hooks/` 디렉토리에 배치
- 유틸리티 파일도 같은 디렉토리에 두어 `require('./gsd-logger')` 가능

## 다음 장

- [Chapter 7: 실전 활용 사례](07-practical-examples.md)
