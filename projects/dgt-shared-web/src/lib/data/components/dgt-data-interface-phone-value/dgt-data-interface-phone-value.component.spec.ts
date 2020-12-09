import { configuration } from '../../../../test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTDataInterfacePhoneValueComponent } from './dgt-data-interface-phone-value.component';

describe('DGTDataInterfacePhoneValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfacePhoneValueComponent>(configuration);
    testService.setup(DGTDataInterfacePhoneValueComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
