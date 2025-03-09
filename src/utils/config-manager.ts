interface ConfigOptions {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  timeout: number;
  logLevel: "debug" | "info" | "warn" | "error";
  apiKey?: string;
  apiEndpoint?: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: ConfigOptions;
  private readonly configFile: string;

  private constructor(configFile: string = "config.json") {
    this.configFile = configFile;
    this.config = this.loadDefaultConfig();
  }

  static getInstance(configFile?: string): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(configFile);
    }
    return ConfigManager.instance;
  }

  private loadDefaultConfig(): ConfigOptions {
    return {
      cacheEnabled: true,
      cacheTTL: 3600,
      maxRetries: 3,
      timeout: 5000,
      logLevel: "info",
    };
  }

  getConfig(): ConfigOptions {
    return { ...this.config };
  }

  updateConfig(options: Partial<ConfigOptions>): void {
    this.config = {
      ...this.config,
      ...options,
    };
    this.saveConfig();
  }

  private saveConfig(): void {
    // 설정을 파일에 저장하는 로직
    console.log(`설정이 ${this.configFile}에 저장되었습니다.`);
  }

  getCacheTTL(): number {
    return this.config.cacheTTL;
  }

  setCacheTTL(ttl: number): void {
    if (ttl < 0) {
      throw new Error("TTL must be a positive number");
    }
    this.config.cacheTTL = ttl;
    this.saveConfig();
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }

  setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.config.logLevel = level;
    this.saveConfig();
  }

  setApiCredentials(apiKey: string, apiEndpoint: string): void {
    this.config.apiKey = apiKey;
    this.config.apiEndpoint = apiEndpoint;
    this.saveConfig();
  }

  clearApiCredentials(): void {
    delete this.config.apiKey;
    delete this.config.apiEndpoint;
    this.saveConfig();
  }
}
