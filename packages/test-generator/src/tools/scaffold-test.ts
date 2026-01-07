import { z } from "zod";
import { detectTestEnvironment } from "../detector.js";
import { analyzeCode } from "../analyzer.js";

export const scaffoldTestSchema = z.object({
  filePath: z.string().describe("테스트를 생성할 소스 파일 경로"),
  framework: z
    .enum(["vitest", "jest", "auto"])
    .optional()
    .default("auto")
    .describe("테스트 프레임워크 (기본값: auto)"),
});

export type ScaffoldTestInput = z.infer<typeof scaffoldTestSchema>;

export async function runScaffoldTest(input: ScaffoldTestInput) {
  const { filePath, framework } = input;

  // 프레임워크 감지
  let targetFramework = framework;
  if (framework === "auto") {
    const projectPath = filePath.substring(0, filePath.lastIndexOf("/"));
    const env = await detectTestEnvironment(projectPath);
    targetFramework = env.framework === "unknown" ? "vitest" : env.framework;
  }

  // 코드 분석
  const analysis = await analyzeCode(filePath);

  // 테스트 파일 경로 생성
  const testFilePath = filePath.replace(/\.(ts|tsx)$/, ".test.$1");

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
