import { TestAnalyzer } from "../test-analyzer.js";
import { TestFile } from "../../types/test-analysis.js";

describe("TestAnalyzer", () => {
  let analyzer: TestAnalyzer;

  beforeEach(() => {
    analyzer = new TestAnalyzer();
  });

  describe("analyzeTests", () => {
    it("분석할 파일이 없을 때 기본 결과를 반환해야 합니다", async () => {
      const files: TestFile[] = [];
      const result = await analyzer.analyzeTests(files);

      expect(result).toHaveProperty("coverage");
      expect(result.coverage.percentage).toBe(0);
      expect(result.improvements).toHaveLength(0);
    });

    it("테스트 파일과 소스 파일을 구분할 수 있어야 합니다", async () => {
      const files: TestFile[] = [
        {
          path: "src/test.ts",
          content: "test content",
          isTest: true,
        },
        {
          path: "src/source.ts",
          content: "source content",
          isTest: false,
        },
      ];

      const result = await analyzer.analyzeTests(files);
      expect(result).toBeDefined();
    });
  });

  describe("generateTestReport", () => {
    it("분석 결과를 마크다운 형식으로 변환해야 합니다", async () => {
      const result = await analyzer.generateTestReport({
        coverage: {
          percentage: 75,
          coveredLines: 150,
          totalLines: 200,
          uncoveredLines: ["50-60", "80-90"],
        },
        improvements: [
          {
            type: "missing_case",
            description: "에러 처리 테스트 케이스 누락",
            suggestion: "에러 상황에 대한 테스트를 추가하세요",
            priority: "high",
          },
        ],
        missingScenarios: [
          {
            description: "네트워크 오류 시나리오",
            type: "unit",
            expectedBehavior: "적절한 에러 메시지 반환",
          },
        ],
        bestPractices: ["테스트 설명이 명확함"],
        securityConsiderations: ["인증 실패 케이스 필요"],
        integrationPoints: ["외부 API 호출 부분"],
      });

      expect(result).toContain("# 테스트 분석 보고서");
      expect(result).toContain("75%");
      expect(result).toContain("에러 처리 테스트 케이스 누락");
    });
  });
});
