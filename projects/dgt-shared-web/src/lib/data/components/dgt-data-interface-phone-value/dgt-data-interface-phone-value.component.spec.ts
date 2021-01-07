<<<<<<< HEAD
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { DGTDataInterfacePhoneValueComponent } from './dgt-data-interface-phone-value.component';
=======
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from 'test.configuration';
import { DGTBrowserDataInterfacePhoneValueComponent } from './data-interface-phone-value.component';
>>>>>>> develop

describe('DGTDataInterfacePhoneValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfacePhoneValueComponent>(configuration);
    testService.setup(DGTDataInterfacePhoneValueComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
