import jwt, { SignOptions } from "jsonwebtoken";
import { Redis } from "ioredis";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthConfig {
  jwtSecret: string;
  tokenExpiration: number;
  redisUrl: string;
}

export class AuthService {
  private redis: Redis;

  constructor(private config: AuthConfig) {
    this.redis = new Redis(config.redisUrl);
  }

  async generateToken(user: User): Promise<string> {
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.config.jwtSecret,
      { expiresIn: this.config.tokenExpiration },
    );

    // 토큰을 Redis에 캐싱
    await this.redis.set(`token:${user.id}`, token, "EX", 3600);

    return token;
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as {
        userId: string;
      };

      // Redis에서 토큰 검증
      const cachedToken = await this.redis.get(`token:${decoded.userId}`);
      if (!cachedToken || cachedToken !== token) {
        throw new Error("Invalid token");
      }

      // 실제 환경에서는 DB에서 사용자 정보를 조회
      const user: User = {
        id: decoded.userId,
        email: "test@example.com",
        name: "Test User",
      };

      return user;
    } catch (error) {
      return null;
    }
  }

  async revokeToken(userId: string): Promise<void> {
    await this.redis.del(`token:${userId}`);
  }
}
