// import { DGTBrowserTimelineEventMenuComponent } from './timeline-event-menu.component';
// import { async } from '@angular/core/testing';
// import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
// import { configuration } from '../../../../test.configuration';
// import { eventJustNow } from 'test.events.mock-data';

// describe('DGTBrowserTimelineEventMenuComponent', () => {
//     let hostElement: HTMLElement;
//     const testService =
//       new DGTTestRunnerComponent<DGTBrowserTimelineEventMenuComponent>(configuration);
//     testService.setup(DGTBrowserTimelineEventMenuComponent);

//     const events = [{...eventJustNow}];

//     beforeEach( () => {
//         testService.component.events = events;
//         hostElement = testService.fixture.nativeElement;
//         testService.fixture.detectChanges();
//     });

//     it('should create', async(() => {
//         expect(testService.component).toBeTruthy();
//     }));

//     describe('eventFeedback Emitter Tests', () => {
//         it('should emit eventFeedback when onEventFeedback() is called', async(() => {
//             spyOn(testService.component.eventFeedback, 'emit');
//             testService.component.onEventFeedback(events);
//             expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(events);
//         }));
//     });

//     describe('eventRemoved Emitter Tests', () => {
//         it('should emit eventRemoved when onEventRemoved() is called', async(() => {
//             spyOn(testService.component.eventRemoved, 'emit');
//             testService.component.onEventRemoved(events);
//             expect(testService.component.eventRemoved.emit).toHaveBeenCalledWith(events);
//         }));
//     });
// });
