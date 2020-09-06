import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita/dgt-shared-test';
import { DGTBrowserDataInterfacePhoneValueComponent } from './data-interface-phone-value.component';

describe('DGTBrowserDataInterfacePhoneValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataInterfacePhoneValueComponent>(configuration);
    testService.setup(DGTBrowserDataInterfacePhoneValueComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
