import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { z } from "zod";
import { McpToolResponse, TestGapAnalysis } from "../types.js";
import { analyzeCode } from "../analyzer.js";

export const analyzeTestGapsSchema = z.object({
  filePath: z.string().describe("분석할 소스 파일의 절대 경로"),
});

export type AnalyzeTestGapsInput = z.infer<typeof analyzeTestGapsSchema>;

// 테스트 파일 경로 찾기
function findTestFile(sourceFile: string): string | null {
  const dir = dirname(sourceFile);
  const name = basename(sourceFile).replace(/\.(ts|tsx|js|jsx)$/, "");
  const ext = basename(sourceFile).match(/\.(ts|tsx|js|jsx)$/)?.[0] || ".ts";

  // 가능한 테스트 파일 경로들
  const candidates = [
    join(dir, `${name}.test${ext}`),
    join(dir, `${name}.spec${ext}`),
    join(dir, "__tests__", `${name}.test${ext}`),
    join(dir, "__tests__", `${name}.spec${ext}`),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

// 테스트 파일에서 테스트된 함수명 추출
async function extractTestedNames(testFilePath: string): Promise<string[]> {
  const content = await readFile(testFilePath, "utf-8");
  const testedNames: string[] = [];

  // describe("FunctionName", ...) 패턴
  const describeMatches = content.matchAll(/describe\s*\(\s*["']([^"']+)["']/g);
  for (const match of describeMatches) {
    testedNames.push(match[1]);
  }

  // it("should ... FunctionName", ...) 또는 test("FunctionName", ...) 패턴
  const testMatches = content.matchAll(/(?:it|test)\s*\(\s*["']([^"']+)["']/g);
  for (const match of testMatches) {
    testedNames.push(match[1]);
  }

  return testedNames;
}

// 이름이 테스트되었는지 확인
function isNameTested(exportName: string, testedNames: string[]): boolean {
  const lowerExportName = exportName.toLowerCase();
  return testedNames.some((tested) => {
    const lowerTested = tested.toLowerCase();
    return (
      lowerTested.includes(lowerExportName) ||
      lowerExportName.includes(lowerTested)
    );
  });
}

async function analyzeGaps(filePath: string): Promise<TestGapAnalysis> {
  const analysis = await analyzeCode(filePath);
  const testFile = findTestFile(filePath);

  const exportNames = analysis.exports.map((e) => e.name);

  if (!testFile) {
    return {
      sourceFile: filePath,
      testFile: null,
      tested: [],
      untested: exportNames,
    };
  }

  const testedNames = await extractTestedNames(testFile);
  const tested: string[] = [];
  const untested: string[] = [];

  for (const name of exportNames) {
    if (isNameTested(name, testedNames)) {
      tested.push(name);
    } else {
      untested.push(name);
    }
  }

  return {
    sourceFile: filePath,
    testFile,
    tested,
    untested,
  };
}

export async function runAnalyzeTestGaps(
  input: AnalyzeTestGapsInput
): Promise<McpToolResponse> {
  const { filePath } = input;
  const result = await analyzeGaps(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
