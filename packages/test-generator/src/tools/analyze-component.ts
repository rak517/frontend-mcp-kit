import { z } from "zod";
import { analyzeComponent } from "../component-analyzer.js";

export const analyzeComponentSchema = z.object({
  filePath: z.string().describe("분석할 React 컴포넌트 파일의 절대 경로"),
});

export type AnalyzeComponentInput = z.infer<typeof analyzeComponentSchema>;

export async function runAnalyzeComponent(input: AnalyzeComponentInput) {
  const { filePath } = input;

  const result = await analyzeComponent(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
