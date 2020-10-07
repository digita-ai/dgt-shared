import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataInterfaceDescentComponent } from './data-interface-descent.component';

describe('DataInterfaceDescentComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataInterfaceDescentComponent>(configuration);
    testService.setup(DGTBrowserDataInterfaceDescentComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
