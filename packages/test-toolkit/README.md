# @frontend-mcp-kit/test-toolkit

프론트엔드 테스트 자동화를 위한 MCP 서버입니다.

## 개요

Claude Code, Cursor 등 AI 도구와 함께 사용하여 테스트 실행, 결과 피드백, 커버리지 분석 등 AI가 직접 할 수 없는 테스트 자동화 기능을 제공합니다.

## 설치

```bash
# 로컬 빌드
pnpm build --filter @frontend-mcp-kit/test-toolkit
```

## 설정

### Claude Code

```bash
claude mcp add test-toolkit node /path/to/dist/index.js
```

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "test-toolkit": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

## 제공 Tools

### detect_test_environment

프로젝트의 테스트 프레임워크와 환경을 감지합니다.

**입력:**

- `projectPath` (optional): 프로젝트 경로 (기본값: 현재 디렉토리)

**출력:**

```json
{
  "framework": "jest",
  "hasTestingLibrary": true,
  "testFilePattern": "*.test.tsx",
  "configFile": "jest.config.ts"
}
```

### analyze_code

TypeScript/JavaScript 파일을 분석하여 exports와 dependencies를 추출합니다.

**입력:**

- `filePath`: 분석할 파일의 절대 경로

**출력:**

```json
{
  "fileName": "Button.tsx",
  "fileExtension": "tsx",
  "exports": [
    {
      "name": "Button",
      "type": "function",
      "params": [{ "name": "props", "type": "unknown" }],
      "returnType": "unknown"
    }
  ],
  "dependencies": ["react", "./styles"]
}
```

### scaffold_test

소스 파일 분석 후 테스트 작성에 필요한 정보를 제공합니다.

**입력:**

- `filePath`: 테스트를 생성할 소스 파일 경로
- `framework` (optional): 테스트 프레임워크 (vitest, jest, auto)

**출력:**

```json
{
  "testFilePath": "Button.test.tsx",
  "framework": "jest",
  "sourceFile": {
    "fileName": "Button.tsx",
    "fileExtension": "tsx",
    "exports": ["..."],
    "dependencies": ["..."]
  }
}
```

### analyze_component

React 컴포넌트를 분석하여 props, hooks, events 정보를 추출합니다.

**입력:**

- `filePath`: 분석할 React 컴포넌트 파일의 절대 경로

**출력:**

```json
{
  "componentName": "Button",
  "props": [
    { "name": "label", "type": "string", "required": true },
    { "name": "disabled", "type": "boolean", "required": false }
  ],
  "hooks": [
    { "name": "useState", "isCustom": false },
    { "name": "useQuery", "isCustom": true }
  ],
  "events": [{ "name": "onClick", "handlerName": "handleClick" }],
  "hasChildren": true,
  "isForwardRef": false,
  "isMemo": false
}
```

### find_similar_tests

프로젝트 내 유사한 테스트 파일을 검색하여 참고할 수 있도록 합니다.

**입력:**

- `filePath`: 테스트를 작성할 소스 파일의 절대 경로
- `maxResults` (optional): 반환할 최대 결과 수 (기본값: 5)

**출력:**

```json
{
  "sourceFile": "/path/to/Button.tsx",
  "similarTests": [
    {
      "filePath": "/path/to/IconButton.test.tsx",
      "similarity": "high",
      "reason": "같은 폴더의 유사한 컴포넌트 (IconButton)"
    },
    {
      "filePath": "/path/to/Card.test.tsx",
      "similarity": "medium",
      "reason": "같은 폴더의 테스트 파일"
    }
  ],
  "totalFound": 10
}
```

### suggest_a11y_tests

React 컴포넌트의 접근성 테스트 포인트를 분석하고 jest-axe 사용법을 제안합니다.

**입력:**

- `filePath`: 분석할 React 컴포넌트 파일의 절대 경로

**출력:**

```json
{
  "hasIssues": true,
  "suggestions": [
    {
      "type": "aria",
      "element": "button",
      "suggestion": "빈 button에 aria-label 또는 텍스트 콘텐츠 추가 필요"
    }
  ],
  "jestAxeExample": "expect(await axe(container)).toHaveNoViolations()"
}
```

### analyze_test_gaps

소스 파일과 테스트 파일을 비교하여 테스트되지 않은 함수를 식별합니다.

**입력:**

- `filePath`: 분석할 소스 파일의 절대 경로

**출력:**

```json
{
  "sourceFile": "/path/to/utils.ts",
  "testFile": "/path/to/utils.test.ts",
  "tested": ["formatDate", "parseJSON"],
  "untested": ["validateEmail", "debounce"]
}
```

### suggest_test_names

소스 파일 분석 기반으로 describe/it 블록 구조와 테스트 이름을 제안합니다.

**입력:**

- `filePath`: 분석할 소스 파일의 절대 경로

**출력:**

```json
[
  {
    "describe": "LoginForm",
    "tests": [
      "should render correctly",
      "should render with email prop",
      "should handle click event"
    ]
  }
]
```

### run_tests

테스트를 실행하고 결과를 반환합니다. AI 피드백 루프의 핵심 도구입니다.

**입력:**

- `testPath`: 실행할 테스트 파일 또는 폴더의 절대 경로
- `projectPath` (optional): 프로젝트 루트 경로 (미지정 시 자동 탐색)

**출력:**

```json
{
  "success": true,
  "framework": "vitest",
  "summary": {
    "total": 10,
    "passed": 9,
    "failed": 1,
    "skipped": 0,
    "duration": 1234
  },
  "results": [
    {
      "name": "should render correctly",
      "status": "passed",
      "duration": 15,
      "file": "/path/to/Button.test.tsx"
    },
    {
      "name": "should handle click",
      "status": "failed",
      "duration": 23,
      "file": "/path/to/Button.test.tsx",
      "error": "expected 1 to be 2"
    }
  ]
}
```

**사용 예시 (피드백 루프):**

```
AI: 테스트 코드 작성
AI: run_tests 호출 → MCP 실행
MCP: { success: false, results: [{ error: "expected 1 to be 2" }] }
AI: "아, 1이 아니라 2여야 하는구나" → 코드 수정
AI: run_tests 재호출
MCP: { success: true }
AI: "테스트 통과, 완료"
```

## 지원 프레임워크

- Vitest
- Jest

## 목표 워크플로우

```
1. AI: 테스트 코드 작성
2. MCP: 테스트 실행
3. MCP: 결과 반환 (passed/failed, 에러 메시지)
4. AI: 실패 원인 분석 및 수정
5. 반복...
```

## 개선 예정

- 실패 테스트 상세 정보 (expected/received/codeFrame)
- 커버리지 분석 (`analyze_coverage`)
- 프론트엔드 특화 기능 (Testing Library, 스토리북 연동 등)

## 설계 원칙

```
❌ AI가 이미 할 수 있는 것을 MCP가 대신함
✅ AI가 직접 할 수 없는 것을 MCP가 수행함
```

## 라이선스

MIT
