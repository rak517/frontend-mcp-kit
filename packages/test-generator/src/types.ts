// 테스트 프레임워크
export type TestFramework = "vitest" | "jest" | "unknown";

// 테스트 환경 정보
export interface TestEnvironment {
  framework: TestFramework;
  hasTestingLibrary: boolean;
  testFilePattern: string;
  configFile: string | null;
}

// 파라미터 정보
export interface ParamInfo {
  name: string;
  type: string;
}

// Export 정보
export interface ExportInfo {
  name: string;
  type: "function" | "component" | "hook" | "const";
  params: ParamInfo[];
  returnType: string;
}

// 코드 분석 결과
export interface CodeAnalysis {
  fileName: string;
  fileExtension: string;
  exports: ExportInfo[];
  dependencies: string[];
}
