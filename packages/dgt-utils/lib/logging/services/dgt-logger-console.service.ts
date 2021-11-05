/* eslint-disable no-console -- this is a logger service */

import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';
import { DGTLoggerService } from './dgt-logger.service';

/**
 * JavaScript console-based logger service
 */
export class DGTLoggerConsoleService extends DGTLoggerService {

  constructor(
    protected readonly minimumLevel: DGTLoggerLevel,
    protected readonly minimumLevelPrintData: DGTLoggerLevel,
  ) {

    super(minimumLevel, minimumLevelPrintData);

  }

  log(level: DGTLoggerLevel, typeName: string, message: string, data?: any) {

    if (level === null || level === undefined) {

      throw new DGTErrorArgument('Argument level should be set', typeName);

    }

    if (!typeName) {

      throw new DGTErrorArgument('Argument typeName should be set', typeName);

    }

    if (!message) {

      throw new DGTErrorArgument('Argument message should be set', message);

    }

    const timestamp: string = new Date().toISOString();

    if (level <= this.minimumLevel) {

      const logMessage = `[${timestamp} ${typeName}] ${message}`;
      const logData = level <= this.minimumLevelPrintData ? data ?? '' : '';
      const log = [ logMessage, logData ];

      switch (level) {

        case DGTLoggerLevel.info:
          console.info(...log);
          break;

        case DGTLoggerLevel.debug:
          console.debug(...log);
          break;

        case DGTLoggerLevel.warn:
          console.warn(...log);
          break;

        case DGTLoggerLevel.error:
          console.error(...log);
          break;

        default:
          console.log(...log);
          break;

      }

    }

  }

}
