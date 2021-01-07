import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { DGTConfigurationMockService } from '@digita-ai/dgt-shared-utils/lib/configuration/services/dgt-configuration-mock.service';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../test.configuration';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDResourceTransformerService } from '../../linked-data/services/dgt-ld-resource-transformer.service';
import { DGTCacheInMemoryService } from './dgt-cache-in-memory.service';

/* tslint:disable:no-unused-variable */

describe('DGTCacheInMemoryService', () => {
    const testService = new DGTTestRunnerService<DGTCacheInMemoryService>(configuration);
    testService.setup(DGTCacheInMemoryService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should remove a single resource', async(() => {
        const resource1: DGTLDResource = {
            uri: 'foo1',
            triples: null,
            exchange: null,
        };

        const resource2: DGTLDResource = {
            uri: 'foo2',
            triples: null,
            exchange: null,
        };

        testService.service.cache = [resource1, resource2];

        testService.service.delete(new DGTLDResourceTransformerService(new DGTLoggerService(new DGTConfigurationMockService()), new DGTParameterCheckerService()), [resource1]);

        expect(testService.service.cache.length).toEqual(1);
        expect(testService.service.cache[0]).toEqual(resource2);
    }));
});
