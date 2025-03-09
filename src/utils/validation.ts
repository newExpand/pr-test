import { z } from "zod";
import Redis from "ioredis";

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface ValidationError {
  code: string;
  message: string;
}

// 개선된 이메일 스키마
export const emailSchema = z
  .string()
  .email("유효하지 않은 이메일 형식입니다")
  .max(255, "이메일은 255자를 초과할 수 없습니다")
  .transform((email) => email.toLowerCase());

// 개선된 비밀번호 스키마
export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
  .max(100, "비밀번호는 100자를 초과할 수 없습니다")
  .regex(/[A-Z]/, "대문자를 포함해야 합니다")
  .regex(/[a-z]/, "소문자를 포함해야 합니다")
  .regex(/[0-9]/, "숫자를 포함해야 합니다")
  .regex(/[^A-Za-z0-9]/, "특수문자를 포함해야 합니다");

// 개선된 Redis 설정
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  maxReconnectAttempts: 10,
  retryStrategy: (times: number) => {
    if (times > 10) return null; // 최대 10번 재시도
    return Math.min(times * 200, 2000); // 지수 백오프
  },
};

export class CacheManager {
  private redis: Redis;
  private ttl: number = 3600;
  private prefix: string = "user:";

  constructor() {
    this.redis = new Redis(redisConfig);

    this.redis.on("error", (error) => {
      console.error("Redis 연결 오류:", error);
    });
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.prefix + key;
      const value = await this.redis.get(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("캐시 조회 오류:", error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      await this.redis.set(fullKey, JSON.stringify(value), "EX", this.ttl);
    } catch (error) {
      console.error("캐시 저장 오류:", error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.prefix + pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error("캐시 무효화 오류:", error);
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export class UserValidator {
  private cacheManager: CacheManager;

  constructor() {
    this.cacheManager = new CacheManager();
  }

  async validateEmail(email: string): Promise<ValidationResult> {
    try {
      const validatedEmail = emailSchema.parse(email);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      throw error;
    }
  }

  async validatePassword(password: string): Promise<ValidationResult> {
    try {
      passwordSchema.parse(password);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      throw error;
    }
  }

  async checkDuplicate(field: string, value: string): Promise<boolean> {
    try {
      // 캐시 먼저 확인
      const cached = await this.cacheManager.get(
        `${field}:${value.toLowerCase()}`,
      );
      if (cached !== null) {
        return cached;
      }

      // 실제 DB 조회 로직은 여기에 구현
      // 예시: const exists = await db.users.findOne({ [field]: value.toLowerCase() });
      const exists = false;

      // 결과 캐싱
      await this.cacheManager.set(`${field}:${value.toLowerCase()}`, exists);

      return exists;
    } catch (error) {
      console.error("중복 체크 오류:", error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await this.cacheManager.close();
  }
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
