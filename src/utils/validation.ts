import { z } from "zod";

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export function createValidator<T>(schema: z.ZodType<T>) {
  return async (input: unknown): Promise<ValidationResult<T>> => {
    try {
      const data = await schema.parseAsync(input);
      return {
        isValid: true,
        data,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      throw error;
    }
  };
}

// 공통적으로 사용되는 검증 스키마들
export const commonSchemas = {
  email: z.string().email("유효하지 않은 이메일 형식입니다"),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다",
    ),
  username: z
    .string()
    .min(2, "사용자 이름은 최소 2자 이상이어야 합니다")
    .max(30, "사용자 이름은 최대 30자까지 가능합니다")
    .regex(
      /^[a-zA-Z0-9가-힣_-]+$/,
      "사용자 이름에 허용되지 않는 문자가 포함되어 있습니다",
    ),
};

// 사용자 정보 검증을 위한 스키마
export const userSchema = z.object({
  email: commonSchemas.email,
  username: commonSchemas.username,
  password: commonSchemas.password,
  profile: z.object({
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
    bio: z.string().max(500, "자기소개는 최대 500자까지 가능합니다").optional(),
    website: z.string().url("유효하지 않은 URL 형식입니다").optional(),
  }),
});
