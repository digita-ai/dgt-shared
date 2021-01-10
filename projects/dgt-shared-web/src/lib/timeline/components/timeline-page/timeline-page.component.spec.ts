// import { async } from '@angular/core/testing';
// import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
// import { configuration } from 'test.configuration';
// import { eventJustNow, mockEvents } from 'test.events.mock-data';
// import { FeedbackEvent, RemoveEvent } from '../../timeline.actions';
// import { TimelinePageComponent } from './timeline-page.component';

// describe('TimelineRootComponent', () => {
//     const testService = new DGTTestRunnerComponent<TimelinePageComponent> (configuration);
//     testService.setup(TimelinePageComponent, false);

//     beforeEach(async(() => {
//         testService.component.events = [ ...mockEvents ];
//     }));

//     it('should create', async(() => {
//         expect(testService.component).toBeTruthy();
//     }));

//     it('should dispatch RemoveEvent action when onRemoveEvent is called', async(() => {
//         spyOn(testService.component.store, 'dispatch');
//         testService.fixture.detectChanges();
//         testService.component.onEventRemoved([eventJustNow]);
//         expect(testService.component.store.dispatch).toHaveBeenCalledWith(jasmine.any(RemoveEvent));

//     }));

//     it('should dispatch FeedbackEvent action when onFeedbackEvent is called', async(() => {
//         spyOn(testService.component.store, 'dispatch');
//         testService.fixture.detectChanges();
//         testService.component.onEventFeedback([eventJustNow]);
//         expect(testService.component.store.dispatch).toHaveBeenCalledWith(jasmine.any(FeedbackEvent));

//     }));

//     it('should add dgt-page-content-header component to the dom', async(() => {
//         testService.fixture.detectChanges();
//         const hostElement: HTMLElement = testService.fixture.nativeElement;
//         testService.fixture.detectChanges();
//         expect(hostElement.querySelector('dgt-page-content-header')).toBeTruthy();
//     }));

//     // disabled as no events are retrieved from state in tests
//     // it('should add dgt-timeline-event-group components to the dom', async(() => {
//     //     testService.fixture.detectChanges();
//     //     const hostElement: HTMLElement = testService.fixture.nativeElement;
//     //     testService.fixture.detectChanges();
//     //     expect(hostElement.querySelector('dgt-timeline-event-group')).toBeTruthy();
//     // }));
// });
