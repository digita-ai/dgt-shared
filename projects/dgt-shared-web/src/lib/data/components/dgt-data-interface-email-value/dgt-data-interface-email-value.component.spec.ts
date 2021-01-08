import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { DGTDataInterfaceEmailValueComponent } from './dgt-data-interface-email-value.component';

describe('DGTDataInterfaceEmailValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfaceEmailValueComponent>(configuration);
    testService.setup(DGTDataInterfaceEmailValueComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
