import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UserValidator, emailSchema, passwordSchema } from "../validation";

describe("UserValidator", () => {
  let validator: UserValidator;

  beforeEach(() => {
    validator = new UserValidator();
  });

  afterEach(async () => {
    await validator.cleanup();
  });

  describe("이메일 검증", () => {
    it("유효한 이메일 주소를 허용해야 함", async () => {
      const result = await validator.validateEmail("test@example.com");
      expect(result.isValid).toBe(true);
    });

    it("특수 문자가 포함된 이메일을 허용해야 함", async () => {
      const result = await validator.validateEmail("test+label@example.com");
      expect(result.isValid).toBe(true);
    });

    it("최대 길이를 초과하는 이메일을 거부해야 함", async () => {
      const longEmail = "a".repeat(247) + "@test.com"; // 255자 초과
      const result = await validator.validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("이메일은 255자를 초과할 수 없습니다");
    });

    it("대소문자 구분 없이 중복 체크를 수행해야 함", async () => {
      const email1 = "Test@Example.com";
      const email2 = "test@example.com";

      const isDuplicate1 = await validator.checkDuplicate("email", email1);
      const isDuplicate2 = await validator.checkDuplicate("email", email2);

      expect(isDuplicate1).toBe(isDuplicate2);
    });
  });

  describe("비밀번호 검증", () => {
    it("유효한 비밀번호를 허용해야 함", async () => {
      const result = await validator.validatePassword("Test1234!");
      expect(result.isValid).toBe(true);
    });

    it("최소 길이 미달 비밀번호를 거부해야 함", async () => {
      const result = await validator.validatePassword("Test1!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("비밀번호는 최소 8자 이상이어야 합니다");
    });

    it("대문자가 없는 비밀번호를 거부해야 함", async () => {
      const result = await validator.validatePassword("test1234!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("대문자를 포함해야 합니다");
    });
  });

  describe("Redis 캐시 관리", () => {
    it("캐시 조회 및 저장이 정상 작동해야 함", async () => {
      const email = "test@example.com";
      await validator.checkDuplicate("email", email);

      // 두 번째 호출은 캐시에서 가져와야 함
      const startTime = Date.now();
      await validator.checkDuplicate("email", email);
      const endTime = Date.now();

      // 캐시된 결과는 빠르게 반환되어야 함 (10ms 이내)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
