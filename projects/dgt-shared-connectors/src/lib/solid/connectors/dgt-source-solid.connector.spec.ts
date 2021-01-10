/* tslint:disable:no-unused-variable */

import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import * as _ from 'lodash';
import { configuration } from '../../../test.configuration';
import { DGTConnectorSolid } from './dgt-source-solid.connector';

describe('DGTConnectorSolid', () => {
    const testService = new DGTTestRunnerService<DGTConnectorSolid>(configuration);
    testService.setup(DGTConnectorSolid);

    it('should be correctly instantiated', (() => {
        expect(testService.service).toBeTruthy();
    }));
    
});
