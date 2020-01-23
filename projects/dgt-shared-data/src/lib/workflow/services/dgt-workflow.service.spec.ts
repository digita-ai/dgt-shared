import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTWorkflowService } from './dgt-workflow.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';

/* tslint:disable:no-unused-variable */

describe('DGTWorkflowService', () => {
    const testService = new DGTTestRunnerService<DGTWorkflowService>(configuration);
    testService.setup(DGTWorkflowService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should register and get a workflow', async(() => {
        const field: DGTLDField = {
            namespace: 'digita.ai/',
            name: 'test'
        };

        const workflow: DGTWorkflow = {
            trigger: {
                fields: [field]
            },
            actions: []
        };
        testService.service.register(workflow);

        expect(testService.service.get(field)).toEqual([workflow]);
    }));
});
