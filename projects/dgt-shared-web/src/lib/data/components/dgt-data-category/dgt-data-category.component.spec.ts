import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { mockCategoryName, mockResourceName, mockResourceRole } from '../../../../test.mock-data';
import { DGTDataCategoryComponent } from './dgt-data-category.component';

describe('DGTBrowserDataCategoryComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataCategoryComponent>(configuration);
    testService.setup(DGTDataCategoryComponent, false);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        testService.component.resources = [mockResourceName];
        testService.component.category = mockCategoryName;
        testService.fixture.detectChanges();
    });

    // xdescribe('viewCategoryPage function', () => {
    //     it('should dispatch Navigate', () => {
    //         spyOn(testService.component.store, 'dispatch');
    //         testService.component.viewCategoryPage(mockCategoryName);
    //         expect(testService.component.store.dispatch).toHaveBeenCalledWith(new Navigate( { path: [`/data/category/${mockCategoryName.title}`] } ));
    //     });
    // });

    describe('onResourceUpdated function', () => {
        it('should throw error when resource is null', () => {
            expect(() => testService.component.onResourceUpdated(null)).toThrow();
        });
        it('should throw error when resource.resource is null', () => {
            expect(() => testService.component.onResourceUpdated({ resource: null, newObject: 'test' })).toThrow();
        });
        it('should throw error when resource.newObject is null', () => {
            expect(() =>
                testService.component.onResourceUpdated({ resource: mockResourceName, newObject: null }),
            ).toThrow();
        });
        it('should add resource to resourcesToUpdate Map', () => {
            const originalLength = testService.component.resourcesToUpdate.size;
            const newResource = { resource: mockResourceRole, newObject: 'test-role' };
            testService.component.onResourceUpdated(newResource);
            expect(testService.component.resourcesToUpdate.size).toBeGreaterThan(originalLength);
            expect(testService.component.resourcesToUpdate.get(newResource.resource.uri)).toBeTruthy();
        });
    });

    describe('updateResources function', () => {
        it('should emit resourcesUpdated', () => {
            spyOn(testService.component.resourceUpdated, 'emit');
            const entity = { resource: mockResourceName, newObject: 'test-obj' };
            const map = new Map().set('test', entity);
            testService.component.updateResources(map);
            expect(testService.component.resourceUpdated.emit).toHaveBeenCalledWith(entity);
        });
    });

    describe('html view', () => {
        it('should contain category icon', () => {
            const icon: HTMLElement = hostElement.querySelector('dgt-section-icon');
            expect(icon).toBeTruthy();
        });

        it('should contain category description', () => {
            const title: HTMLElement = hostElement.querySelector('dgt-section-title');
            expect(title.innerHTML).toContain(mockCategoryName.title);
        });
        describe('update button', () => {
            it('should not display when resourcesToUpdate is empty', () => {
                testService.component.resourcesToUpdate.clear();
                testService.fixture.detectChanges();
                const button: HTMLButtonElement = hostElement.querySelector('dgt-section-content dgt-button button');
                expect(button).toBeFalsy();
            });
            it('should display when resourcesToUpdate has resources', () => {
                testService.component.resourcesToUpdate.set(mockResourceName.uri, {
                    resource: mockResourceName,
                    newObject: 'test-name-two',
                });
                testService.fixture.detectChanges();
                const button: HTMLButtonElement = hostElement.querySelector('dgt-section-content dgt-button button');
                expect(button).toBeTruthy();
            });
            it('should call updateResources on click', () => {
                testService.component.resourcesToUpdate.set(mockResourceName.uri, {
                    resource: mockResourceName,
                    newObject: 'test-name-two',
                });
                testService.fixture.detectChanges();
                spyOn(testService.component, 'updateResources');
                const button: HTMLButtonElement = hostElement.querySelector('dgt-section-content dgt-button button');
                button.click();
                expect(testService.component.updateResources).toHaveBeenCalledWith(
                    testService.component.resourcesToUpdate,
                );
            });
        });
        // describe('action button info', () => {
        //     it('should call viewCategoryPage when clicked', () => {
        //         spyOn(testService.component, 'viewCategoryPage');
        //         const button: HTMLButtonElement = hostElement.querySelector('dgt-section-action button');
        //         button.click();
        //         expect(testService.component.viewCategoryPage).toHaveBeenCalledWith(mockCategoryName);
        //     });
        // });
        describe('action button more', () => {
            // TBD
        });
    });
});
