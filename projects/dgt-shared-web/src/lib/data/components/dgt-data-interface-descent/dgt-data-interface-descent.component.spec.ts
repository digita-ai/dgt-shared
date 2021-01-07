<<<<<<< HEAD
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { DGTDataInterfaceDescentComponent } from './dgt-data-interface-descent.component';
=======
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from 'test.configuration';
import { DGTBrowserDataInterfaceDescentComponent } from './data-interface-descent.component';
>>>>>>> develop

describe('DataInterfaceDescentComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfaceDescentComponent>(configuration);
    testService.setup(DGTDataInterfaceDescentComponent);

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });
});
