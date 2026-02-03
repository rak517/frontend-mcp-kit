# @frontend-mcp-kit/test-generator

프론트엔드 개발자의 테스트 작성 DX를 향상시키는 MCP 서버입니다.

## 개요

Claude Code, Cursor 등 AI 도구와 함께 사용하여 테스트 환경 감지, 코드 분석, 테스트 파일 생성에 필요한 정보를 제공합니다.

## 설치

```bash
# 로컬 빌드
pnpm build --filter @frontend-mcp-kit/test-generator
```

## 설정

### Claude Code

```bash
claude mcp add test-generator node /path/to/dist/index.js
```

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "test-generator": {
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

## 지원 프레임워크

- Vitest
- Jest

## 현재 한계점

### 메타데이터 중심의 분석

현재 버전은 코드의 **메타데이터**(export 이름, 의존성 목록 등)만 제공합니다. AI가 실제로 테스트를 작성하려면 소스 코드를 직접 읽어야 하며, MCP가 제공하는 정보만으로는 충분하지 않습니다.

```
현재 워크플로우:
1. MCP: 메타데이터 제공 (export 이름, 의존성)
2. AI: 소스 코드 직접 읽기 (추가 작업 필요)
3. AI: 테스트 코드 작성
```

### 테스트 실행 불가

MCP는 분석 기능만 제공하며, 테스트를 직접 실행하거나 결과를 확인할 수 없습니다. AI는 테스트가 통과하는지 확인할 방법이 없어 피드백 루프가 끊어집니다.

### AI가 이미 할 수 있는 것과 중복

- 코드 분석: AI가 소스 파일을 읽으면 직접 분석 가능
- 테스트 이름 제안: AI가 코드를 이해하면 더 맥락에 맞는 이름 생성 가능
- 환경 감지: `package.json`을 읽으면 AI가 직접 판단 가능

## 개선 방향

### 테스트 실행 및 피드백 루프

현재 MCP는 분석만 가능하고 실행은 불가능합니다. 향후 AI가 직접 할 수 없는 **"테스트 실행 → 결과 피드백"** 기능을 추가하여 아래와 같은 워크플로우를 지원할 예정입니다.

```
목표 워크플로우:
1. AI: 테스트 코드 작성
2. MCP: 테스트 실행
3. MCP: 결과 반환 (passed/failed, 에러 메시지)
4. AI: 실패 원인 분석 및 수정
5. 반복...
```

### 프론트엔드 특화

일반적인 테스트 MCP가 아닌, React/Vue 등 프론트엔드 생태계에 최적화된 기능을 제공할 예정입니다.

## 설계 원칙

```
❌ AI가 이미 할 수 있는 것을 MCP가 대신함
✅ AI가 직접 할 수 없는 것을 MCP가 수행함
```

## 라이선스

MIT
