import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../../test.configuration';
import { mockCategoryEmail, mockReferenceEmail, mockTypeWork, mockResourceEmail } from '../../../../test.mock-data';
import { DGTDataInterfaceEmailComponent } from './dgt-data-interface-email.component';

describe('DataInterfaceEmailComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfaceEmailComponent>(configuration);
    testService.setup(DGTDataInterfaceEmailComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        testService.component.category = mockCategoryEmail;
        testService.component.resources = [mockResourceEmail, mockReferenceEmail, mockTypeWork];
        testService.fixture.detectChanges();
        hostElement = testService.fixture.nativeElement;
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onResourceUpdated function', () => {
        it('should emit resourceUpdated with correct val', () => {
            spyOn(testService.component.resourceUpdated, 'emit');
            testService.component.onResourceUpdated({resource: mockResourceEmail, newObject: 'test'});
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
        it('should contain interface-email-values', () => {
            const emailValues = hostElement.querySelectorAll('dgt-data-interface-email-value');
            expect(emailValues.length).toBeGreaterThan(0);
        });
    });
});
