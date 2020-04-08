import { Injectable } from '@angular/core';
import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';

@Injectable()
export class DGTLoggerService {

    public debug(typeName: string, message: string, data?: any) {
        if (!typeName) {
            throw new DGTErrorArgument('Typename should be set', typeName);
        }

        if (!message) {
            throw new DGTErrorArgument('Message should be set', message);
        }

        this.log('debug', typeName, message, data);
    }

    public error(typeName: string, message: string, error?: Error | any, caught?: any) {
        if (!typeName) {
            throw new DGTErrorArgument('Typename should be set', typeName);
        }

        if (!message) {
            throw new DGTErrorArgument('Message should be set', message);
        }

        this.log('error', typeName, message, { error, caught });
    }

    public log(level: string, typeName: string, message: string, data?: any) {
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

        if (level === 'error') {
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
