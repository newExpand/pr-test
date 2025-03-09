interface ConfigOptions {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  timeout: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

export class ConfigManager {
  private config: ConfigOptions;
  private static instance: ConfigManager;

  private constructor(options: Partial<ConfigOptions> = {}) {
    this.config = {
      cacheEnabled: false, // 기본값 변경
      cacheTTL: 1800, // 기본값 변경
      maxRetries: 5, // 기본값 변경
      timeout: 3000, // 기본값 변경
      logLevel: "info", // 새로운 옵션
      ...options,
    };
  }

  static getInstance(options?: Partial<ConfigOptions>): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(options);
    }
    return ConfigManager.instance;
  }

  getConfig(): ConfigOptions {
    return { ...this.config };
  }

  updateConfig(options: Partial<ConfigOptions>): void {
    this.config = {
      ...this.config,
      ...options,
    };
  }

  getCacheTTL(): number {
    return this.config.cacheTTL;
  }

  setCacheTTL(ttl: number): void {
    if (ttl < 0) {
      throw new Error("TTL must be a positive number");
    }
    this.config.cacheTTL = ttl;
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }

  setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.config.logLevel = level;
  }
}
