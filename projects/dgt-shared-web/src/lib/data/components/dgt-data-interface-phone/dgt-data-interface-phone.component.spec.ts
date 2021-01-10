import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../../test.configuration';
import { mockCategoryPhone, mockReferencePhone, mockTypeWork, mockValuePhone } from '../../../../test.mock-data';
import { DGTDataInterfacePhoneComponent } from './dgt-data-interface-phone.component';

describe('DataInterfaceEmailComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfacePhoneComponent>(configuration);
    testService.setup(DGTDataInterfacePhoneComponent, false);
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

    describe('onResourceUpdated function', () => {
        it('should emit resourceUpdated with correct val', () => {
            spyOn(testService.component.resourceUpdated, 'emit');
            testService.component.onResourceUpdated({value: mockValuePhone, newObject: 'test'});
            expect(testService.component.resourceUpdated.emit).toHaveBeenCalled();
        });
        it('should throw DGTErrorArgument if val is null', () => {
            expect(() => { testService.component.onResourceUpdated(null) }).toThrowError(DGTErrorArgument);
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
