/* eslint-disable no-console -- this is a logger service */

import { Injectable } from '@angular/core';
import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';

/**
 * A logger service
 */
@Injectable()
export abstract class DGTLoggerService {

  constructor(
    protected readonly minimumLevel: DGTLoggerLevel,
    protected readonly minimumLevelPrintData: DGTLoggerLevel,
  ) {}

  /**
   * Logs an info message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  info(typeName: string, message: string, data?: any) {

    if (!typeName) {

      throw new DGTErrorArgument('Typename should be set', typeName);

    }

    if (!message) {

      throw new DGTErrorArgument('Message should be set', message);

    }

    this.log(DGTLoggerLevel.info, typeName, message, data);

  }

  /**
   * Logs a debug message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  debug(typeName: string, message: string, data?: any) {

    if (!typeName) {

      throw new DGTErrorArgument('Typename should be set', typeName);

    }

    if (!message) {

      throw new DGTErrorArgument('Message should be set', message);

    }

    this.log(DGTLoggerLevel.debug, typeName, message, data);

  }

  /**
   * Logs a warning message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  warn(typeName: string, message: string, data?: any) {

    if (!typeName) {

      throw new DGTErrorArgument('Typename should be set', typeName);

    }

    if (!message) {

      throw new DGTErrorArgument('Message should be set', message);

    }

    this.log(DGTLoggerLevel.warn, typeName, message, data);

  }

  /**
   * Logs an error message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param error The error that was thrown
   * @param caught The error that was caught
   */
  error(typeName: string, message: string, error?: Error | any, caught?: any) {

    if (!typeName) {

      throw new DGTErrorArgument('Typename should be set', typeName);

    }

    if (!message) {

      throw new DGTErrorArgument('Message should be set', message);

    }

    this.log(DGTLoggerLevel.error, typeName, message, { error, caught });

  }

  /**
   * Logs a message
   *
   * @param level Severity level of the log
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  abstract log(level: DGTLoggerLevel, typeName: string, message: string, data?: any): void;

}
