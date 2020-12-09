/* tslint:disable:no-unused-variable */

import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTSourceSolidConnector } from './dgt-source-solid.connector';
import * as _ from 'lodash';

describe('DGTSourceSolidConnector', () => {
    const testService = new DGTTestRunnerService<DGTSourceSolidConnector>(configuration);
    testService.setup(DGTSourceSolidConnector);

    it('should be correctly instantiated', (() => {
        expect(testService.service).toBeTruthy();
    }));
});
