import { z } from "zod";
import { absolutePathSchema } from "../schemas.js";
import { findProjectRoot, detectFramework } from "../utils/index.js";
import type { McpToolResponse } from "../types.js";

export const runTestsSchema = z.object({
  testPath: absolutePathSchema.describe(
    "실행할 테스트 파일 또는 폴더의 절대 경로"
  ),
  projectPath: z
    .string()
    .optional()
    .describe("프로젝트 루트 경로 (미지정 시 자동 탐색)"),
});

export type RunTestsInput = z.infer<typeof runTestsSchema>;

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  file?: string;
  line?: number;
}

export interface RunTestsOutput {
  success: boolean;
  framework: "vitest" | "jest" | "unknown";
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
}

export async function runTests(input: RunTestsInput): Promise<McpToolResponse> {
  const { testPath, projectPath } = input;

  const root = projectPath || findProjectRoot(testPath);
  if (!root) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "프로젝트 루트를 찾을 수 없습니다",
          }),
        },
      ],
    };
  }

  const framework = await detectFramework(root);
  if (framework === "unknown") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "테스트 프레임워크를 감지할 수 없습니다 (vitest/jest)",
          }),
        },
      ],
    };
  }

  // TODO: 다음 태스크에서 vitest/jest 실행 구현

  const result: RunTestsOutput = {
    success: true,
    framework,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
    results: [],
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
