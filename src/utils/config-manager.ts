interface ConfigOptions {
  environment: string;
  debug: boolean;
  logLevel: "info" | "warn" | "error";
  maxRetries: number;
  timeout: number;
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: ConfigOptions;
  private configPath: string;

  private constructor(configPath: string) {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  public static getInstance(configPath: string): ConfigManager {
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
    console.log("설정이 저장되었습니다.");
  }

  public getEnvironment(): string {
    return this.config.environment;
  }

  public isDebugMode(): boolean {
    return this.config.debug;
  }
}
