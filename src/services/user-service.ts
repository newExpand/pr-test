import {
  createValidator,
  userSchema,
  ValidationError,
} from "../utils/validation.js";
import { Redis } from "ioredis";
import { log } from "../utils/logger.js";

interface UserCreateInput {
  email: string;
  username: string;
  password: string;
  profile: {
    name: string;
    bio?: string;
    website?: string;
  };
}

export class UserService {
  private redis: Redis;
  private validateUser: ReturnType<typeof createValidator<UserCreateInput>>;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.validateUser = createValidator(userSchema);
  }

  async createUser(input: unknown): Promise<{ id: string }> {
    // 입력값 검증
    const validationResult = await this.validateUser(input);
    if (!validationResult.isValid || !validationResult.data) {
      throw new ValidationError(
        validationResult.errors || ["유효하지 않은 사용자 정보입니다"],
      );
    }

    const userData = validationResult.data;

    try {
      // 이메일 중복 체크
      const existingEmail = await this.redis.get(`email:${userData.email}`);
      if (existingEmail) {
        throw new ValidationError(["이미 사용 중인 이메일입니다"]);
      }

      // 사용자 이름 중복 체크
      const existingUsername = await this.redis.get(
        `username:${userData.username}`,
      );
      if (existingUsername) {
        throw new ValidationError(["이미 사용 중인 사용자 이름입니다"]);
      }

      // 사용자 ID 생성
      const userId = await this.generateUserId();

      // 사용자 데이터 저장
      await Promise.all([
        this.redis.set(`user:${userId}`, JSON.stringify(userData)),
        this.redis.set(`email:${userData.email}`, userId),
        this.redis.set(`username:${userData.username}`, userId),
      ]);

      log.info(`새로운 사용자가 생성되었습니다: ${userId}`);
      return { id: userId };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      log.error("사용자 생성 중 오류 발생:", error);
      throw new Error("사용자 생성에 실패했습니다");
    }
  }

  private async generateUserId(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `user_${timestamp}_${random}`;
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}
