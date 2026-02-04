import { describe, it, expect } from "vitest";
import { findProjectRoot } from "../../utils/find-project-root.js";
import { resolve, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

describe("findProjectRoot", () => {
  describe("with existing project", () => {
    it("should find project root from current directory", () => {
      const result = findProjectRoot(process.cwd());
      expect(result).toBe(process.cwd());
    });

    it("should find project root from subdirectory", () => {
      const subdir = resolve(process.cwd(), "src");
      const result = findProjectRoot(subdir);
      expect(result).toBe(process.cwd());
    });

    it("should find project root from deep subdirectory", () => {
      const deepDir = resolve(process.cwd(), "src/__tests__/tools");
      const result = findProjectRoot(deepDir);
      expect(result).toBe(process.cwd());
    });

    it("should find project root from file path", () => {
      const filePath = resolve(process.cwd(), "src/index.ts");
      const result = findProjectRoot(filePath);
      expect(result).toBe(process.cwd());
    });
  });

  describe("with temporary directory", () => {
    let tempDir: string;

    it("should find root when package.json exists", () => {
      tempDir = mkdtempSync(join(tmpdir(), "test-"));
      writeFileSync(join(tempDir, "package.json"), "{}");
      mkdirSync(join(tempDir, "src"));

      const result = findProjectRoot(join(tempDir, "src"));
      expect(result).toBe(tempDir);

      rmSync(tempDir, { recursive: true });
    });

    it("should return null when no package.json found", () => {
      tempDir = mkdtempSync(join(tmpdir(), "test-"));
      mkdirSync(join(tempDir, "src"));

      const result = findProjectRoot(join(tempDir, "src"));
      expect(result).toBeNull();

      rmSync(tempDir, { recursive: true });
    });
  });

  describe("edge cases", () => {
    it("should return null for nonexistent path", () => {
      const result = findProjectRoot("/nonexistent/path/that/does/not/exist");
      expect(result).toBeNull();
    });

    it("should return null for root directory without package.json", () => {
      const result = findProjectRoot("/tmp");
      expect(result).toBeNull();
    });

    it("should handle file path that does not exist", () => {
      const result = findProjectRoot(
        resolve(process.cwd(), "nonexistent-file.ts")
      );
      expect(result).toBe(process.cwd());
    });
  });
});
