import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { AppConfigService } from './config/app-config.service';

export function buildWinstonConfig(cfg: AppConfigService) {
  const { level, dir, maxFiles, consoleEnabled, fileEnabled } = cfg.get('logging');
  const transports: winston.transport[] = [];

  if (consoleEnabled) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike('Bookmarks', {
            prettyPrint: true,
            colors: true,
          }),
        ),
      }),
    );
  }

  if (fileEnabled) {
    transports.push(
      new (winston.transports as any).DailyRotateFile({
        dirname: dir,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles,
        level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new (winston.transports as any).DailyRotateFile({
        dirname: dir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return { transports };
}
