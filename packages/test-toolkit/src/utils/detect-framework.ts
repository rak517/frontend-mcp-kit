import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TestFramework } from "../types.js";
import { VITEST_CONFIGS, JEST_CONFIGS } from "./constants.js";

export async function detectFramework(
  projectPath: string
): Promise<TestFramework> {
  for (const config of VITEST_CONFIGS) {
    if (existsSync(join(projectPath, config))) {
      return "vitest";
    }
  }

  for (const config of JEST_CONFIGS) {
    if (existsSync(join(projectPath, config))) {
      return "jest";
    }
  }

  try {
    const pkgPath = join(projectPath, "package.json");
    const content = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(content);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps["vitest"]) return "vitest";
    if (deps["jest"]) return "jest";
  } catch {
    // 무시
  }

  return "unknown";
}
