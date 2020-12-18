import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTWorkflowService } from './dgt-workflow.service';

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
            predicates: [predicate],
            actions: [],
            source: null, // TODO
        };
        testService.service.register(workflow);

        expect(testService.service.get(predicate)).toEqual([workflow]);
    }));
});
