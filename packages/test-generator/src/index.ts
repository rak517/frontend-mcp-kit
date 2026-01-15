#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  detectTestEnvironmentSchema,
  runDetectTestEnvironment,
} from "./tools/detect-test-environment.js";
import { analyzeCodeSchema, runAnalyzeCode } from "./tools/analyze-code.js";
import { runScaffoldTest, scaffoldTestSchema } from "./tools/scaffold-test.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  analyzeComponentSchema,
  runAnalyzeComponent,
} from "./tools/analyze-component.js";
import {
  findSimilarTestsSchema,
  runFindSimilarTests,
} from "./tools/find-similar-tests.js";

const server = new McpServer({
  name: "test-generator",
  version: "0.0.1",
});

// Tool 1: 테스트 환경 감지
server.registerTool(
  "detect_test_environment",
  {
    description: "프로젝트의 테스트 프레임워크와 환경을 감지합니다",
    inputSchema: detectTestEnvironmentSchema,
  },
  runDetectTestEnvironment
);

// Tool 2: 코드 분석
server.registerTool(
  "analyze_code",
  {
    description:
      "TypeScript/JavaScript 파일을 분석하여 exports와 dependencies를 추출합니다",
    inputSchema: analyzeCodeSchema,
  },
  runAnalyzeCode
);

// Tool 3: 테스트 뼈대 정보 생성
server.registerTool(
  "scaffold_test",
  {
    description: "소스 파일 분석 후 테스트 작성에 필요한 정보를 제공합니다",
    inputSchema: scaffoldTestSchema,
  },
  runScaffoldTest
);

// Tool 4: React 컴포넌트 분석
server.registerTool(
  "analyze_component",
  {
    description:
      "React 컴포넌트를 분석하여 props, hooks, events 정보를 추출합니다",
    inputSchema: analyzeComponentSchema,
  },
  runAnalyzeComponent
);

// Tool 5: 유사 테스트 검색
server.registerTool(
  "find_similar_tests",
  {
    description:
      "프로젝트 내 유사한 테스트 파일을 검색하여 참고할 수 있도록 합니다",
    inputSchema: findSimilarTestsSchema,
  },
  runFindSimilarTests
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("test-generator MCP server running");
}

main().catch(console.error);
