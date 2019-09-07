import { Injectable } from '@angular/core';

@Injectable()
export class DGTLoggerService {

    public debug(typeName: string, message: string, data?: any) {
        this.log('debug', typeName, message, data);
    }

    public error(typeName: string, message: string, error?: Error | any, caught?: any) {
        this.log('error', typeName, message, { error, caught });
    }

    public log(level: string, typeName: string, message: string, data?: any) {
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
