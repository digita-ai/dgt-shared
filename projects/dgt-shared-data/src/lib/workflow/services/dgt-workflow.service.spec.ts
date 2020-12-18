import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTWorkflow } from '../models/dgt-workflow.model';
<<<<<<< HEAD
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilterBGP } from '../../linked-data/models/dgt-ld-filter-bgp.model';
import { DGTRemovePrefixWorkflowAction } from '../actions/dgt-remove-prefix.workflow-action';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTConfigurationMockService } from 'projects/dgt-shared-utils/src/lib/configuration/services/dgt-configuration-mock.service';
=======
import { DGTWorkflowService } from './dgt-workflow.service';
>>>>>>> develop

/* tslint:disable:no-unused-variable */

describe('DGTWorkflowService', () => {
    const testService = new DGTTestRunnerService<DGTWorkflowService>(configuration);
    testService.setup(DGTWorkflowService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should register and get a workflow', async(() => {
        const predicate = 'digita.ai/test'

        const workflow: DGTWorkflow = {
<<<<<<< HEAD
            filter: {
                type: DGTLDFilterType.BGP,
                predicates: ['http://www.w3.org/2006/vcard/ns#fn'],
            } as DGTLDFilterBGP,
            source: 'source#4',
            actions: [
                new DGTRemovePrefixWorkflowAction('http://www.w3.org/2006/vcard/ns#fn', 'Ar', new DGTLoggerService(new DGTConfigurationMockService())),
            ],
            destination: 'source#2',
=======
            predicates: [predicate],
            actions: [],
            source: null, // TODO
>>>>>>> develop
        };
        testService.service.register(workflow);
    }));
});
