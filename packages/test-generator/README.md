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

## 지원 프레임워크

- Vitest
- Jest

## 라이선스

MIT
