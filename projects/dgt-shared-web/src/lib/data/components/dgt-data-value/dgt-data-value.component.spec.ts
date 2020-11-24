import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataValueComponent } from './data-value.component';
import { mockValueName, mockValueRole } from 'test.data.mock-data';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';

describe('DGTBrowserDataValueComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataValueComponent>(configuration);
    testService.setup(DGTBrowserDataValueComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        testService.component.value = mockValueName;
        testService.fixture.detectChanges();
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onValueUpdated function', () => {
        it('should throw DGTErrorArgument when value is null', () => {
            expect( () =>
                testService.component.onValueUpdated(null, 'test')
            ).toThrowError(DGTErrorArgument);
        });
        it('should throw DGTErrorArgument when newObject is null', () => {
            expect( () =>
                testService.component.onValueUpdated(mockValueName, null)
            ).toThrowError(DGTErrorArgument);
        });

        it('should emit valueUpdated when called', () => {
            spyOn(testService.component.valueUpdated, 'emit');
            testService.component.onValueUpdated(mockValueName, mockValueName.object.value);
            expect(testService.component.valueUpdated.emit).toHaveBeenCalled();
        });
    });

    describe('updateReceived function', () => {
        it('should update formGroup with new values', () => {
            testService.component.updateReceived(mockValueRole);
            const subject = testService.component.formGroup.get('subject');
            const object = testService.component.formGroup.get('object');
            expect(subject).toBeTruthy();
            expect(subject.value).toEqual(mockValueRole.subject.value);
            expect(object).toBeTruthy();
            expect(object.value).toEqual(mockValueRole.triples[0].object.value);
        });
    });

    describe('html view', () => {

        describe('section title', () => {
            it('should contain predicate name', () => {
                const title: HTMLElement = hostElement.querySelector('dgt-section-title');
                expect(title.innerHTML).toContain(mockValueName.triples[0].predicate.name);
            });
        });

        describe('section subtitle', () => {
            it('should contain predicate', () => {
                const subtitle: HTMLElement = hostElement.querySelector('dgt-section-subtitle');
                const predicate = mockValueName.triples[0].predicate;
                expect(subtitle.innerHTML).toContain(predicate);
            });
        });

        describe('form', () => {

            let form: HTMLElement;

            beforeEach(() => {
                form = hostElement.querySelector('dgt-form-control');
            });

            it('should contain correct subject value', () => {
                expect(testService.component.formGroup.get('subject').value)
                .toContain(mockValueName.subject.value);
            });

            it('should contain correct object value', () => {
                expect(testService.component.formGroup.get('object').value)
                .toContain(mockValueName.object.value);
            });
        });
    });
});
