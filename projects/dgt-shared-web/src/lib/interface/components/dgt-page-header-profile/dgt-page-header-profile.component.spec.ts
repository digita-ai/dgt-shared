import { async } from '@angular/core/testing';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { DGTPageHeaderProfileComponent } from './dgt-page-header-profile.component';

describe('DGTPageHeaderProfile', () => {
    const testService = new DGTTestRunnerComponent<DGTPageHeaderProfileComponent>(configuration);
    testService.setup(DGTPageHeaderProfileComponent);

    it('should create', async(() => {
        expect(testService.component).toBeTruthy();
    }));

    it('should show login link when not logged in', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;
        const element: HTMLElement = hostElement.querySelector('.profile-anonymous');
        expect(element).toBeTruthy();
    }));

    // it('should show profile link when logged in as individual', async(() => {
    //     testService.component.profile = {
    //         id: '3',
    //         email: 'mymove-ut-individual1@digita.ai',
    //         emailValidated: true,
    //         phone: '000000000',
    //         references: null,
    //         locale: null,
    //         createdAt: new Date(),
    //         updatedAt: new Date()
    //     } as DGTUser;

    //     testService.fixture.detectChanges();

    //     const hostElement: HTMLElement = testService.fixture.nativeElement;
    //     const element: HTMLElement = hostElement.querySelector('.profile-individual');
    //     expect(element).toBeTruthy();
    // }));
});
