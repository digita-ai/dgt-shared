import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { DGTDataInterfaceDescentComponent } from './dgt-data-interface-descent.component';

describe('DataInterfaceDescentComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfaceDescentComponent>(configuration);
    testService.setup(DGTDataInterfaceDescentComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
