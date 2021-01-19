import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../../test.configuration';
import { mockResourceName } from '../../../../test.mock-data';
import { DGTDataFieldComponent } from './dgt-data-field.component';

describe('DGTDataFieldComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataFieldComponent>(configuration);
    testService.setup(DGTDataFieldComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        // testService.component.field = {
        //   description: 'Full name',
        //   fields: [
        //     'http://www.w3.org/2006/vcard/ns#fn',
        //     'http://xmlns.com/foaf/0.1/name'
        // ],
        // } as DGTCategoryField;
        testService.component.resource = mockResourceName;
        testService.fixture.detectChanges();
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onResourceUpdated function', () => {

        const keypressA = new KeyboardEvent('test', {key: 'A'});
        const keypressEnter = new KeyboardEvent('test', {key: 'Enter'});

        it('should emit resourceUpdated when on keypress', () => {
            spyOn(testService.component.resourceUpdated, 'emit');
            testService.component.onResourceUpdated(mockResourceName, 'test-name', keypressA);
            expect(testService.component.resourceUpdated.emit).toHaveBeenCalledWith({resource: mockResourceName, newObject: 'test-name'});
        });
        it('should emit submit when keypress is enter', () => {
            spyOn(testService.component.submit, 'emit');
            testService.component.onResourceUpdated(mockResourceName, 'test-name', keypressEnter);
            expect(testService.component.submit.emit).toHaveBeenCalled();
        });
        it('should throw DGTErrorArgument when value is null', () => {
            expect(() => { testService.component.onResourceUpdated(null, 'test', keypressA) }).toThrowError(DGTErrorArgument);
        });
        it('should throw DGTErrorArgument when newObject is null', () => {
            expect(() => { testService.component.onResourceUpdated(mockResourceName, null, keypressA) }).toThrowError(DGTErrorArgument);
        });
    });

    describe('html view', () => {;

        describe('input field', () => {

            it('should contain correct value', () => {
                expect(testService.component.formGroup.get('desc').value).toEqual(mockResourceName.triples[0].object.value);
            });
        })
    });
});
