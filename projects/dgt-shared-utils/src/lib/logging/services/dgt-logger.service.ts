import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';
import { Injectable } from '@angular/core';
import { DGTConfigurationService } from '../../configuration/services/dgt-configuration.service';
import { DGTConfigurationBase } from '../../configuration/models/dgt-configuration-base.model';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';

@Injectable()
export class DGTLoggerService {
    private readonly minimumLevel: DGTLoggerLevel;

    constructor(private config: DGTConfigurationService<DGTConfigurationBase>) {
        this.minimumLevel = this.config.get<DGTLoggerLevel>(c => c.logger.minimumLevel);
    }

    public debug(typeName: string, message: string, data?: any) {
        if (!typeName) {
            throw new DGTErrorArgument('Typename should be set', typeName);
        }

        if (!message) {
            throw new DGTErrorArgument('Message should be set', message);
        }

        this.log(DGTLoggerLevel.DEBUG, typeName, message, data);
    }

    public error(typeName: string, message: string, error?: Error | any, caught?: any) {
        if (!typeName) {
            throw new DGTErrorArgument('Typename should be set', typeName);
        }

        if (!message) {
            throw new DGTErrorArgument('Message should be set', message);
        }

        this.log(DGTLoggerLevel.ERROR, typeName, message, { error, caught });
    }

    public log(level: DGTLoggerLevel, typeName: string, message: string, data?: any) {
        if (!level) {
            throw new DGTErrorArgument('Level should be set', typeName);
        }

        if (!typeName) {
            throw new DGTErrorArgument('Typename should be set', typeName);
        }

        if (!message) {
            throw new DGTErrorArgument('Message should be set', message);
        }

        const displayDate: string = new Date().toLocaleTimeString();

        if (level >= this.minimumLevel) {
            if (level >= DGTLoggerLevel.WARN) {
                if (data) {
                    console.error('[' + displayDate + ' ' + typeName + '] ' + message, '\n', data);
                } else {
                    console.error('[' + displayDate + ' ' + typeName + '] ' + message);
                }
            } else {
                if (data) {
                    console.log('[' + displayDate + ' ' + typeName + '] ' + message, '\n', data);
                } else {
                    console.log('[' + displayDate + ' ' + typeName + '] ' + message);
                }
            }
        }
    }
}
