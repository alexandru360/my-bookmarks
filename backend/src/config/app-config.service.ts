import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { AppConfig, DEFAULT_CONFIG } from './app-config.schema';

/**
 * Single source of truth for all configuration.
 * Reads from config.json on disk (stored in the mounted storage volume).
 * Environment variables override individual values — useful for secrets in Docker/CI.
 *
 * Priority (highest wins): env vars > config.json > built-in defaults
 */
@Injectable()
export class AppConfigService implements OnModuleInit {
  private readonly logger = new Logger(AppConfigService.name);
  private readonly configPath: string;
  private config: AppConfig;

  constructor() {
    const storagePath = process.env.STORAGE_PATH || './storage';
    this.configPath = resolve(storagePath, 'config', 'config.json');
    this.config = this.load();
  }

  onModuleInit() {
    this.validate();
  }

  // ── Public accessors ────────────────────────────────────────

  get<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return this.config[section];
  }

  // ── Load / merge / persist ──────────────────────────────────

  private load(): AppConfig {
    const fromFile = this.readOrCreate();
    const merged = this.deepMerge(DEFAULT_CONFIG, fromFile);
    const withEnv = this.applyEnvOverrides(merged);
    return withEnv;
  }

  private readOrCreate(): Partial<AppConfig> {
    if (!existsSync(this.configPath)) {
      this.logger.warn(`Config file not found — creating default at: ${this.configPath}`);
      this.logger.warn('Fill in auth.googleClientId and auth.googleClientSecret before starting.');
      mkdirSync(dirname(this.configPath), { recursive: true });
      writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
      return {};
    }

    try {
      const raw = readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(raw);
      this.logger.log(`Loaded config from: ${this.configPath}`);
      return parsed;
    } catch (err) {
      this.logger.error(`Failed to parse config.json: ${err.message} — using defaults`);
      return {};
    }
  }

  /**
   * Environment variables override config.json.
   * Mapping: env var → config path
   */
  private applyEnvOverrides(cfg: AppConfig): AppConfig {
    const e = process.env;
    const apply = (val: string | undefined, setter: (v: string) => void) => {
      if (val !== undefined && val.trim() !== '') setter(val.trim());
    };

    apply(e.PORT,                  v => { cfg.server.port = Number(v); });
    apply(e.GOOGLE_CLIENT_ID,      v => { cfg.auth.googleClientId = v; });
    apply(e.GOOGLE_CLIENT_SECRET,  v => { cfg.auth.googleClientSecret = v; });
    apply(e.JWT_SECRET,            v => { cfg.auth.jwtSecret = v; });
    apply(e.JWT_EXPIRES_IN,        v => { cfg.auth.jwtExpiresIn = v; });
    apply(e.DB_PATH,               v => { cfg.database.path = v; });
    apply(e.LOGS_DIR,              v => { cfg.logging.dir = v; });
    apply(e.LOG_LEVEL,             v => { cfg.logging.level = v as any; });
    apply(e.BACKEND_URL,           v => { cfg.urls.backendUrl = v; });
    apply(e.FRONTEND_URL,          v => { cfg.urls.frontendUrl = v; });

    return cfg;
  }

  private validate() {
    const { googleClientId, googleClientSecret } = this.config.auth;
    if (!googleClientId || !googleClientSecret) {
      this.logger.warn('⚠  auth.googleClientId / googleClientSecret are empty — Google OAuth will not work!');
      this.logger.warn(`   Edit: ${this.configPath}`);
    }
    if (this.config.auth.jwtSecret === DEFAULT_CONFIG.auth.jwtSecret) {
      this.logger.warn('⚠  auth.jwtSecret is still the default value — change it in config.json!');
    }
  }

  private deepMerge<T>(defaults: T, overrides: Partial<T>): T {
    const result: any = { ...defaults };
    for (const key of Object.keys(overrides ?? {}) as Array<keyof T>) {
      const ov = overrides[key];
      if (ov !== null && typeof ov === 'object' && !Array.isArray(ov)) {
        result[key] = this.deepMerge(result[key] ?? {}, ov as any);
      } else if (ov !== undefined) {
        result[key] = ov;
      }
    }
    return result;
  }
}
