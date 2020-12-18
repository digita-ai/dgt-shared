import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTLoggerService } from './dgt-logger.service';

/* tslint:disable:no-unused-variable */

describe('DGTLoggerService', () => {
    const testService = new DGTTestRunnerService<DGTLoggerService>(configuration);
    testService.setup(DGTLoggerService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should log a debug message', async(() => {
        testService.service.debug('test', 'test');

        expect(testService.service).toBeTruthy();
    }));
});
