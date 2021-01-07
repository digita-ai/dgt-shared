import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTWorkflowManagerService } from './dgt-workflow-manager.service';

/* tslint:disable:no-unused-variable */

describe('DGTWorkflowManagerService', () => {
    const testService = new DGTTestRunnerService<DGTWorkflowManagerService>(configuration);
    testService.setup(DGTWorkflowManagerService);

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
