import { async } from '@angular/core/testing';
import { DGTTestRunnerComponent } from '@digita/dgt-shared-test';
import { DGTFormDateComponent } from './dgt-form-date.component';
import moment from 'moment';
import { configuration } from 'projects/dgt-shared-web/src/test.configuration';

describe('DGTFormDateComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTFormDateComponent>(configuration);
    testService.setup(DGTFormDateComponent);

    it('should create', async(() => {
        expect(testService.component).toBeTruthy();
    }));

    it('should set date to null by default', async(() => {
        expect(testService.component.value).toBeNull();
    }));

    it('should set date to null when only day field is filled', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;

        const inputElement: HTMLInputElement = hostElement.querySelector('input#day');
        inputElement.value = '1';
        inputElement.dispatchEvent(new Event('input'));

        testService.fixture.detectChanges();

        expect(testService.component.value).toBeNull();
    }));

    it('should set date when all fields are filled', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;

        const dayInputElement: HTMLInputElement = hostElement.querySelector('input#day');
        dayInputElement.value = '1';
        dayInputElement.dispatchEvent(new Event('input'));

        const monthInputElement: HTMLInputElement = hostElement.querySelector('input#month');
        monthInputElement.value = '1';
        monthInputElement.dispatchEvent(new Event('input'));

        const yearInputElement: HTMLInputElement = hostElement.querySelector('input#year');
        yearInputElement.value = '2019';
        yearInputElement.dispatchEvent(new Event('input'));

        testService.fixture.detectChanges();

        expect(moment(testService.component.value).isSame(new Date(Date.UTC(2019, 0, 1)))).toBeTruthy();
    }));

    it('should set date to null when invalid date is provided', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;

        const dayInputElement: HTMLInputElement = hostElement.querySelector('input#day');
        dayInputElement.value = '1';
        dayInputElement.dispatchEvent(new Event('input'));

        const monthInputElement: HTMLInputElement = hostElement.querySelector('input#month');
        monthInputElement.value = '20';
        monthInputElement.dispatchEvent(new Event('input'));

        const yearInputElement: HTMLInputElement = hostElement.querySelector('input#year');
        yearInputElement.value = '2019';
        yearInputElement.dispatchEvent(new Event('input'));

        testService.fixture.detectChanges();

        expect(testService.component.value).toBeNull();
    }));

    it('should set date to null when invalid date is provided after a valid date', async(() => {
        const hostElement: HTMLElement = testService.fixture.nativeElement;

        const dayInputElement: HTMLInputElement = hostElement.querySelector('input#day');
        dayInputElement.value = '1';
        dayInputElement.dispatchEvent(new Event('input'));

        const monthInputElement: HTMLInputElement = hostElement.querySelector('input#month');
        monthInputElement.value = '1';
        monthInputElement.dispatchEvent(new Event('input'));

        const yearInputElement: HTMLInputElement = hostElement.querySelector('input#year');
        yearInputElement.value = '2019';
        yearInputElement.dispatchEvent(new Event('input'));

        testService.fixture.detectChanges();

        monthInputElement.value = '20';
        monthInputElement.dispatchEvent(new Event('input'));

        testService.fixture.detectChanges();

        expect(testService.component.value).toBeNull();
    }));
});
