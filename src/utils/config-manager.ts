interface ConfigOptions {
  environment: string;
  debug: boolean;
  logLevel: "info" | "warn" | "error" | "debug";
  maxRetries: number;
  timeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  apiKey?: string;
  apiEndpoint?: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: ConfigOptions;
  private readonly configPath: string;

  private constructor(configPath: string = "config.json") {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  public static getInstance(configPath?: string): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(configPath);
    }
    return ConfigManager.instance;
  }

  private loadConfig(): ConfigOptions {
    // 설정 파일 로드 로직
    return {
      environment: "development",
      debug: true,
      logLevel: "info",
      maxRetries: 3,
      timeout: 5000,
      cacheEnabled: true,
      cacheTTL: 3600,
    };
  }

  public getConfig(): ConfigOptions {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ConfigOptions>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private saveConfig(): void {
    // 설정 저장 로직
    console.log(`설정이 ${this.configPath}에 저장되었습니다.`);
  }

  // Environment & Debug 관련 메서드
  public getEnvironment(): string {
    return this.config.environment;
  }

  public isDebugMode(): boolean {
    return this.config.debug;
  }

  // Cache 관련 메서드
  public getCacheTTL(): number {
    return this.config.cacheTTL;
  }

  public setCacheTTL(ttl: number): void {
    if (ttl < 0) {
      throw new Error("TTL must be a positive number");
    }
    this.config.cacheTTL = ttl;
    this.saveConfig();
  }

  // Log Level 관련 메서드
  public getLogLevel(): string {
    return this.config.logLevel;
  }

  public setLogLevel(level: "info" | "warn" | "error" | "debug"): void {
    this.config.logLevel = level;
    this.saveConfig();
  }

  // API 인증 관련 메서드
  public setApiCredentials(apiKey: string, apiEndpoint: string): void {
    this.config.apiKey = apiKey;
    this.config.apiEndpoint = apiEndpoint;
    this.saveConfig();
  }

  public clearApiCredentials(): void {
    delete this.config.apiKey;
    delete this.config.apiEndpoint;
    this.saveConfig();
  }
}
