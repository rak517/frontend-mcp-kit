import { existsSync, statSync } from "node:fs";
import { dirname, join, parse } from "node:path";

export function findProjectRoot(startPath: string): string | null {
  let dir = startPath;

  try {
    if (!statSync(dir).isDirectory()) {
      dir = dirname(startPath);
    }
  } catch {
    dir = dirname(startPath);
  }

  const root = parse(dir).root;
  while (dir !== root) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }

  return null;
}
