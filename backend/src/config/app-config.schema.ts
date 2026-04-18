export interface AppConfig {
  server: {
    port: number;
  };
  auth: {
    googleClientId: string;
    googleClientSecret: string;
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  database: {
    path: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    dir: string;
    maxFiles: string;
    consoleEnabled: boolean;
    fileEnabled: boolean;
  };
  urls: {
    /** Public URL of this server (used as OAuth callback base) */
    backendUrl: string;
    /** Public URL of the frontend (used for post-OAuth redirects) */
    frontendUrl: string;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  server: {
    port: 3000,
  },
  auth: {
    googleClientId: '',
    googleClientSecret: '',
    jwtSecret: 'CHANGE_ME_use_a_long_random_secret',
    jwtExpiresIn: '30d',
  },
  database: {
    path: './storage/data/bookmarks.db',
  },
  logging: {
    level: 'info',
    dir: './storage/logs',
    maxFiles: '30d',
    consoleEnabled: true,
    fileEnabled: true,
  },
  urls: {
    backendUrl: 'http://localhost:3000',
    frontendUrl: 'http://localhost:3000',
  },
};
