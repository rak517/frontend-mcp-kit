import { spawn } from "node:child_process";
import type { RunTestsOutput, TestResult } from "../tools/run-tests.js";
import { NPX_BIN } from "../utils/constants.js";
import { parseErrorMessage } from "../utils/parse-error-message.js";

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
    let settled = false;
    const finish = (payload: RunTestsOutput) => {
      if (settled) return;
      settled = true;
      resolve(payload);
    };

    const args = ["vitest", "run", "--reporter=json", testPath];
    const child = spawn(NPX_BIN, args, {
      cwd: projectRoot,
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
              location: { file: testFile.name },
              error: assertion.failureMessages?.[0]
                ? parseErrorMessage(assertion.failureMessages[0])
                : undefined,
            });
          }
        }

        finish({
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
        finish({
          success: false,
          framework: "vitest",
          summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
          results: [],
          error: stderr || "vitest 실행 중 오류 발생",
        });
      }
    });

    child.on("error", (error) => {
      finish({
        success: false,
        framework: "vitest",
        summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
        results: [],
        error: error.message,
      });
    });
  });
}
