import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataInterfacePhoneComponent } from './data-interface-phone.component';
import { mockCategoryPhone, mockValuePhone, mockReferencePhone, mockTypeWork } from 'test.data.mock-data';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';

describe('DataInterfaceEmailComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataInterfacePhoneComponent>(configuration);
    testService.setup(DGTBrowserDataInterfacePhoneComponent, false);
    let hostElement: HTMLElement;

    beforeEach(() => {
        testService.component.category = mockCategoryPhone;
        testService.component.values = [mockValuePhone, mockReferencePhone, mockTypeWork];
        testService.fixture.detectChanges();
        hostElement = testService.fixture.nativeElement;
    })

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onValueUpdated function', () => {
        it('should emit valueUpdated with correct val', () => {
            spyOn(testService.component.valueUpdated, 'emit');
            testService.component.onValueUpdated({value: mockValuePhone, newObject: 'test'});
            expect(testService.component.valueUpdated.emit).toHaveBeenCalled();
        });
        it('should throw DGTErrorArgument if val is null', () => {
            expect(() => { testService.component.onValueUpdated(null) }).toThrowError(DGTErrorArgument);
        });
    });

    describe('onSubmit function', () => {
        it('should emit submit', () => {
            spyOn(testService.component.submit, 'emit');
            testService.component.onSubmit();
            expect(testService.component.submit.emit).toHaveBeenCalled();
        });
    });

    describe('html view', () => {
        it('should contain interface-phone-values', () => {
            const phoneValues = hostElement.querySelectorAll('dgt-data-interface-phone-value');
            expect(phoneValues.length).toBeGreaterThan(0);
        });
    });
});
