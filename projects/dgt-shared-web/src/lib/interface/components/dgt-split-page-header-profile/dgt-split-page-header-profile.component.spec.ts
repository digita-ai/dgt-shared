import { async } from '@angular/core/testing';
import { DGTIndividual, DGTProfileType, DGTPartner } from '@digita/dgt-shared-venture';
import { DGTSplitPageHeaderProfileComponent } from './dgt-split-page-header-profile.component';
import { configuration } from '../../../../../test.configuration';
import { DGTTestRunnerComponent } from '@digita/dgt-shared-test';

describe('DGTSplitPageHeaderProfile', () => {
    const testService = new DGTTestRunnerComponent<DGTSplitPageHeaderProfileComponent>(configuration);
    testService.setup(DGTSplitPageHeaderProfileComponent);

    it('should create', async(() => {
        expect(testService.component).toBeTruthy();
    }));

    it('should show login link when not logged in', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;
        const element: HTMLElement = hostElement.querySelector('.profile-anonymous');
        expect(element).toBeTruthy();
    }));

    it('should show profile link when logged in as individual', async(() => {
        testService.component.profile = {
            id: '3',
            user: '3',
            email: 'mymove-ut-individual1@digita.ai',
            emailValidated: true,
            phone: '000000000',
            type: DGTProfileType.INDIVIDUAL,
            references: null,
            locale: null,
            milestone: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            hasSentInvites: false
        } as DGTIndividual;

        testService.fixture.detectChanges();

        const hostElement: HTMLElement = testService.fixture.nativeElement;
        const element: HTMLElement = hostElement.querySelector('.profile-individual');
        expect(element).toBeTruthy();
    }));

    it('should show profile link when logged in as admin', async(() => {
        testService.component.profile = {
            id: '3',
            user: '3',
            email: 'mymove-ut-individual1@digita.ai',
            emailValidated: true,
            phone: '000000000',
            type: DGTProfileType.ADMIN,
            references: null,
            locale: null,
            milestone: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            hasSentInvites: false
        } as DGTIndividual;

        testService.fixture.detectChanges();

        const hostElement: HTMLElement = testService.fixture.nativeElement;
        const element: HTMLElement = hostElement.querySelector('.profile-individual');
        expect(element).toBeTruthy();
    }));

    it('should show profile link when logged in as company', async(() => {
        testService.component.profile = {
            id: '1',
            name: 'Test Partner 1',
            address: 'Adres van test partner 1',
            email: 'mymove-ut-partner1@digita.ai',
            phone: '00000000000',
            emailValidated: false,
            logo: null,
            user: '1',
            type: DGTProfileType.PARTNER,
            locale: {
                country: 'BE',
                language: 'nl'
            },
            references: null,
            hasSentInvites: false
        } as DGTPartner;

        testService.fixture.detectChanges();

        const hostElement: HTMLElement = testService.fixture.nativeElement;
        const element: HTMLElement = hostElement.querySelector('.profile-company');
        expect(element).toBeTruthy();
    }));
});
