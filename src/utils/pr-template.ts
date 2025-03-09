import { z } from "zod";

export const PRTemplateSchema = z.object({
  title: z.string(),
  description: z.string(),
  checklist: z.array(z.string()),
  reviewPoints: z.array(z.string()),
});

export type PRTemplate = z.infer<typeof PRTemplateSchema>;

export const defaultTemplate: PRTemplate = {
  title: "feat: ",
  description: `## 변경사항
- 

## 테스트
- [ ] 단위 테스트 추가
- [ ] E2E 테스트 추가

## 리뷰 포인트
- `,
  checklist: [
    "코드 스타일이 일관성 있게 유지되었나요?",
    "테스트 커버리지가 충분한가요?",
    "문서화가 적절히 되어있나요?",
  ],
  reviewPoints: ["성능 개선 여부", "보안 고려사항", "확장성"],
};

export function generateTemplateFromPattern(pattern: string): PRTemplate {
  // 브랜치 패턴에 따라 템플릿 생성
  const [type] = pattern.split("/");

  switch (type) {
    case "feat":
      return {
        ...defaultTemplate,
        title: "feat: ",
        description: `## 새로운 기능
- 

## 구현 상세
- 

## 테스트
- [ ] 단위 테스트
- [ ] 통합 테스트`,
      };
    case "fix":
      return {
        ...defaultTemplate,
        title: "fix: ",
        description: `## 수정된 버그
- 

## 원인
- 

## 해결 방법
- 

## 테스트
- [ ] 버그 재현 테스트
- [ ] 수정 사항 테스트`,
      };
    default:
      return defaultTemplate;
  }
}
