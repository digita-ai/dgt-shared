// import { async } from '@angular/core/testing';
// import { DGTEvent } from '@digita-ai/dgt-shared-data';
// import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
// import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
// import { DGTDateToLabelService } from '../../../date/services/dgt-date-to-label.service';
// import { DGTTimelineEventGroupComponent } from './timeline-event-group.component';

// describe('DGTBrowserTimelineEventGroupComponent', () => {

//   // copy mock variables into local variables
//   const eventListToday = [...mock.eventListToday] as DGTEvent[];
//   const eventJustNow = [{ ...mock.eventJustNow }] as DGTEvent[];

//   const testService = new DGTTestRunnerComponent<DGTTimelineEventGroupComponent>(configuration);
//   testService.setup(DGTTimelineEventGroupComponent);
//   const dateToLabelService = new DGTDateToLabelService(null);

//   beforeEach(() => {
//     testService.component.events = [...eventListToday];
//     testService.component.sources = [
//       mock.mockSource3,
//     ];
//     testService.component.date = mock.dateJustNow;
//     testService.fixture.detectChanges();
//   });

//   it('should create', async(() => {
//     expect(testService.component).toBeTruthy();
//   }));

//   it('should contain event summary components', async(() => {
//     const hostElement: HTMLElement = testService.fixture.nativeElement;
//     const events = testService.component.events;
//     const eventSummaries = hostElement.querySelectorAll('dgt-timeline-event-summary');
//     expect(events.length).toEqual(eventSummaries.length);
//   }));

//   it('should display events ordered by date', async(() => {
//     const hostElement: HTMLElement = testService.fixture.nativeElement;
//     const events = testService.component.events;
//     const eventSummaries = hostElement.querySelectorAll('dgt-timeline-event-summary');
//     expect(events).toBeTruthy();
//     if (events) {
//       for (let i = 0; i < events.length; i++) {
//         if (i > 0) {
//           expect(events[i - 1].date.getTime()).toBeGreaterThan(events[i].date.getTime());
//         }
//         // expect(eventSummaries[i].querySelectorAll('dgt-section-subtitle')[0].innerHTML)
//         //   .toContain(dateToLabelService.dateToTimeAgoString(events[i].date));
//       }
//     }
//   }));

//   it('should emit feedbackEvent when onFeedbackEvent() is called', async(() => {
//     spyOn(testService.component.eventFeedback, 'emit');
//     testService.component.onEventFeedback(eventJustNow);
//     expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(eventJustNow);
//   }));

//   it('should emit removeEvent when onRemoveEvent() is called', async(() => {
//     spyOn(testService.component.eventFeedback, 'emit');
//     testService.component.onEventFeedback(eventJustNow);
//     expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(eventJustNow);
//   }));

//   it('should contain date header', async(() => {
//     const hostElement: HTMLElement = testService.fixture.nativeElement;
//     const title = hostElement.querySelector('dgt-page-content-group-header');
//     expect(title).toBeTruthy();
//   }));

//   describe('groupEvents', () => {
//     it('should throw error when events is null', async(() => {
//       expect(() => {
//         testService.component.groupEvents(null);
//       }).toThrowError(DGTErrorArgument);
//     }));

//     it('should group list of events', async(() => {
//       const baseEvent: DGTEvent = {
//         description: 'description 1',
//         stakeholder: 'stakeholder 1',
//         icon: null,
//         stakeholderUri: 'https://hello.world/',
//         triples: [],
//         uri: null,
//         exchange: '1',
//         date: new Date(Date.now()),
//       };

//       const events: DGTEvent[] = [
//         { ...baseEvent },
//         { ...baseEvent },
//         { ...baseEvent, stakeholder: 'stakeholder 2' },
//         { ...baseEvent, exchange: '2' },
//       ];

//       const expectedResult: DGTEvent[][] = [
//         [
//           { ...baseEvent },
//           { ...baseEvent },
//         ],
//         [
//           { ...baseEvent, stakeholder: 'stakeholder 2' },
//         ],
//         [
//           { ...baseEvent, exchange: '2' },
//         ],
//       ];

//       const groupedEvents = testService.component.groupEvents(events);

//       expect(groupedEvents).toEqual(expectedResult);
//     }));
//   });

// });
