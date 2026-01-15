import { z } from "zod";
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { detectTestEnvironment } from "../detector.js";
import { analyzeCode } from "../analyzer.js";
import type { McpToolResponse } from "../types.js";

// package.json을 찾을 때까지 상위 폴더 탐색
function findProjectRoot(filePath: string): string {
  const root = parse(filePath).root;
  let dir = dirname(filePath);
  while (dir !== root) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return dirname(filePath);
}

export const scaffoldTestSchema = z.object({
  filePath: z.string().describe("테스트를 생성할 소스 파일 경로"),
  framework: z
    .enum(["vitest", "jest", "auto"])
    .optional()
    .default("auto")
    .describe("테스트 프레임워크 (기본값: auto)"),
});

export type ScaffoldTestInput = z.infer<typeof scaffoldTestSchema>;

export async function runScaffoldTest(
  input: ScaffoldTestInput
): Promise<McpToolResponse> {
  const { filePath, framework } = input;

  // 프레임워크 감지
  let targetFramework: string = framework;
  if (framework === "auto") {
    const projectPath = findProjectRoot(filePath);
    const env = await detectTestEnvironment(projectPath);
    targetFramework = env.framework; // unknown이면 그대로 반환 (AI가 판단)
  }

  // 코드 분석
  const analysis = await analyzeCode(filePath);

  // 테스트 파일 경로 생성
  const testFilePath = filePath.replace(/\.(ts|tsx|js|jsx)$/, ".test.$1");

  // AI에게 전달할 정보만 반환
  const result = {
    testFilePath,
    framework: targetFramework,
    sourceFile: {
      fileName: analysis.fileName,
      fileExtension: analysis.fileExtension,
      exports: analysis.exports,
      dependencies: analysis.dependencies,
    },
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
