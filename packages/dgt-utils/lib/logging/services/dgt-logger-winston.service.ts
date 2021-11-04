/* eslint-disable no-console -- this is a logger service */

import util from 'util';
import { Injectable } from '@angular/core';
import { transports, createLogger, format, Logger } from 'winston';
import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';
import { DGTLoggerService } from './dgt-logger.service';
/**
 * Winston-based logger service
 */
@Injectable()
export class DGTLoggerWinstonService extends DGTLoggerService {

  private logger: Logger;

  constructor(
    protected readonly minimumLevel: DGTLoggerLevel,
    protected readonly minimumLevelPrintData: DGTLoggerLevel,
  ) {

    super(minimumLevel, minimumLevelPrintData);

    this.logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.printf(this.formatLog),
      ),
      level: DGTLoggerLevel[this.minimumLevel],
      transports: [
        new transports.File({ filename: 'api-error.log', level: 'error' }),
        new transports.Console(),
      ],
    });

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

    const logLevel = DGTLoggerLevel[level];
    const printData = level <= this.minimumLevelPrintData;

    if (level <= this.minimumLevel) {

      this.logger.log({ level: logLevel, message, typeName, data, printData });

    }

  }

  /**
   * Formats log info
   *
   * @param info The log info to format
   * @returns The formatted string
   */
  private formatLog(info: any): string {

    return info.printData
      ? `[${info.timestamp} ${info.typeName}] ${info.message}${info.data ? `\n${util.inspect(info.data)}` : ''}`
      : `[${info.timestamp} ${info.typeName}] ${info.message}`;

  }

}
