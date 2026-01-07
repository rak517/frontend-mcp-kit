#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  detectTestEnvironmentSchema,
  runDetectTestEnvironment,
} from "./tools/detect-test-environment.js";
import { analyzeCodeSchema, runAnalyzeCode } from "./tools/analyze-code.js";
import { runScaffoldTest, scaffoldTestSchema } from "./tools/scaffold-test.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("test-generator MCP server running");
}

main().catch(console.error);
