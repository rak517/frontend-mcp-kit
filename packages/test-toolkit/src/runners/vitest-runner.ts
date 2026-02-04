import { spawn } from "node:child_process";
import { RunTestsOutput, TestResult } from "../tools/run-tests.js";

interface VitestAssertionResult {
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  failureMessages?: string[];
}

interface VitestTestResult {
  name: string;
  assertionResults: VitestAssertionResult[];
}

interface VitestJsonOutput {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  success: boolean;
  testResults: VitestTestResult[];
}

export async function runVitest(
  testPath: string,
  projectRoot: string
): Promise<RunTestsOutput> {
  return new Promise((resolve) => {
    const args = ["vitest", "run", "--reporter=json", testPath];
    const child = spawn("npx", args, {
      cwd: projectRoot,
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", () => {
      try {
        const json: VitestJsonOutput = JSON.parse(stdout);
        const results: TestResult[] = [];

        for (const testFile of json.testResults) {
          for (const assertion of testFile.assertionResults) {
            results.push({
              name: assertion.title,
              status:
                assertion.status === "pending" ? "skipped" : assertion.status,
              duration: assertion.duration,
              file: testFile.name,
              error: assertion.failureMessages?.[0],
            });
          }
        }

        resolve({
          success: json.success,
          framework: "vitest",
          summary: {
            total: json.numTotalTests,
            passed: json.numPassedTests,
            failed: json.numFailedTests,
            skipped: json.numPendingTests,
            duration: results.reduce((sum, r) => sum + r.duration, 0),
          },
          results,
        });
      } catch {
        resolve({
          success: false,
          framework: "vitest",
          summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
          results: [],
          error: stderr || "vitest 실행 중 오류 발생",
        });
      }
    });
  });
}
