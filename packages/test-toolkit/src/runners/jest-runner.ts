import { spawn } from "node:child_process";
import { RunTestsOutput, TestResult } from "../tools/run-tests.js";

interface JestAssertionResult {
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  failureMessages?: string[];
}

interface JestTestResult {
  name: string;
  assertionResults: JestAssertionResult[];
}

interface JestJsonOutput {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  success: boolean;
  testResults: JestTestResult[];
}

export async function runJest(
  testPath: string,
  projectRoot: string
): Promise<RunTestsOutput> {
  return new Promise((resolve) => {
    const args = ["jest", "--json", testPath];
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
        const json: JestJsonOutput = JSON.parse(stdout);
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
          framework: "jest",
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
          framework: "jest",
          summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
          results: [],
          error: stderr || "jest 실행 중 오류 발생",
        });
      }
    });
  });
}
