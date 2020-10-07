import { async } from '@angular/core/testing';
import { configuration } from '../../../../../test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTActivitiesComponent } from './dgt-activities.component';
import { DGTActivityType, DGTActivityVisibility } from '@digita-ai/dgt-shared-data';

describe('DGTActivitiesComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTActivitiesComponent>(configuration);
    testService.setup(DGTActivitiesComponent);

    it('should create', async(() => {
        expect(testService.component).toBeTruthy();
    }));

    it('should contain a table of activities', async(() => {
        testService.component.activities = [
            {
                type: DGTActivityType.UPDATED,
                visibility: DGTActivityVisibility.SHARED,
                difference: null,
                responsible: null,
                description: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        testService.fixture.detectChanges();

        const hostElement = testService.fixture.nativeElement;
        const tableElement: HTMLInputElement = hostElement.querySelector('mat-table');

        expect(tableElement).toBeTruthy();
    }));

    it('should show create comment form when allowComments is set', async(() => {
        testService.component.allowComments = true;
        testService.fixture.detectChanges();

        const hostElement = testService.fixture.nativeElement;
        const buttonElement: HTMLInputElement = hostElement.querySelector('dgt-button');

        expect(buttonElement).toBeTruthy();
    }));

    it('should not show create comment form when allowComments is not set', async(() => {
        testService.component.allowComments = false;
        testService.fixture.detectChanges();

        const hostElement = testService.fixture.nativeElement;
        const buttonElement: HTMLInputElement = hostElement.querySelector('dgt-button');

        expect(buttonElement).toBeFalsy();
    }));
});
