import { describe, it, expect } from "vitest";
import { runTestsSchema, runTests } from "../../tools/run-tests.js";
import { resolve } from "node:path";

describe("runTestsSchema", () => {
  describe("testPath validation", () => {
    it("should require testPath", () => {
      const result = runTestsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept valid absolute testPath", () => {
      const result = runTestsSchema.safeParse({
        testPath: "/path/to/test.ts",
      });
      expect(result.success).toBe(true);
    });

    it("should reject relative testPath", () => {
      const result = runTestsSchema.safeParse({
        testPath: "./test.ts",
      });
      expect(result.success).toBe(false);
    });

    it("should reject testPath without leading slash", () => {
      const result = runTestsSchema.safeParse({
        testPath: "path/to/test.ts",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("projectPath validation", () => {
    it("should accept optional projectPath", () => {
      const result = runTestsSchema.safeParse({
        testPath: "/path/to/test.ts",
        projectPath: "/path/to/project",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projectPath).toBe("/path/to/project");
      }
    });

    it("should work without projectPath", () => {
      const result = runTestsSchema.safeParse({
        testPath: "/path/to/test.ts",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projectPath).toBeUndefined();
      }
    });
  });
});

describe("runTests", () => {
  describe("response format", () => {
    it("should return McpToolResponse format", async () => {
      const result = await runTests({
        testPath: "/nonexistent/path/test.ts",
      });

      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty("type", "text");
      expect(result.content[0]).toHaveProperty("text");
    });

    it("should return valid JSON in text field", async () => {
      const result = await runTests({
        testPath: "/nonexistent/path/test.ts",
      });

      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should return error when project root not found", async () => {
      const result = await runTests({
        testPath: "/nonexistent/path/test.ts",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("프로젝트 루트");
    });

    it("should return error when framework unknown", async () => {
      const result = await runTests({
        testPath: "/tmp/test.ts",
        projectPath: "/tmp",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("테스트 프레임워크");
    });
  });

  describe("vitest execution", () => {
    it("should detect vitest framework", async () => {
      const testPath = resolve(
        process.cwd(),
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runTests({ testPath });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.framework).toBe("vitest");
    }, 30000);

    it("should return success for passing tests", async () => {
      const testPath = resolve(
        process.cwd(),
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runTests({ testPath });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
    }, 30000);

    it("should return summary with test counts", async () => {
      const testPath = resolve(
        process.cwd(),
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runTests({ testPath });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.summary).toHaveProperty("total");
      expect(parsed.summary).toHaveProperty("passed");
      expect(parsed.summary).toHaveProperty("failed");
      expect(parsed.summary).toHaveProperty("skipped");
      expect(parsed.summary).toHaveProperty("duration");
      expect(parsed.summary.total).toBeGreaterThan(0);
    }, 30000);

    it("should return individual test results", async () => {
      const testPath = resolve(
        process.cwd(),
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runTests({ testPath });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.results.length).toBeGreaterThan(0);

      const firstResult = parsed.results[0];
      expect(firstResult).toHaveProperty("name");
      expect(firstResult).toHaveProperty("status");
      expect(firstResult).toHaveProperty("duration");
      expect(firstResult).toHaveProperty("file");
    }, 30000);

    it("should use provided projectPath", async () => {
      const projectPath = process.cwd();
      const testPath = resolve(
        projectPath,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runTests({ testPath, projectPath });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      expect(parsed.framework).toBe("vitest");
    }, 30000);
  });
});
