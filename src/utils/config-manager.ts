interface ConfigOptions {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  timeout: number;
}

export class ConfigManager {
  private config: ConfigOptions;

  constructor(options: Partial<ConfigOptions> = {}) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 3600,
      maxRetries: 3,
      timeout: 5000,
      ...options,
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
  }

  getCacheTTL(): number {
    return this.config.cacheTTL;
  }

  setCacheTTL(ttl: number): void {
    this.config.cacheTTL = ttl;
  }
}
