import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../../test.configuration';
import { mockCategoryName, mockGroupIdentiy, mockResourceName, mockResources } from '../../../../test.mock-data';
import { DGTDataGroupComponent } from './dgt-data-group.component';

describe('DGTBrowserDataGroupComponent', () => {

  const testService = new DGTTestRunnerComponent<DGTDataGroupComponent>(configuration);
  testService.setup(DGTDataGroupComponent, false);
  let hostElement: HTMLElement;

  beforeEach(() => {
    hostElement = testService.fixture.nativeElement;
    testService.component.resources = [mockResources[0]];
    testService.component.categories = [mockCategoryName];
    testService.component.group = mockGroupIdentiy;
    testService.fixture.detectChanges();
  });

  describe('function: onResourceUpdated', () => {
    it('should emit resourceUpdated when parameters are valid', () => {
      spyOn(testService.component.resourceUpdated, 'emit');
      testService.component.onResourceUpdated({
        resource: mockResourceName,
        newObject: mockResourceName.triples[0].object.value,
      });
      expect(testService.component.resourceUpdated.emit).toHaveBeenCalled();
    });
    it('should throw error when val is null', () => {
      expect(() =>
        testService.component.onResourceUpdated(null),
      ).toThrow();
    });
  });

  describe('html view', () => {
    it('should render correct group title', () => {
      const title: HTMLElement = hostElement.querySelector('dgt-page-content-group-header');
      expect(title.innerHTML).toEqual(`common.data.groups.${mockGroupIdentiy.id}`);
    })

    it('should contain dgt-data-category elements', () => {
      const categories = hostElement.querySelectorAll('dgt-data-category');
      expect(categories.length).toBeGreaterThan(0);
    })

    it('should only render dgt-data-category for which values exist', () => {
      const categories = hostElement.querySelectorAll('dgt-data-category');
      expect(categories.length).toEqual(testService.component.categories.length);
    })
  });

});
