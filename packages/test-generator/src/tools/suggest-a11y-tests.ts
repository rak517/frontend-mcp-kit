import { z } from "zod";
import { A11yAnalysis, A11ySuggestion, McpToolResponse } from "../types.js";
import { readFile } from "node:fs/promises";

export const suggestA11yTestsSchema = z.object({
  filePath: z.string().describe("분석할 React 컴포넌트 파일의 절대 경로"),
});

export type SuggestA11yTestsInput = z.infer<typeof suggestA11yTestsSchema>;

// 접근성 검사 규칙
const A11Y_RULES = {
  // 클릭 가능한 요소에 키보드 핸들러 필요
  clickWithoutKeyboard: {
    pattern: /onClick(?!.*onKeyDown|.*onKeyPress|.*onKeyUp)/g,
    type: "keyboard" as const,
    suggestion:
      "onClick이 있는 요소에 키보드 이벤트 핸들러(onKeyDown) 추가 필요",
  },
  // img 태그에 alt 속성 필요
  imgWithoutAlt: {
    pattern: /<img(?![^>]*alt=)[^>]*>/g,
    type: "aria" as const,
    element: "img",
    suggestion: "img 태그에 alt 속성 추가 필요",
  },
  // button에 텍스트 또는 aria-label 필요
  buttonWithoutLabel: {
    pattern: /<button[^>]*>[\s]*<\/button>|<button[^>]*\/>/g,
    type: "aria" as const,
    element: "button",
    suggestion: "빈 button에 aria-label 또는 텍스트 콘텐츠 추가 필요",
  },
  // div/span에 onClick이 있으면 role과 tabIndex 필요
  divClickable: {
    pattern: /<(?:div|span)[^>]*onClick[^>]*>/g,
    type: "aria" as const,
    element: "div/span",
    suggestion: "클릭 가능한 div/span에 role='button'과 tabIndex={0} 추가 필요",
  },
  // input에 label 연결 필요
  inputWithoutLabel: {
    pattern: /<input(?![^>]*aria-label|.*id=)[^>]*>/g,
    type: "aria" as const,
    element: "input",
    suggestion: "input에 aria-label 또는 연결된 label 추가 필요",
  },
};

// jest-axe 예시 코드
const JEST_AXE_EXAMPLE = `import { axe, toHaveNoViolations } from 'jest-axe';

 expect.extend(toHaveNoViolations);

 it('should have no accessibility violations', async () => {
   const { container } = render(<Component />);
   const results = await axe(container);
   expect(results).toHaveNoViolations();
 });`;

async function analyzeA11y(filePath: string): Promise<A11yAnalysis> {
  const content = await readFile(filePath, "utf-8");
  const suggestions: A11ySuggestion[] = [];

  for (const [, rule] of Object.entries(A11Y_RULES)) {
    const matches = content.match(rule.pattern);
    if (matches && matches.length > 0) {
      suggestions.push({
        type: rule.type,
        element: "element" in rule ? rule.element : undefined,
        suggestion: rule.suggestion,
      });
    }
  }

  return {
    hasIssues: suggestions.length > 0,
    suggestions,
    jestAxeExample: JEST_AXE_EXAMPLE,
  };
}

export async function runSuggestA11yTests(
  input: SuggestA11yTestsInput
): Promise<McpToolResponse> {
  const { filePath } = input;
  const result = await analyzeA11y(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
