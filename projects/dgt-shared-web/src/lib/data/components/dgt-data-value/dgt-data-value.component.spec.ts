import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../../test.configuration';
import { mockResourceName, mockResourceRole } from '../../../../test.mock-data';
import { DGTLDResourceComponent } from './dgt-data-value.component';

describe('DGTBrowserDataResourceComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTLDResourceComponent>(configuration);
    testService.setup(DGTLDResourceComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        testService.component.resource = mockResourceName;
        testService.fixture.detectChanges();
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onResourceUpdated function', () => {
        it('should throw DGTErrorArgument when resource is null', () => {
            expect(() => testService.component.onResourceUpdated(null, 'test')).toThrowError(DGTErrorArgument);
        });
        it('should throw DGTErrorArgument when newObject is null', () => {
            expect(() => testService.component.onResourceUpdated(mockResourceName, null)).toThrowError(
                DGTErrorArgument,
            );
        });

        it('should emit resourceUpdated when called', () => {
            spyOn(testService.component.resourceUpdated, 'emit');
            testService.component.onResourceUpdated(mockResourceName, 'test');
            expect(testService.component.resourceUpdated.emit).toHaveBeenCalled();
        });
    });

    describe('updateReceived function', () => {
        it('should update formGroup with new resources', () => {
            testService.component.updateReceived(mockResourceRole);
            const subject = testService.component.formGroup.get('subject');
            const object = testService.component.formGroup.get('object');
            expect(subject).toBeTruthy();
            expect(subject.value).toEqual(mockResourceRole.triples[0].subject.value);
            expect(object).toBeTruthy();
            expect(object.value).toEqual(mockResourceRole.triples[0].object.value);
        });
    });

    describe('html view', () => {
        describe('section title', () => {
            it('should contain predicate name', () => {
                const title: HTMLElement = hostElement.querySelector('dgt-section-title');
                expect(title.innerHTML).toContain(mockResourceName.triples[0].predicate);
            });
        });

        xdescribe('section subtitle', () => {
            it('should contain predicate', () => {
                const subtitle: HTMLElement = hostElement.querySelector('dgt-section-subtitle');
                const predicate = mockResourceName.triples[0].predicate;
                expect(subtitle.innerHTML).toContain(predicate);
            });
        });

        describe('form', () => {
            let form: HTMLElement;

            beforeEach(() => {
                form = hostElement.querySelector('dgt-form-control');
            });

            it('should contain correct subject resource', () => {
                expect(testService.component.formGroup.get('subject').value).toContain(mockResourceName.triples[0].subject.value);
            });

            it('should contain correct object resource', () => {
                expect(testService.component.formGroup.get('object').value).toContain(mockResourceName.triples[0].object.value);
            });
        });
    });
});
