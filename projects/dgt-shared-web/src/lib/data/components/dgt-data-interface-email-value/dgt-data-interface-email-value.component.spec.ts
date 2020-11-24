import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataInterfaceEmailValueComponent } from './data-interface-email-value.component';

describe('DGTBrowserDataInterfaceEmailValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataInterfaceEmailValueComponent>(configuration);
    testService.setup(DGTBrowserDataInterfaceEmailValueComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
