import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataFieldComponent } from './data-field.component';
import { configuration } from 'test.configuration';
import { mockValueName } from 'test.data.mock-data';
import { DGTCategoryField } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';

describe('DGTBrowserDataFieldComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataFieldComponent>(configuration);
    testService.setup(DGTBrowserDataFieldComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        testService.component.field = {
          description: 'Full name',
          fields: [
            'http://www.w3.org/2006/vcard/ns#fn',
            'http://xmlns.com/foaf/0.1/name'
        ],
        } as DGTCategoryField;
        testService.component.value = [mockValueName];
        testService.fixture.detectChanges();
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onValueUpdated function', () => {

        const keypressA = new KeyboardEvent('test', {key: 'A'});
        const keypressEnter = new KeyboardEvent('test', {key: 'Enter'});

        it('should emit valueUpdated when on keypress', () => {
            spyOn(testService.component.valueUpdated, 'emit');
            testService.component.onValueUpdated(mockValueName, 'test-name', keypressA);
            expect(testService.component.valueUpdated.emit).toHaveBeenCalledWith({value: mockValueName, newObject: 'test-name'});
        });
        it('should emit submit when keypress is enter', () => {
            spyOn(testService.component.submit, 'emit');
            testService.component.onValueUpdated(mockValueName, 'test-name', keypressEnter);
            expect(testService.component.submit.emit).toHaveBeenCalled();
        });
        it('should throw DGTErrorArgument when value is null', () => {
            expect(() => { testService.component.onValueUpdated(null, 'test', keypressA) }).toThrowError(DGTErrorArgument);
        });
        it('should throw DGTErrorArgument when newObject is null', () => {
            expect(() => { testService.component.onValueUpdated(mockValueName, null, keypressA) }).toThrowError(DGTErrorArgument);
        });
    });

    describe('html view', () => {;

        describe('input field', () => {

            it('should contain correct value', () => {
                expect(testService.component.formGroup.get('desc').value).toEqual(mockValueName.object.value);
            });
        })
    });
});
